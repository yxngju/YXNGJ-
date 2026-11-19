(()=>{'use strict';
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
let pose=0,turn=0;
const swap=(img,src)=>{if(!img||img.getAttribute('src')===src)return;img.style.opacity='0';window.setTimeout(()=>{img.src=src;img.style.opacity='1'},260)};
const poses=['entity-character.png','entity-left-profile.jpg','entity-three-quarter.jpg','entity-back.jpg'];
if(!reduce&&heroImg)setInterval(()=>{pose=(pose+1)%poses.length;swap(heroImg,poses[pose])},5200);
// Every window cycles through the site's own existing archive, with a different offset.
windows.forEach((card,i)=>{const img=card.querySelector('img');let n=i*3;
 if(!reduce)setInterval(()=>{n=(n+1)%archive.length;swap(img,archive[(n+i*3)%archive.length])},4700+i*530);
});
if(!reduce&&matchMedia('(hover:hover) and (pointer:fine)').matches){
 document.addEventListener('pointermove',e=>{
  const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;
  if(hero)hero.style.transform=`translate3d(${x*-13}px,${y*-11}px,0)`;
  windows.forEach(card=>{const r=card.getBoundingClientRect();
   if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){
    const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`perspective(700px) rotateY(${px*5}deg) rotateX(${-py*5}deg) translateY(-3px)`;
   }else card.style.transform='';
  });
 },{passive:true});
}
})();