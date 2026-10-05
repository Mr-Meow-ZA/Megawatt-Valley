import {readFile} from 'node:fs/promises';
import path from 'node:path';
/** Embed external palette images in the GLB BIN chunk; preserve source files. */
export async function selfContainedGlb(file){
  const bytes=await readFile(file);
  if(bytes.readUInt32LE(0)!==0x46546c67)throw new Error('Missing LFS GLB: '+file);
  const jsonLength=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+jsonLength).toString('utf8'));
  const binHeader=20+jsonLength,binLength=bytes.readUInt32LE(binHeader);
  let bin=Buffer.from(bytes.subarray(binHeader+8,binHeader+8+binLength));
  for(const image of json.images??[]){
    if(!image.uri)continue;
    if(/^(https?:|data:)/.test(image.uri))throw new Error('Only local palette textures allowed: '+file);
    const imagePath=path.resolve(path.dirname(file),image.uri);
    if(!imagePath.startsWith(path.resolve('public/assets/sourced')+path.sep))throw new Error('Texture outside source assets');
    const texture=await readFile(imagePath);
    if(texture[0]!==137||texture[1]!==80)throw new Error('Missing LFS texture: '+imagePath);
    const offset=Math.ceil(bin.length/4)*4;
    bin=Buffer.concat([bin,Buffer.alloc(offset-bin.length),texture]);
    json.bufferViews??=[];image.bufferView=json.bufferViews.length;
    json.bufferViews.push({buffer:0,byteOffset:offset,byteLength:texture.length});
    image.mimeType='image/png';delete image.uri;
  }
  json.buffers[0].byteLength=bin.length;
  const encoded=Buffer.from(JSON.stringify(json)),padded=Buffer.alloc(Math.ceil(encoded.length/4)*4,32);encoded.copy(padded);
  const binary=Buffer.alloc(Math.ceil(bin.length/4)*4);bin.copy(binary);
  const header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+padded.length+binary.length,8);header.writeUInt32LE(padded.length,12);header.writeUInt32LE(0x4e4f534a,16);
  const chunk=Buffer.alloc(8);chunk.writeUInt32LE(binary.length,0);chunk.writeUInt32LE(0x004e4942,4);
  return Buffer.concat([header,padded,chunk,binary]);
}
