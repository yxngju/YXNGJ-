(() => {
  'use strict';
  const canvas = document.getElementById('entityCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  const stage = canvas.parentElement;
  const sync = document.getElementById('entitySync');
  const energy = document.getElementById('entityEnergy');
  const energyBar = document.getElementById('entityEnergyBar');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || window.matchMedia('(max-width: 760px)').matches;
  // Select a reference angle and promote it into the large preview.
  const selectedImage = document.getElementById('entitySelectedImage');
  const selectedLabel = document.getElementById('entitySelectedLabel');
  document.querySelectorAll('.entity-view-choice').forEach(button => {
    button.addEventListener('click', () => {
      const src = button.dataset.viewSrc;
      if (selectedImage && src) { selectedImage.src = src; selectedImage.alt = `X-01 ${button.dataset.viewLabel || 'selected'} angle`; }
      if (selectedLabel) selectedLabel.textContent = button.dataset.viewLabel || 'SELECTED VIEW';
      document.querySelectorAll('.entity-view-choice').forEach(item => item.classList.toggle('active', item === button));
    });
  });

  let w = 0, h = 0, dpr = 1, frame = 0, last = 0, pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
  let glitch = 0, phase = 0, pink = 0, visible = !document.hidden, inView = false, uiTick = 0, lastPaint = 0;
  const points = [];
  const rand = (a,b) => a + Math.random() * (b-a);
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));

  // Sample a humanoid silhouette from overlapping soft anatomical volumes.
  function insideEllipse(x,y,cx,cy,rx,ry){const dx=(x-cx)/rx,dy=(y-cy)/ry;return dx*dx+dy*dy<=1;}
  function insideBody(x,y){
    return insideEllipse(x,y,0,-.34,.105,.115) || // head
      insideEllipse(x,y,0,-.08,.17,.22) || // shoulders/chest
      insideEllipse(x,y,0,.17,.125,.20) || // abdomen
      insideEllipse(x,y,-.205,-.01,.075,.22) || insideEllipse(x,y,.205,-.01,.075,.22) || // upper arms
      insideEllipse(x,y,-.245,.22,.055,.18) || insideEllipse(x,y,.245,.22,.055,.18) || // forearms
      insideEllipse(x,y,-.26,.39,.075,.085) || insideEllipse(x,y,.26,.39,.075,.085) || // hands
      insideEllipse(x,y,-.075,.48,.065,.22) || insideEllipse(x,y,.075,.48,.065,.22) || // legs
      insideEllipse(x,y,-.08,.68,.06,.12) || insideEllipse(x,y,.08,.68,.06,.12);
  }
  function makePoints(){
    points.length=0;
    // Keep the hologram light enough for integrated laptop graphics.
    const count = lowPower ? 64 : Math.min(145, Math.max(100, Math.floor((w*h)/6200)));
    let tries=0;
    while(points.length<count && tries<count*24){
      tries++;
      const x=rand(-.34,.34), y=rand(-.55,.83);
      if(insideBody(x,y)) points.push({x,y,seed:rand(0,Math.PI*2),size:rand(.45,1.45),speed:rand(.4,1.6),layer:rand(.65,1.25)});
    }
    // Extra filaments around the outer silhouette create the flowing mesh edge.
    for(let i=0;i<(lowPower ? 10 : 26);i++){
      const a=rand(0,Math.PI*2), r=rand(.31,.42);
      points.push({x:Math.cos(a)*r,y:Math.sin(a)*r+.08,seed:rand(0,Math.PI*2),size:rand(.35,.9),speed:rand(.3,1.2),layer:rand(.7,1.3),edge:true});
    }
  }
  function resize(){
    const rect=stage.getBoundingClientRect(); w=Math.max(1,rect.width);h=Math.max(1,rect.height);dpr=Math.min(lowPower ? 1 : 1.15,window.devicePixelRatio||1);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);makePoints();
  }
  const ro = new ResizeObserver(resize);ro.observe(stage);resize();
  stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();targetX=((e.clientX-r.left)/r.width-.5)*2;targetY=((e.clientY-r.top)/r.height-.5)*2;});
  stage.addEventListener('pointerleave',()=>{targetX=0;targetY=0;});
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(visible && inView) start(); else stop();});
  const observer = new IntersectionObserver(entries=>{inView=!!entries[0]?.isIntersecting;if(inView && visible) start(); else stop();},{threshold:0.02});
  observer.observe(stage);
  function start(){if(!frame && visible && inView){last=0;frame=requestAnimationFrame(draw);}}
  function stop(){if(frame){cancelAnimationFrame(frame);frame=0;} }

  function draw(now){
    frame=0; if(!visible || !inView) return;
    // Paint at 24fps instead of 60fps to reduce integrated-GPU load.
    const frameBudget = lowPower ? 56 : 42;
    if(!reduceMotion && now-lastPaint < frameBudget){frame=requestAnimationFrame(draw);return;}
    if(reduceMotion && lastPaint){return;}
    lastPaint=now;
    const dt=last?Math.min(.06,(now-last)/1000):.041;last=now;phase+=dt*(reduceMotion?.15:1);
    pointerX+=(targetX-pointerX)*.035;pointerY+=(targetY-pointerY)*.035;
    const cycle=(Math.sin(phase*.55)+1)/2;
    pink=clamp(.22+cycle*.68+(glitch>0?.24:0),0,1);
    // deliberate micro-freezes and abrupt data bursts, without stopping the page
    if(!reduceMotion && !lowPower && Math.random()<.0025) glitch=rand(.08,.20);
    glitch=Math.max(0,glitch-dt);
    const freeze=glitch>0 && Math.sin(now*.09)>-.1;
    const speed=freeze?.12:(1+Math.sin(phase*1.8)*.34);
    ctx.clearRect(0,0,w,h);
    const cx=w*.5 + pointerX*w*.045, cy=h*.47 + pointerY*h*.025;
    const scale=Math.min(w*1.03,h*.66);
    const white=[218,226,240], hot=[255,111,207];
    const cr=Math.round(white[0]*(1-pink)+hot[0]*pink),cg=Math.round(white[1]*(1-pink)+hot[1]*pink),cb=Math.round(white[2]*(1-pink)+hot[2]*pink);
    const coords=[];
    for(let i=0;i<points.length;i++){
      const p=points[i];
      const wave=Math.sin(phase*p.speed+p.seed);
      let x=p.x*scale, y=p.y*scale;
      // breathing, subtle body twist and independently moving arms/hands
      const armWeight=clamp((Math.abs(p.x)-.12)/.16,0,1);
      x += Math.sin(phase*.9+p.seed*.3)*scale*.012 + pointerX*scale*.035;
      x += Math.sign(p.x)*armWeight*Math.sin(phase*1.35+p.seed)*scale*.035;
      y += Math.sin(phase*1.2+p.seed)*scale*.008 + pointerY*scale*.018;
      if(glitch>0){x+=Math.sin(p.seed*7+now*.04)*scale*.035;y+=Math.cos(p.seed*4+now*.05)*scale*.018;}
      x=cx+x*p.layer;y=cy+y*p.layer;
      const flicker=.55+.45*Math.sin(phase*2.3+p.seed*2);
      const alpha=(p.edge?.42:.78)*flicker*(freeze?.65:1);
      coords.push({x,y,alpha,p});
    }
    // Sparse connective strands; omitted on low-power devices.
    if(!lowPower){
      ctx.lineWidth=.45;
      for(let i=0;i<coords.length;i+=5){
        const a=coords[i];
        for(let j=i+2;j<Math.min(i+5,coords.length);j+=2){
          const b=coords[j],dx=a.x-b.x,dy=a.y-b.y,dist=dx*dx+dy*dy;
          if(dist<scale*scale*.0012){ctx.strokeStyle=`rgba(${cr},${cg},${cb},${.08*(1-dist/(scale*scale*.0012))})`;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
        }
      }
    }
    // Vertical flowing threads give the figure its liquid, scanned appearance.
    ctx.lineWidth=.45;
    for(let k=0;k<(lowPower ? 4 : 9);k++){
      const x=cx+Math.sin(k*2.1+phase*.22)*scale*.24;
      const y0=cy-scale*.46, y1=cy+scale*.68;
      ctx.strokeStyle=`rgba(${cr},${cg},${cb},${.045+pink*.025})`;ctx.beginPath();ctx.moveTo(x,y0);
      ctx.bezierCurveTo(x+Math.sin(phase+k)*scale*.04,cy-scale*.1,x-Math.cos(phase*.7+k)*scale*.05,cy+scale*.3,x+Math.sin(phase*.6+k)*scale*.025,y1);ctx.stroke();
    }
    for(const q of coords){
      const glow=q.p.size*2.8;
      ctx.fillStyle=`rgba(${cr},${cg},${cb},${q.alpha})`;ctx.beginPath();ctx.arc(q.x,q.y,q.p.size*(.7+.3*Math.sin(phase*q.p.speed+q.p.seed)),0,Math.PI*2);ctx.fill();
      if(q.p.size>1.15){ctx.fillStyle=`rgba(${cr},${cg},${cb},${q.alpha*.14})`;ctx.beginPath();ctx.arc(q.x,q.y,glow,0,Math.PI*2);ctx.fill();}
    }
    // Bright data fragments on shoulders, elbows and fingertips.
    for(let i=0;i<(lowPower ? 4 : 7);i++){
      const a=phase*(.22+i*.012)+i*1.7;const x=cx+Math.sin(a)*scale*(.12+i*.018),y=cy+Math.cos(a*1.3)*scale*.38;
      ctx.fillStyle=`rgba(${cr},${cg},${cb},${.3+.5*Math.sin(phase+i)**2})`;ctx.fillRect(x,y,rand(1,2),rand(5,17));
    }
    // Brief horizontal scan tear when the entity glitches.
    if(glitch>0){const gy=cy+Math.sin(now*.03)*scale*.2;ctx.fillStyle=`rgba(255,120,220,${glitch*.7})`;ctx.fillRect(cx-scale*.34,gy,scale*.68,1+glitch*14);}
    // Update text/layout only a few times per second, not on every animation frame.
    uiTick += dt;
    if(uiTick >= .50){uiTick=0;if(sync)sync.textContent=(freeze?`${96+Math.random()*2|0}.`:`${98+Math.sin(phase)*.8}`)+'%';const e=70+Math.sin(phase*.8)*7+(glitch>0?8:0);if(energy)energy.textContent=e.toFixed(1)+'%';if(energyBar)energyBar.style.width=e+'%';}
    frame=requestAnimationFrame(draw);
  }
  start();
  window.addEventListener('pagehide',()=>{stop();observer.disconnect();ro.disconnect();},{once:true});
})();
