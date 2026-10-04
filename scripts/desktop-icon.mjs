import {deflateSync} from 'node:zlib';
import {writeFile} from 'node:fs/promises';

/** Original 64px valley-and-solar application mark, scaled cleanly for Windows. */
export async function writeDesktopIcons(directory) {
  const size=64,pixels=Buffer.alloc(size*size*4);
  function dot(x,y,c){if(x<0||y<0||x>=size||y>=size)return;const i=(y*size+x)*4;pixels[i]=c[0];pixels[i+1]=c[1];pixels[i+2]=c[2];pixels[i+3]=255;}
  function box(x,y,w,h,c){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)dot(i,j,c);}
  function circle(cx,cy,r,c){for(let y=0;y<size;y++)for(let x=0;x<size;x++)if((x-cx)**2+(y-cy)**2<=r*r)dot(x,y,c);}
  function polygon(points,c){for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
      const a=points[i],b=points[j];if(((a[1]>y)!==(b[1]>y))&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
    }if(inside)dot(x,y,c);
  }}
  box(4,0,56,64,[34,64,57]);box(0,4,64,56,[34,64,57]);
  box(6,5,52,53,[126,168,158]);
  circle(45,17,9,[235,198,109]);
  polygon([[6,39],[19,20],[31,33],[40,24],[58,41],[58,58],[6,58]],[77,113,91]);
  polygon([[6,49],[21,37],[39,43],[58,34],[58,58],[6,58]],[157,180,110]);
  polygon([[13,45],[34,35],[54,45],[33,57]],[38,65,54]);
  polygon([[12,38],[33,28],[53,38],[32,49]],[211,217,184]);
  polygon([[15,38],[33,30],[49,38],[32,46]],[39,80,103]);
  for(let i=1;i<4;i++){
    polygon([[15+i*4,38-i*2],[17+i*4,38-i*2],[34+i*4,46-i*2],[32+i*4,46-i*2]],[90,135,151]);
  }
  polygon([[23,34],[24,34],[41,42],[40,43]],[90,135,151]);
  box(19,46,2,5,[45,69,56]);box(45,44,2,5,[45,69,56]);
  const scale=4,width=256,raw=Buffer.alloc((width*4+1)*width);
  for(let y=0;y<width;y++)for(let x=0;x<width;x++){const from=(Math.floor(y/scale)*size+Math.floor(x/scale))*4,to=y*(width*4+1)+1+x*4;pixels.copy(raw,to,from,from+4);}
  function crc32(bytes){let c=0xffffffff;for(const byte of bytes){c^=byte;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
  function chunk(type,bytes){const t=Buffer.from(type),out=Buffer.alloc(12+bytes.length);out.writeUInt32BE(bytes.length,0);t.copy(out,4);bytes.copy(out,8);out.writeUInt32BE(crc32(Buffer.concat([t,bytes])),8+bytes.length);return out;}
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(width,4);ihdr[8]=8;ihdr[9]=6;
  const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
  const header=Buffer.alloc(22);header.writeUInt16LE(1,2);header.writeUInt16LE(1,4);header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);header.writeUInt32LE(png.length,14);header.writeUInt32LE(22,18);
  await writeFile(directory+'/icon.png',png);await writeFile(directory+'/icon.ico',Buffer.concat([header,png]));
}
