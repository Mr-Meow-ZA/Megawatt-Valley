/** Authored artwork is loaded once and shared by every UI surface.
 * Desktop embeds the same files; blob URLs keep large image data out of live DOM patches. */
const loaded=new Map<string,string>();
export async function loadArtwork(key:string):Promise<string>{
 const cached=loaded.get(key);if(cached)return cached;
 const embedded=(window as Window&{__MW_ASSETS__?:Record<string,string>}).__MW_ASSETS__?.[key];
 const response=await fetch(embedded??('/assets/game/'+key+'.png'));
 if(!response.ok)throw new Error('Artwork could not load: '+key);
 const blob=await response.blob(),url=URL.createObjectURL(blob);
 const preview=new Image();preview.src=url;
 try{await preview.decode();}catch(error){URL.revokeObjectURL(url);throw new Error('Invalid artwork: '+key,{cause:error});}
 loaded.set(key,url);return url;
}
export async function loadMenuArtwork():Promise<void>{
 document.documentElement.style.setProperty('--mv-art-atlas','url("'+await loadArtwork('ui_menu_atlas')+'")');
}
const cells:Record<string,number>={build:0,generation:0,people:1,research:2,operations:3,company:4,objectives:5,views:6,resilience:7};
export function artwork(name:string,extra=''):string{
 const n=cells[name]??2;
 return '<span class="mv-art '+extra+'" data-art="'+name+'" aria-hidden="true" style="background-position:'+((n%4)/3*100)+'% '+(n>=4?100:0)+'%"></span>';
}
