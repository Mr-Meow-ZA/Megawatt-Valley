import type {StaffMember} from '../../simulation/types';
import {loadArtwork} from './artwork';
export const PORTRAITS:Partial<Record<StaffMember['role'],string>>={};
let tess='';
export function portraitFor(m:StaffMember):string{return m.name==='Tess Volt'?tess:PORTRAITS[m.role]??'';}
/** Individual production illustrations; no procedural character geometry or renderer work. */
export async function loadPortraits():Promise<void>{
 const portraits=await Promise.all(['tess','amir','nia','morgan','sam'].map(name=>loadArtwork('portrait_'+name)));
 [tess,PORTRAITS.technician,PORTRAITS.cleaner,PORTRAITS.engineer,PORTRAITS.manager]=portraits;
}
