/* Betvora — games/games-1.js
   Game builders (BUILDERS.*), in original order. Part of the games bundle.
   Split from the single-file build; execution order preserved across files.
   Classic script (no modules) — works over file:// and http(s). */

    /* ==================== NEWGAME: BACCARAT ==================== */
BUILDERS.baccarat=function(mount){
  var $=function(s){return mount.querySelector(s)};
  var SUITS=["\u2660","\u2665","\u2666","\u2663"],RANKS=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  var shoe=[];
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}}
  function buildShoe(){shoe=[];for(var d=0;d<6;d++)for(var s=0;s<4;s++)for(var r=0;r<13;r++)shoe.push({r:RANKS[r],s:SUITS[s],red:(s===1||s===2)});shuffle(shoe)}
  function draw(){if(shoe.length<60)buildShoe();return shoe.pop()}
  function bv(c){var r=c.r;if(r==="A")return 1;if(r==="J"||r==="Q"||r==="K"||r==="10")return 0;return parseInt(r,10)}
  function total(h){var t=0;for(var i=0;i<h.length;i++)t+=bv(h[i]);return t%10}
  var hist=[],choice="banker",dealing=false;
  function cardHtml(c,d){return '<div class="bac-card '+(c.red?"red ":"")+(ngAnim()?"bac-card-in":"")+'"'+(d?' style="animation-delay:'+(d*120)+'ms"':"")+'>'+'<div class="rk">'+c.r+'</div><div class="st">'+c.s+'</div></div>'}
  function render(p,b){
    var ph="",bh="";
    for(var i=0;i<p.length;i++)ph+=cardHtml(p[i],i);
    for(var j=0;j<b.length;j++)bh+=cardHtml(b[j],j);
    $("#baccaratPHand").innerHTML=ph;$("#baccaratBHand").innerHTML=bh;
    $("#baccaratPTotal").textContent=p.length?total(p):"";
    $("#baccaratBTotal").textContent=b.length?total(b):"";
    $("#baccaratShoeN").textContent="Shoe: "+shoe.length;
  }
  function syncSpots(){var sp=$("#baccaratSpots").querySelectorAll(".bac-spot");for(var i=0;i<sp.length;i++)sp[i].classList.toggle("on",sp[i].getAttribute("data-v")===choice)}
  function renderBeads(){
    var htm="",arr=hist.slice(0,18);
    for(var i=arr.length-1;i>=0;i--){var r=arr[i].r||"tie";htm+='<span class="bk-bead bk-'+r+'">'+r.charAt(0).toUpperCase()+'</span>'}
    $("#baccaratBeads").innerHTML=htm;
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("baccaratBet","10.00")
    +'<div class="field"><label>Bet on</label><div class="seg" id="baccaratChoice">'
    +'<button data-v="player">Player 1:1</button><button data-v="banker" class="on">Banker 0.95:1</button><button data-v="tie">Tie 8:1</button>'
    +'</div></div>'
    +'<button class="action-btn" id="baccaratPlay" style="margin-top:16px">Deal</button>'
    +'<div class="hist-row" id="baccaratHist"></div>'
    +'<div class="bac-note">Standard third-card rules. Banker wins pay 5% commission. Player/Banker bets push on a tie.</div></div>'
    +'<div class="stage" id="baccaratStage">'+gameHeaderHtml('baccarat')+'<div class="bac-rays"></div>'
    +'<div class="bac-felt">'
    +'<div class="bac-rail"></div>'
    +'<div class="bac-arc"><svg class="bac-arcsvg" viewBox="0 0 320 60"><defs><path id="bacArc" d="M28,54 Q160,-4 292,54"/></defs><text class="bac-arctext"><textPath href="#bacArc" startOffset="50%" text-anchor="middle">PUNTO BANCO</textPath></text></svg></div>'
    +'<div class="bac-shoebox"><svg class="bac-shoesvg" viewBox="0 0 84 62"><polygon points="8,56 30,30 80,30 62,56" fill="#2b0d14" stroke="#caa14f" stroke-width="1.6"/><rect x="36" y="8" width="38" height="26" rx="4" fill="#f3ecda" stroke="#caa14f" stroke-width="1.4" transform="rotate(7 55 21)"/><rect x="41" y="13" width="28" height="16" rx="3" fill="none" stroke="#7a1a28" stroke-width="1.2" transform="rotate(7 55 21)" stroke-dasharray="3 2"/><rect x="8" y="52" width="54" height="7" rx="3" fill="#3a1a12" stroke="#caa14f" stroke-width="1.4"/></svg><div class="bac-shoen" id="baccaratShoeN"></div></div>'
    +'<div class="bac-row">'
    +'<div class="bac-side" id="baccaratPSide"><div class="bac-zone-label">Player</div><div class="bac-hand" id="baccaratPHand"></div><div><span class="bac-total" id="baccaratPTotal"></span></div></div>'
    +'<div class="bac-side" id="baccaratBSide"><div class="bac-zone-label">Banker</div><div class="bac-hand" id="baccaratBHand"></div><div><span class="bac-total" id="baccaratBTotal"></span></div></div>'
    +'</div>'
    +'<div class="bac-spots" id="baccaratSpots"><div class="bac-spot" data-v="player">Player<small>pays 1:1</small></div><div class="bac-spot on" data-v="banker">Banker<small>pays 0.95:1</small></div><div class="bac-spot" data-v="tie">Tie<small>pays 8:1</small></div></div>'
    +'<div class="bac-beadwrap"><div class="bac-beadcap">Bead Road</div><div class="bac-beads" id="baccaratBeads"></div></div>'
    +'<div class="bac-msg" id="baccaratMsg">Choose a side and press Deal.</div>'
    +'</div></div></div>';
  wireAmount("baccaratBet");
  buildShoe();
  render([],[]);syncSpots();
  var segs=$("#baccaratChoice").querySelectorAll("button");
  for(var k=0;k<segs.length;k++){segs[k].addEventListener("click",function(){for(var i=0;i<segs.length;i++)segs[i].classList.remove("on");this.classList.add("on");choice=this.getAttribute("data-v");syncSpots();sfx.click()})}
  $("#baccaratPlay").addEventListener("click",function(){
    if(dealing)return;
    var bet=getBet("baccaratBet");if(bet==null)return;
    charge(bet);flyChip(this,$("#baccaratStage"));dealing=true;sfx.click();
    $("#baccaratMsg").textContent="Dealing...";
    $("#baccaratPSide").classList.remove("bac-winner");$("#baccaratBSide").classList.remove("bac-winner");
    var p=[draw(),draw()],b=[draw(),draw()];
    render(p,b);
    var pt=total(p),bt=total(b);
    var done=(pt>=8||bt>=8);
    function finishRound(){
      render(p,b);pt=total(p);bt=total(b);
      var winner=pt>bt?"player":(bt>pt?"banker":"tie");
      if(winner==="player")$("#baccaratPSide").classList.add("bac-winner");
      if(winner==="banker")$("#baccaratBSide").classList.add("bac-winner");
      var mult=0,label="";
      if(winner==="tie"){
        if(choice==="tie"){mult=9;label="TIE 8:1"}
        else{mult=1;label="TIE — PUSH"}
      }else if(choice===winner){
        if(winner==="banker"){mult=1.95;label="BANKER WINS"}else{mult=2;label="PLAYER WINS"}
      }else{mult=0;label=winner.toUpperCase()+" WINS — LOST"}
      var stage=$("#baccaratStage"),payout=settle("Baccarat",bet,mult);
      hist.unshift({t:(choice[0].toUpperCase())+" "+label,w:mult>1,r:winner});histChips($("#baccaratHist"),hist.slice(0,12));
      renderBeads();
      $("#baccaratMsg").textContent="Player "+pt+" — Banker "+bt+". "+label+(mult>1?" — Won "+fmt$(payout):(mult===1?" — Stake back":""));
      if(ngAnim()){$("#baccaratPTotal").textContent="0";$("#baccaratBTotal").textContent="0";countUp($("#baccaratPTotal"),pt,function(v){return ""+Math.round(v)},350);countUp($("#baccaratBTotal"),bt,function(v){return ""+Math.round(v)},350)}
      if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win();if(ngAnim()){stage.classList.add("rays-on");setTimeout(function(){stage.classList.remove("rays-on")},1500)}}
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
    if(ngAnim()){setTimeout(function(){if(!done)third();else finishRound()},450)}else{if(!done)third();else finishRound()}
  });
  addDust($("#baccaratStage"),10);
};
/* ==================== NEWGAME: BARS ==================== */
BUILDERS.bars=function(mount){
  var SYM=[
    {k:"s1",w:3,html:'<span class="bars-bar">BAR</span>'},
    {k:"s2",w:2,html:'<span class="bars-bar">BAR<br>BAR</span>'},
    {k:"s3",w:1,html:'<span class="bars-bar">BAR<br>BAR<br>BAR</span>'},
    {k:"seven",w:1,html:'<span class="bars-seven">7</span>'},
    {k:"star",w:5,html:'<span class="bars-star">\u2605</span>'}
  ];
  var TW=0,i;for(i=0;i<SYM.length;i++)TW+=SYM[i].w;
  function draw(){var r=Math.random()*TW;for(var k=0;k<SYM.length;k++){r-=SYM[k].w;if(r<0)return k;}return 0;}
  function pay(f){
    var k=[SYM[f[0]].k,SYM[f[1]].k,SYM[f[2]].k];
    if(k[0]==="seven"&&k[1]==="seven"&&k[2]==="seven")return 50;
    var c={s1:0,s2:0,s3:0},j;for(j=0;j<3;j++){if(c[k[j]]!==undefined)c[k[j]]++;}
    if(c.s3===3)return 25;if(c.s2===3)return 10;if(c.s1===3)return 5;
    if(c.s1===2||c.s2===2||c.s3===2)return 2;
    if(k[0]==="star"||k[1]==="star"||k[2]==="star")return 0.5;
    return 0;
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("barsBet","10.00")
    +'<button class="action-btn" id="barsPlay" style="margin-top:16px">Spin Reels</button>'
    +'<div class="bars-pay"><b>Paytable</b><br>7 7 7 &mdash; 50x &nbsp;&middot;&nbsp; Triple BAR &mdash; 25x<br>Double BAR &mdash; 10x &nbsp;&middot;&nbsp; Single BAR &mdash; 5x<br>Any two matching BARs &mdash; 2x<br>Any \u2605 on the line &mdash; 0.5x</div>'
    +'<div class="hist-row" id="barsHist"></div></div>'
    +'<div class="stage" id="barsStage">'+gameHeaderHtml('bars')
    +'<div class="bars-cabinet"><div class="bars-rays" id="barsRays"></div>'
    +'<div class="bars-marquee" id="barsMarquee"></div>'
    +'<div class="bars-reels">'
    +'<div class="bars-reel" id="barsReel0">'+SYM[4].html+'</div>'
    +'<div class="bars-reel" id="barsReel1">'+SYM[0].html+'</div>'
    +'<div class="bars-reel" id="barsReel2">'+SYM[4].html+'</div>'
    +'</div><div class="bars-payline"></div>'
    +'<div class="bars-lever" id="barsLever" role="button" tabindex="0" aria-label="Pull the lever to spin"><div class="lv-arm"><div class="lv-knob"></div></div><div class="lv-base"></div></div>'
    +'</div></div></div>';
  wireAmount("barsBet");
  var stage=document.getElementById("barsStage"),play=document.getElementById("barsPlay"),
      marquee=document.getElementById("barsMarquee"),lever=document.getElementById("barsLever");
  var busy=false,pending=null,hist=[];
  function barsRays(){
    if(!ngAnim())return;
    var r=document.getElementById("barsRays");if(!r)return;
    r.classList.remove("show");void r.offsetWidth;r.classList.add("show");
    setTimeout(function(){r.classList.remove("show");},1500);
  }
  function resolve(){
    if(!pending)return;var p=pending;pending=null;busy=false;
    if(play){play.disabled=false;play.style.opacity="";}
    if(lever)lever.classList.remove("pulled");
    if(marquee)marquee.classList.remove("on");
    var payout=settle("Bars",p.bet,p.mult);
    hist.unshift({t:p.mult>0?fmtMult(p.mult):"0x",w:p.mult>1});
    histChips(document.getElementById("barsHist"),hist.slice(0,12));
    if(p.mult>1){
      stageFx(stage,"win");burstFX(stage,{});barsRays();
      for(var r=0;r<3;r++){var rl=document.getElementById("barsReel"+r);if(rl)rl.classList.add("bars-win");}
      winBanner(stage,"WON "+fmt$(payout));
      if(p.mult>=10)sfx.big();else sfx.win();
    }else{stageFx(stage,"lose");sfx.lose();}
  }
  onCleanup(function(){if(pending){var t;for(t=0;t<pending.timers.length;t++)clearTimeout(pending.timers[t]);for(t=0;t<pending.ivs.length;t++)clearInterval(pending.ivs[t]);resolve();}});
  play.addEventListener("click",function(){
    if(busy)return;var bet=getBet("barsBet");if(bet==null)return;
    busy=true;sfx.click();play.disabled=true;play.style.opacity=".5";charge(bet);
    flyChip(play,stage);
    if(lever)lever.classList.add("pulled");
    if(marquee)marquee.classList.add("on");
    for(var r=0;r<3;r++){var rl=document.getElementById("barsReel"+r);if(rl)rl.classList.remove("bars-win","bars-stop");}
    var finals=[draw(),draw(),draw()],mult=pay(finals);
    pending={bet:bet,mult:mult,timers:[],ivs:[]};
    if(ngAnim()){
      var stops=[750,1250,1750];
      for(var q=0;q<3;q++){
        (function(idx){
          var reel=document.getElementById("barsReel"+idx);
          var iv=setInterval(function(){reel.innerHTML=SYM[(Math.random()*SYM.length)|0].html;},90);
          pending.ivs.push(iv);
          var tm=setTimeout(function(){
            clearInterval(iv);reel.innerHTML=SYM[finals[idx]].html;
            reel.classList.add("bars-stop");sfx.coin();
            if(idx===2)resolve();
          },stops[idx]);
          pending.timers.push(tm);
        })(q);
      }
    }else{
      for(var s=0;s<3;s++)document.getElementById("barsReel"+s).innerHTML=SYM[finals[s]].html;
      resolve();
    }
  });
  if(lever){
    lever.addEventListener("click",function(){play.click();});
    lever.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();play.click();}});
  }
  (function(){
    if(!marquee)return;
    var h="",mi;
    for(mi=0;mi<12;mi++)h+='<i class="bars-bulb" style="--a:'+mi+'"></i>';
    marquee.innerHTML=h;
  })();
  addDust(stage,10);
};
/* ==================== NEWGAME: BLACKJACK ==================== */
BUILDERS.blackjack=function(mount){
  var $=function(s){return mount.querySelector(s)};
  var SUITS=["\u2660","\u2665","\u2666","\u2663"],RANKS=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  var shoe=[];
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}}
  function buildShoe(){shoe=[];for(var d=0;d<6;d++)for(var s=0;s<4;s++)for(var r=0;r<13;r++)shoe.push({r:RANKS[r],s:SUITS[s],red:(s===1||s===2)});shuffle(shoe)}
  function draw(){if(shoe.length<60)buildShoe();return shoe.pop()}
  function handVal(h){var t=0,a=0;for(var i=0;i<h.length;i++){var r=h[i].r;if(r==="A"){t+=11;a++}else if(r==="J"||r==="Q"||r==="K")t+=10;else t+=parseInt(r,10)}while(t>21&&a>0){t-=10;a--}return t}
  function isBJ(h){return h.length===2&&handVal(h)===21}
  var hist=[],player=[],dealer=[],totalBet=0,active=false,bet0=0;
  function cardHtml(c,cls,d){return '<div class="bj-card '+(c.red?"red ":"")+(cls||"")+'"'+(d?' style="animation-delay:'+(d*120)+'ms"':"")+'><div class="rk">'+c.r+'</div><div class="st">'+c.s+'</div></div>'}
  function render(reveal){
    var ph="",dh="";
    for(var i=0;i<player.length;i++)ph+=cardHtml(player[i],ngAnim()?"bj-card-in":"",i);
    for(var j=0;j<dealer.length;j++){if(j===1&&!reveal)dh+='<div class="bj-card back '+(ngAnim()?"bj-card-in":"")+'"'+(j?' style="animation-delay:'+(j*120)+'ms"':"")+'>'+'</div>';else dh+=cardHtml(dealer[j],ngAnim()?"bj-card-in":"",j)}
    $("#blackjackPHand").innerHTML=ph;$("#blackjackDHand").innerHTML=dh;
    $("#blackjackPTotal").textContent=player.length?handVal(player):"";
    var dt=reveal&&dealer.length?handVal(dealer):"";
    if(reveal&&dt!==""&&ngAnim()){countUp($("#blackjackDTotal"),dt,function(v){return ""+Math.round(v)},300)}
    else{$("#blackjackDTotal").textContent=dt}
    $("#blackjackShoe").textContent="Shoe: "+shoe.length+" cards";
  }
  function setBtns(on){$("#blackjackHit").disabled=!on;$("#blackjackStand").disabled=!on;$("#blackjackDouble").disabled=!on;$("#blackjackPlay").disabled=on}
  function finish(mult,msg){
    active=false;setBtns(false);
    var stage=$("#blackjackStage"),payout=settle("Blackjack",totalBet,mult);
    hist.unshift({t:msg,w:mult>1});histChips($("#blackjackHist"),hist.slice(0,12));
    $("#blackjackMsg").textContent=msg+(mult>1?" — Won "+fmt$(payout):(mult===1?" — Stake back":""));
    if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win();if(ngAnim()){stage.classList.add("rays-on");setTimeout(function(){stage.classList.remove("rays-on")},1500)}}
    else if(mult===1){stageFx(stage,"shake");sfx.click()}
    else{stageFx(stage,"lose");sfx.lose()}
  }
  function dealerPlay(){
    render(true);
    while(handVal(dealer)<17){dealer.push(draw())}
    render(true);
    var pv=handVal(player),dv=handVal(dealer);
    if(dv>21)finish(2,"DEALER BUST "+dv);
    else if(pv>dv)finish(2,"YOU "+pv+" vs "+dv);
    else if(pv<dv)finish(0,"DEALER "+dv+" vs "+pv);
    else finish(1,"PUSH "+pv);
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("blackjackBet","10.00")
    +'<div class="field"><label>Rules</label><div style="font-size:12px;color:#9fb3a8;line-height:1.7">6-deck shoe &bull; Dealer stands on all 17s<br>Blackjack pays 3:2 &bull; No split</div></div>'
    +'<button class="action-btn" id="blackjackPlay" style="margin-top:16px">Deal</button>'
    +'<div class="hist-row" id="blackjackHist"></div></div>'
    +'<div class="stage" id="blackjackStage">'+gameHeaderHtml('blackjack')+'<div class="bj-rays"></div>'
    +'<div class="bj-felt">'
    +'<div class="bj-rail"></div>'
    +'<div class="bj-arc"><svg class="bj-arcsvg" viewBox="0 0 400 64"><defs><path id="bjArc" d="M18,58 Q200,-6 382,58"/></defs><text class="bj-arctext"><textPath href="#bjArc" startOffset="50%" text-anchor="middle">BLACKJACK &#8226; PAYS 3 TO 2</textPath></text></svg></div>'
    +'<div class="bj-shoebox"><svg class="bj-shoesvg" viewBox="0 0 84 62"><polygon points="8,56 30,30 80,30 62,56" fill="#241708" stroke="#caa14f" stroke-width="1.6"/><rect x="36" y="8" width="38" height="26" rx="4" fill="#f3ecda" stroke="#caa14f" stroke-width="1.4" transform="rotate(7 55 21)"/><rect x="41" y="13" width="28" height="16" rx="3" fill="none" stroke="#14335c" stroke-width="1.2" transform="rotate(7 55 21)" stroke-dasharray="3 2"/><rect x="8" y="52" width="54" height="7" rx="3" fill="#3a2412" stroke="#caa14f" stroke-width="1.4"/></svg><div class="bj-shoe" id="blackjackShoe"></div></div>'
    +'<div class="bj-zone-label">Dealer</div><div class="bj-hand" id="blackjackDHand"></div><div><span class="bj-total" id="blackjackDTotal"></span></div>'
    +'<div class="bj-zone-label" style="margin-top:14px">You</div><div class="bj-hand" id="blackjackPHand"></div><div><span class="bj-total" id="blackjackPTotal"></span></div>'
    +'<div class="bj-btnrow"><button class="action-btn" id="blackjackHit" disabled>Hit</button><button class="action-btn" id="blackjackStand" disabled>Stand</button><button class="action-btn" id="blackjackDouble" disabled>Double</button></div>'
    +'<div class="bj-msg" id="blackjackMsg">Place your bet and press Deal.</div>'
    +'<div class="bj-chipstack"><div class="bj-stack"><i class="bj-chip g"></i><i class="bj-chip g"></i><i class="bj-chip g"></i><i class="bj-chip g"></i></div><div class="bj-stack"><i class="bj-chip r"></i><i class="bj-chip r"></i><i class="bj-chip r"></i></div><div class="bj-stack"><i class="bj-chip k"></i><i class="bj-chip k"></i></div></div>'
    +'</div></div></div>';
  wireAmount("blackjackBet");
  buildShoe();render(false);setBtns(false);
  $("#blackjackPlay").addEventListener("click",function(){
    if(active)return;
    var bet=getBet("blackjackBet");if(bet==null)return;
    charge(bet);flyChip(this,$("#blackjackStage"));sfx.click();
    bet0=bet;totalBet=bet;player=[draw(),draw()];dealer=[draw(),draw()];active=true;
    setBtns(true);$("#blackjackMsg").textContent="Your move.";
    render(false);
    if(isBJ(player)){
      render(true);
      if(isBJ(dealer)){finish(1,"DOUBLE BLACKJACK — PUSH")}
      else{finish(2.5,"BLACKJACK! Pays 3:2")}
      return;
    }
    if(isBJ(dealer)){render(true);finish(0,"DEALER BLACKJACK")}
  });
  $("#blackjackHit").addEventListener("click",function(){
    if(!active)return;sfx.click();player.push(draw());render(false);
    if(handVal(player)>21){render(true);finish(0,"BUST "+handVal(player))}
  });
  $("#blackjackStand").addEventListener("click",function(){
    if(!active)return;sfx.click();setBtns(false);dealerPlay();
  });
  $("#blackjackDouble").addEventListener("click",function(){
    if(!active)return;
    if(state.balance<bet0){toast("Insufficient","Not enough balance to double.","err");return}
    charge(bet0);flyChip(this,$("#blackjackStage"));totalBet=bet0*2;sfx.click();setBtns(false);
    player.push(draw());render(false);
    $("#blackjackMsg").textContent="Doubled — one card.";
    if(handVal(player)>21){render(true);finish(0,"BUST "+handVal(player))}
    else dealerPlay();
  });
  addDust($("#blackjackStage"),10);
};
/* ==================== NEWGAME: BLUESAMURAI ==================== */
BUILDERS.bluesamurai=function(mount){
  var hist=[];
  var timers=[];
  function later(fn,ms){var t=setTimeout(fn,ms);timers.push(t);return t;}
  onCleanup(function(){for(var i=0;i<timers.length;i++)clearTimeout(timers[i]);});
  var MAXC=25,BUST=0.20;
  var KATANA='<svg class="bs-katana" id="bsKatana" viewBox="0 0 240 100">'
    +'<defs><linearGradient id="bsBladeG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8f1ff"/><stop offset=".55" stop-color="#9fc2ff"/><stop offset="1" stop-color="#dce9ff"/></linearGradient></defs>'
    +'<path d="M10 74 L156 24" stroke="url(#bsBladeG)" stroke-width="9" stroke-linecap="round"/>'
    +'<path d="M14 72 L152 24" stroke="#4da3ff" stroke-width="2.5" stroke-linecap="round" opacity=".85"/>'
    +'<path d="M156 24 l12 -5" stroke="url(#bsBladeG)" stroke-width="9" stroke-linecap="round"/>'
    +'<ellipse cx="172" cy="17" rx="7" ry="12" fill="none" stroke="#ffd479" stroke-width="4" transform="rotate(16 172 17)"/>'
    +'<rect x="177" y="9" width="52" height="18" rx="9" fill="#14100a" stroke="#8a6a2f" stroke-width="3" transform="rotate(8 177 18)"/>'
    +'<path d="M186 10l-2 16M196 11l-2 16M206 12l-2 16M216 13l-2 16" stroke="#8a6a2f" stroke-width="2"/>'
    +'<ellipse cx="120" cy="90" rx="90" ry="6" fill="rgba(0,0,0,.4)"/>'
    +'</svg>';
  var BS_BG='<svg class="bs-bg" viewBox="0 0 400 170" preserveAspectRatio="xMidYMax slice">'
    +'<circle cx="200" cy="128" r="44" fill="#ff9d5c" opacity=".9"/>'
    +'<circle cx="200" cy="128" r="60" fill="#ff9d5c" opacity=".18"/>'
    +'<path d="M0 132 L70 74 L140 132 Z" fill="#1a1030"/>'
    +'<path d="M250 132 L330 62 L400 132 Z" fill="#141026"/>'
    +'<g fill="#0a0714"><rect x="52" y="58" width="11" height="74"/><rect x="107" y="58" width="11" height="74"/><rect x="40" y="46" width="90" height="11" rx="4"/><rect x="52" y="66" width="66" height="7"/></g>'
    +'<rect x="0" y="132" width="400" height="38" fill="#0d0906"/>'
    +'<path d="M0 142h400M0 152h400M0 162h400" stroke="#241608" stroke-width="2"/>'
    +'</svg>';
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("bluesamuraiBet","10.00")
    +'<div class="bs-btns" style="margin-top:16px">'
    +'<button class="bs-btn" id="bsStart">Begin Duel</button>'
    +'</div>'
    +'<div class="bs-btns">'
    +'<button class="bs-btn" id="bsStrike" disabled>Strike</button>'
    +'<button class="bs-btn cash" id="bsCash" disabled>Cash Out</button>'
    +'</div>'
    +'<div class="hist-row" id="bluesamuraiHist"></div></div>'
    +'<div class="stage" id="bluesamuraiStage">'
    +gameHeaderHtml('bluesamurai')
    +'<div class="bs-arena">'+BS_BG+'<div class="bs-slashfx" id="bsSlashFx"></div>'+KATANA+'</div>'
    +'<div class="bs-meter"><div class="bs-track"><div class="bs-fill" id="bsFill"></div></div><div class="bs-pips" id="bsPips"></div></div>'
    +'<div class="bs-stats"><div class="bs-stat"><small>CHARGES</small><b id="bsCharges">0</b></div><div class="bs-stat"><small>MULTIPLIER</small><b id="bsMult">1.00×</b></div></div>'
    +'<div class="bs-status" id="bsStatus">Each strike charges your blade ×1.10 — but every strike risks defeat (20%).</div>'
    +'</div></div>';
  wireAmount("bluesamuraiBet");
  var stage=$("#bluesamuraiStage"),fill=$("#bsFill"),pips=$("#bsPips"),
      chEl=$("#bsCharges"),multEl=$("#bsMult"),status=$("#bsStatus"),
      startBtn=$("#bsStart"),strikeBtn=$("#bsStrike"),cashBtn=$("#bsCash");
  var katana=null;
  var live=false,charges=0,bet=0;
  var pipHtml="";
  for(var p=0;p<MAXC;p++)pipHtml+='<span class="bs-pip"></span>';
  pips.innerHTML=pipHtml;
  var pipEls=pips.querySelectorAll(".bs-pip");
  function curMult(){return Math.pow(1.1,charges);}
  function render(){
    katana=$("#bsKatana");
    fill.style.width=(charges/MAXC*100)+"%";
    chEl.textContent=charges;
    countUp(multEl,curMult(),fmtMult,300);
    for(var i=0;i<pipEls.length;i++)pipEls[i].classList.toggle("on",i<charges);
  }
  function endRoundButtons(){
    live=false;strikeBtn.disabled=true;cashBtn.disabled=true;startBtn.disabled=false;
  }
  startBtn.onclick=function(){
    if(live)return;
    var b=getBet("bluesamuraiBet");if(b==null)return;
    bet=b;charge(bet);
    flyChip(this,$("#bluesamuraiStage"));
    sfx.click();
    live=true;charges=0;
    if(katana)katana.classList.remove("defeated");
    render();
    status.textContent="The duel begins. Strike to charge your blade, cash out before you fall.";
    startBtn.disabled=true;strikeBtn.disabled=false;cashBtn.disabled=true;
  };
  strikeBtn.onclick=function(){
    if(!live)return;
    sfx.click();
    if(katana){katana.classList.remove("slash");void katana.offsetWidth;if(ngAnim())katana.classList.add("slash");}
    if(ngAnim()){var sfxEl=$("#bsSlashFx");if(sfxEl){sfxEl.classList.remove("go");void sfxEl.offsetWidth;sfxEl.classList.add("go");}}
    var bust=Math.random()<BUST;
    var apply=function(){
      if(bust){
        if(katana)katana.classList.add("defeated");
        var payout=settle("Blue Samurai",bet,0);
        hist.unshift({t:"BUST",w:false});histChips($("#bluesamuraiHist"),hist.slice(0,12));
        stageFx(stage,"shake");burstFX(stage,{colors:["#ff7070","#8a2a2a"],n:24});
        status.textContent="Defeated after "+charges+" charge"+(charges===1?"":"s")+". Your blade falls silent.";
        sfx.lose();
        endRoundButtons();
      }else{
        charges++;
        render();
        sfx.coin();
        cashBtn.disabled=false;
        if(charges>=MAXC){
          status.textContent="Maximum charge reached! Auto cash-out at "+fmtMult(curMult())+".";
          doCashout(true);
        }else{
          status.textContent="Charge "+charges+" — blade at "+fmtMult(curMult())+". Strike again or cash out.";
        }
      }
    };
    if(ngAnim())later(apply,220);else apply();
  };
  function doCashout(auto){
    if(!live)return;
    var m=curMult();
    var payout=settle("Blue Samurai",bet,m);
    hist.unshift({t:fmtMult(m),w:true});histChips($("#bluesamuraiHist"),hist.slice(0,12));
    stageFx(stage,"win");burstFX(stage,{});
    if(ngAnim()){var rays=document.createElement("div");rays.className="bs-rays";stage.appendChild(rays);later(function(){if(rays.parentNode)rays.parentNode.removeChild(rays);},1600);}
    winBanner(stage,"WON "+fmt$(payout));sfx.win();
    status.textContent=(auto?"Auto cash-out":"You withdraw from the duel")+" at "+charges+" charges — "+fmtMult(m)+".";
    endRoundButtons();
  }
  cashBtn.onclick=function(){sfx.click();doCashout(false);};
  addDust(stage,10);
};
/* ==================== NEWGAME: CASES ==================== */
BUILDERS.cases=function(mount){
  var hist=[];
  var timers=[];
  function later(fn,ms){var t=setTimeout(fn,ms);timers.push(t);return t;}
  onCleanup(function(){for(var i=0;i<timers.length;i++)clearTimeout(timers[i]);});
  var MULTS=[0,0.2,0.8,1.5,2.3];
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function caseHtml(extra,attrs){
    return '<button class="cs-case'+extra+'" '+attrs+'><span class="cs-lid"></span><span class="cs-clasp"></span><span class="cs-latch l"></span><span class="cs-latch r"></span><span class="cs-val"></span></button>';
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("casesBet","10.00")
    +'<button class="action-btn" id="casesPlay" style="margin-top:16px">Deal the Cases</button>'
    +'<div class="hist-row" id="casesHist"></div></div>'
    +'<div class="stage" id="casesStage">'
    +gameHeaderHtml('cases')
    +'<div class="cs-row" id="casesRow"></div>'
    +'<div class="cs-hint" id="casesHint">Five cases hide 0×, 0.2×, 0.8×, 1.5× and 2.3×. Pick the right one.</div>'
    +'</div></div>';
  wireAmount("casesBet");
  var stage=$("#casesStage"),row=$("#casesRow"),hint=$("#casesHint"),playBtn=$("#casesPlay");
  var active=false,order=[],bet=0,mine=-1;
  function renderIdle(){
    var h="";
    for(var i=0;i<5;i++)h+=caseHtml("","disabled");
    row.innerHTML=h;
  }
  renderIdle();
  playBtn.onclick=function(){
    if(active)return;
    var b=getBet("casesBet");if(b==null)return;
    bet=b;charge(bet);
    flyChip(this,$("#casesStage"));
    sfx.click();
    active=true;mine=-1;
    order=shuffle(MULTS);
    var h="";
    for(var i=0;i<5;i++)h+=caseHtml(" armed",'data-i="'+i+'"');
    row.innerHTML=h;
    hint.textContent="Choose your case…";
    playBtn.disabled=true;
    var boxes=row.querySelectorAll(".cs-case");
    for(var k=0;k<boxes.length;k++){
      (function(btn,idx){
        btn.onclick=function(){
          if(!active)return;
          active=false;mine=idx;sfx.click();
          var all=row.querySelectorAll(".cs-case");
          for(var q=0;q<all.length;q++)all[q].disabled=true;
          btn.classList.add("shaking");
          var openDelay=ngAnim()?750:0;
          later(function(){
            btn.classList.remove("shaking");
            for(var r=0;r<all.length;r++){
              (function(el,ri){
                var m=order[ri];
                var show=function(){
                  el.classList.add("open");
                  el.querySelector(".cs-val").textContent=(m===0?"0×":fmtMult(m));
                  if(m===0)el.classList.add("is-zero");
                  if(ri===mine)el.classList.add("mine");else el.classList.add("dim");
                  el.classList.remove("armed");
                };
                if(ngAnim())later(show,ri*140);else show();
              })(all[r],r);
            }
            later(resolve,ngAnim()?750:0);
          },openDelay);
        };
      })(boxes[k],k);
    }
  };
  function resolve(){
    var m=order[mine];
    var payout=settle("Cases",bet,m);
    var w=m>1;
    hist.unshift({t:(m===0?"0×":fmtMult(m)),w:w});histChips($("#casesHist"),hist.slice(0,12));
    if(w){
      stageFx(stage,"win");burstFX(stage,{});
      if(ngAnim()){var rays=document.createElement("div");rays.className="cs-rays";stage.appendChild(rays);later(function(){if(rays.parentNode)rays.parentNode.removeChild(rays);},1600);}
      if(m>=2.3){sfx.big();}else{sfx.win();}
      winBanner(stage,"WON "+fmt$(payout));
      hint.textContent="Jackpot instincts! Your case held "+fmtMult(m)+".";
    }else if(m===1){
      stageFx(stage,"shake");sfx.coin();
      hint.textContent="Your case held 1× — stake back.";
    }else{
      stageFx(stage,"lose");sfx.lose();
      hint.textContent="Empty case. The 2.3× was elsewhere.";
    }
    playBtn.disabled=false;
  }
  addDust(stage,10);
};
/* ==================== NEWGAME: CHICKEN ==================== */
BUILDERS.chicken=function(mount){
  var ladder=[1.30,1.80,2.50,3.60,5.20];
  var hist=[];
  var chickenSVG='<svg viewBox="0 0 64 64"><path d="M18 34c-5-1-8-5-8-10 4 1 7 3 9 6z" fill="#efe3cb"/><ellipse cx="29" cy="40" rx="16" ry="13" fill="#ffffff"/><path d="M20 44q7 6 15 3" stroke="#e3d5b8" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="44" cy="27" r="9" fill="#ffffff"/><path d="M52 27l9 3-9 3z" fill="#f5a623"/><circle cx="46" cy="25" r="2.2" fill="#222222"/><circle cx="46.7" cy="24.3" r=".7" fill="#ffffff"/><path d="M38 17c1-4 5-5 7-3 2-3 7-3 8 1" stroke="#e04a3a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M25 52v6M33 52v6" stroke="#f5a623" stroke-width="3" stroke-linecap="round"/></svg>';
  var foxSVG='<svg viewBox="0 0 64 64"><path d="M14 8l8 12M50 8l-8 12" stroke="#e07b2a" stroke-width="9" stroke-linecap="round"/><path d="M14 8l8 12M50 8l-8 12" stroke="#f5a623" stroke-width="4" stroke-linecap="round"/><ellipse cx="32" cy="37" rx="17" ry="14" fill="#e07b2a"/><path d="M22 44q10 8 20 0l-3 8H25z" fill="#f7ead2"/><circle cx="25" cy="34" r="3" fill="#2a1505"/><circle cx="39" cy="34" r="3" fill="#2a1505"/><ellipse cx="32" cy="42" rx="3.6" ry="2.8" fill="#2a1505"/><path d="M47 46c7 1 12 7 13 14-5-1-10-4-14-9z" fill="#e07b2a"/><path d="M57 56c1.5 1.5 2.5 3 3 4-3-.5-5.5-2-7.5-4.5z" fill="#f7ead2"/></svg>';
  var coopSVG='<svg viewBox="0 0 64 64"><path d="M8 58V32l24-18 24 18v26z" fill="#6b421c"/><path d="M8 32l24-18 24 18" fill="none" stroke="#ffd479" stroke-width="3" stroke-linejoin="round"/><rect x="26" y="42" width="12" height="16" rx="2" fill="#2e1c0a"/><path d="M26 42h12" stroke="#ffd479" stroke-width="2"/><circle cx="32" cy="26" r="5" fill="#ffd479"/><circle cx="32" cy="26" r="8" fill="none" stroke="#ffd479" stroke-width="1.5" opacity=".5"/><path d="M14 58h36" stroke="#3a2410" stroke-width="3"/></svg>';
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("chickenBet","10.00")
    +'<div class="stat-grid"><div class="stat-box"><small>Current</small><b id="chickenMult">1.00×</b></div>'
    +'<div class="stat-box"><small>Potential</small><b id="chickenPot">$0.00</b></div></div>'
    +'<button class="action-btn" id="chickenPlay" style="margin-top:16px">Start Crossing</button>'
    +'<button class="action-btn" id="chickenCash" style="margin-top:8px;display:none">Cash Out</button>'
    +'<div class="hist-row" id="chickenHist"></div></div>'
    +'<div class="stage" id="chickenStage">'+gameHeaderHtml('chicken')
    +'<div class="ch-road" id="chickenRoad">'
    +'<div class="ch-lanes" id="chickenLanes"></div>'
    +'<div class="ch-chicken" id="chickenBird">'+chickenSVG+'</div>'
    +'<div class="ch-fox" id="chickenFox">'+foxSVG+'</div>'
    +'<div class="ch-coop">'+coopSVG+'</div>'
    +'</div><p class="ch-hint" id="chickenHint">Cross 5 lanes to reach the coop. A fox may strike on any lane — cash out anytime.</p>'
    +'</div></div>';
  wireAmount("chickenBet");
  var stage=$("#chickenStage"),road=$("#chickenRoad"),lanesEl=$("#chickenLanes"),bird=$("#chickenBird"),fox=$("#chickenFox"),
      hint=$("#chickenHint"),playBtn=$("#chickenPlay"),cashBtn=$("#chickenCash"),
      multEl=$("#chickenMult"),potEl=$("#chickenPot"),histEl=$("#chickenHist");
  var bet=0,lane=0,live=false,curMult=1;
  function buildLanes(){
    var h='';
    for(var i=0;i<5;i++)h+='<div class="ch-lane" data-i="'+i+'"><div class="ch-mult">'+fmtMult(ladder[i])+'</div><div class="ch-dot"></div></div>';
    lanesEl.innerHTML=h;
  }
  buildLanes();
  function placeBird(i){bird.style.left='calc('+(i*20+10)+'% - 17px)';}
  function placeFox(i){fox.style.left='calc('+(i*20+10)+'% - 20px)';}
  placeBird(0);
  function markLanes(){
    var lanes=lanesEl.querySelectorAll(".ch-lane");
    lanes.forEach(function(l){l.classList.toggle("ch-done",+l.dataset.i<lane);});
  }
  function endRound(){live=false;playBtn.disabled=false;playBtn.textContent="Start Crossing";cashBtn.style.display="none";fox.classList.remove("ch-lurk");}
  function pushHist(t,w){hist.unshift({t:t,w:w});histChips(histEl,hist.slice(0,12));}
  function winRays(){
    if(!ngAnim())return;
    var r=document.createElement("div");r.className="ch-rays";
    stage.appendChild(r);
    var t=setTimeout(function(){if(r.parentNode)r.parentNode.removeChild(r);},1600);
    onCleanup(function(){clearTimeout(t);if(r.parentNode)r.parentNode.removeChild(r);});
  }
  function cross(){
    var fp=1-0.97/ladder[lane];
    if(Math.random()<fp){
      fox.classList.remove("ch-lurk");
      placeFox(lane+1);fox.classList.add("ch-show");
      settle("Chicken",bet,0);
      stageFx(stage,"lose");sfx.lose();
      pushHist("FOX L"+(lane+1),false);
      hint.textContent="The fox got you on lane "+(lane+1)+"!";
      endRound();return;
    }
    lane++;placeBird(lane);markLanes();sfx.coin();
    if(ngAnim()){bird.classList.remove("ch-flap");void bird.offsetWidth;bird.classList.add("ch-flap");}
    curMult=ladder[lane-1];
    multEl.textContent=fmtMult(curMult);potEl.textContent=fmt$(bet*curMult);
    if(lane>=5){
      var payout=settle("Chicken",bet,curMult);
      winRays();
      if(ngAnim())road.classList.add("ch-celebrate");
      stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.big();
      pushHist(fmtMult(curMult),true);
      hint.textContent="You made it across! Full "+fmtMult(curMult)+" collected.";
      endRound();return;
    }
    cashBtn.style.display="";
    hint.textContent="Lane "+(lane+1)+" — safe at "+fmtMult(curMult)+". Cross on or cash out?";
  }
  playBtn.onclick=function(){
    if(live){cross();return;}
    var b=getBet("chickenBet");if(b==null)return;
    bet=b;charge(bet);flyChip(this,$("#chickenStage"));
    lane=0;curMult=1;live=true;
    fox.classList.remove("ch-show");fox.style.left="";fox.classList.add("ch-lurk");
    road.classList.remove("ch-celebrate");
    buildLanes();placeBird(0);
    multEl.textContent=fmtMult(1);potEl.textContent=fmt$(bet);
    playBtn.textContent="Cross Lane";cashBtn.style.display="none";
    hint.textContent="Lane 1 — the fox is out there. Cross or cash out later!";
    sfx.click();
  };
  cashBtn.onclick=function(){
    if(!live||lane===0)return;
    var m=curMult,payout=settle("Chicken",bet,m);
    winRays();
    stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win();
    pushHist("CASH "+fmtMult(m),true);
    hint.textContent="Cashed out after lane "+lane+" for "+fmtMult(m)+".";
    endRound();
  };
  addDust($("#chickenStage"),10);
};
/* ==================== NEWGAME: DARTS ==================== */
BUILDERS.darts=function(mount){
  var hist=[], busy=false, timers=[];
  function wedge(cx,cy,r0,r1,a0,a1,fill){
    var x0=(cx+r0*Math.cos(a0)).toFixed(1),y0=(cy+r0*Math.sin(a0)).toFixed(1),
        x1=(cx+r1*Math.cos(a0)).toFixed(1),y1=(cy+r1*Math.sin(a0)).toFixed(1),
        x2=(cx+r1*Math.cos(a1)).toFixed(1),y2=(cy+r1*Math.sin(a1)).toFixed(1),
        x3=(cx+r0*Math.cos(a1)).toFixed(1),y3=(cy+r0*Math.sin(a1)).toFixed(1);
    return '<path d="M'+x0+' '+y0+' L'+x1+' '+y1+' A'+r1+' '+r1+' 0 0 1 '+x2+' '+y2
      +' L'+x3+' '+y3+' A'+r0+' '+r0+' 0 0 0 '+x0+' '+y0+' Z" fill="'+fill+'"/>';
  }
  function boardSvg(){
    var s='<svg viewBox="0 0 200 200" class="darts-board">';
    s+='<circle cx="100" cy="100" r="98" fill="#100d0a" stroke="#5a4a2e" stroke-width="2"/>';
    s+='<circle cx="100" cy="100" r="90" fill="none" stroke="#2c2318" stroke-width="1"/>';
    var ORDER=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
    for(var k=0;k<20;k++){
      var a=(k*18)*Math.PI/180, nx=(100+80*Math.cos(a)).toFixed(1), ny=(100+80*Math.sin(a)).toFixed(1);
      s+='<text x="'+nx+'" y="'+ny+'" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="700" fill="#c9a86a">'+ORDER[k]+'</text>';
    }
    s+='<circle cx="100" cy="100" r="66" fill="#181310"/>';
    for(var i=0;i<20;i++){
      var a0=(i*18-9)*Math.PI/180, a1=(i*18+9)*Math.PI/180;
      var dark=i%2? '#241a14':'#171310';
      s+=wedge(100,100,11,42,a0,a1,dark);
      s+=wedge(100,100,56,64,a0,a1,dark);
      var hot=i%2? '#b3202c':'#d8a93f';
      s+=wedge(100,100,42,56,a0,a1,hot);
      s+=wedge(100,100,56,64,a0,a1,hot);
    }
    s+='<circle cx="100" cy="100" r="11" fill="#1f7a4d" stroke="#0e3a26" stroke-width="1"/>';
    s+='<circle cx="100" cy="100" r="4" fill="#e63946" stroke="#7a1f28" stroke-width="1"/>';
    s+='<circle cx="100" cy="100" r="64" fill="none" stroke="#5a4a2e" stroke-width="1.5"/>';
    s+='<circle cx="100" cy="100" r="42" fill="none" stroke="#5a4a2e" stroke-width="1"/>';
    s+='<circle cx="100" cy="100" r="56" fill="none" stroke="#5a4a2e" stroke-width="1"/>';
    return s+'</svg>';
  }
  function dartSvg(rot){
    return '<svg viewBox="0 0 20 34" style="transform:rotate('+rot+'deg)">'
      +'<polygon points="10,0 14,7 10,11 6,7" fill="#e63946"/>'
      +'<rect x="9" y="11" width="2" height="13" fill="#8a8f9a"/>'
      +'<rect x="7.6" y="13" width="4.8" height="2.6" fill="#5a5f6a"/>'
      +'<rect x="7.6" y="17" width="4.8" height="2.6" fill="#5a5f6a"/>'
      +'<rect x="9.3" y="24" width="1.4" height="5" fill="#c9a86a"/>'
      +'<polygon points="10,34 14,27 6,27" fill="#ffd479"/>'
      +'<polygon points="10,31 12,27 8,27" fill="#f5b942"/></svg>';
  }
  function zoneOf(rr){
    if(rr<=4)  return {m:50,label:"BULLSEYE"};
    if(rr<=11) return {m:10,label:"OUTER BULL"};
    if(rr<=42) return {m:1, label:"SINGLE"};
    if(rr<=56) return {m:3, label:"TREBLE"};
    if(rr<=64) return {m:2, label:"DOUBLE"};
    return {m:0,label:"MISS"};
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("dartsBet","10.00")
    +'<div class="stat-grid"><div class="stat-box"><small>Bullseye</small><b>50×</b></div>'
    +'<div class="stat-box"><small>Outer bull</small><b>10×</b></div>'
    +'<div class="stat-box"><small>Treble</small><b>3×</b></div>'
    +'<div class="stat-box"><small>Double</small><b>2×</b></div></div>'
    +'<div class="limbo-targetline">Payout = average of the 3 darts · single 1× · miss 0×</div>'
    +'<button class="action-btn" id="dartsPlay" style="margin-top:16px">Throw Darts</button>'
    +'<div class="hist-row" id="dartsHist"></div></div>'
    +'<div class="stage" id="dartsStage">'+gameHeaderHtml('darts')
    +'<div class="darts-arena" id="dartsArena">'+boardSvg()+'</div>'
    +'<div class="darts-score" id="dartsScore"></div>'
    +'<div class="darts-total" id="dartsTotal">Three darts per round — step up to the oche</div>'
    +'</div></div>';
  wireAmount("dartsBet");
  onCleanup(function(){ timers.forEach(clearTimeout); timers=[]; });
  var arena=$("#dartsArena");
  function winRays(stage){
    if(!ngAnim()) return;
    var r=document.createElement("div"); r.className="darts-rays"; stage.appendChild(r);
    timers.push(setTimeout(function(){ if(r.parentNode) r.parentNode.removeChild(r); },2400));
  }
  $("#dartsPlay").addEventListener("click",function(){
    if(busy) return;
    var bet=getBet("dartsBet"); if(bet==null) return;
    busy=true; charge(bet); flyChip(this,$("#dartsStage")); sfx.click();
    var stage=$("#dartsStage"), score=$("#dartsScore"), total=$("#dartsTotal");
    arena.querySelectorAll(".darts-dart,.darts-ping").forEach(function(d){ d.remove(); });
    score.innerHTML=""; total.textContent="Throwing…";
    var results=[], sum=0, thrown=0;
    function throwOne(){
      var th=Math.random()*Math.PI*2, rr=100*Math.sqrt(Math.random());
      var z=zoneOf(rr), x=100+rr*Math.cos(th), y=100+rr*Math.sin(th);
      var rot=Math.round(Math.random()*40-20);
      var el=document.createElement("div");
      el.className="darts-dart";
      el.innerHTML=dartSvg(rot);
      el.style.left="50%"; el.style.top="108%";
      arena.appendChild(el);
      results.push(z); sum+=z.m; thrown++;
      var box=document.createElement("div");
      box.className="darts-throw z"+z.m;
      box.innerHTML="<small>Dart "+thrown+"</small><b>"+z.label+" · "+z.m+"×</b>";
      score.appendChild(box);
      if(ngAnim()){
        void el.offsetWidth;
        el.style.left=(x/2)+"%"; el.style.top=(y/2)+"%";
        timers.push(setTimeout(function(){ el.classList.add("darts-stuck"); },330));
        timers.push(setTimeout(function(){ sfx.click(); },330));
        var svg=arena.querySelector(".darts-board");
        if(svg){
          var c=document.createElementNS("http://www.w3.org/2000/svg","circle");
          c.setAttribute("cx",x.toFixed(1)); c.setAttribute("cy",y.toFixed(1));
          c.setAttribute("r","5"); c.setAttribute("class","darts-ping");
          svg.appendChild(c);
          timers.push(setTimeout(function(){ if(c.parentNode) c.parentNode.removeChild(c); },800));
        }
      }else{
        el.style.left=(x/2)+"%"; el.style.top=(y/2)+"%";
      }
      if(thrown<3){ timers.push(setTimeout(throwOne, ngAnim()?650:0)); }
      else{ timers.push(setTimeout(finish, ngAnim()?700:0)); }
    }
    function finish(){
      busy=false;
      var avg=sum/3, payout=settle("Darts",bet,avg);
      total.innerHTML='Average multiplier <b id="dartsAvg">0.00×</b> → <b>'+fmt$(payout)+'</b>';
      var avgEl=$("#dartsAvg");
      if(ngAnim()) countUp(avgEl,avg,function(v){ return v.toFixed(2)+"×"; },700);
      else avgEl.textContent=avg.toFixed(2)+"×";
      if(avg>1){ stageFx(stage,"win"); burstFX(stage,{}); winRays(stage); winBanner(stage,"WON "+fmt$(payout)); sfx.win(); }
      else if(avg===1){ stageFx(stage,"shake"); }
      else{ stageFx(stage,"lose"); sfx.lose(); }
      hist.unshift({t:avg.toFixed(2)+"×",w:avg>1});
      histChips($("#dartsHist"),hist.slice(0,12));
    }
    throwOne();
  });
  addDust($("#dartsStage"),10);
};
/* ==================== NEWGAME: DIAMONDS ==================== */
BUILDERS.diamonds=function(mount){
  var hist=[], timers=[];
  var active=false, coals=5, coalSet={}, gems=0, bet=0, revealed=0;
  onCleanup(function(){ timers.forEach(clearTimeout); timers=[]; });
  function ladder(c,k){ var m=0.97; for(var i=0;i<k;i++) m*=(25-i)/(25-c-i); return m; }
  function gemSvg(){ return '<svg viewBox="0 0 40 40"><polygon points="12,5 28,5 37,15 20,37 3,15" fill="#f5b942" stroke="#fff2cf" stroke-width="1.5"/><polygon points="12,5 20,5 16,15" fill="#fff2cf" opacity=".85"/><polygon points="28,5 20,5 24,15" fill="#e8a93c"/><polygon points="12,5 16,15 20,37" fill="#ffd479"/><polygon points="28,5 24,15 20,37" fill="#e0a030"/><polygon points="16,15 24,15 20,37" fill="#ffedb5" opacity=".55"/><polyline points="3,15 37,15" stroke="#a87e2a" stroke-width="1.5" fill="none"/><polyline points="12,5 16,15 20,37" stroke="#a87e2a" stroke-width="1" fill="none"/><polyline points="28,5 24,15 20,37" stroke="#a87e2a" stroke-width="1" fill="none"/></svg>'; }
  function coalSvg(){ return '<svg viewBox="0 0 40 40"><polygon points="20,4 32,11 37,23 27,35 12,33 4,20" fill="#2b2b30" stroke="#55555e" stroke-width="1.5"/><polygon points="20,4 26,12 20,20" fill="#3a3a42"/><polygon points="12,14 20,20 8,26" fill="#232328"/><polyline points="20,4 20,20" stroke="#55555e" stroke-width="1" fill="none"/><polyline points="4,20 20,20" stroke="#55555e" stroke-width="1" fill="none"/><polyline points="20,20 37,23" stroke="#55555e" stroke-width="1" fill="none"/><polyline points="20,20 27,35" stroke="#55555e" stroke-width="1" fill="none"/></svg>'; }
  var tiles="";
  for(var i=0;i<25;i++) tiles+='<div class="dia-tile" data-i="'+i+'"></div>';
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("diaBet","10.00")
    +'<div class="field"><label>Hidden coal</label><div class="seg" id="diaCoal">'
    +'<button data-c="3">3</button><button data-c="5" class="on">5</button><button data-c="10">10</button></div></div>'
    +'<div class="stat-grid"><div class="stat-box"><small>Multiplier</small><b id="diaMult">1.00×</b></div>'
    +'<div class="stat-box"><small>Next gem</small><b id="diaNext">—</b></div>'
    +'<div class="stat-box"><small>Gems found</small><b id="diaGems">0</b></div></div>'
    +'<button class="action-btn" id="diaPlay" style="margin-top:16px">Start Round</button>'
    +'<button class="action-btn" id="diaCash" style="margin-top:8px;background:#1f7a4d" disabled>Cash Out</button>'
    +'<div class="hist-row" id="diaHist"></div></div>'
    +'<div class="stage" id="diaStage">'+gameHeaderHtml('diamonds')
    +'<div class="dia-grid" id="diaGrid">'+tiles+'</div>'
    +'<div class="dia-status" id="diaStatus">Set your bet and start the round</div>'
    +'</div></div>';
  wireAmount("diaBet");
  var grid=$("#diaGrid");
  function setStatus(html){ $("#diaStatus").innerHTML=html; }
  function refreshStats(){
    var m=gems? ladder(coals,gems):1;
    var mEl=$("#diaMult");
    if(ngAnim()) countUp(mEl,m,function(v){ return v.toFixed(2)+"×"; },250);
    else mEl.textContent=m.toFixed(2)+"×";
    $("#diaGems").textContent=gems+" / "+(25-coals);
    $("#diaNext").textContent=(gems<25-coals)? ladder(coals,gems+1).toFixed(2)+"×" : "MAX";
    var cb=$("#diaCash");
    cb.disabled=!active;
    cb.textContent=active? ("Cash Out "+fmt$(bet*m)) : "Cash Out";
    cb.classList.toggle("dia-cashlive",active);
  }
  function winRays(stage){
    if(!ngAnim()) return;
    var r=document.createElement("div"); r.className="dia-rays"; stage.appendChild(r);
    timers.push(setTimeout(function(){ if(r.parentNode) r.parentNode.removeChild(r); },2400));
  }
  function diaSparkle(el){
    if(!ngAnim()) return;
    for(var i=0;i<5;i++){
      var s=document.createElement("i"); s.className="dia-sp";
      s.style.left=(30+Math.random()*40)+"%"; s.style.top=(30+Math.random()*40)+"%";
      s.style.setProperty("--dx",Math.round(Math.random()*70-35)+"px");
      s.style.setProperty("--dy",Math.round(Math.random()*70-35)+"px");
      el.appendChild(s);
      (function(sp){ timers.push(setTimeout(function(){ if(sp.parentNode) sp.parentNode.removeChild(sp); },620)); })(s);
    }
  }
  $("#diaCoal").addEventListener("click",function(e){
    var b=e.target.closest("button"); if(!b||active) return;
    coals=+b.getAttribute("data-c"); sfx.click();
    var bs=$("#diaCoal").children;
    for(var i=0;i<bs.length;i++) bs[i].classList.toggle("on",+bs[i].getAttribute("data-c")===coals);
  });
  function resetBoard(){
    var ts=grid.children;
    for(var i=0;i<ts.length;i++){ ts[i].className="dia-tile"; ts[i].innerHTML=""; }
  }
  function revealTile(ix,isCoal,pop){
    var el=grid.children[ix];
    el.classList.add("open", isCoal?"coal":"gem");
    if(pop&&ngAnim()){ el.classList.add("pop"); if(!isCoal) diaSparkle(el); }
    el.innerHTML=isCoal? coalSvg():gemSvg();
  }
  $("#diaPlay").addEventListener("click",function(){
    if(active) return;
    var b=getBet("diaBet"); if(b==null) return;
    bet=b; charge(bet); flyChip(this,$("#diaStage")); sfx.click();
    active=true; gems=0; revealed=0; coalSet={};
    var pool=[]; for(var i=0;i<25;i++) pool.push(i);
    while(Object.keys(coalSet).length<coals){ var k=pool.splice(Math.floor(Math.random()*pool.length),1)[0]; coalSet[k]=1; }
    resetBoard(); refreshStats();
    $("#diaPlay").disabled=true;
    setStatus("Round live — tap tiles. Each gem raises the multiplier; coal busts.");
  });
  function endRound(mult, busted){
    active=false;
    $("#diaPlay").disabled=false;
    var payout=settle("Diamonds",bet,mult);
    var stage=$("#diaStage");
    if(busted){
      var ts=grid.children;
      for(var i=0;i<ts.length;i++){
        var isC=!!coalSet[i];
        if(!ts[i].classList.contains("open")){ revealTile(i,isC,false); ts[i].classList.add("dim"); }
      }
      stageFx(stage,"lose"); sfx.lose();
      setStatus("Coal hit! Busted with <b>"+gems+"</b> gem"+(gems===1?"":"s")+".");
      hist.unshift({t:gems+" gems — BUST",w:false});
    }else{
      if(mult>1){ stageFx(stage,"win"); burstFX(stage,{}); winRays(stage); winBanner(stage,"WON "+fmt$(payout)); sfx.win();
        setStatus("Cashed out <b>"+mult.toFixed(2)+"×</b> with <b>"+gems+"</b> gem"+(gems===1?"":"s")+" — <b>"+fmt$(payout)+"</b>"); }
      else{ stageFx(stage,"shake");
        setStatus("Cashed out before picking — stake back."); }
      hist.unshift({t:mult.toFixed(2)+"×",w:mult>1});
    }
    refreshStats();
    histChips($("#diaHist"),hist.slice(0,12));
  }
  grid.addEventListener("click",function(e){
    if(!active) return;
    var t=e.target.closest(".dia-tile"); if(!t||t.classList.contains("open")) return;
    var ix=+t.getAttribute("data-i"), isCoal=!!coalSet[ix];
    revealed++;
    if(isCoal){ revealTile(ix,true,true); sfx.lose(); endRound(0,true); return; }
    gems++; revealTile(ix,false,true); sfx.coin(); refreshStats();
    if(gems>=25-coals){ endRound(ladder(coals,gems),false); }
  });
  $("#diaCash").addEventListener("click",function(){
    if(!active) return;
    sfx.click();
    endRound(gems? ladder(coals,gems):1, false);
  });
  refreshStats();
  addDust($("#diaStage"),10);
};
/* ==================== NEWGAME: DRAGONTOWER ==================== */
BUILDERS.dragontower=function(mount){
  var ladder=[1.29,1.72,2.30,3.07,4.08,5.44,7.26,9.68,12.90];
  var hist=[];
  var eggIdleSVG='<svg viewBox="0 0 64 64"><ellipse cx="32" cy="34" rx="15" ry="19" fill="#4a3418" stroke="#c9962e" stroke-width="3"/><path d="M24 20l5 6-4 6 6 5" stroke="#c9962e" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="36" cy="44" r="3" fill="#c9962e" opacity=".55"/></svg>';
  var eggSVG='<svg viewBox="0 0 64 64"><ellipse cx="32" cy="34" rx="15" ry="19" fill="#ffd479"/><path d="M19 26c4 3 8 3 12 0s9-3 14 0M19 36c4 3 8 3 12 0s9-3 14 0M24 46c3 2 6 2 8 0s5-2 8 0" stroke="#a86a1e" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="26" cy="25" rx="4" ry="7" fill="#ffffff" opacity=".35"/></svg>';
  var dragonSVG='<svg viewBox="0 0 64 64"><path d="M20 14l-5-8M44 14l5-8" stroke="#ffd479" stroke-width="4" stroke-linecap="round"/><path d="M32 10l7 9h11l-7 7 8 7-10 2 4 10-13-5-13 5 4-10-10-2 8-7-7-7h11z" fill="#ff6b4a"/><circle cx="26" cy="27" r="2.6" fill="#2a0505"/><circle cx="38" cy="27" r="2.6" fill="#2a0505"/><path d="M24 36q8 6 16 0" stroke="#2a0505" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M32 43c-2 5-7 6-7 11 3-1 5-3 7-3s4 2 7 3c0-5-5-6-7-11z" fill="#ffb43c"/></svg>';
  function ri(n){return Math.floor(Math.random()*n);}
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("dragontowerBet","10.00")
    +'<div class="stat-grid"><div class="stat-box"><small>Current</small><b id="dragontowerMult">1.00×</b></div>'
    +'<div class="stat-box"><small>Potential</small><b id="dragontowerPot">$0.00</b></div></div>'
    +'<button class="action-btn" id="dragontowerPlay" style="margin-top:16px">Climb Tower</button>'
    +'<button class="action-btn" id="dragontowerCash" style="margin-top:8px;display:none">Cash Out</button>'
    +'<div class="hist-row" id="dragontowerHist"></div></div>'
    +'<div class="stage" id="dragontowerStage">'+gameHeaderHtml('dragontower')
    +'<div class="dt-tower" id="dragontowerTower"></div>'
    +'<p class="dt-hint" id="dragontowerHint">Each floor hides 3 eggs and 1 dragon. Pick an egg to climb — cash out anytime.</p>'
    +'</div></div>';
  wireAmount("dragontowerBet");
  var stage=$("#dragontowerStage"),tower=$("#dragontowerTower"),hint=$("#dragontowerHint"),
      playBtn=$("#dragontowerPlay"),cashBtn=$("#dragontowerCash"),
      multEl=$("#dragontowerMult"),potEl=$("#dragontowerPot"),histEl=$("#dragontowerHist");
  var bet=0,row=0,dragons=[],picks=[],live=false,curMult=1,lastBust=null,lastPick=null;
  function winRays(){
    if(!ngAnim())return;
    var r=document.createElement("div");r.className="dt-rays";
    stage.appendChild(r);
    var t=setTimeout(function(){if(r.parentNode)r.parentNode.removeChild(r);},1600);
    onCleanup(function(){clearTimeout(t);if(r.parentNode)r.parentNode.removeChild(r);});
  }
  function renderTower(){
    var h='';
    for(var r=8;r>=0;r--){
      var cls=live?(r===row?'dt-active':(r<row?'dt-done':'dt-locked')):'dt-locked';
      h+='<div class="dt-row '+cls+'" data-r="'+r+'"><span class="dt-tag">Floor '+(r+1)+' · '+fmtMult(ladder[r])+'</span>';
      for(var c=0;c<4;c++){
        var tc='dt-tile',inner=eggIdleSVG,st='';
        if(picks[r]!==undefined&&picks[r]===c){
          tc+=' dt-egg';inner=eggSVG;
          if(lastPick&&lastPick.r===r&&lastPick.c===c&&ngAnim())tc+=' dt-reveal';
        }else if(lastBust&&lastBust.r===r){
          if(c===lastBust.c){tc+=' dt-dragon';inner=dragonSVG;}
          else{tc+=' dt-egg';inner=eggSVG;}
          if(ngAnim()){tc+=' dt-reveal';st=' style="animation-delay:'+(c*80)+'ms"';}
        }
        h+='<div class="'+tc+'" data-c="'+c+'"'+st+'>'+inner+'</div>';
      }
      h+='</div>';
    }
    tower.innerHTML=h;
    lastPick=null;
  }
  function endRound(){live=false;playBtn.disabled=false;cashBtn.style.display="none";renderTower();}
  function pushHist(t,w){hist.unshift({t:t,w:w});histChips(histEl,hist.slice(0,12));}
  renderTower();
  playBtn.onclick=function(){
    if(live)return;
    var b=getBet("dragontowerBet");if(b==null)return;
    bet=b;charge(bet);flyChip(this,$("#dragontowerStage"));
    dragons=[];for(var i=0;i<9;i++)dragons.push(ri(4));
    picks=[];row=0;curMult=1;live=true;lastBust=null;lastPick=null;
    multEl.textContent=fmtMult(1);potEl.textContent=fmt$(bet);
    renderTower();playBtn.disabled=true;cashBtn.style.display="none";
    hint.textContent="Floor 1 — pick a tile. Find the egg, avoid the dragon!";
    sfx.click();
  };
  cashBtn.onclick=function(){
    if(!live||row===0)return;
    var m=curMult,payout=settle("Dragon Tower",bet,m);
    winRays();
    stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win();
    pushHist("CASH "+fmtMult(m),true);
    hint.textContent="Cashed out at floor "+row+" for "+fmtMult(m)+".";
    endRound();
  };
  tower.addEventListener("click",function(e){
    if(!live)return;
    var t=e.target.closest(".dt-tile");if(!t)return;
    var rowEl=t.closest(".dt-row");if(!rowEl||+rowEl.dataset.r!==row)return;
    if(t.classList.contains("dt-egg")||t.classList.contains("dt-dragon"))return;
    var c=+t.dataset.c;
    if(c===dragons[row]){
      lastBust={r:row,c:dragons[row]};
      t.classList.add("dt-dragon");t.innerHTML=dragonSVG;
      var tiles=rowEl.querySelectorAll(".dt-tile");
      tiles.forEach(function(tile){
        var cc=+tile.dataset.c;
        if(cc===dragons[row]){tile.classList.add("dt-dragon");tile.innerHTML=dragonSVG;}
        else if(!tile.classList.contains("dt-egg")){tile.classList.add("dt-egg");tile.innerHTML=eggSVG;}
      });
      settle("Dragon Tower",bet,0);
      stageFx(stage,"lose");sfx.lose();
      pushHist("BUST F"+(row+1),false);
      hint.textContent="The dragon got you on floor "+(row+1)+"!";
      endRound();return;
    }
    picks[row]=c;lastPick={r:row,c:c};
    t.classList.add("dt-egg");t.innerHTML=eggSVG;sfx.coin();
    curMult=ladder[row];row++;
    multEl.textContent=fmtMult(curMult);potEl.textContent=fmt$(bet*curMult);
    if(row>=9){
      var payout=settle("Dragon Tower",bet,curMult);
      winRays();
      stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.big();
      pushHist(fmtMult(curMult),true);
      hint.textContent="You cleared all 9 floors! Tower conquered.";
      endRound();return;
    }
    renderTower();
    cashBtn.style.display="";
    hint.textContent="Floor "+(row+1)+" — safe so far at "+fmtMult(curMult)+". Climb or cash out?";
  });
  addDust($("#dragontowerStage"),10);
};
/* ==================== NEWGAME: DRILL ==================== */
BUILDERS.drill=function(mount){
  var ladder=[1.25,1.70,2.40,3.50,5.50];
  var hist=[];
  var holeSVG='<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="15" fill="#0a0a0c" stroke="#8a6a3a" stroke-width="4"/></svg>';
  var gemSVG='<svg viewBox="0 0 64 64"><path d="M32 8l18 20-18 28L14 28z" fill="#ffd479"/><path d="M14 28h36M32 8l-9 20 9 28 9-28-9-20" stroke="#a87b1e" stroke-width="2" fill="none"/><path d="M24 18l4 2M42 15l1 5" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"/><path d="M52 44l2 5M10 46l-2 5" stroke="#ffd479" stroke-width="2" stroke-linecap="round" opacity=".7"/></svg>';
  var rockSVG='<svg viewBox="0 0 64 64"><path d="M12 46l6-22 14-10 14 8 6 20-12 10z" fill="#6b6b72"/><path d="M18 24l16-8 12 10" stroke="#3f3f45" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M28 30l4 10-6 8M41 34l-4 10" stroke="#333338" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="24" cy="44" r="2" fill="#3f3f45"/><circle cx="44" cy="46" r="1.6" fill="#3f3f45"/></svg>';
  var drillSVG='<svg viewBox="0 0 44 64"><rect x="17" y="2" width="10" height="16" rx="3" fill="#8a6a3a"/><rect x="19.5" y="18" width="5" height="24" fill="#c9a86a"/><path d="M22 42l-10 12 10 10 10-10z" fill="#a8b0b8"/><path d="M22 42v22M12 54l10 4 10-4" stroke="#5f666e" stroke-width="2" fill="none"/></svg>';
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("drillBet","10.00")
    +'<div class="stat-grid"><div class="stat-box"><small>Current</small><b id="drillMult">1.00×</b></div>'
    +'<div class="stat-box"><small>Potential</small><b id="drillPot">$0.00</b></div></div>'
    +'<button class="action-btn" id="drillPlay" style="margin-top:16px">Start Drilling</button>'
    +'<button class="action-btn" id="drillCash" style="margin-top:8px;display:none">Cash Out</button>'
    +'<div class="hist-row" id="drillHist"></div></div>'
    +'<div class="stage" id="drillStage">'+gameHeaderHtml('drill')
    +'<div class="dr-shaftwrap" id="drillWrap"><div class="dr-shaft" id="drillShaft"></div>'
    +'<div class="dr-drill dr-hidden" id="drillBit">'+drillSVG+'</div></div>'
    +'<p class="dr-hint" id="drillHint">Each layer hides gems — and solid rock. Pick a spot to drill, cash out anytime.</p>'
    +'</div></div>';
  wireAmount("drillBet");
  var stage=$("#drillStage"),shaft=$("#drillShaft"),wrap=$("#drillWrap"),drillEl=$("#drillBit"),hint=$("#drillHint"),
      playBtn=$("#drillPlay"),cashBtn=$("#drillCash"),
      multEl=$("#drillMult"),potEl=$("#drillPot"),histEl=$("#drillHist");
  var bet=0,layer=0,gems=[],live=false,curMult=1,lastRock=null,lastGem=null;
  function renderShaft(){
    var h='';
    for(var l=0;l<5;l++){
      var cls=live?(l===layer?'dr-active':(l<layer?'dr-done':'dr-locked')):'dr-locked';
      h+='<div class="dr-layer '+cls+'" data-l="'+l+'"><span class="dr-tag">Layer '+(l+1)+' · '+fmtMult(ladder[l])+'</span>';
      for(var s=0;s<3;s++){
        var tc='dr-spot',inner=holeSVG;
        if(gems[l]!==undefined&&gems[l]===s){
          tc+=' dr-gem';inner=gemSVG;
          if(lastGem&&lastGem.l===l&&lastGem.s===s&&ngAnim())tc+=' dr-reveal';
        }else if(lastRock&&lastRock.l===l&&lastRock.s===s){
          tc+=' dr-rock';inner=rockSVG;
          if(ngAnim())tc+=' dr-reveal';
        }
        h+='<div class="'+tc+'" data-s="'+s+'">'+inner+'</div>';
      }
      h+='</div>';
    }
    shaft.innerHTML=h;
    lastGem=null;
  }
  function moveDrill(el){
    var wr=wrap.getBoundingClientRect(),r=el.getBoundingClientRect();
    drillEl.style.top=Math.max(0,(r.top-wr.top+r.height/2-34))+"px";
    drillEl.style.left=(r.left-wr.left+r.width/2)+"px";
    if(ngAnim()){drillEl.classList.remove("dr-spin");void drillEl.offsetWidth;drillEl.classList.add("dr-spin");}
  }
  function endRound(){live=false;playBtn.disabled=false;cashBtn.style.display="none";renderShaft();}
  function pushHist(t,w){hist.unshift({t:t,w:w});histChips(histEl,hist.slice(0,12));}
  function winRays(){
    if(!ngAnim())return;
    var r=document.createElement("div");r.className="dr-rays";
    stage.appendChild(r);
    var t=setTimeout(function(){if(r.parentNode)r.parentNode.removeChild(r);},1600);
    onCleanup(function(){clearTimeout(t);if(r.parentNode)r.parentNode.removeChild(r);});
  }
  renderShaft();
  playBtn.onclick=function(){
    if(live)return;
    var b=getBet("drillBet");if(b==null)return;
    bet=b;charge(bet);flyChip(this,$("#drillStage"));
    gems=[];layer=0;curMult=1;live=true;lastRock=null;lastGem=null;
    drillEl.classList.remove("dr-hidden");drillEl.style.top="4px";drillEl.style.left="50%";
    wrap.classList.remove("dr-celebrate");
    multEl.textContent=fmtMult(1);potEl.textContent=fmt$(bet);
    renderShaft();playBtn.disabled=true;cashBtn.style.display="none";
    hint.textContent="Layer 1 — pick a spot to drill. Gem or rock?";
    sfx.click();
  };
  cashBtn.onclick=function(){
    if(!live||layer===0)return;
    var m=curMult,payout=settle("Drill",bet,m);
    winRays();
    stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win();
    pushHist("CASH "+fmtMult(m),true);
    hint.textContent="Cashed out at layer "+layer+" for "+fmtMult(m)+".";
    endRound();
  };
  shaft.addEventListener("click",function(e){
    if(!live)return;
    var sp=e.target.closest(".dr-spot");if(!sp)return;
    var layerEl=sp.closest(".dr-layer");if(!layerEl||+layerEl.dataset.l!==layer)return;
    if(sp.classList.contains("dr-gem")||sp.classList.contains("dr-rock"))return;
    var rockP=1-0.97/ladder[layer];
    moveDrill(sp);
    if(Math.random()<rockP){
      lastRock={l:layer,s:+sp.dataset.s};
      sp.classList.add("dr-rock");sp.innerHTML=rockSVG;
      settle("Drill",bet,0);
      stageFx(stage,"lose");sfx.lose();
      pushHist("ROCK L"+(layer+1),false);
      hint.textContent="Hit solid rock on layer "+(layer+1)+"! Drill snapped.";
      endRound();return;
    }
    lastGem={l:layer,s:+sp.dataset.s};
    gems[layer]=+sp.dataset.s;
    sp.classList.add("dr-gem");sp.innerHTML=gemSVG;sfx.coin();
    curMult=ladder[layer];layer++;
    multEl.textContent=fmtMult(curMult);potEl.textContent=fmt$(bet*curMult);
    if(layer>=5){
      var payout=settle("Drill",bet,curMult);
      winRays();
      if(ngAnim())wrap.classList.add("dr-celebrate");
      stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.big();
      pushHist(fmtMult(curMult),true);
      hint.textContent="Bedrock reached! All 5 gems for "+fmtMult(curMult)+".";
      endRound();return;
    }
    renderShaft();
    cashBtn.style.display="";
    hint.textContent="Layer "+(layer+1)+" — gem secured at "+fmtMult(curMult)+". Drill deeper or cash out?";
  });
  addDust($("#drillStage"),10);
};
/* ==================== NEWGAME: FLIP ==================== */
BUILDERS.flip=function(mount){
  var LAD=[1.96,3.84,7.53,14.75,28.9];
  var side="H";
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("flipBet","10.00")
    +'<div class="field"><label>Your Call</label><div class="seg" id="flipSide">'
    +'<button class="on" data-s="H">Heads</button><button data-s="T">Tails</button></div></div>'
    +'<button class="action-btn" id="flipPlay" style="margin-top:16px">Flip the Coin</button>'
    +'<div class="flip-round-btns" id="flipRoundBtns" style="display:none">'
    +'<button class="action-btn" id="flipAgain">Flip Again</button>'
    +'<button class="action-btn" id="flipCash" style="background:#2a6b3a">Cash Out</button></div>'
    +'<div class="hist-row" id="flipHist"></div></div>'
    +'<div class="stage" id="flipStage">'+gameHeaderHtml('flip')
    +'<div class="flip-stage"><div class="flip-rays" id="flipRays"></div>'
    +'<div class="flip-coinwrap"><div class="flip-coin" id="flipCoin">'
    +'<div class="flip-face"><span>H</span></div>'
    +'<div class="flip-face flip-tails"><span>T</span></div>'
    +'</div></div><div class="flip-pedestal"></div>'
    +'<div class="flip-ladder" id="flipLadder"></div>'
    +'<div class="flip-pot" id="flipPot">Call a side and flip to start climbing</div>'
    +'</div></div></div>';
  wireAmount("flipBet");
  var stage=document.getElementById("flipStage"),coin=document.getElementById("flipCoin"),
      play=document.getElementById("flipPlay"),again=document.getElementById("flipAgain"),
      cash=document.getElementById("flipCash"),roundBtns=document.getElementById("flipRoundBtns"),
      ladderEl=document.getElementById("flipLadder"),potEl=document.getElementById("flipPot");
  var segBtns=document.getElementById("flipSide").querySelectorAll("button");
  var bet=0,rung=0,live=false,busy=false,spins=0,flipTimer=null,pendingDone=null,hist=[];
  function flipRays(){
    if(!ngAnim())return;
    var r=document.getElementById("flipRays");if(!r)return;
    r.classList.remove("show");void r.offsetWidth;r.classList.add("show");
    setTimeout(function(){r.classList.remove("show");},1500);
  }
  var j;for(j=0;j<segBtns.length;j++){
    segBtns[j].addEventListener("click",(function(b){
      return function(){
        if(live)return;
        for(var k=0;k<segBtns.length;k++)segBtns[k].classList.remove("on");
        b.classList.add("on");side=b.getAttribute("data-s");sfx.click();
      };
    })(segBtns[j]));
  }
  function renderLadder(){
    var h="",r;for(r=0;r<LAD.length;r++){
      h+='<span class="flip-rung'+(r<rung?" done":(r===rung&&live?" on":""))+'">'+fmtMult(LAD[r])+"</span>";
    }
    ladderEl.innerHTML=h;
  }
  function renderPot(){
    if(!live){potEl.textContent="Call a side and flip to start climbing";return;}
    if(rung<1){potEl.innerHTML="Streak 0 &mdash; flip to start your streak";return;}
    var m=LAD[rung-1];
    potEl.innerHTML="Streak "+rung+" &mdash; cash out <b>"+fmt$(bet*m)+"</b> ("+fmtMult(m)+")";
  }
  function endRoundUI(){
    live=false;play.style.display="";roundBtns.style.display="none";
  }
  function cashOut(auto){
    if(!live||rung<1)return;
    var m=LAD[rung-1],b=bet;
    endRoundUI();
    var payout=settle("Flip",b,m);
    hist.unshift({t:fmtMult(m),w:true});
    histChips(document.getElementById("flipHist"),hist.slice(0,12));
    stageFx(stage,"win");burstFX(stage,{});flipRays();
    winBanner(stage,(auto?"MAX STREAK — ":"")+"WON "+fmt$(payout));
    sfx.win();renderLadder();renderPot();
  }
  function bust(){
    endRoundUI();
    settle("Flip",bet,0);
    hist.unshift({t:"BUST",w:false});
    histChips(document.getElementById("flipHist"),hist.slice(0,12));
    stageFx(stage,"lose");sfx.lose();renderLadder();renderPot();
  }
  onCleanup(function(){if(flipTimer){clearTimeout(flipTimer);flipTimer=null;var d=pendingDone;pendingDone=null;if(d)d();}});
  play.addEventListener("click",function(){
    if(live)return;var b=getBet("flipBet");if(b==null)return;
    bet=b;charge(bet);flyChip(play,stage);live=true;rung=0;spins=0;sfx.click();
    play.style.display="none";roundBtns.style.display="flex";
    renderLadder();renderPot();
  });
  function doFlip(){
    if(!live||busy)return;busy=true;sfx.click();
    var res=Math.random()<0.5?"H":"T";
    spins+=2;
    function done(){
      busy=false;flipTimer=null;pendingDone=null;
      if(res===side){
        rung++;
        if(rung>=LAD.length){cashOut(true);return;}
        sfx.coin();stageFx(stage,"win");
        renderLadder();renderPot();
      }else{bust();}
    }
    pendingDone=done;
    coin.style.transform="rotateY("+(spins*360+(res==="T"?180:0))+"deg)";
    if(ngAnim()){flipTimer=setTimeout(done,950);}else{done();}
  }
  again.addEventListener("click",doFlip);
  cash.addEventListener("click",function(){if(!busy)cashOut(false);});
  renderLadder();
  addDust(stage,10);
};
/* ==================== NEWGAME: HILO ==================== */
BUILDERS.hilo=function(mount){
  var $=function(s){return mount.querySelector(s)};
  var SUITS=["\u2660","\u2665","\u2666","\u2663"],RANKS=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  function newDeck(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({r:RANKS[r],s:SUITS[s],v:r+2,red:(s===1||s===2)});for(var i=d.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=d[i];d[i]=d[j];d[j]=t}return d}
  var hist=[],deck=newDeck(),current=null,prev=null,busy=false;
  function cardHtml(c,cls){return '<div class="hl-card '+(cls||"")+(c.red?" red":"")+(ngAnim()?" hl-card-in":"")+'"><div class="rk">'+c.r+'</div><div class="st">'+c.s+'</div></div>'}
  function odds(){
    var hi=0,lo=0,sa=0;
    for(var i=0;i<deck.length;i++){if(deck[i].v>current.v)hi++;else if(deck[i].v<current.v)lo++;else sa++}
    var edge=0.98,n=deck.length;
    return{hi:hi,lo:lo,sa:sa,
      hiM:hi>0?edge*n/hi:0,loM:lo>0?edge*n/lo:0,saM:12};
  }
  function refresh(){
    var o=odds(),n=deck.length;
    $("#hiloCur").innerHTML=current?cardHtml(current):'<div class="hl-card"><div class="rk">?</div></div>';
    $("#hiloPrevWrap").innerHTML=prev?cardHtml(prev,"hl-prev"):"";
    $("#hiloHi").innerHTML='Higher<small>'+(o.hi>0?fmtMult(o.hiM):"n/a")+' &bull; '+o.hi+'/'+n+'</small>';
    $("#hiloLo").innerHTML='Lower<small>'+(o.lo>0?fmtMult(o.loM):"n/a")+' &bull; '+o.lo+'/'+n+'</small>';
    $("#hiloSa").innerHTML='Same<small>11:1 &bull; '+o.sa+'/'+n+'</small>';
    $("#hiloHi").disabled=o.hi===0;$("#hiloLo").disabled=o.lo===0;$("#hiloSa").disabled=o.sa===0;
    $("#hiloDeck").textContent="Cards left in deck: "+n+" (aces high)";
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("hiloBet","10.00")
    +'<div class="field"><label>How to play</label><div style="font-size:12px;color:#9fb3a8;line-height:1.7">Predict the next card vs the current one.<br>Higher / Lower pay true deck odds (2% edge).<br>Same pays <b style="color:#ffd479">11:1</b>. Wrong-rank tie on Higher/Lower = push.</div></div>'
    +'<button class="action-btn" id="hiloPlay" style="margin-top:16px">New Card</button>'
    +'<div class="hist-row" id="hiloHist"></div></div>'
    +'<div class="stage" id="hiloStage">'+gameHeaderHtml('hilo')+'<div class="hl-rays"></div>'
    +'<div class="hl-wrap">'
    +'<div class="hl-spot"></div>'
    +'<div class="hl-label">Current card</div><div class="hl-cards"><div id="hiloPrevWrap"></div><div id="hiloCur"></div></div>'
    +'<div class="hl-ped"></div>'
    +'<div class="hl-winmult" id="hiloWinMult"></div>'
    +'<div class="hl-btns"><button class="action-btn" id="hiloHi">Higher</button><button class="action-btn" id="hiloLo">Lower</button><button class="action-btn" id="hiloSa">Same</button></div>'
    +'<div class="hl-msg" id="hiloMsg">Press New Card to start.</div>'
    +'<div class="hl-deck" id="hiloDeck"></div>'
    +'</div></div></div>';
  wireAmount("hiloBet");
  function newCard(){
    if(deck.length===0)deck=newDeck();
    prev=current;current=deck.pop();refresh();
    $("#hiloWinMult").textContent="";
    $("#hiloMsg").textContent="Will the next card be higher, lower or the same?";
  }
  $("#hiloPlay").addEventListener("click",function(){if(busy)return;sfx.click();newCard()});
  function guess(kind,btn){
    if(busy||!current)return;
    var bet=getBet("hiloBet");if(bet==null)return;
    charge(bet);flyChip(btn,$("#hiloStage"));busy=true;sfx.click();
    var o=odds(),m=kind==="hi"?o.hiM:(kind==="lo"?o.loM:12);
    if(deck.length===0)deck=newDeck();
    var next=deck.pop();
    var win=false,push=false;
    if(kind==="sa"){win=(next.v===current.v)}
    else if(kind==="hi"){if(next.v===current.v)push=true;else win=next.v>current.v}
    else{if(next.v===current.v)push=true;else win=next.v<current.v}
    var mul=win?m:(push?1:0);
    var stage=$("#hiloStage"),payout=settle("Hilo",bet,mul);
    prev=current;current=next;refresh();
    var cname=next.r+next.s,verb=kind==="hi"?"HIGHER":(kind==="lo"?"LOWER":"SAME");
    var label=win?verb+" "+cname+" "+fmtMult(m):(push?"PUSH "+cname:"LOST "+cname);
    hist.unshift({t:label,w:mul>1});histChips($("#hiloHist"),hist.slice(0,12));
    $("#hiloMsg").textContent=(win?"Next card "+cname+" — Won "+fmt$(payout):(push?"Next card "+cname+" — tie, stake back":"Next card "+cname+" — wrong call"));
    if(mul>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win();if(ngAnim()){countUp($("#hiloWinMult"),m,fmtMult,400)}else{$("#hiloWinMult").textContent=fmtMult(m)}if(ngAnim()){stage.classList.add("rays-on");setTimeout(function(){stage.classList.remove("rays-on")},1500)}}
    else if(push){stageFx(stage,"shake");sfx.click();$("#hiloWinMult").textContent=""}
    else{stageFx(stage,"lose");sfx.lose();$("#hiloWinMult").textContent=""}
    busy=false;
  }
  $("#hiloHi").addEventListener("click",function(){guess("hi",this)});
  $("#hiloLo").addEventListener("click",function(){guess("lo",this)});
  $("#hiloSa").addEventListener("click",function(){guess("sa",this)});
  newCard();
  addDust($("#hiloStage"),10);
};
/* ==================== NEWGAME: KENO ==================== */
BUILDERS.keno=function(mount){
  var hist=[], picks=[], busy=false, timers=[];
  var PAY={2:{1:1,2:10},3:{3:80},4:{2:2,3:11,4:43},5:{3:7.5,4:35,5:118},
           6:{3:4,4:14,5:55,6:115},7:{3:2.5,4:7,5:28,6:75,7:105},
           8:{4:7,5:25,6:90,7:180,8:220},9:{4:4,5:15,6:45,7:110,8:170,9:190},
           10:{5:12,6:51,7:153,8:296,9:408,10:410}};
  var cells="";
  for(var n=1;n<=40;n++) cells+='<div class="keno-cell" data-n="'+n+'">'+n+'</div>';
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("kenoBet","10.00")
    +'<div class="stat-grid"><div class="stat-box"><small>Numbers picked</small><b id="kenoCount">0 / 10</b></div>'
    +'<div class="stat-box"><small>Top prize</small><b id="kenoTop" class="stat-empty">No result yet</b></div></div>'
    +'<div class="keno-rowbtns"><button class="mini-btn" id="kenoQuick" style="flex:1">Quick Pick</button>'
    +'<button class="mini-btn" id="kenoClear" style="flex:1">Clear</button></div>'
    +'<div class="keno-pay" id="kenoPay"></div>'
    +'<button class="action-btn" id="kenoPlay" style="margin-top:16px">Draw Numbers</button>'
    +'<div class="hist-row" id="kenoHist"></div></div>'
    +'<div class="stage" id="kenoStage">'+gameHeaderHtml('keno')
    +'<div class="keno-board"><div class="keno-grid" id="kenoGrid">'+cells+'</div></div>'
    +'<div class="keno-status" id="kenoStatus">Pick 2–10 numbers, then draw</div></div></div>';
  wireAmount("kenoBet");
  onCleanup(function(){ timers.forEach(clearTimeout); timers=[]; });
  var grid=$("#kenoGrid");
  function renderPay(){
    var p=picks.length, box=$("#kenoPay");
    $("#kenoCount").textContent=p+" / 10";
    if(p<2){ box.innerHTML='<div style="text-align:center;color:#8a7a5f">Pick at least 2 numbers to see the paytable</div>'; $("#kenoTop").textContent="No result yet";$("#kenoTop").classList.add("stat-empty"); return; }
    var tbl=PAY[p], rows="", top=0;
    Object.keys(tbl).sort(function(a,b){return a-b;}).forEach(function(h){
      rows+='<tr><td>Catch '+h+'</td><td>'+tbl[h]+'×</td></tr>';
      if(tbl[h]>top) top=tbl[h];
    });
    box.innerHTML='<table>'+rows+'</table>';
    $("#kenoTop").textContent=top+"×";$("#kenoTop").classList.remove("stat-empty");
  }
  function paint(){
    var divs=grid.children;
    for(var i=0;i<divs.length;i++){
      var n=i+1, el=divs[i];
      el.className="keno-cell"+(picks.indexOf(n)>=0?" sel":"");
    }
    renderPay();
  }
  function winRays(stage){
    if(!ngAnim()) return;
    var r=document.createElement("div"); r.className="keno-rays"; stage.appendChild(r);
    timers.push(setTimeout(function(){ if(r.parentNode) r.parentNode.removeChild(r); },2400));
  }
  grid.addEventListener("click",function(e){
    if(busy) return;
    var t=e.target.closest(".keno-cell"); if(!t) return;
    var n=+t.getAttribute("data-n"), ix=picks.indexOf(n);
    if(ix>=0) picks.splice(ix,1);
    else{ if(picks.length>=10){ toast("Keno","Maximum 10 numbers","err"); return; } picks.push(n); sfx.click(); }
    paint();
  });
  $("#kenoQuick").addEventListener("click",function(){
    if(busy) return;
    picks=[]; var pool=[]; for(var i=1;i<=40;i++) pool.push(i);
    while(picks.length<10){ picks.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]); }
    sfx.click(); paint();
  });
  $("#kenoClear").addEventListener("click",function(){ if(busy) return; picks=[]; sfx.click(); paint(); });
  $("#kenoPlay").addEventListener("click",function(){
    if(busy) return;
    if(picks.length<2){ toast("Keno","Pick 2–10 numbers first","err"); return; }
    var bet=getBet("kenoBet"); if(bet==null) return;
    busy=true; charge(bet); flyChip(this,$("#kenoStage")); sfx.click();
    var stage=$("#kenoStage"), status=$("#kenoStatus");
    var divs=grid.children;
    for(var i=0;i<divs.length;i++) divs[i].className="keno-cell"+(picks.indexOf(i+1)>=0?" sel":"");
    var pool=[]; for(var j=1;j<=40;j++) pool.push(j);
    var drawn=[];
    while(drawn.length<10) drawn.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
    var hits=0, di=0;
    function markOne(){
      var n=drawn[di], el=divs[n-1], isHit=picks.indexOf(n)>=0, isLast=di===drawn.length-1;
      function settleOne(){
        el.className="keno-cell drawn"+(isHit?" hit":"")+(ngAnim()?" pop":"")+(isLast&&ngAnim()?" keno-last":"");
        if(isHit){ hits++; sfx.coin(); }
        status.textContent="Drawn "+(di+1)+" / 10 — "+hits+" hit"+(hits===1?"":"s");
        di++;
        if(di<drawn.length){
          var lastNext=di===drawn.length-1;
          timers.push(setTimeout(markOne, ngAnim()?(lastNext?950:160):0));
        }
        else finish();
      }
      if(ngAnim()){ el.className="keno-cell keno-tick"; timers.push(setTimeout(settleOne,110)); }
      else settleOne();
    }
    function finish(){
      busy=false;
      var p=picks.length, mult=(PAY[p][hits]||0);
      var payout=settle("Keno",bet,mult);
      if(mult>1){ stageFx(stage,"win"); burstFX(stage,{}); winRays(stage); winBanner(stage,"WON "+fmt$(payout)); sfx.win();
        status.textContent="Caught "+hits+" of "+p+" — pays "+mult+"×!"; }
      else if(mult===1){ stageFx(stage,"shake"); sfx.click();
        status.textContent="Caught "+hits+" of "+p+" — stake back."; }
      else{ stageFx(stage,"lose"); sfx.lose();
        status.textContent="Caught "+hits+" of "+p+" — no win."; }
      hist.unshift({t:hits+"/"+p,w:mult>1});
      histChips($("#kenoHist"),hist.slice(0,12));
    }
    markOne();
  });
  paint();
  addDust($("#kenoStage"),10);
};
/* ==================== NEWGAME: LIMBO ==================== */
BUILDERS.limbo=function(mount){
  var hist=[], busy=false, timers=[];
  var rocketSvg='<svg viewBox="0 0 46 88"><g class="limbo-flame"><polygon points="23,88 13,64 33,64" fill="#ff9a3c"/><polygon points="23,88 17,66 29,66" fill="#ffd479"/></g><polygon points="23,2 34,20 12,20" fill="#e63946"/><polygon points="23,2 34,20 23,20" fill="#ff7070"/><rect x="12" y="20" width="22" height="38" rx="4" fill="#e8ecf2"/><rect x="12" y="20" width="22" height="7" fill="#ffd479"/><circle cx="23" cy="38" r="6.5" fill="#14335c" stroke="#8a6a2f" stroke-width="2"/><circle cx="21" cy="36" r="2" fill="#9fc4e8"/><polygon points="12,58 3,76 12,74" fill="#e63946"/><polygon points="34,58 43,76 34,74" fill="#e63946"/><rect x="17" y="58" width="12" height="8" rx="2" fill="#5a5f6a"/></svg>';
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("limboBet","10.00")
    +'<div class="field"><label>Target multiplier <b id="limboTVal" style="color:#ffd479">2.00×</b></label>'
    +'<input type="range" id="limboTarget" min="0" max="1000" value="500" style="width:100%"></div>'
    +'<div class="stat-grid"><div class="stat-box"><small>Win chance</small><b id="limboChance">49.50%</b></div>'
    +'<div class="stat-box"><small>Payout</small><b id="limboPay">2.00×</b></div></div>'
    +'<div class="limbo-targetline">Win chance = 99% ÷ target · result = 0.99 ÷ (1 − r)</div>'
    +'<button class="action-btn" id="limboPlay" style="margin-top:16px">Place Bet</button>'
    +'<div class="hist-row" id="limboHist"></div></div>'
    +'<div class="stage" id="limboStage">'+gameHeaderHtml('limbo')
    +'<div class="limbo-scene"><div class="limbo-stars"></div>'
    +'<div class="limbo-track"><div class="limbo-trackfill" id="limboFill"></div>'
    +'<div class="limbo-tgtline" id="limboTgt" style="bottom:50%"></div>'
    +'<div class="limbo-rocket" id="limboRocket">'+rocketSvg+'</div>'
    +'<div class="limbo-pad"></div></div>'
    +'<div class="limbo-main"><div class="limbo-result" id="limboResult">1.00×</div>'
    +'<div class="limbo-msg" id="limboMsg">Set your target and place a bet</div></div>'
    +'</div></div></div>';
  wireAmount("limboBet");
  var slider=$("#limboTarget");
  function target(){ return 1.01*Math.pow(100/1.01, slider.value/1000); }
  function fmtT(t){ return t<10? t.toFixed(2)+"×" : Math.floor(t)+"×"; }
  function refresh(){
    var t=target();
    $("#limboTVal").textContent=fmtT(t);
    $("#limboChance").textContent=(99/t).toFixed(2)+"%";
    $("#limboPay").textContent=fmtT(t);
    var tgt=$("#limboTgt");
    if(tgt) tgt.style.bottom=Math.max(0,Math.min(100,Math.log(t)/Math.log(100)*100))+"%";
  }
  slider.addEventListener("input",refresh); refresh();
  var raf=null;
  onCleanup(function(){ if(raf) cancelAnimationFrame(raf); timers.forEach(clearTimeout); timers=[]; });
  function fmtR(r){
    if(r>=1000000) return (r/1000000).toFixed(2)+"M×";
    if(r>=1000) return Math.floor(r).toLocaleString("en-US")+"×";
    return r.toFixed(2)+"×";
  }
  function winRays(stage){
    if(!ngAnim()) return;
    var r=document.createElement("div"); r.className="limbo-rays"; stage.appendChild(r);
    timers.push(setTimeout(function(){ if(r.parentNode) r.parentNode.removeChild(r); },2400));
  }
  $("#limboPlay").addEventListener("click",function(){
    if(busy) return;
    var bet=getBet("limboBet"); if(bet==null) return;
    busy=true; charge(bet); flyChip(this,$("#limboStage")); sfx.click();
    var t=target();
    var stage=$("#limboStage"), res=$("#limboResult"), msg=$("#limboMsg"),
        rock=$("#limboRocket"), fill=$("#limboFill");
    var result=0.99/(1-Math.random());
    var win=result>=t, mult=win?t:0;
    res.className="limbo-result";
    rock.classList.remove("limbo-burn");
    function finish(){
      busy=false;
      if(ngAnim()) countUp(res,result,fmtR,600); else res.textContent=fmtR(result);
      res.className="limbo-result "+(win?"hot":"bust");
      rock.classList.remove("limbo-burn");
      rock.style.bottom="100%"; fill.style.height="100%";
      var payout=settle("Limbo",bet,mult);
      if(win){ stageFx(stage,"win"); burstFX(stage,{}); winRays(stage); winBanner(stage,"WON "+fmt$(payout)); sfx.win();
        msg.textContent="Target cleared at "+fmtR(result)+" — paid "+fmtT(t); }
      else{ stageFx(stage,"lose"); sfx.lose();
        msg.textContent="Busted at "+fmtR(result)+" — below "+fmtT(t); }
      hist.unshift({t:fmtR(result),w:mult>1});
      histChips($("#limboHist"),hist.slice(0,12));
    }
    if(!ngAnim()){ finish(); return; }
    var dur=1500, t0=null, maxLog=Math.log(Math.max(result,1.01));
    function draw(now){
      if(t0==null) t0=now;
      var p=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-p,3);
      var cur=1+(result-1)*e;
      res.textContent=fmtR(cur);
      res.className="limbo-result"+(cur>=t?" hot":"");
      var h=Math.min(100, Math.log(Math.max(cur,1.01))/maxLog*100);
      rock.style.bottom=h+"%"; fill.style.height=h+"%";
      if(p<1){ raf=requestAnimationFrame(draw); } else { raf=null; finish(); }
    }
    rock.style.bottom="0%"; fill.style.height="0%";
    rock.classList.add("limbo-burn");
    raf=requestAnimationFrame(draw);
  });
  addDust($("#limboStage"),10);
};
/* ==================== NEWGAME: MOLES ==================== */
BUILDERS.moles=function(mount){
  var hist=[];
  var moleSVG='<svg viewBox="0 0 64 64"><ellipse cx="32" cy="41" rx="17" ry="13" fill="#8a5a33"/><ellipse cx="32" cy="31" rx="12" ry="11" fill="#a9743f"/><circle cx="26" cy="29" r="2.4" fill="#1c1008"/><circle cx="38" cy="29" r="2.4" fill="#1c1008"/><circle cx="26.8" cy="28.2" r=".8" fill="#ffffff"/><circle cx="38.8" cy="28.2" r=".8" fill="#ffffff"/><ellipse cx="32" cy="37" rx="4.5" ry="3.2" fill="#e8a0a0"/><path d="M27 42q5 3 10 0" stroke="#1c1008" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M16 30l-7-3M16 37l-7 0M48 30l7-3M48 37l7 0" stroke="#5e3a1a" stroke-width="2" stroke-linecap="round"/><ellipse cx="19" cy="50" rx="6" ry="4" fill="#7a4e2a"/><ellipse cx="45" cy="50" rx="6" ry="4" fill="#7a4e2a"/></svg>';
  var bombSVG='<svg viewBox="0 0 64 64"><circle cx="32" cy="38" r="16" fill="#1b1b1f"/><circle cx="26" cy="32" r="4" fill="#3a3a40"/><path d="M32 22c0-7 6-9 11-13" stroke="#8a6a3a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="45" cy="7" r="5" fill="#ff5a3c"/><circle cx="45" cy="7" r="8.5" fill="none" stroke="#ff5a3c" stroke-width="2" opacity=".6"/><path d="M26 34l12 8M38 34l-12 8" stroke="#ff5a3c" stroke-width="2.5" stroke-linecap="round"/></svg>';
  function ri(n){return Math.floor(Math.random()*n);}
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("molesBet","10.00")
    +'<div class="field"><label>Whacks per round</label><div class="seg" id="molesSeg">'
    +[1,2,3,4,5].map(function(k){return '<button data-v="'+k+'"'+(k===3?' class="on"':'')+'>'+k+'</button>';}).join('')
    +'</div></div>'
    +'<div class="stat-grid"><div class="stat-box"><small>Collected</small><b id="molesTotal">0.00×</b></div>'
    +'<div class="stat-box"><small>Whacks left</small><b id="molesLeft">–</b></div></div>'
    +'<button class="action-btn" id="molesPlay" style="margin-top:16px">Start Whacking</button>'
    +'<div class="hist-row" id="molesHist"></div></div>'
    +'<div class="stage" id="molesStage">'+gameHeaderHtml('moles')
    +'<div class="mo-grid" id="molesGrid"></div>'
    +'<p class="mo-hint" id="molesHint">Pick how many moles to whack, then press Start. One random hole per whack hides a bomb!</p>'
    +'</div></div>';
  wireAmount("molesBet");
  var stage=$("#molesStage"),grid=$("#molesGrid"),hint=$("#molesHint"),playBtn=$("#molesPlay"),
      totalEl=$("#molesTotal"),leftEl=$("#molesLeft"),histEl=$("#molesHist");
  var K=3,bet=0,left=0,total=0,live=false,armed=true,base=1;
  $("#molesSeg").addEventListener("click",function(e){
    var b=e.target.closest("button");if(!b||live)return;
    var btns=this.querySelectorAll("button");
    btns.forEach(function(x){x.classList.remove("on");});
    b.classList.add("on");K=+b.dataset.v;sfx.click();
  });
  function buildGrid(){
    var h='';
    for(var i=0;i<9;i++)h+='<div class="mo-hole" data-i="'+i+'"><div class="mo-mole"></div></div>';
    grid.innerHTML=h;
  }
  buildGrid();
  function resetHoles(){
    var holes=grid.querySelectorAll(".mo-hole");
    holes.forEach(function(hl){
      hl.classList.remove("mo-up","mo-bomb","mo-warn");
      hl.querySelector(".mo-mole").innerHTML="";
    });
  }
  function pushHist(t,w){hist.unshift({t:t,w:w});histChips(histEl,hist.slice(0,12));}
  function winRays(){
    if(!ngAnim())return;
    var r=document.createElement("div");r.className="mo-rays";
    stage.appendChild(r);
    var t=setTimeout(function(){if(r.parentNode)r.parentNode.removeChild(r);},1600);
    onCleanup(function(){clearTimeout(t);if(r.parentNode)r.parentNode.removeChild(r);});
  }
  function endRound(){live=false;playBtn.disabled=false;leftEl.textContent="–";}
  playBtn.onclick=function(){
    if(live)return;
    var b=getBet("molesBet");if(b==null)return;
    bet=b;charge(bet);flyChip(this,$("#molesStage"));
    base=0.97/(K*Math.pow(8/9,K));
    left=K;total=0;live=true;armed=true;
    resetHoles();
    totalEl.textContent=fmtMult(0);leftEl.textContent=left;
    hint.textContent="Whack "+K+" mole"+(K>1?"s":"")+" — every whack risks the bomb!";
    playBtn.disabled=true;sfx.click();
  };
  grid.addEventListener("click",function(e){
    if(!live||!armed)return;
    var hl=e.target.closest(".mo-hole");if(!hl||hl.classList.contains("mo-up"))return;
    armed=false;
    var bomb=ri(9),idx=+hl.dataset.i;
    var moleEl=hl.querySelector(".mo-mole");
    if(idx===bomb){
      hl.classList.add("mo-bomb","mo-up");moleEl.innerHTML=bombSVG;
      if(ngAnim())hl.classList.add("mo-warn");
      settle("Moles",bet,0);
      stageFx(stage,"lose");sfx.lose();
      pushHist("BOMB",false);
      hint.textContent="BOOM! The bomb got you.";
      endRound();return;
    }
    var m=base*(0.8+Math.random()*0.4);
    moleEl.innerHTML=moleSVG+'<b>'+fmtMult(m)+'</b>';
    hl.classList.add("mo-up");sfx.coin();
    total+=m;left--;
    totalEl.textContent=fmtMult(total);leftEl.textContent=left;
    if(left<=0){
      var payout=settle("Moles",bet,total);
      winRays();
      stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win();
      pushHist(fmtMult(total),true);
      hint.textContent="Nice whacking! "+fmtMult(total)+" total collected.";
      endRound();return;
    }
    hint.textContent="Whack! "+left+" left — pick another hole.";
    if(ngAnim()){setTimeout(function(){resetHoles();armed=true;},450);}
    else{resetHoles();armed=true;}
  });
  addDust($("#molesStage"),10);
};
/* ==================== NEWGAME: PACKS ==================== */
BUILDERS.packs=function(mount){
  var hist=[];
  var timers=[];
  function later(fn,ms){var t=setTimeout(fn,ms);timers.push(t);return t;}
  onCleanup(function(){for(var i=0;i<timers.length;i++)clearTimeout(timers[i]);});
  // rarity: [name, multiplier, weight, glyph]
  var RAR=[
    {n:"COMMON",m:0.2,w:65,g:"◆"},
    {n:"RARE",m:1.0,w:26,g:"⬢"},
    {n:"EPIC",m:4.0,w:7,g:"✦"},
    {n:"LEGENDARY",m:15,w:2,g:"★"}
  ];
  var PK_GLYPH={
    COMMON:'<svg viewBox="0 0 40 40" fill="none" stroke="#c3cad6" stroke-width="3" stroke-linejoin="round"><path d="M20 5L33 20L20 35L7 20Z"/></svg>',
    RARE:'<svg viewBox="0 0 40 40" fill="none" stroke="#7db9ff" stroke-width="3" stroke-linejoin="round"><path d="M20 4l14 8v16l-14 8-14-8V12z"/></svg>',
    EPIC:'<svg viewBox="0 0 40 40" fill="none" stroke="#d49aff" stroke-width="2.5" stroke-linejoin="round"><path d="M20 3l2.6 14.4L37 20l-14.4 2.6L20 37l-2.6-14.4L3 20l14.4-2.6z"/></svg>',
    LEGENDARY:'<svg viewBox="0 0 40 40" fill="none" stroke="#ffd479" stroke-width="2.5" stroke-linejoin="round"><path d="M20 5l4 10 11 1-8 7 3 11-10-7-10 7 3-11-8-7 11-1z"/></svg>'
  };
  function rollRarity(){
    var r=Math.random()*100,acc=0;
    for(var i=0;i<RAR.length;i++){acc+=RAR[i].w;if(r<acc)return RAR[i];}
    return RAR[0];
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("packsBet","10.00")
    +'<button class="action-btn" id="packsPlay" style="margin-top:16px">Open Pack</button>'
    +'<div class="hist-row" id="packsHist"></div></div>'
    +'<div class="stage" id="packsStage">'
    +gameHeaderHtml('packs')
    +'<div class="pk-row" id="packsRow"></div>'
    +'<div class="pk-hint" id="packsHint">Three cards per pack. Payout = average multiplier × bet.</div>'
    +'<div class="pk-odds"><span><b style="color:#c3cad6">COMMON 0.20×</b> 65%</span><span><b style="color:#7db9ff">RARE 1.00×</b> 26%</span><span><b style="color:#d49aff">EPIC 4×</b> 7%</span><span><b style="color:#ffd479">LEGENDARY 15×</b> 2%</span></div>'
    +'</div></div>';
  wireAmount("packsBet");
  var stage=$("#packsStage"),row=$("#packsRow"),hint=$("#packsHint"),playBtn=$("#packsPlay");
  var busy=false;
  function renderBacks(){
    var h="";
    for(var i=0;i<3;i++){
      h+='<div class="pk-card"><div class="pk-inner">'
        +'<div class="pk-face pk-back"><div class="pk-emblem">?</div><div class="pk-word">PACK</div></div>'
        +'<div class="pk-face pk-front"><div class="pk-glyph"></div><div class="pk-rarity"></div><div class="pk-mult"></div></div>'
        +'</div></div>';
    }
    row.innerHTML=h;
  }
  renderBacks();
  playBtn.onclick=function(){
    if(busy)return;
    var bet=getBet("packsBet");if(bet==null)return;
    charge(bet);
    flyChip(this,$("#packsStage"));
    sfx.click();busy=true;playBtn.disabled=true;
    renderBacks();
    var pulls=[rollRarity(),rollRarity(),rollRarity()];
    hint.textContent="Cracking the pack…";
    var cards=row.querySelectorAll(".pk-card");
    var mult=0;
    for(var i=0;i<3;i++)mult+=pulls[i].m;
    mult=mult/3;
    for(var k=0;k<3;k++){
      (function(idx){
        var step=function(){
          var r=pulls[idx],card=cards[idx];
          card.classList.add("flipped","r-"+r.n.toLowerCase());
          if(ngAnim()){
            card.classList.add("pk-holo");
            card.style.setProperty("--fan",((idx-1)*8)+"deg");
            card.classList.add("fanned");
          }
          card.querySelector(".pk-glyph").innerHTML=PK_GLYPH[r.n];
          card.querySelector(".pk-rarity").textContent=r.n;
          card.querySelector(".pk-mult").textContent=fmtMult(r.m);
          sfx.coin();
          if(idx===2)later(resolve,ngAnim()?450:0);
        };
        if(ngAnim())later(step,idx*380);else step();
      })(k);
    }
    function resolve(){
      var payout=settle("Packs",bet,mult);
      var w=mult>1;
      hist.unshift({t:fmtMult(mult),w:w});histChips($("#packsHist"),hist.slice(0,12));
      var best=pulls[0];for(var i=1;i<3;i++)if(pulls[i].m>best.m)best=pulls[i];
      if(w){
        stageFx(stage,"win");burstFX(stage,{});
        if(ngAnim()){var rays=document.createElement("div");rays.className="pk-rays";stage.appendChild(rays);later(function(){if(rays.parentNode)rays.parentNode.removeChild(rays);},1600);}
        winBanner(stage,"WON "+fmt$(payout));sfx.win();hint.textContent="Best pull: "+best.n+" "+fmtMult(best.m)+" — pack averaged "+fmtMult(mult)+".";
      }
      else{stageFx(stage,"lose");sfx.lose();hint.textContent="Pack averaged "+fmtMult(mult)+". Better luck next pack.";}
      busy=false;playBtn.disabled=false;
    }
  };
  addDust(stage,10);
};
/* ==================== NEWGAME: PRIMEDICE ==================== */
BUILDERS.primedice=function(mount){
  var $=function(s){return mount.querySelector(s)};
  var hist=[],timer=null;
  onCleanup(function(){if(timer)clearInterval(timer)});
  function chance(){return 100-parseInt($("#primediceTarget").value,10)}
  function mult(){return 98/chance()}
  var PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
  function dieHtml(v){var h='<div class="pd-die">';for(var i=0;i<9;i++)h+='<i class="'+(PIPS[v].indexOf(i)>=0?"on":"")+'"></i>';return h+'</div>'}
  function refreshStats(){
    var t=parseInt($("#primediceTarget").value,10);
    $("#primediceTLabel").textContent="Target: roll over "+t;
    $("#primediceFill").style.width=((100-t))+"%";
    $("#primediceStatChance").textContent=chance().toFixed(0)+"%";
    $("#primediceStatPay").textContent=fmtMult(mult());
    $("#primediceBigMult").textContent=fmtMult(mult());
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("primediceBet","10.00")
    +'<div class="field"><label>Target (5 – 95)</label>'
    +'<input type="range" class="pd-range" id="primediceTarget" min="5" max="95" step="1" value="50"></div>'
    +'<div class="stat-grid"><div class="stat-box"><small>Win chance</small><b id="primediceStatChance">50%</b></div>'
    +'<div class="stat-box"><small>Payout</small><b id="primediceStatPay">1.96&times;</b></div></div>'
    +'<button class="action-btn" id="primedicePlay" style="margin-top:16px">Roll Dice</button>'
    +'<div class="hist-row" id="primediceHist"></div></div>'
    +'<div class="stage" id="primediceStage">'+gameHeaderHtml('primedice')+'<div class="pd-rays"></div>'
    +'<div class="pd-wrap">'
    +'<div class="pd-multwrap"><div class="pd-multcap">Payout</div><div class="pd-bigmult" id="primediceBigMult">1.96&times;</div></div>'
    +'<div class="pd-shakerwrap">'
    +'<svg class="pd-cup" id="primediceShaker" viewBox="0 0 84 96"><path d="M14,96 L26,22 Q26,12 36,12 L48,12 Q58,12 58,22 L70,96 Z" fill="#2b1a10" stroke="#caa14f" stroke-width="2.5"/><ellipse cx="42" cy="14" rx="16" ry="5" fill="#1a0f08" stroke="#caa14f" stroke-width="2"/><path d="M26,34 Q42,26 58,34" stroke="#8a6a2f" stroke-width="2" fill="none"/><path d="M30,50 Q42,44 54,50" stroke="#8a6a2f" stroke-width="2" fill="none"/><rect x="20" y="88" width="44" height="6" rx="3" fill="#caa14f"/></svg>'
    +'<div class="pd-dice" id="primediceDice"></div>'
    +'</div>'
    +'<div class="pd-roll" id="primediceRoll">--.--</div>'
    +'<div class="pd-target" id="primediceTLabel">Target: roll over 50</div>'
    +'<div class="pd-slider"><div class="pd-fill" id="primediceFill" style="width:50%"></div><div class="pd-marker" id="primediceMarker" style="left:50%"></div></div>'
    +'<div class="pd-labels"><span>0</span><span>roll over &rarr;</span><span>100</span></div>'
    +'<div class="pd-msg" id="primediceMsg">Set a target and roll.</div>'
    +'</div></div></div>';
  wireAmount("primediceBet");
  $("#primediceTarget").addEventListener("input",refreshStats);
  $("#primediceDice").innerHTML=dieHtml(3)+dieHtml(4);
  refreshStats();
  $("#primedicePlay").addEventListener("click",function(){
    var bet=getBet("primediceBet");if(bet==null)return;
    charge(bet);flyChip(this,$("#primediceStage"));sfx.click();
    var t=parseInt($("#primediceTarget").value,10),m=mult();
    var final=Math.floor(Math.random()*10000)/100;
    var rollEl=$("#primediceRoll"),markEl=$("#primediceMarker"),stage=$("#primediceStage");
    rollEl.classList.remove("win","lose");
    function showRoll(r){rollEl.textContent=r.toFixed(2);markEl.style.left=r+"%"}
    function resolve(){
      if(timer){clearInterval(timer);timer=null}
      $("#primediceShaker").classList.remove("pd-shaking");
      markEl.style.left=final+"%";
      if(ngAnim()){countUp(rollEl,final,function(v){return v.toFixed(2)},250)}else{rollEl.textContent=final.toFixed(2)}
      var d1=1+Math.floor(final%6),d2=1+Math.floor((final*7)%6);
      $("#primediceDice").innerHTML=dieHtml(d1)+dieHtml(d2);
      var win=final>t,mul=win?m:0,payout=settle("Prime Dice",bet,mul);
      rollEl.classList.add(win?"win":"lose");
      hist.unshift({t:final.toFixed(2)+(win?" > ":" \u2264 ")+t,w:win});histChips($("#primediceHist"),hist.slice(0,12));
      $("#primediceMsg").textContent=win?"Rolled "+final.toFixed(2)+" over "+t+" — Won "+fmt$(payout):"Rolled "+final.toFixed(2)+" — under target "+t;
      if(win){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win();if(ngAnim()){stage.classList.add("rays-on");setTimeout(function(){stage.classList.remove("rays-on")},1500)}}
      else{stageFx(stage,"lose");sfx.lose()}
    }
    if(ngAnim()){
      var ticks=0;
      if(timer)clearInterval(timer);
      $("#primediceShaker").classList.add("pd-shaking");
      timer=setInterval(function(){
        showRoll(Math.floor(Math.random()*10000)/100);
        rollEl.classList.add("tick");setTimeout(function(){rollEl.classList.remove("tick")},120);
        if(++ticks>=10)resolve();
      },70);
    }else{resolve()}
  });
  addDust($("#primediceStage"),10);
};
/* ==================== NEWGAME: PUMP ==================== */
BUILDERS.pump=function(mount){
  var POP_P=0.16,STEP=0.15,MAXP=30;
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("pumpBet","10.00")
    +'<button class="action-btn" id="pumpPlay" style="margin-top:16px">Start Round</button>'
    +'<div class="pump-round-btns" id="pumpRoundBtns" style="display:none">'
    +'<button class="action-btn" id="pumpPump">Pump +0.15x</button>'
    +'<button class="action-btn" id="pumpCash" style="background:#2a6b3a">Cash Out</button></div>'
    +'<div class="pump-hint" style="margin-top:10px">Each pump adds <b style="color:#ffe9b0">+0.15x</b> to your multiplier.<br>The balloon can pop at any pump &mdash; cash out before it does.</div>'
    +'<div class="hist-row" id="pumpHist"></div></div>'
    +'<div class="stage" id="pumpStage">'+gameHeaderHtml('pump')
    +'<div class="pump-stage"><div class="pump-rays" id="pumpRays"></div><div class="pump-popflash" id="pumpFlash"></div>'
    +'<div class="pump-balloonrow">'
    +'<div class="pump-needlewrap"><svg class="pump-needle" id="pumpNeedleSvg" viewBox="0 0 60 130"><path d="M16 130 C12 102 18 82 16 62" stroke="#3a3a40" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="10" y="38" width="12" height="26" rx="5" fill="#8a6a2f" stroke="#ffd479" stroke-width="1.5"/><rect x="13.5" y="6" width="5" height="34" fill="#c9ccd6"/><path d="M16 6 L13.5 0 M16 6 L18.5 0" stroke="#c9ccd6" stroke-width="2.2" stroke-linecap="round"/></svg></div>'
    +'<div class="pump-scale" id="pumpScale"><svg class="pump-svg" id="pumpSvg" viewBox="0 0 120 170">'
    +'<defs><radialGradient id="pumpBalloonGrad" cx="38%" cy="30%" r="80%"><stop offset="0%" stop-color="#ff7a7a"/><stop offset="45%" stop-color="#d92b2b"/><stop offset="100%" stop-color="#7a1212"/></radialGradient></defs>'
    +'<path d="M60 158 C58 142 62 130 60 118" stroke="#8a6f74" stroke-width="2.5" fill="none"/>'
    +'<path d="M53 106 L67 106 L60 119 Z" fill="#a31f1f"/>'
    +'<ellipse cx="60" cy="58" rx="42" ry="50" fill="url(#pumpBalloonGrad)"/>'
    +'<ellipse cx="60" cy="58" rx="42" ry="50" fill="none" stroke="#5e0d0d" stroke-width="3"/>'
    +'<ellipse cx="45" cy="38" rx="10" ry="16" fill="#ffffff" opacity="0.30" transform="rotate(-18 45 38)"/>'
    +'<ellipse cx="77" cy="82" rx="5" ry="9" fill="#ffffff" opacity="0.14" transform="rotate(12 77 82)"/>'
    +'</svg></div>'
    +'</div>'
    +'<div class="pump-mult" id="pumpMult">1.00x</div>'
    +'<div class="pump-pumps" id="pumpCount">Press Start Round</div>'
    +'<div class="pump-gauge"><svg viewBox="0 0 120 74">'
    +'<path d="M12 62 A48 48 0 0 1 108 62" fill="none" stroke="#241a10" stroke-width="12" stroke-linecap="round"/>'
    +'<path d="M12 62 A48 48 0 0 1 36 20.4" fill="none" stroke="#00e065" stroke-width="7" stroke-linecap="round"/>'
    +'<path d="M36 20.4 A48 48 0 0 1 84 20.4" fill="none" stroke="#f5b942" stroke-width="7" stroke-linecap="round"/>'
    +'<path d="M84 20.4 A48 48 0 0 1 108 62" fill="none" stroke="#ff5c5c" stroke-width="7" stroke-linecap="round"/>'
    +'<line id="pumpNeedle" x1="60" y1="62" x2="60" y2="22" stroke="#ffd479" stroke-width="3" stroke-linecap="round"/>'
    +'<circle cx="60" cy="62" r="6" fill="#0d0708" stroke="#ffd479" stroke-width="2"/>'
    +'</svg><div class="pump-gauge-lbl">PRESSURE</div></div>'
    +'</div></div></div>';
  wireAmount("pumpBet");
  var stage=document.getElementById("pumpStage"),play=document.getElementById("pumpPlay"),
      pumpBtn=document.getElementById("pumpPump"),cashBtn=document.getElementById("pumpCash"),
      roundBtns=document.getElementById("pumpRoundBtns"),scale=document.getElementById("pumpScale"),
      svg=document.getElementById("pumpSvg"),multEl=document.getElementById("pumpMult"),
      countEl=document.getElementById("pumpCount"),needleSvg=document.getElementById("pumpNeedleSvg");
  var live=false,bet=0,n=0,popAt=1,hist=[];
  function mult(){return 1+STEP*n;}
  function pumpGaugeSet(p){
    var nd=document.getElementById("pumpNeedle");if(!nd)return;
    nd.style.transform="rotate("+(-90+Math.max(0,Math.min(p,1.1))*180).toFixed(1)+"deg)";
  }
  function pumpFlash(){
    if(!ngAnim())return;
    var f=document.getElementById("pumpFlash");if(!f)return;
    f.classList.remove("show");void f.offsetWidth;f.classList.add("show");
    setTimeout(function(){f.classList.remove("show");},650);
  }
  function pumpRays(){
    if(!ngAnim())return;
    var r=document.getElementById("pumpRays");if(!r)return;
    r.classList.remove("show");void r.offsetWidth;r.classList.add("show");
    setTimeout(function(){r.classList.remove("show");},1500);
  }
  function endUI(){
    live=false;play.style.display="";roundBtns.style.display="none";
  }
  function doPop(){
    endUI();
    settle("Pump",bet,0);
    hist.unshift({t:"POP",w:false});
    histChips(document.getElementById("pumpHist"),hist.slice(0,12));
    scale.classList.add("popped");
    pumpGaugeSet(1.1);
    pumpFlash();
    burstFX(stage,{colors:["#c22626","#ffd479","#ffffff"]});
    stageFx(stage,"lose");sfx.lose();
    multEl.textContent="POPPED";
    countEl.textContent="The balloon popped on pump "+n;
  }
  function doCash(auto){
    if(!live||n<1)return;
    var m=mult(),b=bet;
    endUI();
    var payout=settle("Pump",b,m);
    hist.unshift({t:fmtMult(m),w:true});
    histChips(document.getElementById("pumpHist"),hist.slice(0,12));
    stageFx(stage,"win");burstFX(stage,{});pumpRays();
    winBanner(stage,(auto?"MAX PUMPS — ":"")+"WON "+fmt$(payout));
    sfx.win();
    countEl.textContent="Cashed out at pump "+n;
  }
  onCleanup(function(){});
  play.addEventListener("click",function(){
    if(live)return;var b=getBet("pumpBet");if(b==null)return;
    bet=b;charge(bet);flyChip(play,stage);live=true;n=0;
    popAt=1+Math.floor(Math.log(1-Math.random())/Math.log(1-POP_P));
    sfx.click();
    play.style.display="none";roundBtns.style.display="flex";
    scale.classList.remove("popped");scale.style.transform="scale(1)";
    pumpGaugeSet(0);
    multEl.textContent="1.00x";countEl.textContent="0 pumps — pump it up!";
  });
  pumpBtn.addEventListener("click",function(){
    if(!live)return;sfx.click();
    n++;
    if(n>=popAt){doPop();return;}
    var m=mult();
    countUp(multEl,m,fmtMult,300);
    scale.style.transform="scale("+Math.min(1+n*0.055,2.6).toFixed(3)+")";
    svg.classList.remove("pumped");void svg.offsetWidth;svg.classList.add("pumped");
    if(needleSvg){needleSvg.classList.remove("jab");void needleSvg.offsetWidth;needleSvg.classList.add("jab");}
    pumpGaugeSet(n/MAXP);
    countEl.textContent=n+" pump"+(n>1?"s":"")+" — "+fmtMult(m);
    if(n>=MAXP){doCash(true);}
  });
  cashBtn.addEventListener("click",function(){doCash(false);});
  addDust(stage,10);
};
/* ==================== NEWGAME: RPS ==================== */
BUILDERS.rps=function(mount){
  var hist=[];
  var timers=[];
  function later(fn,ms){var t=setTimeout(fn,ms);timers.push(t);return t;}
  onCleanup(function(){for(var i=0;i<timers.length;i++)clearTimeout(timers[i]);});
  var SVG={
    rock:'<svg viewBox="0 0 64 64" fill="none" stroke="#ffd479" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 34v-6a5 5 0 0 1 10 0v-4a5 5 0 0 1 10 0v-3a5 5 0 0 1 10 0v-2a5 5 0 0 1 10 0v15"/><path d="M18 34v8a12 12 0 0 0 12 12h16a12 12 0 0 0 12-12v-8"/><path d="M28 30v12M38 27v15M48 25v17"/></svg>',
    paper:'<svg viewBox="0 0 64 64" fill="none" stroke="#ffd479" stroke-linecap="round"><g stroke-width="6"><path d="M27 42V18"/><path d="M34 42V12"/><path d="M41 42V16"/><path d="M48 42V26"/><path d="M24 48l-7-5"/></g><g stroke-width="3"><path d="M22 56v-10c0-8 6-14 14-14h2c8 0 14 6 14 14v10"/></g></svg>',
    scissors:'<svg viewBox="0 0 64 64" fill="none" stroke="#ffd479" stroke-linecap="round"><g stroke-width="6"><path d="M28 40L18 16"/><path d="M36 40l10-24"/></g><g stroke-width="3"><path d="M22 56v-8c0-8 6-14 14-14h2c8 0 14 6 14 14v8"/><path d="M44 46l6-2"/></g></svg>'
  };
  var NAMES={rock:"ROCK",paper:"PAPER",scissors:"SCISSORS"};
  function beats(a,b){return (a==="rock"&&b==="scissors")||(a==="paper"&&b==="rock")||(a==="scissors"&&b==="paper");}
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("rpsBet","10.00")
    +'<div style="margin-top:14px;color:#c9a86a;font-size:12px">Pick your throw — the dealer throws at the same time.</div>'
    +'<div class="hist-row" id="rpsHist"></div></div>'
    +'<div class="stage" id="rpsStage">'
    +gameHeaderHtml('rps')
    +'<div class="rps-arena" id="rpsArena">'
    +'<div class="rps-side"><div class="rps-tag">YOU</div><div class="rps-hand you" id="rpsYou">'+SVG.rock+'</div><div class="rps-ped"></div></div>'
    +'<div class="rps-vs">VS</div>'
    +'<div class="rps-side"><div class="rps-tag">DEALER</div><div class="rps-hand foe" id="rpsFoe">'+SVG.rock+'</div><div class="rps-ped"></div></div>'
    +'</div>'
    +'<div class="rps-picks" id="rpsPicks">'
    +'<button class="rps-pick" data-p="rock">'+SVG.rock+'<span>ROCK</span></button>'
    +'<button class="rps-pick" data-p="paper">'+SVG.paper+'<span>PAPER</span></button>'
    +'<button class="rps-pick" data-p="scissors">'+SVG.scissors+'<span>SCISSORS</span></button>'
    +'</div>'
    +'<div class="rps-result" id="rpsResult">Choose your throw to play.</div>'
    +'</div></div>';
  wireAmount("rpsBet");
  var stage=$("#rpsStage"),you=$("#rpsYou"),foe=$("#rpsFoe"),res=$("#rpsResult"),picks=$("#rpsPicks"),arena=$("#rpsArena");
  var busy=false;
  var btns=picks.querySelectorAll(".rps-pick");
  function setPicks(d){for(var i=0;i<btns.length;i++)btns[i].disabled=d;}
  for(var i=0;i<btns.length;i++){
    (function(btn){
      btn.onclick=function(){
        if(busy)return;
        var bet=getBet("rpsBet");if(bet==null)return;
        var youPick=btn.getAttribute("data-p");
        charge(bet);
        flyChip(this,$("#rpsStage"));
        sfx.click();busy=true;setPicks(true);
        you.classList.remove("winner");foe.classList.remove("winner");
        res.textContent="Throwing…";
        var foePick=["rock","paper","scissors"][Math.floor(Math.random()*3)];
        var doReveal=function(){
          you.innerHTML=SVG[youPick];foe.innerHTML=SVG[foePick];
          you.classList.remove("shaking");foe.classList.remove("shaking");
          var mult,label;
          if(youPick===foePick){mult=1;label="PUSH";}
          else if(beats(youPick,foePick)){mult=1.96;label="WIN";}
          else{mult=0;label="LOSS";}
          if(mult!==1&&ngAnim()){
            arena.classList.remove("rps-clash");void arena.offsetWidth;arena.classList.add("rps-clash");
            later(function(){arena.classList.remove("rps-clash");},550);
          }
          var payout=settle("Rock Paper Scissors",bet,mult);
          var w=mult>1;
          hist.unshift({t:label+" "+NAMES[youPick][0]+"/"+NAMES[foePick][0],w:w});
          histChips($("#rpsHist"),hist.slice(0,12));
          if(mult>1){
            you.classList.add("winner");
            res.textContent=NAMES[youPick]+" beats "+NAMES[foePick]+" — you win!";
            stageFx(stage,"win");burstFX(stage,{});
            if(ngAnim()){var rays=document.createElement("div");rays.className="rps-rays";stage.appendChild(rays);later(function(){if(rays.parentNode)rays.parentNode.removeChild(rays);},1600);}
            winBanner(stage,"WON "+fmt$(payout));sfx.win();
          }else if(mult===1){
            res.textContent="Both threw "+NAMES[youPick]+" — draw, stake back.";
            stageFx(stage,"shake");sfx.coin();
          }else{
            foe.classList.add("winner");
            res.textContent=NAMES[foePick]+" beats "+NAMES[youPick]+" — dealer wins.";
            stageFx(stage,"lose");sfx.lose();
          }
          busy=false;setPicks(false);
        };
        if(ngAnim()){
          you.classList.add("shaking");foe.classList.add("shaking");
          later(doReveal,780);
        }else{doReveal();}
      };
    })(btns[i]);
  }
  addDust(stage,10);
};
/* ==================== NEWGAME: SCARABSPIN ==================== */
BUILDERS.scarabspin=function(mount){
  var G="#ffd479";
  var SYM=[
    {k:"scarab",svg:'<svg viewBox="0 0 64 64"><circle cx="32" cy="9" r="5.5" fill="none" stroke="'+G+'" stroke-width="2.5"/><path d="M32 14 L32 17" stroke="'+G+'" stroke-width="2.5"/><ellipse cx="32" cy="24" rx="6" ry="6.5" fill="rgba(255,212,121,.25)" stroke="'+G+'" stroke-width="2.5"/><path d="M27 19 L23 14 M37 19 L41 14" stroke="'+G+'" stroke-width="2" stroke-linecap="round"/><ellipse cx="32" cy="42" rx="12" ry="14" fill="rgba(255,212,121,.12)" stroke="'+G+'" stroke-width="3"/><line x1="32" y1="30" x2="32" y2="56" stroke="'+G+'" stroke-width="2"/><path d="M22 34 L10 28 M21 42 L8 42 M22 50 L10 56 M42 34 L54 28 M43 42 L56 42 M42 50 L54 56" stroke="'+G+'" stroke-width="2.5" stroke-linecap="round"/></svg>'},
    {k:"ankh",svg:'<svg viewBox="0 0 64 64"><circle cx="32" cy="18" r="9" fill="none" stroke="'+G+'" stroke-width="3"/><line x1="32" y1="27" x2="32" y2="56" stroke="'+G+'" stroke-width="3" stroke-linecap="round"/><line x1="20" y1="36" x2="44" y2="36" stroke="'+G+'" stroke-width="3" stroke-linecap="round"/></svg>'},
    {k:"eye",svg:'<svg viewBox="0 0 64 64"><path d="M8 32 Q32 16 56 32 Q32 48 8 32 Z" fill="none" stroke="'+G+'" stroke-width="3"/><circle cx="32" cy="32" r="7" fill="none" stroke="'+G+'" stroke-width="3"/><path d="M6 22 Q32 10 58 22" fill="none" stroke="'+G+'" stroke-width="3" stroke-linecap="round"/><line x1="27" y1="43" x2="25" y2="54" stroke="'+G+'" stroke-width="3" stroke-linecap="round"/></svg>'},
    {k:"pyramid",svg:'<svg viewBox="0 0 64 64"><path d="M32 8 L56 52 L8 52 Z" fill="none" stroke="'+G+'" stroke-width="3" stroke-linejoin="round"/><line x1="32" y1="8" x2="32" y2="52" stroke="'+G+'" stroke-width="2"/><line x1="20" y1="30" x2="44" y2="30" stroke="'+G+'" stroke-width="2"/></svg>'},
    {k:"cobra",svg:'<svg viewBox="0 0 64 64"><path d="M32 56 C18 48 46 42 32 32 C24 26 24 18 32 12" fill="none" stroke="'+G+'" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="11" r="4.5" fill="none" stroke="'+G+'" stroke-width="2.5"/></svg>'},
    {k:"sun",svg:'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="10" fill="none" stroke="'+G+'" stroke-width="3"/><path d="M32 12 L32 18 M32 46 L32 52 M12 32 L18 32 M46 32 L52 32 M18 18 L22 22 M42 42 L46 46 M46 18 L42 22 M22 42 L18 46" stroke="'+G+'" stroke-width="2" stroke-linecap="round"/></svg>'}
  ];
  var P_SCARAB=0.11;
  function rndSym(){return 1+((Math.random()*5)|0);}
  function pay(n){if(n>=9)return 50;if(n>=3)return 10;if(n===2)return 1.5;return 0;}
  var cells="";
  for(var c=0;c<9;c++)cells+='<div class="scarab-cell" id="scarabC'+c+'">'+SYM[(c%5)+1].svg+'</div>';
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("scarabBet","10.00")
    +'<button class="action-btn" id="scarabPlay" style="margin-top:16px">Spin the Tomb</button>'
    +'<div class="hist-row" id="scarabHist"></div></div>'
    +'<div class="stage" id="scarabStage">'+gameHeaderHtml('scarabspin')
    +'<div class="scarab-tomb"><div class="scarab-rays" id="scarabRays"></div>'
    +'<div class="scarab-torch left"><div class="scarab-glow"></div><div class="scarab-flame"></div><div class="scarab-stick"></div></div>'
    +'<div class="scarab-torch right"><div class="scarab-glow"></div><div class="scarab-flame"></div><div class="scarab-stick"></div></div>'
    +'<div class="scarab-grid">'+cells+'</div>'
    +'<div class="scarab-info">Golden scarabs pay:<br><b>Full grid of scarabs &mdash; 50x</b> &nbsp;&middot;&nbsp; <b>3+ scarabs &mdash; 10x</b><br><b>A pair of scarabs &mdash; 1.5x</b></div>'
    +'</div></div></div>';
  wireAmount("scarabBet");
  var stage=document.getElementById("scarabStage"),play=document.getElementById("scarabPlay");
  var busy=false,pending=null,hist=[];
  function scarabRays(){
    if(!ngAnim())return;
    var r=document.getElementById("scarabRays");if(!r)return;
    r.classList.remove("show");void r.offsetWidth;r.classList.add("show");
    setTimeout(function(){r.classList.remove("show");},1500);
  }
  function resolve(){
    if(!pending)return;var p=pending;pending=null;busy=false;
    if(play){play.disabled=false;play.style.opacity="";}
    var payout=settle("Scarab Spin",p.bet,p.mult);
    hist.unshift({t:p.mult>0?fmtMult(p.mult):"0x",w:p.mult>1});
    histChips(document.getElementById("scarabHist"),hist.slice(0,12));
    if(p.mult>1){
      stageFx(stage,"win");burstFX(stage,{});scarabRays();
      for(var k=0;k<9;k++){
        var cell=document.getElementById("scarabC"+k);
        if(cell&&p.grid[k]===0)cell.classList.add("scarab-hit");
      }
      winBanner(stage,"WON "+fmt$(payout));
      if(p.mult>=10)sfx.big();else sfx.win();
    }else{stageFx(stage,"lose");sfx.lose();}
  }
  onCleanup(function(){if(pending){var t;for(t=0;t<pending.timers.length;t++)clearTimeout(pending.timers[t]);for(t=0;t<pending.ivs.length;t++)clearInterval(pending.ivs[t]);resolve();}});
  play.addEventListener("click",function(){
    if(busy)return;var bet=getBet("scarabBet");if(bet==null)return;
    busy=true;sfx.click();play.disabled=true;play.style.opacity=".5";charge(bet);
    flyChip(play,stage);
    var grid=[],n=0,k;
    for(k=0;k<9;k++){
      var cell=document.getElementById("scarabC"+k);
      if(cell)cell.classList.remove("scarab-hit");
      if(Math.random()<P_SCARAB){grid.push(0);n++;}else grid.push(rndSym());
    }
    var mult=pay(n);
    pending={bet:bet,mult:mult,grid:grid,timers:[],ivs:[]};
    if(ngAnim()){
      var order=[0,1,2,3,4,5,6,7,8].sort(function(){return Math.random()-0.5;});
      for(var q=0;q<9;q++){
        (function(idx,stopAt){
          var cell=document.getElementById("scarabC"+idx);
          var iv=setInterval(function(){cell.innerHTML=SYM[(Math.random()*6)|0].svg;},95);
          pending.ivs.push(iv);
          var tm=setTimeout(function(){
            clearInterval(iv);cell.innerHTML=SYM[grid[idx]].svg;
            if(stopAt===8)resolve();
          },650+stopAt*170);
          pending.timers.push(tm);
        })(order[q],q);
      }
    }else{
      for(var s=0;s<9;s++)document.getElementById("scarabC"+s).innerHTML=SYM[grid[s]].svg;
      resolve();
    }
  });
  addDust(stage,10);
};
/* ==================== NEWGAME: SLIDE ==================== */
BUILDERS.slide=function(mount){
  var hist=[], busy=false, timers=[];
  // [lo,hi,mult] — symmetric shuffleboard, landing = clamp(N(50,22))
  var SEGS=[[0,26.7,0],[26.7,40.73,0.5],[40.73,46.28,1],[46.28,48.94,2],[48.94,51.06,5],
            [51.06,53.72,2],[53.72,59.27,1],[59.27,73.3,0.5],[73.3,100,0]];
  var ZCLS={0:"z0",0.5:"z05",1:"z1",2:"z2",5:"z5"};
  var target=2;
  function randn(){ var u=0,v=0; while(!u)u=Math.random(); while(!v)v=Math.random();
    return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
  var segsHtml=SEGS.map(function(s){
    return '<div class="slide-seg '+ZCLS[s[2]]+'" data-m="'+s[2]+'" style="width:'+(s[1]-s[0])+'%">'+(s[2]||"0")+'×</div>';
  }).join("");
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("slideBet","10.00")
    +'<div class="field"><label>Target zone <b style="color:#ffd479">— land in it, payout ×2</b></label>'
    +'<div class="seg" id="slideTg">'
    +'<button data-t="0.5">0.5×</button><button data-t="1">1×</button>'
    +'<button data-t="2" class="on">2×</button><button data-t="5">5×</button></div></div>'
    +'<div class="slide-note">The puck slides with real friction physics. Every target is fairly priced at 96% — pick your volatility: charge the thin 5× sliver for glory, or the wide 0.5× pads for safety.</div>'
    +'<button class="action-btn" id="slidePlay" style="margin-top:16px">Slide the Puck</button>'
    +'<div class="hist-row" id="slideHist"></div></div>'
    +'<div class="stage" id="slideStage">'+gameHeaderHtml('slide')
    +'<div class="slide-scene" id="slideScene">'
    +'<div class="slide-track" id="slideTrack">'+segsHtml+'</div>'
    +'<div class="slide-puck" id="slidePuck" style="left:0%"></div></div>'
    +'<div class="slide-marks"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>'
    +'<div class="slide-result" id="slideResult">Charge a zone and slide the puck</div>'
    +'</div></div>';
  wireAmount("slideBet");
  var raf=null;
  onCleanup(function(){ if(raf) cancelAnimationFrame(raf); timers.forEach(clearTimeout); timers=[]; });
  function paintCharged(){
    var divs=$("#slideTrack").children;
    for(var i=0;i<divs.length;i++){
      var m=+divs[i].getAttribute("data-m");
      divs[i].classList.toggle("charged", m===target);
    }
  }
  function winRays(stage){
    if(!ngAnim()) return;
    var r=document.createElement("div"); r.className="slide-rays"; stage.appendChild(r);
    timers.push(setTimeout(function(){ if(r.parentNode) r.parentNode.removeChild(r); },2400));
  }
  $("#slideTg").addEventListener("click",function(e){
    var b=e.target.closest("button"); if(!b||busy) return;
    target=+b.getAttribute("data-t"); sfx.click();
    var bs=$("#slideTg").children;
    for(var i=0;i<bs.length;i++) bs[i].classList.toggle("on",+bs[i].getAttribute("data-t")===target);
    paintCharged();
  });
  paintCharged();
  $("#slidePlay").addEventListener("click",function(){
    if(busy) return;
    var bet=getBet("slideBet"); if(bet==null) return;
    busy=true; charge(bet); flyChip(this,$("#slideStage")); sfx.click();
    var stage=$("#slideStage"), puck=$("#slidePuck"), out=$("#slideResult"), scene=$("#slideScene");
    puck.classList.remove("slide-settle");
    scene.querySelectorAll(".slide-trail").forEach(function(t){ t.remove(); });
    var L=Math.max(0,Math.min(100, 50+randn()*22));
    var seg=SEGS[SEGS.length-1];
    for(var i=0;i<SEGS.length;i++){ if(L>=SEGS[i][0]&&L<SEGS[i][1]){ seg=SEGS[i]; break; } }
    var baseM=seg[2], charged=(baseM===target), mult=charged? baseM*2 : baseM;
    out.textContent="Sliding…";
    function finish(){
      busy=false;
      puck.classList.add("slide-settle");
      var payout=settle("Slide",bet,mult);
      var label=(charged? baseM+"× ×2 TARGET!" : baseM+"×");
      if(mult>1){ stageFx(stage,"win"); burstFX(stage,{}); winRays(stage); winBanner(stage,"WON "+fmt$(payout)); sfx.win();
        out.innerHTML="Puck stopped in the <b>"+baseM+"×</b> zone"+(charged?" — <b>target charged, payout doubled!</b>":""); }
      else if(mult===1){ stageFx(stage,"shake");
        out.innerHTML="Puck stopped in the <b>1×</b> zone — stake back."; }
      else{ stageFx(stage,"lose"); sfx.lose();
        out.innerHTML="Puck stopped in the <b>"+baseM+"×</b> zone — no win."; }
      hist.unshift({t:label,w:mult>1});
      histChips($("#slideHist"),hist.slice(0,12));
    }
    if(!ngAnim()){ puck.style.left=L+"%"; finish(); return; }
    var dur=1600, t0=null, lastTr=0;
    function draw(now){
      if(t0==null) t0=now;
      var p=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-p,3); // friction: fast start, long glide
      puck.style.left=(L*e)+"%";
      if(now-lastTr>80){
        lastTr=now;
        var tr=document.createElement("div"); tr.className="slide-trail"; tr.style.left=(L*e)+"%";
        scene.appendChild(tr);
        timers.push(setTimeout(function(){ if(tr.parentNode) tr.parentNode.removeChild(tr); },650));
      }
      if(p<1){ raf=requestAnimationFrame(draw); } else { raf=null; finish(); }
    }
    puck.style.left="0%";
    raf=requestAnimationFrame(draw);
  });
  addDust($("#slideStage"),10);
};
/* ==================== NEWGAME: SNAKES ==================== */
BUILDERS.snakes=function(mount){
  var hist=[];
  var appleVals=[1.18,1.24,1.30,1.38,1.48];
  var N=7;
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("snakesBet","10.00")
    +'<div class="field"><label>Apples to collect</label><div class="seg" id="snakesSeg">'
    +[1,2,3,4,5].map(function(k){return '<button data-v="'+k+'"'+(k===3?' class="on"':'')+'>'+k+'</button>';}).join('')
    +'</div></div>'
    +'<div class="stat-grid"><div class="stat-box"><small>Apples</small><b id="snakesApples">0/3</b></div>'
    +'<div class="stat-box"><small>Multiplier</small><b id="snakesMult">1.00×</b></div>'
    +'<div class="stat-box"><small>Potential</small><b id="snakesPot">$0.00</b></div></div>'
    +'<button class="action-btn" id="snakesPlay" style="margin-top:16px">Start Run</button>'
    +'<button class="action-btn" id="snakesCash" style="margin-top:8px;display:none">Cash Out</button>'
    +'<div class="hist-row" id="snakesHist"></div></div>'
    +'<div class="stage" id="snakesStage">'+gameHeaderHtml('snakes')
    +'<div class="sn-arena"><div class="sn-grid" id="snakesGrid"></div></div>'
    +'<p class="sn-hint" id="snakesHint">The snake hunts apples on its own — each apple multiplies your payout. Cash out before it crashes!</p>'
    +'</div></div>';
  wireAmount("snakesBet");
  var stage=$("#snakesStage"),grid=$("#snakesGrid"),hint=$("#snakesHint"),
      playBtn=$("#snakesPlay"),cashBtn=$("#snakesCash"),
      applesEl=$("#snakesApples"),multEl=$("#snakesMult"),potEl=$("#snakesPot"),histEl=$("#snakesHist");
  var target=3;
  $("#snakesSeg").addEventListener("click",function(e){
    var b=e.target.closest("button");if(!b||live)return;
    var btns=this.querySelectorAll("button");
    btns.forEach(function(x){x.classList.remove("on");});
    b.classList.add("on");target=+b.dataset.v;sfx.click();
    applesEl.textContent="0/"+target;
  });
  var snake=[],apple=null,appleVal=1,eaten=0,mult=1,bet=0,live=false,timer=null;
  function cellAt(x,y){return grid.children[y*N+x];}
  function buildGrid(){
    var h='';
    for(var i=0;i<N*N;i++)h+='<div class="sn-cell"></div>';
    grid.innerHTML=h;
  }
  function draw(){
    var i,c,keep=null;
    for(i=0;i<N*N;i++){c=grid.children[i];if(c.classList.contains("sn-eat"))keep=c;c.className="sn-cell";c.removeAttribute("data-av");}
    snake.forEach(function(s,ix){cellAt(s.x,s.y).classList.add(ix===0?"sn-head":ix===1?"sn-neck":"sn-body");});
    if(apple){var ac=cellAt(apple.x,apple.y);ac.classList.add("sn-apple");ac.dataset.av=fmtMult(appleVal);}
    if(keep)keep.classList.add("sn-eat");
  }
  function freeSpot(){
    var free=[];
    for(var y=0;y<N;y++)for(var x=0;x<N;x++){
      var on=false;
      for(var i=0;i<snake.length;i++)if(snake[i].x===x&&snake[i].y===y){on=true;break;}
      if(!on)free.push({x:x,y:y});
    }
    return free;
  }
  function placeApple(){
    var f=freeSpot();
    apple=f.length?f[Math.floor(Math.random()*f.length)]:null;
    appleVal=appleVals[Math.min(eaten,appleVals.length-1)];
  }
  function updateStats(){applesEl.textContent=eaten+"/"+target;multEl.textContent=fmtMult(mult);potEl.textContent=fmt$(bet*mult);}
  function pushHist(t,w){hist.unshift({t:t,w:w});histChips(histEl,hist.slice(0,12));}
  function winRays(){
    if(!ngAnim())return;
    var r=document.createElement("div");r.className="sn-rays";
    stage.appendChild(r);
    var t=setTimeout(function(){if(r.parentNode)r.parentNode.removeChild(r);},1600);
    onCleanup(function(){clearTimeout(t);if(r.parentNode)r.parentNode.removeChild(r);});
  }
  function endRun(){
    live=false;
    if(timer){clearInterval(timer);timer=null;}
    playBtn.disabled=false;playBtn.textContent="Start Run";cashBtn.style.display="none";
  }
  function finishWin(){
    var payout=settle("Snakes",bet,mult);
    winRays();
    stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.big();
    pushHist(fmtMult(mult),true);
    hint.textContent="Target reached! "+eaten+" apple"+(eaten===1?"":"s")+" for "+fmtMult(mult)+".";
    endRound();
  }
  function endRound(){endRun();}
  function bust(){
    settle("Snakes",bet,0);
    stageFx(stage,"lose");sfx.lose();
    if(snake.length)cellAt(snake[0].x,snake[0].y).classList.add("sn-dead");
    pushHist("CRASH",false);
    hint.textContent="The snake crashed after "+eaten+" apple"+(eaten===1?"":"s")+"!";
    endRun();
  }
  function step(){
    if(!live)return;
    if(!apple){finishWin();return;}
    var head=snake[0];
    var dirs=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
    function safe(d){
      var nx=head.x+d.x,ny=head.y+d.y;
      if(nx<0||ny<0||nx>=N||ny>=N)return false;
      for(var i=0;i<snake.length-1;i++)if(snake[i].x===nx&&snake[i].y===ny)return false;
      return true;
    }
    var best=null,bd=1e9;
    for(var i=0;i<4;i++){
      var d=dirs[i];if(!safe(d))continue;
      var dist=Math.abs(head.x+d.x-apple.x)+Math.abs(head.y+d.y-apple.y);
      if(dist<bd){bd=dist;best=d;}
    }
    if(!best){bust();return;}
    var nh={x:head.x+best.x,y:head.y+best.y};
    snake.unshift(nh);
    if(nh.x===apple.x&&nh.y===apple.y){
      var v=appleVals[Math.min(eaten,appleVals.length-1)];
      eaten++;mult=mult*v;sfx.coin();updateStats();
      var hc=cellAt(nh.x,nh.y);
      if(ngAnim()){hc.classList.add("sn-eat");setTimeout(function(){hc.classList.remove("sn-eat");},320);}
      if(eaten>=target){draw();finishWin();return;}
      placeApple();
    }else{
      snake.pop();
    }
    draw();
  }
  playBtn.onclick=function(){
    if(live)return;
    var b=getBet("snakesBet");if(b==null)return;
    bet=b;charge(bet);flyChip(this,$("#snakesStage"));
    snake=[{x:3,y:3},{x:2,y:3}];eaten=0;mult=1;live=true;
    buildGrid();placeApple();draw();updateStats();
    playBtn.disabled=true;playBtn.textContent="Running...";cashBtn.style.display="";
    hint.textContent="Eat "+target+" apple"+(target>1?"s":"")+" — cash out before you crash!";
    sfx.click();
    timer=setInterval(step,420);
    onCleanup(function(){if(timer)clearInterval(timer);});
  };
  cashBtn.onclick=function(){
    if(!live)return;
    var m=mult,payout=settle("Snakes",bet,m);
    if(m>1){
      winRays();
      stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win();
      pushHist("CASH "+fmtMult(m),true);
    }else{
      stageFx(stage,"shake");sfx.click();
      pushHist("PUSH",false);
    }
    hint.textContent="Cashed out with "+eaten+" apple"+(eaten===1?"":"s")+" at "+fmtMult(m)+".";
    endRun();
  };
  buildGrid();draw();updateStats();
  addDust($("#snakesStage"),10);
};
/* ==================== NEWGAME: TAROT ==================== */
BUILDERS.tarot=function(mount){
  var hist=[];
  var timers=[];
  function later(fn,ms){var t=setTimeout(fn,ms);timers.push(t);return t;}
  onCleanup(function(){for(var i=0;i<timers.length;i++)clearTimeout(timers[i]);});
  // 12-card original deck: name, multiplier, glyph. Tower = 0x bust.
  var DECK=[
    {n:"The Fool",m:0.5,g:"◌"},{n:"The Magician",m:0.6,g:"✧"},
    {n:"The Star",m:0.75,g:"✶"},{n:"The Moon",m:0.85,g:"☽"},
    {n:"The Sun",m:0.95,g:"☀"},{n:"Justice",m:1.05,g:"⚖"},
    {n:"Strength",m:1.15,g:"♌"},{n:"The Chariot",m:1.25,g:"➶"},
    {n:"The Emperor",m:1.45,g:"♔"},{n:"The Empress",m:1.6,g:"♛"},
    {n:"The World",m:2.0,g:"⊕"},{n:"The Tower",m:0,g:"⚡"}
  ];
  var TR_GLYPH={
    "The Fool":'<svg viewBox="0 0 40 40" fill="none" stroke="#ffd479" stroke-width="3" stroke-linecap="round"><circle cx="20" cy="20" r="12" stroke-dasharray="62 14"/></svg>',
    "The Magician":'<svg viewBox="0 0 40 40" fill="none" stroke="#ffd479" stroke-width="2.5" stroke-linejoin="round"><path d="M20 4l2.6 13.4L36 20l-13.4 2.6L20 36l-2.6-13.4L4 20l13.4-2.6z"/></svg>',
    "The Star":'<svg viewBox="0 0 40 40" stroke="#ffd479" stroke-width="2.5" stroke-linecap="round"><path d="M20 5v30M5 20h30M9.4 9.4l21.2 21.2M30.6 9.4L9.4 30.6"/></svg>',
    "The Moon":'<svg viewBox="0 0 40 40" fill="none" stroke="#ffd479" stroke-width="3" stroke-linecap="round"><path d="M27 5a15 15 0 1 0 9 26A17 17 0 0 1 27 5z"/></svg>',
    "The Sun":'<svg viewBox="0 0 40 40" fill="none" stroke="#ffd479" stroke-width="2.5" stroke-linecap="round"><circle cx="20" cy="20" r="8"/><path d="M20 4v5M20 31v5M4 20h5M31 20h5M8.7 8.7l3.5 3.5M27.8 27.8l3.5 3.5M31.3 8.7l-3.5 3.5M12.2 27.8l-3.5 3.5"/></svg>',
    "Justice":'<svg viewBox="0 0 40 40" fill="none" stroke="#ffd479" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6v28M12 34h16M8 12h24"/><path d="M8 12l-5 9h10z"/><path d="M32 12l-5 9h10z"/></svg>',
    "Strength":'<svg viewBox="0 0 40 40" fill="none" stroke="#ffd479" stroke-width="2.2" stroke-linejoin="round"><path d="M20 4l3 4 5 1 1 5 4 3-2 4 2 4-4 3-1 5-5 1-3 4-3-4-5-1-1-5-4-3 2-4-2-4 4-3 1-5 5-1z"/><circle cx="20" cy="20" r="7"/><circle cx="17.5" cy="19" r="1" fill="#ffd479" stroke="none"/><circle cx="22.5" cy="19" r="1" fill="#ffd479" stroke="none"/><path d="M18 23l2 2 2-2" stroke-linecap="round"/></svg>',
    "The Chariot":'<svg viewBox="0 0 40 40" fill="none" stroke="#ffd479" stroke-width="2.5"><circle cx="20" cy="20" r="14"/><circle cx="20" cy="20" r="3"/><path d="M20 6v28M6 20h28M10 10l20 20M30 10L10 30"/></svg>',
    "The Emperor":'<svg viewBox="0 0 40 40" fill="none" stroke="#ffd479" stroke-width="2.5" stroke-linejoin="round"><path d="M8 30l-2-16 8 5 6-11 6 11 8-5-2 16z"/><path d="M8 34h24"/><circle cx="20" cy="24" r="2" fill="#ffd479" stroke="none"/></svg>',
    "The Empress":'<svg viewBox="0 0 40 40" fill="none" stroke="#ffd479" stroke-width="2.5" stroke-linecap="round"><path d="M8 28c0-8 5-12 12-12s12 4 12 12"/><path d="M8 32h24"/><path d="M20 16V9M17 12l3-3 3 3"/></svg>',
    "The World":'<svg viewBox="0 0 40 40" fill="none" stroke="#ffd479" stroke-width="2.5"><circle cx="20" cy="20" r="14"/><path d="M20 6v28M6 20h28"/></svg>',
    "The Tower":'<svg viewBox="0 0 40 40" fill="none" stroke="#ff7070" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><path d="M14 34V12h-4V7h4V4h4v3h4V4h4v3h4v5h-4v22z"/><path d="M31 4l-7 9 4 3-5 7"/></svg>'
  };
  var TR_MOON='<svg viewBox="0 0 40 40" fill="none" stroke="#ffd479" stroke-width="3" stroke-linecap="round"><path d="M27 5a15 15 0 1 0 9 26A17 17 0 0 1 27 5z"/></svg>';
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("tarotBet","10.00")
    +'<button class="action-btn" id="tarotPlay" style="margin-top:16px">Draw 3 Cards</button>'
    +'<div class="hist-row" id="tarotHist"></div></div>'
    +'<div class="stage" id="tarotStage">'
    +gameHeaderHtml('tarot')
    +'<div class="tr-moonbg"></div>'
    +'<div class="tr-row" id="tarotRow"></div>'
    +'<div class="tr-stats"><div class="tr-stat"><small>RUNNING PRODUCT</small><b id="tarotProd">—</b></div><div class="tr-stat"><small>PAYOUT (CAP 25×)</small><b id="tarotPay">—</b></div></div>'
    +'<div class="tr-hint" id="tarotHint">Draw three arcana. Payout = product of their powers, capped at 25×. The Tower destroys everything.</div>'
    +'</div></div>';
  wireAmount("tarotBet");
  var stage=$("#tarotStage"),row=$("#tarotRow"),hint=$("#tarotHint"),
      prodEl=$("#tarotProd"),payEl=$("#tarotPay"),playBtn=$("#tarotPlay");
  var busy=false;
  function renderBacks(){
    var h="";
    for(var i=0;i<3;i++){
      h+='<div class="tr-card"><div class="tr-inner">'
        +'<div class="tr-face tr-back"><div class="tr-moon">'+TR_MOON+'</div><div class="tr-word">ARCANA</div></div>'
        +'<div class="tr-face tr-front"><div class="tr-numeral"></div><div class="tr-glyph"></div><div class="tr-name"></div><div class="tr-cmult"></div></div>'
        +'</div></div>';
    }
    row.innerHTML=h;
  }
  renderBacks();
  playBtn.onclick=function(){
    if(busy)return;
    var bet=getBet("tarotBet");if(bet==null)return;
    charge(bet);
    flyChip(this,$("#tarotStage"));
    sfx.click();busy=true;playBtn.disabled=true;
    renderBacks();
    prodEl.textContent="—";payEl.textContent="—";
    var drawn=shuffle(DECK).slice(0,3);
    hint.textContent="The cards are drawn…";
    var cards=row.querySelectorAll(".tr-card");
    var running=1,towerHit=false,revealed=0;
    for(var k=0;k<3;k++){
      (function(idx){
        var step=function(){
          var c=drawn[idx],card=cards[idx];
          card.classList.add("flipped");
          if(ngAnim()){
            card.classList.add("tr-holo");
            card.style.setProperty("--fan",((idx-1)*9)+"deg");
            card.classList.add("fanned");
          }
          if(c.m===0)card.classList.add("is-tower");
          if(c.m>=1.45)card.classList.add("is-gold");
          card.querySelector(".tr-numeral").textContent="ARCANUM "+(idx+1);
          card.querySelector(".tr-glyph").innerHTML=TR_GLYPH[c.n];
          card.querySelector(".tr-name").textContent=c.n.toUpperCase();
          card.querySelector(".tr-cmult").textContent=(c.m===0?"0×":fmtMult(c.m));
          sfx.coin();
          if(c.m===0)towerHit=true;else running*=c.m;
          revealed++;
          countUp(prodEl,towerHit?0:running,function(v){return v===0?"0×":fmtMult(v);},300);
          if(towerHit)hint.textContent="The Tower has fallen — all is lost.";
          if(revealed===3)later(resolve,ngAnim()?500:0);
        };
        if(ngAnim())later(step,idx*420);else step();
      })(k);
    }
    function resolve(){
      var mult=towerHit?0:Math.min(running,25);
      var payout=settle("Tarot",bet,mult);
      countUp(payEl,mult,function(v){return v===0?"0×":fmtMult(v);},400);
      var w=mult>1;
      hist.unshift({t:(mult===0?"TOWER":fmtMult(mult)),w:w});histChips($("#tarotHist"),hist.slice(0,12));
      if(towerHit){
        stageFx(stage,"shake");sfx.lose();
        hint.textContent="The Tower (0×) — the reading is void. Your stake is gone.";
      }else if(w){
        stageFx(stage,"win");burstFX(stage,{});
        if(ngAnim()){var rays=document.createElement("div");rays.className="tr-rays";stage.appendChild(rays);later(function(){if(rays.parentNode)rays.parentNode.removeChild(rays);},1600);}
        if(mult>=10)sfx.big();else sfx.win();
        winBanner(stage,"WON "+fmt$(payout));
        hint.textContent="The arcana align: "+drawn.map(function(c){return c.n;}).join(" · ")+" = "+fmtMult(mult)+".";
      }else{
        stageFx(stage,"lose");sfx.lose();
        hint.textContent="A weak reading — "+fmtMult(mult)+" returned.";
      }
      busy=false;playBtn.disabled=false;
    }
  };
  addDust(stage,10);
};
/* ==================== NEWGAME: TOMELIFE ==================== */
BUILDERS.tomelife=function(mount){
  var hist=[];
  var timers=[];
  function later(fn,ms){var t=setTimeout(fn,ms);timers.push(t);return t;}
  onCleanup(function(){for(var i=0;i<timers.length;i++)clearTimeout(timers[i]);});
  var MULTS=[0,0.4,0.8,1.4,2.2];
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  var TL_EMBLEM='<svg class="tl-emblem" viewBox="0 0 48 48" fill="none" stroke="#caa14f" stroke-width="2"><circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="10" opacity=".6"/><path d="M24 8v6M24 34v6M8 24h6M34 24h6" opacity=".8"/><circle cx="24" cy="24" r="3" fill="#caa14f" stroke="none"/></svg>';
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("tomelifeBet","10.00")
    +'<button class="action-btn" id="tomelifePlay" style="margin-top:16px">Open the Tomes</button>'
    +'<div class="hist-row" id="tomelifeHist"></div></div>'
    +'<div class="stage" id="tomelifeStage">'
    +gameHeaderHtml('tomelife')
    +'<div class="tl-row" id="tomelifeRow"></div>'
    +'<div class="tl-hint" id="tomelifeHint">Place your bet, then choose one of the five sealed tomes.</div>'
    +'</div></div>';
  wireAmount("tomelifeBet");
  var stage=$("#tomelifeStage"),row=$("#tomelifeRow"),hint=$("#tomelifeHint"),playBtn=$("#tomelifePlay");
  var active=false,order=[],bet=0,picked=-1;
  function tomeHtml(i,sealed,armed){
    var cls="tl-tome"+(sealed?"":" open")+(armed?" armed":"");
    var dis=sealed?"":"disabled";
    return '<button class="'+cls+'" data-i="'+i+'" '+dis+'>'
      +'<span class="tl-spine"></span>'
      +'<span class="tl-cover">'+TL_EMBLEM+'<span class="tl-seal">?</span><span class="tl-cname">SEALED</span></span>'
      +'<span class="tl-face"><span class="tl-mult"></span><span class="tl-cname"></span></span>'
      +'</button>';
  }
  function renderIdle(){
    var h="";
    for(var i=0;i<5;i++)h+=tomeHtml(i,true,false);
    row.innerHTML=h;
  }
  renderIdle();
  function label(m){return m===0?"VOID":fmtMult(m);}
  playBtn.onclick=function(){
    if(active)return;
    var b=getBet("tomelifeBet");if(b==null)return;
    bet=b;charge(bet);
    flyChip(this,$("#tomelifeStage"));
    sfx.click();
    active=true;picked=-1;
    order=shuffle(MULTS);
    var h="";
    for(var i=0;i<5;i++)h+=tomeHtml(i,true,true);
    row.innerHTML=h;
    hint.textContent="The tomes are sealed. Choose one…";
    playBtn.disabled=true;
    var tomes=row.querySelectorAll(".tl-tome");
    for(var k=0;k<tomes.length;k++){
      (function(btn,idx){
        btn.onclick=function(){
          if(!active)return;
          active=false;picked=idx;
          sfx.click();
          var all=row.querySelectorAll(".tl-tome");
          for(var q=0;q<all.length;q++)all[q].disabled=true;
          btn.classList.remove("armed");
          btn.classList.add("picked");
          hint.textContent="Revealing your fate…";
          var revealDelay=ngAnim()?650:0;
          later(function(){
            for(var r=0;r<all.length;r++){
              (function(el,ri){
                var m=order[ri];
                var show=function(){
                  el.classList.add("open");
                  if(ri!==picked)el.classList.add("dim");
                  el.querySelector(".tl-mult").textContent=(m===0?"0×":fmtMult(m));
                  el.querySelector(".tl-cname").textContent=(m===0?"VOID":"TOME");
                  if(m===0)el.classList.add("is-void");
                };
                if(ngAnim()&&ri!==picked)later(show,ri*130);else show();
              })(all[r],r);
            }
            later(resolve,ngAnim()?700:0);
          },revealDelay);
        };
      })(tomes[k],k);
    }
  };
  function resolve(){
    var m=order[picked];
    var payout=settle("Tome of Life",bet,m);
    var w=m>1;
    hist.unshift({t:label(m),w:w});histChips($("#tomelifeHist"),hist.slice(0,12));
    if(w){
      stageFx(stage,"win");burstFX(stage,{});
      if(ngAnim()){var rays=document.createElement("div");rays.className="tl-rays";stage.appendChild(rays);later(function(){if(rays.parentNode)rays.parentNode.removeChild(rays);},1600);}
      winBanner(stage,"WON "+fmt$(payout));sfx.win();
    }
    else if(m===0){stageFx(stage,"lose");sfx.lose();hint.textContent="The void stares back. The tome was empty.";}
    else{stageFx(stage,"lose");sfx.lose();hint.textContent="A lesser tome — "+fmtMult(m)+" returned.";}
    if(w)hint.textContent="Fortune smiles! Your tome held "+fmtMult(m)+".";
    playBtn.disabled=false;
  }
  addDust(stage,10);
};
/* ==================== NEWGAME: VIDEOPOKER ==================== */
BUILDERS.videopoker=function(mount){
  var $=function(s){return mount.querySelector(s)};
  var SUITS=["\u2660","\u2665","\u2666","\u2663"],RANKS=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  function newDeck(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({r:RANKS[r],s:SUITS[s],v:r+2,red:(s===1||s===2)});for(var i=d.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=d[i];d[i]=d[j];d[j]=t}return d}
  function evalHand(h){
    var vals=h.map(function(c){return c.v}).sort(function(a,b){return a-b});
    var su=h.map(function(c){return c.s});
    var flush=su.every(function(x){return x===su[0]});
    var uniq=vals.filter(function(v,i){return vals.indexOf(v)===i});
    var straight=false;
    if(uniq.length===5&&(vals[4]-vals[0]===4||vals.join()==="2,3,4,5,14"))straight=true;
    var counts={};vals.forEach(function(v){counts[v]=(counts[v]||0)+1});
    var cs=Object.keys(counts).map(function(k){return counts[k]}).sort(function(a,b){return b-a});
    if(flush&&straight&&vals[0]===10)return["ROYAL FLUSH",800];
    if(flush&&straight)return["STRAIGHT FLUSH",50];
    if(cs[0]===4)return["FOUR OF A KIND",25];
    if(cs[0]===3&&cs[1]===2)return["FULL HOUSE",9];
    if(flush)return["FLUSH",6];
    if(straight)return["STRAIGHT",4];
    if(cs[0]===3)return["THREE OF A KIND",3];
    if(cs[0]===2&&cs[1]===2)return["TWO PAIR",2];
    if(cs[0]===2){var pv=parseInt(Object.keys(counts).filter(function(k){return counts[k]===2})[0],10);if(pv>=11)return["JACKS OR BETTER",1]}
    return["NO WIN",0];
  }
  var hist=[],deck=[],hand=[],held=[],bet0=0,dealt=false;
  function render(anim){
    var htm="";
    for(var i=0;i<5;i++){
      var c=hand[i];
      htm+='<div class="vp-card'+(c.red?" red":"")+(held[i]?" held":"")+(anim&&ngAnim()?" vp-card-in":"")+'"'+(anim&&ngAnim()?' style="animation-delay:'+(i*120)+'ms"':"")+' data-i="'+i+'"><div class="rk">'+c.r+'</div><div class="st">'+c.s+'</div></div>';
    }
    $("#videopokerHand").innerHTML=htm;
    var cards=$("#videopokerHand").querySelectorAll(".vp-card");
    for(var k=0;k<cards.length;k++){cards[k].addEventListener("click",function(){
      if(!dealt)return;var i=parseInt(this.getAttribute("data-i"),10);
      held[i]=!held[i];this.classList.toggle("held");sfx.click();
    })}
  }
  function clearPayHits(){var rows=$("#videopokerPay").querySelectorAll(".vp-prow");for(var r=0;r<rows.length;r++)rows[r].classList.remove("vp-hit")}
  function finish(){
    dealt=false;
    var res=evalHand(hand),label=res[0],mult=res[1];
    render(false);
    var stage=$("#videopokerStage"),payout=settle("Video Poker",bet0,mult);
    hist.unshift({t:label+" "+(mult>0?mult+"x":""),w:mult>1});histChips($("#videopokerHist"),hist.slice(0,12));
    var rows=$("#videopokerPay").querySelectorAll(".vp-prow");
    for(var r=0;r<rows.length;r++){
      var hit=mult>0&&rows[r].getAttribute("data-hand")===label;
      rows[r].classList.toggle("vp-hit",hit);
      if(hit&&ngAnim())countUp(rows[r].querySelector(".vp-pm"),mult,fmtMult,400);
    }
    $("#videopokerMsg").textContent=label+(mult>1?" — Won "+fmt$(payout):(mult===1?" — Stake back":""));
    $("#videopokerPlay").textContent="Deal";$("#videopokerPlay").disabled=false;
    if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win();if(ngAnim()){stage.classList.add("rays-on");setTimeout(function(){stage.classList.remove("rays-on")},1500)}}
    else if(mult===1){stageFx(stage,"shake");sfx.click()}
    else{stageFx(stage,"lose");sfx.lose()}
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("videopokerBet","10.00")
    +'<div class="field"><label>How to play</label><div style="font-size:12px;color:#9fb3a8;line-height:1.7">Tap cards to HOLD, then press Draw once.<br>One draw per round.</div></div>'
    +'<button class="action-btn" id="videopokerPlay" style="margin-top:16px">Deal</button>'
    +'<div class="hist-row" id="videopokerHist"></div></div>'
    +'<div class="stage" id="videopokerStage">'+gameHeaderHtml('videopoker')+'<div class="vp-rays"></div>'
    +'<div class="vp-cab">'
    +'<div class="vp-marquee"><div class="vp-dots"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>'
    +'<div class="vp-title">JACKS OR BETTER</div>'
    +'<div class="vp-paytable" id="videopokerPay">'
    +'<div class="vp-prow" data-hand="ROYAL FLUSH"><span>ROYAL FLUSH</span><b class="vp-pm">800&times;</b></div>'
    +'<div class="vp-prow" data-hand="STRAIGHT FLUSH"><span>STRAIGHT FLUSH</span><b class="vp-pm">50&times;</b></div>'
    +'<div class="vp-prow" data-hand="FOUR OF A KIND"><span>FOUR OF A KIND</span><b class="vp-pm">25&times;</b></div>'
    +'<div class="vp-prow" data-hand="FULL HOUSE"><span>FULL HOUSE</span><b class="vp-pm">9&times;</b></div>'
    +'<div class="vp-prow" data-hand="FLUSH"><span>FLUSH</span><b class="vp-pm">6&times;</b></div>'
    +'<div class="vp-prow" data-hand="STRAIGHT"><span>STRAIGHT</span><b class="vp-pm">4&times;</b></div>'
    +'<div class="vp-prow" data-hand="THREE OF A KIND"><span>THREE OF A KIND</span><b class="vp-pm">3&times;</b></div>'
    +'<div class="vp-prow" data-hand="TWO PAIR"><span>TWO PAIR</span><b class="vp-pm">2&times;</b></div>'
    +'<div class="vp-prow" data-hand="JACKS OR BETTER"><span>JACKS OR BETTER</span><b class="vp-pm">1&times;</b></div>'
    +'</div></div>'
    +'<div class="vp-screen"><div class="vp-neon-edge l"></div><div class="vp-neon-edge r"></div>'
    +'<div class="vp-hand" id="videopokerHand"></div>'
    +'<div class="vp-msg" id="videopokerMsg">Place your bet and press Deal.</div>'
    +'<div class="vp-hint">Jacks or Better pays — pairs below Jacks lose.</div>'
    +'</div></div></div></div>';
  wireAmount("videopokerBet");
  $("#videopokerPlay").addEventListener("click",function(){
    if(!dealt){
      var bet=getBet("videopokerBet");if(bet==null)return;
      charge(bet);flyChip(this,$("#videopokerStage"));bet0=bet;sfx.click();
      deck=newDeck();hand=[deck.pop(),deck.pop(),deck.pop(),deck.pop(),deck.pop()];
      held=[false,false,false,false,false];dealt=true;
      clearPayHits();
      render(true);
      $("#videopokerMsg").textContent="Tap cards to hold, then press Draw.";
      $("#videopokerPlay").textContent="Draw";
    }else{
      for(var i=0;i<5;i++)if(!held[i])hand[i]=deck.pop();
      sfx.click();finish();
    }
  });
  addDust($("#videopokerStage"),10);
};
/* ==================== NEWGAME: WHEEL ==================== */
BUILDERS.wheel=function(mount){
  var SEG=[0,1.2,0,1.5,0,2,0,1.2,0,5];
  var WT=[5,4,5,4,5,4,5,4,5,4];
  var R=140;
  function pt(th,r){var a=th*Math.PI/180;return (150+r*Math.sin(a)).toFixed(1)+" "+(150-r*Math.cos(a)).toFixed(1);}
  var segs="";
  for(var i=0;i<10;i++){
    var a0=i*36,a1=a0+36,am=a0+18,m=SEG[i];
    var fill=m===5?"#f5b942":(i%2===0?"#402035":"#1c1013");
    var txt=m===5?"#3a2200":(m===0?"#a08a90":"#ffe9b0");
    segs+='<path d="M150 150 L'+pt(a0,R)+' A'+R+' '+R+' 0 0 1 '+pt(a1,R)+' Z" fill="'+fill+'" stroke="#0d0708" stroke-width="2"/>';
    var lp=pt(am,92).split(" ");
    segs+='<text x="'+lp[0]+'" y="'+lp[1]+'" transform="rotate('+am+' '+lp[0]+' '+lp[1]+')" text-anchor="middle" dominant-baseline="central" font-size="16" font-weight="800" fill="'+txt+'">'+fmtMult(m)+'</text>';
    var tp=pt(i*36,143.5).split(" ");
    segs+='<circle cx="'+tp[0]+'" cy="'+tp[1]+'" r="2.6" fill="#ffd479" opacity=".9"/>';
  }
  var rings='<circle cx="150" cy="150" r="146.5" fill="none" stroke="#ffd479" stroke-width="2" opacity=".45"/>'
    +'<circle cx="150" cy="150" r="140.5" fill="none" stroke="#8a6a2f" stroke-width="1" opacity=".8"/>';
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("wheelBet","10.00")
    +'<div class="wheel-legend"><span class="wheel-chip">5x jackpot slice</span><span class="wheel-chip">2x - 1.5x - 1.2x</span><span class="wheel-chip">0x loses</span></div>'
    +'<button class="action-btn" id="wheelPlay" style="margin-top:16px">Spin the Wheel</button>'
    +'<div class="hist-row" id="wheelHist"></div></div>'
    +'<div class="stage" id="wheelStage">'+gameHeaderHtml('wheel')
    +'<div class="wheel-wrap"><div class="wheel-rays" id="wheelRays"></div>'
    +'<div class="wheel-pos" id="wheelPos"><div class="wheel-ptr"></div>'
    +'<svg viewBox="0 0 300 300"><g class="wheel-rotor" id="wheelRotor">'+segs+'</g>'+rings
    +'<circle cx="150" cy="150" r="17" fill="#0d0708" stroke="#ffd479" stroke-width="3"/>'
    +'<text x="150" y="150" text-anchor="middle" dominant-baseline="central" font-size="16" fill="#ffd479">\u2605</text></svg>'
    +'<div class="wheel-bulbs" id="wheelBulbs"></div></div>'
    +'<div class="wheel-mult" id="wheelMult">Place your bet</div>'
    +'</div></div></div>';
  wireAmount("wheelBet");
  var stage=document.getElementById("wheelStage"),rotor=document.getElementById("wheelRotor"),
      play=document.getElementById("wheelPlay"),multEl=document.getElementById("wheelMult");
  var busy=false,curRot=0,pending=null,hist=[],wxT=[];
  function wheelRays(){
    if(!ngAnim())return;
    var r=document.getElementById("wheelRays");if(!r)return;
    r.classList.remove("show");void r.offsetWidth;r.classList.add("show");
    wxT.push(setTimeout(function(){r.classList.remove("show");},1500));
  }
  function pick(){var t=0,k;for(k=0;k<10;k++)t+=WT[k];var r=Math.random()*t;for(k=0;k<10;k++){r-=WT[k];if(r<0)return k;}return 9;}
  function resolve(){
    if(!pending)return;var p=pending;pending=null;busy=false;
    if(play){play.disabled=false;play.style.opacity="";}
    var pos=document.getElementById("wheelPos"),bulbs=document.getElementById("wheelBulbs");
    if(pos)pos.classList.remove("spinning","anticipate");
    if(bulbs)bulbs.classList.remove("chase","slow");
    var payout=settle("Wheel",p.bet,p.mult);
    multEl.textContent=fmtMult(p.mult);
    multEl.classList.toggle("big",p.mult>=5);
    hist.unshift({t:fmtMult(p.mult),w:p.mult>1});
    histChips(document.getElementById("wheelHist"),hist.slice(0,12));
    if(p.mult>1){
      stageFx(stage,"win");burstFX(stage,{});wheelRays();
      winBanner(stage,"WON "+fmt$(payout));
      if(p.mult>=5)sfx.big();else sfx.win();
    }else{stageFx(stage,"lose");sfx.lose();}
  }
  onCleanup(function(){var t;for(t=0;t<wxT.length;t++)clearTimeout(wxT[t]);wxT=[];if(pending){clearTimeout(pending.timer);resolve();}});
  play.addEventListener("click",function(){
    if(busy)return;var bet=getBet("wheelBet");if(bet==null)return;
    busy=true;sfx.click();play.disabled=true;play.style.opacity=".5";charge(bet);
    flyChip(play,stage);
    var i=pick(),m=SEG[i];
    var th=i*36+18+(Math.random()*24-12);
    var target=((360-th)%360+360)%360;
    var delta=(((target-curRot%360)%360)+360)%360;
    curRot+=360*5+delta;pending={bet:bet,mult:m,timer:0};
    multEl.textContent="Spinning...";multEl.classList.remove("big");
    rotor.style.transform="rotate("+curRot+"deg)";
    var pos=document.getElementById("wheelPos"),bulbs=document.getElementById("wheelBulbs");
    if(pos)pos.classList.add("spinning");
    if(bulbs)bulbs.classList.add("chase");
    wxT.push(setTimeout(function(){
      if(pending){
        if(pos)pos.classList.add("anticipate");
        if(bulbs)bulbs.classList.add("slow");
      }
    },3400));
    if(ngAnim()){pending.timer=setTimeout(resolve,4800);}else{resolve();}
  });
  (function(){
    var be=document.getElementById("wheelBulbs");
    if(be){
      var h="",bi;
      for(bi=0;bi<18;bi++){
        h+='<i class="wheel-bulb" style="--a:'+bi+';left:'+(50+50*Math.sin(bi*Math.PI/9)).toFixed(2)+'%;top:'+(50-50*Math.cos(bi*Math.PI/9)).toFixed(2)+'%"></i>';
      }
      be.innerHTML=h;
    }
  })();
  addDust(stage,10);
};
    function openGame(id){
      cleanupFns.splice(0).forEach(f=>{try{f();}catch(e){}});
      state.view="game"; state.game=id;
      $$(".view").forEach(v=>v.classList.remove("active"));
      retriggerView($("#view-game"));
      $$("#sidebar .side-item[data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav==="game:"+id));
      $$(".bottom-nav button[data-bnav]").forEach(b=>b.classList.remove("on"));
      $("#gameTitle").innerHTML=gameLogoLockup(id);
      $("#gameSub").textContent="Betvora Original · "+GAMES[id].rtp+" · Provably Fair";
      $("#gameMount").innerHTML="";
      Skel.mountSkel($("#gameMount"));
      requestAnimationFrame(()=>{ if(state.view==="game" && state.game===id) BUILDERS[id]($("#gameMount")); });
      window.scrollTo({top:0});
    }
    function betAmountHtml(id,val){
      return '<div class="field"><label>Bet Amount</label><div class="amount-row">'
        +'<div class="amount-in"><span class="coin-dot">$</span><input id="'+id+'" type="number" min="0" step="0.01" value="'+val+'" /></div>'
        +'<button class="mini-btn" data-half="'+id+'">½</button><button class="mini-btn" data-double="'+id+'">2×</button></div></div>';
    }
    function wireAmount(id){
      $$("[data-half]").forEach(b=>{ if(b.dataset.half===id) b.addEventListener("click",()=>{ const i=$("#"+id); i.value=(Math.max(0,parseFloat(i.value||0)/2)).toFixed(2); }); });
      $$("[data-double]").forEach(b=>{ if(b.dataset.double===id) b.addEventListener("click",()=>{ const i=$("#"+id); i.value=(Math.max(0,parseFloat(i.value||0)*2)).toFixed(2); }); });
    }
    function getBet(id){
      const v=parseFloat($("#"+id).value);
      if(isNaN(v)||v<=0){ toast("Invalid bet","Enter a bet amount above $0.","err"); return null; }
      if(v>state.balance){ toast("Insufficient balance","Your bet is bigger than your balance — top up in the Wallet.","err"); if(state.user) openWallet(); else requireAuth(openWallet); return null; }
      return Math.round(v*100)/100;
    }
    function charge(bet){ state.balance-=bet; renderBalance(); }
    function settle(gameName,bet,mult){
      const payout=Math.round(bet*mult*100)/100;
      if(payout>0){ state.balance+=payout; renderBalance(); }
      recordBet(gameName,bet,mult,payout);
      return payout;
    }
    function winBanner(stageEl,text){
      let b=stageEl.querySelector(".win-banner");
      if(!b){ b=document.createElement("div"); b.className="win-banner"; stageEl.appendChild(b); }
      b.textContent=text; b.classList.add("show");
      setTimeout(()=>b.classList.remove("show"),2600);
    }
    function histChips(el,items){
      el.innerHTML=items.map(x=>'<span class="hist-chip '+(x.w?"w":"l")+'">'+esc(x.t)+"</span>").join("");
    }
    /* ---- pro game FX: particles, count-ups, stage flashes ---- */
    function burstFX(stageEl,opts){
      opts=opts||{};
      if(!state.anim||!stageEl||!stageEl.animate) return;
      if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const colors=opts.colors||["#f5b942","#00e065","#ffffff","#ffd479"];
      const n=opts.n||26;
      const sr=stageEl.getBoundingClientRect();
      let ox=sr.width/2, oy=Math.min(sr.height/2,190);
      if(opts.at){ ox=opts.at.x-sr.left; oy=opts.at.y-sr.top; }
      else if(opts.fromEl){ const fr=opts.fromEl.getBoundingClientRect(); ox=fr.left-sr.left+fr.width/2; oy=fr.top-sr.top+fr.height/2; }
      for(let i=0;i<n;i++){
        const p=document.createElement("i"); p.className="fx-p";
        const s=4+Math.random()*7;
        p.style.width=s+"px"; p.style.height=s+"px";
        p.style.left=ox+"px"; p.style.top=oy+"px";
        p.style.background=colors[i%colors.length];
        stageEl.appendChild(p);
        const ang=Math.random()*Math.PI*2, dist=60+Math.random()*175;
        const dx=Math.cos(ang)*dist, dy=Math.sin(ang)*dist-46;
        const anim=p.animate([
          {transform:"translate(-50%,-50%) rotate(0deg)",opacity:1},
          {transform:"translate(calc(-50% + "+dx.toFixed(0)+"px), calc(-50% + "+(dy+130).toFixed(0)+"px)) rotate("+(Math.random()*420-210).toFixed(0)+"deg)",opacity:0}
        ],{duration:760+Math.random()*560,easing:"cubic-bezier(.15,.6,.4,1)"});
        anim.onfinish=()=>p.remove();
        setTimeout(()=>{ if(p.parentNode) p.remove(); },1700);
      }
    }
    function countUp(el,to,fmt,dur){
      tweenNum(el,0,to,fmt,dur||700);
    }
    function stageFx(stageEl,kind){
      if(!stageEl) return;
      const cls= kind==="win"? "fx-win" : kind==="shake"? "fx-shake" : "fx-lose";
      stageEl.classList.remove("fx-win","fx-lose","fx-shake"); void stageEl.offsetWidth;
      stageEl.classList.add(cls);
      setTimeout(()=>stageEl.classList.remove(cls),1150);
    }

        function ngAnim(){ return state.anim && !(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches); }

    /* ---- shared: casino chip fly animation (bet placement) ---- */
    function flyChip(fromEl, stageEl){
      if(typeof ngAnim==="function" ? !ngAnim() : true) return;
      if(!fromEl||!stageEl||!fromEl.getBoundingClientRect) return;
      try{
        var fr=fromEl.getBoundingClientRect(), sr=stageEl.getBoundingClientRect();
        var c=document.createElement("div"); c.className="casino-chip"; c.innerHTML="<span>$</span>";
        var sx=fr.left+fr.width/2, sy=fr.top+fr.height/2;
        var tx=sr.left+sr.width/2, ty=sr.top+Math.min(sr.height/2,200);
        c.style.left=sx+"px"; c.style.top=sy+"px";
        document.body.appendChild(c);
        var dx=tx-sx, dy=ty-sy;
        if(c.animate){
          var a=c.animate([
            {transform:"translate(-50%,-50%) scale(1)",opacity:1},
            {transform:"translate(calc(-50% + "+(dx*0.5).toFixed(0)+"px), calc(-50% + "+(dy-70).toFixed(0)+"px)) scale(1.02)",opacity:1,offset:.55},
            {transform:"translate(calc(-50% + "+dx.toFixed(0)+"px), calc(-50% + "+dy.toFixed(0)+"px)) scale(.55)",opacity:.85}
          ],{duration:640,easing:"cubic-bezier(.3,.7,.4,1)"});
          a.onfinish=function(){c.remove();};
          setTimeout(function(){if(c.parentNode)c.remove();},950);
        } else { setTimeout(function(){c.remove();},50); }
      }catch(e){}
    }
    /* ---- shared: ambient dust particles on a stage ---- */
    function addDust(stageEl,n){
      if(typeof ngAnim==="function" ? !ngAnim() : true) return;
      if(!stageEl||stageEl.querySelector(".fx-dust")) return;
      n=n||10;
      for(var i=0;i<n;i++){
        var d=document.createElement("i"); d.className="fx-dust";
        var s=(2+Math.random()*4).toFixed(1);
        d.style.width=s+"px"; d.style.height=s+"px";
        d.style.left=(Math.random()*100).toFixed(1)+"%";
        d.style.top=(Math.random()*100).toFixed(1)+"%";
        d.style.animationDelay=(Math.random()*7).toFixed(1)+"s";
        d.style.animationDuration=(5+Math.random()*5).toFixed(1)+"s";
        stageEl.appendChild(d);
      }
    }
