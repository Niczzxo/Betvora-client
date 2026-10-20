/* Betvora — games/games-4.js
   Game builders (BUILDERS.*) — GAMES42 additions, part 4.
   Split from the single-file build; execution order preserved across files.
   Classic script (no modules) — works over file:// and http(s). */

/* ==================== GAMES42: FRUITSLOTS ==================== */
BUILDERS.fruitslots=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

  var $=function(s){return mount.querySelector(s)};
  var CFG={
    syms:[
      {k:'cherry',name:'Cherry',w:26,pay:3,svg:'<svg viewBox="0 0 48 48" fill="none" stroke="#e63946" stroke-width="2.3" stroke-linecap="round"><path d="M20 21C24 11 32 7 40 6M20 21c4 4 10 5 14 3" stroke="#2f9e5f"/><circle cx="17" cy="30" r="9" fill="rgba(230,57,70,.32)"/><circle cx="33" cy="33" r="7.5" fill="rgba(230,57,70,.32)"/><circle cx="14" cy="27" r="2.2" fill="#fff" stroke="none" opacity=".85"/></svg>'},
      {k:'lemon',name:'Lemon',w:22,pay:4,svg:'<svg viewBox="0 0 48 48"><ellipse cx="23" cy="27" rx="15" ry="10" transform="rotate(-24 23 27)" fill="rgba(255,213,74,.45)" stroke="#d9a406" stroke-width="2.3"/><path d="M35 13c1-4 4-6 8-7-.3 4-2 7-5 9" fill="#2f9e5f"/><path d="M13 33c5 2 12 1 17-3" stroke="#d9a406" stroke-width="1.8" fill="none"/></svg>'},
      {k:'orange',name:'Orange',w:18,pay:6,svg:'<svg viewBox="0 0 48 48"><circle cx="24" cy="28" r="13" fill="rgba(255,138,61,.4)" stroke="#e56f1c" stroke-width="2.3"/><path d="M24 15c0-3 1-5 3-6M27 9c3-2 7-2 9 0-2 3-6 3-9 0Z" fill="#2f9e5f"/><circle cx="19" cy="24" r="2" fill="#fff" opacity=".8"/></svg>'},
      {k:'grape',name:'Grape',w:14,pay:9,svg:'<svg viewBox="0 0 48 48" fill="rgba(147,84,214,.4)" stroke="#7d3fc4" stroke-width="2"><circle cx="17" cy="19" r="5.5"/><circle cx="28" cy="19" r="5.5"/><circle cx="12" cy="28" r="5.5"/><circle cx="23" cy="28" r="5.5"/><circle cx="34" cy="28" r="5.5"/><circle cx="17" cy="37" r="5.5"/><circle cx="28" cy="37" r="5.5"/><path d="M23 13c0-4 2-6 6-7" stroke="#2f9e5f" fill="none" stroke-width="2.2"/></svg>'},
      {k:'bell',name:'Bell',w:10,pay:18,svg:'<svg viewBox="0 0 48 48" fill="none" stroke="#d9a406" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M13 33V22a11 11 0 0 1 22 0v11l3 6H10l3-6Z" fill="rgba(245,185,66,.35)"/><path d="M20 42a4.2 4.2 0 0 0 8 0M24 11V8"/></svg>'},
      {k:'bar',name:'BAR',w:6,pay:40,svg:'<svg viewBox="0 0 48 48"><rect x="4" y="14" width="40" height="21" rx="4" fill="#23272f" stroke="#f5f0e6" stroke-width="2"/><text x="24" y="29.5" text-anchor="middle" font-family="Arial" font-weight="800" font-size="11.5" fill="#ffffff">BAR</text></svg>'},
      {k:'seven',name:'Seven',w:3,pay:200,svg:'<svg viewBox="0 0 48 48"><text x="24" y="37" text-anchor="middle" font-family="Arial" font-weight="800" font-size="35" fill="#e63946">7</text></svg>'}
    ],
    lines:[[0,1,2],[3,4,5],[6,7,8],[0,4,8],[2,4,6]]
  };
  var TW=0,i;for(i=0;i<CFG.syms.length;i++)TW+=CFG.syms[i].w;
  function pick(){var r=Math.random()*TW;for(var k=0;k<CFG.syms.length;k++){r-=CFG.syms[k].w;if(r<0)return k;}return 0;}
  var hist=[],busy=false,pending=null;
  var payRows='';
  for(i=0;i<CFG.syms.length;i++){var s=CFG.syms[i];payRows+='<tr><td><span class="frt-sym">'+s.svg+'</span>'+s.name+'</td><td>'+s.pay+'\u00d7</td></tr>';}
  var bulbs='';for(i=0;i<10;i++)bulbs+='<i></i>';
  var cells='';for(i=0;i<9;i++)cells+='<div class="frt-cell" id="fruitslotsC'+i+'">'+CFG.syms[i%CFG.syms.length].svg+'</div>';
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("fruitslotsBet","10.00")
    +'<div class="stat-grid" style="grid-template-columns:1fr"><div class="stat-box"><small>Lines</small><b>5 lines \u00b7 rows + diagonals</b></div></div>'
    +'<button class="action-btn" id="fruitslotsPlay" style="margin-top:14px">Spin</button>'
    +'<div class="stat-grid"><div class="stat-box"><small>Last Win</small><b id="fruitslotsLast" style="color:var(--green)">\u2014</b></div><div class="stat-box"><small>Top Symbol</small><b>Seven \u00b7 200\u00d7</b></div></div>'
    +'<div class="hist-row" id="fruitslotsHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>3\u00d73 reels, 5 paylines: the 3 rows plus both diagonals. Every cell is an independent weighted draw.</li>'
    +'<li>Three of a kind on a line pays \u00d7 your TOTAL bet: Cherry 3\u00d7 \u00b7 Lemon 4\u00d7 \u00b7 Orange 6\u00d7 \u00b7 Grape 9\u00d7 \u00b7 Bell 18\u00d7 \u00b7 BAR 40\u00d7 \u00b7 Seven 200\u00d7.</li>'
    +'<li>Symbol weights (out of 99): Cherry 26 \u00b7 Lemon 22 \u00b7 Orange 18 \u00b7 Grape 14 \u00b7 Bell 10 \u00b7 BAR 6 \u00b7 Seven 3.</li>'
    +'<li>Multiple winning lines add together and are paid as one total.</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="fruitslotsStage">'+gameHeaderHtml('fruitslots')
    +'<div class="frt-cabinet"><div class="frt-marquee" id="fruitslotsMarquee">'+bulbs+'</div>'
    +'<div class="frt-winbox"><small>WIN</small><b id="fruitslotsWinAmt">$0.00</b></div>'
    +'<div class="frt-grid" id="fruitslotsGrid">'+cells+'</div>'
    +'<div class="frt-paywrap"><h6>PAYTABLE \u2014 3 ON A LINE (\u00d7 TOTAL BET)</h6><table class="frt-paytable">'+payRows+'</table></div>'
    +'<div class="frt-leverrow"><button class="frt-lever" id="fruitslotsLever" type="button">\u25cf PULL TO SPIN</button></div>'
    +'<div class="frt-msg" id="fruitslotsMsg">Place your bet and spin.</div>'
    +'</div></div></div>';
  wireAmount("fruitslotsBet");
  var stage=$("#fruitslotsStage"),play=$("#fruitslotsPlay"),lever=$("#fruitslotsLever"),marquee=$("#fruitslotsMarquee");
  function renderGrid(g){for(var c=0;c<9;c++){$("#fruitslotsC"+c).innerHTML=CFG.syms[g[c]].svg;}}
  function resolve(){
    if(!pending)return;var p=pending;pending=null;busy=false;
    play.disabled=false;lever.disabled=false;
    marquee.classList.remove("on");
    var payout=settle("Fruit Slots",p.bet,p.mult);
    hist.unshift({t:p.mult>0?fmtMult(p.mult):"0x",w:p.mult>1});histChips($("#fruitslotsHist"),hist.slice(0,12));
    $("#fruitslotsLast").textContent=p.mult>0?fmt$(payout):"\u2014";
    if(p.mult>0)$("#fruitslotsWinAmt").textContent=fmt$(payout);
    for(var c=0;c<9;c++){if(p.winCells[c])$("#fruitslotsC"+c).classList.add("wincell");}
    $("#fruitslotsMsg").textContent=p.mult>0?("Lines paid "+fmtMult(p.mult)+" \u2014 won "+fmt$(payout)+"."):"No line hit. Spin again!";
    if(p.mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));if(p.mult>=40)sfx.big();else sfx.win();}
    else if(p.mult>0){stageFx(stage,"shake");sfx.coin();}
    else{stageFx(stage,"lose");sfx.lose();}
  }
  onCleanup(function(){if(pending){for(var t=0;t<pending.timers.length;t++)_bvClearTimeout(pending.timers[t]);for(var v=0;v<pending.ivs.length;v++)_bvClearInterval(pending.ivs[v]);resolve();}});
  play.addEventListener("click",function(){
    if(busy)return;
    var bet=getBet("fruitslotsBet");if(bet==null)return;
    busy=true;sfx.click();play.disabled=true;lever.disabled=true;charge(bet);flyChip(play,stage);
    marquee.classList.add("on");$("#fruitslotsWinAmt").textContent="$0.00";
    $("#fruitslotsMsg").textContent="Spinning...";
    for(var c=0;c<9;c++)$("#fruitslotsC"+c).classList.remove("wincell","land");
    var grid=[],mult=0,winCells={},li;
    for(c=0;c<9;c++)grid.push(pick());
    for(li=0;li<CFG.lines.length;li++){var L=CFG.lines[li];if(grid[L[0]]===grid[L[1]]&&grid[L[1]]===grid[L[2]]){mult+=CFG.syms[grid[L[0]]].pay;winCells[L[0]]=1;winCells[L[1]]=1;winCells[L[2]]=1;}}
    pending={bet:bet,mult:mult,grid:grid,winCells:winCells,timers:[],ivs:[]};
    if(ngAnim()){
      var stops=[520,880,1240];
      for(var col=0;col<3;col++){
        (function(cc){
          var iv=_bvSetInterval(function(){for(var r=0;r<3;r++){var cell=$("#fruitslotsC"+(r*3+cc));cell.innerHTML=CFG.syms[pick()].svg;cell.classList.add("spinning");}},90);
          pending.ivs.push(iv);
          var tm=_bvSetTimeout(function(){
            _bvClearInterval(iv);
            for(var r=0;r<3;r++){var cell=$("#fruitslotsC"+(r*3+cc));cell.innerHTML=CFG.syms[grid[r*3+cc]].svg;cell.classList.remove("spinning");cell.classList.add("land");}
            sfx.coin();
            if(cc===2)resolve();
          },stops[cc]);
          pending.timers.push(tm);
        })(col);
      }
    }else{
      renderGrid(grid);resolve();
    }
  });
  lever.addEventListener("click",function(){play.click();});
  addDust(stage,10);
};
/* ==================== GAMES42: MYTHICSLOTS ==================== */
BUILDERS.mythicslots=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

  var $=function(s){return mount.querySelector(s)};
  var BOLT='<path d="M27 4 12 27h9l-5 17 17-24h-10l6-16z" fill="#ffd479" stroke="#b8860b" stroke-width="1.6" stroke-linejoin="round"/>';
  var CFG={
    syms:[
      {k:'athena',name:'Athena',svg:'<svg viewBox="0 0 48 48" fill="none" stroke="#cfe0ff" stroke-width="2.2" stroke-linejoin="round"><path d="M10 31a14 14 0 0 1 28 0l-3 9H13l-3-9Z" fill="rgba(120,160,255,.22)"/><path d="M24 17V8" stroke="#ffd479"/><path d="M16 11c2 3.4 4.6 5 8 5s6-1.6 8-5" stroke="#ffd479"/><circle cx="19" cy="30" r="1.8" fill="#cfe0ff" stroke="none"/><circle cx="29" cy="30" r="1.8" fill="#cfe0ff" stroke="none"/></svg>'},
      {k:'apollo',name:'Apollo',svg:'<svg viewBox="0 0 48 48" fill="none" stroke="#ffd479" stroke-width="2.2" stroke-linecap="round"><circle cx="24" cy="24" r="8.5" fill="rgba(255,212,121,.3)"/><path d="M24 6v5M24 37v5M6 24h5M37 24h5M11 11l3.5 3.5M33.5 33.5 37 37M37 11l-3.5 3.5M14.5 33.5 11 37"/><circle cx="21" cy="23" r="1.4" fill="#ffd479" stroke="none"/><circle cx="27" cy="23" r="1.4" fill="#ffd479" stroke="none"/><path d="M20 28c2.5 1.8 5.5 1.8 8 0"/></svg>'},
      {k:'poseidon',name:'Poseidon',svg:'<svg viewBox="0 0 48 48" fill="none" stroke="#4fd8c8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M24 20v22M24 20V8M13 8v7a5 5 0 0 0 10 0V8M25 8v7a5 5 0 0 0 10 0V8" /><path d="M10 44c3-2.4 6-2.4 9 0s6 2.4 9 0 6-2.4 9 0" stroke="#3aa7ff"/></svg>'},
      {k:'pegasus',name:'Pegasus',svg:'<svg viewBox="0 0 48 48" fill="none" stroke="#f2f4ff" stroke-width="2.2" stroke-linejoin="round"><path d="M30 40c-1-7 1-11 5-14l-1-7 6 3c3 2 4 5 3 8l-5 1c-2 3-3 6-3 9h-5Z" fill="rgba(230,236,255,.25)"/><path d="M28 22C22 12 13 8 5 10c6 2 9 5 11 9-4 0-7 1-9 3 6 2 14 1 21 0Z" fill="rgba(160,190,255,.3)"/><circle cx="37" cy="25" r="1.5" fill="#f2f4ff" stroke="none"/></svg>'},
      {k:'temple',name:'Temple',svg:'<svg viewBox="0 0 48 48" fill="none" stroke="#e8dcc0" stroke-width="2.2" stroke-linejoin="round"><path d="M24 6 6 17h36L24 6Z" fill="rgba(232,220,192,.2)"/><path d="M11 40V22M19 40V22M29 40V22M37 40V22"/><path d="M6 40h36M5 44h38" stroke-linecap="round"/></svg>'},
      {k:'amphora',name:'Amphora',svg:'<svg viewBox="0 0 48 48" fill="none" stroke="#ff9d5c" stroke-width="2.2" stroke-linejoin="round"><path d="M18 8h12M19 8c0 5-5 7-5 13 0 8 5 12 6 19M29 8c0 5 5 7 5 13 0 8-5 12-6 19M18 40h12" /><path d="M14 15c-3 1-4 4-2 7M34 15c3 1 4 4 2 7"/><path d="M16 25h16" stroke-dasharray="3 3"/></svg>'},
      {k:'laurel',name:'Laurel',svg:'<svg viewBox="0 0 48 48" fill="none" stroke="#7ee2a0" stroke-width="2.1" stroke-linecap="round"><path d="M15 42C9 34 8 22 13 11M33 42c6-8 7-20 2-31"/><path d="M13 20c-3 0-5-1-6-3 3-1 5 0 7 2M14 29c-3 0-5-1-6-3 3-1 5 0 6 2M35 20c3 0 5-1 6-3-3-1-5 0-7 2M34 29c3 0 5-1 6-3-3-1-5 0-6 2"/></svg>'},
      {k:'zeus',name:'Zeus \u00b7 WILD',svg:'<svg viewBox="0 0 48 48"><circle cx="24" cy="21" r="16" fill="rgba(255,212,121,.16)" stroke="#ffd479" stroke-width="1.8"/>'+BOLT+'<text x="24" y="45" text-anchor="middle" font-family="Arial" font-weight="800" font-size="8" fill="#ffd479">WILD</text></svg>'},
      {k:'scatter',name:'Scatter',svg:'<svg viewBox="0 0 48 48"><circle cx="24" cy="21" r="16" fill="rgba(147,84,214,.25)" stroke="#c99aff" stroke-width="1.8"/><path d="M27 7 14 26h8l-4 13 15-21h-9l5-11z" fill="#c99aff" stroke="#7d3fc4" stroke-width="1.4" stroke-linejoin="round"/><text x="24" y="45" text-anchor="middle" font-family="Arial" font-weight="800" font-size="6.4" fill="#c99aff">SCATTER</text></svg>'}
    ],
    baseW:[8,9,10,11,13,15,17,0,2],
    wildW:4,
    wildFSW:8,
    pay:[[19,57,189],[14,47,142],[14,38,114],[10,28,95],[8,19,57],[5,14,38],[4,10,28]],
    lines:[[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,0,0],[2,2,1,2,2],[1,0,0,0,1],[1,2,2,2,1],[1,0,1,2,1],[1,2,1,0,1],[0,1,1,1,0],[2,1,1,1,2],[0,1,0,1,0],[2,1,2,1,2],[1,1,0,1,1],[1,1,2,1,1],[0,2,1,2,0],[2,0,1,0,2],[1,0,2,0,1]],
    fsSpins:10
  };
  function reelW(r,fs){var w=CFG.baseW.slice();if(r>=1&&r<=3)w[7]=fs?CFG.wildFSW:CFG.wildW;return w;}
  function drawSym(r,fs){var w=reelW(r,fs),TW=0,i;for(i=0;i<w.length;i++)TW+=w[i];var x=Math.random()*TW;for(i=0;i<w.length;i++){x-=w[i];if(x<0)return i;}return 0;}
  function spinGrid(fs){
    var g=[],r,row;
    for(r=0;r<5;r++){g.push([]);for(row=0;row<3;row++)g[r].push(drawSym(r,fs));}
    for(r=0;r<5;r++){var has=false;for(row=0;row<3;row++)if(g[r][row]===7)has=true;if(has)for(row=0;row<3;row++)g[r][row]=7;}
    return g;
  }
  function evalGrid(g,bet){
    var lb=bet/20,pay=0,scat=0,wins=[],r,row,li;
    for(r=0;r<5;r++)for(row=0;row<3;row++)if(g[r][row]===8)scat++;
    for(li=0;li<CFG.lines.length;li++){
      var line=CFG.lines[li],sym=-1,count=0;
      for(r=0;r<5;r++){
        var c=g[r][line[r]];
        if(c===8)break;
        if(c===7){count++;continue;}
        if(sym===-1){sym=c;count++;}
        else if(c===sym)count++;
        else break;
      }
      if(sym>=0&&count>=3){var amt=CFG.pay[sym][count-3]*lb;pay+=amt;wins.push({line:li,sym:sym,count:count,amt:amt});}
    }
    return {pay:pay,scat:scat,wins:wins};
  }
  var hist=[],busy=false,pending=null,i;
  var payRows='';
  for(i=0;i<7;i++){var s=CFG.syms[i];payRows+='<tr><td><span class="myt-sym">'+s.svg+'</span>'+s.name+'</td><td>'+CFG.pay[i][0]+'\u00d7</td><td>'+CFG.pay[i][1]+'\u00d7</td><td>'+CFG.pay[i][2]+'\u00d7</td></tr>';}
  payRows+='<tr><td><span class="myt-sym">'+CFG.syms[7].svg+'</span>Zeus \u00b7 WILD</td><td colspan="3">Reels 2\u20134 \u00b7 expands full reel</td></tr>';
  payRows+='<tr><td><span class="myt-sym">'+CFG.syms[8].svg+'</span>Lightning \u00b7 SCATTER</td><td colspan="3">3+ anywhere = 10 free spins</td></tr>';
  var cells='';for(i=0;i<15;i++)cells+='<div class="myt-cell" id="mythicslotsC'+i+'">'+CFG.syms[i%7].svg+'</div>';
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("mythicslotsBet","10.00")
    +'<div class="stat-grid" style="grid-template-columns:1fr"><div class="stat-box"><small>Lines</small><b>20 lines \u00b7 line bet = bet \u00f7 20</b></div></div>'
    +'<button class="action-btn" id="mythicslotsPlay" style="margin-top:14px">Spin</button>'
    +'<div class="stat-grid"><div class="stat-box"><small>Last Win</small><b id="mythicslotsLast" style="color:var(--green)">\u2014</b></div><div class="stat-box"><small>Feature</small><b>10 Free Spins</b></div></div>'
    +'<div class="hist-row" id="mythicslotsHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>5 reels \u00d7 3 rows, 20 paylines, wins pay left-to-right from reel 1. Only the highest win per line is paid. Line bet = total bet \u00f7 20.</li>'
    +'<li>Paytable (\u00d7 line bet, for 3 / 4 / 5 of a kind): Athena 19 / 57 / 189 \u00b7 Apollo 14 / 47 / 142 \u00b7 Poseidon 14 / 38 / 114 \u00b7 Pegasus 10 / 28 / 95 \u00b7 Temple 8 / 19 / 57 \u00b7 Amphora 5 / 14 / 38 \u00b7 Laurel 4 / 10 / 28.</li>'
    +'<li>Zeus is WILD: he appears only on reels 2, 3 and 4, EXPANDS to fill his whole reel when he lands, and substitutes for every symbol except Scatter.</li>'
    +'<li>Scatter (Lightning Bolt): 3 or more anywhere award 10 FREE SPINS at the same bet. Free spins auto-play; during them the Zeus weight rises from 4 to 8 per reel, so expansions land more often. Scatters in free spins do not retrigger.</li>'
    +'<li>Everything \u2014 base game plus all free spins \u2014 is settled as ONE payout at the very end against your original bet.</li>'
    +'<li>Per-reel draw weights: Athena 8 \u00b7 Apollo 9 \u00b7 Poseidon 10 \u00b7 Pegasus 11 \u00b7 Temple 13 \u00b7 Amphora 15 \u00b7 Laurel 17 \u00b7 Scatter 2, plus Zeus 4 on reels 2\u20134 only (8 in free spins).</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="mythicslotsStage">'+gameHeaderHtml('mythicslots')
    +'<div class="myt-stage">'
    +'<div class="myt-winbox"><small>TOTAL WIN</small><b id="mythicslotsWinAmt">$0.00</b></div>'
    +'<div class="myt-fs" id="mythicslotsFs"></div>'
    +'<div class="myt-grid" id="mythicslotsGrid">'+cells+'</div>'
    +'<div class="myt-paywrap"><h6>PAYTABLE \u2014 \u00d7 LINE BET (LINE BET = BET \u00f7 20)</h6><table class="myt-paytable"><tr><th>Symbol</th><th>3\u00d7</th><th>4\u00d7</th><th>5\u00d7</th></tr>'+payRows+'</table></div>'
    +'<div class="myt-msg" id="mythicslotsMsg">Place your bet and spin.</div>'
    +'</div></div></div>';
  wireAmount("mythicslotsBet");
  var stage=$("#mythicslotsStage"),play=$("#mythicslotsPlay"),fsBanner=$("#mythicslotsFs");
  function cellEl(reel,row){return $("#mythicslotsC"+(row*5+reel));}
  function renderGrid(g){
    for(var r=0;r<5;r++)for(var row=0;row<3;row++){
      var el=cellEl(r,row),v=g[r][row];
      el.innerHTML=CFG.syms[v].svg;
      el.classList.toggle("zeus",v===7);
      el.classList.remove("wincell");
    }
  }
  function highlight(ev){
    for(var wi=0;wi<ev.wins.length;wi++){
      var w=ev.wins[wi],line=CFG.lines[w.line];
      for(var r=0;r<w.count;r++)cellEl(r,line[r]).classList.add("wincell");
    }
  }
  function spinAnim(g,dur,cb){
    if(!pending)return;
    if(!ngAnim()){renderGrid(g);cb();return;}
    var stops=[dur,dur+150,dur+300,dur+450,dur+600];
    for(var col=0;col<5;col++){
      (function(cc){
        var iv=_bvSetInterval(function(){
          for(var row=0;row<3;row++){var el=cellEl(cc,row);el.innerHTML=CFG.syms[(Math.random()*9)|0].svg;el.classList.add("spinning");}
        },90);
        pending.ivs.push(iv);
        var tm=_bvSetTimeout(function(){
          _bvClearInterval(iv);
          for(var row=0;row<3;row++){var el=cellEl(cc,row),v=g[cc][row];el.innerHTML=CFG.syms[v].svg;el.classList.remove("spinning");el.classList.add("land");el.classList.toggle("zeus",v===7);}
          sfx.coin();
          if(cc===4)cb();
        },stops[cc]);
        pending.timers.push(tm);
      })(col);
    }
  }
  function resolve(){
    if(!pending)return;var p=pending;pending=null;busy=false;
    play.disabled=false;play.style.opacity="";
    fsBanner.classList.remove("on");
    var mult=p.totalBet>0?p.totalPayout/p.totalBet:0;
    var payout=settle("Mythic Slots",p.totalBet,mult);
    hist.unshift({t:mult>0?fmtMult(mult):"0x",w:mult>1});histChips($("#mythicslotsHist"),hist.slice(0,12));
    $("#mythicslotsLast").textContent=mult>0?fmt$(payout):"\u2014";
    $("#mythicslotsWinAmt").textContent=fmt$(payout);
    var txt="Base win "+fmt$(p.basePay);
    if(p.fsPay!==null)txt+=" + Free Spins "+fmt$(p.fsPay);
    txt+=" = "+fmt$(p.totalPayout)+".";
    $("#mythicslotsMsg").textContent=mult>0?txt:"No win this spin. The gods are silent.";
    if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));if(mult>=10||p.fsPay!==null&&mult>=5)sfx.big();else sfx.win();}
    else if(mult>0){stageFx(stage,"shake");sfx.coin();}
    else{stageFx(stage,"lose");sfx.lose();}
  }
  onCleanup(function(){if(pending){for(var t=0;t<pending.timers.length;t++)_bvClearTimeout(pending.timers[t]);for(var v=0;v<pending.ivs.length;v++)_bvClearInterval(pending.ivs[v]);resolve();}});
  play.addEventListener("click",function(){
    if(busy)return;
    var bet=getBet("mythicslotsBet");if(bet==null)return;
    busy=true;sfx.click();play.disabled=true;play.style.opacity=".5";charge(bet);flyChip(play,stage);
    var totalBet=bet;
    var base=spinGrid(false),be=evalGrid(base,bet);
    var scenes=[{g:base,ev:be,fs:false,cumAfter:be.pay}];
    var totalPayout=be.pay,fsPay=null;
    if(be.scat>=3){
      fsPay=0;var cum=be.pay;
      for(var f=0;f<CFG.fsSpins;f++){
        var fg=spinGrid(true),fe=evalGrid(fg,bet);
        fsPay+=fe.pay;cum+=fe.pay;
        scenes.push({g:fg,ev:fe,fs:true,left:CFG.fsSpins-f,cumAfter:cum});
      }
      totalPayout+=fsPay;
    }
    pending={totalBet:totalBet,totalPayout:totalPayout,basePay:be.pay,fsPay:fsPay,timers:[],ivs:[]};
    $("#mythicslotsWinAmt").textContent="$0.00";
    $("#mythicslotsMsg").textContent=be.scat>=3?"Lightning strikes \u2014 10 FREE SPINS!":"Spinning...";
    fsBanner.classList.remove("on");
    var idx=0;
    function next(){
      if(!pending)return;
      if(idx>=scenes.length){resolve();return;}
      var sc=scenes[idx];idx++;
      if(sc.fs){
        fsBanner.classList.add("on");
        fsBanner.textContent="FREE SPINS \u00b7 "+sc.left+" LEFT \u00b7 FS WIN "+fmt$(sc.cumAfter-be.pay);
      }
      spinAnim(sc.g,sc.fs?230:500,function(){
        if(!pending)return;
        highlight(sc.ev);
        $("#mythicslotsWinAmt").textContent=fmt$(sc.cumAfter);
        if(sc.fs)fsBanner.textContent="FREE SPINS \u00b7 "+(sc.left-1)+" LEFT \u00b7 FS WIN "+fmt$(sc.cumAfter-be.pay);
        var tm=_bvSetTimeout(next,ngAnim()?(sc.fs?430:680):0);
        pending.timers.push(tm);
      });
    }
    next();
  });
  addDust(stage,10);
};
/* ==================== GAMES42: GEMSTONESLOTS ==================== */
BUILDERS.gemstoneslots=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

  var $=function(s){return mount.querySelector(s)};
  var CFG={
    syms:[
      {k:'topaz',name:'Topaz',tier:0,w:30,svg:'<svg viewBox="0 0 48 48"><path d="M24 5c6 8 11 14 11 22a11 11 0 0 1-22 0c0-8 5-14 11-22Z" fill="rgba(245,185,66,.45)" stroke="#e8a90c" stroke-width="2.2" stroke-linejoin="round"/><path d="M24 14v24M16 24h16" stroke="#e8a90c" stroke-width="1.5"/></svg>'},
      {k:'amethyst',name:'Amethyst',tier:0,w:25,svg:'<svg viewBox="0 0 48 48"><path d="M24 4 40 15v18L24 44 8 33V15L24 4Z" fill="rgba(167,110,255,.4)" stroke="#9354d6" stroke-width="2.2" stroke-linejoin="round"/><path d="M8 15h32M24 4v40M8 33h32" stroke="#9354d6" stroke-width="1.4"/></svg>'},
      {k:'ruby',name:'Ruby',tier:1,w:14,svg:'<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" fill="rgba(230,57,70,.38)" stroke="#e63946" stroke-width="2.2"/><circle cx="24" cy="24" r="9.5" fill="none" stroke="#ff8296" stroke-width="1.6"/><path d="M24 8v32M8 24h32M13 13l22 22M35 13 13 35" stroke="#e63946" stroke-width="1.2"/></svg>'},
      {k:'sapphire',name:'Sapphire',tier:1,w:12,svg:'<svg viewBox="0 0 48 48"><ellipse cx="24" cy="24" rx="12" ry="17" fill="rgba(63,140,255,.4)" stroke="#2f6fe4" stroke-width="2.2"/><ellipse cx="24" cy="24" rx="6" ry="10" fill="none" stroke="#9dc2ff" stroke-width="1.5"/><circle cx="20" cy="15" r="2.2" fill="#fff" opacity=".85"/></svg>'},
      {k:'emerald',name:'Emerald',tier:1,w:10,svg:'<svg viewBox="0 0 48 48"><path d="M13 8h22l5 7v25H8V15l5-7Z" fill="rgba(46,204,113,.35)" stroke="#1fae5f" stroke-width="2.2" stroke-linejoin="round"/><path d="M8 15h32M14 40V15M34 40V15" stroke="#1fae5f" stroke-width="1.4"/></svg>'},
      {k:'diamond',name:'Diamond',tier:2,w:4,svg:'<svg viewBox="0 0 48 48"><path d="M14 7h20l8 11-18 24L6 18l8-11Z" fill="rgba(140,230,255,.3)" stroke="#5cc8e8" stroke-width="2.2" stroke-linejoin="round"/><path d="M6 18h36M24 42 17 18l7-11 7 11-7 24M14 7l3 11M34 7l-3 11" stroke="#5cc8e8" stroke-width="1.4" fill="none"/></svg>'}
    ],
    ladder:[[1.11,2.77,6.45],[1.63,4.45,11.1],[3.18,8.55,26.7]],
    tierNames:['Common','Common','Rare','Rare','Rare','Royal'],
    minCount:8,
    maxSteps:25
  };
  var TW=0,i;for(i=0;i<CFG.syms.length;i++)TW+=CFG.syms[i].w;
  function pick(){var r=Math.random()*TW;for(var k=0;k<CFG.syms.length;k++){r-=CFG.syms[k].w;if(r<0)return k;}return 0;}
  function evaluate(grid){
    var counts=[0,0,0,0,0,0],c,s;
    for(c=0;c<20;c++)counts[grid[c]]++;
    var winCells=[],pay=0,wins=[];
    for(s=0;s<6;s++){
      var n=counts[s];
      if(n>=CFG.minCount){
        var li=n>=12?2:(n>=10?1:0);
        var amt=CFG.ladder[CFG.syms[s].tier][li];
        pay+=amt;wins.push({sym:s,count:n,amt:amt});
        for(c=0;c<20;c++)if(grid[c]===s)winCells.push(c);
      }
    }
    return {pay:pay,winCells:winCells,wins:wins};
  }
  function collapse(grid,winCells){
    var isWin={},j;for(j=0;j<winCells.length;j++)isWin[winCells[j]]=1;
    var out=new Array(20),newCells=[];
    for(var col=0;col<5;col++){
      var surv=[];
      for(var row=0;row<4;row++){var idx=row*5+col;if(!isWin[idx])surv.push(grid[idx]);}
      var fresh=4-surv.length;
      for(var r2=0;r2<4;r2++){
        var idx2=r2*5+col;
        if(r2<fresh){out[idx2]=pick();newCells.push(idx2);}
        else out[idx2]=surv[r2-fresh];
      }
    }
    return {grid:out,newCells:newCells};
  }
  var hist=[],busy=false,pending=null;
  var payRows='';
  for(i=0;i<6;i++){var s=CFG.syms[i],L=CFG.ladder[s.tier];payRows+='<tr><td><span class="gst-sym">'+s.svg+'</span>'+s.name+' <small style="color:#c4a8ff">('+CFG.tierNames[i]+')</small></td><td>'+L[0]+'\u00d7</td><td>'+L[1]+'\u00d7</td><td>'+L[2]+'\u00d7</td></tr>';}
  var cells='';for(i=0;i<20;i++)cells+='<div class="gst-cell" id="gemstoneslotsC'+i+'">'+CFG.syms[i%6].svg+'</div>';
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("gemstoneslotsBet","10.00")
    +'<div class="stat-grid" style="grid-template-columns:1fr"><div class="stat-box"><small>Grid</small><b>5\u00d74 \u00b7 cluster pays \u00b7 cascades</b></div></div>'
    +'<button class="action-btn" id="gemstoneslotsPlay" style="margin-top:14px">Drop Gems</button>'
    +'<div class="stat-grid"><div class="stat-box"><small>Last Win</small><b id="gemstoneslotsLast" style="color:var(--green)">\u2014</b></div><div class="stat-box"><small>Top Cluster</small><b>Diamond 12+ \u00b7 26.7\u00d7</b></div></div>'
    +'<div class="hist-row" id="gemstoneslotsHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>5\u00d74 grid (20 gems), cluster pays: count each gem type anywhere on the grid \u2014 8 or more of a kind pays \u00d7 your TOTAL bet by tier ladder (counts 8\u20139 / 10\u201311 / 12+):</li>'
    +'<li>Common \u2014 Topaz, Amethyst: 1.11\u00d7 / 2.77\u00d7 / 6.45\u00d7. Rare \u2014 Ruby, Sapphire, Emerald: 1.63\u00d7 / 4.45\u00d7 / 11.1\u00d7. Royal \u2014 Diamond: 3.18\u00d7 / 8.55\u00d7 / 26.7\u00d7.</li>'
    +'<li>Several gem types can pay on the same drop; their payouts add.</li>'
    +'<li>CASCADES: winning gems pop, the gems above fall down and new gems drop in. The new grid is re-evaluated and cascades chain (max 25 steps) until a drop has no win. Every cascade step adds to one total payout, settled once at the end.</li>'
    +'<li>Draw weights (of 95): Topaz 30 \u00b7 Amethyst 25 \u00b7 Ruby 14 \u00b7 Sapphire 12 \u00b7 Emerald 10 \u00b7 Diamond 4. Every cell is an independent weighted draw.</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="gemstoneslotsStage">'+gameHeaderHtml('gemstoneslots')
    +'<div class="gst-stage">'
    +'<div class="gst-winbox"><small>TOTAL WIN</small><b id="gemstoneslotsWinAmt">$0.00</b></div>'
    +'<div class="gst-cascade" id="gemstoneslotsCascade"></div>'
    +'<div class="gst-grid" id="gemstoneslotsGrid">'+cells+'</div>'
    +'<div class="gst-paywrap"><h6>CLUSTER PAYTABLE \u2014 \u00d7 TOTAL BET BY COUNT ANYWHERE</h6><table class="gst-paytable"><tr><th>Gem</th><th>8\u20139</th><th>10\u201311</th><th>12+</th></tr>'+payRows+'</table></div>'
    +'<div class="gst-msg" id="gemstoneslotsMsg">Place your bet and drop the gems.</div>'
    +'</div></div></div>';
  wireAmount("gemstoneslotsBet");
  var stage=$("#gemstoneslotsStage"),play=$("#gemstoneslotsPlay"),cascadeEl=$("#gemstoneslotsCascade");
  function renderGrid(grid,newCells){
    var isNew={},j;
    if(newCells)for(j=0;j<newCells.length;j++)isNew[newCells[j]]=1;
    for(var c=0;c<20;c++){
      var el=$("#gemstoneslotsC"+c);
      el.innerHTML=CFG.syms[grid[c]].svg;
      el.classList.remove("wincell");
      el.classList.toggle("dropin",!!isNew[c]&&ngAnim());
    }
  }
  function resolve(){
    if(!pending)return;var p=pending;pending=null;busy=false;
    play.disabled=false;play.style.opacity="";
    cascadeEl.classList.remove("on");
    var mult=p.totalBet>0?p.totalPayout/p.totalBet:0;
    var payout=settle("Gemstone Slots",p.totalBet,mult);
    hist.unshift({t:mult>0?fmtMult(mult):"0x",w:mult>1});histChips($("#gemstoneslotsHist"),hist.slice(0,12));
    $("#gemstoneslotsLast").textContent=mult>0?fmt$(payout):"\u2014";
    $("#gemstoneslotsWinAmt").textContent=fmt$(payout);
    $("#gemstoneslotsMsg").textContent=mult>0?("Cascades paid "+fmt$(p.totalPayout)+" over "+p.steps+" winning drop"+(p.steps===1?"":"s")+"."): "No cluster of 8+. Drop again!";
    if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));if(mult>=10)sfx.big();else sfx.win();}
    else if(mult>0){stageFx(stage,"shake");sfx.coin();}
    else{stageFx(stage,"lose");sfx.lose();}
  }
  onCleanup(function(){if(pending){for(var t=0;t<pending.timers.length;t++)_bvClearTimeout(pending.timers[t]);resolve();}});
  play.addEventListener("click",function(){
    if(busy)return;
    var bet=getBet("gemstoneslotsBet");if(bet==null)return;
    busy=true;sfx.click();play.disabled=true;play.style.opacity=".5";charge(bet);flyChip(play,stage);
    // precompute the whole cascade chain
    var grid=[],c;for(c=0;c<20;c++)grid.push(pick());
    var steps=[],totalMult=0,cur=grid;
    for(var st=0;st<CFG.maxSteps;st++){
      var ev=evaluate(cur);
      if(ev.pay<=0){steps.push({grid:cur,ev:ev,last:true});break;}
      totalMult+=ev.pay;
      var col=collapse(cur,ev.winCells);
      steps.push({grid:cur,ev:ev,after:col.grid,newCells:col.newCells,cumMult:totalMult});
      cur=col.grid;
      if(st===CFG.maxSteps-1)steps.push({grid:cur,ev:{pay:0,winCells:[],wins:[]},last:true});
    }
    pending={totalBet:bet,totalPayout:totalMult*bet,steps:0,timers:[]};
    $("#gemstoneslotsWinAmt").textContent="$0.00";
    $("#gemstoneslotsMsg").textContent="Dropping...";
    var winSteps=0;for(var q=0;q<steps.length;q++)if(steps[q].ev.pay>0)winSteps++;
    pending.steps=winSteps;
    if(!ngAnim()){
      renderGrid(steps[steps.length-1].grid,null);
      resolve();return;
    }
    var idx=0;
    function next(){
      if(!pending)return;
      if(idx>=steps.length){resolve();return;}
      var s=steps[idx];idx++;
      renderGrid(s.grid,idx===1?null:(steps[idx-2]?steps[idx-2].newCells:null));
      if(s.ev.pay>0){
        for(var j=0;j<s.ev.winCells.length;j++)$("#gemstoneslotsC"+s.ev.winCells[j]).classList.add("wincell");
        sfx.coin();
        cascadeEl.classList.add("on");
        cascadeEl.textContent="CASCADE \u00d7"+idx+" \u00b7 +"+fmt$(s.ev.pay*bet)+" \u00b7 TOTAL "+fmt$(s.cumMult*bet);
        $("#gemstoneslotsWinAmt").textContent=fmt$(s.cumMult*bet);
        var tm=_bvSetTimeout(function(){
          if(!pending)return;
          if(s.after)renderGrid(s.after,s.newCells);
          var tm2=_bvSetTimeout(next,300);pending.timers.push(tm2);
        },520);
        pending.timers.push(tm);
      }else{
        cascadeEl.classList.remove("on");
        var tm3=_bvSetTimeout(next,60);pending.timers.push(tm3);
      }
    }
    next();
  });
  addDust(stage,10);
};
/* ==================== GAMES42: ADVENTURESLOTS ==================== */
BUILDERS.adventureslots=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

  var $=function(s){return mount.querySelector(s)};
  var CFG={
    syms:[
      {k:'idol',name:'Golden Idol',svg:'<svg viewBox="0 0 48 48"><path d="M12 6h24l3 8v20l-5 8H14l-5-8V14l3-8Z" fill="rgba(245,185,66,.4)" stroke="#c9930a" stroke-width="2.2" stroke-linejoin="round"/><circle cx="18" cy="21" r="2.6" fill="#7c2d12"/><circle cx="30" cy="21" r="2.6" fill="#7c2d12"/><path d="M16 32h16M19 38h10" stroke="#7c2d12" stroke-width="2.2" stroke-linecap="round"/><path d="M10 12h28" stroke="#c9930a" stroke-width="2"/></svg>'},
      {k:'parrot',name:'Parrot',svg:'<svg viewBox="0 0 48 48" fill="none" stroke-linejoin="round"><path d="M20 44c-2-10 0-20 6-27 5-6 13-7 16-2 2 4 0 8-3 10 2 8-2 16-9 19H20Z" fill="rgba(46,204,113,.4)" stroke="#1fae5f" stroke-width="2.2"/><path d="M38 14l7-2-3 6-4 1z" fill="#ffd479" stroke="#c9930a" stroke-width="1.6"/><circle cx="33" cy="18" r="1.8" fill="#123"/><path d="M26 30c4 1 8 0 11-2M14 44c3-6 8-10 13-12" stroke="#e63946" stroke-width="2.4"/></svg>'},
      {k:'temple',name:'Jungle Temple',svg:'<svg viewBox="0 0 48 48" fill="none" stroke="#d8c391" stroke-width="2.1" stroke-linejoin="round"><path d="M6 42h36M10 42V35h28v7M14 35v-6h20v6M18 29v-6h12v6M21 23v-5h6v5M24 18v-4" /><path d="M4 42c4-3 8-3 11 0M33 42c3-3 7-3 11 0" stroke="#2ecc71"/></svg>'},
      {k:'bridge',name:'Rope Bridge',svg:'<svg viewBox="0 0 48 48" fill="none" stroke="#c98d4b" stroke-width="2.2" stroke-linecap="round"><path d="M6 10v30M42 10v30"/><path d="M6 14c12 9 24 9 36 0M6 30c12 9 24 9 36 0" stroke="#9c6b30"/><path d="M13 20.5v7M20 23.5v7M27 23.5v7M34 20.5v7"/></svg>'},
      {k:'map',name:'Treasure Map',svg:'<svg viewBox="0 0 48 48"><path d="M8 10l10-3 12 3 10-3v30l-10 3-12-3-10 3V10Z" fill="rgba(232,213,163,.35)" stroke="#b89b5e" stroke-width="2.1" stroke-linejoin="round"/><path d="M18 7v30M30 10v30" stroke="#b89b5e" stroke-width="1.5"/><path d="M13 30c5-1 6-6 11-6" stroke="#7c5a10" stroke-width="1.8" stroke-dasharray="3.5 3" fill="none"/><path d="M28 15l7 7M35 15l-7 7" stroke="#e63946" stroke-width="2.4" stroke-linecap="round"/></svg>'},
      {k:'torch',name:'Torch',svg:'<svg viewBox="0 0 48 48"><path d="M24 4c3 5 7 8 7 14a7 7 0 0 1-14 0c0-3 1.4-5.4 3-8 .6 1.8 1.6 3 3 4-.6-3.6 0-7 1-10Z" fill="rgba(255,138,61,.55)" stroke="#e56f1c" stroke-width="2" stroke-linejoin="round"/><path d="M19 27h10l-1.6 15h-6.8L19 27Z" fill="rgba(156,107,48,.5)" stroke="#9c6b30" stroke-width="2" stroke-linejoin="round"/></svg>'},
      {k:'explorer',name:'Explorer \u00b7 WILD',svg:'<svg viewBox="0 0 48 48"><path d="M14 22a10 9 0 0 1 20 0l9 3c1.4.5 1.2 2.4-.3 2.7C36 29.4 12 29.4 5.3 27.7 3.8 27.4 3.6 25.5 5 25l9-3Z" fill="rgba(201,162,79,.55)" stroke="#a87e2a" stroke-width="2.1" stroke-linejoin="round"/><path d="M14.5 21.5h19" stroke="#7c5a10" stroke-width="2.4"/><text x="24" y="42" text-anchor="middle" font-family="Arial" font-weight="800" font-size="8" fill="#ffd479">WILD</text></svg>'},
      {k:'compass',name:'Compass \u00b7 SCATTER',svg:'<svg viewBox="0 0 48 48"><circle cx="24" cy="21" r="15" fill="rgba(255,212,121,.14)" stroke="#ffd479" stroke-width="1.9"/><path d="M24 10l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill="rgba(255,212,121,.5)" stroke="#c9930a" stroke-width="1.4" stroke-linejoin="round"/><circle cx="24" cy="21" r="1.9" fill="#ffd479"/><text x="24" y="45" text-anchor="middle" font-family="Arial" font-weight="800" font-size="6.2" fill="#ffd479">SCATTER</text></svg>'}
    ],
    baseW:[7,9,11,13,15,17,4,2],
    pay:[[32,99,295],[19,62,178],[12,37,124],[10,25,74],[6,18,47],[6,12,35]],
    lines:[[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,0,0],[2,2,1,2,2],[1,0,0,0,1],[1,2,2,2,1],[1,0,1,2,1],[1,2,1,0,1],[0,1,1,1,0],[2,1,1,1,2],[0,1,0,1,0],[2,1,2,1,2],[1,1,0,1,1],[1,1,2,1,1],[0,2,1,2,0],[2,0,1,0,2],[1,0,2,0,1],[0,2,0,2,0],[2,0,2,0,2],[0,0,2,2,0],[2,2,0,0,2],[1,2,0,2,1]],
    wheel:{values:[5,8,10,15,25,50],weights:[30,25,20,12,8,5],colors:['#b3122e','#14532d','#1d4ed8','#7c2d12','#5b21b6','#8a6d1f']}
  };
  var TW=0,i;for(i=0;i<CFG.baseW.length;i++)TW+=CFG.baseW[i];
  function drawSym(){
    var x=Math.random()*TW;
    for(var k=0;k<CFG.baseW.length;k++){x-=CFG.baseW[k];if(x<0)return k;}
    return 0;
  }
  function spinGrid(){
    var g=[],r,row;
    for(r=0;r<5;r++){g.push([]);for(row=0;row<3;row++)g[r].push(drawSym());}
    return g;
  }
  function evalGrid(g,bet){
    var lb=bet/25,pay=0,scat=0,wins=[],r,row,li;
    for(r=0;r<5;r++)for(row=0;row<3;row++)if(g[r][row]===7)scat++;
    for(li=0;li<CFG.lines.length;li++){
      var line=CFG.lines[li],sym=-1,count=0;
      for(r=0;r<5;r++){
        var c=g[r][line[r]];
        if(c===7)break;
        if(c===6){count++;continue;}
        if(sym===-1){sym=c;count++;}
        else if(c===sym)count++;
        else break;
      }
      var best=0,bestSym=-1,bestCount=0;
      if(sym>=0&&count>=3){best=CFG.pay[sym][count-3];bestSym=sym;bestCount=count;}
      var wc=0;for(r=0;r<5;r++){if(g[r][line[r]]===6)wc++;else break;}
      if(wc>=3&&CFG.pay[0][wc-3]>best){best=CFG.pay[0][wc-3];bestSym=0;bestCount=wc;}
      if(sym===-1&&count>=3&&CFG.pay[0][count-3]>best){best=CFG.pay[0][count-3];bestSym=0;bestCount=count;}
      if(best>0){pay+=best*lb;wins.push({line:li,sym:bestSym,count:bestCount,amt:best*lb});}
    }
    return {pay:pay,scat:scat,wins:wins};
  }
  function pickWheel(){
    var x=Math.random()*100;
    for(var k=0;k<CFG.wheel.weights.length;k++){x-=CFG.wheel.weights[k];if(x<0)return k;}
    return 0;
  }
  var hist=[],busy=false,pending=null,wheelRot=0;
  var payRows='';
  for(i=0;i<6;i++){var s=CFG.syms[i];payRows+='<tr><td><span class="adv-sym">'+s.svg+'</span>'+s.name+'</td><td>'+CFG.pay[i][0]+'\u00d7</td><td>'+CFG.pay[i][1]+'\u00d7</td><td>'+CFG.pay[i][2]+'\u00d7</td></tr>';}
  payRows+='<tr><td><span class="adv-sym">'+CFG.syms[6].svg+'</span>Explorer \u00b7 WILD</td><td colspan="3">All reels \u00b7 substitutes except Scatter</td></tr>';
  payRows+='<tr><td><span class="adv-sym">'+CFG.syms[7].svg+'</span>Compass \u00b7 SCATTER</td><td colspan="3">3+ anywhere = Bonus Wheel</td></tr>';
  var cells='';for(i=0;i<15;i++)cells+='<div class="adv-cell" id="adventureslotsC'+i+'">'+CFG.syms[i%6].svg+'</div>';
  var segLabels='';
  for(i=0;i<6;i++){segLabels+='<span class="adv-seglabel" style="transform:rotate('+(i*60)+'deg) translate(14px,-96px)">'+CFG.wheel.values[i]+'\u00d7</span>';}
  var grad='conic-gradient(from -30deg';
  for(i=0;i<6;i++)grad+=','+CFG.wheel.colors[i]+' '+(i*60)+'deg '+((i+1)*60)+'deg';
  grad+=')';
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("adventureslotsBet","10.00")
    +'<div class="stat-grid" style="grid-template-columns:1fr"><div class="stat-box"><small>Lines</small><b>25 lines \u00b7 line bet = bet \u00f7 25</b></div></div>'
    +'<button class="action-btn" id="adventureslotsPlay" style="margin-top:14px">Spin</button>'
    +'<div class="stat-grid"><div class="stat-box"><small>Last Win</small><b id="adventureslotsLast" style="color:var(--green)">\u2014</b></div><div class="stat-box"><small>Feature</small><b>Bonus Wheel \u00b7 up to 50\u00d7</b></div></div>'
    +'<div class="hist-row" id="adventureslotsHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>5 reels \u00d7 3 rows, 25 paylines, wins pay left-to-right from reel 1. Only the highest win per line is paid. Line bet = total bet \u00f7 25.</li>'
    +'<li>Paytable (\u00d7 line bet, for 3 / 4 / 5 of a kind): Golden Idol 32 / 99 / 295 \u00b7 Parrot 19 / 62 / 178 \u00b7 Jungle Temple 12 / 37 / 124 \u00b7 Rope Bridge 10 / 25 / 74 \u00b7 Treasure Map 6 / 18 / 47 \u00b7 Torch 6 / 12 / 35.</li>'
    +'<li>Explorer is WILD on all reels and substitutes for every symbol except Scatter. A run of pure Wilds pays as Golden Idol.</li>'
    +'<li>Compass is SCATTER: 3 or more anywhere trigger the BONUS WHEEL. The wheel awards a multiple of your TOTAL bet, added to the spin\u2019s line wins and settled together, once.</li>'
    +'<li>Bonus Wheel segments and their chances: 5\u00d7 \u2014 30% \u00b7 8\u00d7 \u2014 25% \u00b7 10\u00d7 \u2014 20% \u00b7 15\u00d7 \u2014 12% \u00b7 25\u00d7 \u2014 8% \u00b7 50\u00d7 \u2014 5% (expected value 11.8\u00d7 total bet).</li>'
    +'<li>Per-reel draw weights (of 78): Idol 7 \u00b7 Parrot 9 \u00b7 Temple 11 \u00b7 Bridge 13 \u00b7 Map 15 \u00b7 Torch 17 \u00b7 Explorer (Wild) 4 \u00b7 Compass (Scatter) 2. Every cell is an independent weighted draw.</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="adventureslotsStage">'+gameHeaderHtml('adventureslots')
    +'<div class="adv-stage" id="adventureslotsBox">'
    +'<div class="adv-winbox"><small>TOTAL WIN</small><b id="adventureslotsWinAmt">$0.00</b></div>'
    +'<div class="adv-grid" id="adventureslotsGrid">'+cells+'</div>'
    +'<div class="adv-paywrap"><h6>PAYTABLE \u2014 \u00d7 LINE BET (LINE BET = BET \u00f7 25)</h6><table class="adv-paytable"><tr><th>Symbol</th><th>3\u00d7</th><th>4\u00d7</th><th>5\u00d7</th></tr>'+payRows+'</table></div>'
    +'<div class="adv-msg" id="adventureslotsMsg">Place your bet and spin.</div>'
    +'<div class="adv-wheelwrap" id="adventureslotsWheelWrap"><div class="adv-wheeltitle">BONUS WHEEL</div>'
    +'<div class="adv-wheelbox"><div class="adv-pointer"></div><div class="adv-wheel" id="adventureslotsWheel" style="background:'+grad+'">'+segLabels+'</div><div class="adv-wheelhub">\u2726</div></div>'
    +'<div class="adv-wheelresult" id="adventureslotsWheelResult"></div></div>'
    +'</div></div></div>';
  wireAmount("adventureslotsBet");
  var stage=$("#adventureslotsStage"),play=$("#adventureslotsPlay"),wheelWrap=$("#adventureslotsWheelWrap"),wheelEl=$("#adventureslotsWheel"),wheelResult=$("#adventureslotsWheelResult");
  function cellEl(reel,row){return $("#adventureslotsC"+(row*5+reel));}
  function renderGrid(g){
    for(var r=0;r<5;r++)for(var row=0;row<3;row++){
      var el=cellEl(r,row),v=g[r][row];
      el.innerHTML=CFG.syms[v].svg;
      el.classList.toggle("wild",v===6);
      el.classList.remove("wincell");
    }
  }
  function highlight(ev){
    for(var wi=0;wi<ev.wins.length;wi++){
      var w=ev.wins[wi],line=CFG.lines[w.line];
      for(var r=0;r<w.count;r++)cellEl(r,line[r]).classList.add("wincell");
    }
  }
  function spinAnim(g,cb){
    if(!pending)return;
    if(!ngAnim()){renderGrid(g);cb();return;}
    var stops=[500,650,800,950,1100];
    for(var col=0;col<5;col++){
      (function(cc){
        var iv=_bvSetInterval(function(){
          for(var row=0;row<3;row++){var el=cellEl(cc,row);el.innerHTML=CFG.syms[(Math.random()*8)|0].svg;el.classList.add("spinning");}
        },90);
        pending.ivs.push(iv);
        var tm=_bvSetTimeout(function(){
          _bvClearInterval(iv);
          for(var row=0;row<3;row++){var el=cellEl(cc,row),v=g[cc][row];el.innerHTML=CFG.syms[v].svg;el.classList.remove("spinning");el.classList.add("land");el.classList.toggle("wild",v===6);}
          sfx.coin();
          if(cc===4)cb();
        },stops[cc]);
        pending.timers.push(tm);
      })(col);
    }
  }
  function runWheel(segIdx,done){
    wheelWrap.classList.add("on");
    wheelResult.textContent="Spinning...";
    sfx.click();
    var center=segIdx*60+30;
    var targetMod=(((-center)%360)+360)%360;
    var curMod=((wheelRot%360)+360)%360;
    var add=360*5+((targetMod-curMod)+360)%360;
    wheelRot+=add;
    if(ngAnim()){
      wheelEl.style.transition="transform 3.4s cubic-bezier(.12,.8,.16,1)";
      wheelEl.style.transform="rotate("+wheelRot+"deg)";
      var tm=_bvSetTimeout(function(){
        wheelResult.textContent="WHEEL AWARD: "+CFG.wheel.values[segIdx]+"\u00d7 \u00b7 "+fmt$(CFG.wheel.values[segIdx]*pending.totalBet);
        sfx.big();
        var tm2=_bvSetTimeout(function(){wheelWrap.classList.remove("on");done();},1000);
        pending.timers.push(tm2);
      },3500);
      pending.timers.push(tm);
    }else{
      wheelEl.style.transition="none";
      wheelEl.style.transform="rotate("+wheelRot+"deg)";
      wheelResult.textContent="WHEEL AWARD: "+CFG.wheel.values[segIdx]+"\u00d7 \u00b7 "+fmt$(CFG.wheel.values[segIdx]*pending.totalBet);
      var tm3=_bvSetTimeout(function(){wheelWrap.classList.remove("on");done();},350);
      pending.timers.push(tm3);
    }
  }
  function resolve(){
    if(!pending)return;var p=pending;pending=null;busy=false;
    play.disabled=false;play.style.opacity="";
    wheelWrap.classList.remove("on");
    var mult=p.totalBet>0?p.totalPayout/p.totalBet:0;
    var payout=settle("Adventure Slots",p.totalBet,mult);
    hist.unshift({t:mult>0?fmtMult(mult):"0x",w:mult>1});histChips($("#adventureslotsHist"),hist.slice(0,12));
    $("#adventureslotsLast").textContent=mult>0?fmt$(payout):"\u2014";
    $("#adventureslotsWinAmt").textContent=fmt$(payout);
    var txt="Line wins "+fmt$(p.linePay);
    if(p.wheelPay!==null)txt+=" + Wheel "+fmt$(p.wheelPay);
    txt+=" = "+fmt$(p.totalPayout)+".";
    $("#adventureslotsMsg").textContent=mult>0?txt:"No win this spin. The trail goes cold.";
    if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));if(mult>=10)sfx.big();else sfx.win();}
    else if(mult>0){stageFx(stage,"shake");sfx.coin();}
    else{stageFx(stage,"lose");sfx.lose();}
  }
  onCleanup(function(){if(pending){for(var t=0;t<pending.timers.length;t++)_bvClearTimeout(pending.timers[t]);for(var v=0;v<pending.ivs.length;v++)_bvClearInterval(pending.ivs[v]);resolve();}});
  play.addEventListener("click",function(){
    if(busy)return;
    var bet=getBet("adventureslotsBet");if(bet==null)return;
    busy=true;sfx.click();play.disabled=true;play.style.opacity=".5";charge(bet);flyChip(play,stage);
    var g=spinGrid(),ev=evalGrid(g,bet);
    var wheelPay=null,segIdx=-1;
    var totalPayout=ev.pay;
    if(ev.scat>=3){
      segIdx=pickWheel();
      wheelPay=CFG.wheel.values[segIdx]*bet;
      totalPayout+=wheelPay;
    }
    pending={totalBet:bet,totalPayout:totalPayout,linePay:ev.pay,wheelPay:wheelPay,timers:[],ivs:[]};
    $("#adventureslotsWinAmt").textContent="$0.00";
    $("#adventureslotsMsg").textContent="Spinning...";
    spinAnim(g,function(){
      if(!pending)return;
      highlight(ev);
      $("#adventureslotsWinAmt").textContent=fmt$(ev.pay);
      if(segIdx>=0){
        $("#adventureslotsMsg").textContent="Compass \u00d7 "+ev.scat+" \u2014 BONUS WHEEL!";
        var tm=_bvSetTimeout(function(){if(pending)runWheel(segIdx,function(){if(pending)resolve();});},ngAnim()?650:60);
        pending.timers.push(tm);
      }else{
        var tm2=_bvSetTimeout(function(){if(pending)resolve();},ngAnim()?550:0);
        pending.timers.push(tm2);
      }
    });
  });
  addDust(stage,10);
};
/* ==================== GAMES42: BACCARATSPEED ==================== */
BUILDERS.baccaratspeed=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

  /* RTP basis: standard punto banco with 6-deck shoe and 5% banker commission.
     Banker bet RTP ~98.94%, Player ~98.76%, blended headline 98.8% as listed. */
  var $=function(s){return mount.querySelector(s)};
  var SUITS=["\u2660","\u2665","\u2666","\u2663"],RANKS=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  var shoe=[];
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}}
  function buildShoe(){shoe=[];for(var d=0;d<6;d++)for(var s=0;s<4;s++)for(var r=0;r<13;r++)shoe.push({r:RANKS[r],s:SUITS[s],red:(s===1||s===2)});shuffle(shoe)}
  function draw(){if(shoe.length<60)buildShoe();return shoe.pop()}
  function bv(c){var r=c.r;if(r==="A")return 1;if(r==="J"||r==="Q"||r==="K"||r==="10")return 0;return parseInt(r,10)}
  function total(h){var t=0;for(var i=0;i<h.length;i++)t+=bv(h[i]);return t%10}
  var hist=[],road=[],choice="banker",dealing=false,lastBet=null,lastChoice=null;
  function cardHtml(c,d){return '<div class="bac-card '+(c.red?"red ":"")+(ngAnim()?"bac-card-in":"")+'"'+(d?' style="animation-delay:'+(d*60)+'ms"':"")+'>'+'<div class="rk">'+c.r+'</div><div class="st">'+c.s+'</div></div>'}
  function render(p,b){
    var ph="",bh="";
    for(var i=0;i<p.length;i++)ph+=cardHtml(p[i],i);
    for(var j=0;j<b.length;j++)bh+=cardHtml(b[j],j);
    $("#baccaratspeedPHand").innerHTML=ph;$("#baccaratspeedBHand").innerHTML=bh;
    $("#baccaratspeedPTotal").textContent=p.length?total(p):"";
    $("#baccaratspeedBTotal").textContent=b.length?total(b):"";
    $("#baccaratspeedShoeN").textContent="Shoe: "+shoe.length+" cards";
  }
  function syncSpots(){var sp=$("#baccaratspeedSpots").querySelectorAll(".bs-spot");for(var i=0;i<sp.length;i++)sp[i].classList.toggle("on",sp[i].getAttribute("data-v")===choice)}
  function renderRoad(){
    var cols=Math.max(12,Math.ceil(road.length/6)),htm="",i,r,c,idx;
    for(c=0;c<cols;c++){for(r=0;r<6;r++){idx=c*6+r;if(idx<road.length){var w=road[idx];htm+='<span class="bs-cell '+w+'">'+w.charAt(0).toUpperCase()+'</span>'}else{htm+='<span class="bs-cell"></span>'}}}
    $("#baccaratspeedRoad").innerHTML=htm;
    var rd=$("#baccaratspeedRoad");rd.scrollLeft=rd.scrollWidth;
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("baccaratspeedBet","10.00")
    +'<div class="field"><label>Bet on</label><div class="seg" id="baccaratspeedChoice">'
    +'<button data-v="player">Player 1:1</button><button data-v="banker" class="on">Banker 0.95:1</button><button data-v="tie">Tie 8:1</button>'
    +'</div></div>'
    +'<button class="action-btn" id="baccaratspeedPlay" style="margin-top:16px">Deal — Turbo</button>'
    +'<button class="mini-btn bs-rebet" id="baccaratspeedRebet" style="height:42px" disabled>Rebet &amp; Deal</button>'
    +'<div class="hist-row" id="baccaratspeedHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li><b>Turbo deal:</b> cards stage in about 100ms — same punto banco rules, dealt fast.</li>'
    +'<li><b>Banker</b> pays <b>0.95:1</b> (5% commission) &bull; <b>Player</b> pays <b>1:1</b> &bull; <b>Tie</b> pays <b>8:1</b>.</li>'
    +'<li>Standard third-card rules from a <b>6-deck shoe</b>; naturals (8 or 9) stand.</li>'
    +'<li>Player/Banker bets <b>push</b> when the hand is a tie.</li>'
    +'<li><b>Bead Road</b> grid (6 rows) records every result: red = Banker, blue = Player, green = Tie.</li>'
    +'<li><b>Rebet &amp; Deal</b> repeats your last bet amount and side in one tap.</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="baccaratspeedStage">'+gameHeaderHtml('baccaratspeed')+'<div class="bs-rays"></div>'
    +'<div class="bs-felt">'
    +'<div class="bs-rail"></div>'
    +'<div class="bs-title">BACCARAT SPEED</div>'
    +'<div class="bs-barwrap"><div class="bs-bar" id="baccaratspeedBar"></div></div>'
    +'<div class="bs-shoen" id="baccaratspeedShoeN"></div>'
    +'<div class="bs-row">'
    +'<div class="bs-side" id="baccaratspeedPSide"><div class="bs-zlabel">Player</div><div class="bs-hand" id="baccaratspeedPHand"></div><div><span class="bs-total" id="baccaratspeedPTotal"></span></div></div>'
    +'<div class="bs-side" id="baccaratspeedBSide"><div class="bs-zlabel">Banker</div><div class="bs-hand" id="baccaratspeedBHand"></div><div><span class="bs-total" id="baccaratspeedBTotal"></span></div></div>'
    +'</div>'
    +'<div class="bs-spots" id="baccaratspeedSpots"><div class="bs-spot" data-v="player">Player<small>pays 1:1</small></div><div class="bs-spot on" data-v="banker">Banker<small>pays 0.95:1</small></div><div class="bs-spot" data-v="tie">Tie<small>pays 8:1</small></div></div>'
    +'<div class="bs-roadwrap"><div class="bs-roadcap">BEAD ROAD</div><div class="bs-road" id="baccaratspeedRoad"></div></div>'
    +'<div class="bs-msg" id="baccaratspeedMsg">Choose a side and press Deal.</div>'
    +'</div></div></div>';
  wireAmount("baccaratspeedBet");
  buildShoe();
  render([],[]);syncSpots();renderRoad();
  var segs=$("#baccaratspeedChoice").querySelectorAll("button");
  for(var k=0;k<segs.length;k++){segs[k].addEventListener("click",function(){for(var i=0;i<segs.length;i++)segs[i].classList.remove("on");this.classList.add("on");choice=this.getAttribute("data-v");syncSpots();sfx.click()})}
  function playRound(){
    if(dealing)return;
    var bet=getBet("baccaratspeedBet");if(bet==null)return;
    charge(bet);flyChip($("#baccaratspeedPlay"),$("#baccaratspeedStage"));dealing=true;sfx.click();
    lastBet=bet;lastChoice=choice;
    var bar=$("#baccaratspeedBar");bar.classList.remove("go");void bar.offsetWidth;if(ngAnim())bar.classList.add("go");
    $("#baccaratspeedMsg").textContent="Turbo dealing...";
    $("#baccaratspeedPSide").classList.remove("bs-winner");$("#baccaratspeedBSide").classList.remove("bs-winner");
    var p=[draw(),draw()],b=[draw(),draw()];
    render(p,b);
    var pt=total(p),bt=total(b);
    var done=(pt>=8||bt>=8);
    function finishRound(){
      render(p,b);pt=total(p);bt=total(b);
      var winner=pt>bt?"player":(bt>pt?"banker":"tie");
      if(winner==="player")$("#baccaratspeedPSide").classList.add("bs-winner");
      if(winner==="banker")$("#baccaratspeedBSide").classList.add("bs-winner");
      var totalPayout=0,label="";
      if(winner==="tie"){
        if(choice==="tie"){totalPayout=bet*9;label="TIE 8:1"}
        else{totalPayout=bet;label="TIE — PUSH"}
      }else if(choice===winner){
        if(winner==="banker"){totalPayout=bet*1.95;label="BANKER WINS"}else{totalPayout=bet*2;label="PLAYER WINS"}
      }else{totalPayout=0;label=winner.toUpperCase()+" WINS — LOST"}
      var mult=totalPayout/bet;
      var stage=$("#baccaratspeedStage"),payout=settle("Baccarat Speed",bet,mult);
      road.push(winner);
      hist.unshift({t:(choice[0].toUpperCase())+" "+label,w:mult>1});histChips($("#baccaratspeedHist"),hist.slice(0,12));
      renderRoad();
      $("#baccaratspeedMsg").textContent="Player "+pt+" — Banker "+bt+". "+label+(mult>1?" — Won "+fmt$(payout):(mult===1?" — Stake back":""));
      $("#baccaratspeedRebet").disabled=false;
      if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win();if(ngAnim()){stage.classList.add("rays-on");_bvSetTimeout(function(){stage.classList.remove("rays-on")},1500)}}
      else if(mult===1){stageFx(stage,"shake");sfx.click()}
      else{stageFx(stage,"lose");sfx.lose()}
      dealing=false;
    }
    function third(){
      var pv=0;
      if(pt<=5){var c3=draw();p.push(c3);pv=bv(c3)}
      if(p.length===2){
        if(bt<=5)b.push(draw());
      }else{
        if(bt<=2)b.push(draw());
        else if(bt===3&&pv!==8)b.push(draw());
        else if(bt===4&&(pv>=2&&pv<=7))b.push(draw());
        else if(bt===5&&(pv>=4&&pv<=7))b.push(draw());
        else if(bt===6&&(pv===6||pv===7))b.push(draw());
      }
      finishRound();
    }
    if(ngAnim()){_bvSetTimeout(function(){if(!done)third();else finishRound()},100)}else{if(!done)third();else finishRound()}
  }
  $("#baccaratspeedPlay").addEventListener("click",playRound);
  $("#baccaratspeedRebet").addEventListener("click",function(){
    if(dealing||lastBet==null)return;
    $("#baccaratspeedBet").value=lastBet.toFixed(2);
    choice=lastChoice;
    for(var i=0;i<segs.length;i++)segs[i].classList.toggle("on",segs[i].getAttribute("data-v")===choice);
    syncSpots();sfx.click();
    playRound();
  });
  addDust($("#baccaratspeedStage"),10);
};
/* ==================== GAMES42: BLACKJACKCLASSIC ==================== */
BUILDERS.blackjackclassic=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

  /* RTP basis: standard single-deck blackjack, dealer stands on all 17s,
     blackjack pays 3:2, no splits, insurance available — basic-strategy RTP ~99.4%. */
  var $=function(s){return mount.querySelector(s)};
  var SUITS=["\u2660","\u2665","\u2666","\u2663"],RANKS=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  var deck=[];
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}}
  function freshDeck(){deck=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)deck.push({r:RANKS[r],s:SUITS[s],red:(s===1||s===2)});shuffle(deck)}
  function draw(){return deck.pop()}
  function handVal(h){var t=0,a=0;for(var i=0;i<h.length;i++){var r=h[i].r;if(r==="A"){t+=11;a++}else if(r==="J"||r==="Q"||r==="K")t+=10;else t+=parseInt(r,10)}while(t>21&&a>0){t-=10;a--}return t}
  function isSoft(h){var t=0,a=0;for(var i=0;i<h.length;i++){var r=h[i].r;if(r==="A"){t+=11;a++}else if(r==="J"||r==="Q"||r==="K")t+=10;else t+=parseInt(r,10)}while(t>21&&a>0){t-=10;a--}return a>0}
  function isBJ(h){return h.length===2&&handVal(h)===21}
  var hist=[],player=[],dealer=[],totalBet=0,active=false,bet0=0,insBet=0,hasHit=false,mainStake=0;
  function cardHtml(c,cls,d){return '<div class="bjc-card '+(c.red?"red ":"")+(cls||"")+'"'+(d?' style="animation-delay:'+(d*120)+'ms"':"")+'>'+'<div class="rk">'+c.r+'</div><div class="st">'+c.s+'</div></div>'}
  function render(reveal){
    var ph="",dh="";
    for(var i=0;i<player.length;i++)ph+=cardHtml(player[i],ngAnim()?"bjc-card-in":"",i);
    for(var j=0;j<dealer.length;j++){if(j===1&&!reveal)dh+='<div class="bjc-card back '+(ngAnim()?"bjc-card-in":"")+'"'+(j?' style="animation-delay:'+(j*120)+'ms"':"")+'>'+'</div>';else dh+=cardHtml(dealer[j],ngAnim()?"bjc-card-in":"",j)}
    $("#blackjackclassicPHand").innerHTML=ph;$("#blackjackclassicDHand").innerHTML=dh;
    $("#blackjackclassicPTotal").textContent=player.length?handVal(player)+(isSoft(player)&&handVal(player)!==21?" soft":""):"";
    $("#blackjackclassicDTotal").textContent=(reveal&&dealer.length)?handVal(dealer):"";
    $("#blackjackclassicDeck").textContent="Fresh single deck \u2022 Cards used: "+(52-deck.length)+" / 52 \u2022 Reshuffles every hand";
  }
  function setBtns(on){$("#blackjackclassicHit").disabled=!on;$("#blackjackclassicStand").disabled=!on;$("#blackjackclassicDouble").disabled=!on||hasHit;$("#blackjackclassicPlay").disabled=on}
  function finish(totalPayout,msg){
    active=false;setBtns(false);$("#blackjackclassicIns").classList.remove("show");
    var mult=totalBet>0?totalPayout/totalBet:0;
    var stage=$("#blackjackclassicStage"),payout=settle("Blackjack Classic",totalBet,mult);
    hist.unshift({t:msg,w:mult>1});histChips($("#blackjackclassicHist"),hist.slice(0,12));
    $("#blackjackclassicMsg").textContent=msg+(mult>1?" — Won "+fmt$(payout):(mult===1?" — Stake back":(mult>0?" — Returned "+fmt$(payout):"")));
    if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win();if(ngAnim()){stage.classList.add("rays-on");_bvSetTimeout(function(){stage.classList.remove("rays-on")},1500)}}
    else if(mult===1){stageFx(stage,"shake");sfx.click()}
    else if(mult>0){stageFx(stage,"shake");sfx.click()}
    else{stageFx(stage,"lose");sfx.lose()}
  }
  function mainWinPay(){
    if(isBJ(player))return bet0*2.5;
    return mainStake*2;
  }
  function dealerPlay(){
    render(true);
    while(handVal(dealer)<17){dealer.push(draw());render(true)}
    var pv=handVal(player),dv=handVal(dealer);
    if(dv>21)finish(mainWinPay(),"DEALER BUST "+dv);
    else if(isBJ(player))finish(mainWinPay(),"BLACKJACK! Pays 3:2");
    else if(pv>dv)finish(mainStake*2,"YOU "+pv+" vs "+dv);
    else if(pv<dv)finish(0,"DEALER "+dv+" vs "+pv);
    else finish(mainStake,"PUSH "+pv);
  }
  function resolveAfterInsurance(){
    $("#blackjackclassicIns").classList.remove("show");
    if(isBJ(dealer)){
      render(true);
      var pay=insBet*3;
      var lbl="DEALER BLACKJACK";
      if(isBJ(player)){pay+=bet0;lbl="DOUBLE BLACKJACK — PUSH"}
      if(insBet>0)lbl+=" \u2022 Insurance pays 2:1";
      finish(pay,lbl);
      return;
    }
    if(insBet>0)$("#blackjackclassicMsg").textContent="No dealer blackjack — insurance lost. Your move.";
    if(isBJ(player)){render(true);finish(mainWinPay(),"BLACKJACK! Pays 3:2");return}
    setBtns(true);
    if(insBet===0)$("#blackjackclassicMsg").textContent="Your move.";
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("blackjackclassicBet","10.00")
    +'<button class="action-btn" id="blackjackclassicPlay" style="margin-top:16px">Deal</button>'
    +'<div class="hist-row" id="blackjackclassicHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li><b>Single 52-card deck</b>, freshly shuffled <b>every hand</b> — watch the cards-used counter reset.</li>'
    +'<li><b>Blackjack pays 3:2.</b> Dealer <b>stands on all 17s</b> (including soft 17).</li>'
    +'<li>Actions: <b>Hit / Stand / Double</b> only — <b>no splits</b> at this table.</li>'
    +'<li><b>Insurance:</b> offered when the dealer shows an Ace. It costs <b>half your bet</b> and pays <b>2:1</b> if the dealer has blackjack (you get back 3x the insurance stake, stake included). Skipped if your balance cannot cover it.</li>'
    +'<li>Double: one card only, for exactly one extra bet.</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="blackjackclassicStage">'+gameHeaderHtml('blackjackclassic')+'<div class="bjc-rays"></div>'
    +'<div class="bjc-felt">'
    +'<div class="bjc-rail"></div>'
    +'<div class="bjc-title">BLACKJACK CLASSIC</div>'
    +'<div class="bjc-sub">Blackjack pays 3 to 2 &#8226; Dealer stands on all 17s</div>'
    +'<span class="bjc-deck" id="blackjackclassicDeck"></span>'
    +'<div class="bjc-zlabel">Dealer</div><div class="bjc-hand" id="blackjackclassicDHand"></div><div><span class="bjc-total" id="blackjackclassicDTotal"></span></div>'
    +'<div class="bjc-insrow" id="blackjackclassicIns"><span id="blackjackclassicInsTxt">Dealer shows an Ace — take insurance?</span><button class="action-btn" id="blackjackclassicInsYes">Take Insurance</button><button class="mini-btn" id="blackjackclassicInsNo">No Insurance</button></div>'
    +'<div class="bjc-zlabel" style="margin-top:14px">You</div><div class="bjc-hand" id="blackjackclassicPHand"></div><div><span class="bjc-total" id="blackjackclassicPTotal"></span></div>'
    +'<div class="bjc-btnrow"><button class="action-btn" id="blackjackclassicHit" disabled>Hit</button><button class="action-btn" id="blackjackclassicStand" disabled>Stand</button><button class="action-btn" id="blackjackclassicDouble" disabled>Double</button></div>'
    +'<div class="bjc-msg" id="blackjackclassicMsg">Place your bet and press Deal.</div>'
    +'</div></div></div>';
  wireAmount("blackjackclassicBet");
  freshDeck();render(false);setBtns(false);
  $("#blackjackclassicPlay").addEventListener("click",function(){
    if(active)return;
    var bet=getBet("blackjackclassicBet");if(bet==null)return;
    charge(bet);flyChip(this,$("#blackjackclassicStage"));sfx.click();
    freshDeck();
    bet0=bet;totalBet=bet;insBet=0;hasHit=false;mainStake=bet;
    player=[draw(),draw()];dealer=[draw(),draw()];active=true;
    render(false);
    var dealerAce=(dealer[0].r==="A");
    var canIns=state.balance>=Math.round(bet*50)/100;
    if(dealerAce&&canIns){
      setBtns(false);$("#blackjackclassicPlay").disabled=true;
      $("#blackjackclassicInsTxt").textContent="Dealer shows an Ace — insurance costs "+fmt$(Math.round(bet*50)/100)+" and pays 2:1. Take it?";
      $("#blackjackclassicIns").classList.add("show");
      $("#blackjackclassicMsg").textContent="Insurance offered.";
      return;
    }
    if(isBJ(player)){
      render(true);
      if(isBJ(dealer)){finish(bet0,"DOUBLE BLACKJACK — PUSH")}
      else{finish(mainWinPay(),"BLACKJACK! Pays 3:2")}
      return;
    }
    if(isBJ(dealer)){render(true);finish(0,"DEALER BLACKJACK");return}
    setBtns(true);$("#blackjackclassicMsg").textContent="Your move.";
  });
  $("#blackjackclassicInsYes").addEventListener("click",function(){
    if(!active)return;
    var ins=Math.round(bet0*50)/100;
    if(state.balance<ins){toast("Insufficient","Not enough balance for insurance.","err");resolveAfterInsurance();return}
    charge(ins);insBet=ins;totalBet+=ins;sfx.coin();
    resolveAfterInsurance();
  });
  $("#blackjackclassicInsNo").addEventListener("click",function(){
    if(!active)return;sfx.click();resolveAfterInsurance();
  });
  $("#blackjackclassicHit").addEventListener("click",function(){
    if(!active)return;sfx.click();hasHit=true;player.push(draw());render(false);setBtns(true);
    if(handVal(player)>21){render(true);finish(0,"BUST "+handVal(player))}
    else if(handVal(player)===21){setBtns(false);dealerPlay()}
  });
  $("#blackjackclassicStand").addEventListener("click",function(){
    if(!active)return;sfx.click();setBtns(false);dealerPlay();
  });
  $("#blackjackclassicDouble").addEventListener("click",function(){
    if(!active||hasHit)return;
    if(state.balance<bet0){toast("Insufficient","Not enough balance to double.","err");return}
    charge(bet0);flyChip(this,$("#blackjackclassicStage"));totalBet+=bet0;mainStake+=bet0;sfx.click();setBtns(false);
    player.push(draw());render(false);
    $("#blackjackclassicMsg").textContent="Doubled — one card.";
    if(handVal(player)>21){render(true);finish(0,"BUST "+handVal(player))}
    else dealerPlay();
  });
  addDust($("#blackjackclassicStage"),10);
};
/* ==================== GAMES42: EUROPEANROULETTE ==================== */
BUILDERS.europeanroulette=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

  /* RTP basis: single-zero (37 pockets) European wheel. Straight 35:1, dozen 2:1,
     even-money 1:1 — RTP 97.30% (36/37). La Partage lifts even-money bets on zero
     to ~98.65% on those bets; headline stays 97.3% as listed. */
  var $=function(s){return mount.querySelector(s)};
  var qsa=function(s){return mount.querySelectorAll(s)};
  var WHEEL=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
  var REDS={1:1,3:1,5:1,7:1,9:1,12:1,14:1,16:1,18:1,19:1,21:1,23:1,25:1,27:1,30:1,32:1,34:1,36:1};
  var EVENKEYS={red:1,black:1,even:1,odd:1,low:1,high:1};
  var chip=25,bets={},spinning=false,rot=0,lastBets=null,hist=[],spinTimer=null;
  function isRed(n){return !!REDS[n]}
  function totalBet(){var t=0;for(var k in bets)t+=bets[k];return t}
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Chip Value</h4><div class="er-chippick" id="europeanrouletteChipPick">'
    +'<button class="c10" data-chip="10">$10</button><button class="c25 on" data-chip="25">$25</button><button class="c50" data-chip="50">$50</button><button class="c100" data-chip="100">$100</button><button class="c500" data-chip="500">$500</button></div>'
    +'<div class="stat-grid" style="margin-top:14px"><div class="stat-box"><small>Total Bet</small><b id="europeanrouletteTotal">$0.00</b></div><div class="stat-box"><small>Last Result</small><b id="europeanrouletteLast">No result yet</b></div></div>'
    +'<button class="action-btn" id="europeanrouletteSpin" style="margin-top:16px">Spin Wheel</button>'
    +'<div style="display:flex;gap:8px;margin-top:9px"><button class="mini-btn" id="europeanrouletteClear" style="flex:1;height:42px">Clear Bets</button><button class="mini-btn" id="europeanrouletteRebet" style="flex:1;height:42px">Rebet Last</button></div>'
    +'<div class="hist-row" id="europeanrouletteHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>Single <b>zero</b> — 37 pockets. Click the board to stack chips; right-click a spot to remove one chip.</li>'
    +'<li>Straight number pays <b>35:1</b> &bull; <b>Douzaine</b> (dozen) pays <b>2:1</b> &bull; even-money bets pay <b>1:1</b>.</li>'
    +'<li>French table: <b>Rouge / Noir</b> (red/black), <b>Pair / Impair</b> (even/odd), <b>Manque</b> (1–18) / <b>Passe</b> (19–36), <b>Douzaine</b> (dozens).</li>'
    +'<li><b>LA PARTAGE:</b> when <b>0</b> lands, even-money bets (Rouge/Noir, Pair/Impair, Manque/Passe) lose only <b>HALF</b> — half the stake is returned. All other bets lose in full on zero.</li>'
    +'</ul></div></div>'
    +'<div class="stage er-stage" id="europeanrouletteStage">'+gameHeaderHtml('europeanroulette')
    +'<div class="er-wrap"><div class="er-title">ROULETTE EUROP&#201;ENNE</div>'
    +'<div class="er-partage">LA PARTAGE — even-money bets lose only half on zero</div>'
    +'<div class="er-wheelbox"><div class="er-pointer"></div><svg class="er-wheelsvg" id="europeanrouletteWheel" viewBox="0 0 300 300" role="img" aria-label="European roulette wheel"></svg>'
    +'<div class="er-hub"><b id="europeanrouletteHubNum">–</b><span id="europeanrouletteHubLbl">Place bets</span></div></div>'
    +'<div class="er-board" id="europeanrouletteBoard"></div>'
    +'<div class="er-msg" id="europeanrouletteMsg">Cliquez sur le tapis — place your bets.</div>'
    +'</div></div></div>';
  var svg=$("#europeanrouletteWheel"),seg=360/37,parts="";
  function polar(r,a){var rad=(a-90)*Math.PI/180;return [150+r*Math.cos(rad),150+r*Math.sin(rad)]}
  for(var wi=0;wi<WHEEL.length;wi++){
    (function(n,i){
      var a0=i*seg,a1=a0+seg;
      var p0=polar(148,a0),p1=polar(148,a1),p2=polar(96,a1),p3=polar(96,a0);
      var col=n===0?"#0a9d51":(isRed(n)?"#c22f4d":"#1a2740");
      parts+='<path d="M'+p0[0].toFixed(1)+' '+p0[1].toFixed(1)+' A148 148 0 0 1 '+p1[0].toFixed(1)+' '+p1[1].toFixed(1)+' L'+p2[0].toFixed(1)+' '+p2[1].toFixed(1)+' A96 96 0 0 0 '+p3[0].toFixed(1)+' '+p3[1].toFixed(1)+' Z" fill="'+col+'" stroke="rgba(255,255,255,.16)" stroke-width="1"/>';
      var am=a0+seg/2,tp=polar(122,am);
      parts+='<text x="'+tp[0].toFixed(1)+'" y="'+tp[1].toFixed(1)+'" fill="#fff" font-size="12.5" font-weight="700" font-family="IBM Plex Mono" text-anchor="middle" dominant-baseline="middle" transform="rotate('+am.toFixed(1)+' '+tp[0].toFixed(1)+' '+tp[1].toFixed(1)+')">'+n+'</text>';
    })(WHEEL[wi],wi);
  }
  parts+='<circle cx="150" cy="150" r="95" fill="none" stroke="rgba(255,212,121,.25)"/><circle cx="150" cy="150" r="148" fill="none" stroke="#f5b942" stroke-width="2.5" opacity=".55"/>';
  svg.innerHTML=parts;
  var board=$("#europeanrouletteBoard"),cells="";
  cells+='<button class="er-bb greenb" data-bet="n0" style="grid-row:span 3;display:flex;align-items:center;justify-content:center;font-size:16px">0</button>';
  for(var r=0;r<3;r++)for(var c=0;c<12;c++){var n=c*3+(3-r);cells+='<button class="er-bb '+(isRed(n)?"red":"black")+'" data-bet="n'+n+'">'+n+'</button>'}
  cells+='<span></span><button class="er-bb wide" data-bet="d1" style="grid-column:span 4">Douzaine 1</button><button class="er-bb wide" data-bet="d2" style="grid-column:span 4">Douzaine 2</button><button class="er-bb wide" data-bet="d3" style="grid-column:span 4">Douzaine 3</button>';
  cells+='<span></span><button class="er-bb wide" data-bet="low" style="grid-column:span 2">Manque</button><button class="er-bb wide" data-bet="even" style="grid-column:span 2">Pair</button><button class="er-bb red wide" data-bet="red" style="grid-column:span 2">Rouge</button><button class="er-bb black wide" data-bet="black" style="grid-column:span 2">Noir</button><button class="er-bb wide" data-bet="odd" style="grid-column:span 2">Impair</button><button class="er-bb wide" data-bet="high" style="grid-column:span 2">Passe</button>';
  board.innerHTML=cells;
  function paintChips(){
    var bbs=qsa("#europeanrouletteBoard .er-bb");
    for(var i=0;i<bbs.length;i++){
      var bb=bbs[i],v=bets[bb.getAttribute("data-bet")],old=bb.querySelector(".er-chipon");
      if(old)old.parentNode.removeChild(old);
      if(v){var s=document.createElement("span");s.className="er-chipon";s.textContent=v>=1000?(v/1000)+"k":v;bb.appendChild(s)}
    }
    $("#europeanrouletteTotal").textContent=fmt$(totalBet());
  }
  board.addEventListener("click",function(e){
    var bb=e.target.closest?e.target.closest(".er-bb"):null;if(!bb||spinning)return;
    var key=bb.getAttribute("data-bet");bets[key]=(bets[key]||0)+chip;sfx.click();paintChips();
  });
  board.addEventListener("contextmenu",function(e){
    var bb=e.target.closest?e.target.closest(".er-bb"):null;if(!bb)return;e.preventDefault();
    var key=bb.getAttribute("data-bet");
    if(bets[key]){bets[key]-=chip;if(bets[key]<=0)delete bets[key];paintChips()}
  });
  var chipBtns=qsa("#europeanrouletteChipPick button");
  for(var ci=0;ci<chipBtns.length;ci++){chipBtns[ci].addEventListener("click",function(){chip=parseInt(this.getAttribute("data-chip"),10);for(var i=0;i<chipBtns.length;i++)chipBtns[i].classList.toggle("on",chipBtns[i]===this);sfx.click()})}
  $("#europeanrouletteClear").addEventListener("click",function(){if(spinning)return;bets={};paintChips();sfx.click()});
  $("#europeanrouletteRebet").addEventListener("click",function(){if(spinning)return;if(!lastBets){toast("Nothing to rebet","Place a bet and spin first.","err");return}bets={};for(var k in lastBets)bets[k]=lastBets[k];paintChips();sfx.click()});
  function betWins(key,n){
    if(key==="n"+n)return 35;
    if(key==="red"&&isRed(n))return 1;
    if(key==="black"&&n!==0&&!isRed(n))return 1;
    if(key==="even"&&n!==0&&n%2===0)return 1;
    if(key==="odd"&&n%2===1)return 1;
    if(key==="low"&&n>=1&&n<=18)return 1;
    if(key==="high"&&n>=19&&n<=36)return 1;
    if(key==="d1"&&n>=1&&n<=12)return 2;
    if(key==="d2"&&n>=13&&n<=24)return 2;
    if(key==="d3"&&n>=25&&n<=36)return 2;
    return -1;
  }
  $("#europeanrouletteSpin").addEventListener("click",function(){
    if(spinning)return;
    var total=totalBet();
    if(total<=0){toast("No bets placed","Click the board to stack chips first.","err");return}
    if(total>state.balance){toast("Insufficient balance","Your board bets exceed your balance.","err");if(state.user)openWallet();else requireAuth(openWallet);return}
    charge(total);lastBets={};for(var k in bets)lastBets[k]=bets[k];spinning=true;
    var spinBtn=$("#europeanrouletteSpin");spinBtn.disabled=true;spinBtn.textContent="Spinning…";
    var idx=Math.floor(Math.random()*37),n=WHEEL[idx];
    var targetMod=(360-(idx*seg+seg/2))%360;
    rot+=360*6+((targetMod-(rot%360))+360)%360;
    svg.style.transition=ngAnim()?"transform 5.2s cubic-bezier(.12,.6,.15,1)":"none";
    svg.style.transform="rotate("+rot+"deg)";
    $("#europeanrouletteHubLbl").textContent="Spinning";
    $("#europeanrouletteMsg").textContent="Rien ne va plus — no more bets.";
    spinTimer=_bvSetTimeout(function(){
      spinTimer=null;
      var ret=0;
      for(var key in bets){
        if(n===0&&EVENKEYS[key]){ret+=bets[key]*0.5}
        else{var w=betWins(key,n);if(w>=0)ret+=bets[key]*(w+1)}
      }
      var mult=total>0?ret/total:0;
      var stage=$("#europeanrouletteStage");
      var payout=settle("European Roulette",total,mult);
      var colName=n===0?"Vert (Zero)":(isRed(n)?"Rouge":"Noir");
      $("#europeanrouletteHubNum").textContent=n;
      $("#europeanrouletteHubNum").style.color=n===0?"#3ddc84":(isRed(n)?"#ff8296":"#fff");
      $("#europeanrouletteHubLbl").textContent=colName;
      $("#europeanrouletteLast").textContent=n+" "+colName;
      hist.unshift({t:String(n),w:ret>total});histChips($("#europeanrouletteHist"),hist.slice(0,12));
      if(ret>total){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WIN "+fmt$(payout));sfx.win();$("#europeanrouletteMsg").textContent=n+" "+colName+" — you won "+fmt$(payout)+"."}
      else if(ret>0){stageFx(stage,"shake");sfx.click();$("#europeanrouletteMsg").textContent=(n===0?"Zero — La Partage returns half of even-money bets. ":"")+ "Returned "+fmt$(payout)+"."}
      else{stageFx(stage,"lose");sfx.lose();$("#europeanrouletteMsg").textContent=n+" "+colName+" — bets lost."}
      bets={};paintChips();spinning=false;spinBtn.disabled=false;spinBtn.textContent="Spin Wheel";
    },ngAnim()?5300:120);
  });
  onCleanup(function(){if(spinTimer)_bvClearTimeout(spinTimer)});
  addDust($("#europeanrouletteStage"),10);
};
/* ==================== GAMES42: AMERICANROULETTE ==================== */
BUILDERS.americanroulette=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

  /* RTP basis: double-zero American wheel, 38 pockets, standard payouts
     (straight 35:1, dozen 2:1, even-money 1:1, basket 6:1). Every bet returns
     36/38 = 94.74% — the honest double-zero math behind the 94.7% headline. NO La Partage. */
  var $=function(s){return mount.querySelector(s)};
  var qsa=function(s){return mount.querySelectorAll(s)};
  var WHEEL=[0,28,9,26,30,11,7,20,32,17,5,22,34,15,3,24,36,13,1,"00",27,10,25,29,12,8,19,31,18,6,21,33,16,4,23,35,14,2];
  var REDS={1:1,3:1,5:1,7:1,9:1,12:1,14:1,16:1,18:1,19:1,21:1,23:1,25:1,27:1,30:1,32:1,34:1,36:1};
  var chip=25,bets={},spinning=false,rot=0,lastBets=null,hist=[],spinTimer=null;
  function isRed(n){return !!REDS[n]}
  function isGreen(n){return n===0||n==="00"}
  function totalBet(){var t=0;for(var k in bets)t+=bets[k];return t}
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Chip Value</h4><div class="ar-chippick" id="americanrouletteChipPick">'
    +'<button class="c10" data-chip="10">$10</button><button class="c25 on" data-chip="25">$25</button><button class="c50" data-chip="50">$50</button><button class="c100" data-chip="100">$100</button><button class="c500" data-chip="500">$500</button></div>'
    +'<div class="stat-grid" style="margin-top:14px"><div class="stat-box"><small>Total Bet</small><b id="americanrouletteTotal">$0.00</b></div><div class="stat-box"><small>Last Result</small><b id="americanrouletteLast">No result yet</b></div></div>'
    +'<button class="action-btn" id="americanrouletteSpin" style="margin-top:16px">Spin Wheel</button>'
    +'<div style="display:flex;gap:8px;margin-top:9px"><button class="mini-btn" id="americanrouletteClear" style="flex:1;height:42px">Clear Bets</button><button class="mini-btn" id="americanrouletteRebet" style="flex:1;height:42px">Rebet Last</button></div>'
    +'<div class="hist-row" id="americanrouletteHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li><b>Double zero</b> — 38 pockets (0 and 00, both green) in true American wheel order. Click the board to stack chips; right-click a spot to remove one chip.</li>'
    +'<li>Straight number pays <b>35:1</b> &bull; dozen pays <b>2:1</b> &bull; even-money bets (Red/Black, Even/Odd, 1–18/19–36) pay <b>1:1</b>.</li>'
    +'<li><b>Basket bet (exclusive):</b> one chip covers <b>0-00-1-2-3</b> and pays <b>6:1</b>.</li>'
    +'<li><b>No La Partage</b> at this table — 0 and 00 take all outside bets in full. House edge 5.26% (94.7% RTP).</li>'
    +'</ul></div></div>'
    +'<div class="stage ar-stage" id="americanrouletteStage">'+gameHeaderHtml('americanroulette')
    +'<div class="ar-wrap"><div class="ar-title">AMERICAN ROULETTE</div>'
    +'<div class="ar-sub">Double Zero &#8226; 38 Pockets &#8226; Basket Bet Pays 6:1</div>'
    +'<div class="ar-wheelbox"><div class="ar-pointer"></div><svg class="ar-wheelsvg" id="americanrouletteWheel" viewBox="0 0 300 300" role="img" aria-label="American roulette wheel"></svg>'
    +'<div class="ar-hub"><b id="americanrouletteHubNum">–</b><span id="americanrouletteHubLbl">Place bets</span></div></div>'
    +'<div id="americanrouletteBoardWrap">'
    +'<div class="ar-zeros"><button class="ar-bb greenb" data-bet="n0">0</button><button class="ar-bb greenb" data-bet="n00">00</button><button class="ar-bb basket" data-bet="basket">Basket 0-00-1-2-3 &#8226; 6:1</button></div>'
    +'<div class="ar-board" id="americanrouletteBoard"></div>'
    +'</div>'
    +'<div class="ar-msg" id="americanrouletteMsg">Place your bets, please.</div>'
    +'</div></div></div>';
  var svg=$("#americanrouletteWheel"),seg=360/38,parts="";
  function polar(r,a){var rad=(a-90)*Math.PI/180;return [150+r*Math.cos(rad),150+r*Math.sin(rad)]}
  for(var wi=0;wi<WHEEL.length;wi++){
    (function(n,i){
      var a0=i*seg,a1=a0+seg;
      var p0=polar(148,a0),p1=polar(148,a1),p2=polar(96,a1),p3=polar(96,a0);
      var col=isGreen(n)?"#0a9d51":(isRed(n)?"#c22f4d":"#1a2740");
      parts+='<path d="M'+p0[0].toFixed(1)+' '+p0[1].toFixed(1)+' A148 148 0 0 1 '+p1[0].toFixed(1)+' '+p1[1].toFixed(1)+' L'+p2[0].toFixed(1)+' '+p2[1].toFixed(1)+' A96 96 0 0 0 '+p3[0].toFixed(1)+' '+p3[1].toFixed(1)+' Z" fill="'+col+'" stroke="rgba(255,255,255,.16)" stroke-width="1"/>';
      var am=a0+seg/2,tp=polar(122,am);
      parts+='<text x="'+tp[0].toFixed(1)+'" y="'+tp[1].toFixed(1)+'" fill="#fff" font-size="11.5" font-weight="700" font-family="IBM Plex Mono" text-anchor="middle" dominant-baseline="middle" transform="rotate('+am.toFixed(1)+' '+tp[0].toFixed(1)+' '+tp[1].toFixed(1)+')">'+n+'</text>';
    })(WHEEL[wi],wi);
  }
  parts+='<circle cx="150" cy="150" r="95" fill="none" stroke="rgba(255,212,121,.25)"/><circle cx="150" cy="150" r="148" fill="none" stroke="#f5b942" stroke-width="2.5" opacity=".55"/>';
  svg.innerHTML=parts;
  var board=$("#americanrouletteBoard"),cells="";
  for(var r=0;r<3;r++)for(var c=0;c<12;c++){var n=c*3+(3-r);cells+='<button class="ar-bb '+(isRed(n)?"red":"black")+'" data-bet="n'+n+'">'+n+'</button>'}
  cells+='<button class="ar-bb" data-bet="d1" style="grid-column:span 4">1st 12</button><button class="ar-bb" data-bet="d2" style="grid-column:span 4">2nd 12</button><button class="ar-bb" data-bet="d3" style="grid-column:span 4">3rd 12</button>';
  cells+='<button class="ar-bb" data-bet="low" style="grid-column:span 2">1–18</button><button class="ar-bb" data-bet="even" style="grid-column:span 2">Even</button><button class="ar-bb red" data-bet="red" style="grid-column:span 2">Red</button><button class="ar-bb black" data-bet="black" style="grid-column:span 2">Black</button><button class="ar-bb" data-bet="odd" style="grid-column:span 2">Odd</button><button class="ar-bb" data-bet="high" style="grid-column:span 2">19–36</button>';
  board.innerHTML=cells;
  function paintChips(){
    var bbs=qsa("#americanrouletteBoardWrap .ar-bb");
    for(var i=0;i<bbs.length;i++){
      var bb=bbs[i],v=bets[bb.getAttribute("data-bet")],old=bb.querySelector(".ar-chipon");
      if(old)old.parentNode.removeChild(old);
      if(v){var s=document.createElement("span");s.className="ar-chipon";s.textContent=v>=1000?(v/1000)+"k":v;bb.appendChild(s)}
    }
    $("#americanrouletteTotal").textContent=fmt$(totalBet());
  }
  var wrap=$("#americanrouletteBoardWrap");
  wrap.addEventListener("click",function(e){
    var bb=e.target.closest?e.target.closest(".ar-bb"):null;if(!bb||spinning)return;
    var key=bb.getAttribute("data-bet");bets[key]=(bets[key]||0)+chip;sfx.click();paintChips();
  });
  wrap.addEventListener("contextmenu",function(e){
    var bb=e.target.closest?e.target.closest(".ar-bb"):null;if(!bb)return;e.preventDefault();
    var key=bb.getAttribute("data-bet");
    if(bets[key]){bets[key]-=chip;if(bets[key]<=0)delete bets[key];paintChips()}
  });
  var chipBtns=qsa("#americanrouletteChipPick button");
  for(var ci=0;ci<chipBtns.length;ci++){chipBtns[ci].addEventListener("click",function(){chip=parseInt(this.getAttribute("data-chip"),10);for(var i=0;i<chipBtns.length;i++)chipBtns[i].classList.toggle("on",chipBtns[i]===this);sfx.click()})}
  $("#americanrouletteClear").addEventListener("click",function(){if(spinning)return;bets={};paintChips();sfx.click()});
  $("#americanrouletteRebet").addEventListener("click",function(){if(spinning)return;if(!lastBets){toast("Nothing to rebet","Place a bet and spin first.","err");return}bets={};for(var k in lastBets)bets[k]=lastBets[k];paintChips();sfx.click()});
  function betWins(key,n){
    if(key==="basket")return (n===0||n==="00"||n===1||n===2||n===3)?6:-1;
    if(key==="n0")return n===0?35:-1;
    if(key==="n00")return n==="00"?35:-1;
    if(typeof n==="number"&&key==="n"+n)return 35;
    if(key==="red"&&isRed(n))return 1;
    if(key==="black"&&!isGreen(n)&&!isRed(n))return 1;
    if(key==="even"&&typeof n==="number"&&n!==0&&n%2===0)return 1;
    if(key==="odd"&&typeof n==="number"&&n%2===1)return 1;
    if(key==="low"&&typeof n==="number"&&n>=1&&n<=18)return 1;
    if(key==="high"&&typeof n==="number"&&n>=19&&n<=36)return 1;
    if(key==="d1"&&typeof n==="number"&&n>=1&&n<=12)return 2;
    if(key==="d2"&&typeof n==="number"&&n>=13&&n<=24)return 2;
    if(key==="d3"&&typeof n==="number"&&n>=25&&n<=36)return 2;
    return -1;
  }
  $("#americanrouletteSpin").addEventListener("click",function(){
    if(spinning)return;
    var total=totalBet();
    if(total<=0){toast("No bets placed","Click the board to stack chips first.","err");return}
    if(total>state.balance){toast("Insufficient balance","Your board bets exceed your balance.","err");if(state.user)openWallet();else requireAuth(openWallet);return}
    charge(total);lastBets={};for(var k in bets)lastBets[k]=bets[k];spinning=true;
    var spinBtn=$("#americanrouletteSpin");spinBtn.disabled=true;spinBtn.textContent="Spinning…";
    var idx=Math.floor(Math.random()*38),n=WHEEL[idx];
    var targetMod=(360-(idx*seg+seg/2))%360;
    rot+=360*6+((targetMod-(rot%360))+360)%360;
    svg.style.transition=ngAnim()?"transform 5.2s cubic-bezier(.12,.6,.15,1)":"none";
    svg.style.transform="rotate("+rot+"deg)";
    $("#americanrouletteHubLbl").textContent="Spinning";
    $("#americanrouletteMsg").textContent="No more bets.";
    spinTimer=_bvSetTimeout(function(){
      spinTimer=null;
      var ret=0;
      for(var key in bets){var w=betWins(key,n);if(w>=0)ret+=bets[key]*(w+1)}
      var mult=total>0?ret/total:0;
      var stage=$("#americanrouletteStage");
      var payout=settle("American Roulette",total,mult);
      var colName=isGreen(n)?"Green":(isRed(n)?"Red":"Black");
      $("#americanrouletteHubNum").textContent=n;
      $("#americanrouletteHubNum").style.color=isGreen(n)?"#3ddc84":(isRed(n)?"#ff8296":"#fff");
      $("#americanrouletteHubLbl").textContent=colName;
      $("#americanrouletteLast").textContent=n+" "+colName;
      hist.unshift({t:String(n),w:ret>total});histChips($("#americanrouletteHist"),hist.slice(0,12));
      if(ret>total){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WIN "+fmt$(payout));sfx.win();$("#americanrouletteMsg").textContent=n+" "+colName+" — you won "+fmt$(payout)+"."}
      else if(ret>0){stageFx(stage,"shake");sfx.click();$("#americanrouletteMsg").textContent=n+" "+colName+" — partial return of "+fmt$(payout)+"."}
      else{stageFx(stage,"lose");sfx.lose();$("#americanrouletteMsg").textContent=n+" "+colName+" — bets lost."}
      bets={};paintChips();spinning=false;spinBtn.disabled=false;spinBtn.textContent="Spin Wheel";
    },ngAnim()?5300:120);
  });
  onCleanup(function(){if(spinTimer)_bvClearTimeout(spinTimer)});
  addDust($("#americanrouletteStage"),10);
};
/* ==================== GAMES42: PLINKONEON ==================== */
BUILDERS.plinkoneon=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

  var $=function(s){return mount.querySelector(s)};
  /* Payout derivation (binomial): bin k of R rows has probability C(R,k)/2^R.
     Multipliers are symmetric, edge bins highest, centre lowest.
     RTP = sum_k C(R,k)/2^R * m[k]:
       R=10: probs .00098,.00977,.04395,.11719,.20508,.24609 (x2 symmetric, centre once)
             [24,6.5,2.4,1.05,0.62,0.34,...] -> RTP 0.9688
       R=12: probs .00024,.00293,.01611,.05371,.12085,.19336,.22559
             [72,15,4.2,1.9,1,0.53,0.28,...] -> RTP 0.9723
       R=14: probs .00006,.00085,.00555,.02222,.06110,.12219,.18329,.20947
             [170,30,8,3.5,1.7,0.9,0.47,0.26,...] -> RTP 0.9708
     All inside 0.96-0.98. Verified by plinkoneon-sim.js Monte Carlo. */
  var TABLES={
    10:[24,6.5,2.4,1.05,0.62,0.34,0.62,1.05,2.4,6.5,24],
    12:[72,15,4.2,1.9,1,0.53,0.28,0.53,1,1.9,4.2,15,72],
    14:[170,30,8,3.5,1.7,0.9,0.47,0.26,0.47,0.9,1.7,3.5,8,30,170]
  };
  var rows=12,balls=[],raf=null,flashes=[],dropped=0,hist=[];
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("plinkoneonBet","10.00")
    +'<div class="field"><label>Rows</label><div class="seg" id="plinkoneonRows"><button data-rows="10">10</button><button class="on" data-rows="12">12</button><button data-rows="14">14</button></div></div>'
    +'<button class="action-btn" id="plinkoneonDrop">Drop Ball</button>'
    +'<div class="stat-grid"><div class="stat-box"><small>Top Payout</small><b id="plinkoneonTop">72.00×</b></div><div class="stat-box"><small>Balls Dropped</small><b id="plinkoneonCount">0</b></div></div>'
    +'<div class="hist-row" id="plinkoneonHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>Pick <b>10, 12 or 14 rows</b> and drop a ball. Each peg sends it left or right with equal chance, so the landing bin follows the binomial distribution — centre bins are common, edge bins are rare.</li>'
    +'<li><b>10 rows pay:</b> 24×, 6.5×, 2.4×, 1.05×, 0.62×, 0.34×, 0.62×, 1.05×, 2.4×, 6.5×, 24× (RTP 96.88%).</li>'
    +'<li><b>12 rows pay:</b> 72×, 15×, 4.2×, 1.9×, 1×, 0.53×, 0.28×, 0.53×, 1×, 1.9×, 4.2×, 15×, 72× (RTP 97.23%).</li>'
    +'<li><b>14 rows pay:</b> 170×, 30×, 8×, 3.5×, 1.7×, 0.9×, 0.47×, 0.26×, 0.47×, 0.9×, 1.7×, 3.5×, 8×, 30×, 170× (RTP 97.08%).</li>'
    +'<li>Payout = bet × bin multiplier. Multipliers under 1× return part of your stake. You can drop several balls at once — each is charged and settled separately.</li>'
    +'</ul></div></div>'
    +'<div class="stage pn-stage" id="plinkoneonStage">'+gameHeaderHtml('plinkoneon')+'<canvas id="plinkoneonCanvas"></canvas><div class="pn-slots" id="plinkoneonSlots"></div><div class="pn-note">Neon board — edge bins glow brightest and pay the most.</div></div></div>';
  wireAmount("plinkoneonBet");
  var cv=$("#plinkoneonCanvas"),ctx=cv.getContext("2d");
  function metrics(){var w=cv.width,h=cv.height;var sp=Math.min(w/(rows+2.4),(h-56)/rows);return{w:w,h:h,sp:sp,top:30,cx:w/2}}
  function paintSlots(){
    var t=TABLES[rows];
    $("#plinkoneonSlots").innerHTML=t.map(function(m){return '<div class="'+(m>=10?"high":m>=1.4?"mid":"")+'" data-slot>'+(m>=100?Math.round(m):m)+'×</div>'}).join("");
    $("#plinkoneonTop").textContent=Math.max.apply(null,t).toFixed(2)+"×";
  }
  function drawBoard(){
    var m=metrics();ctx.clearRect(0,0,m.w,m.h);
    var r,c,x,y,f,i,tp,ti,b;
    for(r=0;r<rows;r++)for(c=0;c<=r;c++){
      x=m.cx+(c-r/2)*m.sp;y=m.top+r*m.sp;
      ctx.beginPath();ctx.arc(x,y,5.5,0,7);ctx.fillStyle="rgba(34,211,238,.16)";ctx.fill();
      ctx.beginPath();ctx.arc(x,y,3.3,0,7);ctx.fillStyle="#a5f3fc";ctx.shadowColor="rgba(34,211,238,.9)";ctx.shadowBlur=6;ctx.fill();ctx.shadowBlur=0;
    }
    for(i=0;i<flashes.length;i++){f=flashes[i];ctx.beginPath();ctx.arc(f.x,f.y,4+f.age*1.7,0,7);ctx.strokeStyle="rgba(232,121,249,"+(0.55*(1-f.age/12)).toFixed(3)+")";ctx.lineWidth=2;ctx.stroke()}
    for(i=0;i<balls.length;i++){b=balls[i];
      var trail=b.trail||[];
      for(ti=0;ti<trail.length;ti++){tp=trail[ti];ctx.beginPath();ctx.arc(tp.x,tp.y,3+ti*0.7,0,7);ctx.fillStyle="rgba(232,121,249,"+(0.05+ti*0.04).toFixed(3)+")";ctx.fill()}
      ctx.beginPath();ctx.arc(b.x,b.y,8,0,7);ctx.fillStyle="#e879f9";ctx.shadowColor="rgba(232,121,249,.95)";ctx.shadowBlur=16;ctx.fill();ctx.shadowBlur=0;
      ctx.beginPath();ctx.arc(b.x-2.4,b.y-2.4,3,0,7);ctx.fillStyle="rgba(255,255,255,.85)";ctx.fill();
    }
  }
  function sizeCanvas(){var w=Math.max(1,Math.round(cv.getBoundingClientRect().width||cv.clientWidth||600));var h=Math.max(280,Math.round(cv.getBoundingClientRect().height||430));if(cv.width!==w)cv.width=w;if(cv.height!==h)cv.height=h;drawBoard()}
  function loop(){
    var m=metrics(),alive=false,i,b;
    for(i=0;i<flashes.length;i++)flashes[i].age++;
    flashes=flashes.filter(function(f){return f.age<12});
    for(i=0;i<balls.length;i++){b=balls[i];
      if(b.si>=b.steps.length)continue;
      alive=true;
      b.trail.push({x:b.x,y:b.y});if(b.trail.length>8)b.trail.shift();
      b.prog+=ngAnim()?0.055:0.5;
      var from=b.si===0?{x:m.cx,y:8}:b.steps[b.si-1];
      var to=b.steps[b.si];
      var p=Math.min(1,b.prog),e=p*p*(3-2*p);
      b.x=from.x+(to.x-from.x)*e;b.y=from.y+(to.y-from.y)*e;
      if(p>=1){flashes.push({x:to.x,y:to.y,age:0});b.si++;b.prog=0}
      if(b.si>=b.steps.length&&!b.done){
        b.done=true;
        var t=TABLES[rows],mult=t[b.slot];
        var pay=settle("Plinko Neon",b.bet,mult);
        var slots=$("#plinkoneonSlots").querySelectorAll("[data-slot]"),cellEl=slots[b.slot];
        if(cellEl){cellEl.classList.remove("hot");void cellEl.offsetWidth;cellEl.classList.add("hot");_bvSetTimeout(function(){cellEl.classList.remove("hot")},700)}
        var stage=$("#plinkoneonStage");
        if(mult>=10){sfx.big();winBanner(stage,mult+"× — "+fmt$(pay));burstFX(stage,{});stageFx(stage,"win")}
        else if(mult>=1){sfx.win()}
        else if(mult>0){sfx.click()}
        else{sfx.lose()}
        hist.unshift({t:mult+"×",w:mult>=1});hist=hist.slice(0,12);histChips($("#plinkoneonHist"),hist);
      }
    }
    balls=balls.filter(function(b){return !b.done});
    drawBoard();
    if(alive||balls.length)raf=_bvRequestAnimationFrame(loop);else raf=null;
  }
  function drop(){
    var bet=getBet("plinkoneonBet");if(bet==null)return;
    charge(bet);dropped++;$("#plinkoneonCount").textContent=dropped;sfx.click();
    var m=metrics(),path=[],pos=0,r;
    for(r=0;r<rows;r++){pos+=Math.random()<0.5?0:1;path.push(pos)}
    var steps=path.map(function(p,rr){return{x:m.cx+(p-rr/2)*m.sp,y:m.top+rr*m.sp}});
    balls.push({x:m.cx,y:8,steps:steps,si:0,prog:0,bet:bet,slot:pos,trail:[]});
    if(!raf)loop();
  }
  var rowBtns=$("#plinkoneonRows").querySelectorAll("button");
  for(var k=0;k<rowBtns.length;k++){rowBtns[k].addEventListener("click",function(){rows=parseInt(this.getAttribute("data-rows"),10);for(var i=0;i<rowBtns.length;i++)rowBtns[i].classList.toggle("on",rowBtns[i]===this);balls=[];paintSlots();drawBoard();sfx.click()})}
  $("#plinkoneonDrop").addEventListener("click",drop);
  paintSlots();sizeCanvas();
  if(typeof ResizeObserver!=="undefined"){var plinkoNeonRO=new ResizeObserver(function(){sizeCanvas()});plinkoNeonRO.observe(cv);onCleanup(function(){plinkoNeonRO.disconnect()})}
  else window.addEventListener("resize",sizeCanvas);
  onCleanup(function(){if(raf)_bvCancelAnimationFrame(raf);raf=null});
  addDust($("#plinkoneonStage"),10);
};
/* ==================== GAMES42: MINESGOLD ==================== */
BUILDERS.minesgold=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

  var $=function(s){return mount.querySelector(s)};
  var active=false,minesSet={},mineCount=3,curBet=0,totalBet=0,revealed=0,hist=[];
  var NUG='<svg viewBox="0 0 24 24" fill="none" stroke="#ffd479" stroke-width="1.7" stroke-linejoin="round"><path d="M5 15 L9 7h6l4 8-3 5H8Z" fill="rgba(245,185,66,.35)"/><path d="M9 7l3 5 3-5M12 12v8" opacity=".8"/></svg>';
  var DYN='<svg viewBox="0 0 24 24" fill="none" stroke="#ff5c5c" stroke-width="1.8" stroke-linecap="round"><path d="M6 20V10M10 20V8M14 20V10" /><path d="M10 8c0-3 3-3.4 4.6-5" /><circle cx="16" cy="2.4" r="1.3" fill="#ffd479" stroke="none"/></svg>';
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("minesgoldBet","10.00")
    +'<div class="field"><label>Number of Dynamite Bundles</label><div class="amount-in"><input id="minesgoldCount" type="number" min="1" max="24" step="1" value="3" /><span class="cur">/ 25 cells</span></div></div>'
    +'<button class="action-btn" id="minesgoldBtn">Start Digging</button>'
    +'<div class="stat-grid"><div class="stat-box"><small>Nuggets Found</small><b id="minesgoldGems">0</b></div><div class="stat-box"><small>Current Multiplier</small><b id="minesgoldMult">1.00×</b></div><div class="stat-box"><small>Next Cell</small><b id="minesgoldNext">—</b></div><div class="stat-box"><small>Bank Value</small><b id="minesgoldCash" style="color:var(--green)">—</b></div></div>'
    +'<div class="hist-row" id="minesgoldHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>A 5×5 shaft hides your chosen number of <b>dynamite bundles</b> (1–24). Every safe cell reveals a gold nugget and raises your multiplier.</li>'
    +'<li>Multipliers are combinatorially fair with the source 0.97 factor: after <b>i</b> safe reveals, multiplier = 0.97 × C(25, i) ÷ C(25 − dynamite, i), rounded down to 2 decimals.</li>'
    +'<li><b>Bank it</b> at any time (after at least 1 nugget) to collect bet × current multiplier. Hitting dynamite loses the whole bet and reveals the board.</li>'
    +'<li>Clearing every safe cell banks automatically at the full multiplier.</li>'
    +'</ul></div></div>'
    +'<div class="stage mg-stage" id="minesgoldStage">'+gameHeaderHtml('minesgold')
    +'<div class="mg-progress"><i id="minesgoldProgFill"></i></div>'
    +'<div class="mg-grid" id="minesgoldGrid"></div>'
    +'<div class="mg-bank"><div class="mg-nug" id="minesgoldNugCount">0</div><div class="mg-lbl">Nuggets in your sack</div>'
    +'<div class="mg-ladder" id="minesgoldLadder"></div>'
    +'<button class="action-btn mg-bankbtn" id="minesgoldBank" disabled>Bank It</button></div>'
    +'<p class="mg-hint" id="minesgoldHint">Set your bet and dynamite count, then start digging.</p>'
    +'</div></div>';
  wireAmount("minesgoldBet");
  var grid=$("#minesgoldGrid");
  function comb(n,k){if(k<0||k>n)return 0;var r=1;for(var i=0;i<k;i++)r=r*(n-i)/(i+1);return r}
  function multAt(picks){return Math.floor(0.97*comb(25,picks)/comb(25-mineCount,picks)*100)/100}
  function renderGrid(revealAll,hitIdx){
    grid.innerHTML="";
    for(var i=0;i<25;i++){
      var b=document.createElement("button");b.className="mg-tile";b.setAttribute("data-i",""+i);
      var isMine=!!minesSet[i];
      if(revealAll){b.classList.add("flip");b.style.animationDelay=(i*20)+"ms";if(isMine){b.innerHTML=DYN;b.classList.add(i===hitIdx?"bomb":"dim")}else{b.innerHTML=NUG;b.classList.add("gem","dim")}b.disabled=true}
      else if(b.getAttribute("data-done")==="1"){b.innerHTML=NUG;b.classList.add("gem");b.disabled=true}
      else if(!active)b.disabled=true;
      grid.appendChild(b);
    }
    /* Preserve already-revealed safe cells during a live round: re-mark them from the revealed set */
    if(!revealAll&&active){
      var done=grid.getAttribute("data-done-list");
      if(done){var parts=done.split(",");for(var j=0;j<parts.length;j++){if(parts[j]==="")continue;var idx=parseInt(parts[j],10);var cell=grid.children[idx];if(cell){cell.innerHTML=NUG;cell.classList.add("gem");cell.disabled=true}}}
    }
  }
  function renderLadder(){
    var safe=25-mineCount,htm="",i;
    var maxShow=Math.min(safe,10);
    for(i=1;i<=maxShow;i++){
      var cls=i<=revealed?"done":(i===revealed+1&&active?"next":"");
      htm+='<span class="'+cls+'">Depth '+i+': '+multAt(i).toFixed(2)+'×</span>';
    }
    if(safe>maxShow)htm+='<span>… to '+multAt(safe).toFixed(2)+'×</span>';
    $("#minesgoldLadder").innerHTML=htm;
  }
  function updStats(){
    $("#minesgoldGems").textContent=revealed;
    $("#minesgoldNugCount").textContent=revealed;
    var cur=revealed?multAt(revealed):1;
    $("#minesgoldMult").textContent=cur.toFixed(2)+"×";
    $("#minesgoldNext").textContent=active?multAt(revealed+1).toFixed(2)+"×":"—";
    $("#minesgoldCash").textContent=active?fmt$(curBet*cur):"—";
    var pf=$("#minesgoldProgFill");if(pf){var safe=Math.max(1,25-mineCount);pf.style.width=(active?Math.min(100,revealed/safe*100):0)+"%"}
    var bank=$("#minesgoldBank");if(bank)bank.disabled=!(active&&revealed>0);
    renderLadder();
  }
  function start(){
    var bet=getBet("minesgoldBet");if(bet==null)return;
    var mc=parseInt($("#minesgoldCount").value,10);
    if(isNaN(mc)||mc<1||mc>24){toast("Invalid dynamite","Pick between 1 and 24 bundles.","err");return}
    mineCount=mc;charge(bet);curBet=bet;totalBet=bet;revealed=0;active=true;
    minesSet={};var placed=0;while(placed<mineCount){var idx=Math.floor(Math.random()*25);if(!minesSet[idx]){minesSet[idx]=true;placed++}}
    grid.setAttribute("data-done-list","");
    renderGrid(false);updStats();
    var btn=$("#minesgoldBtn");btn.textContent="Bank It";btn.classList.add("cashout");btn.disabled=true;
    $("#minesgoldHint").textContent="Dig a cell — every nugget deepens the shaft and raises your multiplier.";
    sfx.click();
  }
  function endRound(){
    active=false;var btn=$("#minesgoldBtn");btn.textContent="Start Digging";btn.classList.remove("cashout");btn.disabled=false;
    var bank=$("#minesgoldBank");if(bank)bank.disabled=true;
  }
  function cashout(auto){
    if(!active||revealed===0)return;
    var m=multAt(revealed);
    var totalPayout=Math.round(curBet*m*100)/100;
    var pay=settle("Mines Gold",totalBet,totalPayout/totalBet);
    renderGrid(true);endRound();updStats();
    $("#minesgoldHint").textContent=(auto?"Shaft cleared! ":"")+"Banked at "+m.toFixed(2)+"× — the dynamite is revealed.";
    hist.unshift({t:m.toFixed(2)+"×",w:true});histChips($("#minesgoldHist"),hist.slice(0,12));
    sfx.win();var stage=$("#minesgoldStage");winBanner(stage,"BANKED "+fmt$(pay));burstFX(stage,{});stageFx(stage,"win");
  }
  grid.addEventListener("click",function(e){
    var t=e.target.closest(".mg-tile");if(!t||!active||t.disabled)return;
    var i=parseInt(t.getAttribute("data-i"),10);
    var tr=t.getBoundingClientRect(),tileAt={x:tr.left+tr.width/2,y:tr.top+tr.height/2};
    var stage=$("#minesgoldStage");
    if(minesSet[i]){
      settle("Mines Gold",totalBet,0);
      hist.unshift({t:"Boom",w:false});histChips($("#minesgoldHist"),hist.slice(0,12));
      renderGrid(true,i);endRound();updStats();
      $("#minesgoldHint").textContent="Boom — that cell hid dynamite. Round lost.";
      sfx.lose();stageFx(stage,"shake");_bvSetTimeout(function(){stageFx(stage,"lose")},70);burstFX(stage,{at:tileAt,colors:["#ff5c5c","#ff8a3d","#ffd479"],n:22});
    }else{
      var doneList=grid.getAttribute("data-done-list")||"";
      grid.setAttribute("data-done-list",doneList?doneList+","+i:""+i);
      t.innerHTML=NUG;t.classList.add("gem","flip");t.disabled=true;
      revealed++;sfx.coin();updStats();
      burstFX(stage,{at:tileAt,colors:["#ffd479","#f5b942","#ffffff"],n:8});
      $("#minesgoldBtn").disabled=revealed===0;
      if(revealed===25-mineCount){cashout(true);toast("Shaft cleared!","You found every nugget.","gold")}
    }
  });
  $("#minesgoldBtn").addEventListener("click",function(){if(!active)start();else cashout(false)});
  $("#minesgoldBank").addEventListener("click",function(){cashout(false)});
  renderGrid(false);updStats();
  addDust($("#minesgoldStage"),10);
};
/* ==================== GAMES42: CRASHROCKET ==================== */
BUILDERS.crashrocket=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

  var $=function(s){return mount.querySelector(s)};
  var hist=[],running=false,raf=null,myBet=null,totalBet=0,cashedOut=false,crashPt=2.34,startedAt=0,autoAt=0,timers=[];
  var rocketSvg='<svg viewBox="0 0 46 88"><polygon points="23,88 13,64 33,64" fill="#ff9a3c"/><polygon points="23,88 17,66 29,66" fill="#ffd479"/><polygon points="23,2 34,20 12,20" fill="#e63946"/><polygon points="23,2 34,20 23,20" fill="#ff7070"/><rect x="12" y="20" width="22" height="38" rx="4" fill="#e8ecf2"/><rect x="12" y="20" width="22" height="7" fill="#ffd479"/><circle cx="23" cy="38" r="6.5" fill="#14335c" stroke="#8a6a2f" stroke-width="2"/><circle cx="21" cy="36" r="2" fill="#9fc4e8"/><polygon points="12,58 3,76 12,74" fill="#e63946"/><polygon points="34,58 43,76 34,74" fill="#e63946"/><rect x="17" y="58" width="12" height="8" rx="2" fill="#5a5f6a"/></svg>';
  var stars="";
  for(var si=0;si<34;si++){var sx=(Math.random()*96).toFixed(1),sy=(Math.random()*94).toFixed(1),ss=(Math.random()<0.85?2:3);stars+='<i class="cr-star" style="left:'+sx+'%;top:'+sy+'%;width:'+ss+'px;height:'+ss+'px"></i>'}
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("crashrocketBet","10.00")
    +'<div class="field"><label>Auto Cashout (optional)</label><div class="amount-in"><input id="crashrocketAuto" type="number" min="1.01" step="0.01" placeholder="e.g. 2.00" /><span class="cur">×</span></div></div>'
    +'<button class="action-btn" id="crashrocketBtn">Place Bet &amp; Launch</button>'
    +'<div class="stat-grid"><div class="stat-box"><small>Your Bet</small><b id="crashrocketMyBet">—</b></div><div class="stat-box"><small>Cashout Value</small><b id="crashrocketCashVal" style="color:var(--green)">—</b></div></div>'
    +'<h4 style="margin-top:18px">Recent Crashes</h4><div class="hist-row" id="crashrocketHist" style="margin-top:0"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>The rocket climbs and the multiplier grows as <b>e^(0.115 × seconds)</b>, starting at 1.00×. Cash out before it bursts to collect bet × multiplier at the moment you bail.</li>'
    +'<li>Crash point generation is exactly the source Crash formula: <b>3% of rounds bust instantly at 1.00×</b>; otherwise crash = min(250, max(1, 0.99 ÷ (1 − r))) for uniform r — about 96% RTP.</li>'
    +'<li>If the rocket bursts before you cash out, the bet is lost. Optional auto-cashout bails automatically at your chosen multiplier.</li>'
    +'</ul></div></div>'
    +'<div class="stage cr-stage" id="crashrocketStage">'+gameHeaderHtml('crashrocket')
    +'<div class="cr-sky" id="crashrocketSky">'+stars+'<div class="cr-rocket" id="crashrocketRocket">'+rocketSvg+'</div>'
    +'<div class="cr-alt"><div class="cr-big" id="crashrocketMult">1.00×</div></div></div>'
    +'<div class="cr-state" id="crashrocketState">Place a bet to launch</div>'
    +'</div></div>';
  wireAmount("crashrocketBet");
  function genCrash(){var r=Math.random();if(r<0.03)return 1;return Math.min(250,Math.max(1,0.99/(1-Math.random())))}
  function spawnDot(){
    if(!ngAnim())return;
    var sky=$("#crashrocketSky"),rock=$("#crashrocketRocket");if(!sky||!rock)return;
    var d=document.createElement("i");d.className="cr-dot";
    var bottomPct=parseFloat(rock.style.bottom)||4;
    d.style.left=(46+Math.random()*8)+"%";
    d.style.bottom="calc("+bottomPct+"% + 2px)";
    d.style.opacity="0.9";
    sky.appendChild(d);
    var steps=0;
    var iv=_bvSetInterval(function(){steps++;d.style.opacity=(0.9-steps*0.14)+"";d.style.bottom="calc("+bottomPct+"% - "+(steps*5)+"px)";if(steps>=6){_bvClearInterval(iv);if(d.parentNode)d.parentNode.removeChild(d)}},70);
    timers.push(iv);
  }
  function endRound(crashedAt){
    running=false;
    var cm=$("#crashrocketMult");
    cm.textContent=crashedAt.toFixed(2)+"×";cm.classList.remove("warm","hot");cm.classList.add("crashed");
    $("#crashrocketState").textContent="Rocket crashed at "+crashedAt.toFixed(2)+"×";
    var rock=$("#crashrocketRocket");if(rock){rock.classList.remove("cr-shake");rock.classList.add("cr-explode");rock.style.opacity="1"}
    hist.unshift({t:crashedAt.toFixed(2)+"×",w:crashedAt>=2});hist=hist.slice(0,12);histChips($("#crashrocketHist"),hist);
    var stage=$("#crashrocketStage");
    stageFx(stage,"shake");timers.push(_bvSetTimeout(function(){stageFx(stage,"lose")},70));
    if(myBet!==null&&!cashedOut){settle("Crash Rocket",totalBet,0);$("#crashrocketCashVal").textContent=fmt$(0);sfx.lose();burstFX(stage,{colors:["#ff5c5c","#ff8a3d","#ffd479"],n:26})}
    var btn=$("#crashrocketBtn");btn.disabled=false;btn.textContent="Place Bet & Launch";btn.classList.remove("cashout");
    myBet=null;
  }
  function doCashout(atMult){
    if(myBet===null||cashedOut||!running)return;
    cashedOut=true;
    var totalPayout=Math.round(myBet*atMult*100)/100;
    var pay=settle("Crash Rocket",totalBet,totalPayout/totalBet);
    $("#crashrocketCashVal").textContent=fmt$(pay);
    $("#crashrocketState").textContent="Cashed out @ "+atMult.toFixed(2)+"×";
    sfx.win();var stage=$("#crashrocketStage");winBanner(stage,"CASHED OUT "+fmt$(pay));burstFX(stage,{});stageFx(stage,"win");
    var btn=$("#crashrocketBtn");btn.textContent="Waiting for crash…";btn.disabled=true;btn.classList.remove("cashout");
    myBet=null;
  }
  function startRound(){
    var bet=getBet("crashrocketBet");if(bet==null)return;
    charge(bet);myBet=bet;totalBet=bet;cashedOut=false;crashPt=genCrash();autoAt=parseFloat($("#crashrocketAuto").value)||0;
    $("#crashrocketMyBet").textContent=fmt$(bet);$("#crashrocketCashVal").textContent=fmt$(bet);
    var cm=$("#crashrocketMult");cm.classList.remove("crashed","warm","hot");cm.textContent="1.00×";
    var rock=$("#crashrocketRocket");rock.classList.remove("cr-shake","cr-explode");rock.style.opacity="1";rock.style.left="8%";rock.style.bottom="4%";rock.style.transform="translateX(-50%) rotate(38deg)";
    var sky=$("#crashrocketSky");sky.style.background="linear-gradient(180deg,#1e2a5a 0%,#0b1030 60%,#05070f 100%)";
    var btn=$("#crashrocketBtn");btn.textContent="Cash Out";btn.classList.add("cashout");
    running=true;startedAt=performance.now();
    var frame=0;
    var loop=function(){
      if(!running)return;
      var t=(performance.now()-startedAt)/1000;
      var m=Math.exp(0.115*t);
      cm.textContent=m.toFixed(2)+"×";
      cm.classList.toggle("warm",m>=2&&m<5);
      cm.classList.toggle("hot",m>=5);
      var logM=Math.log(Math.max(m,1));
      var altPct=Math.min(70,4+logM*13);
      rock.style.left=(8+Math.min(70,logM*13))+"%";
      rock.style.bottom=altPct+"%";
      var dark=Math.min(70,Math.log(Math.max(m,1))*16);
      sky.style.background="linear-gradient(180deg, rgb("+(30-dark*0.35)+","+(42-dark*0.5)+","+(90-dark)+") 0%, #0b1030 60%, #05070f 100%)";
      frame++;if(frame%5===0)spawnDot();
      $("#crashrocketState").textContent="Climbing… altitude "+m.toFixed(2)+"×";
      if(myBet!==null&&!cashedOut)$("#crashrocketCashVal").textContent=fmt$(myBet*m);
      if(autoAt>1&&m>=autoAt&&myBet!==null&&!cashedOut){doCashout(autoAt);raf=_bvRequestAnimationFrame(loop);return}
      if(m>=crashPt){endRound(crashPt);return}
      raf=_bvRequestAnimationFrame(loop);
    };
    raf=_bvRequestAnimationFrame(loop);
  }
  $("#crashrocketBtn").addEventListener("click",function(){
    if(!running){startRound();return}
    if(myBet!==null&&!cashedOut){var m=parseFloat($("#crashrocketMult").textContent)||1;doCashout(Math.max(1,m))}
  });
  onCleanup(function(){running=false;if(raf)_bvCancelAnimationFrame(raf);for(var i=0;i<timers.length;i++){_bvClearTimeout(timers[i]);_bvClearInterval(timers[i])}timers=[]});
  addDust($("#crashrocketStage"),10);
};
/* ==================== GAMES42: LIMBOTURBO ==================== */
BUILDERS.limboturbo=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

  var $=function(s){return mount.querySelector(s)};
  var hist=[],busy=false,timers=[];
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("limboturboBet","10.00")
    +'<div class="field"><label>Target multiplier</label><div class="lt-targetrow"><div class="amount-in"><input id="limboturboTarget" type="number" min="1.01" step="0.01" value="2.00" /><span class="cur">×</span></div></div>'
    +'<div class="lt-chips" id="limboturboChips"><button class="mini-btn" data-t="1.5">1.5×</button><button class="mini-btn" data-t="2">2×</button><button class="mini-btn" data-t="3">3×</button><button class="mini-btn" data-t="5">5×</button><button class="mini-btn" data-t="10">10×</button><button class="mini-btn" data-t="50">50×</button></div></div>'
    +'<div class="stat-grid"><div class="stat-box"><small>Win chance</small><b id="limboturboChance">49.50%</b></div><div class="stat-box"><small>Payout</small><b id="limboturboPay">2.00×</b></div></div>'
    +'<button class="action-btn" id="limboturboPlay" style="margin-top:16px">Place Bet — Turbo</button>'
    +'<div class="hist-row" id="limboturboHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>Set a <b>target multiplier</b> (minimum 1.01×) or tap a quick chip. A result is drawn with the exact source Limbo formula: <b>result = 0.99 ÷ (1 − r)</b> for uniform r in [0,1).</li>'
    +'<li>If <b>result ≥ target</b> you win bet × target — so win chance = <b>99% ÷ target</b> (2.00× target = 49.50% chance). Otherwise the bet is lost.</li>'
    +'<li>Turbo rounds resolve in about 250ms. 99.0% RTP at every target.</li>'
    +'</ul></div></div>'
    +'<div class="stage lt-stage" id="limboturboStage">'+gameHeaderHtml('limboturbo')
    +'<div class="lt-big" id="limboturboResult">1.00×</div>'
    +'<div class="lt-msg" id="limboturboMsg">Set your target and place a bet</div>'
    +'<div class="lt-strip" id="limboturboStrip"></div>'
    +'</div></div>';
  wireAmount("limboturboBet");
  onCleanup(function(){timers.forEach(clearTimeout);timers=[]});
  function fmtR(r){
    if(r>=1000000)return (r/1000000).toFixed(2)+"M×";
    if(r>=1000)return Math.floor(r).toLocaleString("en-US")+"×";
    return r.toFixed(2)+"×";
  }
  function targetVal(){var v=parseFloat($("#limboturboTarget").value);return isNaN(v)?0:v}
  function refresh(){
    var t=targetVal();
    if(t>=1.01){$("#limboturboChance").textContent=(99/t).toFixed(2)+"%";$("#limboturboPay").textContent=t<10?t.toFixed(2)+"×":Math.floor(t)+"×"}
    else{$("#limboturboChance").textContent="—";$("#limboturboPay").textContent="—"}
  }
  $("#limboturboTarget").addEventListener("input",refresh);refresh();
  var chips=$("#limboturboChips").querySelectorAll("button");
  for(var ci=0;ci<chips.length;ci++){chips[ci].addEventListener("click",function(){$("#limboturboTarget").value=parseFloat(this.getAttribute("data-t")).toFixed(2);refresh();sfx.click()})}
  function renderStrip(){
    var htm="";for(var i=0;i<Math.min(hist.length,14);i++){htm+='<span class="'+(hist[i].w?"w":"l")+'">'+hist[i].t+'</span>'}
    $("#limboturboStrip").innerHTML=htm;
  }
  $("#limboturboPlay").addEventListener("click",function(){
    if(busy)return;
    var t=targetVal();
    if(!(t>=1.01)){toast("Invalid target","Set a target of at least 1.01×.","err");return}
    var bet=getBet("limboturboBet");if(bet==null)return;
    busy=true;charge(bet);var totalBet=bet;flyChip(this,$("#limboturboStage"));sfx.click();
    var stage=$("#limboturboStage"),res=$("#limboturboResult"),msg=$("#limboturboMsg");
    var btn=this;btn.disabled=true;
    /* EXACT source generation: result = 0.99 / (1 - r); win if result >= target; pays target */
    var result=0.99/(1-Math.random());
    var win=result>=t,mult=win?t:0;
    function finish(){
      busy=false;btn.disabled=false;
      res.textContent=fmtR(result);
      res.className="lt-big "+(win?"hot":"bust")+(ngAnim()?" lt-flash":"");
      var payout=settle("Limbo Turbo",totalBet,mult);
      if(win){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win();msg.textContent="Target cleared at "+fmtR(result)+" — paid "+(t<10?t.toFixed(2):Math.floor(t))+"×"}
      else{stageFx(stage,"lose");sfx.lose();msg.textContent="Busted at "+fmtR(result)+" — below "+(t<10?t.toFixed(2):Math.floor(t))+"×"}
      hist.unshift({t:fmtR(result),w:mult>1});histChips($("#limboturboHist"),hist.slice(0,12));renderStrip();
    }
    if(ngAnim()){
      res.className="lt-big";res.textContent="…";
      timers.push(_bvSetTimeout(finish,250));
    }else{finish()}
  });
  renderStrip();
  addDust($("#limboturboStage"),10);
};
/* ==================== GAMES42: KENODELUXE ==================== */
BUILDERS.kenodeluxe=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

  var $=function(s){return mount.querySelector(s)};
  var hist=[],picks=[],busy=false,timers=[];
  /* Deluxe paytable (total payout multipliers). Hypergeometric EV per pick count:
     catch probs from C(p,k)*C(80-p,20-k)/C(80,20). EVs:
     1:0.950  2:0.951  3:0.957  4:0.960  5:0.956  6:0.957  7:0.955  8:0.951  9:0.963  10:0.958
     Verified by kenodeluxe-sim.js Monte Carlo (all 0.94-0.98). */
  var PAY={
    1:{1:3.8},
    2:{1:1,2:9.5},
    3:{2:2.4,3:45},
    4:{2:1.18,3:9.6,4:96},
    5:{3:4.2,4:40,5:185},
    6:{3:2.6,4:10.5,5:95,6:200},
    7:{3:1.6,4:6,5:31,6:112,7:480},
    8:{4:3.9,5:19.5,6:92,7:340,8:950},
    9:{4:2.35,5:9.8,6:44,7:175,8:580,9:1150},
    10:{5:6.8,6:33,7:110,8:350,9:800,10:1500}
  };
  var cells="";
  for(var n=1;n<=80;n++)cells+='<div class="kd-cell" data-n="'+n+'">'+n+'</div>';
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("kenodeluxeBet","10.00")
    +'<div class="stat-grid"><div class="stat-box"><small>Numbers picked</small><b id="kenodeluxeCount">0 / 10</b></div>'
    +'<div class="stat-box"><small>Top prize</small><b id="kenodeluxeTop">—</b></div></div>'
    +'<div class="kd-rowbtns"><button class="mini-btn" id="kenodeluxeQuick" style="flex:1">Quick Pick</button>'
    +'<button class="mini-btn" id="kenodeluxeClear" style="flex:1">Clear</button></div>'
    +'<div class="kd-pay" id="kenodeluxePay"></div>'
    +'<button class="action-btn" id="kenodeluxePlay" style="margin-top:16px">Draw Numbers</button>'
    +'<div class="hist-row" id="kenodeluxeHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>Pick <b>1–10 numbers</b> from 1–80. <b>20 balls</b> are drawn without replacement. Payouts (total, × bet) by picks → catch:</li>'
    +'<li><b>1 pick:</b> catch 1 = 3.8× &nbsp; <b>2 picks:</b> 1 = 1×, 2 = 9.5× &nbsp; <b>3 picks:</b> 2 = 2.4×, 3 = 45×</li>'
    +'<li><b>4 picks:</b> 2 = 1.18×, 3 = 9.6×, 4 = 96× &nbsp; <b>5 picks:</b> 3 = 4.2×, 4 = 40×, 5 = 185×</li>'
    +'<li><b>6 picks:</b> 3 = 2.6×, 4 = 10.5×, 5 = 95×, 6 = 200× &nbsp; <b>7 picks:</b> 3 = 1.6×, 4 = 6×, 5 = 31×, 6 = 112×, 7 = 480×</li>'
    +'<li><b>8 picks:</b> 4 = 3.9×, 5 = 19.5×, 6 = 92×, 7 = 340×, 8 = 950× &nbsp; <b>9 picks:</b> 4 = 2.35×, 5 = 9.8×, 6 = 44×, 7 = 175×, 8 = 580×, 9 = 1,150×</li>'
    +'<li><b>10 picks:</b> 5 = 6.8×, 6 = 33×, 7 = 110×, 8 = 350×, 9 = 800×, 10 = 1,500×. Catches not listed pay 0. Each pick count returns ≈96% over time.</li>'
    +'</ul></div></div>'
    +'<div class="stage kd-stage" id="kenodeluxeStage">'+gameHeaderHtml('kenodeluxe')
    +'<div class="kd-drawstage" id="kenodeluxeDraw"><span style="color:#8a7a5f;font-weight:700">Drawn balls appear here</span></div>'
    +'<div class="kd-board"><div class="kd-grid" id="kenodeluxeGrid">'+cells+'</div></div>'
    +'<div class="kd-status" id="kenodeluxeStatus">Pick 1–10 numbers, then draw</div></div></div>';
  wireAmount("kenodeluxeBet");
  onCleanup(function(){timers.forEach(clearTimeout);timers=[]});
  var grid=$("#kenodeluxeGrid");
  function renderPay(){
    var p=picks.length,box=$("#kenodeluxePay");
    $("#kenodeluxeCount").textContent=p+" / 10";
    if(p<1){box.innerHTML='<div style="text-align:center;color:#8a7a5f;margin-top:10px">Pick at least 1 number to see the paytable</div>';$("#kenodeluxeTop").textContent="—";return}
    var tbl=PAY[p],rows="",top=0;
    var keys=Object.keys(tbl).sort(function(a,b){return a-b});
    for(var i=0;i<keys.length;i++){var h=keys[i];rows+='<tr><td>Catch '+h+'</td><td>'+tbl[h]+'×</td></tr>';if(tbl[h]>top)top=tbl[h]}
    box.innerHTML='<table>'+rows+'</table>';
    $("#kenodeluxeTop").textContent=top+"×";
  }
  function paint(){
    var divs=grid.children;
    for(var i=0;i<divs.length;i++){var n=i+1;divs[i].className="kd-cell"+(picks.indexOf(n)>=0?" sel":"")}
    renderPay();
  }
  grid.addEventListener("click",function(e){
    if(busy)return;
    var t=e.target.closest(".kd-cell");if(!t)return;
    var n=+t.getAttribute("data-n"),ix=picks.indexOf(n);
    if(ix>=0)picks.splice(ix,1);
    else{if(picks.length>=10){toast("Keno Deluxe","Maximum 10 numbers","err");return}picks.push(n);sfx.click()}
    paint();
  });
  $("#kenodeluxeQuick").addEventListener("click",function(){
    if(busy)return;
    picks=[];var pool=[];for(var i=1;i<=80;i++)pool.push(i);
    var count=5+Math.floor(Math.random()*6);
    while(picks.length<count)picks.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
    sfx.click();paint();
  });
  $("#kenodeluxeClear").addEventListener("click",function(){if(busy)return;picks=[];sfx.click();paint()});
  $("#kenodeluxePlay").addEventListener("click",function(){
    if(busy)return;
    if(picks.length<1){toast("Keno Deluxe","Pick 1–10 numbers first","err");return}
    var bet=getBet("kenodeluxeBet");if(bet==null)return;
    busy=true;charge(bet);var totalBet=bet;flyChip(this,$("#kenodeluxeStage"));sfx.click();
    var stage=$("#kenodeluxeStage"),status=$("#kenodeluxeStatus"),drawBox=$("#kenodeluxeDraw");
    var btn=this;btn.disabled=true;
    var divs=grid.children,i;
    for(i=0;i<divs.length;i++)divs[i].className="kd-cell"+(picks.indexOf(i+1)>=0?" sel":"");
    drawBox.innerHTML="";
    var pool=[];for(var j=1;j<=80;j++)pool.push(j);
    var drawn=[];while(drawn.length<20)drawn.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
    var hits=0,di=0;
    function finish(){
      busy=false;btn.disabled=false;
      var p=picks.length,mult=(PAY[p][hits]||0);
      var totalPayout=Math.round(totalBet*mult*100)/100;
      var payout=settle("Keno Deluxe",totalBet,totalBet>0?totalPayout/totalBet:0);
      if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win();if(mult>=100)sfx.big();status.textContent="Caught "+hits+" of "+p+" — pays "+mult+"×!"}
      else if(mult===1){stageFx(stage,"shake");sfx.click();status.textContent="Caught "+hits+" of "+p+" — stake back."}
      else if(mult>0){stageFx(stage,"win");sfx.coin();status.textContent="Caught "+hits+" of "+p+" — pays "+mult+"× (part of stake back plus)."}
      else{stageFx(stage,"lose");sfx.lose();status.textContent="Caught "+hits+" of "+p+" — no win."}
      hist.unshift({t:hits+"/"+p,w:mult>1});histChips($("#kenodeluxeHist"),hist.slice(0,12));
    }
    function markOne(){
      var n=drawn[di],el=divs[n-1],isHit=picks.indexOf(n)>=0;
      el.className="kd-cell drawn"+(isHit?" hit":"");
      var ball=document.createElement("div");ball.className="kd-ball"+(isHit?" hit":"")+(ngAnim()?" kd-in":"");ball.textContent=n;drawBox.appendChild(ball);
      if(isHit){hits++;sfx.coin()}
      status.textContent="Drawn "+(di+1)+" / 20 — "+hits+" hit"+(hits===1?"":"s");
      di++;
      if(di<drawn.length)timers.push(_bvSetTimeout(markOne,ngAnim()?170:0));
      else timers.push(_bvSetTimeout(finish,ngAnim()?250:0));
    }
    markOne();
  });
  paint();
  addDust($("#kenodeluxeStage"),10);
};
/* ==================== GAMES42: MEGAWHEEL ==================== */
BUILDERS.megawheel=function(mount){
  // Per-game lifecycle: stop pending async work when navigating away.
  var _bvDisposed=false,_bvTimers=new Set(),_bvIntervals=new Set(),_bvRafs=new Set();
  function _bvSetTimeout(fn,ms){var id=window.setTimeout(function(){_bvTimers.delete(id);if(!_bvDisposed)fn();},ms);_bvTimers.add(id);return id;}
  function _bvClearTimeout(id){window.clearTimeout(id);_bvTimers.delete(id);}
  function _bvSetInterval(fn,ms){var id=window.setInterval(function(){if(!_bvDisposed)fn();},ms);_bvIntervals.add(id);return id;}
  function _bvClearInterval(id){window.clearInterval(id);_bvIntervals.delete(id);}
  function _bvRequestAnimationFrame(fn){var id=window.requestAnimationFrame(function(ts){_bvRafs.delete(id);if(!_bvDisposed)fn(ts);});_bvRafs.add(id);return id;}
  function _bvCancelAnimationFrame(id){window.cancelAnimationFrame(id);_bvRafs.delete(id);}
  onCleanup(function(){_bvDisposed=true;_bvTimers.forEach(function(id){window.clearTimeout(id);});_bvTimers.clear();_bvIntervals.forEach(function(id){window.clearInterval(id);});_bvIntervals.clear();_bvRafs.forEach(function(id){window.cancelAnimationFrame(id);});_bvRafs.clear();});

  var $=function(s){return mount.querySelector(s)};
  var VALUES=[1,2,5,10,20,40];
  var COUNTS={1:41,2:28,5:14,10:7,20:4,40:2};
  var COLORS={1:"#274b73",2:"#1f7a4d",5:"#7c3aed",10:"#b45309",20:"#b91c1c",40:"#f5b942"};
  var TXTC={1:"#dbeafe",2:"#d1fae5",5:"#ede9fe",10:"#ffedd5",20:"#fee2e2",40:"#3a2200"};
  /* Build the 96 segments: interleave values so neighbours differ.
     Deterministic spread: repeatedly place the most-remaining value into the
     next slot that is not the same as the previous segment. */
  var SEG=[];
  (function(){
    var left={1:41,2:28,5:14,10:7,20:4,40:2},prev=0,guard=0;
    while(SEG.length<96&&guard++<5000){
      var best=0,bestLeft=-1;
      for(var vi=0;vi<VALUES.length;vi++){var v=VALUES[vi];if(v!==prev&&left[v]>bestLeft){bestLeft=left[v];best=v}}
      if(bestLeft<=0){ /* only prev remains — restart spread with a swap fix */
        for(var v2 in left){if(left[v2]>0){best=+v2;break}}
      }
      SEG.push(best);left[best]--;prev=best;
    }
    /* If the greedy spread left a short tail, fill plainly (counts stay exact by construction of left). */
    for(var v3 in left){while(left[v3]>0){SEG.push(+v3);left[v3]--}}
  })();
  var R=150,CX=150,CY=150;
  function pt(th,r){var a=th*Math.PI/180;return (CX+r*Math.sin(a)).toFixed(1)+" "+(CY-r*Math.cos(a)).toFixed(1)}
  var segsHtml="";
  for(var si=0;si<96;si++){
    var a0=si*3.75,a1=a0+3.75,am=a0+1.875,val=SEG[si];
    segsHtml+='<path d="M'+CX+' '+CY+' L'+pt(a0,R)+' A'+R+' '+R+' 0 0 1 '+pt(a1,R)+' Z" fill="'+COLORS[val]+'" stroke="#0d0708" stroke-width="1"/>';
    if(val>=10){var lp=pt(am,118).split(" ");segsHtml+='<text x="'+lp[0]+'" y="'+lp[1]+'" transform="rotate('+am+' '+lp[0]+' '+lp[1]+')" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="800" fill="'+TXTC[val]+'">'+val+'</text>'}
    else if(val===5){var lp5=pt(am,122).split(" ");segsHtml+='<text x="'+lp5[0]+'" y="'+lp5[1]+'" transform="rotate('+am+' '+lp5[0]+' '+lp5[1]+')" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="800" fill="'+TXTC[val]+'">5</text>'}
    var bp=pt(a0,146).split(" ");
    segsHtml+='<circle class="mw-boostdot" data-seg="'+si+'" cx="'+bp[0]+'" cy="'+bp[1]+'" r="0" fill="#ff5c5c"/>';
    segsHtml+='<text class="mw-boosttxt" data-seg="'+si+'" x="'+bp[0]+'" y="'+bp[1]+'" text-anchor="middle" dominant-baseline="central" font-size="8" font-weight="900" fill="#fff"></text>';
  }
  var chosen=2,busy=false,curRot=0,hist=[],timers=[],boosts={};
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("megawheelBet","10.00")
    +'<div class="field"><label>Bet on a segment value</label><div class="seg mw-picker" id="megawheelPick">'
    +'<button data-v="1"><span class="mw-segdot" style="background:'+COLORS[1]+'"></span>1 · 41 segs</button>'
    +'<button data-v="2" class="on"><span class="mw-segdot" style="background:'+COLORS[2]+'"></span>2 · 28 segs</button>'
    +'<button data-v="5"><span class="mw-segdot" style="background:'+COLORS[5]+'"></span>5 · 14 segs</button>'
    +'<button data-v="10"><span class="mw-segdot" style="background:'+COLORS[10]+'"></span>10 · 7 segs</button>'
    +'<button data-v="20"><span class="mw-segdot" style="background:'+COLORS[20]+'"></span>20 · 4 segs</button>'
    +'<button data-v="40"><span class="mw-segdot" style="background:'+COLORS[40]+'"></span>40 · 2 segs</button>'
    +'</div></div>'
    +'<div class="stat-grid"><div class="stat-box"><small>Win chance</small><b id="megawheelChance">29.17%</b></div><div class="stat-box"><small>Pays (total)</small><b id="megawheelPays">3.00×</b></div></div>'
    +'<button class="action-btn" id="megawheelPlay" style="margin-top:16px">Spin the Wheel</button>'
    +'<div class="hist-row" id="megawheelHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>The wheel has <b>96 equal segments</b>: value <b>1 ×41, 2 ×28, 5 ×14, 10 ×7, 20 ×4, 40 ×2</b>. Bet on one value and spin — the landing segment is uniform over all 96.</li>'
    +'<li>If the landing segment matches your value, you are paid <b>value : 1 profit</b> — total payout = bet × (value + 1). Anything else loses.</li>'
    +'<li>Before every spin, <b>two random segments are BOOSTED</b> (×2, ×3 or ×5, badged on the wheel and announced). If your winning segment is boosted, your profit is multiplied by the boost: total = bet × (1 + value × boost).</li>'
    +'<li>Base RTP by value (before boosts): 1 → 85.4%, 2 → 87.5%, 5 → 87.5%, 10 → 80.2%, 20 → 87.5%, 40 → 85.4%. Boosts raise the real return above these figures — overall ≈89% (est.).</li>'
    +'</ul></div></div>'
    +'<div class="stage mw-stage" id="megawheelStage">'+gameHeaderHtml('megawheel')
    +'<div class="mw-wrap"><div class="mw-ptr"></div>'
    +'<div class="mw-rotorwrap" id="megawheelRotorWrap"><svg class="mw-svg" viewBox="0 0 300 300"><g id="megawheelRotor">'+segsHtml+'</g><circle cx="150" cy="150" r="147" fill="none" stroke="#ffd479" stroke-width="2" opacity=".55"/></svg></div>'
    +'<div class="mw-hub">MEGA<br>WHEEL</div></div>'
    +'<div class="mw-boost" id="megawheelBoost">Boosts are drawn before each spin</div>'
    +'<div class="mw-result" id="megawheelResult">Pick a value and spin</div>'
    +'</div></div>';
  wireAmount("megawheelBet");
  onCleanup(function(){timers.forEach(clearTimeout);timers=[]});
  function refreshStats(){
    $("#megawheelChance").textContent=(COUNTS[chosen]/96*100).toFixed(2)+"%";
    $("#megawheelPays").textContent=(chosen+1).toFixed(2)+"×";
  }
  var pickBtns=$("#megawheelPick").querySelectorAll("button");
  for(var pi=0;pi<pickBtns.length;pi++){pickBtns[pi].addEventListener("click",function(){chosen=parseInt(this.getAttribute("data-v"),10);for(var i=0;i<pickBtns.length;i++)pickBtns[i].classList.toggle("on",pickBtns[i]===this);refreshStats();sfx.click()})}
  refreshStats();
  function assignBoosts(){
    boosts={};
    var dots=mount.querySelectorAll(".mw-boostdot"),txts=mount.querySelectorAll(".mw-boosttxt"),d;
    for(d=0;d<dots.length;d++){dots[d].setAttribute("r","0");txts[d].textContent=""}
    var picksIdx=[];
    while(picksIdx.length<2){var ix=Math.floor(Math.random()*96);if(picksIdx.indexOf(ix)<0)picksIdx.push(ix)}
    var opts=[2,3,5],ann=[];
    for(var b=0;b<2;b++){
      var segIx=picksIdx[b],bst=opts[Math.floor(Math.random()*opts.length)];
      boosts[segIx]=bst;
      var dot=mount.querySelector('.mw-boostdot[data-seg="'+segIx+'"]'),txt=mount.querySelector('.mw-boosttxt[data-seg="'+segIx+'"]');
      if(dot)dot.setAttribute("r","7");
      if(txt)txt.textContent="×"+bst;
      ann.push(SEG[segIx]+"-segment ×"+bst);
    }
    $("#megawheelBoost").textContent="Boosted: "+ann.join("  ·  ");
    return boosts;
  }
  assignBoosts();
  $("#megawheelPlay").addEventListener("click",function(){
    if(busy)return;
    var bet=getBet("megawheelBet");if(bet==null)return;
    busy=true;charge(bet);var totalBet=bet;sfx.click();
    var btn=this;btn.disabled=true;
    var stage=$("#megawheelStage"),wrap=$("#megawheelRotorWrap"),res=$("#megawheelResult");
    var curBoosts=assignBoosts();
    var segIx=Math.floor(Math.random()*96);
    var landed=SEG[segIx],boost=curBoosts[segIx]||0;
    /* Pointer is at the top (angle 0). Segment segIx centre sits at (segIx+0.5)*3.75deg
       before rotation; rotate so that centre lands on 0, plus full turns. */
    var centre=(segIx+0.5)*3.75;
    var targetMod=(360-(centre%360))%360;
    var curMod=((curRot%360)+360)%360;
    var delta=((targetMod-curMod)+360)%360;
    curRot+=360*5+delta;
    function finish(){
      busy=false;btn.disabled=false;
      var win=landed===chosen;
      var totalPayout=0;
      if(win)totalPayout=boost?bet*(1+chosen*boost):bet*(chosen+1);
      totalPayout=Math.round(totalPayout*100)/100;
      var payout=settle("Mega Wheel",totalBet,totalBet>0?totalPayout/totalBet:0);
      if(win){
        res.textContent="Landed "+landed+(boost?" — BOOSTED ×"+boost:"")+"! You won "+fmt$(payout);
        stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));
        if(chosen>=20||boost>=3)sfx.big();else sfx.win();
      }else{
        res.textContent="Landed "+landed+" — no match for "+chosen+".";
        stageFx(stage,"lose");sfx.lose();
      }
      hist.unshift({t:""+landed+(boost?"×"+boost:""),w:win});histChips($("#megawheelHist"),hist.slice(0,12));
    }
    res.textContent="Spinning…";
    if(ngAnim()){
      wrap.style.transform="rotate("+curRot+"deg)";
      timers.push(_bvSetTimeout(finish,3550));
    }else{
      wrap.style.transition="none";wrap.style.transform="rotate("+curRot+"deg)";
      timers.push(_bvSetTimeout(function(){wrap.style.transition="";finish()},30));
    }
  });
  addDust($("#megawheelStage"),10);
};
