/* Stock Notes shortcut: use the proven SarNi Quick Entry route.
   Private link is never committed into the public GitHub source. */
(function(){
'use strict';
function init(){
 const nav=document.querySelector('.side-nav');
 if(!nav||document.getElementById('analysisStockNotesBtn'))return;
 const storeKey='analysis_sarni_stock_quick_link_session_v1';
 function getLink(){try{return sessionStorage.getItem(storeKey)||'';}catch(_){return '';}}
 function setLink(value){try{sessionStorage.setItem(storeKey,value);}catch(_){}}
 function clearLink(){try{sessionStorage.removeItem(storeKey);}catch(_){}}
 function normalize(raw){
  let url;try{url=new URL(String(raw||'').trim());}catch(_){return null;}
  if(url.protocol!=='https:'||url.hostname!=='saradasutar.github.io'||!/^\/SarNi\/q\/?(?:index\.html)?$/i.test(url.pathname))return null;
  const key=url.searchParams.get('k')||url.searchParams.get('key');
  if(!key||!/^[a-zA-Z0-9_-]{12,200}$/.test(key))return null;
  url.hash='stock';return url.href;
 }
 function promptLink(){
  const answer=window.prompt('Paste your existing private SarNi Quick Entry URL (…/SarNi/q/?k=…).\\nIt will be kept only in this browser tab session, not in GitHub or the Analysis backend.\\nCancel to leave unchanged.',getLink());
  if(answer===null)return null;
  const link=normalize(answer);
  if(!link){window.alert('Invalid link. Paste the complete private SarNi Quick Entry URL from your SarNi dashboard.');return null;}
  setLink(link);return link;
 }
 function openStock(){
  const link=normalize(getLink())||promptLink();if(!link)return;
  const tab=window.open(link,'_blank','noopener,noreferrer');
  if(!tab){window.alert('Your browser blocked the new tab. Please allow pop-ups for this dashboard and try again.');}
 }
 const view=document.createElement('button');view.type='button';view.className='nav-item';view.id='analysisStockNotesBtn';view.textContent='▤ Stock Notes';view.title='Open the existing SarNi Stock Note tab and recent entries';
 const add=document.createElement('button');add.type='button';add.className='nav-item';add.id='analysisAddStockNote';add.textContent='＋ Add Stock Note';add.title='Open the existing working SarNi Stock Note entry form';
 const settings=document.createElement('button');settings.type='button';settings.className='nav-item';settings.id='analysisStockLinkSettings';settings.textContent='⚙ Stock Note link';settings.title='Replace or clear the private link stored in this browser tab';
 view.addEventListener('click',openStock);add.addEventListener('click',openStock);
 settings.addEventListener('click',()=>{
  const choice=window.prompt('Stock Note link settings:\\n1 = Paste or replace private link\\n2 = Clear link from this browser tab\\nCancel = no changes','1');
  if(choice==='1')promptLink();
  else if(choice==='2'){clearLink();window.alert('Private link cleared from this browser tab.');}
 });
 nav.append(view,add,settings);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();