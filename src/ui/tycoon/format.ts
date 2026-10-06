export const esc=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const money=(n:number)=>'$'+Math.round(n).toLocaleString('en-US');
export const percent=(n:number)=>Math.round(n*100)+'%';
export function button(action:string,label:string,id='',extra=''):string{return '<button type="button" data-action="'+action+'"'+(id?' data-id="'+esc(id)+'"':'')+' '+extra+'>'+label+'</button>';}
export function meter(value:number,label:string):string{return '<div class="meter" role="meter" aria-label="'+esc(label)+'" aria-valuenow="'+Math.round(value*100)+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+Math.max(0,Math.min(100,value*100))+'%"></i></div>';}
export function icon(name:string):string{
 const paths:Record<string,string>={
 build:'<path d="m5 15 10-10 4 4-10 10H5zM12 8l4 4"/>',
 staff:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-3c0-5 12-5 12 0v3M17 5a3 3 0 0 1 0 6m1 3c3 0 4 2 4 5"/>',
 company:'<path d="M4 21V8h10v13M14 12h6v9M2 21h20M7 11h4m-4 4h4m-4 4h4M8 8V3h8"/>',
 views:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12"/><circle cx="12" cy="12" r="3"/>',
 home:'<path d="m3 11 9-8 9 8M6 9v12h12V9M10 21v-7h4v7"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
 power:'<path d="m14 2-9 12h6l-1 8 9-12h-6z"/>',
 flag:'<path d="M5 22V3h13l-3 4 3 4H5"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 road:'<path d="M4 22 8 2m8 0 4 20M12 4v3m0 4v3m0 4v3"/>',
 bell:'<path d="M5 16h14l-2-4V8a5 5 0 0 0-10 0v4zm5 4h4"/>',
 trash:'<path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 9v9m4-9v9"/>'
 };
 return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]??paths.company)+'</svg>';
}
