/* Betvora — games/games-2.js
   Original game builders (dice, crash, roulette, plinko, mines, slots).
   Split from the single-file build; execution order preserved across files.
   Classic script (no modules) — works over file:// and http(s). */

/* ==================== DICE ==================== */
    BUILDERS.dice=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

      let mode="over", target=50, hist=[];
      mount.innerHTML='<div class="game-layout">'
        +'<div class="panel"><h4>Bet Controls</h4>'
        + betAmountHtml("diceBet","10.00")
        +'<div class="field"><label>Roll Mode</label><div class="seg" id="diceMode"><button class="on" data-m="over">Roll Over</button><button data-m="under">Roll Under</button></div></div>'
        +'<div class="stat-grid"><div class="stat-box"><small>Win Chance</small><b id="diceChance">49.50%</b></div><div class="stat-box"><small>Multiplier</small><b id="diceMult">2.00×</b></div><div class="stat-box"><small>Target</small><b id="diceTargetLbl">50.00</b></div><div class="stat-box"><small>Payout on Win</small><b id="dicePay" style="color:var(--green)">$20.00</b></div></div>'
        +'<button class="action-btn" id="diceRoll" style="margin-top:16px">Roll Dice</button>'
        +'<div class="hist-row" id="diceHist"></div></div>'
        +'<div class="stage">'+gameHeaderHtml('dice')+'<div class="dice-result"><div class="big" id="diceBig">50.00</div><div class="verdict" id="diceVerdict">Set your target and roll</div></div>'
        +'<div style="margin-top:30px"><label style="display:block;font-size:12.5px;font-weight:700;color:var(--muted);margin-bottom:9px">Target — drag to move</label><input type="range" id="diceSlider" min="2" max="98" step="0.5" value="50" /></div>'
        +'</div></div>';
      wireAmount("diceBet");
      const upd=()=>{
        const chance= mode==="over"? 100-target : target;
        const mult=99/chance;
        $("#diceChance").textContent=chance.toFixed(2)+"%";
        $("#diceMult").textContent=mult.toFixed(2)+"×";
        $("#diceTargetLbl").textContent=target.toFixed(2);
        const bet=parseFloat($("#diceBet").value)||0;
        $("#dicePay").textContent=fmt$(bet*mult);
        const sl=$("#diceSlider"); sl.style.setProperty("--fill",target+"%");
        sl.style.background= mode==="over"
          ? "linear-gradient(90deg, var(--red) "+target+"%, var(--green) "+target+"%)"
          : "linear-gradient(90deg, var(--green) "+target+"%, var(--red) "+target+"%)";
      };
      $("#diceSlider").addEventListener("input",e=>{ target=parseFloat(e.target.value); upd(); });
      $$("#diceMode button").forEach(b=>b.addEventListener("click",()=>{ mode=b.dataset.m; $$("#diceMode button").forEach(x=>x.classList.toggle("on",x===b)); upd(); sfx.click(); }));
      $("#diceBet").addEventListener("input",upd);
      upd();
      let rolling=false;
      $("#diceRoll").addEventListener("click",()=>{
        if(rolling) return;
        const bet=getBet("diceBet"); if(bet===null) return;
        charge(bet); rolling=true;
        const btn=$("#diceRoll"); btn.disabled=true; btn.textContent="Rolling…";
        const result=Math.round(Math.random()*10000)/100;
        const big=$("#diceBig"), verdict=$("#diceVerdict");
        big.className="big rolling"; verdict.textContent="…";
        const dur=state.anim?650:60; const t0=performance.now();
        const tickFn=()=>{ const p=(performance.now()-t0)/dur; if(p<1){ big.textContent=(Math.random()*100).toFixed(2); _bvRequestAnimationFrame(tickFn); } else {
          big.textContent=result.toFixed(2);
          big.classList.remove("rolling"); big.classList.add("pop");
          const chance= mode==="over"? 100-target : target;
          const win= mode==="over"? result>target : result<target;
          const mult=99/chance;
          big.classList.add(win?"w":"l");
          const stageEl=mount.querySelector(".stage");
          if(win){ const pay=settle("Dice",bet,mult); verdict.innerHTML='<span style="color:var(--green)">You won '+fmt$(pay)+'!</span>'; sfx.win(); winBanner(stageEl,"WIN "+fmt$(pay)); burstFX(stageEl); stageFx(stageEl,"win"); }
          else { settle("Dice",bet,0); verdict.innerHTML='<span style="color:var(--red)">Rolled '+result.toFixed(2)+' — '+(mode==="over"?"not over ":"not under ")+target.toFixed(2)+"</span>"; sfx.lose(); stageFx(stageEl,"lose"); }
          hist.unshift({t:result.toFixed(2),w:win}); hist=hist.slice(0,10); histChips($("#diceHist"),hist);
          rolling=false; btn.disabled=false; btn.textContent="Roll Dice";
        }};
        _bvRequestAnimationFrame(tickFn);
      });
    };

    /* ==================== CRASH ==================== */
    BUILDERS.crash=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

      let hist=[], running=false, raf=null, myBet=null, cashedOut=false, crashPt=2.34, startedAt=0, autoAt=0;
      mount.innerHTML='<div class="game-layout">'
        +'<div class="panel"><h4>Bet Controls</h4>'
        + betAmountHtml("crashBet","10.00")
        +'<div class="field"><label>Auto Cashout (optional)</label><div class="amount-in"><input id="crashAuto" type="number" min="1.01" step="0.01" placeholder="e.g. 2.00" /><span class="cur">×</span></div></div>'
        +'<button class="action-btn" id="crashBtn">Place Bet &amp; Launch</button>'
        +'<div class="stat-grid"><div class="stat-box"><small>Your Bet</small><b id="crashMyBet">—</b></div><div class="stat-box"><small>Cashout Value</small><b id="crashCashVal" style="color:var(--green)">—</b></div></div>'
        +'<h4 style="margin-top:18px">Recent Crashes</h4><div class="hist-row" id="crashHist" style="margin-top:0"></div></div>'
        +'<div class="stage" style="padding:10px">'+gameHeaderHtml('crash')+'<div class="crash-wrap"><canvas id="crashCanvas"></canvas>'
        +'<div class="crash-center"><div class="cm" id="crashMult">1.00×</div><div class="cs" id="crashState">Place a bet to launch</div></div></div></div></div>';
      wireAmount("crashBet");
      const cv=$("#crashCanvas"), ctx=cv.getContext("2d");
      let sparks=[], starPts=[], lastWhole=1, lastPts=[], lastCrashed=false;
      function sizeCanvas(){ const r=cv.getBoundingClientRect(); const w=Math.max(1,Math.round(r.width)); const h=Math.max(240,Math.round(r.height||340)); if(cv.width!==w)cv.width=w; if(cv.height!==h)cv.height=h; starPts=Array.from({length:38},()=>({x:Math.random(),y:Math.random(),s:Math.random()<.85?1:2})); }
      sizeCanvas();
      function drawCurve(pts,crashed){
        const w=cv.width,h=cv.height; ctx.clearRect(0,0,w,h);
        ctx.fillStyle="rgba(160,190,235,.38)";
        starPts.forEach(s=>{ ctx.fillRect(s.x*w,s.y*h,s.s,s.s); });
        ctx.strokeStyle="rgba(148,178,220,.12)"; ctx.lineWidth=1;
        for(let gx=0;gx<w;gx+=44){ ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,h); ctx.stroke(); }
        for(let gy=0;gy<h;gy+=44){ ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(w,gy); ctx.stroke(); }
        if(!pts.length) return;
        const maxT=Math.max(3,pts[pts.length-1].t*1.18), maxM=Math.max(2.2,pts[pts.length-1].m*1.12);
        const xy=p=>({x:26+(p.t/maxT)*(w-52), y:h-26-(Math.log(p.m)/Math.log(maxM))*(h-56)});
        /* gradient area under the curve */
        ctx.beginPath();
        pts.forEach((p,i)=>{ const q=xy(p); i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y); });
        const lastQ=xy(pts[pts.length-1]), firstQ=xy(pts[0]);
        ctx.lineTo(lastQ.x,h-24); ctx.lineTo(firstQ.x,h-24); ctx.closePath();
        const ag=ctx.createLinearGradient(0,0,0,h);
        if(crashed){ ag.addColorStop(0,"rgba(255,92,92,.26)"); ag.addColorStop(1,"rgba(255,92,92,0)"); }
        else { ag.addColorStop(0,"rgba(0,224,101,.22)"); ag.addColorStop(1,"rgba(0,224,101,0)"); }
        ctx.fillStyle=ag; ctx.fill();
        /* the curve itself */
        ctx.beginPath();
        pts.forEach((p,i)=>{ const q=xy(p); i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y); });
        ctx.strokeStyle=crashed? "#ff5c5c":"#00e065"; ctx.lineWidth=3.5; ctx.lineJoin="round"; ctx.shadowColor=crashed?"rgba(255,92,92,.55)":"rgba(0,224,101,.55)"; ctx.shadowBlur=14; ctx.stroke(); ctx.shadowBlur=0;
        /* spark trail behind the head */
        if(!crashed&&state.anim){ for(let i=0;i<2;i++) sparks.push({x:lastQ.x,y:lastQ.y,vx:-Math.random()*1.5-.3,vy:(Math.random()-.5)*1.2,l:1}); }
        sparks=sparks.filter(s=>s.l>0);
        sparks.forEach(s=>{ s.x+=s.vx; s.y+=s.vy; s.l-=.032; ctx.globalAlpha=Math.max(0,s.l)*.85; ctx.beginPath(); ctx.arc(s.x,s.y,2.2,0,7); ctx.fillStyle=crashed?"#ff8a5c":"#7df0ab"; ctx.fill(); });
        ctx.globalAlpha=1;
        /* pulsing head */
        const pr=6+Math.sin(performance.now()/140)*1.6;
        ctx.beginPath(); ctx.arc(lastQ.x,lastQ.y,pr+7,0,7); ctx.strokeStyle=crashed?"rgba(255,92,92,.35)":"rgba(0,224,101,.35)"; ctx.lineWidth=2; ctx.stroke();
        ctx.beginPath(); ctx.arc(lastQ.x,lastQ.y,6,0,7); ctx.fillStyle=crashed?"#ff5c5c":"#7df0ab"; ctx.fill();
        /* Keep the vehicle visible at the curve head; show an impact burst at crash. */
        {
          const prev=xy(pts[Math.max(0,pts.length-2)]);
          const ang=pts.length>1?Math.atan2(lastQ.y-prev.y,lastQ.x-prev.x):0;
          ctx.save(); ctx.translate(lastQ.x,lastQ.y); ctx.rotate(ang);
          ctx.shadowColor=crashed?"rgba(255,92,92,.75)":"rgba(0,224,101,.55)"; ctx.shadowBlur=crashed?16:10;
          ctx.fillStyle=crashed?"#8c98a9":"#eaf2ff"; ctx.beginPath(); ctx.moveTo(16,0); ctx.lineTo(2,-7); ctx.quadraticCurveTo(-6,-5,-8,0); ctx.quadraticCurveTo(-6,5,2,7); ctx.closePath(); ctx.fill();
          ctx.fillStyle=crashed?"#ff5c5c":"#38bdf8"; ctx.beginPath(); ctx.ellipse(2,0,3.5,3.5,0,0,Math.PI*2); ctx.fill();
          ctx.fillStyle=crashed?"#ffb347":"#ff9a3c"; ctx.beginPath(); ctx.moveTo(-7,-4); ctx.lineTo(-16,0); ctx.lineTo(-7,4); ctx.closePath(); ctx.fill();
          ctx.restore();
          if(crashed){
            for(let i=0;i<12;i++){const a=(Math.PI*2*i/12)+(performance.now()/1000);const rr=10+(i%3)*4;ctx.beginPath();ctx.arc(lastQ.x+Math.cos(a)*rr,lastQ.y+Math.sin(a)*rr,2.2,0,Math.PI*2);ctx.fillStyle=i%2?"#ff5c5c":"#ffd479";ctx.fill();}
          }
        }
      }
      drawCurve([],false);
      if(typeof ResizeObserver!="undefined"){ const crashRO=new ResizeObserver(()=>{sizeCanvas();drawCurve(lastPts,lastCrashed);}); crashRO.observe(cv); onCleanup(()=>crashRO.disconnect()); }
      else window.addEventListener("resize",sizeCanvas);
      function genCrash(){ const r=Math.random(); if(r<0.03) return 1; return Math.min(250,Math.max(1,0.99/(1-Math.random()))); }
      function endRound(crashedAt){
        running=false; lastCrashed=true;
        const cmEl=$("#crashMult");
        cmEl.textContent=crashedAt.toFixed(2)+"×"; cmEl.classList.remove("warm","hot"); cmEl.classList.add("crashed");
        $("#crashState").textContent="Crashed";
        hist.unshift({t:crashedAt.toFixed(2)+"×",w:crashedAt>=2}); hist=hist.slice(0,12); histChips($("#crashHist"),hist);
        const stageEl=mount.querySelector(".stage");
        stageFx(stageEl,"shake"); _bvSetTimeout(()=>stageFx(stageEl,"lose"),70);
        if(myBet!==null&&!cashedOut){ settle("Crash",myBet,0); $("#crashCashVal").textContent=fmt$(0); sfx.lose(); burstFX(stageEl,{colors:["#ff5c5c","#ff8a3d","#ffd479"],n:22}); }
        const btn=$("#crashBtn"); btn.disabled=false; btn.textContent="Place Bet & Launch"; btn.classList.remove("cashout");
        myBet=null;
      }
      function startRound(){
        const bet=getBet("crashBet"); if(bet===null) return;
        charge(bet); myBet=bet; cashedOut=false; crashPt=genCrash(); autoAt=parseFloat($("#crashAuto").value)||0;
        $("#crashMyBet").textContent=fmt$(bet); $("#crashCashVal").textContent=fmt$(bet);
        $("#crashMult").classList.remove("crashed");
        const btn=$("#crashBtn"); btn.textContent="Cash Out"; btn.classList.add("cashout");
        running=true; startedAt=performance.now(); lastWhole=1; sparks=[]; lastPts=[]; lastCrashed=false;
        const cmEl0=$("#crashMult"); cmEl0.classList.remove("warm","hot");
        const pts=[];
        const loop=()=>{
          if(!running) return;
          const t=(performance.now()-startedAt)/1000;
          const m=Math.exp(0.115*t);
          pts.push({t:t,m:m}); if(pts.length>240) pts.shift();
          lastPts=pts; lastCrashed=false; drawCurve(pts,false);
          cmEl0.textContent=m.toFixed(2)+"×";
          cmEl0.classList.toggle("warm",m>=2&&m<5);
          cmEl0.classList.toggle("hot",m>=5);
          const whole=Math.floor(m);
          if(whole!==lastWhole){ lastWhole=whole; if(whole>=2){ cmEl0.classList.remove("pop"); void cmEl0.offsetWidth; cmEl0.classList.add("pop"); } }
          $("#crashState").textContent="Flying…";
          if(myBet!==null&&!cashedOut) $("#crashCashVal").textContent=fmt$(myBet*m);
          if(autoAt>1&&m>=autoAt&&myBet!==null&&!cashedOut){ doCashout(autoAt); return; }
          if(m>=crashPt){ drawCurve(pts,true); endRound(crashPt); return; }
          raf=_bvRequestAnimationFrame(loop);
        };
        raf=_bvRequestAnimationFrame(loop);
      }
      function doCashout(atMult){
        if(myBet===null||cashedOut||!running) return;
        cashedOut=true; const pay=settle("Crash",myBet,atMult);
        $("#crashCashVal").textContent=fmt$(pay);
        $("#crashState").textContent="Cashed out @ "+atMult.toFixed(2)+"×";
        sfx.win(); const stageEl=mount.querySelector(".stage"); winBanner(stageEl,"CASHED OUT "+fmt$(pay)); burstFX(stageEl); stageFx(stageEl,"win");
        const btn=$("#crashBtn"); btn.textContent="Waiting for crash…"; btn.disabled=true; btn.classList.remove("cashout");
        myBet=null;
      }
      $("#crashBtn").addEventListener("click",()=>{
        if(!running){ startRound(); return; }
        if(myBet!==null&&!cashedOut){ const m=parseFloat($("#crashMult").textContent)||1; doCashout(Math.max(1,m)); }
      });
      onCleanup(()=>{ running=false; if(raf) _bvCancelAnimationFrame(raf); });
    };

    /* ==================== ROULETTE ==================== */
    const WHEEL=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
    const REDS=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
    BUILDERS.roulette=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

      let chip=25, bets={}, spinning=false, rot=0, lastBets=null, ballRaf=null;
      mount.innerHTML='<div class="game-layout">'
        +'<div class="panel"><h4>Chip Value</h4><div class="chip-pick" id="chipPick">'
        +'<button class="c10" data-chip="10">$10</button><button class="c25 on" data-chip="25">$25</button><button class="c50" data-chip="50">$50</button><button class="c100" data-chip="100">$100</button><button class="c500" data-chip="500">$500</button></div>'
        +'<div class="stat-grid"><div class="stat-box"><small>Total Bet</small><b id="rouTotal">$0.00</b></div><div class="stat-box"><small>Last Result</small><b id="rouLast" class="stat-empty">No result yet</b></div></div>'
        +'<button class="action-btn" id="rouSpin" style="margin-top:16px">Spin Wheel</button>'
        +'<div style="display:flex;gap:8px;margin-top:9px"><button class="mini-btn" id="rouClear" style="flex:1;height:42px">Clear Bets</button><button class="mini-btn" id="rouRebet" style="flex:1;height:42px">Rebet Last</button></div>'
        +'<p class="fineprint">Click the board to stack chips. Straight numbers pay 35×, dozens 2×, even-money bets 1×. Green zero is the house\'s friend.</p>'
        +'<div class="hist-row" id="rouHist"></div></div>'
        +'<div class="stage roulette-stage">'+gameHeaderHtml('roulette')+'<div class="wheel-box"><div class="wheel-pointer"></div><svg id="wheelSvg" viewBox="0 0 300 300" role="img" aria-label="Roulette wheel"></svg><div class="wheel-ball" id="wheelBall"></div>'
        +'<div class="wheel-hub"><b id="hubNum">–</b><span id="hubLbl">Place bets</span></div></div>'
        +'<div class="bet-board" id="betBoard"></div></div></div>';
      /* build wheel */
      const svg=$("#wheelSvg"); const seg=360/37; let parts="";
      const polar=(r,a)=>{ const rad=(a-90)*Math.PI/180; return [150+r*Math.cos(rad),150+r*Math.sin(rad)]; };
      WHEEL.forEach((n,i)=>{
        const a0=i*seg, a1=a0+seg;
        const [x0,y0]=polar(148,a0),[x1,y1]=polar(148,a1),[x2,y2]=polar(96,a1),[x3,y3]=polar(96,a0);
        const col= n===0? "#0a9d51" : REDS.has(n)? "#c22f4d" : "#1a2740";
        parts+='<path d="M'+x0.toFixed(1)+' '+y0.toFixed(1)+' A148 148 0 0 1 '+x1.toFixed(1)+' '+y1.toFixed(1)+' L'+x2.toFixed(1)+' '+y2.toFixed(1)+' A96 96 0 0 0 '+x3.toFixed(1)+' '+y3.toFixed(1)+' Z" fill="'+col+'" stroke="rgba(255,255,255,.16)" stroke-width="1"/>';
        const am=a0+seg/2, [tx,ty]=polar(122,am);
        parts+='<text x="'+tx.toFixed(1)+'" y="'+ty.toFixed(1)+'" fill="#fff" font-size="12.5" font-weight="700" font-family="IBM Plex Mono" text-anchor="middle" dominant-baseline="middle" transform="rotate('+am.toFixed(1)+' '+tx.toFixed(1)+' '+ty.toFixed(1)+')">'+n+"</text>";
      });
      parts+='<circle cx="150" cy="150" r="95" fill="none" stroke="rgba(255,255,255,.14)"/><circle cx="150" cy="150" r="148" fill="none" stroke="#f5b942" stroke-width="2.5" opacity=".55"/>';
      svg.innerHTML=parts;
      /* betting board */
      const board=$("#betBoard"); let cells="";
      cells+='<button class="bb greenb" data-bet="n0" style="grid-row:span 3;display:flex;align-items:center;justify-content:center;font-size:16px">0</button>';
      for(let r=0;r<3;r++) for(let c=0;c<12;c++){ const n=c*3+(3-r); cells+='<button class="bb '+(REDS.has(n)?"red":"black")+'" data-bet="n'+n+'">'+n+"</button>"; }
      cells+='<span></span><button class="bb" data-bet="d1" style="grid-column:span 4">1st 12</button><button class="bb" data-bet="d2" style="grid-column:span 4">2nd 12</button><button class="bb" data-bet="d3" style="grid-column:span 4">3rd 12</button>';
      cells+='<span></span><button class="bb" data-bet="low" style="grid-column:span 2">1–18</button><button class="bb" data-bet="even" style="grid-column:span 2">Even</button><button class="bb red" data-bet="red" style="grid-column:span 2">Red</button><button class="bb black" data-bet="black" style="grid-column:span 2">Black</button><button class="bb" data-bet="odd" style="grid-column:span 2">Odd</button><button class="bb" data-bet="high" style="grid-column:span 2">19–36</button>';
      board.innerHTML=cells;
      const totalBet=()=>Object.values(bets).reduce((a,b)=>a+b,0);
      function paintChips(){
        $$("#betBoard .bb").forEach(bb=>{
          const v=bets[bb.dataset.bet]; const old=bb.querySelector(".chip-on"); if(old) old.remove();
          if(v){ const c=document.createElement("span"); c.className="chip-on"; c.textContent= v>=1000? (v/1000)+"k" : v; bb.appendChild(c); }
        });
        $("#rouTotal").textContent=fmt$(totalBet());
      }
      board.addEventListener("click",e=>{
        const bb=e.target.closest(".bb"); if(!bb||spinning) return;
        bets[bb.dataset.bet]=(bets[bb.dataset.bet]||0)+chip; sfx.click(); paintChips();
      });
      board.addEventListener("contextmenu",e=>{
        const bb=e.target.closest(".bb"); if(!bb) return; e.preventDefault();
        if(bets[bb.dataset.bet]){ bets[bb.dataset.bet]-=chip; if(bets[bb.dataset.bet]<=0) delete bets[bb.dataset.bet]; paintChips(); }
      });
      $$("#chipPick button").forEach(b=>b.addEventListener("click",()=>{ chip=parseInt(b.dataset.chip,10); $$("#chipPick button").forEach(x=>x.classList.toggle("on",x===b)); sfx.click(); }));
      $("#rouClear").addEventListener("click",()=>{ if(spinning) return; bets={}; paintChips(); sfx.click(); });
      $("#rouRebet").addEventListener("click",()=>{ if(spinning||!lastBets){ if(!lastBets) toast("Nothing to rebet","Place a bet and spin first.","err"); return; } bets=Object.assign({},lastBets); paintChips(); sfx.click(); });
      function betWins(key,n){
        if(key==="n"+n) return 35;
        if(key==="red"&&REDS.has(n)) return 1;
        if(key==="black"&&n!==0&&!REDS.has(n)) return 1;
        if(key==="even"&&n!==0&&n%2===0) return 1;
        if(key==="odd"&&n%2===1) return 1;
        if(key==="low"&&n>=1&&n<=18) return 1;
        if(key==="high"&&n>=19&&n<=36) return 1;
        if(key==="d1"&&n>=1&&n<=12) return 2;
        if(key==="d2"&&n>=13&&n<=24) return 2;
        if(key==="d3"&&n>=25&&n<=36) return 2;
        return -1;
      }
      let hist=[];
      $("#rouSpin").addEventListener("click",()=>{
        if(spinning) return;
        const total=totalBet();
        if(total<=0){ toast("No bets placed","Click the board to stack chips first.","err"); return; }
        if(total>state.balance){ toast("Insufficient balance","Your board bets exceed your balance.","err"); if(state.user) openWallet(); else requireAuth(openWallet); return; }
        charge(total); lastBets=Object.assign({},bets); spinning=true;
        const spinBtn=$("#rouSpin"); spinBtn.disabled=true; spinBtn.textContent="Spinning…";
        const idx=Math.floor(Math.random()*37), n=WHEEL[idx];
        const targetMod=(360-(idx*seg+seg/2))%360;
        rot+= 360*6 + ((targetMod-(rot%360))+360)%360;
        svg.style.transition= state.anim? "" : "none";
        svg.style.transform="rotate("+rot+"deg)";
        $("#hubLbl").textContent="Spinning";
        /* the ball: whips around the rim, ticks past pockets, drops in as the wheel settles */
        const ball=$("#wheelBall");
        if(ballRaf) _bvCancelAnimationFrame(ballRaf);
        if(ball){
          if(!state.anim){ ball.style.opacity="1"; ball.style.left="50%"; ball.style.top="9.3%"; }
          else{
            ball.style.opacity="1";
            const durB=5200, t0B=performance.now(), totalSpin=-(360*4+Math.random()*50);
            let lastTick=-1;
            const bStep=t=>{
              const p=Math.min(1,(t-t0B)/durB), e=1-Math.pow(1-p,4);
              const ang=totalSpin*(1-e);
              const rad= p<.78? 46.5 : 46.5-((p-.78)/.22)*5.8;
              const a=ang*Math.PI/180;
              ball.style.left=(50+rad*Math.sin(a))+"%";
              ball.style.top=(50-rad*Math.cos(a))+"%";
              const tickIdx=Math.floor(Math.abs(ang)/(360/37));
              if(tickIdx!==lastTick){ lastTick=tickIdx; if(p<.97) beep(1150,0.02,"square",0.012); }
              if(p<1) ballRaf=_bvRequestAnimationFrame(bStep); else ballRaf=null;
            };
            ballRaf=_bvRequestAnimationFrame(bStep);
          }
        }
        _bvSetTimeout(()=>{
          let ret=0; Object.keys(bets).forEach(k=>{ const w=betWins(k,n); if(w>=0) ret+=bets[k]*(w+1); });
          const mult= total>0? ret/total : 0;
          settle("Roulette",total,mult);
          $("#hubNum").textContent=n;
          $("#hubNum").style.color= n===0? "#3ddc84" : REDS.has(n)? "#ff8296" : "#fff";
          $("#hubLbl").textContent= n===0? "Green" : REDS.has(n)? "Red":"Black";
          const hub=mount.querySelector(".wheel-hub"); if(hub){ hub.classList.remove("pop"); void hub.offsetWidth; hub.classList.add("pop"); }
          $("#rouLast").textContent=n+" "+(n===0?"Green":REDS.has(n)?"Red":"Black");$("#rouLast").classList.remove("stat-empty");
          hist.unshift({t:String(n),w:ret>total}); hist=hist.slice(0,10); histChips($("#rouHist"),hist);
          if(ret>total){ sfx.win(); const stageEl=mount.querySelector(".stage"); winBanner(stageEl,"WIN "+fmt$(ret)); burstFX(stageEl); stageFx(stageEl,"win"); toast("Roulette — "+n+" "+(REDS.has(n)?"Red":n===0?"Green":"Black"),"You won "+fmt$(ret)+" on a "+fmt$(total)+" board."); }
          else if(ret>0){ toast("Roulette — "+n,"Partial return of "+fmt$(ret)+"."); sfx.click(); }
          else { sfx.lose(); }
          bets={}; paintChips(); spinning=false; spinBtn.disabled=false; spinBtn.textContent="Spin Wheel";
        }, state.anim? 5300 : 120);
      });
      onCleanup(()=>{ if(ballRaf) _bvCancelAnimationFrame(ballRaf); });
    };

    /* ==================== PLINKO ==================== */
    const PLINKO_TABLES={
      8:{low:[5.6,2.1,1.1,1,0.5,1,1.1,2.1,5.6],med:[13,3,1.3,0.7,0.4,0.7,1.3,3,13],high:[29,4,1.5,0.3,0.2,0.3,1.5,4,29]},
      12:{low:[10,3,1.6,1.4,1.1,1,0.5,1,1.1,1.4,1.6,3,10],med:[33,11,4,2,1.1,0.6,0.3,0.6,1.1,2,4,11,33],high:[170,24,8.1,2,0.7,0.2,0.2,0.2,0.7,2,8.1,24,170]},
      16:{low:[16,9,2,1.4,1.4,1.2,1.1,1,0.5,1,1.1,1.2,1.4,1.4,2,9,16],med:[110,41,10,5,3,1.5,1,0.5,0.3,0.5,1,1.5,3,5,10,41,110],high:[1000,130,26,9,4,2,0.2,0.2,0.2,0.2,0.2,2,4,9,26,130,1000]}
    };
    BUILDERS.plinko=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

      let rows=12, risk="med", balls=[], raf=null, dropping=false, flashes=[];
      mount.innerHTML='<div class="game-layout">'
        +'<div class="panel"><h4>Bet Controls</h4>'
        + betAmountHtml("plinkoBet","10.00")
        +'<div class="field"><label>Risk Level</label><div class="seg" id="plinkoRisk"><button data-r="low">Low</button><button class="on" data-r="med">Medium</button><button data-r="high">High</button></div></div>'
        +'<div class="field"><label>Rows</label><div class="seg" id="plinkoRows"><button data-rows="8">8</button><button class="on" data-rows="12">12</button><button data-rows="16">16</button></div></div>'
        +'<button class="action-btn" id="plinkoDrop">Drop Ball</button>'
        +'<div class="stat-grid"><div class="stat-box"><small>Top Payout</small><b id="plinkoTop">33.00×</b></div><div class="stat-box"><small>Balls Dropped</small><b id="plinkoCount">0</b></div></div>'
        +'<div class="hist-row" id="plinkoHist"></div></div>'
        +'<div class="stage plinko-stage" style="padding:14px">'+gameHeaderHtml('plinko')+'<canvas id="plinkoCanvas" aria-label="Plinko peg board"></canvas><div class="slot-labels" id="plinkoSlots"></div>'
        +'<div class="plinko-last-result" id="plinkoLastResult" aria-live="polite"><span id="plinkoResultCap">LAST DROP</span><strong id="plinkoResultMult">—</strong><small id="plinkoResultPay">Drop a ball to begin</small></div></div></div>';
      wireAmount("plinkoBet");
      const cv=$("#plinkoCanvas"), ctx=cv.getContext("2d");
      let dropped=0, hist=[];
      function metrics(){ const w=cv.width,h=cv.height; const sp=Math.min(w/(rows+2.4), (h-56)/rows); return {w:w,h:h,sp:sp,top:30,cx:w/2}; }
      function paintSlots(){
        const t=PLINKO_TABLES[rows][risk];
        $("#plinkoSlots").innerHTML=t.map(m=>'<div class="'+(m>=10?"high":m>=1.4?"mid":"")+'" data-slot>'+ (m>=100? Math.round(m) : m) +"×</div>").join("");
        $("#plinkoTop").textContent=Math.max.apply(null,t).toFixed(2)+"×";
      }
      function drawBoard(){
        const m=metrics(); ctx.clearRect(0,0,m.w,m.h);
        for(let r=0;r<rows;r++) for(let c=0;c<=r;c++){
          const x=m.cx+(c-r/2)*m.sp, y=m.top+r*m.sp;
          ctx.beginPath(); ctx.arc(x,y,5.5,0,7); ctx.fillStyle="rgba(120,160,220,.14)"; ctx.fill();
          ctx.beginPath(); ctx.arc(x,y,3.3,0,7); ctx.fillStyle="rgba(178,205,245,.8)"; ctx.fill();
        }
        flashes.forEach(f=>{
          ctx.beginPath(); ctx.arc(f.x,f.y,4+f.age*1.7,0,7);
          ctx.strokeStyle="rgba(0,224,101,"+(0.55*(1-f.age/12)).toFixed(3)+")"; ctx.lineWidth=2; ctx.stroke();
        });
        balls.forEach(b=>{
          (b.trail||[]).forEach((tp,ti)=>{
            ctx.beginPath(); ctx.arc(tp.x,tp.y,3+ti*0.7,0,7);
            ctx.fillStyle="rgba(0,224,101,"+(0.05+ti*0.035).toFixed(3)+")"; ctx.fill();
          });
          ctx.beginPath(); ctx.arc(b.x,b.y,8,0,7); ctx.fillStyle="#00e065"; ctx.shadowColor="rgba(0,224,101,.8)"; ctx.shadowBlur=12; ctx.fill(); ctx.shadowBlur=0;
          ctx.beginPath(); ctx.arc(b.x-2.4,b.y-2.4,3,0,7); ctx.fillStyle="rgba(255,255,255,.75)"; ctx.fill();
        });
      }
      function sizeCanvas(){ const w=Math.max(1,Math.round(cv.getBoundingClientRect().width||cv.clientWidth||600)); const h=Math.max(280,Math.round(cv.getBoundingClientRect().height||430)); if(cv.width!==w)cv.width=w; if(cv.height!==h)cv.height=h; drawBoard(); }
      function drop(){
        const bet=getBet("plinkoBet"); if(bet===null) return;
        charge(bet); dropped++; $("#plinkoCount").textContent=dropped;
        const m=metrics();
        const path=[]; let pos=0;
        for(let r=0;r<rows;r++){ pos+= Math.random()<0.5? 0:1; path.push(pos); }
        const steps=path.map((p,r)=>({x:m.cx+(p-r/2)*m.sp, y:m.top+r*m.sp}));
        balls.push({x:m.cx,y:8,steps:steps,si:0,prog:0,bet:bet,slot:pos,trail:[]});
        if(!raf) loop();
      }
      function loop(){
        const m=metrics(); let alive=false;
        flashes.forEach(f=>f.age++); flashes=flashes.filter(f=>f.age<12);
        balls.forEach(b=>{
          if(b.si>=b.steps.length) return;
          alive=true;
          b.trail.push({x:b.x,y:b.y}); if(b.trail.length>7) b.trail.shift();
          b.prog+= state.anim? 0.055:0.5;
          const from= b.si===0? {x:m.cx,y:8} : b.steps[b.si-1];
          const to=b.steps[b.si];
          const p=Math.min(1,b.prog), e=p*p*(3-2*p);
          b.x=from.x+(to.x-from.x)*e; b.y=from.y+(to.y-from.y)*e;
          if(p>=1){ flashes.push({x:to.x,y:to.y,age:0}); b.si++; b.prog=0; if(b.si< b.steps.length) beep(500+b.si*40,0.04,"triangle",0.02); }
          if(b.si>=b.steps.length&&!b.done){
            b.done=true;
            const t=PLINKO_TABLES[rows][risk]; const mult=t[b.slot];
            const pay=settle("Plinko",b.bet,mult);
            const slots=$$("#plinkoSlots [data-slot]"); const cellEl=slots[b.slot];
            if(cellEl){ cellEl.classList.remove("hot"); void cellEl.offsetWidth; cellEl.classList.add("hot"); _bvSetTimeout(()=>cellEl.classList.remove("hot"),900); }
            // Keep the landing result on screen after the animated ball has reached its slot.
            const result=$("#plinkoLastResult"), resultMult=$("#plinkoResultMult"), resultPay=$("#plinkoResultPay"), resultCap=$("#plinkoResultCap");
            if(result&&resultMult&&resultPay&&resultCap){
              result.classList.remove("is-win","is-loss","result-pop");
              result.classList.add(mult>=1?"is-win":"is-loss");
              resultMult.textContent=mult.toFixed(2)+"×";
              resultPay.textContent=mult>1?"Practice payout "+fmt$(pay):(mult===1?"Stake returned: "+fmt$(pay):"No payout this round");
              resultCap.textContent="LANDED IN SLOT "+(b.slot+1)+" / "+t.length;
              void result.offsetWidth;result.classList.add("result-pop");
            }
            if(mult>=10){ sfx.big(); const stageEl=mount.querySelector(".stage"); winBanner(stageEl,mult+"× — "+fmt$(pay)); burstFX(stageEl); stageFx(stageEl,"win"); }
            else if(mult>=1){ sfx.win(); }
            else if(mult>0){ sfx.click(); }
            else sfx.lose();
            hist.unshift({t:mult+"×",w:mult>=1}); hist=hist.slice(0,10); histChips($("#plinkoHist"),hist);
          }
        });
        balls=balls.filter(b=>!b.done);
        drawBoard();
        if(alive||balls.length) raf=_bvRequestAnimationFrame(loop); else raf=null;
      }
      $$("#plinkoRisk button").forEach(b=>b.addEventListener("click",()=>{ risk=b.dataset.r; $$("#plinkoRisk button").forEach(x=>x.classList.toggle("on",x===b)); paintSlots(); drawBoard(); sfx.click(); }));
      $$("#plinkoRows button").forEach(b=>b.addEventListener("click",()=>{ rows=parseInt(b.dataset.rows,10); $$("#plinkoRows button").forEach(x=>x.classList.toggle("on",x===b)); balls=[]; paintSlots(); drawBoard(); sfx.click(); }));
      $("#plinkoDrop").addEventListener("click",drop);
      paintSlots(); sizeCanvas();
      if(typeof ResizeObserver!=="undefined"){ const plinkoRO=new ResizeObserver(()=>sizeCanvas()); plinkoRO.observe(cv); onCleanup(()=>plinkoRO.disconnect()); }
      else window.addEventListener("resize",sizeCanvas);
      onCleanup(()=>{ if(raf) _bvCancelAnimationFrame(raf); raf=null; });
    };

    /* ==================== MINES ==================== */
    BUILDERS.mines=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

      let active=false, minesSet=new Set(), mineCount=3, curBet=0, revealed=0;
      mount.innerHTML='<div class="game-layout">'
        +'<div class="panel"><h4>Bet Controls</h4>'
        + betAmountHtml("minesBet","10.00")
        +'<div class="field"><label>Number of Mines</label><div class="amount-in"><input id="minesCount" type="number" min="1" max="24" step="1" value="3" /><span class="cur">/ 25 tiles</span></div></div>'
        +'<button class="action-btn" id="minesBtn">Start Round</button>'
        +'<div class="stat-grid"><div class="stat-box"><small>Gems Found</small><b id="minesGems">0</b></div><div class="stat-box"><small>Current Multiplier</small><b id="minesMult">1.00×</b></div><div class="stat-box"><small>Next Tile</small><b id="minesNext">—</b></div><div class="stat-box"><small>Cashout Value</small><b id="minesCash" style="color:var(--green)">—</b></div></div></div>'
        +'<div class="stage">'+gameHeaderHtml('mines')+'<div class="mines-progress"><i id="minesProgFill"></i></div><div class="mines-grid" id="minesGrid"></div>'
        +'<p style="text-align:center;color:var(--muted);font-weight:600;margin:14px 0 0" id="minesHint">Set your bet and mines, then start the round.</p></div></div>';
      wireAmount("minesBet");
      const grid=$("#minesGrid");
      const GEM='<svg viewBox="0 0 24 24" fill="none" stroke="#00e065" stroke-width="1.8" stroke-linejoin="round"><path d="M7 3h10l3.5 5.5L12 21 3.5 8.5 7 3Z" fill="rgba(0,224,101,.18)"/><path d="M3.5 8.5h17M12 21 8.5 8.5 12 3l3.5 5.5L12 21"/></svg>';
      const BOMB='<svg viewBox="0 0 24 24" fill="none" stroke="#ff5c5c" stroke-width="1.8" stroke-linecap="round"><circle cx="10.5" cy="14" r="6.5" fill="rgba(255,92,92,.2)"/><path d="M14.5 8.5 17 6m0 0c1.2-1 3-.4 3.4 1.2M17 6l1.8-.6M20.4 7.2l.4 1.9"/></svg>';
      function comb(n,k){ if(k<0||k>n) return 0; let r=1; for(let i=0;i<k;i++) r=r*(n-i)/(i+1); return r; }
      function multAt(picks){ return Math.floor(0.97*comb(25,picks)/comb(25-mineCount,picks)*100)/100; }
      function renderGrid(revealAll,hitIdx){
        grid.innerHTML="";
        for(let i=0;i<25;i++){
          const b=document.createElement("button"); b.className="mine-tile"; b.dataset.i=i;
          const isMine=minesSet.has(i);
          if(revealAll){ b.classList.add("flip"); b.style.animationDelay=(i*20)+"ms"; if(isMine){ b.innerHTML=BOMB; b.classList.add(i===hitIdx?"bomb":"dim"); } else { b.innerHTML=GEM; b.classList.add("gem","dim"); } b.disabled=true; }
          else if(b.dataset.done==="1"){ b.innerHTML=GEM; b.classList.add("gem"); b.disabled=true; }
          else if(!active) b.disabled=true;
          grid.appendChild(b);
        }
      }
      function updStats(){
        $("#minesGems").textContent=revealed;
        const cur= revealed? multAt(revealed):1;
        $("#minesMult").textContent=cur.toFixed(2)+"×";
        $("#minesNext").textContent= active? multAt(revealed+1).toFixed(2)+"×":"—";
        $("#minesCash").textContent= active? fmt$(curBet*cur):"—";
        const pf=$("#minesProgFill"); if(pf){ const safe=Math.max(1,25-mineCount); pf.style.width=(active? Math.min(100,revealed/safe*100):0)+"%"; }
      }
      function start(){
        const bet=getBet("minesBet"); if(bet===null) return;
        let mc=parseInt($("#minesCount").value,10);
        if(isNaN(mc)||mc<1||mc>24){ toast("Invalid mines","Pick between 1 and 24 mines.","err"); return; }
        mineCount=mc; charge(bet); curBet=bet; revealed=0; active=true;
        minesSet=new Set(); while(minesSet.size<mineCount) minesSet.add(Math.floor(Math.random()*25));
        renderGrid(false); updStats();
        const btn=$("#minesBtn"); btn.textContent="Cash Out"; btn.classList.add("cashout"); btn.disabled=true;
        $("#minesHint").textContent="Pick a tile — every gem raises your multiplier.";
        sfx.click();
      }
      function endRound(){
        active=false; const btn=$("#minesBtn"); btn.textContent="Start Round"; btn.classList.remove("cashout"); btn.disabled=false;
      }
      function cashout(){
        if(!active||revealed===0) return;
        const m=multAt(revealed); const pay=settle("Mines",curBet,m);
        renderGrid(true); endRound(); updStats();
        $("#minesHint").textContent="Cashed out at "+m.toFixed(2)+"× — the mines are revealed.";
        sfx.win(); const stageEl=mount.querySelector(".stage"); winBanner(stageEl,"CASHED OUT "+fmt$(pay)); burstFX(stageEl); stageFx(stageEl,"win");
      }
      grid.addEventListener("click",e=>{
        const t=e.target.closest(".mine-tile"); if(!t||!active||t.disabled) return;
        const i=parseInt(t.dataset.i,10);
        const tr=t.getBoundingClientRect(), tileAt={x:tr.left+tr.width/2,y:tr.top+tr.height/2};
        const stageEl=mount.querySelector(".stage");
        if(minesSet.has(i)){
          settle("Mines",curBet,0);
          renderGrid(true,i); endRound(); updStats();
          $("#minesHint").textContent="Boom — that tile hid a mine. Round lost.";
          sfx.lose(); stageFx(stageEl,"shake"); _bvSetTimeout(()=>stageFx(stageEl,"lose"),70); burstFX(stageEl,{at:tileAt,colors:["#ff5c5c","#ff8a3d","#ffd479"],n:22});
        } else {
          t.dataset.done="1"; t.innerHTML=GEM; t.classList.add("gem","flip"); t.disabled=true;
          revealed++; beep(520+revealed*45,0.06,"triangle",0.04); updStats();
          burstFX(stageEl,{at:tileAt,colors:["#00e065","#7df0ab","#ffffff"],n:8});
          $("#minesBtn").disabled = revealed===0;
          if(revealed===25-mineCount){ cashout(); toast("Board cleared!","You found every gem.","gold"); }
        }
      });
      $("#minesBtn").addEventListener("click",()=>{ if(!active) start(); else cashout(); });
      renderGrid(false);
    };

    /* ==================== SLOTS ==================== */
    const SLOT_SYMS=[
      {id:"gem",w:26,pay:6,svg:'<svg viewBox="0 0 24 24" fill="none" stroke="#37c8f5" stroke-width="1.7" stroke-linejoin="round"><path d="M7 3h10l3.5 5.5L12 21 3.5 8.5 7 3Z" fill="rgba(55,200,245,.2)"/><path d="M3.5 8.5h17M12 21 8.5 8.5 12 3l3.5 5.5L12 21"/></svg>'},
      {id:"bell",w:24,pay:8,svg:'<svg viewBox="0 0 24 24" fill="none" stroke="#f5b942" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 3h-15L6 16Z" fill="rgba(245,185,66,.2)"/><path d="M10 21a2.2 2.2 0 0 0 4 0M12 5V3.5"/></svg>'},
      {id:"cherry",w:22,pay:10,svg:'<svg viewBox="0 0 24 24" fill="none" stroke="#ff5c7a" stroke-width="1.7" stroke-linecap="round"><path d="M8 12C10 6 14 4 19 3.5M8 12c1.5 2 4 2.6 6.5 2" /><circle cx="7" cy="16.5" r="4" fill="rgba(255,92,122,.3)"/><circle cx="16.5" cy="17.5" r="3.4" fill="rgba(255,92,122,.3)"/></svg>'},
      {id:"clover",w:15,pay:16,svg:'<svg viewBox="0 0 24 24" fill="none" stroke="#00e065" stroke-width="1.7" stroke-linejoin="round"><circle cx="8.5" cy="8.5" r="3.6" fill="rgba(0,224,101,.2)"/><circle cx="15.5" cy="8.5" r="3.6" fill="rgba(0,224,101,.2)"/><circle cx="8.5" cy="15" r="3.6" fill="rgba(0,224,101,.2)"/><circle cx="15.5" cy="15" r="3.6" fill="rgba(0,224,101,.2)"/><path d="M12 12c0 4-1 6.5-3 9" stroke-linecap="round"/></svg>'},
      {id:"crown",w:9,pay:30,svg:'<svg viewBox="0 0 24 24" fill="none" stroke="#f5b942" stroke-width="1.7" stroke-linejoin="round"><path d="M3 8 7.5 10.5 12 4.5 16.5 10.5 21 8l-1.7 11H4.7L3 8Z" fill="rgba(245,185,66,.25)"/><path d="M5 21h14"/></svg>'},
      {id:"seven",w:4,pay:80,svg:'<svg viewBox="0 0 24 24"><text x="12" y="18.5" text-anchor="middle" font-family="Sora" font-weight="800" font-size="17" fill="#ff8a3d">7</text></svg>'}
    ];
    function pickSym(){ const tot=SLOT_SYMS.reduce((a,s)=>a+s.w,0); let r=Math.random()*tot; for(const s of SLOT_SYMS){ r-=s.w; if(r<=0) return s; } return SLOT_SYMS[0]; }
    BUILDERS.slots=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

      let spinning=false, hist=[];
      const cellsInit=Array.from({length:9},()=>pickSym());
      mount.innerHTML='<div class="game-layout">'
        +'<div class="panel"><h4>Bet Controls</h4>'
        + betAmountHtml("slotsBet","10.00")
        +'<div class="stat-grid" style="grid-template-columns:1fr"><div class="stat-box"><small>Lines</small><b>5 lines · rows + diagonals</b></div></div>'
        +'<button class="action-btn" id="slotsSpin" style="margin-top:14px">Spin</button>'
        +'<div class="stat-grid"><div class="stat-box"><small>Last Win</small><b id="slotsLast" style="color:var(--green)">—</b></div><div class="stat-box"><small>Top Symbol</small><b>7 · 80×</b></div></div>'
        +'<div class="hist-row" id="slotsHist"></div></div>'
        +'<div class="stage">'+gameHeaderHtml('slots')+'<div class="slots-machine" id="slotMachine"><div class="marquee" id="slotMarquee">'
        + Array.from({length:12},(_,mi)=>'<i style="--i:'+mi+'"></i>').join("")
        +'</div><div class="win-display"><small>WIN</small><b id="slotsWinAmt">$0.00</b></div><div class="reels" id="slotReels">'
        + cellsInit.map(s=>'<div class="reel-cell">'+s.svg+"</div>").join("")
        +'</div><table class="paytable"><thead><tr><th>Symbol</th><th>3 on a line</th></tr></thead><tbody>'
        + SLOT_SYMS.map(s=>'<tr><td><span class="sym">'+s.svg+"</span>"+s.id.charAt(0).toUpperCase()+s.id.slice(1)+'</td><td class="mono">'+s.pay+'×</td></tr>').join("")
        +"</tbody></table></div></div></div>";
      wireAmount("slotsBet");
      const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,4,8],[2,4,6]];
      $("#slotsSpin").addEventListener("click",()=>{
        if(spinning) return;
        const bet=getBet("slotsBet"); if(bet===null) return;
        charge(bet); spinning=true;
        const btn=$("#slotsSpin"); btn.disabled=true; btn.textContent="Spinning…";
        const cells=$$("#slotReels .reel-cell");
        const machine=$("#slotMachine"), marquee=$("#slotMarquee"), winAmt=$("#slotsWinAmt"), stageEl=mount.querySelector(".stage");
        machine.classList.remove("jackpot");
        if(marquee) marquee.classList.add("on");
        if(winAmt) winAmt.textContent="$0.00";
        const final=Array.from({length:9},()=>pickSym());
        cells.forEach(c=>{ c.classList.remove("win-cell","land","anticipation"); c.classList.add("spinning"); });
        const iv=_bvSetInterval(()=>{ cells.forEach((c,i)=>{ c.innerHTML=pickSym().svg; }); },90);
        /* anticipation: if any line opens with a matching pair, the last reel spins longer under a golden glow */
        const anti= state.anim && LINES.some(line=>final[line[0]].id===final[line[1]].id);
        const stopAt= state.anim? [500,850, anti? 1750:1200] : [60,90,120];
        stopAt.forEach((ms,col)=>{
          _bvSetTimeout(()=>{
            for(let rI=0;rI<3;rI++){ const idx=rI*3+col; cells[idx].innerHTML=final[idx].svg; cells[idx].classList.remove("spinning"); cells[idx].classList.add("land"); }
            beep(340+col*70,0.06,"triangle",0.04);
            if(col===1&&anti){ for(let rI=0;rI<3;rI++) cells[rI*3+2].classList.add("anticipation"); beep(920,0.1,"sine",0.05,0.05); }
            if(col===2){
              _bvClearInterval(iv);
              cells.forEach((c,i)=>{ c.innerHTML=final[i].svg; c.classList.remove("spinning","anticipation"); });
              let mult=0; const winCells=new Set();
              LINES.forEach(line=>{
                const s0=final[line[0]];
                if(final[line[1]].id===s0.id&&final[line[2]].id===s0.id){ mult+=s0.pay; line.forEach(i=>winCells.add(i)); }
              });
              const pay=settle("Betvora Slots",bet,mult);
              $("#slotsLast").textContent= mult>0? fmt$(pay):"—";
              if(winAmt&&mult>0) countUp(winAmt,pay);
              winCells.forEach(i=>cells[i].classList.add("win-cell"));
              if(marquee&&mult===0) marquee.classList.remove("on");
              if(marquee&&mult>0) _bvSetTimeout(()=>marquee.classList.remove("on"),2400);
              if(mult>=30){ sfx.big(); machine.classList.add("jackpot"); winBanner(stageEl,"BIG WIN "+fmt$(pay)); burstFX(stageEl,{n:40}); stageFx(stageEl,"win"); }
              else if(mult>0){ sfx.win(); winBanner(stageEl,"WIN "+fmt$(pay)); burstFX(stageEl,{n:20}); stageFx(stageEl,"win"); }
              else sfx.lose();
              hist.unshift({t:mult>0? mult+"×":"0×",w:mult>0}); hist=hist.slice(0,10); histChips($("#slotsHist"),hist);
              spinning=false; btn.disabled=false; btn.textContent="Spin";
            }
          },ms);
        });
        onCleanup(()=>_bvClearInterval(iv));
      });
    };
