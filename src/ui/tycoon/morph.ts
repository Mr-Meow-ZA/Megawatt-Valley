/** Keep live controls and scroll containers in place while values update. */
export function patchChildren(parent:Node,next:Node):void{
 const wanted=Array.from(next.childNodes);
 for(let i=0;i<wanted.length;i++){
  const source=wanted[i],old=parent.childNodes[i];
  if(!old){parent.appendChild(source.cloneNode(true));continue;}
  const compatible=old.nodeType===source.nodeType&&old.nodeName===source.nodeName&&(!(old instanceof HTMLElement)||!(source instanceof HTMLElement)||(old.dataset.action===source.dataset.action&&old.dataset.id===source.dataset.id));
  if(!compatible){parent.replaceChild(source.cloneNode(true),old);continue;}
  if(old instanceof Element&&source instanceof Element){
   for(const attr of Array.from(old.attributes))if(!source.hasAttribute(attr.name))old.removeAttribute(attr.name);
   for(const attr of Array.from(source.attributes))if(old.getAttribute(attr.name)!==attr.value)old.setAttribute(attr.name,attr.value);
   if(old instanceof HTMLInputElement&&source instanceof HTMLInputElement){
    if(document.activeElement!==old&&old.value!==source.value)old.value=source.value;
    old.checked=source.checked;
   }
   patchChildren(old,source);
  }else if(old.nodeValue!==source.nodeValue)old.nodeValue=source.nodeValue;
 }
 while(parent.childNodes.length>wanted.length)parent.removeChild(parent.lastChild!);
}
