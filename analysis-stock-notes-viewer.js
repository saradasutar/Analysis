/* Read-only, authenticated Stock Notes viewer for Analysis. Data stays in Google Sheets. */
(function(){
'use strict';
function init(){
 const nav=document.querySelector('.side-nav');
 if(!nav||document.getElementById('analysisStockNotesBtn'))return;
 const btn=document.createElement('button');
 btn.type='button';btn.id='analysisStockNotesBtn';btn.className='nav-item';
 btn.textContent='▤ Stock Notes';btn.title='Stock Notes synchronized from SarNi';
 nav.appendChild(btn);
 // No credentials are sent to the public GitHub site or copied to Analysis.
 // The private SarNi Quick Entry link lives in this browser tab only.
 function openQuickStockEntry(){
   const storageKey='analysis_stock_quick_entry_link_tab';
   let saved='';
   try{saved=sessionStorage.getItem(storageKey)||'';}catch(_){}
   let value=window.prompt('Paste your private SarNi Quick Entry link (the /SarNi/q/?k=... URL).\\nIt stays only in this browser tab; your SarNi password is not needed.',saved);
   if(value===null)return;
   value=value.trim();
   let url;
   try{url=new URL(value);}catch(_){window.alert('Please paste the complete SarNi Quick Entry URL.');return;}
   if(url.protocol!=='https:'||url.hostname!=='saradasutar.github.io'||!['/sarni/q/','/sarni/q'].includes(url.pathname.toLowerCase())||!url.searchParams.get('k')){
     window.alert('This must be your private https://saradasutar.github.io/SarNi/q/?k=... link.');return;
   }
   try{sessionStorage.setItem(storageKey,url.toString());}catch(_){}
   window.open(url.toString(),'_blank','noopener,noreferrer');
 }
 const entryBtn=document.createElement('button');
 entryBtn.type='button';entryBtn.id='analysisAddStockNote';entryBtn.className='nav-item';
 entryBtn.textContent='＋ Add Stock Note';entryBtn.title='Open your private SarNi Quick Entry link, without another password';
 nav.appendChild(entryBtn);entryBtn.onclick=openQuickStockEntry;
 const css=document.createElement('style');
 css.textContent='#anNotesOverlay{position:fixed;inset:0;z-index:100050;background:#132941a8;display:grid;place-items:center;padding:12px}#anNotesOverlay[hidden]{display:none!important}#anNotesPane{width:min(950px,100%);max-height:92dvh;overflow:auto;background:var(--surface,#fff);border-radius:18px;padding:20px;color:var(--ink,#172b42);box-shadow:0 20px 60px #0004}#anNotesPane header{display:flex;justify-content:space-between;align-items:center;gap:10px}#anNotesPane h2{margin:0;font-size:21px}#anNotesPane input{padding:12px;border:1px solid #b9cce0;border-radius:9px;width:100%;font:inherit}#anNotesPane .an-tools{display:flex;gap:10px;margin:15px 0;align-items:center}#anNotesPane button{cursor:pointer}#anNotesItems{display:grid;gap:12px}#anNotesItems article{padding:14px;border:1px solid #d9e3ee;border-radius:12px;background:#f9fcff}#anNotesItems article h3{font-size:16px;margin:2px 0}#anNotesItems article small{color:#547086}#anNotesItems article .an-body{white-space:pre-wrap;overflow-wrap:anywhere;margin:10px 0 0;font-size:14px;line-height:1.65}#anNotesStatus{font-size:13px;color:#49627b}';
 document.head.appendChild(css);
 const overlay=document.createElement('div');overlay.id='anNotesOverlay';overlay.hidden=true;
 const pane=document.createElement('section');pane.id='anNotesPane';pane.setAttribute('role','dialog');pane.setAttribute('aria-modal','true');pane.setAttribute('aria-label','Stock Notes');
 const header=document.createElement('header'),heading=document.createElement('h2');heading.textContent='Stock Notes · SarNi Mirror';
 const close=document.createElement('button');close.type='button';close.textContent='✕ Close';close.onclick=()=>overlay.hidden=true;header.append(heading,close);
 const addAction=document.createElement('button');addAction.type='button';addAction.textContent='＋ Add Stock Note';addAction.onclick=openQuickStockEntry;header.appendChild(addAction);
 const controls=document.createElement('div');controls.className='an-tools';
 const search=document.createElement('input');search.placeholder='Search title, note, date, category or tags';search.setAttribute('aria-label','Search Stock Notes');
 const refresh=document.createElement('button');refresh.type='button';refresh.textContent='Refresh';controls.append(search,refresh);
 const status=document.createElement('p');status.id='anNotesStatus';status.setAttribute('role','status');
 const list=document.createElement('div');list.id='anNotesItems';pane.append(header,controls,status,list);
 overlay.appendChild(pane);document.body.appendChild(overlay);
 overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.hidden=true;});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)overlay.hidden=true;});
 let latest=0;
 async function load(){
   const current=++latest;list.replaceChildren();status.textContent='Loading private Stock Notes…';
   try{
     if(typeof state==='undefined'||!state.token){status.textContent='Sign in to Analysis first.';return;}
     if(typeof api!=='function'){status.textContent='Analysis API unavailable.';return;}
     const result=await api('anStockNotesList',{query:search.value,offset:0,limit:100},{retry:false,timeoutMs:25000});
     if(current!==latest||overlay.hidden)return;
     const items=Array.isArray(result.items)?result.items:[];
     status.textContent=items.length+' of '+(result.total||0)+' matching notes · Read only';
     for(const n of items){
       const article=document.createElement('article'),title=document.createElement('h3'),meta=document.createElement('small'),body=document.createElement('div');
       title.textContent=n.title||'Untitled Note';meta.textContent=[n.date,n.category,n.tags].filter(Boolean).join(' · ');
       body.className='an-body';body.textContent=n.body||'';
       article.append(title,meta,body);list.append(article);
     }
     if(!items.length){const empty=document.createElement('p');empty.textContent='No matching Stock Notes found.';list.append(empty);}
   }catch(err){
     if(current!==latest||overlay.hidden)return;
     const code=String(err&&err.code||'');
     const message=String(err&&err.message||'Unknown backend error');
     const moved=/MODULE_MOVED|separate SarNi dashboard/i.test(code+' '+message);
     status.textContent=moved
       ? 'Analysis backend rejected the Stock Notes read action (MODULE_MOVED). No second password is needed. Use + Add Stock Note to save through SarNi Quick Entry. To view notes here, update the Analysis Apps Script deployment used by this website.'
       : 'Unable to load Stock Notes'+(code?' ['+code+']':'')+': '+message;
   }
 }
 btn.onclick=()=>{overlay.hidden=false;search.value='';load();};
 refresh.onclick=load;
 let delay;search.addEventListener('input',()=>{clearTimeout(delay);delay=setTimeout(load,350);});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();