/* Analysis Stock Notes v2: authenticated Analysis API; SarNi canonical storage. */
(function () {
'use strict';
function init(){
 const nav=document.querySelector('.side-nav');
 if(!nav||document.getElementById('analysisStockNotesBtn'))return;
 const view=document.createElement('button');view.type='button';view.className='nav-item';view.id='analysisStockNotesBtn';view.textContent='▤ Stock Notes';
 const add=document.createElement('button');add.type='button';add.className='nav-item';add.id='analysisAddStockNote';add.textContent='＋ Add Stock Note';

 // A separate fallback for private link entry; do not embed private keys in GitHub.
 const fallback=document.createElement('button');
 fallback.type='button';fallback.className='nav-item';fallback.id='analysisStockNotesFallback';
 fallback.textContent='↗ Stock Note Quick Link';
 fallback.title='Fallback when Analysis backend access is not configured';
 function openFallback(){
   let raw='';
   try{raw=sessionStorage.getItem('an_stock_private_quicklink_v1')||'';}catch(_){}
   const answer=prompt('Paste your PRIVATE SarNi Quick Entry URL (…/SarNi/q/?k=…). Kept only in this browser tab.',raw);
   if(answer===null)return;
   let url;
   try{url=new URL(answer.trim());}catch(_){alert('Invalid URL');return;}
   if(url.protocol!=='https:'||url.hostname!=='saradasutar.github.io'||!['/sarni/q','/sarni/q/'].includes(url.pathname.toLowerCase())||!url.searchParams.get('k')){alert('Enter a valid SarNi Quick Entry link.');return;}
   url.hash='stock';
   try{sessionStorage.setItem('an_stock_private_quicklink_v1',url.href);}catch(_){}
   window.open(url.href,'_blank','noopener,noreferrer');
 }
 fallback.onclick=openFallback;
 nav.append(view,add,fallback);
 const style=document.createElement('style');
 style.textContent='#ans2Overlay[hidden],#ans2Form[hidden],#ans2List[hidden]{display:none!important}#ans2Overlay{position:fixed;inset:0;z-index:100100;background:#142945bd;display:grid;place-items:center;padding:12px}#ans2Pane{width:min(980px,100%);max-height:94dvh;overflow:auto;background:#fff;color:#263a50;border-radius:16px;padding:20px;box-shadow:0 24px 70px #0005;font:14px/1.5 system-ui}#ans2Pane header,#ans2Pane .ans2bar{display:flex;gap:10px;justify-content:space-between;align-items:center;flex-wrap:wrap;margin-bottom:12px}#ans2Pane h2{margin:0;font-size:22px}#ans2Pane button{padding:9px 12px;border-radius:9px;border:1px solid #b9cad9;background:#eef4fa;color:#254764;cursor:pointer;font-weight:700}#ans2Pane .primary{background:#166b55;color:white}#ans2Pane input:not([type=checkbox]),#ans2Pane textarea{padding:9px;border:1px solid #b6c9db;border-radius:8px;width:100%;font:inherit}#ans2Pane textarea{min-height:175px;resize:vertical}#ans2Pane label{display:grid;gap:4px;font-weight:650}#ans2Pane .ans2grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}#ans2Pane .ans2check{display:flex;gap:15px;flex-wrap:wrap;margin:12px 0}#ans2Pane .ans2check label{display:flex;gap:5px;align-items:center}#ans2Pane .ans2check input{width:16px;height:16px}#ans2Rows{display:grid;gap:9px}#ans2Rows article{border:1px solid #dae5ee;background:#fafcff;border-radius:12px;padding:13px}#ans2Rows h3{margin:0;font-size:16px}#ans2Rows .content{white-space:pre-wrap;overflow-wrap:anywhere;margin-top:8px}#ans2Rows .meta,#ans2Hint{font-size:12px;color:#5c7183}#ans2Status{min-height:25px;font-size:13px;white-space:pre-wrap}#ans2Status.error{color:#a42435}@media(max-width:650px){#ans2Pane .ans2grid{grid-template-columns:1fr}}';
 document.head.appendChild(style);
 const overlay=document.createElement('div');overlay.id='ans2Overlay';overlay.hidden=true;
 overlay.innerHTML='<section id="ans2Pane" role="dialog" aria-modal="true" aria-label="Stock Notes"><header><h2>Stock Notes · Analysis</h2><div><button id="ans2New" type="button" class="primary">＋ Add Note</button> <button id="ans2Close" type="button">Close</button></div></header><p id="ans2Hint">Canonical records in SarNi; synchronized display in Analysis. Your Analysis login is used. No Quick Entry PIN.</p><p id="ans2Status" role="status" aria-live="polite"></p><section id="ans2List"><div class="ans2bar"><input id="ans2Search" aria-label="Search Stock Notes" placeholder="Search company, title, body or tags"><button id="ans2Refresh" type="button">Refresh</button></div><div id="ans2Rows"></div></section><form id="ans2Form" hidden><div class="ans2grid"><label>Company name *<input name="companyName" maxlength="130" required></label><label>Symbol<input name="symbol" maxlength="32"></label><label>Title *<input name="title" maxlength="160" required></label><label>Date *<input name="entryDate" type="date" required></label></div><label style="margin-top:12px">Stock Note *<textarea name="body" maxlength="5000" required></textarea></label><label style="margin-top:12px">Tags<input name="tags" maxlength="450"></label><div class="ans2check"><label><input name="important" type="checkbox"> Important</label><label><input name="monthlyHighlight" type="checkbox"> Monthly</label><label><input name="learning" type="checkbox"> Learning</label><label><input name="needsReview" type="checkbox"> Review</label></div><label style="max-width:250px">Review date<input name="reviewDate" type="date"></label><div style="display:flex;gap:8px;margin-top:14px"><button class="primary" id="ans2Save" type="submit">Save Stock Note</button><button type="button" id="ans2Cancel">Cancel</button></div></form></section>';
 document.body.appendChild(overlay);
 const el=id=>document.getElementById(id);
 const form=el('ans2Form'),list=el('ans2List'),status=el('ans2Status'),rows=el('ans2Rows'),search=el('ans2Search'),newBtn=el('ans2New'),saveBtn=el('ans2Save');
 let record=null,key='',generation=0;
 function signedIn(){return typeof state!=='undefined'&&!!state.token;}
 function setStatus(msg,error){status.textContent=msg;status.classList.toggle('error',!!error);}
 function dateNow(){const d=new Date();return String(d.getFullYear())+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
 function nonce(){const bytes=new Uint8Array(24);crypto.getRandomValues(bytes);return Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');}
 function friendly(error){let msg=String(error&&error.message||error||'Unknown error');if(/MODULE_MOVED|separate SarNi dashboard/.test(msg))return 'Backend action is not deployed. Install the AnalysisStockNotesBridgeV2.gs module, enable the actions in Code.gs, and redeploy the SAME Analysis web app. No password reset needed.';return msg;}
 function showingForm(yes){form.hidden=!yes;list.hidden=yes;newBtn.hidden=yes;}
 function open(mode){overlay.hidden=false;setStatus('',false);if(!signedIn()){setStatus('Sign in to Analysis first.',true);return;}if(mode==='new')startNew();else{showingForm(false);void load();}}
 function startNew(){record=null;key=nonce();form.reset();form.elements.entryDate.value=dateNow();form.elements.companyName.required=true;saveBtn.textContent='Save Stock Note';showingForm(true);setStatus('Save directly to SarNi, then mirror to Analysis.');}
 function beginEdit(item){record=item;key=nonce();form.reset();for(const k of ['companyName','symbol','title','body','tags'])form.elements[k].value=String(item[k]||'');form.elements.entryDate.value=item.date||dateNow();form.elements.reviewDate.value=item.reviewDate||'';let tags=String(item.tags||'');form.elements.important.checked=!!item.important;form.elements.monthlyHighlight.checked=tags.includes('monthly-highlight');form.elements.learning.checked=tags.includes('mark-learning');form.elements.needsReview.checked=tags.includes('needs-review');form.elements.companyName.required=!(item.companyName||item.symbol);showingForm(true);saveBtn.textContent='Save Changes';setStatus('Editing existing Stock Note '+item.id); }
 async function load(){if(!signedIn()){setStatus('Sign in to Analysis first.',true);return;}const g=++generation;rows.replaceChildren();setStatus('Loading synchronized notes…');try{const res=await api('anStockNotesList',{query:search.value,limit:100},{retry:false,timeoutMs:30000});if(overlay.hidden||g!==generation)return;const items=Array.isArray(res.items)?res.items:[];setStatus(items.length+' of '+(res.total||0)+' notes.');if(!items.length){const p=document.createElement('p');p.textContent='No notes found.';rows.appendChild(p);}items.forEach(n=>{const card=document.createElement('article'),head=document.createElement('div'),title=document.createElement('h3'),meta=document.createElement('div'),body=document.createElement('div'),actions=document.createElement('div');head.style.cssText='display:flex;justify-content:space-between;align-items:start;gap:8px;flex-wrap:wrap';title.textContent=n.title||'Untitled';meta.className='meta';meta.textContent=[n.companyName,n.symbol,n.date,n.tags].filter(Boolean).join(' · ');body.className='content';body.textContent=n.body||'';const edit=document.createElement('button');edit.textContent='Edit';edit.onclick=()=>beginEdit(n);const archive=document.createElement('button');archive.textContent='Archive';archive.onclick=async()=>{if(!confirm('Archive this Stock Note in SarNi?'))return;archive.disabled=true;setStatus('Archiving…');try{const r=await api('anStockNotesArchive',{id:n.id,expectedUpdatedAt:n.updatedAt},{retry:false});setStatus('Archived, mirror status: '+String(r.sync?.state||'UNKNOWN'));void load();}catch(e){setStatus(friendly(e),true);archive.disabled=false;}};actions.append(edit,archive);head.append(title,actions);card.append(head,meta,body);rows.appendChild(card);});}catch(e){if(g===generation)setStatus('Unable to load Stock Notes: '+friendly(e),true);}}
 form.onsubmit=async event=>{event.preventDefault();if(!signedIn()){setStatus('Analysis session expired.',true);return;}saveBtn.disabled=true;const p={};for(const k of ['companyName','symbol','title','body','tags','entryDate','reviewDate'])p[k]=form.elements[k].value;for(const k of ['important','monthlyHighlight','learning','needsReview'])p[k]=form.elements[k].checked;p.clientKey=key;if(record){p.id=record.id;p.expectedUpdatedAt=record.updatedAt;}setStatus('Saving in SarNi…');try{const r=await api('anStockNotesSave',{note:p},{retry:false,timeoutMs:60000});saveBtn.disabled=false;record=null;key='';showingForm(false);search.value='';await load();setStatus('Saved to SarNi. Analysis sync: '+String(r.sync?.state||'UNVERIFIED'),false);}catch(e){saveBtn.disabled=false;setStatus('Save not confirmed: '+friendly(e)+'. Keep this form open and retry using the same submission key.',true);}};
 view.onclick=()=>open('list');add.onclick=()=>open('new');newBtn.onclick=startNew;
 el('ans2Refresh').onclick=()=>void load();el('ans2Cancel').onclick=()=>{showingForm(false);newBtn.hidden=false;void load();};
 el('ans2Close').onclick=()=>{overlay.hidden=true;generation++;};
 overlay.onclick=e=>{if(e.target===overlay){overlay.hidden=true;generation++;}};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden){overlay.hidden=true;generation++;}});
 let handle;search.oninput=()=>{clearTimeout(handle);handle=setTimeout(()=>void load(),300);};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();