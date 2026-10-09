import {PHOSPHOR} from './phosphor';
export const esc=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const money=(n:number)=>'$'+Math.round(n).toLocaleString('en-US');
export const percent=(n:number)=>Math.round(n*100)+'%';
export function button(action:string,label:string,id='',extra=''):string{return '<button type="button" data-action="'+action+'"'+(id?' data-id="'+esc(id)+'"':'')+' '+extra+'>'+label+'</button>';}

export function glyph(name:string):string{return PHOSPHOR[name]??PHOSPHOR.info;}
export function action(name:string,label:string,id='',kind='secondary',extra=''):string{
 return button(name,label,id,'class="mv-button '+kind+'" '+extra);
}
export function closeButton():string{return action('close',glyph('close'),'','icon','aria-label="Close workspace"');}
export function heading(kicker:string,title:string,detail=''):string{
 return '<header class="mv-heading"><div><span class="mv-eyebrow">'+kicker+'</span><h1>'+title+'</h1>'+(detail?'<p>'+detail+'</p>':'')+'</div>'+closeButton()+'</header>';
}
export function stat(label:string,value:string,sub='',tone=''):string{return '<div class="mv-stat '+tone+'"><small>'+label+'</small><strong>'+value+'</strong>'+(sub?'<span>'+sub+'</span>':'')+'</div>';}
export function meter(value:number,label:string):string{
 const n=Math.max(0,Math.min(100,Math.round(value*100)));
 return '<div class="mv-meter" role="meter" aria-label="'+esc(label)+'" aria-valuenow="'+n+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+n+'%"></i></div>';
}
export function tag(text:string,tone=''):string{return '<span class="mv-tag '+tone+'">'+text+'</span>';}
export function empty(title:string,body:string):string{return '<div class="mv-empty">'+glyph('info')+'<h3>'+title+'</h3><p>'+body+'</p></div>';}
