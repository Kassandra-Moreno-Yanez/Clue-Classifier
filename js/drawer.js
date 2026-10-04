// The page around the cabinet: sign-in copy, the front-on drawer of case files, sorting, cabinets and switching between them.
// Page copy follows the drawer's lock state. Reads state only; the cabinet script above is left alone.
(function(){
 const page=document.getElementById('page'),lockCard=document.querySelector('.login'),overlay=document.getElementById('bw');
 const sec=document.getElementById('secnote'),status=document.getElementById('statusText');
 const sf=document.getElementById('statFiles'),sd=document.getElementById('statDocs');
 const copy=document.querySelector('.copy'),lockedCopy=document.querySelector('.locked-copy'),openCopy=document.querySelector('.open-copy');
 // The copy block takes the height of whichever statement is showing, so the cabinet gets the spare room once it is open.
 function size(){
  const cs=getComputedStyle(copy),show=page.classList.contains('archive-open')?openCopy:lockedCopy;
  copy.style.height=(show.offsetHeight+parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom))+'px';
 }
 const pad=n=>String(n).padStart(2,'0');
 const inCab=i=>drawers[0].fs.filter(f=>!f.isAdd&&CM[f.label]&&CM[f.label].cab===i);
 let swapping=false;
 function sync(){
  const open=lockCard.classList.contains('ok');
  page.classList.toggle('archive-open',open);
  lockedCopy.setAttribute('aria-hidden',open);openCopy.setAttribute('aria-hidden',!open);
  sec.textContent=open?'Identity verified':'Protected & encrypted';
  status.textContent=open?'Authorized archive':'Archive secured';
  const list=inCab(curCab);
  let docs=0;list.forEach(f=>{const s=SS[f.label];docs+=s?s.docs.length:(FD[f.label]||GEN).docs.length});
  sf.textContent=pad(list.length);sd.textContent=pad(docs);
  const cb=CABS[curCab],no=pad(curCab+1);
  document.getElementById('cabName').textContent='Cabinet '+no;
  document.getElementById('statWord').textContent=list.length===1?cb.word.replace(/s$/,''):cb.word;
  document.getElementById('deckLabel').textContent=cb.bar;
  document.getElementById('deckWhere').innerHTML='Cabinet '+no+'<span class="lg"> / Drawer 01</span>';
  document.getElementById('grantSmall').textContent='Access granted / Cabinet '+no;
  document.getElementById('grantName').textContent=cb.name;
  renderRail();
  size();
  if(swapping)return; // mid-switch the timeline below decides what is on screen
  // the front-on drawer view takes over as the drawer flings open, and steps aside the moment it is locked
  if(open){
   render();
   if(!page.classList.contains('deck-on')){page.classList.add('deck-on');deck.setAttribute('aria-hidden','false');layout()}
  }else{
   page.classList.remove('deck-on');deck.setAttribute('aria-hidden','true');setActive(null);sortOpen(false);files.classList.remove('quick');naming=false;
  }
 }

 // ---- open drawer: stacked case files that lift on hover ----
 const deck=document.getElementById('deck'),files=document.getElementById('files'),visual=document.querySelector('.visual'),
       sortBtn=document.getElementById('sortBtn'),newCase=document.getElementById('newCase');
 // every way the files can be ordered: [name, short name for phones, what it means, comparison]
 const bare=t=>t.replace(/^(the|an|a)\s+/i,''),RANK=['Active','Under review','Cold case','Closed'],rank=c=>{const i=RANK.indexOf(c.status);return i<0?RANK.length:i};
 const SORTS=[
  ['recently updated','Recent','newest first',(a,b)=>b.upd-a.upd],
  ['case number','Number','lowest first',(a,b)=>a.cf.localeCompare(b.cf)],
  ['title','Title','A to Z',(a,b)=>bare(a.title).localeCompare(bare(b.title))],
  ['case date','Date','oldest first',(a,b)=>(a.iso||'').localeCompare(b.iso||'')],
  ['status','Status','active first',(a,b)=>rank(a)-rank(b)||a.cf.localeCompare(b.cf)]
 ];
 // the back file's tab sits left; the rest cycle across the right so they do not cover the title behind them
 const tabX=(i,small)=>i===0?(small?'5%':'6%'):(small?['70%','68%','69%']:['50%','62%','74%'])[(i-1)%3];
 let sortI=0,sig='',cards=[],active=null;
 let down=46;
 function setActive(c){
  if(active===c)return;active=c;const at=cards.indexOf(c);
  if(c){ // how far the files in front must slide for their tabs to clear this file's last line
   const foot=c.querySelector('.case-foot'),pitch=parseFloat(files.style.getPropertyValue('--pitch'))||80;
   down=Math.max(40,Math.round(foot.offsetTop+foot.offsetHeight+12+30-72-pitch));files.style.setProperty('--down',down+'px');
  }
  cards.forEach((el,i)=>{el.classList.toggle('lift',el===c);el.classList.toggle('down',at>-1&&i>at)});
 }
 function layout(){ // spread the files over the height the drawer has
  const n=cards.length,top=46,front=58,lift=72,lead=lift+14,fv=88;
  visual.style.setProperty('--deck-min',(top+front+lead+fv+Math.max(0,n-1)*56)+'px');
  const well=deck.clientHeight-top-front;
  files.style.setProperty('--n',n);
  files.style.setProperty('--pitch',(n>1?Math.max(56,Math.min(92,(well-lead-fv)/(n-1))):92)+'px');
 }
 function render(){
  const list=inCab(curCab).sort((a,b)=>SORTS[sortI][3](CM[a.label],CM[b.label]));
  const next=wsVer+'|'+curCab+'|'+sortI+'|'+list.map(f=>f.label).join('|');
  if(next===sig)return;sig=next;active=null;
  const small=innerWidth<=640;
  files.textContent='';
  cards=list.map((fo,i)=>{
   const c=CM[fo.label],b=document.createElement('button');
   b.type='button';b.className='case';b.style.setProperty('--i',i);b.style.setProperty('--x',tabX(i,small));
   b.setAttribute('aria-label',`${c.title}, case file ${c.cf}, ${c.status}. ${c.sum} Open dossier.`);
   b.innerHTML=`<span class="case-tab">${esc(c.cf)}</span><span class="case-body"><span class="case-head"><small>Case file ${esc(c.cf)}</small><strong>${esc(c.title)}</strong><i class="dot" style="--dot:${STATUS[c.status]||'#28565D'}"></i></span>`
    +`<span class="case-more"><span class="meta"><span>${esc(c.place)}</span><span>${esc(c.date)}</span></span><span class="sum">${esc(c.sum)}</span></span>`
    +`<span class="case-foot"><span>${esc(c.status)}</span><span class="open">Open dossier <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2l4 4-4 4"/></svg></span></span></span>`;
   fo.card=b;b._fo=fo;files.appendChild(b);return b;
  });
  if(!cards.length){ // an empty cabinet says what it is for and how to start it
   files.innerHTML=`<div class="empty-drawer"><strong>Nothing filed here yet</strong><span>${esc(CABS[curCab].name)} has no case files yet. Add the first one to start it.</span><button class="tool" type="button" id="emptyNew">New case file</button></div>`;
   document.getElementById('emptyNew').onclick=()=>newCase.click();
  }
  layout();
 }

 // ---- cabinets ----
 const rail=document.getElementById('rail'),frame=document.querySelector('.frame'),lockBtn=document.getElementById('btn');
 const still=matchMedia('(prefers-reduced-motion: reduce)').matches,MAXCAB=5;
 let railSig='';
 let naming=false; // the "New cabinet" option turns into a name field
 function renderRail(){
  const next=wsVer+'|'+curCab+'|'+swapping+'|'+naming+'|'+CABS.map((c,i)=>c.name+inCab(i).length).join('|');
  if(next===railSig)return;railSig=next;
  const add=CABS.length>=MAXCAB?'':naming
   ?`<form class="cab-form" id="cabForm" novalidate><label for="cabNameIn">Name the new cabinet</label><input id="cabNameIn" type="text" maxlength="24" placeholder="e.g. Closed cases" autocomplete="off" spellcheck="false"><div class="err" id="cabErr" role="alert"></div><div class="row"><button type="submit" class="mini go">Add</button><button type="button" class="mini" id="cabCancel">Cancel</button></div></form>`
   :`<button type="button" class="cab new" id="newCab"${swapping?' disabled':''}><b>+</b><span>New cabinet</span><small>name it and open it</small></button>`;
  rail.innerHTML='<div class="rail-k">Cabinets</div>'+CABS.map((c,i)=>{const n=inCab(i).length;
    return `<button type="button" class="cab${i===curCab?' on':''}" data-i="${i}"${i===curCab?' aria-current="true"':''}${swapping?' disabled':''}><b>${pad(i+1)}</b><span>${esc(c.name)}</span><small>${n} case file${n===1?'':'s'}</small></button>`}).join('')+add;
 }
 function setNaming(v){naming=v;renderRail();if(v){document.getElementById('cabNameIn').focus({preventScroll:true});rail.scrollLeft=rail.scrollWidth}else{const b=document.getElementById('newCab');if(b&&!swapping)b.focus({preventScroll:true})}}
 rail.addEventListener('click',e=>{
  if(swapping)return;
  if(e.target.closest('#cabCancel')){setNaming(false);return}
  const b=e.target.closest('.cab');if(!b)return;
  if(b.id==='newCab'){setNaming(true);return}
  naming=false;switchTo(+b.dataset.i);renderRail();
 });
 rail.addEventListener('keydown',e=>{if(e.key==='Escape'&&naming){e.stopPropagation();setNaming(false)}});
 rail.addEventListener('submit',e=>{
  e.preventDefault();if(swapping)return;
  const input=document.getElementById('cabNameIn'),err=document.getElementById('cabErr'),name=input.value.trim().replace(/\s+/g,' ');
  if(!name){err.textContent='Give the cabinet a name.';input.focus();return}
  if(CABS.some(c=>c.name.toLowerCase()===name.toLowerCase())){err.textContent='A cabinet with that name already exists.';input.focus();return}
  // the cabinet takes the name as typed; new files in it start as Closed or Cold case only if the name says so
  CABS.push({name,word:'files',bar:name,status:/closed/i.test(name)?'Closed':/cold/i.test(name)?'Cold case':'Active'});
  naming=false;switchTo(CABS.length-1);renderRail();
 });
 function switchTo(i){
  if(swapping||i===curCab||bookOpen||busy)return;
  const show=()=>{curCab=i;sig='';render();sync()};
  if(still){show();return}
  const later=(ms,fn)=>setTimeout(fn,ms);
  swapping=true;setActive(null);page.classList.add('swapping');frame.inert=true;lockBtn.disabled=true;renderRail();
  // 1. the view eases back out of the drawer, which shuts as the cabinet comes into view
  page.classList.remove('deck-on');deck.setAttribute('aria-hidden','true');
  later(320,()=>fling(drawers[0]));
  // 2. the two cabinets trade places together: a still copy of this one leaves to the left
  //    while the real one, already relabelled and refilled, comes in from the right
  later(980,()=>{
   const ghost=frame.cloneNode(true);ghost.classList.add('ghost');ghost.inert=true;ghost.setAttribute('aria-hidden','true');frame.after(ghost);
   show();page.classList.add('cab-in');
   // 3. its drawer opens as it settles. This waits for the slide to finish and for one clean frame after it:
   //    a transition will not start on a property that an animation was still driving in the same frame.
   let opened=false;
   const open=()=>{
    if(opened)return;opened=true;frame.removeEventListener('animationend',onEnd);
    ghost.remove();page.classList.remove('cab-in');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
     fling(drawers[0]);page.classList.add('deck-on');deck.setAttribute('aria-hidden','false');layout();
     later(1350,()=>{swapping=false;page.classList.remove('swapping');frame.inert=false;lockBtn.disabled=false;railSig='';renderRail()});
    }));
   };
   const onEnd=e=>{if(e.target===frame&&e.animationName==='cab-in')open()};
   frame.addEventListener('animationend',onEnd);later(1300,open); // the timer is only a fallback
  });
 }
 // Which file is the pointer on? Worked out from the stack geometry rather than from whatever element is on top,
 // so a lifted file keeps hold of the pointer and moving up or down steps through the files one at a time.
 function pick(y){
  const n=cards.length;if(!n)return -1;
  const pitch=parseFloat(files.style.getPropertyValue('--pitch'))||80,lead=86,lift=72,tab=30;
  const T=i=>lead+i*pitch,rest=()=>y<T(0)-tab?-1:Math.min(n-1,Math.max(0,Math.floor((y-lead)/pitch)));
  const a=cards.indexOf(active);
  if(a<0)return rest();
  const top=T(a)-lift,bottom=a<n-1?T(a+1)+down:Infinity;
  if(y>=top&&y<bottom)return a;
  if(y>=bottom)return Math.min(n-1,a+1+Math.floor((y-bottom)/pitch));
  if(a===0)return y<top-tab?-1:0;
  return y>=T(a-1)-lift?a-1:rest();
 }
 files.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch')return;
  const tab=!active&&e.target.closest('.case-tab'); // pointing at a tab picks that file
  if(tab){setActive(tab.parentNode);return}
  const i=pick(e.clientY-files.getBoundingClientRect().top);setActive(i<0?null:cards[i]);
 });
 let lastPointer='mouse';
 deck.addEventListener('pointerdown',e=>{lastPointer=e.pointerType||'mouse'});
 files.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')setActive(null)});
 files.addEventListener('focusin',e=>{const c=e.target.closest('.case');if(c&&c.matches(':focus-visible'))setActive(c)});
 deck.addEventListener('click',e=>{
  const c=e.target.closest('.case');
  if(!c){if(!e.target.closest('button'))setActive(null);return}
  if(e.detail===0){openBook(c._fo);return}                                  // keyboard: Enter opens the focused file
  if(lastPointer!=='touch'){if(active)openBook(active._fo);else setActive(c);return} // mouse: the lifted file is the one being pointed at
  if(active!==c){setActive(c);return}                                       // touch: first tap lifts the file, second opens it
  openBook(c._fo);
 });
 // the sort control opens a menu listing every option, with the current one marked
 const sortMenu=document.getElementById('sortMenu');
 function drawSortMenu(){
  sortMenu.innerHTML='<div class="k">Sort case files by</div>'+SORTS.map((o,i)=>`<button type="button" role="menuitemradio" aria-checked="${i===sortI}" data-i="${i}">${o[0]}<small>${o[2]}</small></button>`).join('');
 }
 function sortOpen(v){
  if(v)drawSortMenu();
  sortMenu.hidden=!v;sortBtn.setAttribute('aria-expanded',v);
  if(v)sortMenu.querySelector('[aria-checked=true]').focus({preventScroll:true});
 }
 sortBtn.onclick=()=>sortOpen(sortMenu.hidden);
 sortMenu.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  sortI=+b.dataset.i;
  document.getElementById('sortName').textContent=SORTS[sortI][0];document.getElementById('sortShort').textContent=SORTS[sortI][1];
  sortOpen(false);sortBtn.focus({preventScroll:true});
  files.classList.add('quick');render(); // re-deal the files in the new order without the opening pause
 });
 sortMenu.addEventListener('keydown',e=>{
  const items=[...sortMenu.querySelectorAll('button')],at=items.indexOf(document.activeElement);
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){items[(at+(e.key==='ArrowDown'?1:items.length-1))%items.length].focus();e.preventDefault()}
  else if(e.key==='Home'){items[0].focus();e.preventDefault()}
  else if(e.key==='End'){items[items.length-1].focus();e.preventDefault()}
  else if(e.key==='Escape'){e.stopPropagation();sortOpen(false);sortBtn.focus({preventScroll:true})}
  else if(e.key==='Tab')sortOpen(false);
 });
 document.addEventListener('pointerdown',e=>{if(!sortMenu.hidden&&!e.target.closest('.sort-wrap'))sortOpen(false)});
 newCase.onclick=()=>{const add=drawers[0].fs.find(f=>f.isAdd);add.card=newCase;openBook(add)};
 document.getElementById('deckPull').onclick=()=>document.getElementById('btn').click();
 if(window.ResizeObserver)new ResizeObserver(layout).observe(deck);
 addEventListener('resize',()=>{sig='';if(lockCard.classList.contains('ok'))render()});
 new MutationObserver(sync).observe(lockCard,{attributes:true,attributeFilter:['class']});
 new MutationObserver(sync).observe(overlay,{attributes:true,attributeFilter:['class']});
 // Focusing a field must never scroll the clipped cabinet frame (older browsers without overflow:clip)
 [page,document.querySelector('.stagewrap')].forEach(el=>el.addEventListener('scroll',()=>{el.scrollTop=0;el.scrollLeft=0}));
 // Sign in / Create account tabs on the drawer face
 const tabIn=document.getElementById('tabIn'),tabNew=document.getElementById('tabNew'),nameRow=lockCard.querySelector('.f-name');
 function setMode(create){
  lockCard.classList.toggle('create',create);nameRow.hidden=!create;
  tabIn.classList.toggle('active',!create);tabNew.classList.toggle('active',create);
  tabIn.setAttribute('aria-selected',!create);tabNew.setAttribute('aria-selected',create);
  document.getElementById('loginTitle').textContent=create?'Open a new archive':'Unlock your archive';
  document.getElementById('goText').textContent=create?'Create cabinet':'Unlock drawer';
 }
 tabIn.onclick=()=>setMode(false);tabNew.onclick=()=>setMode(true);
 if(window.ResizeObserver){const ro=new ResizeObserver(size);ro.observe(lockedCopy);ro.observe(openCopy)}
 addEventListener('resize',size);
 sync();
})();
