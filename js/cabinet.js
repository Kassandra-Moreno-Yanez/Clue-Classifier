// The 3D cabinet, sign-in, accounts, case data and the folder (dossier) book.
// Loaded first: the other two scripts use the globals defined here.
const W=document.getElementById('world'),ST=document.getElementById('stage');
function face(p,w,h,tf,bg,extra){const e=document.createElement('div');e.className='f';
 e.style.cssText=`width:${w}px;height:${h}px;left:${-w/2}px;top:${-h/2}px;background:${bg};transform:${tf};${extra||''}`;p.appendChild(e);return e}
function box(p,w,h,d,c){ // 6-face box centred at origin
 face(p,w,h,`translateZ(${d/2}px)`,c);face(p,w,h,`rotateY(180deg) translateZ(${d/2}px)`,c);
 face(p,d,h,`rotateY(90deg) translateZ(${w/2}px)`,c);face(p,d,h,`rotateY(-90deg) translateZ(${w/2}px)`,c);
 face(p,w,d,`rotateX(90deg) translateZ(${h/2}px)`,c);face(p,w,d,`rotateX(-90deg) translateZ(${h/2}px)`,c)}
const cab=document.createElement('div');cab.className='d3';W.appendChild(cab);
// body shell (open at front; dark cavity behind drawers)
const BW=240,BH=150,BD=300;
face(cab,BW,BH,`translateZ(${-BD/2}px)`,'#0f3035');
face(cab,BD,BH,`rotateY(90deg) translateZ(${BW/2}px)`,'linear-gradient(90deg,#28565D,#1b444b)');
face(cab,BD,BH,`rotateY(-90deg) translateZ(${BW/2}px)`,'#1b444b');
face(cab,BW,BD,`rotateX(90deg) translateZ(${BH/2}px)`,'linear-gradient(#2B6E7C,#27616d)');
face(cab,BW,BD,`rotateX(-90deg) translateZ(${BH/2}px)`,'#0b2428');
face(cab,BW,BH,`translateZ(${BD/2-2}px)`,'#071516');
// ---- case files in the drawer (back of the drawer first) ----
const CASES=[
 {cf:'CF-0712',title:'The Ashcroft Affair',place:'Ashcroft House, Belgravia',date:'3 March 1958',iso:'1958-03-03',status:'Active',upd:4,
  sum:'An heiress, an altered will, and a guest list with one name too many.',
  long:'An heiress, an altered will, and a guest list with one name too many. The will was changed nine days before the dinner, and nobody at the table admits to inviting the eleventh guest.'},
 {cf:'CF-0428',title:'Midnight at Bellamy',place:'Hotel Bellamy, Mayfair',date:'12 November 1961',iso:'1961-11-12',status:'Under review',upd:3,
  sum:'A night porter’s ledger stops at twelve, and room 9 was never checked out.',
  long:'A night porter’s ledger stops at twelve, and room 9 was never checked out. The key was returned to the desk; the guest was not seen leaving.'},
 {cf:'CF-1105',title:'The Hawthorne Letters',place:'Hawthorne & Sons, Fleet Street',date:'5 June 1967',iso:'1967-06-05',status:'Closed',upd:2,
  sum:'Six unsigned letters, one typewriter, and a postmark that cannot be right.',
  long:'Six unsigned letters, one typewriter, and a postmark that cannot be right. The typeface was matched to a machine in the firm’s own post room.'},
 {cf:'CF-0821',title:'A Study in Vermilion',place:'Marlowe Gallery, Chelsea',date:'21 August 1963',iso:'1963-08-21',status:'Cold case',upd:1,
  sum:'A vanished portrait, a false provenance, and red pigment where it should not be.',
  long:'A vanished portrait, a false provenance, and red pigment where it should not be. The frame was found re-hung, empty, the morning after the private view.'}
];
const CM={};CASES.forEach(c=>{c.cab=0;CM[c.title]=c});
// Evidence on each case's pin board. Every piece carries the people, places and objects found in it, which is
// what the connections graph is built from. This is sample data standing in for extracted evidence.
const EVID={
'CF-0712':[
 {id:'E1',kind:'Witness statement',date:'4 March 1958',title:'Statement of the housekeeper',note:'Ten places were laid. An eleventh card was added to the table after the list was typed.',people:['Mrs Dunmore','Eleanor Ashcroft','Julian Vane'],places:['Ashcroft House'],objects:['Guest list','Place cards']},
 {id:'E2',kind:'Document',date:'22 February 1958',title:'Will, as altered',note:'The alteration is initialled but the initials are not the solicitor’s.',people:['Eleanor Ashcroft','Harold Pym'],places:['Pym & Lowe, Lincoln’s Inn'],objects:['Altered will']},
 {id:'E3',kind:'Document',date:'3 March 1958',title:'Guest list for the dinner',note:'Typed list of ten names, with one more added in ink.',people:['Eleanor Ashcroft','Julian Vane'],places:['Ashcroft House'],objects:['Guest list']},
 {id:'E4',kind:'Correspondence',date:'24 February 1958',title:'Letter from the solicitor',note:'Pym writes that he was not present when the will was changed.',people:['Harold Pym','Eleanor Ashcroft'],places:['Pym & Lowe, Lincoln’s Inn'],objects:['Altered will']},
 {id:'E5',kind:'Photograph',date:'3 March 1958',title:'Photograph of the dining table',note:'Eleven place cards are visible; one is in a different hand.',people:['Julian Vane'],places:['Ashcroft House'],objects:['Place cards']},
 {id:'E6',kind:'Witness statement',date:'6 March 1958',title:'Statement of Julian Vane',note:'Says he was invited by telephone and never saw a written list.',people:['Julian Vane','Eleanor Ashcroft','Harold Pym'],places:['Ashcroft House'],objects:[]}],
'CF-0428':[
 {id:'E1',kind:'Document',date:'12 November 1961',title:'Night ledger, pages 40 to 41',note:'Entries stop at midnight and resume at ten past six.',people:['Arthur Coyle'],places:['Front desk'],objects:['Night ledger']},
 {id:'E2',kind:'Witness statement',date:'13 November 1961',title:'Statement of the night porter',note:'Coyle says the key to room 9 was on the rack when he came back to the desk.',people:['Arthur Coyle','Lena Hart'],places:['Front desk','Room 9'],objects:['Room 9 key']},
 {id:'E3',kind:'Witness statement',date:'14 November 1961',title:'Statement of the relief porter',note:'Reddy covered the desk from midnight and made no entries.',people:['Tom Reddy','Arthur Coyle'],places:['Front desk'],objects:['Night ledger']},
 {id:'E4',kind:'Document',date:'11 November 1961',title:'Laundry ticket for room 9',note:'Collected but never returned to the room.',people:['Lena Hart'],places:['Room 9'],objects:['Laundry ticket']},
 {id:'E5',kind:'Photograph',date:'13 November 1961',title:'Photograph of the key rack',note:'Hook 9 holds a key with a newer tag than the others.',people:[],places:['Front desk'],objects:['Room 9 key']},
 {id:'E6',kind:'Correspondence',date:'20 November 1961',title:'Letter from the manager',note:'Confirms Miss Hart paid a week in advance and left no forwarding address.',people:['Mrs Bell','Lena Hart'],places:['Hotel Bellamy'],objects:[]}],
'CF-1105':[
 {id:'E1',kind:'Document',date:'5 June 1967',title:'The six unsigned letters',note:'All addressed to the senior partner, all on the firm’s own paper.',people:['Edwin Hawthorne'],places:['Hawthorne & Sons'],objects:['Unsigned letters']},
 {id:'E2',kind:'Record',date:'19 June 1967',title:'Typeface comparison report',note:'A worn lower-case e matches the machine kept in the post room.',people:['Peter Nash'],places:['Post room'],objects:['Typewriter','Unsigned letters']},
 {id:'E3',kind:'Photograph',date:'7 June 1967',title:'Envelope and postmark',note:'Postmarked on a day the sorting office was closed.',people:[],places:['Mount Pleasant sorting office'],objects:['Postmarked envelope','Unsigned letters']},
 {id:'E4',kind:'Witness statement',date:'9 June 1967',title:'Statement of the post-room clerk',note:'Nash says the typewriter is used by anyone who passes.',people:['Peter Nash','Edwin Hawthorne'],places:['Post room'],objects:['Typewriter']},
 {id:'E5',kind:'Witness statement',date:'9 June 1967',title:'Statement of the typist',note:'Miss Calder saw Nash typing after hours twice that month.',people:['Ruth Calder','Peter Nash'],places:['Hawthorne & Sons'],objects:['Typewriter']},
 {id:'E6',kind:'Correspondence',date:'27 June 1967',title:'Reply from the Post Office',note:'The date stamp in question was reported missing in May.',people:[],places:['Mount Pleasant sorting office'],objects:['Postmarked envelope']}],
'CF-0821':[
 {id:'E1',kind:'Document',date:'2 August 1963',title:'Provenance papers',note:'Two of the three previous owners cannot be traced.',people:['Mr Lisle','Clara Marlowe'],places:['Marlowe Gallery'],objects:['Provenance papers','The portrait']},
 {id:'E2',kind:'Record',date:'30 August 1963',title:'Pigment analysis',note:'The red in the sitter’s collar is a modern vermilion.',people:['Anton Reyes'],places:['Restorer’s studio'],objects:['Vermilion pigment','The portrait']},
 {id:'E3',kind:'Photograph',date:'21 August 1963',title:'Photograph of the empty frame',note:'The frame was re-hung on its own hooks.',people:[],places:['Marlowe Gallery'],objects:['Empty frame']},
 {id:'E4',kind:'Witness statement',date:'22 August 1963',title:'Statement of the gallery owner',note:'Mrs Marlowe locked up herself after the private view.',people:['Clara Marlowe','Anton Reyes'],places:['Marlowe Gallery'],objects:['Empty frame','The portrait']},
 {id:'E5',kind:'Document',date:'20 August 1963',title:'Guest book, private view',note:'Lisle signed in twice.',people:['Mr Lisle','Anton Reyes','Clara Marlowe'],places:['Marlowe Gallery'],objects:[]},
 {id:'E6',kind:'Record',date:'12 July 1963',title:'Invoice from the restorer',note:'For cleaning and “minor retouching”, paid by Lisle.',people:['Anton Reyes','Mr Lisle'],places:['Restorer’s studio'],objects:['Vermilion pigment']}]
};
// Cross-references: two things tied together by reading one piece of evidence against another.
const XREF={
'CF-0712':[{a:'Julian Vane',b:'Altered will',ev:['E2','E6'],note:'The initials on the alteration match the signature on Vane’s statement.'}],
'CF-0428':[{a:'Tom Reddy',b:'Room 9 key',ev:['E3','E5'],note:'The new key tag appears during the hours Reddy covered the desk.'}],
'CF-1105':[{a:'Peter Nash',b:'Postmarked envelope',ev:['E4','E6'],note:'The date stamp went missing the month Nash began handling the outgoing post.'}],
'CF-0821':[{a:'Mr Lisle',b:'Vermilion pigment',ev:['E1','E6'],note:'Lisle paid for the retouching weeks before he supplied the provenance.'}]
};
// cabinets: each case file belongs to one. New cabinets are made for closed cases for now.
const CABS=[{name:'Active cases',word:'active files',bar:'Active case files',status:'Active'}];
let curCab=0;
const STATUS={'Active':'#76190E','Under review':'#28565D','Closed':'#071516','Cold case':'#e6eeec'};
let cfSeq=1105;const nextCf=()=>'CF-'+String(++cfSeq).padStart(4,'0');
const FCOL='#8fbcc1'; // one folder stock for every case file
const inkFor=c=>'#071516';
const names=['TAXES','LEGAL','HOME','AUTO','MEDICAL','BANK','TRAVEL','NOTES'];
const drawers=[];
cab.querySelectorAll(':scope>.f').forEach(e=>{e.style.pointerEvents='none'}); // cabinet shell never needs the mouse; it was shadowing the back folder
// trim from the design: an overhanging top lip, a plinth and two feet
function trim(w,h,d,y,x,z,front,top){
 const t=document.createElement('div');t.className='d3';t.style.transform=`translate3d(${x}px,${y}px,${z}px)`;cab.appendChild(t);
 box(t,w,h,d,'#17393f');const fc=t.children;fc[0].style.background=front;fc[4].style.background=top;
 [...fc].forEach(e=>{e.style.pointerEvents='none'});return t}
trim(BW+10,7,BD+8,-BH/2-3.5,0,0,'linear-gradient(#3b7c88,#28565D)','linear-gradient(#2f6772,#2B6E7C)')
 .children[0].insertAdjacentHTML('beforeend','<i style="position:absolute;left:15%;right:15%;top:1.5px;height:1px;background:linear-gradient(90deg,transparent,#d3e3e366,transparent)"></i>');
trim(BW+12,6,BD+6,BH/2+3,0,0,'linear-gradient(#23545c,#0d2a2f)','#1b444b');
trim(24,8,BD-16,BH/2+10,-(BW/2-18),0,'#0b2226','#0b2226');
trim(24,8,BD-16,BH/2+10,BW/2-18,0,'#0b2226','#0b2226');
[0].forEach((y,di)=>{
 const g=document.createElement('div');g.className='d3';g.style.transform=`translateY(${y}px)`;cab.appendChild(g);
 const inner=document.createElement('div');inner.className='d3';g.appendChild(inner);
 const TW=212,TH=110,TD=270,z0=BD/2-TD/2; // tray centre z when closed
 const tray=document.createElement('div');tray.className='d3';tray.style.transform=`translateZ(${z0-6}px)`;inner.appendChild(tray);
 const shade='#173c42';
 face(tray,TW,TH,`translateZ(${-TD/2}px)`,shade);
 face(tray,TD,TH,`rotateY(90deg) translateZ(${TW/2}px)`,'#235058');
 face(tray,TD,TH,`rotateY(-90deg) translateZ(${TW/2}px)`,'#1b444b');
 face(tray,TW,TD,`rotateX(-90deg) translateZ(${TH/2}px)`,'#0f2e33');
 tray.querySelectorAll(':scope>.f').forEach(e=>{e.style.pointerEvents='none'});
 // front panel
 const fp=document.createElement('div');fp.className='d3';fp.style.transform=`translateZ(${BD/2}px)`;inner.appendChild(fp);
 box(fp,BW-10,140,6,'#1e474e');
 const pull=face(fp,52,10,'translateZ(6px) translateY(60px)','linear-gradient(#0d2a2f,#071516)','box-sizing:border-box;border:2px solid #7fb8c0;border-top:3px solid #2B6E7C;border-radius:1.5px 1.5px 8px 8px;box-shadow:0 2px 3px #000a');
 pull.innerHTML='<i style="position:absolute;left:7px;right:7px;bottom:1px;height:1px;background:linear-gradient(90deg,#2B6E7C,#d3e3e3,#2B6E7C)"></i>';
 // the whole drawer face is the sign-in panel: laid out at 920x560 and shown at quarter scale
 const card=face(fp,920,560,'translateZ(3.3px) scale(.25)','radial-gradient(circle at 35% 15%,rgba(255,255,255,.08),transparent 36%),linear-gradient(155deg,#34707b,#28565D 48%,#1e474e)','');
 card.classList.add('login');
 card.innerHTML='<div class="in"><div class="drawer-login-heading"><span class="ttl"><span class="led"></span><span id="ttl">SECURE ACCESS</span></span><strong id="loginTitle">Unlock your archive</strong></div>'
  +'<div class="auth-tabs" role="tablist" aria-label="Account access"><button id="tabIn" class="active" role="tab" aria-selected="true" type="button">Sign in</button><button id="tabNew" role="tab" aria-selected="false" type="button">Create account</button></div>'
  +'<div class="drawer-form">'
  +'<label class="f-name" hidden><span>Full name</span><input id="nam" type="text" placeholder="Your full name" autocomplete="off" spellcheck="false"></label>'
  +'<label class="f-mail"><span>Email address</span><input id="usr" type="email" placeholder="name@organization.com" autocomplete="off" spellcheck="false"></label>'
  +'<label class="f-pass"><span>Password</span><input id="pwd" type="password" placeholder="At least 8 characters" autocomplete="off"></label>'
  +'<button class="go" id="go" type="button"><span id="goText">Unlock drawer</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M14 7l5 5-5 5"/></svg></button>'
  +'</div></div>'
  +'<div class="grant"><small id="grantSmall">Access granted / Cabinet 01</small><strong id="grantName">Active cases</strong></div>';
 // folders (front of the drawer = slot 0; the "+ New folder" folder is always last, at the back)
 const fs=[];let made=0;
 function relayout(snap){
  const sp=Math.min(28,(TD-60)/Math.max(1,fs.length));
  fs.forEach((fo,k)=>{fo.k=k;fo.zt=z0+TD/2-26-k*sp;if(snap)fo.z=fo.zt});
 }
 function makeFolder(spec,front){
  const f=document.createElement('div');f.className='d3 fold';
  const pivot=document.createElement('div');pivot.className='d3';f.appendChild(pivot);
  const lifter=document.createElement('div');lifter.className='d3';pivot.appendChild(lifter); // lifter moves up on hover; pivot only tilts
  const c=spec.color,white=spec.white,n=spec.n,ink=inkFor(c);
  const bg=spec.isAdd?'linear-gradient(#c9dbda,#c9dbda 75%,#0000001c)':`linear-gradient(${c},${c} 75%,#0000001c)`;
  const sheet=face(lifter,204,90,'translateY(-45px)',bg,'border-radius:2px 2px 0 0;box-shadow:inset 0 0 0 1px #0002'+(spec.isAdd?';border:2px dashed #2B6E7C;box-sizing:border-box':''));
  const tab=document.createElement('div');
  tab.style.cssText=white
   ?`position:absolute;top:-16px;right:${spec.isAdd?14:10+(n*37)%50}px;width:${spec.isAdd?98:78}px;height:18px;background:#e6eeec;border:1px solid #0003;font:600 10px var(--sans);letter-spacing:.03em;color:#071516;text-align:center;line-height:17px;box-sizing:border-box;padding:0 4px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis`
   :`position:absolute;top:-16px;left:${4+(n*29)%44}px;width:118px;height:18px;background:${c};border-radius:3px 3px 0 0;font:600 10px var(--sans);letter-spacing:.03em;color:${ink};text-align:center;line-height:19px;box-shadow:inset 0 0 0 1px #0002;overflow:hidden;white-space:nowrap`;
  tab.textContent=spec.tab||spec.label;sheet.appendChild(tab);
  face(lifter,204,90,'translateY(-45px) translateZ(-3px)','#0000001a');
  face(pivot,204,90,'translateY(-45px) translateZ(-1px)','transparent',''); // hit area: tilts with the folder but never lifts, so hovering can't flicker
  inner.appendChild(f);
  const fo={pivot,lifter,sheet,el:f,t:0,v:0,k:0,l:0,lv:0,z:0,zt:0,zs:-999,hover:false,hv:false,label:spec.label,tab:spec.tab,color:c,ink,white,isAdd:!!spec.isAdd};
  f.addEventListener('pointerenter',()=>{fo.hover=true});f.addEventListener('pointerleave',()=>{fo.hover=false});
  f.addEventListener('click',e=>{
   e.stopPropagation(); // clicking a folder must not close the drawer
   if(locked||drawers[0].pos<0.55)return;
   openBook(fo);
  });
  if(front)fs.unshift(fo);else fs.push(fo);
  return fo;
 }
 [...CASES].reverse().forEach((c,i)=>makeFolder({label:c.title,tab:c.cf,color:FCOL,white:false,n:i}));
 makeFolder({label:'+ New case file',color:'#a9c9cc',white:true,isAdd:true,n:99});
 relayout(true);
 function addFolder(label){ // new folders drop in at the front of the drawer
  const n=CASES.length+made++;
  const fo=makeFolder({label,tab:CM[label]&&CM[label].cf,color:FCOL,white:false,n},true);
  relayout(false);fo.z=fo.zt;fo.l=2.4;
  return fo;
 }
 drawers.push({g,inner,pos:0,vel:0,target:0,prevVel:0,fs,addFolder});
});
// physics
const PULL=240,K=40,C=8; // a softer spring: the drawer takes about twice as long to reach full travel
let wasLive=false,viewS=0,S=1,jolt=0,joltV=0,last=performance.now();
function fling(d){
 const opening=d.target===0;d.target=opening?1:0;
 d.vel+=opening?4:-4; // the fling impulse
}
function step(dt){
 drawers.forEach(d=>{
  const a=(d.target-d.pos)*K-d.vel*C;d.vel+=a*dt;d.pos+=d.vel*dt;
  if(d.pos>1){d.pos=1;if(d.vel>0.6)joltV+=d.vel*40;d.vel=-d.vel*0.38}
  if(d.pos<0){d.pos=0;if(d.vel<-0.6)joltV-=d.vel*-40;d.vel=-d.vel*0.3}
  const acc=(d.vel-d.prevVel)/dt;d.prevVel=d.vel;
  d.inner.style.transform=`translateZ(${d.pos*PULL}px)`;
  d.fs.forEach(f=>{ // folders lag behind drawer motion (inertia)
   const want=Math.max(-8,Math.min(24,5+d.pos*14+Math.max(-9,Math.min(9,acc*0.004))+(f.k%2?1:-1)*Math.abs(d.vel)*0.5));
   const fa=(want-f.t)*Math.max(90,260-f.k*14)-f.v*(7+f.k*.4);f.v+=fa*dt;f.t+=f.v*dt;
   const live=!locked&&d.pos>0.55&&!bookOpen;if(live!==wasLive){wasLive=live;W.classList.toggle('live',live)}
   const lt=(f.hover&&live)?1:0; // hover lift
   const la=(lt-f.l)*380-f.lv*24;f.lv+=la*dt;f.l+=f.lv*dt;
   f.pivot.style.transform=`rotateX(${f.t}deg)`;f.lifter.style.transform=`translateY(${-f.l*34}px) translateZ(${f.l*28}px)`;
   const hv=f.l>0.35;if(hv!==f.hv){f.hv=hv;f.sheet.classList.toggle('hov',hv)}
   f.z+=(f.zt-f.z)*Math.min(1,dt*9);if(Math.abs(f.z-f.zs)>.01){f.zs=f.z;f.el.style.transform=`translate3d(0,52px,${f.z}px)`}
  });
 });
 const vt=Math.max(...drawers.map(d=>d.pos));viewS+=(vt-viewS)*Math.min(1,dt*5);const vv=Math.max(0,Math.min(1,viewS));
 const P=1100,an=-8-vv*10,ar=an*Math.PI/180,ca=Math.cos(ar),sa=Math.sin(ar);
 const y0=-90,y1=90,z0=-150,z1=156,xs=[],ys=[]; // frame the closed cabinet; the opening drawer is allowed to come past the frame
 for(const x of [-125,125])for(const y of [y0,y1])for(const z of [z0,z1]){const yy=y*ca-z*sa,zz=y*sa+z*ca,k=P/(P-zz);xs.push(x*k);ys.push(yy*k)}
 const mnx=Math.min(...xs),mxx=Math.max(...xs),mny=Math.min(...ys),mxy=Math.max(...ys);
 const sc=Math.min(ST.clientWidth*.94/(mxx-mnx),ST.clientHeight*.94/(mxy-mny),3.2);
 ST.style.transform=`translate(${-(mnx+mxx)/2*sc}px,${-(mny+mxy)/2*sc}px) scale(${sc})`;
 W.style.transform=`rotateX(${an}deg)`;
 const ja=-joltV*0+(-jolt*220)-joltV*9;joltV+=ja*dt;jolt+=joltV*dt;
 cab.style.transform=`rotateZ(${jolt*0.02}deg) translateZ(${jolt*-0.04}px)`;
}
function loop(n){let dt=Math.min(.032,(n-last)/1000);last=n;
 const sub=4;for(let i=0;i<sub;i++)step(dt/sub);requestAnimationFrame(loop)}
requestAnimationFrame(loop);
// ---- lock logic ----
// Set CREDS to require a specific sign-in, e.g. {user:'name@organization.com',pass:'filing-2026'}.
// Leave as null to accept any valid-looking email and a password of 8+ characters.
const CREDS=null;
const card=document.querySelector('.login'),usr=document.getElementById('usr'),pwd=document.getElementById('pwd'),nam=document.getElementById('nam'),
      go=document.getElementById('go'),ttl=document.getElementById('ttl'),btn=document.getElementById('btn');
let locked=true,badTimer=0;
function deny(msg){
 ttl.textContent=msg;card.classList.remove('bad');void card.offsetWidth;card.classList.add('bad');
 clearTimeout(badTimer);badTimer=setTimeout(()=>{card.classList.remove('bad');ttl.textContent='SECURE ACCESS'},1600);
}
function setLocked(v){
 locked=v;card.classList.toggle('ok',!v);
 card.querySelector('.led').style.cssText=v?'':'background:#7fb8c0;box-shadow:0 0 6px #7fb8c0';
 if(v){usr.value='';pwd.value='';nam.value=''}
 btn.textContent=v?'Sign in on the drawer':'Lock cabinet';
}
function tryUnlock(){
 const u=usr.value.trim(),p=pwd.value,creating=card.classList.contains('create');
 if(creating&&!nam.value.trim()){deny('ENTER YOUR NAME');nam.focus();return}
 if(!u){deny('ENTER YOUR EMAIL');usr.focus();return}
 if(!/^\S+@\S+\.\S+$/.test(u)){deny('CHECK THE EMAIL ADDRESS');usr.focus();return}
 if(!p){deny('ENTER PASSWORD');pwd.focus();return}
 if(p.length<8){deny('PASSWORD NEEDS 8 CHARACTERS');pwd.focus();return}
 if(CREDS&&!creating&&(u!==CREDS.user||p!==CREDS.pass)){deny('ACCESS DENIED');pwd.value='';pwd.focus();return}
 loadWorkspace(u.toLowerCase(),creating);
 setLocked(false);usr.blur();pwd.blur();nam.blur();
 if(closeTimer){clearTimeout(closeTimer);closeTimer=0}else fling(drawers[0]); // signing straight back in: the drawer never got to shut
}
// Locking: the drawer waits to shut until the cabinet is back on screen, so it is seen sliding in (the unlock in reverse).
const CLOSE_WAIT=matchMedia('(prefers-reduced-motion: reduce)').matches?0:640;let closeTimer=0;
function closeDrawer(){saveWorkspace();setLocked(true);closeTimer=setTimeout(()=>{closeTimer=0;fling(drawers[0])},CLOSE_WAIT)}
// ---- accounts ----
// Each email keeps its own cabinets and case files for as long as the page stays open.
// Creating an account always starts from the standing set: one cabinet. Signing in brings back what that email had.
const ACCOUNTS={};let account=null,wsVer=0;
function saveWorkspace(){
 if(!account)return;
 ACCOUNTS[account]={cabs:CABS.map(c=>({...c})),cur:curCab,seq:cfSeq,cases:D0.fs.filter(f=>!f.isAdd).map(f=>({...CM[f.label]})),fd:{...FD},ss:{...SS}};
}
function loadWorkspace(email,fresh){
 account=email;const w=fresh?null:ACCOUNTS[email];
 D0.fs.filter(f=>!f.isAdd).forEach(f=>f.el.remove());
 D0.fs.splice(0,D0.fs.length,...D0.fs.filter(f=>f.isAdd));
 [CM,FD,SS].forEach(o=>Object.keys(o).forEach(k=>delete o[k]));
 CABS.length=0;
 if(w){
  CABS.push(...w.cabs.map(c=>({...c})));curCab=w.cur;cfSeq=w.seq;Object.assign(FD,w.fd);Object.assign(SS,w.ss);
  [...w.cases].reverse().forEach(c=>{CM[c.title]={...c};D0.addFolder(c.title)});
 }else{
  CABS.push({name:'Active cases',word:'active files',bar:'Active case files',status:'Active'});curCab=0;cfSeq=1105;
  CASES.forEach(c=>{CM[c.title]={...c,cab:0};FD[c.title]={cat:'Case file '+c.cf,ov:c.long,docs:DOCS};D0.addFolder(c.title)});
 }
 wsVer++; // tells the drawer view its files have been replaced
}
go.addEventListener('click',tryUnlock);
[usr,pwd,nam].forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter')tryUnlock()}));
drawers[0].g.addEventListener('click',e=>{
 if(e.target.closest('input,button,label'))return;
 if(locked){deny('SIGN IN FIRST');(usr.value?pwd:usr).focus()}else closeDrawer();
});
btn.onclick=()=>{if(locked){deny('SIGN IN FIRST');(usr.value?pwd:usr).focus()}else closeDrawer()};

// ---- folder book ----
let bookOpen=false,busy=false,cur=null,curTab=0;
const D0=drawers[0];
const DOCS=['Witness statements','Scene documentation','Correspondence','Supporting records'];
const FD={};CASES.forEach(c=>{FD[c.title]={cat:'Case file '+c.cf,ov:c.long,docs:DOCS}});
const GEN={cat:'Case file',ov:'Records, statements and correspondence kept for reference.',docs:DOCS};
// Every dossier opens on the same four tabs; more can be added per case with the "+" tab.
const TABS=['Photos','Videos','Documents','Timeline'],SS={},MAXF=24,MAXTABS=3,MAXPHOTOS=24;
const bw=document.getElementById('bw'),book=document.getElementById('book'),tabsEl=document.getElementById('tabs'),
      pg=document.getElementById('pg'),lp=document.getElementById('lp'),ctab=document.getElementById('ctab'),
      clab=document.getElementById('clab'),xb=document.getElementById('xb');
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
const longDate=iso=>{const d=new Date(iso+'T12:00:00');return isNaN(d)?iso:d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})};
const isoToday=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}; // local date, not UTC
const fileSize=b=>b>=1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB';
const plural=(n,w)=>n+' '+w+(n===1?'':'s');
tabsEl.addEventListener('keydown',e=>{
 if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
 const all=[...tabsEl.children],at=all.indexOf(document.activeElement);if(at<0)return;
 const n=(at+(e.key==='ArrowRight'?1:all.length-1))%all.length;all[n].focus();if(!all[n].classList.contains('plus'))all[n].click();e.preventDefault()});
function docDate(label,j){const m=label.match(/\d{4}/),y=m?+m[0]+1:2026,mo=['Jan 14','Feb 02','Mar 18','Apr 27','May 09','Jun 21','Jul 30','Aug 12'];return mo[(j*3+label.length)%8]+', '+y}
function data(fo){
 const d=FD[fo.label]||GEN,c=CM[fo.label];
 if(!SS[fo.label])SS[fo.label]={photos:[],videos:[],docs:d.docs.map((n,j)=>({n,dt:docDate(fo.label,j)})),
  timeline:c?[{d:c.iso,t:c.place==='Location not recorded'?'Case file opened':'Recorded at '+c.place}]:[],custom:[],
  evidence:((c&&EVID[c.cf])||[]).map(e=>({...e,people:[...e.people],places:[...e.places],objects:[...e.objects]})),xrefs:((c&&XREF[c.cf])||[]).map(x=>({...x})),pins:{}};
 return{d,s:SS[fo.label]};
}
const tabNames=s=>TABS.concat(s.custom.map(t=>t.name));
function buildTabs(){ // the tab strip: the four standing tabs, any added for this case, then "+"
 const{s}=data(cur),names=tabNames(s);
 tabsEl.textContent='';tabsEl.classList.toggle('wide',names.length>4);
 names.forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.className='tb';b.setAttribute('role','tab');b.textContent=t;b.title=t;b.onclick=()=>setTab(i);tabsEl.appendChild(b)});
 if(s.custom.length<MAXTABS){const b=document.createElement('button');b.type='button';b.className='tb plus';b.setAttribute('aria-label','Add a new tab');b.title='Add a new tab';b.textContent='+';b.onclick=()=>newTab();tabsEl.appendChild(b)}
}
function renderLeft(){
 const{d,s}=data(cur),names=tabNames(s),cb=(CM[cur.label]||{}).cab||0,list=D0.fs.filter(x=>!x.isAdd&&CM[x.label]&&CM[x.label].cab===cb);
 lp.innerHTML=`<div class="cat">${esc(d.cat)}</div><h2>${esc(cur.label)}</h2><div class="rule"></div><p class="lead">${esc(d.ov)}</p><div class="ct">Contents</div>
  <ol>${names.map((t,i)=>`<li><button type="button" data-i="${i}">${esc(t)}<i></i><b>${i+1}</b></button></li>`).join('')}</ol>
  <p class="stat">${plural(s.photos.length,'photo')}, ${plural(s.videos.length,'video')}, ${plural(s.docs.length,'document')}<br>${plural(s.timeline.length,'timeline entry').replace('entrys','entries')}<br>Cabinet ${cb+1} (${esc(CABS[cb].name)}), file ${list.indexOf(cur)+1} of ${list.length}</p>`;
 lp.querySelectorAll('ol button').forEach(b=>b.onclick=()=>setTab(+b.dataset.i));
 document.getElementById('pbCount').textContent=s.evidence.length;
 document.getElementById('pbOpen').setAttribute('aria-label',`Open pin board, ${plural(s.evidence.length,'piece')} of evidence`);
}
function bindAdd(fn){
 const ai=document.getElementById('ai'),ab=document.getElementById('ab');
 const go=()=>{const v=ai.value.trim();if(!v)return ai.focus();fn(v)};
 ab.onclick=go;ai.onkeydown=e=>{if(e.key==='Enter')go()};
}
function turn(){pg.scrollTop=0;pg.classList.remove('turn');void pg.offsetWidth;pg.classList.add('turn')}
function setTab(i,quiet){
 const{s}=data(cur),names=tabNames(s);if(i>=names.length)i=0;
 curTab=i;[...tabsEl.children].forEach((b,j)=>b.setAttribute('aria-selected',j===i));
 const again=()=>{renderLeft();setTab(i,true)},rm=(x,label)=>`<button type="button" class="rm" data-j="${x}" aria-label="Remove ${esc(label)}">×</button>`;
 let h=`<h3>${esc(names[i])}</h3>`;
 if(i===0){ // Photos: image files picked from this device, shown as thumbnails
  h+=`<ul class="shots">${s.photos.map((x,j)=>`<li><img src="${x.src}" alt=""><span title="${esc(x.n)}">${esc(x.n)}</span>${rm(j,x.n)}</li>`).join('')}</ul>${s.photos.length?'':'<p class="empty">No photos yet.</p>'}
   <div class="add"><label class="pill pick">Add photos<input id="pf" type="file" accept="image/*" multiple></label><span class="hint">Kept in this browser tab only.</span></div><p class="err" id="pe" role="alert"></p>`;
 }else if(i===1){ // Videos: listed by file name and size
  h+=`<ul class="docs clips">${s.videos.map((x,j)=>`<li><span class="film" aria-hidden="true"></span><span style="flex:1">${esc(x.n)}</span><em>${esc(x.size)}</em>${rm(j,x.n)}</li>`).join('')}</ul>${s.videos.length?'':'<p class="empty">No videos yet.</p>'}
   <div class="add"><label class="pill pick">Add videos<input id="vf" type="file" accept="video/*" multiple></label><span class="hint">Listed by name; the files are not uploaded.</span></div>`;
 }else if(i===2){
  h+=`<ul class="docs">${s.docs.map((x,j)=>`<li><span style="flex:1">${esc(x.n)}</span><em>${esc(x.dt)}</em>${rm(j,x.n)}</li>`).join('')}</ul>${s.docs.length?'':'<p class="empty">No documents yet.</p>'}<div class="add"><input id="ai" maxlength="60" placeholder="Add a document…" aria-label="New document name" autocomplete="off"><button type="button" class="pill" id="ab">Add</button></div>`;
 }else if(i===3){ // Timeline: dated entries, earliest first
  s.timeline.sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0);
  h+=`<ol class="tl">${s.timeline.map((x,j)=>`<li><time datetime="${esc(x.d)}">${esc(longDate(x.d))}</time><span>${esc(x.t)}</span>${rm(j,x.t)}</li>`).join('')}</ol>${s.timeline.length?'':'<p class="empty">Nothing on the timeline yet.</p>'}
   <div class="add tl-add"><input id="td" type="date" aria-label="Date of the entry"><input id="ai" maxlength="90" placeholder="What happened…" aria-label="What happened" autocomplete="off"><button type="button" class="pill" id="ab">Add</button></div>`;
 }else{ // a tab the user added: a plain running list
  const t=s.custom[i-TABS.length];
  h+=`<ul class="docs">${t.items.map((x,j)=>`<li><span style="flex:1">${esc(x)}</span>${rm(j,x)}</li>`).join('')}</ul>${t.items.length?'':'<p class="empty">Nothing here yet.</p>'}<div class="add"><input id="ai" maxlength="90" placeholder="Add an entry…" aria-label="New entry" autocomplete="off"><button type="button" class="pill" id="ab">Add</button></div>
   <p class="tab-rm"><button type="button" id="tr">Remove this tab</button></p>`;
 }
 pg.innerHTML=h;
 const refocus=()=>{const a=document.getElementById('ai');if(a)a.focus()};
 if(i===0){
  document.getElementById('pf').onchange=e=>{
   const fs=[...e.target.files].filter(f=>f.type.startsWith('image/')),room=MAXPHOTOS-s.photos.length,take=fs.slice(0,Math.max(0,room));
   if(!take.length){document.getElementById('pe').textContent=fs.length?'This file already holds '+MAXPHOTOS+' photos.':'Choose image files.';return}
   let left=take.length;
   take.forEach(f=>{const r=new FileReader();r.onload=()=>{s.photos.push({n:f.name,src:r.result});if(!--left)again()};r.onerror=()=>{if(!--left)again()};r.readAsDataURL(f)});
  };
  pg.querySelectorAll('.rm').forEach(b=>b.onclick=()=>{s.photos.splice(+b.dataset.j,1);again()});
 }
 if(i===1){
  document.getElementById('vf').onchange=e=>{[...e.target.files].forEach(f=>s.videos.push({n:f.name,size:fileSize(f.size)}));again()};
  pg.querySelectorAll('.rm').forEach(b=>b.onclick=()=>{s.videos.splice(+b.dataset.j,1);again()});
 }
 if(i===2){bindAdd(v=>{s.docs.push({n:v,dt:today()});again();refocus()});
  pg.querySelectorAll('.rm').forEach(b=>b.onclick=()=>{s.docs.splice(+b.dataset.j,1);again()})}
 if(i===3){const td=document.getElementById('td');td.value=isoToday();
  bindAdd(v=>{s.timeline.push({d:td.value||isoToday(),t:v});again();refocus()});
  pg.querySelectorAll('.rm').forEach(b=>b.onclick=()=>{s.timeline.splice(+b.dataset.j,1);again()})}
 if(i>=TABS.length){const t=s.custom[i-TABS.length];
  bindAdd(v=>{t.items.push(v);again();refocus()});
  pg.querySelectorAll('.rm').forEach(b=>b.onclick=()=>{t.items.splice(+b.dataset.j,1);again()});
  document.getElementById('tr').onclick=()=>{s.custom.splice(i-TABS.length,1);buildTabs();renderLeft();setTab(Math.min(i-1,TABS.length-1+s.custom.length))};
 }
 if(!quiet)turn();
}
function newTab(){ // the "+" tab: name a tab, and it joins this case's strip
 const{s}=data(cur);
 [...tabsEl.children].forEach(b=>b.setAttribute('aria-selected',b.classList.contains('plus')));
 pg.innerHTML=`<h3>New tab</h3><p class="ov">Add a tab to this case file for anything the standing four do not cover.</p>
  <div class="add"><input id="ai" maxlength="14" placeholder="e.g. Audio" aria-label="Name of the new tab" autocomplete="off"><button type="button" class="pill" id="ab">Add tab</button></div><p class="err" id="te" role="alert"></p>`;
 bindAdd(v=>{
  const name=v.replace(/\s+/g,' ');
  if(tabNames(s).some(t=>t.toLowerCase()===name.toLowerCase())){document.getElementById('te').textContent='This case file already has a tab with that name.';return}
  s.custom.push({name,items:[]});buildTabs();renderLeft();setTab(tabNames(s).length-1);
  const a=document.getElementById('ai');if(a)a.focus();
 });
 turn();document.getElementById('ai').focus();
}
function renderNew(){
 lp.innerHTML=`<div class="cat">New case file</div><h2>Open a case</h2><div class="rule"></div>
  <label>Case title<input id="nfn" maxlength="30" autocomplete="off" placeholder="e.g. The Carrow Ledger"></label>
  <label>Location<input id="nfc" maxlength="40" autocomplete="off" placeholder="e.g. Carrow Wharf, Limehouse"></label>
  <label>Short summary<textarea id="nfo" rows="3" maxlength="140" placeholder="One line on what this case is about"></textarea></label>
  <div class="err" id="nfe" role="alert"></div>
  <button type="button" class="pill" id="nfg">Create case file</button>`;
 pg.innerHTML=`<h3>Inside every case file</h3><ul class="docs"><li><span style="flex:1">Photos</span><em>images from your device</em></li><li><span style="flex:1">Videos</span><em>clips, listed by name</em></li><li><span style="flex:1">Documents</span><em>a running list</em></li><li><span style="flex:1">Timeline</span><em>dated entries</em></li></ul><p class="ov" style="margin-top:14px">Name the case on the left page and create it. It is filed in the drawer under the next case number, and you can fill it in from there.</p>`;
 const nm=lp.querySelector('#nfn'),ct=lp.querySelector('#nfc'),ov=lp.querySelector('#nfo'),er=lp.querySelector('#nfe');
 const create=()=>{
  const name=nm.value.trim().replace(/\s+/g,' ');
  if(!name){er.textContent='Give the case a title.';nm.focus();return}
  if(D0.fs.some(x=>x.label.toLowerCase()===name.toLowerCase())){er.textContent='A case with that title already exists.';nm.focus();return}
  if(D0.fs.length>=MAXF){er.textContent='The drawer is full.';return}
  const sum=ov.value.trim()||'A new case file. Add documents, notes and to-dos inside.';
  const c={cf:nextCf(),title:name,place:ct.value.trim()||'Location not recorded',date:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}),iso:isoToday(),status:CABS[curCab].status,cab:curCab,upd:Date.now(),sum};
  CM[name]=c;
  FD[name]={cat:'Case file '+c.cf,ov:sum,docs:[]};
  closeBook(()=>D0.addFolder(name));
 };
 lp.querySelector('#nfg').onclick=create;
 [nm,ct].forEach(el=>el.onkeydown=e=>{if(e.key==='Enter')create()});
}
function flipFrom(fo){ // transform that squeezes the closed cover onto the folder's on-screen rect
 const W=book.offsetWidth,H=book.offsetHeight,el=fo.card||fo.sheet;let r=el.getBoundingClientRect();
 if(el.classList.contains('case')){ // only the strip of the file that shows: above the next file and inside the drawer
  const well=el.parentNode.getBoundingClientRect(),nx=el.nextElementSibling;
  const bottom=Math.min(r.bottom,well.bottom,nx?nx.getBoundingClientRect().top:Infinity);
  r={left:r.left,top:r.top,width:r.width,height:Math.max(28,bottom-r.top)};
 }
 const dx=r.left+r.width/2-innerWidth/2,dy=r.top+r.height/2-innerHeight/2;
 return `translate(${dx}px,${dy}px) scale(${Math.max(.05,r.width/(W/2))},${Math.max(.05,r.height/H)}) translateX(-25%)`;
}
function openBook(fo){
 if(busy||bookOpen)return;busy=true;bookOpen=true;cur=fo;
 bw.style.setProperty('--fc',fo.color);bw.style.setProperty('--fi',fo.ink);
 book.classList.toggle('newmode',fo.isAdd);
 ctab.className=fo.white?'w':'m';ctab.textContent=fo.tab||fo.label;clab.textContent=fo.label;
 if(fo.isAdd)renderNew();else{buildTabs();renderLeft();setTab(0,true)}
 book.classList.remove('open');book.classList.add('pre');
 bw.classList.add('on');
 book.style.transition='none';book.style.transform=flipFrom(fo);
 (fo.card||fo.pivot).style.opacity='0';
 void book.offsetWidth;
 bw.classList.add('vis');
 book.style.transition='transform .55s cubic-bezier(.2,.8,.2,1)';book.style.transform='';
 setTimeout(()=>{book.style.transition='';book.classList.remove('pre');book.classList.add('open')},580);
 setTimeout(()=>{busy=false;(fo.isAdd?lp.querySelector('input'):tabsEl.children[0]).focus({preventScroll:true})},1500);
}
function closeBook(after){
 if(busy||!bookOpen)return;busy=true;const fo=cur,el=fo.card||fo.pivot,bd=document.getElementById('bd');
 // 1. the cover swings shut while the room behind comes back up
 book.classList.add('closing');book.classList.remove('open');
 bd.style.transition='opacity .85s ease';bw.classList.remove('vis');
 setTimeout(()=>{
  // 2. just before it finishes shutting, the folder is already on its way back to its place:
  //    an eased glide with a soft landing, dissolving into the file as the file fades in beneath it
  book.classList.add('pre');
  book.style.transition='transform .6s cubic-bezier(.45,0,.2,1),opacity .26s ease .34s';
  book.style.transform=flipFrom(fo);book.style.opacity='0';
  el.style.transition='opacity .3s ease .28s';el.style.opacity='';
  setTimeout(()=>{
   bw.classList.remove('on');book.classList.remove('closing');
   book.style.transition='none';book.style.transform='';book.style.opacity='';void book.offsetWidth;book.style.transition='';
   el.style.transition='';bd.style.transition='';bookOpen=false;busy=false;cur=null;
   if(typeof after==='function')after();
  },620);
 },500);
}
xb.onclick=()=>closeBook();
document.getElementById('pbOpen').onclick=()=>{if(cur&&!cur.isAdd&&!busy)window.openBoard(cur)};
document.getElementById('bd').onclick=()=>closeBook();
addEventListener('keydown',e=>{if(e.key==='Escape')closeBook()});
function fit(){const s=Math.min(innerWidth/620,(innerHeight-130)/620,1.3);S=s}
addEventListener('resize',fit);fit();
