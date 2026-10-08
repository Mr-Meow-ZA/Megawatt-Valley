export const esc=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const money=(n:number)=>'$'+Math.round(n).toLocaleString('en-US');
export const percent=(n:number)=>Math.round(n*100)+'%';
export function button(action:string,label:string,id='',extra=''):string{return '<button type="button" data-action="'+action+'"'+(id?' data-id="'+esc(id)+'"':'')+' '+extra+'>'+label+'</button>';}

export function glyph(name:string):string{
 const p:Record<string,string>={
 build:'<path d="M3 17 9 7h10l-6 10zM6 12h10M10 7 7 17m7-10-3 10M6 21v-4m7 4v-4"/>',
 people:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-4c0-5 12-5 12 0v4m2-17a3 3 0 0 1 0 6m1 4c3 0 4 2 4 6"/>',
 research:'<path d="M9 3h6m-5 0v7L4 20h16l-6-10V3M7 16h10"/><circle cx="12" cy="14" r="1"/>',
 operations:'<path d="M14 4a6 6 0 0 0-8 8l-4 6 4 4 6-6a6 6 0 0 0 8-8l-4 4-4-4z"/>',
 company:'<path d="M3 21h18M6 21V5h12v16M9 8h6m-6 4h6m-6 4h6"/>',
 objectives:'<path d="M5 22V3h14l-4 4 4 4H5"/>',
 views:'<path d="m3 7 9-4 9 4-9 4zm0 5 9 4 9-4M3 17l9 4 9-4"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 power:'<path d="m14 2-9 12h6l-1 8 9-12h-6z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
 locate:'<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 2v4m0 12v4M2 12h4m14 0h4"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 4v3"/>',
 check:'<path d="m5 12 4 4L20 5"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>'
 };
 return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(p[name]??p.info)+'</svg>';
}
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
