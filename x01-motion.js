(()=>{'use strict';
const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
const archive=[
'home-art/gallery-1494.webp','home-art/gallery-1495.webp','home-art/gallery-1496.webp',
'home-art/gallery-1497.webp','home-art/gallery-1498.webp','home-art/gallery-1499.webp',
'home-art/gallery-1500.webp','home-art/gallery-1501.webp','home-art/gallery-1502.webp',
'home-art/anime-void-companion.webp','home-art/anime-red-signal.webp',
'home-art/anime-hooded-swords.webp','home-art/anime-chrome-portrait.webp'
];
const hero=document.querySelector('.x01-live');
const heroImg=document.querySelector('.x01-pose-image');
const windows=[...document.querySelectorAll('.x01-window')];
const cyclers=[];
const pageIsVisible=el=>!!(el&&el.isConnected&&el.getClientRects().length>0);
let reduced=motionQuery.matches;
const pendingSwaps=new WeakMap();
function swap(img,src){
 if(!img||img.getAttribute('src')===src)return;
 const old=pendingSwaps.get(img);if(old)clearTimeout(old);
 img.style.opacity='0';
 const timer=window.setTimeout(()=>{
  if(!img.isConnected)return;
  img.src=src;img.style.opacity='1';pendingSwaps.delete(img);
 },260);
 pendingSwaps.set(img,timer);
}
function createCycler(element,interval,advance){
 if(!element)return;
 let timer=null,intersecting=false,observer=null;
 const canRun=()=>!reduced&&document.visibilityState==='visible'&&intersecting&&pageIsVisible(element);
 const stop=()=>{if(timer!==null){window.clearInterval(timer);timer=null;}};
 const start=()=>{
  if(timer!==null||!canRun())return;
  timer=window.setInterval(()=>{if(canRun())advance();else stop();},interval);
 };
 if('IntersectionObserver'in window){
  observer=new IntersectionObserver(entries=>{
   const entry=entries.find(item=>item.target===element);
   intersecting=!!entry&&entry.isIntersecting&&entry.intersectionRatio>0;
   if(intersecting)start();else stop();
  },{threshold:0.01});
  observer.observe(element);
 }else{
  // Fallback: only start when the element is currently laid out and visible.
  intersecting=pageIsVisible(element);
  start();
 }
 cyclers.push({start,stop,element,disconnect:()=>observer?.disconnect()});
}
document.addEventListener('visibilitychange',()=>{
 cyclers.forEach(c=>document.visibilityState==='visible'?c.start():c.stop());
});
window.addEventListener('resize',()=>{
 cyclers.forEach(c=>{if(!pageIsVisible(c.element))c.stop();else c.start();});
},{passive:true});
let pose=0;
const poses=['entity-character.webp','entity-left-profile.webp','entity-three-quarter.webp','entity-back.webp'];
if(hero&&heroImg)createCycler(hero,5200,()=>{pose=(pose+1)%poses.length;swap(heroImg,poses[pose]);});
windows.forEach((card,i)=>{
 const img=card.querySelector('img');let n=i*3;
 if(!img)return;
 createCycler(card,4700+i*530,()=>{n=(n+1)%archive.length;swap(img,archive[(n+i*3)%archive.length]);});
});
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
 let lastFrame=false;
 document.addEventListener('pointermove',e=>{
  if(lastFrame)return;lastFrame=true;
  window.requestAnimationFrame(()=>{
   lastFrame=false;
   if(hero&&pageIsVisible(hero)){
    const x=e.clientX/window.innerWidth-.5,y=e.clientY/window.innerHeight-.5;
    hero.style.transform=`translate3d(${x*-13}px,${y*-11}px,0)`;
   }
   windows.forEach(card=>{
    if(!pageIsVisible(card)){card.style.transform='';return;}
    const r=card.getBoundingClientRect();
    if(r.width<=0||r.height<=0){card.style.transform='';return;}
    if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){
     const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
     card.style.transform=`perspective(700px) rotateY(${px*5}deg) rotateX(${-py*5}deg) translateY(-3px)`;
    }else card.style.transform='';
   });
  });
 },{passive:true});
}
// If the OS preference changes while the page is open, stop or resume all motion.
const onMotionPreferenceChange=event=>{
 reduced=event.matches;
 cyclers.forEach(c=>reduced?c.stop():c.start());
};
if(motionQuery.addEventListener)motionQuery.addEventListener('change',onMotionPreferenceChange);
else if(motionQuery.addListener)motionQuery.addListener(onMotionPreferenceChange);
window.addEventListener('pagehide',event=>{if(event.persisted)return;cyclers.forEach(c=>{c.stop();c.disconnect();});},{once:true});
})();