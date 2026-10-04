const fs = require('node:fs');
const path = require('node:path');

/** Small durable store. A failed replacement leaves the previous save recoverable. */
function createSaveStore(directory, validate) {
  fs.mkdirSync(directory, { recursive:true });
  const primary=path.join(directory,'company.json'), backup=path.join(directory,'company.backup.json');
  function valid(raw) {
    if(typeof raw!=='string'||Buffer.byteLength(raw)>2_000_000)return false;
    try { const value=JSON.parse(raw);return value.version===1 && validate(value.state); } catch{return false;}
  }
  function atomic(file,raw) {
    const temp=file+'.tmp';
    let fd;
    try {fd=fs.openSync(temp,'w',0o600);fs.writeFileSync(fd,raw,'utf8');fs.fsyncSync(fd);}
    finally {if(fd!==undefined)fs.closeSync(fd);}
    fs.renameSync(temp,file);
  }
  function candidates() {
    return [primary,backup].flatMap(file=>{
      try {const raw=fs.readFileSync(file,'utf8');return valid(raw)?[raw]:[];}catch{return [];}
    });
  }
  return {
    candidates,
    save(raw) {
      if(!valid(raw))return false;
      try {
        // Never overwrite the only remaining evidence of an unreadable company.
        if((fs.existsSync(primary)||fs.existsSync(backup))&&candidates().length===0)return false;
        let old;try{old=fs.readFileSync(primary,'utf8');}catch{}
        if(valid(old))atomic(backup,old);
        atomic(primary,raw);return true;
      } catch{return false;}
    },
    clear() {
      try{for(const file of [primary,backup,primary+'.tmp',backup+'.tmp'])fs.rmSync(file,{force:true});return true;}catch{return false;}
    }
  };
}
module.exports={createSaveStore};
