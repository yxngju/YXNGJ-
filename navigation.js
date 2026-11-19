(() => {
  'use strict';
  const nav=document.querySelector('.side-menu'), toggle=document.querySelector('.menu-toggle'), backdrop=document.querySelector('.menu-backdrop');
  const links=[...document.querySelectorAll('.side-menu a[href^="#"]')], pages=[...document.querySelectorAll('main .page[id]')];
  if(!nav||!toggle||!backdrop||!links.length||!pages.length)return;
  const ids=pages.map(p=>p.id); let current='home', locked=false, wheelTimer=null, touchY=0, touchX=0, touchTarget=null;
  const overlay=document.createElement('div'); overlay.className='yx-teleport'; overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML='<div class="yx-teleport-ring ring-one"></div><div class="yx-teleport-ring ring-two"></div><div class="yx-teleport-core"></div><div class="yx-teleport-label">JUMPING THROUGH THE yxngj UNIVERSE</div>';
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
  const go=d=>{const i=ids.indexOf(current),n=Math.max(0,Math.min(ids.length-1,i+d));if(n!==i)showPage(ids[n],{history:true});};
  const isBlocked=t=>t instanceof Element&&!!t.closest('input,textarea,select,button,[contenteditable="true"],iframe,.gallery-lightbox,.cyber-code-wrap,.cyber-terminal-output,.entity-view-gallery,.holo-gallery,.cyber-explorer');
  const pageCanScroll=(page,dir)=>page&&(dir>0?page.scrollTop+page.clientHeight<page.scrollHeight-4:page.scrollTop>4);
  const innerScroller=t=>t instanceof Element?t.closest('.cyber-terminal-output,.cyber-code-input,.cyber-editor-result,.cyber-explorer,[data-native-scroll]'):null;
  const innerCanScroll=(el,dir)=>el&&el.scrollHeight>el.clientHeight+3&&(dir>0?el.scrollTop+el.clientHeight<el.scrollHeight-3:el.scrollTop>3);
  links.forEach(a=>a.addEventListener('click',e=>{e.preventDefault();showPage(a.hash.slice(1),{history:true});}));
  document.querySelectorAll('[data-page-link]').forEach(a=>a.addEventListener('click',e=>{const id=a.dataset.pageLink;if(ids.includes(id)){e.preventDefault();showPage(id,{history:true});}}));
  document.querySelector('.logo')?.addEventListener('click',e=>{e.preventDefault();showPage('home',{history:true});});
  toggle.addEventListener('click',()=>{const open=!nav.classList.contains('menu-open');nav.classList.toggle('menu-open',open);backdrop.classList.toggle('show',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');toggle.textContent=open?'×':'☰';document.body.classList.toggle('nav-locked',open);});
  backdrop.addEventListener('click',closeMenu);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  // Page navigation is menu-only. Wheel and touch scrolling are reserved for
  // content inside the currently open page (terminal, editor, galleries, etc.).
  // No global wheel/touch gesture can switch sections or trigger teleport.
  document.addEventListener('wheel', e => {
    if (locked) e.stopPropagation();
  }, {capture:true, passive:true});
  document.addEventListener('touchend', e => {
    if (locked) e.stopPropagation();
  }, {capture:true, passive:true});
  window.addEventListener('popstate',()=>showPage(location.hash.slice(1)||'home'));
  window.addEventListener('hashchange',()=>{const id=location.hash.slice(1)||'home';if(id!==current)showPage(id);});
  window.addEventListener('resize',()=>{if(innerWidth>760)closeMenu();});
  commitPage(location.hash.slice(1)||'home');
})();
