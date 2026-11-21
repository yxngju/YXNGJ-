(() => {
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
// Global search across actual page headings and project archive cards.
const dialog=$('#yxSearch'), input=$('#yxGlobalSearchInput'), results=$('#yxSearchResults');
const openSearch=()=>{dialog?.classList.add('open');dialog?.setAttribute('aria-hidden','false');setTimeout(()=>input?.focus(),30);};
const closeSearch=()=>{dialog?.classList.remove('open');dialog?.setAttribute('aria-hidden','true');};
$('.yx-search-trigger')?.addEventListener('click',openSearch);
$$('[data-search-close]').forEach(b=>b.addEventListener('click',closeSearch));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSearch();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}});
function renderSearch(q){
 if(!results)return; const query=q.trim().toLocaleLowerCase();
 if(!query){results.innerHTML='<p>Start typing to search / برای جست‌وجو تایپ کن</p>';return;}
 const pages=$$('.page[id]').map(p=>({id:p.id,title:( $('h1',p)?.textContent||p.getAttribute('aria-label')||p.id).replace(/\s+/g,' ').trim(),text:p.textContent||''}));
 const hits=pages.filter(p=>(p.title+' '+p.text).toLocaleLowerCase().includes(query)).slice(0,8);
 results.replaceChildren();
 if(!hits.length){const p=document.createElement('p');p.textContent='No results found / نتیجه‌ای پیدا نشد';results.append(p);return;}
 hits.forEach(hit=>{const a=document.createElement('a');a.className='yx-search-result';a.href='#'+hit.id;const title=document.createElement('b');title.textContent=hit.title;const sub=document.createElement('small');sub.textContent=hit.id;a.append(title,sub);a.addEventListener('click',()=>{closeSearch();});results.append(a);});
}
input?.addEventListener('input',()=>renderSearch(input.value));
// Project archive category filters and text search.
const cards=$$('.project-card'), projectInput=$('#projectSearch'), count=$('#projectCount');
let category='all';
function filterProjects(){
 const q=(projectInput?.value||'').trim().toLocaleLowerCase();let visible=0;
 cards.forEach(card=>{const hay=((card.textContent||'')+' '+(card.dataset.search||'')).toLocaleLowerCase();const show=(category==='all'||card.dataset.category===category)&&(!q||hay.includes(q));card.hidden=!show;if(show)visible++;});
 if(count)count.textContent=visible+' PROJECTS / '+visible+' پروژه';
}
$$('[data-project-filter]').forEach(btn=>btn.addEventListener('click',()=>{category=btn.dataset.projectFilter;$$('[data-project-filter]').forEach(b=>b.classList.toggle('active',b===btn));filterProjects();}));
projectInput?.addEventListener('input',filterProjects);
filterProjects();
})();