(function(){
  var d=document, root=d.documentElement;
  function toast(msg){var t=d.querySelector('.toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('show')},1800)}

  // mobile menu
  var mb=d.querySelector('.menu-btn');
  if(mb){mb.addEventListener('click',function(){var o=root.classList.toggle('menu-open');mb.setAttribute('aria-expanded',o?'true':'false')});
    d.querySelectorAll('.mlink').forEach(function(a){a.addEventListener('click',function(){root.classList.remove('menu-open');mb.setAttribute('aria-expanded','false')})})}

  // cursor glow + card spotlight
  var g=d.querySelector('.glow');
  if(g&&matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    var x=-999,y=-999,cx=x,cy=y;
    addEventListener('pointermove',function(e){x=e.clientX;y=e.clientY;if(cx<-900){cx=x;cy=y}},{passive:true});
    (function loop(){cx+=(x-cx)*.12;cy+=(y-cy)*.12;g.style.transform='translate3d('+cx+'px,'+cy+'px,0)';requestAnimationFrame(loop)})();
  }
  d.querySelectorAll('.spot').forEach(function(el){el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px')})});

  // reading progress
  var prog=d.querySelector('.prog'), art=d.querySelector('.prose');
  if(prog&&art){var upd=function(){var r=art.getBoundingClientRect();var h=r.height-innerHeight*.6;var p=Math.min(1,Math.max(0,-r.top/(h>0?h:1)));prog.style.transform='scaleX('+p+')'};addEventListener('scroll',upd,{passive:true});upd()}

  // contents scrollspy
  var tocLinks=[].slice.call(d.querySelectorAll('.toc a'));
  if(tocLinks.length&&'IntersectionObserver' in window){
    var map={};tocLinks.forEach(function(a){map[a.getAttribute('href').slice(1)]=a});
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){tocLinks.forEach(function(a){a.classList.remove('on')});var a=map[e.target.id];if(a)a.classList.add('on')}})},{rootMargin:'-20% 0px -70% 0px'});
    Object.keys(map).forEach(function(id){var h=d.getElementById(id);if(h)io.observe(h)});
  }

  // copy helpers
  function copyText(text,label){
    var done=function(){toast(label||'Copied')};
    try{navigator.clipboard.writeText(text).then(done,function(){fallback()})}catch(e){fallback()}
    function fallback(){var ta=d.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';d.body.appendChild(ta);ta.select();try{d.execCommand('copy');done()}catch(e){toast('Select and copy the text')}ta.remove()}
  }
  d.querySelectorAll('[data-copy-link]').forEach(function(b){b.addEventListener('click',function(){copyText(b.getAttribute('data-copy-link')||location.href,'Link copied')})});
  d.querySelectorAll('.formula .copy').forEach(function(b){b.addEventListener('click',function(){copyText(b.parentNode.getAttribute('data-plain'),'Formula copied')})});

  // index filters + search
  var chips=[].slice.call(d.querySelectorAll('.chips .chip')), q=d.getElementById('q'), cards=[].slice.call(d.querySelectorAll('[data-pillar]')), empty=d.querySelector('.empty');
  if(chips.length){
    var cur='all';
    function apply(){var term=(q&&q.value||'').trim().toLowerCase();var shown=0;
      cards.forEach(function(c){var ok=(cur==='all'||c.getAttribute('data-pillar')===cur)&&(!term||c.textContent.toLowerCase().indexOf(term)>-1);c.hidden=!ok;if(ok&&!c.classList.contains('feat'))shown++});
      var feat=d.querySelector('.feat');var any=shown+(feat&&!feat.hidden?1:0);if(empty)empty.hidden=any>0}
    chips.forEach(function(ch){ch.addEventListener('click',function(){cur=ch.getAttribute('data-f');chips.forEach(function(c){c.setAttribute('aria-pressed',c===ch?'true':'false')});apply()})});
    if(q)q.addEventListener('input',apply);
  }


  // agent permission planner
  d.querySelectorAll('[data-planner]').forEach(function(pl){
    var ex=JSON.parse(pl.getAttribute('data-example')), tb=pl.querySelector('tbody'), note=pl.querySelector('.pl-note');
    var CTRL=['Runs alone, scoped and logged','Runs alone, logged and rate-limited','Waits for a person to approve each action','Remove from the agent’s key; a person does it'];
    function tier(r){if(r[4])return 3;if(!r[1])return 0;if(r[3]||!r[2])return 2;return 1}
    function yn(v,i,dis){return '<label class="tg"><input type="checkbox" data-i="'+i+'"'+(v?' checked':'')+(dis?' disabled':'')+'><span>'+(v?'Yes':'No')+'</span></label>'}
    var rows=[];
    function render(){
      tb.innerHTML='';var n=[0,0,0,0];
      rows.forEach(function(r,k){var t=tier(r);n[t]++;var tr=d.createElement('tr');
        tr.innerHTML='<td><input class="pl-name" aria-label="Tool name" value="'+r[0].replace(/"/g,'&quot;')+'"></td><td>'+yn(r[1],1)+'</td><td>'+yn(r[2],2,!r[1])+'</td><td>'+yn(r[3],3)+'</td><td>'+yn(r[4],4)+'</td><td><span class="tier t'+t+'" title="'+CTRL[t]+'">'+t+'</span></td><td><button class="rm" type="button" aria-label="Remove '+r[0]+'">×</button></td>';
        tr.querySelector('.pl-name').addEventListener('input',function(e){r[0]=e.target.value;summ()});
        [].forEach.call(tr.querySelectorAll('input[type=checkbox]'),function(c){c.addEventListener('change',function(){r[+c.getAttribute('data-i')]=c.checked?1:0;render()})});
        tr.querySelector('.rm').addEventListener('click',function(){rows.splice(k,1);render()});
        tb.appendChild(tr)});
      [0,1,2,3].forEach(function(t){pl.querySelector('.tiers-sum [data-t="'+t+'"] b').textContent=n[t]});
      summ(n)}
    function summ(n){n=n||[0,1,2,3].map(function(t){return rows.filter(function(r){return tier(r)===t}).length});
      var tot=rows.length;note.textContent=tot?('Your agent runs '+(n[0]+n[1])+' of '+tot+' tools on its own, asks before '+n[2]+', and should never hold '+n[3]+'.'+(n[3]?' Move those '+n[3]+' onto a separate key.':'')):'Add the tools your agent can call.'}
    function load(){rows=ex.map(function(r){return r.slice()});render()}
    pl.querySelector('[data-act="add"]').addEventListener('click',function(){rows.push(['new_tool',1,1,0,0]);render();var ins=tb.querySelectorAll('.pl-name');if(ins.length)ins[ins.length-1].select()});
    pl.querySelector('[data-act="reset"]').addEventListener('click',load);
    pl.querySelector('[data-act="copy"]').addEventListener('click',function(){
      var pol={agent:'my-agent',rule:'tier3=money/keys/delete; tier0=read-only; tier2=external or undo>5min; tier1=other',tools:rows.map(function(r){var t=tier(r);return {tool:r[0],tier:t,control:['auto','auto+log+ratelimit','human_approval','not_granted'][t]}})};
      copyText(JSON.stringify(pol,null,2),'Policy copied')});
    load();
  });

  // backtest trust check
  d.querySelectorAll('[data-btcheck]').forEach(function(bc){
    var $=function(id){return bc.querySelector('#'+id)}, ids=['b-n','b-y','b-sr','b-oos','b-t','b-m','b-sd','b-c','b-sl'];
    var EX=[240,4,1.6,0.7,610,15.2,118,1.5,1];
    function ninv(p){var a=[-39.6968302866538,220.946098424521,-275.928510446969,138.357751867269,-30.6647980661472,2.50662827745924],b=[-54.4760987982241,161.585836858041,-155.698979859887,66.8013118877197,-13.2806815528857],c=[-0.00778489400243029,-0.322396458041136,-2.40075827716184,-2.54973253934373,4.37466414146497,2.93816398269878],e=[0.00778469570904146,0.32246712907004,2.445134137143,3.75440866190742],q,r;
      if(p<0.02425){q=Math.sqrt(-2*Math.log(p));return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((e[0]*q+e[1])*q+e[2])*q+e[3])*q+1)}
      if(p>1-0.02425){q=Math.sqrt(-2*Math.log(1-p));return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((e[0]*q+e[1])*q+e[2])*q+e[3])*q+1)}
      q=p-0.5;r=q*q;return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1)}
    function ncdf(x){var t=1/(1+0.2316419*Math.abs(x)),y=t*(0.319381530+t*(-0.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));var p=1-Math.exp(-x*x/2)/Math.sqrt(2*Math.PI)*y;return x>=0?p:1-p}
    function hurdle(N){if(N<=1)return 0;var g=0.5772156649;return (1-g)*ninv(1-1/N)+g*ninv(1-1/(N*Math.E))}
    function money(n){return (n<0?'−$':'$')+Math.abs(n).toFixed(2)}
    function mark(el,ok,txt){el.textContent=txt+(ok?' · pass':' · fail');el.className=ok?'ok':'no'}
    function run(){
      var v=ids.map(function(i){return +$(i).value||0}),N=Math.max(1,Math.round(v[0])),Y=v[1],SR=v[2],OOS=v[3],T=v[4],M=v[5],SD=v[6],C=v[7],SL=v[8],tick=+$('b-inst').value;
      var slip=SL*tick*2, sNet=M-slip, sCost=C+2*slip, ratio=sCost>0?sNet/sCost:(sNet>0?99:0);
      var ok2=ratio>=2, t=SD>0&&T>0?M/SD*Math.sqrt(T):0, ok3=t>=2;
      var q=252, Tn=Math.max(2,q*Y), sr=SR/Math.sqrt(q), sr0=hurdle(N)/Math.sqrt(Tn), z=(sr-sr0)*Math.sqrt(Tn-1)/Math.sqrt(1+0.5*sr*sr), dsr=Y>0?ncdf(z):0, ok4=dsr>=0.95;
      var wfe=SR>0?OOS/SR:0, ok5=wfe>=0.5;
      mark($('b-r2'),ok2,money(sNet)+' · '+ratio.toFixed(1)+'× cost');
      mark($('b-r3'),ok3,t.toFixed(2));
      mark($('b-r4'),ok4,(Y>0?(hurdle(N)/Math.sqrt(Y)).toFixed(2):'–')+' · DSR '+Math.round(dsr*100)+'%');
      mark($('b-r5'),ok5,Math.round(wfe*100)+'%');
      var n=[ok2,ok3,ok4,ok5].filter(Boolean).length;
      $('b-out').textContent=n+' / 4'; $('b-meter').style.width=(n*25)+'%';
      var vd=$('b-verdict'), msg;
      if(!ok2)msg='Check 2 fails: with slippage doubled, each trade nets '+money(sNet)+' against '+money(sCost)+' of cost. The edge lives in your fill assumption. Re-test with realistic fills before anything else.';
      else if(!ok3)msg='Check 3 fails: a t-stat of '+t.toFixed(2)+' means '+Math.round(T)+' trades cannot separate this edge from noise. You need about '+Math.ceil(Math.pow(2*SD/Math.max(M,0.01),2))+' trades at this average and spread.';
      else if(!ok4)msg='Check 4 fails: '+N+' variations over '+Y+' years can produce a Sharpe of '+(hurdle(N)/Math.sqrt(Y)).toFixed(2)+' from luck alone, so your '+SR.toFixed(2)+' has a '+Math.round(dsr*100)+'% chance of being real skill. Cut the variations or add years of data.';
      else if(!ok5)msg='Check 5 fails: unseen data kept '+Math.round(wfe*100)+'% of the in-sample Sharpe. Below 50%, most of the in-sample result was fitted to noise.';
      else msg='All four numeric checks pass. Run checks 1, 6 and 7 by hand before you trade it with real money.';
      vd.className='verdict'+(n<4?' warn':''); vd.textContent=msg;
    }
    ids.concat(['b-inst']).forEach(function(i){$(i).addEventListener('input',run)});
    bc.querySelector('[data-act="ex"]').addEventListener('click',function(){ids.forEach(function(i,k){$(i).value=EX[k]});$('b-inst').selectedIndex=0;run()});
    run();
  });

  // calculators
  d.querySelectorAll('[data-calc]').forEach(function(calc){
    var tabs=[].slice.call(calc.querySelectorAll('.tab')), panes=[].slice.call(calc.querySelectorAll('[data-pane]'));
    tabs.forEach(function(t){t.addEventListener('click',function(){tabs.forEach(function(x){x.setAttribute('aria-selected',x===t?'true':'false')});panes.forEach(function(p){p.hidden=p.getAttribute('data-pane')!==t.getAttribute('data-tab')})})});
    var $=function(id){return calc.querySelector('#'+id)}, fmt=function(n){return '$'+Math.round(n).toLocaleString('en-US')};

    // sizing
    var preset=$('s-preset'),room=$('s-room'),inst=$('s-inst'),stop=$('s-stop'),loss=$('s-loss');
    function size(){
      var opt=preset.options[preset.selectedIndex];
      var R=+room.value||0, pv=+inst.value, S=+stop.value||0, N=+loss.value||0;
      var per=S*pv*N, max=per>0?Math.floor(R/per):0;
      var mini=+inst.options[inst.selectedIndex].getAttribute('data-mini');
      var capMicros=+opt.getAttribute('data-cap')||0, cap=capMicros?(mini?Math.floor(capMicros/10):capMicros):0;
      $('s-out').textContent=max; $('s-unit').textContent=inst.options[inst.selectedIndex].getAttribute('data-sym')+' contracts';
      $('s-per').textContent=fmt(per); $('s-each').textContent=fmt(S*pv);
      $('s-cap').textContent=cap?cap+' '+inst.options[inst.selectedIndex].getAttribute('data-sym'):'Not set';
      var old=+opt.getAttribute('data-old')||0;
      $('s-oldrow').hidden=!old; if(old){$('s-old').textContent=(per>0?Math.floor(old/per):0)+' at '+fmt(old)}
      $('s-meter').style.width=(cap?Math.min(100,max/cap*100):0)+'%';
      var v=$('s-verdict');
      if(max===0){v.className='verdict warn';v.textContent='This stop is too wide for the room you have. Tighten the stop, survive fewer losses, or trade a smaller contract.'}
      else if(cap&&max>=cap){v.className='verdict';v.textContent='The firm’s contract cap ('+cap+') binds before the drawdown does. Stay at or below the cap.'}
      else{v.className='verdict';v.textContent='The drawdown limits you before the firm’s cap does. '+max+' contracts lets you take '+N+' full stops in a row and still have '+fmt(R-max*per)+' of room left.'}
    }
    preset.addEventListener('change',function(){var o=preset.options[preset.selectedIndex];if(o.getAttribute('data-room'))room.value=o.getAttribute('data-room');size()});
    [room,inst,stop,loss].forEach(function(el){el.addEventListener('input',size)});
    size();

    // consistency
    var tgt=$('c-target'),best=$('c-best'),capBtns=[].slice.call(calc.querySelectorAll('[data-cap-pct]')),pct=.4;
    function cons(){
      var T=+tgt.value||0,B=+best.value||0, need=Math.max(T,pct>0?B/pct:0);
      $('c-out').textContent=fmt(need); $('c-extra').textContent=need>T?fmt(need-T)+' above target':'None';
      $('c-stop').textContent=fmt(pct*T); $('c-days').textContent=Math.ceil(1/pct-1e-9);
      $('c-pctl').textContent=Math.round(pct*100)+'%';
      var v=$('c-verdict');
      if(need>T){v.className='verdict warn';v.textContent='Your best day is '+Math.round(B/T*100)+'% of the target, so you have to keep trading to '+fmt(need)+' before you qualify. A daily stop-win at '+fmt(pct*T)+' prevents this.'}
      else{v.className='verdict';v.textContent='Your best day fits inside the '+Math.round(pct*100)+'% cap. Keep every day at or under '+fmt(pct*T)+' and the target is all you need.'}
    }
    capBtns.forEach(function(b){b.addEventListener('click',function(){pct=+b.getAttribute('data-cap-pct');capBtns.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});cons()})});
    [tgt,best].forEach(function(el){el.addEventListener('input',cons)});
    var cp=$('c-preset'); if(cp)cp.addEventListener('change',function(){tgt.value=cp.value;cons()});
    cons();
  });
})();
