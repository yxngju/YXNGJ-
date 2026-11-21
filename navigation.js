(() => {
  'use strict';
  const nav=document.querySelector('.side-menu');
  const toggle=document.querySelector('.menu-toggle');
  const backdrop=document.querySelector('.menu-backdrop');
  const links=[...document.querySelectorAll('.side-menu a[href^="#"]')];
  const pages=[...document.querySelectorAll('main .page[id]')];
  if(!nav||!toggle||!backdrop||!links.length||!pages.length)return;
  const ids=pages.map(p=>p.id);
  let current='home';
  function closeMenu(){nav.classList.remove('menu-open');backdrop.classList.remove('show');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');toggle.textContent='☰';document.body.classList.remove('nav-locked');}
  function showPage(id,{history=false}={}){
    const target=ids.includes(id)?id:'home';current=target;
    pages.forEach(p=>{const active=p.id===current;p.classList.toggle('active-page',active);p.setAttribute('aria-hidden',String(!active));});
    links.forEach(a=>{const active=a.hash==='#'+current;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    closeMenu();window.scrollTo({top:0,left:0,behavior:'auto'});
    if(history&&location.hash!=='#'+current)window.history.pushState({page:current},'','#'+current);
  }
  links.forEach(a=>a.addEventListener('click',e=>{e.preventDefault();showPage(a.hash.slice(1),{history:true});}));
  document.querySelectorAll('[data-page-link]').forEach(a=>a.addEventListener('click',e=>{const id=a.dataset.pageLink;if(ids.includes(id)){e.preventDefault();showPage(id,{history:true});}}));
  document.querySelector('.logo')?.addEventListener('click',e=>{e.preventDefault();showPage('home',{history:true});});
  toggle.addEventListener('click',()=>{const open=!nav.classList.contains('menu-open');nav.classList.toggle('menu-open',open);backdrop.classList.toggle('show',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');toggle.textContent=open?'×':'☰';document.body.classList.toggle('nav-locked',open);});
  backdrop.addEventListener('click',closeMenu);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  window.addEventListener('popstate',()=>showPage(location.hash.slice(1)||'home'));
  window.addEventListener('hashchange',()=>{const id=location.hash.slice(1)||'home';if(id!==current)showPage(id);});
  window.addEventListener('resize',()=>{if(innerWidth>760)closeMenu();});
  showPage(location.hash.slice(1)||'home');
})();
