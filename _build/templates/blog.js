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

  // MNQ / NQ split calculator
  d.querySelectorAll('[data-split]').forEach(function(sp){
    var $=function(id){return sp.querySelector('#'+id)}, ids=['sp-r','sp-s','sp-cm','sp-cn','sp-t'];
    function money(v,dp){return '$'+v.toLocaleString('en-GB',{minimumFractionDigits:dp,maximumFractionDigits:dp})}
    function run(){
      var r=parseFloat($('sp-r').value)||0, s=parseFloat($('sp-s').value)||0, cm=parseFloat($('sp-cm').value)||0, cn=parseFloat($('sp-cn').value)||0, t=parseFloat($('sp-t').value)||0, vd=$('sp-verdict');
      if(r<=0||s<=0){$('sp-out').textContent='Enter a budget and stop';vd.className='verdict';vd.textContent='Both the risk budget and the stop must be above zero.';return}
      var pm=s*2, pn=s*20, allm=Math.floor(r/pm+1e-9), nq=Math.floor(r/pn+1e-9), mnq=Math.floor((r-nq*pn)/pm+1e-9);
      var useSplit=nq>0&&cn<10*cm, sn=useSplit?nq:0, sm=useSplit?mnq:allm, risk=sn*pn+sm*pm;
      var costM=allm*cm, costS=sn*cn+sm*cm, save=(costM-costS)*t;
      $('sp-out').textContent=sm===0&&sn===0?'No trade':(sn?sn+' NQ'+(sm?' + '+sm+' MNQ':''):sm+' MNQ');
      $('sp-risk').textContent=money(risk,0)+' ('+Math.round(risk/r*100)+'%)';
      $('sp-allm').textContent=allm+' MNQ';
      $('sp-alln').textContent=nq+' NQ ('+money(nq*pn,0)+', '+Math.round(nq*pn/r*100)+'%)';
      $('sp-cost').textContent=money(costM,2)+' / '+money(costS,2);
      $('sp-save').textContent=money(Math.max(save,0),0);
      vd.className='verdict';
      if(allm===0){vd.className='verdict warn';vd.textContent='Even one MNQ ('+money(pm,0)+' at this stop) is more than the budget. Tighten the stop or skip the trade.'}
      else if(nq===0){vd.textContent='The budget is under one NQ\u2019s risk ('+money(pn,0)+' at this stop), so trade MNQ only.'}
      else if(cn>=10*cm){vd.textContent='One NQ costs at least as much as ten MNQ at these fees, so stay in MNQ: same risk, finer steps.'}
      else{vd.textContent='Swap every 10 MNQ for 1 NQ: same risk, '+money(costM-costS,2)+' less per trade, '+money(save,0)+' a month at '+t+' trades.'}
    }
    ids.forEach(function(id){$(id).addEventListener('input',run)});
    run();
  });

  // MCP config checker
  d.querySelectorAll('[data-mcpcheck]').forEach(function(mc){
    var ta=mc.querySelector('#mc-in'), sample=ta.value, rows=mc.querySelector('#mc-rows'), out=mc.querySelector('#mc-out'), vd=mc.querySelector('#mc-verdict'), meter=mc.querySelector('#mc-meter');
    var NPM={'github':'Switch to GitHub’s own server (github/github-mcp-server)','gitlab':'Remove, or move to a maintained GitLab server you vet','puppeteer':'Remove; if you need a browser tool, vet a maintained one and put it at Tier 2','slack':'Remove, or move to a maintained Slack server you vet','postgres':'Replace; give any database server a read-only user','redis':'Remove, or move to a maintained Redis server you vet','brave-search':'Remove, or move to a maintained search server you vet','google-maps':'Remove, or move to a maintained Maps server you vet','gdrive':'Remove, or move to a maintained Drive server you vet','everart':'Remove','aws-kb-retrieval':'Remove, or move to a maintained AWS server you vet'};
    var PY={'mcp-server-sqlite':'Remove if unused; otherwise replace with a maintained server','mcp-server-sentry':'Remove, or move to a maintained Sentry server you vet'};
    function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
    function run(){
      var txt=ta.value.trim(), cfg;
      rows.innerHTML=''; meter.style.width='0%';
      if(!txt){out.textContent='Paste a config';vd.className='verdict';vd.textContent='Paste the JSON from your MCP config file, or load the worked example.';return}
      try{cfg=JSON.parse(txt)}catch(e){out.textContent='Not valid JSON';vd.className='verdict warn';vd.textContent='The text does not parse as JSON. Copy the whole file, including the outer braces.';return}
      var srv=cfg.mcpServers||cfg.servers||(cfg.mcp&&cfg.mcp.servers)||{}, names=Object.keys(srv), arch=0, unpinned=0, secrets=0, html='';
      if(!names.length){out.textContent='No servers found';vd.className='verdict';vd.textContent='Looked for an "mcpServers" or "servers" object and found none.';return}
      names.forEach(function(n){
        var s=srv[n]||{}, parts=[s.command||''].concat(s.args||[]), line=parts.join(' '), pkg='', status='Maintained', cls='up', step='Keep; check it again next quarter';
        var m=line.match(/@modelcontextprotocol\/server-([a-z0-9-]+)(@[\w.\-]+)?/), p=line.match(/\b(mcp-server-[a-z0-9-]+)(==[\w.]+)?/);
        if(s.url&&!s.command){pkg=s.url;status='Remote';cls='';step='Confirm the service owner runs this endpoint'}
        else if(m){pkg='@modelcontextprotocol/server-'+m[1]+(m[2]||'');
          if(NPM[m[1]]){status='Archived';cls='down';step=NPM[m[1]];arch++}
          else if(!m[2]&&/npx/.test(line)){status='Unpinned';cls='';step='Pin an exact version, e.g. '+'server-'+m[1]+'@x.y.z';unpinned++}}
        else if(p){pkg=p[1]+(p[2]||'');
          if(PY[p[1]]){status='Archived';cls='down';step=PY[p[1]];arch++}
          else if(!p[2]){status='Unpinned';cls='';step='Pin an exact version, e.g. '+p[1]+'==x.y.z';unpinned++}}
        else{pkg=line||'(unknown)';status='Check owner';cls='';step='Confirm who maintains it and when it last shipped'}
        var env=s.env||{}, leak=Object.keys(env).filter(function(k){var v=String(env[k]||'');return /TOKEN|KEY|SECRET|PASSWORD|PAT/i.test(k)&&v&&!/^\$\{/.test(v)});
        if(leak.length){secrets++;step+='. Move '+leak.join(', ')+' to an environment variable'}
        html+='<tr><td>'+esc(n)+'</td><td class="mono">'+esc((function(x){x=x.replace('@modelcontextprotocol/','');return x.length>40?x.slice(0,39)+'…':x})(pkg))+'</td><td class="'+cls+'">'+status+(leak.length?' · secret':'')+'</td><td>'+esc(step)+'</td></tr>';
      });
      rows.innerHTML=html; meter.style.width=Math.round(arch/names.length*100)+'%';
      out.textContent=arch+' of '+names.length+' archived';
      var msg=[]; if(arch)msg.push(arch+' server'+(arch>1?'s':'')+' run code nobody patches. Replace or remove '+(arch>1?'them':'it')+' first.');
      if(unpinned)msg.push(unpinned+' unpinned install'+(unpinned>1?'s':'')+' will pull whatever version npm or PyPI serves next.');
      if(secrets)msg.push(secrets+' server'+(secrets>1?'s hold':' holds')+' a secret in plain text in the config.');
      if(!msg.length)msg.push('No archived packages, unpinned installs or plain-text secrets found. Re-run this after any agent adds a server.');
      vd.className='verdict'+(arch||secrets?' warn':''); vd.textContent=msg.join(' ');
    }
    ta.addEventListener('input',run);
    mc.querySelector('[data-act="ex"]').addEventListener('click',function(){ta.value=sample;run()});
    mc.querySelector('[data-act="clear"]').addEventListener('click',function(){ta.value='';run();ta.focus()});
    run();
  });

  // ranking drop triage
  d.querySelectorAll('[data-triage]').forEach(function(tr){
    var $=function(id){return tr.querySelector('#'+id)}, ids=['t-c0','t-c1','t-i0','t-i1','t-p0','t-p1','t-fold'], ma=0;
    var EX={'ex-a':[12400,9300,410000,395000,8.1,8.4,35],'ex-b':[12400,8060,410000,287000,7.9,12.6,30]};
    var segs=[].slice.call(tr.querySelectorAll('[data-seg="ma"] button'));
    function pct(n,dp){return (n*100).toFixed(dp==null?0:dp)+'%'}
    function run(){
      var v=ids.map(function(i){return +$(i).value||0}), C0=v[0],C1=v[1],I0=v[2],I1=v[3],P0=v[4],P1=v[5],F=v[6];
      var dc=C0>0?C1/C0-1:0, ctr0=I0>0?C0/I0:0, ctr1=I1>0?C1/I1:0, dp=P1-P0, si=0;
      if(C0>0&&C1>0&&I0>0&&I1>0&&C1<C0){si=Math.log(I1/I0)/Math.log(C1/C0);si=Math.max(0,Math.min(1,si))}
      $('t-dc').textContent=(dc>0?'+':dc<0?'−':'')+Math.abs(dc*100).toFixed(1)+'%';
      $('t-si').textContent=pct(si); $('t-sc').textContent=pct(1-si);
      $('t-ctr').textContent=pct(ctr0,2)+' → '+pct(ctr1,2);
      $('t-dp').textContent=Math.abs(dp).toFixed(1)+(dp>0?' lower':dp<0?' higher':'');
      $('t-meter').style.width=Math.round(si*100)+'%';
      var out=$('t-out'), vd=$('t-verdict'), warn=false, title, msg;
      if(ma){title='Fix the report';warn=true;msg='A manual action or security issue explains the drop on its own. Follow the fix Google lists in that report, then request a review.'}
      else if(!(C0>0)||dc>-0.10){title='Noise';msg='Clicks moved less than 10%. Leave the pages alone and compare the same windows again in 7 days.'}
      else if(F>=60){title='Page or template';warn=true;msg=Math.round(F)+'% of the lost clicks sit in one folder. Inspect three of its lost URLs, then check that folder’s last deploy for noindex, canonical or redirect changes.'}
      else if(si<0.5){title='Results page';msg='CTR carries '+pct(1-si)+' of the drop and Google still shows you. Check your top 20 queries for new AI Overviews or rich results, then rewrite titles and snippets.'}
      else if(dp<3){title='Demand';msg='Impressions carry '+pct(si)+' of the drop but top queries held their places. Open the 16-month view and Google Trends before you change anything.'}
      else{title='Ranking loss';warn=true;msg='Impressions carry '+pct(si)+' of the drop and top queries lost '+dp.toFixed(1)+' places. Check Crawl stats and Page indexing first. If both are clean, log the date against the October spikes and re-check two weeks after volatility settles.'}
      out.textContent=title; vd.className='verdict'+(warn?' warn':''); vd.textContent=msg;
    }
    ids.forEach(function(i){$(i).addEventListener('input',run)});
    segs.forEach(function(b){b.addEventListener('click',function(){ma=+b.getAttribute('data-v');segs.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});run()})});
    [].forEach.call(tr.querySelectorAll('[data-act^="ex-"]'),function(b){b.addEventListener('click',function(){var e=EX[b.getAttribute('data-act')];ids.forEach(function(i,k){$(i).value=e[k]});ma=0;segs.forEach(function(x){x.setAttribute('aria-pressed',x.getAttribute('data-v')==='0'?'true':'false')});run()})});
    run();
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
