"""Render curated CC0 Kenney GLB meshes into deterministic 2:1 SVG sprites.
Run with Python + numpy + Pillow after fetching only the selected LFS models.
No 3D engine or model downloads are needed to play the generated game.
"""
from pathlib import Path
import io, json, math, struct
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
INDUSTRIAL = ROOT/'public/assets/sourced/kenney-city-kit-industrial/Models/GLB format'
NATURE = ROOT/'public/assets/sourced/kenney-nature-kit/Models/GLTF format'
OUT = ROOT/'public/assets/low-poly'
CAMERA = np.array([math.sqrt(3/8), .5, math.sqrt(3/8)])
LIGHT = np.array([-4.,8.,-1.]); LIGHT /= np.linalg.norm(LIGHT)
DTYPES = {5120:'i1',5121:'u1',5122:'<i2',5123:'<u2',5125:'<u4',5126:'<f4'}
SIZES = {'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}


def load_mesh(path):
    data = path.read_bytes()
    if data[:4] != b'glTF': raise ValueError(f'Fetch this LFS model first: {path}')
    n = struct.unpack_from('<I',data,12)[0]
    doc = json.loads(data[20:20+n]); binary = data[28+n:]
    def accessor(index):
        acc = doc['accessors'][index]; view = doc['bufferViews'][acc['bufferView']]
        dtype = np.dtype(DTYPES[acc['componentType']]); columns = SIZES[acc['type']]
        offset = view.get('byteOffset',0)+acc.get('byteOffset',0)
        stride = view.get('byteStride',dtype.itemsize*columns)
        return np.ndarray((acc['count'],columns),dtype=dtype,buffer=binary,offset=offset,strides=(stride,dtype.itemsize)).copy()
    images = []
    for image in doc.get('images',[]):
        if 'uri' in image: images.append(Image.open(path.parent/image['uri']).convert('RGB'))
        else:
            view = doc['bufferViews'][image['bufferView']]
            start = view.get('byteOffset',0)
            images.append(Image.open(io.BytesIO(binary[start:start+view['byteLength']])).convert('RGB'))
    triangles = []
    def walk(index,parent):
        node = doc['nodes'][index]
        if 'matrix' in node: local = np.array(node['matrix']).reshape(4,4).T
        else:
            x,y,z,w = node.get('rotation',[0,0,0,1])
            local = np.eye(4); local[:3,:3] = np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]]) @ np.diag(node.get('scale',[1,1,1]))
            local[:3,3] = node.get('translation',[0,0,0])
        matrix = parent @ local
        if 'mesh' in node:
            for primitive in doc['meshes'][node['mesh']]['primitives']:
                if primitive.get('mode',4) != 4: raise ValueError('Only triangle meshes are supported')
                attrs = primitive['attributes']; vertices = accessor(attrs['POSITION'])
                vertices = (matrix @ np.c_[vertices,np.ones(len(vertices))].T).T[:,:3]
                indices = accessor(primitive['indices']).reshape(-1,3) if 'indices' in primitive else np.arange(len(vertices)).reshape(-1,3)
                uv = accessor(attrs['TEXCOORD_0']) if 'TEXCOORD_0' in attrs else None
                mat = doc['materials'][primitive.get('material',0)]; pbr = mat.get('pbrMetallicRoughness',{})
                factor = np.array(pbr.get('baseColorFactor',[1,1,1,1])[:3],dtype=float)
                texture = pbr.get('baseColorTexture')
                for ids in indices:
                    colour = factor.copy()
                    if texture is not None and uv is not None:
                        image = images[doc['textures'][texture['index']]['source']]
                        u,v = uv[ids].mean(axis=0)
                        colour *= np.array(image.getpixel((min(image.width-1,max(0,int(u*image.width))),min(image.height-1,max(0,int(v*image.height))))))/255
                    triangles.append((vertices[ids],colour,mat.get('name','')))
        for child in node.get('children',[]): walk(child,matrix)
    for node in doc['scenes'][doc.get('scene',0)]['nodes']: walk(node,np.eye(4))
    return triangles


def render(path, kind, width, height, anchor, variant=0):
    triangles = load_mesh(path)
    if kind in ['pv','building']:
        rotation = np.diag([-1.,1.,-1.])
        triangles = [(v @ rotation,colour,name) for v,colour,name in triangles]
    points = np.concatenate([t[0] for t in triangles]); low = points.min(axis=0); high = points.max(axis=0)
    centre = np.array([(low[0]+high[0])/2,low[1],(low[2]+high[2])/2])
    # Equal length screen basis vectors: ground axes project to exactly 2:1.
    projection = np.array([[50.,0.,-50.],[25.,-math.sqrt(3750),25.]])
    projected = (points-centre) @ projection.T
    scale = min((width-22)/(projected[:,0].max()-projected[:,0].min()),(anchor-10)/max(1,-projected[:,1].min()),(height-anchor-3)/max(1,projected[:,1].max()))
    if kind == 'tree': scale = min(scale,76/((high[1]-low[1])*math.sqrt(3750)))
    # Bright foliage and cream/blue buildings bring both packs into one valley palette.
    def palette(colour,name,normal,vertices):
        if kind in ['tree','shrub']:
            if 'leaf' in name or 'grass' in name: return np.array([[.42,.66,.27],[.30,.56,.35],[.56,.70,.30]][variant%3])
            if 'wood' in name: return np.array([.48,.35,.22])
        if kind == 'building':
            saturation = colour.max()-colour.min()
            if normal[1] > .7 and vertices[:,1].mean() > (high[1]-low[1])*.6 and saturation < .15:
                return np.array([.32,.49,.70])
            if saturation < .16 and colour.mean() > .45: return np.array([.94,.89,.73])
            if saturation < .15 and .06 < colour.mean() < .35 and abs(normal[1]) < .5: return np.array([.27,.48,.62])
        if kind == 'pv' and colour[2] > colour[0]*1.2:
            return np.array([.15,.36,.67] if variant else [.22,.43,.72])
        return colour
    faces = []; shadow = []; cell_planes = {}
    for vertices,colour,name in triangles:
        v = vertices-centre; normal = np.cross(v[1]-v[0],v[2]-v[0]); length = np.linalg.norm(normal)
        if length < 1e-10: continue
        normal /= length
        # Hull projection onto the ground casts a single shadow, without stacked alpha triangles.
        for x,y,z in v: shadow.append([(x+y*.5)*50-(z+y*.125)*50,(x+y*.5+z+y*.125)*25])
        if np.dot(normal,CAMERA) <= 1e-5: continue
        if kind == 'pv' and colour[2] > colour[0]*1.2 and normal[1] > .5:
            plane = (*np.round(normal,3), round(float(normal @ v[0]),3), int(v[:,0].mean()>0))
            cell_planes.setdefault(plane,[]).extend(v)
        colour = palette(colour,name,normal,v)
        lighting = .64 + .34*max(0,float(np.dot(normal,LIGHT))) + .04*max(0,float(normal[0]))
        rgb = np.clip(colour*lighting*255,0,255).astype(int)
        points2d = v @ projection.T*scale + np.array([width/2,anchor])
        faces.append((float(v.mean(axis=0)@CAMERA),'#%02x%02x%02x'%tuple(rgb),points2d))
    def hull(points):
        points = sorted(set(tuple(p) for p in points))
        def cross(a,b,c): return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
        halves = []
        for sequence in [points,points[::-1]]:
            h=[]
            for p in sequence:
                while len(h)>=2 and cross(h[-2],h[-1],p)<=0: h.pop()
                h.append(p)
            halves.extend(h[:-1])
        return np.array(halves)*scale+np.array([width/2,anchor])
    fmt = lambda pts:' '.join(f'{x:.1f},{y:.1f}' for x,y in pts)
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',f'<polygon points="{fmt(hull(shadow))}" fill="#243b30" opacity=".20"/>']
    for _,colour,points2d in sorted(faces,key=lambda f:f[0]):
        # Matching strokes close subpixel cracks between adjacent rasterised triangles.
        svg.append(f'<polygon points="{fmt(points2d)}" fill="{colour}" stroke="{colour}" stroke-width=".35" stroke-linejoin="round"/>')
    # A small authored cell pattern makes blue modules readable as solar rather than blank slabs.
    for vertices in cell_planes.values():
        corners = np.unique(np.round(vertices,4),axis=0)
        if len(corners) != 4: continue
        q = corners @ projection.T*scale + np.array([width/2,anchor])
        centre2 = q.mean(axis=0); q = q[np.argsort(np.arctan2(q[:,1]-centre2[1],q[:,0]-centre2[0]))]
        for axis,divisions in [(0,7 if variant else 6),(1,4)]:
            for i in range(1,divisions):
                t=i/divisions
                a,b = ((q[0]*(1-t)+q[1]*t,q[3]*(1-t)+q[2]*t) if axis==0 else (q[0]*(1-t)+q[3]*t,q[1]*(1-t)+q[2]*t))
                svg.append(f'<path d="M{a[0]:.1f},{a[1]:.1f}L{b[0]:.1f},{b[1]:.1f}" fill="none" stroke="#9ac6df" stroke-width=".65" opacity=".75"/>')
    svg.append('</svg>')
    return ''.join(svg)


def main():
    OUT.mkdir(exist_ok=True)
    configs = [
        ('site_pv_basic',INDUSTRIAL/'solar-panel-landscape-group.glb','pv',200,160,100,0),
        ('site_pv_premium',INDUSTRIAL/'solar-panel-landscape-group.glb','pv',200,160,100,1),
        ('site_office',INDUSTRIAL/'building-p.glb','building',200,170,110,0),
        ('site_workshop',INDUSTRIAL/'building-i.glb','building',200,170,110,0),
        ('site_tree_0',NATURE/'tree_oak.glb','tree',80,110,88,0),
        ('site_tree_1',NATURE/'tree_pineRoundA.glb','tree',80,110,88,1),
        ('site_tree_2',NATURE/'tree_oak.glb','tree',80,110,88,2),
        ('site_shrub',NATURE/'plant_bush.glb','shrub',50,40,32,0),
        ('site_rock',NATURE/'stone_largeA.glb','rock',50,40,32,0),
    ]
    manifest = []
    for key,path,kind,width,height,anchor,variant in configs:
        svg = render(path,kind,width,height,anchor,variant); (OUT/(key+'.svg')).write_text(svg)
        manifest.append({'key':key,'width':width,'height':height,'source':str(path.relative_to(ROOT)),'licence':'CC0','author':'Kenney'})
        print(key,len(svg),'bytes')
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')

if __name__ == '__main__': main()
