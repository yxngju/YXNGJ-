(() => {
  'use strict';
  const nav=document.querySelector('.side-menu'), toggle=document.querySelector('.menu-toggle'), backdrop=document.querySelector('.menu-backdrop');
  const links=[...document.querySelectorAll('.side-menu a[href^="#"]')], pages=[...document.querySelectorAll('main .page[id]')];
  if(!nav||!toggle||!backdrop||!links.length||!pages.length)return;
  const ids=pages.map(p=>p.id); let current='home', locked=false;
  const overlay=document.createElement('div'); overlay.className='yx-teleport'; overlay.setAttribute('aria-hidden','true');
  const ringOne=document.createElement('div'); ringOne.className='yx-teleport-ring ring-one';
  const ringTwo=document.createElement('div'); ringTwo.className='yx-teleport-ring ring-two';
  const core=document.createElement('div'); core.className='yx-teleport-core';
  const label=document.createElement('div'); label.className='yx-teleport-label'; label.textContent='JUMPING THROUGH THE yxngj UNIVERSE';
  overlay.append(ringOne,ringTwo,core,label);
  document.body.appendChild(overlay);
  function closeMenu(){nav.classList.remove('menu-open');backdrop.classList.remove('show');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');toggle.textContent='☰';document.body.classList.remove('nav-locked');}
  function commitPage(id,{history=false}={}){
    current=ids.includes(id)?id:'home';
    pages.forEach(p=>{const active=p.id===current;p.classList.toggle('active-page',active);p.setAttribute('aria-hidden',String(!active));if(active)p.scrollTop=0;});
    links.forEach(a=>{const active=a.hash==='#'+current;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    closeMenu(); if(history&&location.hash!=='#'+current)window.history.pushState({page:current},'','#'+current);
  }
  function showPage(id,opts={}){
    const target=ids.includes(id)?id:'home'; if(target===current&&!locked){closeMenu();return;}
    if(locked)return; locked=true; overlay.classList.remove('teleport-out'); overlay.classList.add('teleport-in'); document.body.classList.add('teleporting');
    window.setTimeout(()=>commitPage(target,opts),260);
    window.setTimeout(()=>{overlay.classList.remove('teleport-in');overlay.classList.add('teleport-out');},570);
    window.setTimeout(()=>{overlay.classList.remove('teleport-out');document.body.classList.remove('teleporting');locked=false;},1050);
  }
  links.forEach(a=>a.addEventListener('click',e=>{e.preventDefault();showPage(a.hash.slice(1),{history:true});}));
  document.querySelectorAll('[data-page-link]').forEach(a=>a.addEventListener('click',e=>{const id=a.dataset.pageLink;if(ids.includes(id)){e.preventDefault();showPage(id,{history:true});}}));
  document.querySelector('.logo')?.addEventListener('click',e=>{e.preventDefault();showPage('home',{history:true});});
  toggle.addEventListener('click',()=>{const open=!nav.classList.contains('menu-open');nav.classList.toggle('menu-open',open);backdrop.classList.toggle('show',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');toggle.textContent=open?'×':'☰';document.body.classList.toggle('nav-locked',open);});
  // Keep wheel gestures inside the navigation drawer; do not change pages on scroll.
  nav.addEventListener('wheel',e=>{
    if(nav.scrollHeight>nav.clientHeight){
      const canDown=nav.scrollTop+nav.clientHeight<nav.scrollHeight-1;
      const canUp=nav.scrollTop>0;
      if((e.deltaY>0&&canDown)||(e.deltaY<0&&canUp)) e.stopPropagation();
    }
  },{passive:true});
  nav.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault();nav.scrollBy({top:60,behavior:'smooth'});}
    if(e.key==='ArrowUp'){e.preventDefault();nav.scrollBy({top:-60,behavior:'smooth'});}
    if(e.key==='Home'){e.preventDefault();nav.scrollTo({top:0,behavior:'smooth'});}
    if(e.key==='End'){e.preventDefault();nav.scrollTo({top:nav.scrollHeight,behavior:'smooth'});}
  });
  backdrop.addEventListener('click',closeMenu);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  // Natural page scrolling is preserved. Navigation between sections is menu-driven.
  window.addEventListener('popstate',()=>showPage(location.hash.slice(1)||'home'));
  window.addEventListener('hashchange',()=>{const id=location.hash.slice(1)||'home';if(id!==current)showPage(id);});
  window.addEventListener('resize',()=>{if(innerWidth>760)closeMenu();});
  commitPage(location.hash.slice(1)||'home');
  // Fail-safe: guarantee one visible page even if another script altered classes.
  const ensureVisible=()=>{const id=ids.includes(location.hash.slice(1))?location.hash.slice(1):current;pages.forEach(p=>{const on=p.id===id;p.classList.toggle('active-page',on);p.setAttribute('aria-hidden',String(!on));});};
  window.addEventListener('pageshow',ensureVisible);
  window.addEventListener('load',ensureVisible,{once:true});
})();
