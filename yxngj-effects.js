(()=>{'use strict';
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduce && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
 const aura=document.createElement('div');aura.className='yx-cursor-aura';aura.setAttribute('aria-hidden','true');document.body.appendChild(aura);document.body.classList.add('yx-cursor-ready');
 let x=innerWidth/2,y=innerHeight/2,tx=x,ty=y,raf=0;
 document.addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;if(!raf)raf=requestAnimationFrame(function move(){x+=(tx-x)*.18;y+=(ty-y)*.18;aura.style.left=x+'px';aura.style.top=y+'px';if(Math.abs(tx-x)+Math.abs(ty-y)>.5)raf=requestAnimationFrame(move);else raf=0;});},{passive:true});
}
const targets=document.querySelectorAll('.info-bilingual-intro,.info-card,.home-project-teaser,.gallery-heading,.cyber-heading,.entity-heading,.guide-card');
if('IntersectionObserver'in window){
 const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('yx-visible');io.unobserve(entry.target);}}),{threshold:.08});
 targets.forEach(el=>{el.classList.add('yx-reveal');io.observe(el);});
}else targets.forEach(el=>el.classList.add('yx-visible'));

const ledRailNames=['top','right','bottom','left'];
ledRailNames.forEach(side=>{const rail=document.createElement('i');rail.className='yx-led-rail '+side;rail.setAttribute('aria-hidden','true');document.body.appendChild(rail);});
const pointerGlow=document.createElement('div');pointerGlow.className='yx-pointer-glow';pointerGlow.setAttribute('aria-hidden','true');document.body.appendChild(pointerGlow);
if(!reduce&&window.matchMedia('(hover:hover) and (pointer:fine)').matches){
 document.addEventListener('pointermove',e=>{
  pointerGlow.style.setProperty('--yx-mx',e.clientX+'px');
  pointerGlow.style.setProperty('--yx-my',e.clientY+'px');
 },{passive:true});
}
})();