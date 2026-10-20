/* Betvora — games/games-3.js
   Game builders (BUILDERS.*) — GAMES42 additions, part 3.
   Split from the single-file build; execution order preserved across files.
   Classic script (no modules) — works over file:// and http(s). */

/* ==================== GAMES42: DRAGONTIGER ==================== */
BUILDERS.dragontiger=function(mount){
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
  var SUITS=["\u2660","\u2665","\u2666","\u2663"],RANKS=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  var shoe=[];
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}}
  function buildShoe(){shoe=[];for(var d=0;d<6;d++)for(var s=0;s<4;s++)for(var r=0;r<13;r++)shoe.push({r:RANKS[r],s:SUITS[s],v:r+1,red:(s===1||s===2)});shuffle(shoe)}
  function draw(){if(shoe.length<60)buildShoe();return shoe.pop()}
  /* RTP basis (standard Dragon Tiger, 6 decks, rank-only compare):
     Dragon/Tiger bets pay 1:1 and return half the stake on a tie, giving
     RTP approx 96.2%. The Tie bet pays 8:1 on a roughly 7.7% tie chance,
     giving RTP approx 69%. Registry shows the main-bet figure: 96.2% RTP. */
  var hist=[],road=[],choice="dragon",dealing=false;
  function cardHtml(c,d){return '<div class="dt-card '+(c.red?"red ":"")+(ngAnim()?"dt-card-in":"")+'"'+(d?' style="animation-delay:'+(d*120)+'ms"':"")+'>'+'<div class="rk">'+c.r+'</div><div class="st">'+c.s+'</div></div>'}
  function renderRoad(){
    var htm="",arr=road.slice(0,18);
    for(var i=arr.length-1;i>=0;i--){var r=arr[i];htm+='<span class="dt-bead '+(r==="D"?"d":(r==="T"?"t":"e"))+'">'+r+'</span>'}
    $("#dragontigerRoad").innerHTML=htm;
    $("#dragontigerShoeN").textContent="Shoe: "+shoe.length+" cards";
  }
  function syncSpots(){var sp=$("#dragontigerSpots");if(!sp)return;var bs=sp.querySelectorAll(".dt-spot");for(var i=0;i<bs.length;i++)bs[i].classList.toggle("on",bs[i].getAttribute("data-v")===choice)}
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("dragontigerBet","10.00")
    +'<div class="field"><label>Bet on</label><div class="seg" id="dragontigerChoice">'
    +'<button data-v="dragon" class="on">Dragon 1:1</button><button data-v="tiger">Tiger 1:1</button><button data-v="tie">Tie 8:1</button>'
    +'</div></div>'
    +'<button class="action-btn" id="dragontigerPlay" style="margin-top:16px">Deal</button>'
    +'<div class="hist-row" id="dragontigerHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>One card is dealt to Dragon and one to Tiger from a 6-deck shoe.</li>'
    +'<li>Only rank counts: Ace is low (1), King is high (13). Suits are ignored.</li>'
    +'<li>Dragon or Tiger win pays 1:1 (total payout 2x your bet).</li>'
    +'<li>Tie pays 8:1 (total payout 9x your bet).</li>'
    +'<li>On a tie, Dragon and Tiger bets get half the stake back (0.5x total payout).</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="dragontigerStage">'+gameHeaderHtml('dragontiger')
    +'<div class="dt-felt">'
    +'<div class="dt-row">'
    +'<div class="dt-side dragon" id="dragontigerDSide"><div class="dt-label">DRAGON</div><div class="dt-hand" id="dragontigerDHand"></div><div><span class="dt-rank" id="dragontigerDRank"></span></div></div>'
    +'<div class="dt-vs">VS</div>'
    +'<div class="dt-side tiger" id="dragontigerTSide"><div class="dt-label">TIGER</div><div class="dt-hand" id="dragontigerTHand"></div><div><span class="dt-rank" id="dragontigerTRank"></span></div></div>'
    +'</div>'
    +'<div class="dt-msg" id="dragontigerMsg">Choose a side and press Deal.</div>'
    +'<div class="dt-roadwrap"><div class="dt-roadcap">History</div><div class="dt-road" id="dragontigerRoad"></div></div>'
    +'<div class="dt-shoe" id="dragontigerShoeN"></div>'
    +'</div></div></div>';
  wireAmount("dragontigerBet");
  buildShoe();renderRoad();
  var segs=$("#dragontigerChoice").querySelectorAll("button");
  for(var k=0;k<segs.length;k++){segs[k].addEventListener("click",function(){for(var i=0;i<segs.length;i++)segs[i].classList.remove("on");this.classList.add("on");choice=this.getAttribute("data-v");sfx.click()})}
  $("#dragontigerPlay").addEventListener("click",function(){
    if(dealing)return;
    var bet=getBet("dragontigerBet");if(bet==null)return;
    var totalBet=bet;
    charge(bet);flyChip(this,$("#dragontigerStage"));dealing=true;sfx.click();
    $("#dragontigerMsg").textContent="Dealing...";
    $("#dragontigerDSide").classList.remove("dt-winner");$("#dragontigerTSide").classList.remove("dt-winner");
    var dc=draw(),tc=draw();
    $("#dragontigerDHand").innerHTML=cardHtml(dc,0);
    $("#dragontigerTHand").innerHTML=cardHtml(tc,1);
    $("#dragontigerDRank").textContent="Rank "+dc.v;
    $("#dragontigerTRank").textContent="Rank "+tc.v;
    renderRoad();
    function finish(){
      var winner=dc.v>tc.v?"dragon":(tc.v>dc.v?"tiger":"tie");
      if(winner==="dragon")$("#dragontigerDSide").classList.add("dt-winner");
      if(winner==="tiger")$("#dragontigerTSide").classList.add("dt-winner");
      var totalPayout=0,label="";
      if(winner==="tie"){
        road.unshift("E");
        if(choice==="tie"){totalPayout=9*bet;label="TIE 8:1"}
        else{totalPayout=0.5*bet;label="TIE — HALF BACK"}
      }else{
        road.unshift(winner==="dragon"?"D":"T");
        if(choice===winner){totalPayout=2*bet;label=winner.toUpperCase()+" WINS 1:1"}
        else{totalPayout=0;label=winner.toUpperCase()+" WINS — LOST"}
      }
      var mult=totalBet>0?totalPayout/totalBet:0;
      var stage=$("#dragontigerStage"),payout=settle("Dragon Tiger",totalBet,mult);
      hist.unshift({t:(choice==="tie"?"Tie":(choice==="dragon"?"D":"T"))+" "+label,w:mult>1});histChips($("#dragontigerHist"),hist.slice(0,12));
      renderRoad();
      $("#dragontigerMsg").textContent="Dragon "+dc.r+" ("+dc.v+") — Tiger "+tc.r+" ("+tc.v+"). "+label+(mult>1?" — Won "+fmt$(payout):(mult>0&&mult<1?" — "+fmt$(payout)+" back":(mult===1?" — Stake back":"")));
      if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win();if(mult>=9)sfx.big()}
      else if(mult>0){stageFx(stage,"shake");sfx.click()}
      else{stageFx(stage,"lose");sfx.lose()}
      dealing=false;
    }
    if(ngAnim()){_bvSetTimeout(finish,420)}else{finish()}
  });
  addDust($("#dragontigerStage"),10);
};
/* ==================== GAMES42: TEENPATTI ==================== */
BUILDERS.teenpatti=function(mount){
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
  var SUITS=["\u2660","\u2665","\u2666","\u2663"],RANKS=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  function newDeck(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({r:RANKS[r],s:SUITS[s],v:r+2,red:(s===1||s===2)});for(var i=d.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=d[i];d[i]=d[j];d[j]=t}return d}
  /* RTP basis: standard Teen Patti ante + play structure (1x ante, 1x play
     bet to continue, dealer qualifies on Q-high or better, no ante bonus).
     Published theoretical RTP for this pay structure is approx 96.6%. */
  function evaluate(hand){
    var rs=[hand[0].v,hand[1].v,hand[2].v].sort(function(a,b){return b-a});
    var flush=(hand[0].s===hand[1].s&&hand[1].s===hand[2].s);
    var distinct=(rs[0]!==rs[1]&&rs[1]!==rs[2]&&rs[0]!==rs[2]);
    var straight=false,seqScore=0;
    if(distinct){
      if(rs[0]-rs[2]===2){straight=true;seqScore=rs[0]}
      else if(rs[0]===14&&rs[1]===3&&rs[2]===2){straight=true;seqScore=13.5}
    }
    if(rs[0]===rs[2])return{cat:6,tb:[rs[0]],name:"Trio"};
    if(straight&&flush)return{cat:5,tb:[seqScore],name:"Pure Sequence"};
    if(straight)return{cat:4,tb:[seqScore],name:"Sequence"};
    if(flush)return{cat:3,tb:rs,name:"Color (Flush)"};
    if(rs[0]===rs[1])return{cat:2,tb:[rs[0],rs[2]],name:"Pair"};
    if(rs[1]===rs[2])return{cat:2,tb:[rs[1],rs[0]],name:"Pair"};
    return{cat:1,tb:rs,name:"High Card"};
  }
  function compare(a,b){
    if(a.cat!==b.cat)return a.cat>b.cat?1:-1;
    for(var i=0;i<a.tb.length;i++){if(a.tb[i]!==b.tb[i])return a.tb[i]>b.tb[i]?1:-1}
    return 0;
  }
  function qualifies(ev,hand){
    if(ev.cat>=2)return true;
    var mx=Math.max(hand[0].v,hand[1].v,hand[2].v);
    return mx>=12;
  }
  var hist=[],player=[],dealer=[],ante=0,totalBet=0,active=false,busy=false,timers=[];
  function later(fn,ms){var t=_bvSetTimeout(fn,ms);timers.push(t);return t}
  onCleanup(function(){for(var i=0;i<timers.length;i++)_bvClearTimeout(timers[i])});
  function cardHtml(c,d){return '<div class="tp-card '+(c.red?"red ":"")+(ngAnim()?"tp-card-in":"")+'"'+(d?' style="animation-delay:'+(d*120)+'ms"':"")+'>'+'<div class="rk">'+c.r+'</div><div class="st">'+c.s+'</div></div>'}
  function backHtml(d){return '<div class="tp-card back '+(ngAnim()?"tp-card-in":"")+'"'+(d?' style="animation-delay:'+(d*120)+'ms"':"")+'><div class="bk">B</div></div>'}
  function render(reveal){
    var ph="",dh="";
    for(var i=0;i<player.length;i++)ph+=cardHtml(player[i],i);
    for(var j=0;j<dealer.length;j++)dh+=reveal?cardHtml(dealer[j],j):backHtml(j);
    $("#teenpattiPHand").innerHTML=ph;$("#teenpattiDHand").innerHTML=dh;
    $("#teenpattiPName").textContent=player.length?evaluate(player).name:"";
    $("#teenpattiDName").textContent=reveal&&dealer.length?evaluate(dealer).name:(dealer.length?"Hidden":"");
  }
  function setDecision(on){
    $("#teenpattiPlayBtn").style.display=on?"":"none";
    $("#teenpattiFoldBtn").style.display=on?"":"none";
    if(on){$("#teenpattiPlayBtn").disabled=state.balance<ante}
    $("#teenpattiDeal").disabled=on;
  }
  function finish(totalPayout,label){
    active=false;busy=false;setDecision(false);
    var mult=totalBet>0?totalPayout/totalBet:0;
    var stage=$("#teenpattiStage"),payout=settle("Teen Patti",totalBet,mult);
    hist.unshift({t:label,w:mult>1});histChips($("#teenpattiHist"),hist.slice(0,12));
    $("#teenpattiMsg").textContent=label+(mult>1?" — Won "+fmt$(payout):(mult===1?" — Stake back":(mult>0?" — "+fmt$(payout)+" back":"")));
    if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win();if(mult>=2)sfx.big()}
    else if(mult>0&&mult<2){stageFx(stage,"shake");sfx.click()}
    else if(mult===0){stageFx(stage,"lose");sfx.lose()}
    else{stageFx(stage,"shake");sfx.click()}
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("teenpattiBet","10.00")
    +'<button class="action-btn" id="teenpattiDeal" style="margin-top:16px">Deal (Ante)</button>'
    +'<div class="hist-row" id="teenpattiHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>Your bet is the ante. You and the dealer each get 3 cards; dealer cards stay face down until showdown.</li>'
    +'<li>Play costs one extra ante (total wager 2x ante). Fold loses the ante.</li>'
    +'<li>Hand rankings, high to low: Trio &gt; Pure Sequence (straight flush) &gt; Sequence (straight) &gt; Color (flush) &gt; Pair &gt; High Card.</li>'
    +'<li>Sequences: A-K-Q is highest, A-2-3 is second-highest, then K-Q-J down to 4-3-2 lowest.</li>'
    +'<li>Dealer qualifies with Q-high or better (highest card Q or above, or any pair or better).</li>'
    +'<li>Dealer does not qualify: ante pays 1:1 and the play bet pushes — total payout 3x ante.</li>'
    +'<li>Dealer qualifies and you win: ante and play bet both pay 1:1 — total payout 4x ante.</li>'
    +'<li>Tie with a qualifying dealer: both bets push — total payout 2x ante. Lose: both bets are lost. No ante bonus.</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="teenpattiStage">'+gameHeaderHtml('teenpatti')
    +'<div class="tp-felt">'
    +'<div class="tp-zone">Dealer</div><div class="tp-hand" id="teenpattiDHand"></div><span class="tp-handname" id="teenpattiDName"></span>'
    +'<div class="tp-zone" style="margin-top:14px">You</div><div class="tp-hand" id="teenpattiPHand"></div><span class="tp-handname" id="teenpattiPName"></span>'
    +'<div class="tp-actions"><button class="action-btn" id="teenpattiPlayBtn" style="display:none">Play (add ante)</button><button class="action-btn" id="teenpattiFoldBtn" style="display:none">Fold</button></div>'
    +'<div class="tp-msg" id="teenpattiMsg">Place your ante and press Deal.</div>'
    +'</div></div></div>';
  wireAmount("teenpattiBet");
  render(false);setDecision(false);
  $("#teenpattiDeal").addEventListener("click",function(){
    if(active||busy)return;
    var bet=getBet("teenpattiBet");if(bet==null)return;
    ante=bet;totalBet=bet;charge(bet);flyChip(this,$("#teenpattiStage"));sfx.click();
    var deck=newDeck();
    player=[deck.pop(),deck.pop(),deck.pop()];dealer=[deck.pop(),deck.pop(),deck.pop()];
    active=true;render(false);setDecision(true);
    $("#teenpattiMsg").textContent="You have "+evaluate(player).name+". Play for one more ante, or fold?";
    if(state.balance<ante)$("#teenpattiMsg").textContent+=" (Balance too low to Play — Fold only.)";
  });
  $("#teenpattiFoldBtn").addEventListener("click",function(){
    if(!active||busy)return;sfx.click();render(true);
    finish(0,"FOLDED — ANTE LOST");
  });
  $("#teenpattiPlayBtn").addEventListener("click",function(){
    if(!active||busy)return;
    if(state.balance<ante){toast("Insufficient balance","You need one more ante to play.","err");return}
    charge(ante);totalBet+=ante;flyChip(this,$("#teenpattiStage"));sfx.coin();busy=true;setDecision(false);
    $("#teenpattiMsg").textContent="Showdown...";
    function showdown(){
      render(true);
      var pe=evaluate(player),de=evaluate(dealer);
      if(!qualifies(de,dealer)){
        finish(3*ante,"DEALER DOES NOT QUALIFY — ANTE WINS, PLAY PUSHES");
      }else{
        var cmp=compare(pe,de);
        if(cmp>0)finish(4*ante,"YOU WIN — "+pe.name.toUpperCase()+" BEATS "+de.name.toUpperCase());
        else if(cmp<0)finish(0,de.name.toUpperCase()+" BEATS "+pe.name.toUpperCase()+" — LOST");
        else finish(2*ante,"TIE — BOTH BETS PUSH");
      }
    }
    if(ngAnim()){later(showdown,550)}else{showdown()}
  });
  addDust($("#teenpattiStage"),10);
};
/* ==================== GAMES42: ANDARBAHAR ==================== */
BUILDERS.andarbahar=function(mount){
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
  var SUITS=["\u2660","\u2665","\u2666","\u2663"],RANKS=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  function newDeck(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({r:RANKS[r],s:SUITS[s],v:r+2,red:(s===1||s===2)});for(var i=d.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=d[i];d[i]=d[j];d[j]=t}return d}
  /* RTP basis: single 52-card deck, house card removed, cards dealt
     alternately starting on Andar until the house rank reappears. Andar is
     dealt first so it holds a small first-card edge, which the 0.9:1 Andar
     price (vs 1:1 Bahar) offsets. Combined theoretical RTP for this standard
     Andar Bahar pay table is approx 97.0%. */
  var hist=[],choice="andar",busy=false,iv=null;
  onCleanup(function(){if(iv){_bvClearInterval(iv);iv=null}});
  function cardHtml(c,big,anim){return '<div class="ab-card '+(big?"big ":"")+(c.red?"red ":"")+((anim&&ngAnim())?"ab-card-in":"")+'"><div class="rk">'+c.r+'</div><div class="st">'+c.s+'</div></div>'}
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("andarbaharBet","10.00")
    +'<div class="field"><label>Bet on</label><div class="seg" id="andarbaharChoice">'
    +'<button data-v="andar" class="on">Andar 0.9:1</button><button data-v="bahar">Bahar 1:1</button>'
    +'</div></div>'
    +'<button class="action-btn" id="andarbaharPlay" style="margin-top:16px">Bet &amp; Deal</button>'
    +'<div class="hist-row" id="andarbaharHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>Pick your side first: Andar pays 0.9:1 (total payout 1.9x bet), Bahar pays 1:1 (total payout 2x bet).</li>'
    +'<li>On Bet, a house (joker) card is dealt face up in the centre from a fresh single 52-card deck.</li>'
    +'<li>Cards are then dealt alternately — 1st to Andar, 2nd to Bahar, 3rd to Andar, and so on — until a card matching the house card rank appears.</li>'
    +'<li>If the matching card lands on your side, you win at your side price. If it lands on the other side, you lose.</li>'
    +'<li>A match is guaranteed within 49 cards; the deck is reshuffled every round.</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="andarbaharStage">'+gameHeaderHtml('andarbahar')
    +'<div class="ab-felt">'
    +'<div class="ab-housewrap"><div class="ab-houselabel">House Card</div><div class="ab-house" id="andarbaharHouse"><div class="ab-card big"><div class="rk">?</div><div class="st">?</div></div></div></div>'
    +'<div class="ab-piles">'
    +'<div class="ab-pile" id="andarbaharAPile"><div class="ab-pilelabel">ANDAR<small id="andarbaharACount">0 cards &bull; pays 0.9:1</small></div><div class="ab-cards" id="andarbaharA"></div></div>'
    +'<div class="ab-pile" id="andarbaharBPile"><div class="ab-pilelabel">BAHAR<small id="andarbaharBCount">0 cards &bull; pays 1:1</small></div><div class="ab-cards" id="andarbaharB"></div></div>'
    +'</div>'
    +'<div class="ab-msg" id="andarbaharMsg">Pick a side and press Bet &amp; Deal.</div>'
    +'</div></div></div>';
  wireAmount("andarbaharBet");
  var segs=$("#andarbaharChoice").querySelectorAll("button");
  for(var k=0;k<segs.length;k++){segs[k].addEventListener("click",function(){if(busy)return;for(var i=0;i<segs.length;i++)segs[i].classList.remove("on");this.classList.add("on");choice=this.getAttribute("data-v");sfx.click()})}
  $("#andarbaharPlay").addEventListener("click",function(){
    if(busy)return;
    var bet=getBet("andarbaharBet");if(bet==null)return;
    var totalBet=bet;
    charge(bet);flyChip(this,$("#andarbaharStage"));busy=true;sfx.click();
    $("#andarbaharPlay").disabled=true;
    $("#andarbaharAPile").classList.remove("ab-winner");$("#andarbaharBPile").classList.remove("ab-winner");
    var deck=newDeck();
    var house=deck.pop();
    $("#andarbaharHouse").innerHTML=cardHtml(house,true,true);
    var seq=[],guard=0;
    while(guard<51){
      var c=deck.pop();guard++;
      var side=(seq.length%2===0)?"andar":"bahar";
      seq.push({c:c,side:side});
      if(c.r===house.r)break;
    }
    var aPile=[],bPile=[],revealed=0;
    function render(animLast){
      var ah="",bh="";
      for(var i=0;i<aPile.length;i++)ah+=cardHtml(aPile[i],false,animLast&&i===aPile.length-1&&seq[revealed-1]&&seq[revealed-1].side==="andar");
      for(var j=0;j<bPile.length;j++)bh+=cardHtml(bPile[j],false,animLast&&j===bPile.length-1&&seq[revealed-1]&&seq[revealed-1].side==="bahar");
      $("#andarbaharA").innerHTML=ah;$("#andarbaharB").innerHTML=bh;
      $("#andarbaharACount").textContent=aPile.length+" cards • pays 0.9:1";
      $("#andarbaharBCount").textContent=bPile.length+" cards • pays 1:1";
    }
    function finish(){
      var winSide=seq[seq.length-1].side;
      if(winSide==="andar")$("#andarbaharAPile").classList.add("ab-winner");else $("#andarbaharBPile").classList.add("ab-winner");
      var totalPayout=0,label="";
      if(choice===winSide){
        totalPayout=(winSide==="andar"?1.9:2)*bet;
        label=winSide.toUpperCase()+" MATCHED "+house.r+" IN "+seq.length;
      }else{
        totalPayout=0;label=winSide.toUpperCase()+" MATCHED "+house.r+" — LOST";
      }
      var mult=totalBet>0?totalPayout/totalBet:0;
      var stage=$("#andarbaharStage"),payout=settle("Andar Bahar",totalBet,mult);
      hist.unshift({t:(choice==="andar"?"A ":"B ")+label,w:mult>1});histChips($("#andarbaharHist"),hist.slice(0,12));
      $("#andarbaharMsg").textContent="House card "+house.r+house.s+". Match landed on "+winSide.toUpperCase()+" after "+seq.length+" card(s). "+label+(mult>1?" — Won "+fmt$(payout):"");
      if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win()}
      else{stageFx(stage,"lose");sfx.lose()}
      busy=false;$("#andarbaharPlay").disabled=false;
    }
    function step(){
      if(revealed>=seq.length){if(iv){_bvClearInterval(iv);iv=null}finish();return}
      var item=seq[revealed];revealed++;
      if(item.side==="andar")aPile.push(item.c);else bPile.push(item.c);
      render(true);
      $("#andarbaharMsg").textContent="Dealing... "+revealed+" card(s) — waiting for a "+house.r+".";
      if(revealed>=seq.length){if(iv){_bvClearInterval(iv);iv=null}finish()}
    }
    $("#andarbaharMsg").textContent="House card is "+house.r+house.s+". Dealing to Andar first...";
    render(false);
    if(ngAnim()){iv=_bvSetInterval(step,140)}else{while(revealed<seq.length){var it=seq[revealed];revealed++;if(it.side==="andar")aPile.push(it.c);else bPile.push(it.c)}render(false);finish()}
  });
  addDust($("#andarbaharStage"),10);
};
/* ==================== GAMES42: WAR ==================== */
BUILDERS.war=function(mount){
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
  var SUITS=["\u2660","\u2665","\u2666","\u2663"],RANKS=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  function newDeck(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({r:RANKS[r],s:SUITS[s],v:r+2,red:(s===1||s===2)});for(var i=d.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=d[i];d[i]=d[j];d[j]=t}return d}
  /* RTP basis: standard Casino War — 1:1 on the higher card, tie offers
     surrender at half back or war with an equal raise; a second tie pays a
     2:1 bonus on the raise. Published theoretical RTP for this ruleset with
     optimal (always war) play is approx 97.1%. */
  var hist=[],deck=null,pc=null,dc=null,bet0=0,totalBet=0,phase="idle",busy=false,timers=[];
  function later(fn,ms){var t=_bvSetTimeout(fn,ms);timers.push(t);return t}
  onCleanup(function(){for(var i=0;i<timers.length;i++)_bvClearTimeout(timers[i])});
  function cardHtml(c,d){return '<div class="wr-card '+(c.red?"red ":"")+(ngAnim()?"wr-card-in":"")+'"'+(d?' style="animation-delay:'+(d*120)+'ms"':"")+'>'+'<div class="rk">'+c.r+'</div><div class="st">'+c.s+'</div></div>'}
  function backHtml(d){return '<div class="wr-card back '+(ngAnim()?"wr-card-in":"")+'"'+(d?' style="animation-delay:'+(d*90)+'ms"':"")+'><div class="bk">B</div></div>'}
  function setWarBtns(on){
    $("#warSurrenderBtn").style.display=on?"":"none";
    $("#warGoBtn").style.display=on?"":"none";
    if(on){$("#warGoBtn").disabled=state.balance<bet0}
    $("#warPlay").disabled=on||busy;
  }
  function finish(totalPayout,label){
    phase="idle";busy=false;setWarBtns(false);$("#warPlay").disabled=false;
    var mult=totalBet>0?totalPayout/totalBet:0;
    var stage=$("#warStage"),payout=settle("Casino War",totalBet,mult);
    hist.unshift({t:label,w:mult>1});histChips($("#warHist"),hist.slice(0,12));
    $("#warMsg").textContent=label+(mult>1?" — Won "+fmt$(payout):(mult===1?" — Stake back":(mult>0?" — "+fmt$(payout)+" back":"")));
    if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win();if(totalPayout>=4*bet0)sfx.big()}
    else if(mult>0){stageFx(stage,"shake");sfx.click()}
    else{stageFx(stage,"lose");sfx.lose()}
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("warBet","10.00")
    +'<button class="action-btn" id="warPlay" style="margin-top:16px">Deal</button>'
    +'<div class="hist-row" id="warHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>You and the dealer each get one card from a fresh single deck. Rank only counts: 2 is low, Ace is high. Higher card wins 1:1 (total payout 2x bet).</li>'
    +'<li>On a tie you choose: Surrender — half your bet back (total payout 0.5x bet), round over; or Go to War — post a raise equal to your bet (total wager 2x bet).</li>'
    +'<li>Going to war burns 3 cards face down, then one new card is dealt to you and one to the dealer.</li>'
    +'<li>War card higher: your original bet pays 1:1 (2x bet back) and your raise is returned (1x bet) — total payout 3x your original bet.</li>'
    +'<li>War cards tie again: your original bet pushes (1x back), your raise is returned (1x) plus a 2:1 bonus on the raise (2x profit) — total payout 4x your original bet.</li>'
    +'<li>War card lower: you lose both the original bet and the raise (total payout 0).</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="warStage">'+gameHeaderHtml('war')
    +'<div class="wr-felt">'
    +'<div class="wr-row">'
    +'<div class="wr-side" id="warPSide"><div class="wr-label">YOU</div><div class="wr-hand" id="warPHand"></div></div>'
    +'<div class="wr-vs">VS</div>'
    +'<div class="wr-side" id="warDSide"><div class="wr-label">DEALER</div><div class="wr-hand" id="warDHand"></div></div>'
    +'</div>'
    +'<div class="wr-burnlabel" id="warBurnLabel" style="display:none">Burn Cards</div>'
    +'<div class="wr-burn" id="warBurn"></div>'
    +'<div class="wr-actions"><button class="action-btn" id="warSurrenderBtn" style="display:none">Surrender (half back)</button><button class="action-btn" id="warGoBtn" style="display:none">Go to War (add bet)</button></div>'
    +'<div class="wr-msg" id="warMsg">Place your bet and press Deal.</div>'
    +'</div></div></div>';
  wireAmount("warBet");
  setWarBtns(false);
  $("#warPlay").addEventListener("click",function(){
    if(phase!=="idle"||busy)return;
    var bet=getBet("warBet");if(bet==null)return;
    bet0=bet;totalBet=bet;charge(bet);flyChip(this,$("#warStage"));sfx.click();
    deck=newDeck();pc=deck.pop();dc=deck.pop();
    $("#warPSide").classList.remove("wr-winner");$("#warDSide").classList.remove("wr-winner");
    $("#warBurn").innerHTML="";$("#warBurnLabel").style.display="none";
    $("#warPHand").innerHTML=cardHtml(pc,0);
    $("#warDHand").innerHTML=cardHtml(dc,1);
    function resolve(){
      if(pc.v>dc.v){$("#warPSide").classList.add("wr-winner");finish(2*bet0,"YOU "+pc.r+" BEATS "+dc.r+" — 1:1")}
      else if(pc.v<dc.v){$("#warDSide").classList.add("wr-winner");finish(0,"DEALER "+dc.r+" BEATS "+pc.r+" — LOST")}
      else{
        phase="tie";setWarBtns(true);
        $("#warMsg").textContent="Tie on "+pc.r+"! Surrender for half back, or go to war with an equal raise."+(state.balance<bet0?" (Balance too low to go to war.)":"");
        sfx.click();
      }
    }
    if(ngAnim()){busy=true;$("#warPlay").disabled=true;later(function(){busy=false;$("#warPlay").disabled=phase!=="idle";resolve()},400)}else{resolve()}
  });
  $("#warSurrenderBtn").addEventListener("click",function(){
    if(phase!=="tie"||busy)return;sfx.click();
    finish(0.5*bet0,"SURRENDERED — HALF BACK");
  });
  $("#warGoBtn").addEventListener("click",function(){
    if(phase!=="tie"||busy)return;
    if(state.balance<bet0){toast("Insufficient balance","You need an equal raise to go to war.","err");return}
    charge(bet0);totalBet+=bet0;flyChip(this,$("#warStage"));sfx.coin();
    phase="war";busy=true;setWarBtns(false);
    $("#warBurnLabel").style.display="";
    $("#warBurn").innerHTML=backHtml(0)+backHtml(1)+backHtml(2);
    deck.pop();deck.pop();deck.pop();
    var pw=deck.pop(),dw=deck.pop();
    $("#warMsg").textContent="War! Burning 3 cards and dealing the deciders...";
    function resolveWar(){
      $("#warPHand").innerHTML=cardHtml(pc,0)+cardHtml(pw,1);
      $("#warDHand").innerHTML=cardHtml(dc,0)+cardHtml(dw,1);
      busy=false;
      if(pw.v>dw.v){$("#warPSide").classList.add("wr-winner");finish(3*bet0,"WAR WON — "+pw.r+" BEATS "+dw.r)}
      else if(pw.v<dw.v){$("#warDSide").classList.add("wr-winner");finish(0,"WAR LOST — "+dw.r+" BEATS "+pw.r)}
      else{finish(4*bet0,"DOUBLE TIE — RAISE PAYS 2:1 BONUS")}
    }
    if(ngAnim()){later(resolveWar,600)}else{resolveWar()}
  });
  addDust($("#warStage"),10);
};
/* ==================== GAMES42: REDDOG ==================== */
BUILDERS.reddog=function(mount){
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
  var SUITS=["\u2660","\u2665","\u2666","\u2663"],RANKS=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  function newDeck(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({r:RANKS[r],s:SUITS[s],v:r+2,red:(s===1||s===2)});for(var i=d.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=d[i];d[i]=d[j];d[j]=t}return d}
  /* RTP basis: standard Red Dog pay table — spread 1 pays 5:1, spread 2
     pays 4:1, spread 3 pays 2:1, spread 4 or more pays 1:1, three of a kind
     pays 11:1, consecutive and non-matching pairs push, and the optional
     raise is a second even-money decision on the same spread. Published
     theoretical RTP for this pay table is approx 97.2%. */
  var ODDS={1:5,2:4,3:2};
  function oddsFor(spread){return spread>=4?1:(ODDS[spread]||1)}
  var hist=[],deck=null,c1=null,c2=null,bet0=0,totalBet=0,spread=0,phase="idle",busy=false,raised=false,timers=[];
  function later(fn,ms){var t=_bvSetTimeout(fn,ms);timers.push(t);return t}
  onCleanup(function(){for(var i=0;i<timers.length;i++)_bvClearTimeout(timers[i])});
  function cardHtml(c,cls,d){return '<div class="rd-card '+(cls||"")+(c.red?" red":"")+(ngAnim()?" rd-card-in":"")+'"'+(d?' style="animation-delay:'+(d*120)+'ms"':"")+'>'+'<div class="rk">'+c.r+'</div><div class="st">'+c.s+'</div></div>'}
  function setActions(on){
    $("#reddogRaiseBtn").style.display=on?"":"none";
    $("#reddogDealBtn").style.display=on?"":"none";
    if(on){$("#reddogRaiseBtn").disabled=raised||state.balance<bet0}
    $("#reddogPlay").disabled=on||busy;
  }
  function finish(totalPayout,label){
    phase="idle";busy=false;setActions(false);$("#reddogPlay").disabled=false;
    var mult=totalBet>0?totalPayout/totalBet:0;
    var stage=$("#reddogStage"),payout=settle("Red Dog",totalBet,mult);
    hist.unshift({t:label,w:mult>1});histChips($("#reddogHist"),hist.slice(0,12));
    $("#reddogMsg").textContent=label+(mult>1?" — Won "+fmt$(payout):(mult===1?" — Stake back":""));
    if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));if(mult>=6||totalPayout>=12*bet0){sfx.big()}else{sfx.win()}}
    else if(mult===1){stageFx(stage,"shake");sfx.click()}
    else{stageFx(stage,"lose");sfx.lose()}
  }
  function dealThird(){
    if(phase!=="spread"&&phase!=="pair")return;
    busy=true;setActions(false);
    var c3=deck.pop();
    $("#reddogThird").innerHTML=cardHtml(c3,"third",0);
    function resolve(){
      busy=false;
      if(phase==="pair"){
        if(c3.v===c1.v){finish(12*bet0,"THREE OF A KIND "+c1.r+" — 11:1")}
        else{finish(bet0,"THIRD CARD "+c3.r+" — NO MATCH, PUSH")}
      }else{
        var lo=Math.min(c1.v,c2.v),hi=Math.max(c1.v,c2.v),odds=oddsFor(spread);
        if(c3.v>lo&&c3.v<hi){finish(totalBet*(odds+1),"IN THE RED — "+c3.r+" LANDS BETWEEN AT "+odds+":1")}
        else{finish(0,"THIRD CARD "+c3.r+" — OUTSIDE OR ON A POST, LOST")}
      }
    }
    if(ngAnim()){later(resolve,420)}else{resolve()}
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("reddogBet","10.00")
    +'<button class="action-btn" id="reddogPlay" style="margin-top:16px">Deal Posts</button>'
    +'<div class="hist-row" id="reddogHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>Two cards (the posts) are dealt face up from a fresh single deck. Ranks run 2 (low) to Ace (high).</li>'
    +'<li>Consecutive ranks (differ by 1): the bet pushes immediately — total payout 1x bet.</li>'
    +'<li>Pair: a third card is dealt automatically. If it matches the pair rank it pays 11:1 (total payout 12x bet); otherwise the bet pushes (total payout 1x bet).</li>'
    +'<li>Otherwise the spread is the number of ranks strictly between the posts (rank difference minus 1). Spread payouts: spread 1 pays 5:1, spread 2 pays 4:1, spread 3 pays 2:1, spread 4 or more pays 1:1.</li>'
    +'<li>Before the third card you may Raise once — an extra bet equal to your original bet (total wager 2x bet). The spread odds then apply to the total wagered.</li>'
    +'<li>The third card wins only if its rank falls strictly between the two posts. A third card outside the posts — or equal to either post — loses the total wager.</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="reddogStage">'+gameHeaderHtml('reddog')
    +'<div class="rd-felt">'
    +'<div class="rd-posts">'
    +'<div class="rd-slot"><div class="rd-slotlabel">Post 1</div><div class="rd-cardhold" id="reddogPost1"><div class="rd-empty">?</div></div></div>'
    +'<div class="rd-mid"><span class="rd-spread" id="reddogSpread">Place a bet<br>and deal</span></div>'
    +'<div class="rd-slot"><div class="rd-slotlabel">Post 2</div><div class="rd-cardhold" id="reddogPost2"><div class="rd-empty">?</div></div></div>'
    +'</div>'
    +'<div class="rd-posts" style="margin-top:12px"><div class="rd-slot"><div class="rd-slotlabel">Third Card</div><div class="rd-cardhold" id="reddogThird"><div class="rd-empty">?</div></div></div></div>'
    +'<div class="rd-actions"><button class="action-btn" id="reddogRaiseBtn" style="display:none">Raise (add bet)</button><button class="action-btn" id="reddogDealBtn" style="display:none">Deal Third Card</button></div>'
    +'<div class="rd-msg" id="reddogMsg">Place your bet and press Deal Posts.</div>'
    +'</div></div></div>';
  wireAmount("reddogBet");
  setActions(false);
  $("#reddogPlay").addEventListener("click",function(){
    if(phase!=="idle"||busy)return;
    var bet=getBet("reddogBet");if(bet==null)return;
    bet0=bet;totalBet=bet;raised=false;charge(bet);flyChip(this,$("#reddogStage"));sfx.click();
    deck=newDeck();c1=deck.pop();c2=deck.pop();
    $("#reddogPost1").innerHTML=cardHtml(c1,"",0);
    $("#reddogPost2").innerHTML=cardHtml(c2,"",1);
    $("#reddogThird").innerHTML='<div class="rd-empty">?</div>';
    var diff=Math.abs(c1.v-c2.v);
    function afterPosts(){
      if(diff===0){
        phase="pair";spread=0;
        $("#reddogSpread").innerHTML="Pair of "+c1.r+"s<br>third card auto-dealt";
        $("#reddogMsg").textContent="Pair of "+c1.r+"s! A matching third card pays 11:1 — dealing it now.";
        dealThird();
      }else if(diff===1){
        spread=0;
        $("#reddogSpread").innerHTML="Consecutive<br>push";
        finish(totalBet,"CONSECUTIVE — PUSH");
      }else{
        spread=diff-1;phase="spread";
        var odds=oddsFor(spread);
        $("#reddogSpread").innerHTML="Spread "+spread+"<br>pays "+odds+":1";
        $("#reddogMsg").textContent="Spread of "+spread+" — pays "+odds+":1 on the total wagered. Raise once, or deal the third card."+(state.balance<bet0?" (Balance too low to Raise.)":"");
        setActions(true);
      }
    }
    if(ngAnim()){busy=true;$("#reddogPlay").disabled=true;later(function(){busy=false;$("#reddogPlay").disabled=phase!=="idle";afterPosts()},400)}else{afterPosts()}
  });
  $("#reddogRaiseBtn").addEventListener("click",function(){
    if(phase!=="spread"||busy||raised)return;
    if(state.balance<bet0){toast("Insufficient balance","You need an equal extra bet to raise.","err");return}
    charge(bet0);totalBet+=bet0;raised=true;flyChip(this,$("#reddogStage"));sfx.coin();
    $("#reddogRaiseBtn").disabled=true;
    $("#reddogMsg").textContent="Raised — total wager "+fmt$(totalBet)+" at "+oddsFor(spread)+":1. Now deal the third card.";
  });
  $("#reddogDealBtn").addEventListener("click",function(){
    if(phase!=="spread"||busy)return;sfx.click();dealThird();
  });
  addDust($("#reddogStage"),10);
};
/* ==================== GAMES42: TEXASHOLDEM ==================== */
BUILDERS.texasholdem=function(mount){
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
  /* RTP basis: standard Casino Hold'em paytable (ante bonus up to 100:1, dealer qualifies pair of 4s+) — published RTP for this exact structure is ~97.8% with basic call/fold strategy. */
  var SUITS=["\u2660","\u2665","\u2666","\u2663"],RANKS=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  function newDeck(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({r:RANKS[r],s:SUITS[s],v:r+2,red:(s===1||s===2)});for(var i=d.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=d[i];d[i]=d[j];d[j]=t}return d}
  function eval5(h){
    var vals=h.map(function(c){return c.v}).sort(function(a,b){return b-a});
    var flush=h.every(function(c){return c.s===h[0].s});
    var uniq=[];for(var i=0;i<vals.length;i++)if(uniq.indexOf(vals[i])<0)uniq.push(vals[i]);
    var sHigh=0;
    if(uniq.length===5){if(vals[0]-vals[4]===4)sHigh=vals[0];else if(vals[0]===14&&vals[1]===5&&vals[2]===4&&vals[3]===3&&vals[4]===2)sHigh=5}
    var counts={};vals.forEach(function(v){counts[v]=(counts[v]||0)+1});
    var groups=Object.keys(counts).map(function(k){return{v:parseInt(k,10),n:counts[k]}}).sort(function(a,b){return b.n-a.n||b.v-a.v});
    var cat,tb;
    if(sHigh&&flush){cat=8;tb=[sHigh]}
    else if(groups[0].n===4){cat=7;tb=[groups[0].v,groups[1].v]}
    else if(groups[0].n===3&&groups[1].n===2){cat=6;tb=[groups[0].v,groups[1].v]}
    else if(flush){cat=5;tb=vals}
    else if(sHigh){cat=4;tb=[sHigh]}
    else if(groups[0].n===3){cat=3;tb=[groups[0].v].concat(groups.slice(1).map(function(g){return g.v}))}
    else if(groups[0].n===2&&groups[1].n===2){cat=2;tb=[groups[0].v,groups[1].v,groups[2].v]}
    else if(groups[0].n===2){cat=1;tb=[groups[0].v].concat(groups.slice(1).map(function(g){return g.v}))}
    else{cat=0;tb=vals}
    return{cat:cat,tb:tb};
  }
  function cmpEv(a,b){if(a.cat!==b.cat)return a.cat-b.cat;var n=Math.max(a.tb.length,b.tb.length);for(var i=0;i<n;i++){var x=a.tb[i]||0,y=b.tb[i]||0;if(x!==y)return x-y}return 0}
  function bestOf(cards){var best=null;function rec(st,cur){if(cur.length===5){var e=eval5(cur);if(!best||cmpEv(e,best)>0)best=e;return}for(var i=st;i<cards.length;i++){cur.push(cards[i]);rec(i+1,cur);cur.pop()}}rec(0,[]);return best}
  function handName(e){var names=["High Card","Pair","Two Pair","Three of a Kind","Straight","Flush","Full House","Four of a Kind","Straight Flush"];if(e.cat===8&&e.tb[0]===14)return "Royal Flush";return names[e.cat]}
  function anteProfit(e){if(e.cat===8)return e.tb[0]===14?100:20;if(e.cat===7)return 10;if(e.cat===6)return 3;if(e.cat===5)return 2;return 1}
  function dealerQualifies(e){if(e.cat>1)return true;if(e.cat===1)return e.tb[0]>=4;return false}
  var hist=[],deck=[],pHand=[],dHand=[],comm=[],ante=0,totalBet=0,phase="idle",busy=false;
  function cardHtml(c,d){return '<div class="bac-card '+(c.red?"red ":"")+(ngAnim()?"bac-card-in":"")+'"'+(d!=null?' style="animation-delay:'+(d*90)+'ms"':"")+'>'+'<div class="rk">'+c.r+'</div><div class="st">'+c.s+'</div></div>'}
  function backHtml(d){return '<div class="bac-card thx-back'+(ngAnim()?" bac-card-in":"")+'"'+(d!=null?' style="animation-delay:'+(d*90)+'ms"':"")+'><div class="rk">?</div><div class="st">?</div></div>'}
  function render(reveal,commN){
    var dh="",ph="",ch="";
    for(var i=0;i<dHand.length;i++)dh+=reveal?cardHtml(dHand[i],i):backHtml(i);
    for(var j=0;j<pHand.length;j++)ph+=cardHtml(pHand[j],j);
    for(var k=0;k<5;k++){if(k<commN)ch+=cardHtml(comm[k],k);else ch+='<div class="thx-slot"></div>'}
    $("#texasholdemDHand").innerHTML=dh;$("#texasholdemPHand").innerHTML=ph;$("#texasholdemComm").innerHTML=ch;
    $("#texasholdemPot").textContent=ante>0?("Ante "+fmt$(ante)+" · Total bet "+fmt$(totalBet)):"Place your ante and press Deal";
  }
  function setDecide(on){
    $("#texasholdemCall").disabled=!on||state.balance<2*ante;
    $("#texasholdemFold").disabled=!on;
    $("#texasholdemPlay").disabled=on;
    if(on&&state.balance<2*ante)$("#texasholdemMsg").textContent="Not enough balance to Call — Fold only.";
  }
  function finish(totalPayout,label){
    var mult=totalBet>0?totalPayout/totalBet:0;
    var stage=$("#texasholdemStage"),payout=settle("Texas Hold'em",totalBet,mult);
    hist.unshift({t:label,w:mult>1});histChips($("#texasholdemHist"),hist.slice(0,12));
    $("#texasholdemMsg").textContent=label+(mult>1?" — Won "+fmt$(payout):(mult===1?" — Stake back":(totalPayout>0?" — Returned "+fmt$(payout):"")));
    if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));if(mult>=5)sfx.big();else sfx.win()}
    else if(mult===1||totalPayout>0){stageFx(stage,"shake");sfx.click()}
    else{stageFx(stage,"lose");sfx.lose()}
    phase="idle";busy=false;setDecide(false);$("#texasholdemPlay").disabled=false;
  }
  function showdown(){
    render(true,5);
    var pe=bestOf(pHand.concat(comm)),de=bestOf(dHand.concat(comm));
    $("#texasholdemPName").textContent="You: "+handName(pe);
    $("#texasholdemDName").textContent="Dealer: "+handName(de);
    var totalPayout=0,label="";
    if(!dealerQualifies(de)){
      totalPayout=4*ante;label="Dealer does not qualify (needs pair of 4s+) — Ante pays 1:1, Call pushes";
    }else{
      var c=cmpEv(pe,de);
      if(c>0){var prof=anteProfit(pe);totalPayout=4*ante+ante*(1+prof);label="You win — "+handName(pe)+" beats "+handName(de)+"; Ante pays "+prof+":1"}
      else if(c===0){totalPayout=3*ante;label="Tie — both bets push"}
      else{totalPayout=0;label="Dealer wins — "+handName(de)+" beats "+handName(pe)}
    }
    finish(totalPayout,label);
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("texasholdemBet","10.00")
    +'<button class="action-btn" id="texasholdemPlay" style="margin-top:16px">Deal</button>'
    +'<div class="thx-btnrow"><button class="action-btn" id="texasholdemCall" disabled>Call (2x Ante)</button><button class="action-btn" id="texasholdemFold" disabled>Fold</button></div>'
    +'<div class="hist-row" id="texasholdemHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>Your bet is the Ante. You get 2 hole cards face up, the dealer 2 face down, then a 3-card flop face up.</li>'
    +'<li>Call costs 2x your Ante (total bet 3x Ante) and the turn + river are dealt, or Fold and lose the Ante.</li>'
    +'<li>Best 5-card hand from 7 cards (your 2 + 5 community) wins. Standard poker rankings.</li>'
    +'<li>Dealer qualifies with a pair of 4s or better. If the dealer does not qualify: Ante pays 1:1 and your Call bet pushes (4x Ante returned on a 3x Ante total bet).</li>'
    +'<li>If the dealer qualifies and you win: Call pays 1:1, plus the Ante pays on your hand — Royal Flush 100:1, Straight Flush 20:1, Four of a Kind 10:1, Full House 3:1, Flush 2:1, Straight or less 1:1 (profit, stake also returned).</li>'
    +'<li>Tie vs a qualifying dealer: both bets push (3x Ante back). Lose: both bets are lost.</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="texasholdemStage">'+gameHeaderHtml('texasholdem')
    +'<div class="thx-felt">'
    +'<div class="thx-label">Dealer</div><div class="thx-hand" id="texasholdemDHand"></div><div><span class="thx-handname" id="texasholdemDName"></span></div>'
    +'<div class="thx-label">Community Cards</div><div class="thx-comm" id="texasholdemComm"></div>'
    +'<div class="thx-label">Your Hand</div><div class="thx-hand" id="texasholdemPHand"></div><div><span class="thx-handname" id="texasholdemPName"></span></div>'
    +'<div><span class="thx-pot" id="texasholdemPot"></span></div>'
    +'<div class="thx-msg" id="texasholdemMsg">Place your ante and press Deal.</div>'
    +'</div></div></div>';
  wireAmount("texasholdemBet");
  $("#texasholdemPlay").addEventListener("click",function(){
    if(busy||phase!=="idle")return;
    var bet=getBet("texasholdemBet");if(bet==null)return;
    charge(bet);flyChip(this,$("#texasholdemStage"));sfx.click();
    ante=bet;totalBet=bet;busy=true;phase="decide";
    deck=newDeck();pHand=[deck.pop(),deck.pop()];dHand=[deck.pop(),deck.pop()];comm=[deck.pop(),deck.pop(),deck.pop(),deck.pop(),deck.pop()];
    render(false,3);
    $("#texasholdemPName").textContent="";$("#texasholdemDName").textContent="";
    $("#texasholdemMsg").textContent="Flop is out — Call 2x Ante to play on, or Fold.";
    setDecide(true);busy=false;
  });
  $("#texasholdemFold").addEventListener("click",function(){
    if(phase!=="decide"||busy)return;
    busy=true;sfx.click();render(false,3);
    finish(0,"Folded — Ante lost");
  });
  $("#texasholdemCall").addEventListener("click",function(){
    if(phase!=="decide"||busy)return;
    var extra=2*ante;
    if(state.balance<extra){toast("Insufficient balance","You need "+fmt$(extra)+" to Call.","err");return}
    charge(extra);totalBet+=extra;busy=true;phase="runout";setDecide(false);sfx.coin();
    render(false,3);
    function revealTurn(){render(false,4);$("#texasholdemMsg").textContent="Turn dealt..."}
    function revealRiver(){render(false,5);$("#texasholdemMsg").textContent="River dealt — showdown!";showdown()}
    if(ngAnim()){_bvSetTimeout(revealTurn,420);_bvSetTimeout(revealRiver,840)}
    else{revealRiver()}
  });
  addDust($("#texasholdemStage"),10);
};
/* ==================== GAMES42: HOLDEMTABLE ==================== */
BUILDERS.holdemtable=function(mount){
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
  /* RTP basis: pot is 6x bet, house rake is exactly 3% (winner receives 5.82x bet), so RTP is a flat 97.0% whenever the player wins or splits; ties split the raked pot equally. */
  var SUITS=["\u2660","\u2665","\u2666","\u2663"],RANKS=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  var NAMES=["You","Marco","Yuki","Priya","Diego","Sana"];
  var COLS=["#ffd479","#f5b942","#60a5fa","#f472b6","#2dd4bf","#a78bfa"];
  function newDeck(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({r:RANKS[r],s:SUITS[s],v:r+2,red:(s===1||s===2)});for(var i=d.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=d[i];d[i]=d[j];d[j]=t}return d}
  function eval5(h){
    var vals=h.map(function(c){return c.v}).sort(function(a,b){return b-a});
    var flush=h.every(function(c){return c.s===h[0].s});
    var uniq=[];for(var i=0;i<vals.length;i++)if(uniq.indexOf(vals[i])<0)uniq.push(vals[i]);
    var sHigh=0;
    if(uniq.length===5){if(vals[0]-vals[4]===4)sHigh=vals[0];else if(vals[0]===14&&vals[1]===5&&vals[2]===4&&vals[3]===3&&vals[4]===2)sHigh=5}
    var counts={};vals.forEach(function(v){counts[v]=(counts[v]||0)+1});
    var groups=Object.keys(counts).map(function(k){return{v:parseInt(k,10),n:counts[k]}}).sort(function(a,b){return b.n-a.n||b.v-a.v});
    var cat,tb;
    if(sHigh&&flush){cat=8;tb=[sHigh]}
    else if(groups[0].n===4){cat=7;tb=[groups[0].v,groups[1].v]}
    else if(groups[0].n===3&&groups[1].n===2){cat=6;tb=[groups[0].v,groups[1].v]}
    else if(flush){cat=5;tb=vals}
    else if(sHigh){cat=4;tb=[sHigh]}
    else if(groups[0].n===3){cat=3;tb=[groups[0].v].concat(groups.slice(1).map(function(g){return g.v}))}
    else if(groups[0].n===2&&groups[1].n===2){cat=2;tb=[groups[0].v,groups[1].v,groups[2].v]}
    else if(groups[0].n===2){cat=1;tb=[groups[0].v].concat(groups.slice(1).map(function(g){return g.v}))}
    else{cat=0;tb=vals}
    return{cat:cat,tb:tb};
  }
  function cmpEv(a,b){if(a.cat!==b.cat)return a.cat-b.cat;var n=Math.max(a.tb.length,b.tb.length);for(var i=0;i<n;i++){var x=a.tb[i]||0,y=b.tb[i]||0;if(x!==y)return x-y}return 0}
  function bestOf(cards){var best=null;function rec(st,cur){if(cur.length===5){var e=eval5(cur);if(!best||cmpEv(e,best)>0)best=e;return}for(var i=st;i<cards.length;i++){cur.push(cards[i]);rec(i+1,cur);cur.pop()}}rec(0,[]);return best}
  function handName(e){var names=["High Card","Pair","Two Pair","Three of a Kind","Straight","Flush","Full House","Four of a Kind","Straight Flush"];if(e.cat===8&&e.tb[0]===14)return "Royal Flush";return names[e.cat]}
  var hist=[],deck=[],holes=[],comm=[],bet0=0,busy=false,timers=[];
  function later(fn,ms){if(ngAnim()){var id=_bvSetTimeout(fn,ms);timers.push(id)}else{fn()}}
  onCleanup(function(){for(var i=0;i<timers.length;i++)_bvClearTimeout(timers[i]);timers=[]});
  function miniHtml(c){return '<div class="htb-card'+(c.red?" red":"")+'"><div class="rk">'+c.r+'</div><div class="st">'+c.s+'</div></div>'}
  function miniBack(){return '<div class="htb-card htb-back"><div class="rk">?</div><div class="st">?</div></div>'}
  function bigHtml(c,d){return '<div class="bac-card '+(c.red?"red ":"")+(ngAnim()?"bac-card-in":"")+'"'+(d!=null?' style="animation-delay:'+(d*90)+'ms"':"")+'>'+'<div class="rk">'+c.r+'</div><div class="st">'+c.s+'</div></div>'}
  function renderSeats(reveal,evals,winners){
    var htm="";
    for(var i=0;i<6;i++){
      var cards="";
      if(holes[i]){for(var j=0;j<2;j++){cards+=(reveal||i===0)?miniHtml(holes[i][j]):miniBack()}}
      htm+='<div class="htb-seat'+(winners&&winners.indexOf(i)>=0?" htb-win":"")+'" id="holdemtableSeat'+i+'">'
        +'<span class="htb-av" style="background:'+COLS[i]+'">'+NAMES[i].charAt(0)+'</span>'
        +'<div class="htb-name">'+NAMES[i]+(i===0?" (You)":"")+'</div>'
        +'<div class="htb-cards">'+cards+'</div>'
        +'<div class="htb-hname">'+(reveal&&evals?handName(evals[i]):(holes[i]?"Ante "+fmt$(bet0):""))+'</div></div>';
    }
    $("#holdemtableSeats").innerHTML=htm;
  }
  function renderComm(n){
    var ch="";
    for(var k=0;k<5;k++){if(k<n)ch+=bigHtml(comm[k],k);else ch+='<div class="htb-slot"></div>'}
    $("#holdemtableComm").innerHTML=ch;
  }
  function showdown(){
    var evals=[];
    for(var i=0;i<6;i++)evals.push(bestOf(holes[i].concat(comm)));
    var bestE=evals[0];for(var m=1;m<6;m++)if(cmpEv(evals[m],bestE)>0)bestE=evals[m];
    var winners=[];for(var w=0;w<6;w++)if(cmpEv(evals[w],bestE)===0)winners.push(w);
    renderSeats(true,evals,winners);renderComm(5);
    $("#holdemtableStatus").textContent="Showdown — best hand: "+handName(bestE);
    var totalPayout=0,label="";
    var potTotal=5.82*bet0;
    if(winners.indexOf(0)>=0){
      totalPayout=potTotal/winners.length;
      label=winners.length===1?("You win the pot — "+handName(evals[0])):("Split pot ("+winners.length+" ways) — "+handName(evals[0]));
    }else{
      var wn=winners.map(function(i){return NAMES[i]}).join(", ");
      label=wn+" wins — "+handName(bestE);
    }
    var mult=bet0>0?totalPayout/bet0:0;
    var stage=$("#holdemtableStage"),payout=settle("Hold'em Table",bet0,mult);
    hist.unshift({t:label,w:mult>1});histChips($("#holdemtableHist"),hist.slice(0,12));
    $("#holdemtableMsg").textContent=label+(mult>1?" — Won "+fmt$(payout):(totalPayout>0?" — Returned "+fmt$(payout):" — You lost the pot"));
    if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win()}
    else if(totalPayout>0){stageFx(stage,"shake");sfx.click()}
    else{stageFx(stage,"lose");sfx.lose()}
    busy=false;$("#holdemtablePlay").disabled=false;
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("holdemtableBet","10.00")
    +'<button class="action-btn" id="holdemtablePlay" style="margin-top:16px">Sit &amp; Deal</button>'
    +'<div class="hist-row" id="holdemtableHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>Six seats: You plus 5 AI rivals (Marco, Yuki, Priya, Diego, Sana). Only you pay real money — your entry is the bet; AI antes are virtual chips shown for flavor.</li>'
    +'<li>The pot is 6x your bet. Everyone is dealt 2 hole cards; 5 community cards follow (flop, turn, river) and the best 5-card hand from 7 wins. Standard poker rankings.</li>'
    +'<li>The house takes a 3% rake from the pot. A sole winner receives 5.82x the bet (6x pot minus 3% rake).</li>'
    +'<li>Tied best hands split the raked pot equally: your share is 5.82x bet divided by the number of tied winners (paid only if you are one of them).</li>'
    +'<li>If an AI seat holds the best hand alone, or you are not among the tied winners, you lose your entry.</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="holdemtableStage">'+gameHeaderHtml('holdemtable')
    +'<div class="htb-felt">'
    +'<div class="htb-seats" id="holdemtableSeats"></div>'
    +'<div><span class="htb-pot" id="holdemtablePot">Pot: —</span></div>'
    +'<div class="htb-comm" id="holdemtableComm"></div>'
    +'<div class="htb-status" id="holdemtableStatus">Press Sit &amp; Deal to take your seat.</div>'
    +'<div class="htb-msg" id="holdemtableMsg"></div>'
    +'</div></div></div>';
  wireAmount("holdemtableBet");
  renderSeats(false,null,null);renderComm(0);
  $("#holdemtablePlay").addEventListener("click",function(){
    if(busy)return;
    var bet=getBet("holdemtableBet");if(bet==null)return;
    charge(bet);flyChip(this,$("#holdemtableStage"));sfx.click();
    bet0=bet;busy=true;this.disabled=true;
    deck=newDeck();holes=[];for(var i=0;i<6;i++)holes.push([deck.pop(),deck.pop()]);
    comm=[deck.pop(),deck.pop(),deck.pop(),deck.pop(),deck.pop()];
    renderSeats(false,null,null);renderComm(0);
    $("#holdemtablePot").textContent="Pot: "+fmt$(6*bet0)+" (6 x "+fmt$(bet0)+")";
    $("#holdemtableMsg").textContent="";
    $("#holdemtableStatus").textContent="Hole cards dealt — flop coming...";
    later(function(){$("#holdemtableStatus").textContent="Flop";renderComm(3);sfx.click()},700);
    later(function(){$("#holdemtableStatus").textContent="Turn";renderComm(4);sfx.click()},1400);
    later(function(){$("#holdemtableStatus").textContent="River";renderComm(5);sfx.click()},2100);
    later(function(){showdown()},2800);
  });
  addDust($("#holdemtableStage"),10);
};
/* ==================== GAMES42: THREECARDPOKER ==================== */
BUILDERS.threecardpoker=function(mount){
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
  /* RTP basis: standard Three Card Poker — Ante/Play RTP ~96.6% with Q-6-4 play strategy; Pair Plus paytable (40/30/6/3/1) is the standard published table. */
  var SUITS=["\u2660","\u2665","\u2666","\u2663"],RANKS=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  function newDeck(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({r:RANKS[r],s:SUITS[s],v:r+2,red:(s===1||s===2)});for(var i=d.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=d[i];d[i]=d[j];d[j]=t}return d}
  function eval3(h){
    var vals=h.map(function(c){return c.v}).sort(function(a,b){return b-a});
    var flush=h.every(function(c){return c.s===h[0].s});
    var uniq=[];for(var i=0;i<vals.length;i++)if(uniq.indexOf(vals[i])<0)uniq.push(vals[i]);
    var sHigh=0;
    if(uniq.length===3){if(vals[0]-vals[2]===2)sHigh=vals[0];else if(vals[0]===14&&vals[1]===3&&vals[2]===2)sHigh=3}
    var counts={};vals.forEach(function(v){counts[v]=(counts[v]||0)+1});
    var groups=Object.keys(counts).map(function(k){return{v:parseInt(k,10),n:counts[k]}}).sort(function(a,b){return b.n-a.n||b.v-a.v});
    var cat,tb;
    if(sHigh&&flush){cat=5;tb=[sHigh]}
    else if(groups[0].n===3){cat=4;tb=[groups[0].v]}
    else if(sHigh){cat=3;tb=[sHigh]}
    else if(flush){cat=2;tb=vals}
    else if(groups[0].n===2){cat=1;tb=[groups[0].v,groups[1].v]}
    else{cat=0;tb=vals}
    return{cat:cat,tb:tb};
  }
  function cmpEv(a,b){if(a.cat!==b.cat)return a.cat-b.cat;var n=Math.max(a.tb.length,b.tb.length);for(var i=0;i<n;i++){var x=a.tb[i]||0,y=b.tb[i]||0;if(x!==y)return x-y}return 0}
  function handName3(e){var names=["High Card","Pair","Flush","Straight","Three of a Kind","Straight Flush"];return names[e.cat]}
  function ppOdds(e){if(e.cat===5)return 40;if(e.cat===4)return 30;if(e.cat===3)return 6;if(e.cat===2)return 3;if(e.cat===1)return 1;return -1}
  function anteBonus(e,ante){if(e.cat===5)return 5*ante;if(e.cat===4)return 4*ante;if(e.cat===3)return 1*ante;return 0}
  var hist=[],deck=[],pHand=[],dHand=[],ante=0,pp=0,totalBet=0,phase="idle",busy=false;
  function cardHtml(c,d){return '<div class="bac-card '+(c.red?"red ":"")+(ngAnim()?"bac-card-in":"")+'"'+(d!=null?' style="animation-delay:'+(d*90)+'ms"':"")+'>'+'<div class="rk">'+c.r+'</div><div class="st">'+c.s+'</div></div>'}
  function backHtml(d){return '<div class="bac-card tcp-back'+(ngAnim()?" bac-card-in":"")+'"'+(d!=null?' style="animation-delay:'+(d*90)+'ms"':"")+'><div class="rk">?</div><div class="st">?</div></div>'}
  function render(reveal){
    var dh="",ph="";
    for(var i=0;i<dHand.length;i++)dh+=reveal?cardHtml(dHand[i],i):backHtml(i);
    for(var j=0;j<pHand.length;j++)ph+=cardHtml(pHand[j],j);
    $("#threecardpokerDHand").innerHTML=dh;$("#threecardpokerPHand").innerHTML=ph;
    $("#threecardpokerPot").textContent=ante>0?("Ante "+fmt$(ante)+(pp>0?" · Pair Plus "+fmt$(pp):"")+" · Total bet "+fmt$(totalBet)):"Place your Ante and press Deal";
  }
  function setDecide(on){
    $("#threecardpokerPlayBtn").disabled=!on||state.balance<ante;
    $("#threecardpokerFold").disabled=!on;
    $("#threecardpokerDeal").disabled=on;
  }
  function finish(totalPayout,label){
    var mult=totalBet>0?totalPayout/totalBet:0;
    var stage=$("#threecardpokerStage"),payout=settle("Three Card Poker",totalBet,mult);
    hist.unshift({t:label,w:mult>1});histChips($("#threecardpokerHist"),hist.slice(0,12));
    $("#threecardpokerMsg").textContent=label+(mult>1?" — Won "+fmt$(payout):(mult===1?" — Stake back":(totalPayout>0?" — Returned "+fmt$(payout):"")));
    if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));if(mult>=5)sfx.big();else sfx.win()}
    else if(mult===1||totalPayout>0){stageFx(stage,"shake");sfx.click()}
    else{stageFx(stage,"lose");sfx.lose()}
    phase="idle";busy=false;setDecide(false);$("#threecardpokerDeal").disabled=false;
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("threecardpokerBet","10.00")
    +'<div class="field"><label>Pair Plus (optional side bet)</label><div class="amount-row">'
    +'<div class="amount-in"><span class="coin-dot">$</span><input id="threecardpokerPP" type="number" min="0" step="0.01" value="0.00" /></div>'
    +'<button class="mini-btn" data-half="threecardpokerPP">½</button><button class="mini-btn" data-double="threecardpokerPP">2×</button></div></div>'
    +'<button class="action-btn" id="threecardpokerDeal" style="margin-top:16px">Deal</button>'
    +'<div class="tcp-btnrow"><button class="action-btn" id="threecardpokerPlayBtn" disabled>Play (1x Ante)</button><button class="action-btn" id="threecardpokerFold" disabled>Fold</button></div>'
    +'<div class="hist-row" id="threecardpokerHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>Your main bet is the Ante. The optional Pair Plus side bet (enter 0 for none) is charged with the Ante at the deal.</li>'
    +'<li>3-card rankings: Straight Flush &gt; Three of a Kind &gt; Straight &gt; Flush &gt; Pair &gt; High Card. A straight beats a flush. Straights run A-K-Q (high) down to A-2-3 (low).</li>'
    +'<li>Play costs an extra bet equal to the Ante, or Fold and lose the Ante (Pair Plus still settles).</li>'
    +'<li>Pair Plus pays on your hand whether you play or fold: Straight Flush 40:1, Three of a Kind 30:1, Straight 6:1, Flush 3:1, Pair 1:1 (profit, stake also returned). No pair or better: Pair Plus loses.</li>'
    +'<li>Dealer qualifies with Queen-high or better (a pair, or any hand whose top card is Q, K or A). No qualify: Ante pays 1:1 and the Play bet pushes.</li>'
    +'<li>Dealer qualifies — you win: Ante and Play both pay 1:1. Tie: both push. Lose: both are lost.</li>'
    +'<li>Ante Bonus, paid on played hands (never on a fold, and paid even if the dealer does not qualify): Straight Flush 5x Ante, Three of a Kind 4x Ante, Straight 1x Ante (profit, added on top).</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="threecardpokerStage">'+gameHeaderHtml('threecardpoker')
    +'<div class="tcp-felt">'
    +'<div class="tcp-label">Dealer</div><div class="tcp-hand" id="threecardpokerDHand"></div><div><span class="tcp-handname" id="threecardpokerDName"></span></div>'
    +'<div class="tcp-label">Your Hand</div><div class="tcp-hand" id="threecardpokerPHand"></div><div><span class="tcp-handname" id="threecardpokerPName"></span></div>'
    +'<div><span class="tcp-pot" id="threecardpokerPot"></span></div>'
    +'<div class="tcp-msg" id="threecardpokerMsg">Place your Ante and press Deal.</div>'
    +'</div></div></div>';
  wireAmount("threecardpokerBet");wireAmount("threecardpokerPP");
  $("#threecardpokerDeal").addEventListener("click",function(){
    if(busy||phase!=="idle")return;
    var bet=getBet("threecardpokerBet");if(bet==null)return;
    var ppRaw=parseFloat($("#threecardpokerPP").value);
    if(isNaN(ppRaw)||ppRaw<0){toast("Invalid Pair Plus","Enter 0 or an amount above $0.","err");return}
    var ppv=Math.round(ppRaw*100)/100;
    if(ppv>state.balance-bet){toast("Insufficient balance","Pair Plus must fit your balance after the Ante.","err");return}
    charge(bet+ppv);flyChip(this,$("#threecardpokerStage"));sfx.click();
    ante=bet;pp=ppv;totalBet=bet+ppv;busy=true;phase="decide";
    deck=newDeck();pHand=[deck.pop(),deck.pop(),deck.pop()];dHand=[deck.pop(),deck.pop(),deck.pop()];
    render(false);
    var pe=eval3(pHand);
    $("#threecardpokerPName").textContent="You: "+handName3(pe);
    $("#threecardpokerDName").textContent="";
    $("#threecardpokerMsg").textContent="You have "+handName3(pe)+" — Play 1x Ante or Fold."+(state.balance<ante?" Not enough balance to Play — Fold only.":"");
    setDecide(true);busy=false;
  });
  $("#threecardpokerFold").addEventListener("click",function(){
    if(phase!=="decide"||busy)return;
    busy=true;sfx.click();
    var pe=eval3(pHand),odds=ppOdds(pe),ppComp=(pp>0&&odds>=0)?pp*(odds+1):0;
    render(true);
    $("#threecardpokerDName").textContent="Dealer: "+handName3(eval3(dHand));
    var label="Folded — Ante lost"+(ppComp>0?"; Pair Plus "+handName3(pe)+" pays "+odds+":1":"");
    finish(ppComp,label);
  });
  $("#threecardpokerPlayBtn").addEventListener("click",function(){
    if(phase!=="decide"||busy)return;
    if(state.balance<ante){toast("Insufficient balance","You need "+fmt$(ante)+" to Play.","err");return}
    charge(ante);totalBet+=ante;busy=true;phase="show";setDecide(false);sfx.coin();
    render(true);
    var pe=eval3(pHand),de=eval3(dHand);
    $("#threecardpokerPName").textContent="You: "+handName3(pe);
    $("#threecardpokerDName").textContent="Dealer: "+handName3(de);
    var odds=ppOdds(pe),ppComp=(pp>0&&odds>=0)?pp*(odds+1):0;
    var bonus=anteBonus(pe,ante);
    var qualifies=de.cat>=1||de.tb[0]>=12;
    var base=0,outcome="";
    if(!qualifies){base=3*ante;outcome="Dealer does not qualify (needs Q-high+) — Ante pays 1:1, Play pushes"}
    else{
      var c=cmpEv(pe,de);
      if(c>0){base=4*ante;outcome="You win — "+handName3(pe)+" beats "+handName3(de)}
      else if(c===0){base=2*ante;outcome="Tie — Ante and Play push"}
      else{base=0;outcome="Dealer wins — "+handName3(de)+" beats "+handName3(pe)}
    }
    var label=outcome+(ppComp>0?"; Pair Plus pays "+odds+":1":"")+(bonus>0?"; Ante Bonus +"+fmt$(bonus):"");
    finish(base+ppComp+bonus,label);
  });
  addDust($("#threecardpokerStage"),10);
};
/* ==================== GAMES42: CARIBBEANSTUD ==================== */
BUILDERS.caribbeanstud=function(mount){
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
  /* RTP basis: standard Caribbean Stud paytable on the raise bet (Royal 100:1 down to Pair/AK 1:1) with Ace-King dealer qualification — the published RTP for this exact classic paytable is ~94.8% (element of risk basis, optimal raise/fold strategy). */
  var SUITS=["\u2660","\u2665","\u2666","\u2663"],RANKS=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  function newDeck(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({r:RANKS[r],s:SUITS[s],v:r+2,red:(s===1||s===2)});for(var i=d.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=d[i];d[i]=d[j];d[j]=t}return d}
  function eval5(h){
    var vals=h.map(function(c){return c.v}).sort(function(a,b){return b-a});
    var flush=h.every(function(c){return c.s===h[0].s});
    var uniq=[];for(var i=0;i<vals.length;i++)if(uniq.indexOf(vals[i])<0)uniq.push(vals[i]);
    var sHigh=0;
    if(uniq.length===5){if(vals[0]-vals[4]===4)sHigh=vals[0];else if(vals[0]===14&&vals[1]===5&&vals[2]===4&&vals[3]===3&&vals[4]===2)sHigh=5}
    var counts={};vals.forEach(function(v){counts[v]=(counts[v]||0)+1});
    var groups=Object.keys(counts).map(function(k){return{v:parseInt(k,10),n:counts[k]}}).sort(function(a,b){return b.n-a.n||b.v-a.v});
    var cat,tb;
    if(sHigh&&flush){cat=8;tb=[sHigh]}
    else if(groups[0].n===4){cat=7;tb=[groups[0].v,groups[1].v]}
    else if(groups[0].n===3&&groups[1].n===2){cat=6;tb=[groups[0].v,groups[1].v]}
    else if(flush){cat=5;tb=vals}
    else if(sHigh){cat=4;tb=[sHigh]}
    else if(groups[0].n===3){cat=3;tb=[groups[0].v].concat(groups.slice(1).map(function(g){return g.v}))}
    else if(groups[0].n===2&&groups[1].n===2){cat=2;tb=[groups[0].v,groups[1].v,groups[2].v]}
    else if(groups[0].n===2){cat=1;tb=[groups[0].v].concat(groups.slice(1).map(function(g){return g.v}))}
    else{cat=0;tb=vals}
    return{cat:cat,tb:tb};
  }
  function cmpEv(a,b){if(a.cat!==b.cat)return a.cat-b.cat;var n=Math.max(a.tb.length,b.tb.length);for(var i=0;i<n;i++){var x=a.tb[i]||0,y=b.tb[i]||0;if(x!==y)return x-y}return 0}
  function handName(e){var names=["High Card","Pair","Two Pair","Three of a Kind","Straight","Flush","Full House","Four of a Kind","Straight Flush"];if(e.cat===8&&e.tb[0]===14)return "Royal Flush";return names[e.cat]}
  function hasAK(h){var hasA=false,hasK=false;for(var i=0;i<h.length;i++){if(h[i].v===14)hasA=true;if(h[i].v===13)hasK=true}return hasA&&hasK}
  function dealerQualifies(h,e){if(e.cat>=1)return true;return hasAK(h)}
  function raiseOdds(e){if(e.cat===8)return e.tb[0]===14?100:50;if(e.cat===7)return 20;if(e.cat===6)return 7;if(e.cat===5)return 5;if(e.cat===4)return 4;if(e.cat===3)return 3;if(e.cat===2)return 2;return 1}
  var hist=[],deck=[],pHand=[],dHand=[],ante=0,totalBet=0,phase="idle",busy=false;
  function cardHtml(c,d){return '<div class="bac-card '+(c.red?"red ":"")+(ngAnim()?"bac-card-in":"")+'"'+(d!=null?' style="animation-delay:'+(d*90)+'ms"':"")+'>'+'<div class="rk">'+c.r+'</div><div class="st">'+c.s+'</div></div>'}
  function backHtml(d){return '<div class="bac-card cst-back'+(ngAnim()?" bac-card-in":"")+'"'+(d!=null?' style="animation-delay:'+(d*90)+'ms"':"")+'><div class="rk">?</div><div class="st">?</div></div>'}
  function render(revealAll){
    var dh="",ph="";
    for(var i=0;i<dHand.length;i++){if(i===0||revealAll)dh+=cardHtml(dHand[i],i);else dh+=backHtml(i)}
    for(var j=0;j<pHand.length;j++)ph+=cardHtml(pHand[j],j);
    $("#caribbeanstudDHand").innerHTML=dh;$("#caribbeanstudPHand").innerHTML=ph;
    $("#caribbeanstudPot").textContent=ante>0?("Ante "+fmt$(ante)+" · Total bet "+fmt$(totalBet)):"Place your Ante and press Deal";
  }
  function setDecide(on){
    $("#caribbeanstudRaise").disabled=!on||state.balance<2*ante;
    $("#caribbeanstudFold").disabled=!on;
    $("#caribbeanstudPlay").disabled=on;
  }
  function finish(totalPayout,label){
    var mult=totalBet>0?totalPayout/totalBet:0;
    var stage=$("#caribbeanstudStage"),payout=settle("Caribbean Stud",totalBet,mult);
    hist.unshift({t:label,w:mult>1});histChips($("#caribbeanstudHist"),hist.slice(0,12));
    $("#caribbeanstudMsg").textContent=label+(mult>1?" — Won "+fmt$(payout):(mult===1?" — Stake back":(totalPayout>0?" — Returned "+fmt$(payout):"")));
    if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));if(mult>=5)sfx.big();else sfx.win()}
    else if(mult===1||totalPayout>0){stageFx(stage,"shake");sfx.click()}
    else{stageFx(stage,"lose");sfx.lose()}
    phase="idle";busy=false;setDecide(false);$("#caribbeanstudPlay").disabled=false;
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("caribbeanstudBet","10.00")
    +'<button class="action-btn" id="caribbeanstudPlay" style="margin-top:16px">Deal</button>'
    +'<div class="cst-btnrow"><button class="action-btn" id="caribbeanstudRaise" disabled>Raise (2x Ante)</button><button class="action-btn" id="caribbeanstudFold" disabled>Fold</button></div>'
    +'<div class="hist-row" id="caribbeanstudHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>Your bet is the Ante. You are dealt 5 cards face up; the dealer gets 5 cards with exactly one face up.</li>'
    +'<li>Raise costs 2x your Ante (total bet 3x Ante) to go to showdown, or Fold and lose the Ante.</li>'
    +'<li>Dealer qualifies with Ace-King high or any pair or better. If the dealer does not qualify: Ante pays 1:1 and the Raise bet pushes (4x Ante returned on a 3x Ante total bet).</li>'
    +'<li>If the dealer qualifies and you win: Ante pays 1:1, and the Raise (2x Ante) pays on your hand — Royal Flush 100:1, Straight Flush 50:1, Four of a Kind 20:1, Full House 7:1, Flush 5:1, Straight 4:1, Three of a Kind 3:1, Two Pair 2:1, Pair or Ace-King 1:1 (profit on the Raise amount, Raise stake also returned).</li>'
    +'<li>Tie vs a qualifying dealer: all bets push (3x Ante back). Lose: both bets are lost. Standard 5-card poker rankings.</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="caribbeanstudStage">'+gameHeaderHtml('caribbeanstud')
    +'<div class="cst-felt">'
    +'<div class="cst-label">Dealer (one card up)</div><div class="cst-hand" id="caribbeanstudDHand"></div><div><span class="cst-handname" id="caribbeanstudDName"></span></div>'
    +'<div class="cst-label">Your Hand</div><div class="cst-hand" id="caribbeanstudPHand"></div><div><span class="cst-handname" id="caribbeanstudPName"></span></div>'
    +'<div><span class="cst-pot" id="caribbeanstudPot"></span></div>'
    +'<div class="cst-msg" id="caribbeanstudMsg">Place your Ante and press Deal.</div>'
    +'</div></div></div>';
  wireAmount("caribbeanstudBet");
  $("#caribbeanstudPlay").addEventListener("click",function(){
    if(busy||phase!=="idle")return;
    var bet=getBet("caribbeanstudBet");if(bet==null)return;
    charge(bet);flyChip(this,$("#caribbeanstudStage"));sfx.click();
    ante=bet;totalBet=bet;busy=true;phase="decide";
    deck=newDeck();pHand=[deck.pop(),deck.pop(),deck.pop(),deck.pop(),deck.pop()];dHand=[deck.pop(),deck.pop(),deck.pop(),deck.pop(),deck.pop()];
    render(false);
    $("#caribbeanstudPName").textContent="You: "+handName(eval5(pHand));
    $("#caribbeanstudDName").textContent="Up card: "+dHand[0].r+dHand[0].s;
    $("#caribbeanstudMsg").textContent="Raise 2x Ante to play on, or Fold."+(state.balance<2*ante?" Not enough balance to Raise — Fold only.":"");
    setDecide(true);busy=false;
  });
  $("#caribbeanstudFold").addEventListener("click",function(){
    if(phase!=="decide"||busy)return;
    busy=true;sfx.click();
    finish(0,"Folded — Ante lost");
  });
  $("#caribbeanstudRaise").addEventListener("click",function(){
    if(phase!=="decide"||busy)return;
    var extra=2*ante;
    if(state.balance<extra){toast("Insufficient balance","You need "+fmt$(extra)+" to Raise.","err");return}
    charge(extra);totalBet+=extra;busy=true;phase="show";setDecide(false);sfx.coin();
    render(true);
    var pe=eval5(pHand),de=eval5(dHand);
    $("#caribbeanstudPName").textContent="You: "+handName(pe);
    $("#caribbeanstudDName").textContent="Dealer: "+handName(de)+(hasAK(dHand)&&de.cat===0?" (Ace-King)":"");
    var totalPayout=0,label="";
    if(!dealerQualifies(dHand,de)){
      totalPayout=4*ante;label="Dealer does not qualify (needs Ace-King or a pair) — Ante pays 1:1, Raise pushes";
    }else{
      var c=cmpEv(pe,de);
      if(c>0){var odds=raiseOdds(pe);totalPayout=2*ante+(2*ante)*(odds+1);label="You win — "+handName(pe)+"; Raise pays "+odds+":1"}
      else if(c===0){totalPayout=3*ante;label="Tie — all bets push"}
      else{totalPayout=0;label="Dealer wins — "+handName(de)+" beats "+handName(pe)}
    }
    finish(totalPayout,label);
  });
  addDust($("#caribbeanstudStage"),10);
};
/* ==================== GAMES42: PAIGOW ==================== */
BUILDERS.paigow=function(mount){
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
  /* RTP basis: standard Pai Gow Poker with 5% commission on wins (0.95:1), copies go to the dealer, no joker, house-way setting for both sides — published RTP for this structure is ~97.0% with house-way play. */
  var SUITS=["\u2660","\u2665","\u2666","\u2663"],RANKS=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  function newDeck(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({r:RANKS[r],s:SUITS[s],v:r+2,red:(s===1||s===2)});for(var i=d.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=d[i];d[i]=d[j];d[j]=t}return d}
  function eval5(h){
    var vals=h.map(function(c){return c.v}).sort(function(a,b){return b-a});
    var flush=h.every(function(c){return c.s===h[0].s});
    var uniq=[];for(var i=0;i<vals.length;i++)if(uniq.indexOf(vals[i])<0)uniq.push(vals[i]);
    var sHigh=0;
    if(uniq.length===5){if(vals[0]-vals[4]===4)sHigh=vals[0];else if(vals[0]===14&&vals[1]===5&&vals[2]===4&&vals[3]===3&&vals[4]===2)sHigh=5}
    var counts={};vals.forEach(function(v){counts[v]=(counts[v]||0)+1});
    var groups=Object.keys(counts).map(function(k){return{v:parseInt(k,10),n:counts[k]}}).sort(function(a,b){return b.n-a.n||b.v-a.v});
    var cat,tb;
    if(sHigh&&flush){cat=8;tb=[sHigh]}
    else if(groups[0].n===4){cat=7;tb=[groups[0].v,groups[1].v]}
    else if(groups[0].n===3&&groups[1].n===2){cat=6;tb=[groups[0].v,groups[1].v]}
    else if(flush){cat=5;tb=vals}
    else if(sHigh){cat=4;tb=[sHigh]}
    else if(groups[0].n===3){cat=3;tb=[groups[0].v].concat(groups.slice(1).map(function(g){return g.v}))}
    else if(groups[0].n===2&&groups[1].n===2){cat=2;tb=[groups[0].v,groups[1].v,groups[2].v]}
    else if(groups[0].n===2){cat=1;tb=[groups[0].v].concat(groups.slice(1).map(function(g){return g.v}))}
    else{cat=0;tb=vals}
    return{cat:cat,tb:tb};
  }
  function eval2(h){
    var vals=h.map(function(c){return c.v}).sort(function(a,b){return b-a});
    if(vals[0]===vals[1])return{cat:1,tb:[vals[0]]};
    return{cat:0,tb:vals};
  }
  function cmpEv(a,b){if(a.cat!==b.cat)return a.cat-b.cat;var n=Math.max(a.tb.length,b.tb.length);for(var i=0;i<n;i++){var x=a.tb[i]||0,y=b.tb[i]||0;if(x!==y)return x-y}return 0}
  function cmpCross(lowE,highE){return cmpEv(lowE,highE)}
  function handName(e){var names=["High Card","Pair","Two Pair","Three of a Kind","Straight","Flush","Full House","Four of a Kind","Straight Flush"];if(e.cat===8&&e.tb[0]===14)return "Royal Flush";return names[e.cat]}
  function handName2(e){return e.cat===1?"Pair":("High Card "+(e.tb[0]===14?"A":e.tb[0]===13?"K":e.tb[0]===12?"Q":e.tb[0]===11?"J":""+e.tb[0]))}
  function houseWay(cards){
    var best=null;
    for(var i=0;i<cards.length;i++)for(var j=i+1;j<cards.length;j++){
      var low=[cards[i],cards[j]],high=[];
      for(var k=0;k<cards.length;k++)if(k!==i&&k!==j)high.push(cards[k]);
      var le=eval2(low),he=eval5(high);
      if(cmpCross(le,he)>0)continue;
      if(!best){best={low:low,high:high,le:le,he:he};continue}
      var ch=cmpEv(he,best.he);
      if(ch>0||(ch===0&&cmpEv(le,best.le)>0))best={low:low,high:high,le:le,he:he};
    }
    if(!best){var s=cards.slice().sort(function(a,b){return a.v-b.v});best={low:[s[0],s[1]],high:s.slice(2),le:eval2([s[0],s[1]]),he:eval5(s.slice(2))}}
    return best;
  }
  var hist=[],deck=[],pCards=[],dCards=[],highArr=[],lowArr=[],bet0=0,phase="idle",busy=false;
  function cardHtml(c,d,extra){return '<div class="bac-card '+(c.red?"red ":"")+(extra||"")+(ngAnim()?"bac-card-in":"")+'" data-cid="'+c.cid+'"'+(d!=null?' style="animation-delay:'+(d*70)+'ms"':"")+'>'+'<div class="rk">'+c.r+'</div><div class="st">'+c.s+'</div></div>'}
  function backHtml(d){return '<div class="bac-card pgw-back'+(ngAnim()?" bac-card-in":"")+'"'+(d!=null?' style="animation-delay:'+(d*70)+'ms"':"")+'><div class="rk">?</div><div class="st">?</div></div>'}
  function findCard(cid){for(var i=0;i<pCards.length;i++)if(pCards[i].cid===cid)return pCards[i];return null}
  function inLow(c){return lowArr.indexOf(c)>=0}
  function renderPlayer(){
    var hh="",lh="";
    for(var i=0;i<highArr.length;i++)hh+=cardHtml(highArr[i],i,"pgw-click ");
    for(var j=0;j<lowArr.length;j++)lh+=cardHtml(lowArr[j],j,"pgw-click pg-sel ");
    $("#paigowHigh").innerHTML=hh||'<span class="pgw-handname">—</span>';
    $("#paigowLow").innerHTML=lh||'<span class="pgw-handname">Click cards above to move 2 here</span>';
    $("#paigowHighName").textContent=highArr.length===5?("High: "+handName(eval5(highArr))):("High: "+highArr.length+" cards");
    $("#paigowLowName").textContent=lowArr.length===2?("Low: "+handName2(eval2(lowArr))):("Low: "+lowArr.length+"/2 cards");
    var els=mount.querySelectorAll(".pgw-click");
    for(var k=0;k<els.length;k++){els[k].addEventListener("click",function(){
      if(phase!=="arrange")return;
      var c=findCard(parseInt(this.getAttribute("data-cid"),10));if(!c)return;
      toggleCard(c);sfx.click();
    })}
  }
  function toggleCard(c){
    if(inLow(c)){lowArr.splice(lowArr.indexOf(c),1);highArr.push(c)}
    else{
      if(lowArr.length>=2){toast("Low hand is full","Click a gold-outlined low card to move it back first.","err");return}
      highArr.splice(highArr.indexOf(c),1);lowArr.push(c);
    }
    renderPlayer();
    $("#paigowMsg").textContent="Low hand holds "+lowArr.length+"/2 cards. Set Hands when ready.";
  }
  function renderDealerBacks(){
    var bh="",bl="";
    for(var i=0;i<5;i++)bh+=backHtml(i);
    for(var j=0;j<2;j++)bl+=backHtml(j);
    $("#paigowDHigh").innerHTML=bh;$("#paigowDLow").innerHTML=bl;
    $("#paigowDHighName").textContent="High: hidden";$("#paigowDLowName").textContent="Low: hidden";
  }
  function renderDealer(split){
    var hh="",lh="";
    for(var i=0;i<split.high.length;i++)hh+=cardHtml(split.high[i],i,"");
    for(var j=0;j<split.low.length;j++)lh+=cardHtml(split.low[j],j,"pg-sel ");
    $("#paigowDHigh").innerHTML=hh;$("#paigowDLow").innerHTML=lh;
    $("#paigowDHighName").textContent="High: "+handName(split.he);
    $("#paigowDLowName").textContent="Low: "+handName2(split.le);
  }
  function setArrange(on){
    $("#paigowHouse").disabled=!on;$("#paigowSet").disabled=!on;$("#paigowPlay").disabled=on;
  }
  function finish(totalPayout,label){
    var mult=bet0>0?totalPayout/bet0:0;
    var stage=$("#paigowStage"),payout=settle("Pai Gow Poker",bet0,mult);
    hist.unshift({t:label,w:mult>1});histChips($("#paigowHist"),hist.slice(0,12));
    $("#paigowMsg").textContent=label+(mult>1?" — Won "+fmt$(payout):(mult===1?" — Push, stake back":""));
    if(mult>1){stageFx(stage,"win");burstFX(stage,{});winBanner(stage,"WON "+fmt$(payout));sfx.win()}
    else if(mult===1){stageFx(stage,"shake");sfx.click()}
    else{stageFx(stage,"lose");sfx.lose()}
    phase="idle";busy=false;setArrange(false);$("#paigowPlay").disabled=false;
  }
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("paigowBet","10.00")
    +'<button class="action-btn" id="paigowPlay" style="margin-top:16px">Deal</button>'
    +'<div class="pgw-btnrow"><button class="action-btn" id="paigowHouse" disabled>House Way</button><button class="action-btn" id="paigowSet" disabled>Set Hands</button></div>'
    +'<div class="hist-row" id="paigowHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>Standard 52-card deck — no joker. You and the dealer each get 7 cards.</li>'
    +'<li>Arrange your cards into a 5-card HIGH hand and a 2-card LOW hand: click a card to move it between hands (gold outline = in the low hand). The low hand must hold exactly 2 cards.</li>'
    +'<li>Foul hand: if your 2-card hand would outrank your 5-card hand the set is blocked — the low hand must never beat the high hand.</li>'
    +'<li>House Way — strongest legal split: every possible 2-card low hand is tested; a split is legal when the low hand does not outrank the high hand (a 2-card hand counts as a pair or high card only). Among legal splits the strongest high hand wins, then the strongest low hand. Your hand is auto-set this way on the deal, the House Way button re-applies it, and the dealer always sets this way.</li>'
    +'<li>Showdown: your high hand faces the dealer high hand, your low hand faces the dealer low hand. An exactly tied hand is a copy — copies go to the DEALER.</li>'
    +'<li>Win both hands: pays 0.95:1 (5% commission) — 1.95x your bet back. Win one, lose one: push, bet back. Lose both: bet lost.</li>'
    +'<li>5-card hands use standard poker rankings; 2-card hands are a pair or high card.</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="paigowStage">'+gameHeaderHtml('paigow')
    +'<div class="pgw-felt">'
    +'<div class="pgw-label">Dealer High (5)</div><div class="pgw-hand" id="paigowDHigh"></div><div><span class="pgw-handname" id="paigowDHighName"></span></div>'
    +'<div class="pgw-label">Dealer Low (2)</div><div class="pgw-hand" id="paigowDLow"></div><div><span class="pgw-handname" id="paigowDLowName"></span></div>'
    +'<div class="pgw-divider"></div>'
    +'<div class="pgw-label">Your High Hand (5)</div><div class="pgw-hand" id="paigowHigh"></div><div><span class="pgw-handname" id="paigowHighName"></span></div>'
    +'<div class="pgw-label">Your Low Hand (2) — click cards to move</div><div class="pgw-hand" id="paigowLow"></div><div><span class="pgw-handname" id="paigowLowName"></span></div>'
    +'<div><span class="pgw-pot" id="paigowPot">Place your bet and press Deal</span></div>'
    +'<div class="pgw-msg" id="paigowMsg">Your 7 cards are auto-set the House Way — adjust or Set Hands.</div>'
    +'</div></div></div>';
  wireAmount("paigowBet");
  $("#paigowPlay").addEventListener("click",function(){
    if(busy||phase!=="idle")return;
    var bet=getBet("paigowBet");if(bet==null)return;
    charge(bet);flyChip(this,$("#paigowStage"));sfx.click();
    bet0=bet;busy=true;phase="arrange";
    deck=newDeck();pCards=[];dCards=[];
    for(var i=0;i<7;i++){var c=deck.pop();c.cid=i;pCards.push(c)}
    for(var j=0;j<7;j++){var dc=deck.pop();dc.cid=100+j;dCards.push(dc)}
    var split=houseWay(pCards);highArr=split.high.slice();lowArr=split.low.slice();
    renderPlayer();renderDealerBacks();
    $("#paigowPot").textContent="Bet "+fmt$(bet0)+" · Win pays 0.95:1 after 5% commission";
    $("#paigowMsg").textContent="Auto-set the House Way: High "+handName(split.he)+" / Low "+handName2(split.le)+". Click cards to rearrange, then Set Hands.";
    setArrange(true);busy=false;
  });
  $("#paigowHouse").addEventListener("click",function(){
    if(phase!=="arrange"||busy)return;
    var split=houseWay(pCards);highArr=split.high.slice();lowArr=split.low.slice();
    renderPlayer();sfx.click();
    $("#paigowMsg").textContent="House Way applied: High "+handName(split.he)+" / Low "+handName2(split.le)+".";
  });
  $("#paigowSet").addEventListener("click",function(){
    if(phase!=="arrange"||busy)return;
    if(lowArr.length!==2||highArr.length!==5){toast("Low hand must hold exactly 2 cards","Move cards until the low hand has 2 and the high hand has 5.","err");return}
    var le=eval2(lowArr),he=eval5(highArr);
    if(cmpCross(le,he)>0){toast("Foul hand: your 2-card hand can't outrank your 5-card hand","Move a weaker pair of cards into the low hand.","err");return}
    busy=true;phase="show";setArrange(false);sfx.coin();
    var dSplit=houseWay(dCards);
    renderDealer(dSplit);
    var hiCmp=cmpEv(he,dSplit.he),loCmp=cmpEv(le,dSplit.le);
    var winHi=hiCmp>0,winLo=loCmp>0;
    var copyNote=(hiCmp===0||loCmp===0)?" (a tied hand is a copy — copies go to the dealer)":"";
    var totalPayout=0,label="";
    if(winHi&&winLo){totalPayout=1.95*bet0;label="You win both hands — 0.95:1 after 5% commission"+copyNote}
    else if(winHi||winLo){totalPayout=bet0;label="You win one hand and lose one — push"+copyNote}
    else{totalPayout=0;label="Dealer wins both hands"+copyNote}
    finish(totalPayout,label);
  });
  addDust($("#paigowStage"),10);
};
/* ==================== GAMES42: SICBO ==================== */
BUILDERS.sicbo=function(mount){
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
  /* RTP basis: Small/Big win on 105 of 216 outcomes (totals in range, triples excluded)
     at mult 2 -> EV 210/216 = 97.22% -> registry "97.2% RTP" is the Small/Big basis. */
  var TOT_PROFIT={4:60,5:30,6:17,7:12,8:8,9:6,10:6,11:6,12:6,13:8,14:12,15:17,16:30,17:60};
  var PIPS={1:[4],2:[0,6],3:[0,4,6],4:[0,1,5,6],5:[0,1,4,5,6],6:[0,1,2,3,5,6]};
  var POS=[[19,19],[41,19],[19,30],[41,30],[30,30],[19,41],[41,41]];
  function dieHtml(v){
    var c='';
    var idx=PIPS[v]||[4];
    for(var i=0;i<idx.length;i++){var p=POS[idx[i]];c+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5.2" fill="'+((v===1||v===4)?'#b3122e':'#1c2733')+'"/>';}
    return '<svg class="sb-die" viewBox="0 0 60 60"><rect x="3" y="3" width="54" height="54" rx="11" fill="#f8f4e8" stroke="#caa14f" stroke-width="2.5"/>'+c+'</svg>';
  }
  var hist=[],choice='small',pickDouble=6,pickTotal=10,busy=false,pending=null,timers=[];
  function later(fn,ms){var t=_bvSetTimeout(fn,ms);timers.push(t);return t;}
  onCleanup(function(){for(var i=0;i<timers.length;i++)_bvClearTimeout(timers[i]);timers=[];if(pending){var p=pending;pending=null;p.finish();}});
  function pickInfo(){
    if(choice==='small')return 'Small: total 4-10 wins 1:1, except any triple loses.';
    if(choice==='big')return 'Big: total 11-17 wins 1:1, except any triple loses.';
    if(choice==='triple')return 'Any Triple: all three dice the same face pays 24:1.';
    if(choice==='double')return 'Specific Double: at least two dice show '+pickDouble+' — pays 8:1.';
    return 'Specific Total: three dice total exactly '+pickTotal+' — pays '+TOT_PROFIT[pickTotal]+':1.';
  }
  function renderPicker(){
    var wrap=$('#sicboPickerWrap'),box=$('#sicboPicker');
    if(choice==='double'){
      wrap.style.display='';var h='';
      for(var v=1;v<=6;v++)h+='<button class="sb-pick'+(v===pickDouble?' on':'')+'" data-v="'+v+'">'+v+'</button>';
      box.innerHTML=h;
    }else if(choice==='total'){
      wrap.style.display='';var h2='';
      for(var t=4;t<=17;t++)h2+='<button class="sb-pick'+(t===pickTotal?' on':'')+'" data-v="'+t+'">'+t+'</button>';
      box.innerHTML=h2;
    }else{wrap.style.display='none';box.innerHTML='';}
    $('#sicboPickInfo').textContent=pickInfo();
    var btns=box.querySelectorAll('.sb-pick');
    for(var i=0;i<btns.length;i++){(function(b){b.addEventListener('click',function(){
      var v=parseInt(b.getAttribute('data-v'),10);
      if(choice==='double')pickDouble=v;else if(choice==='total')pickTotal=v;
      sfx.click();renderPicker();
    });})(btns[i]);}
  }
  var totalsRules='';
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("sicboBet","10.00")
    +'<div class="field"><label>Bet type</label><div class="seg sb-segwrap" id="sicboChoice">'
    +'<button data-v="small" class="on">Small 1:1</button><button data-v="big">Big 1:1</button><button data-v="triple">Any Triple 24:1</button><button data-v="double">Double 8:1</button><button data-v="total">Total</button>'
    +'</div></div>'
    +'<div class="field" id="sicboPickerWrap" style="display:none"><label id="sicboPickerLabel">Pick a value</label><div class="sb-picker" id="sicboPicker"></div></div>'
    +'<div class="sb-pickinfo" id="sicboPickInfo"></div>'
    +'<button class="action-btn" id="sicboPlay" style="margin-top:16px">Roll Dice</button>'
    +'<div class="hist-row" id="sicboHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>Three dice are rolled. Your single bet settles on the bet type you picked.</li>'
    +'<li><b>Small</b> — total 4–10 pays <b>1:1</b> (mult 2), but loses on any triple.</li>'
    +'<li><b>Big</b> — total 11–17 pays <b>1:1</b> (mult 2), but loses on any triple.</li>'
    +'<li><b>Any Triple</b> — all three dice show the same face pays <b>24:1</b> (mult 25).</li>'
    +'<li><b>Specific Double</b> — pick a face 1–6; at least two dice show it pays <b>8:1</b> (mult 9).</li>'
    +'<li><b>Specific Total</b> — pick a total 4–17; pays profit odds: 4 or 17 → <b>60:1</b> · 5 or 16 → <b>30:1</b> · 6 or 15 → <b>17:1</b> · 7 or 14 → <b>12:1</b> · 8 or 13 → <b>8:1</b> · 9, 10, 11 or 12 → <b>6:1</b> (mult = odds + 1).</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="sicboStage">'+gameHeaderHtml('sicbo')
    +'<div class="sb-felt"><div class="sb-dicerow" id="sicboDice">'+dieHtml(1)+dieHtml(2)+dieHtml(3)+'</div>'
    +'<div><span class="sb-total" id="sicboTotal">Total —</span></div>'
    +'<div class="sb-msg" id="sicboMsg">Pick a bet type and roll.</div></div>'
    +'</div></div>';
  wireAmount("sicboBet");
  renderPicker();
  var segs=$('#sicboChoice').querySelectorAll('button');
  for(var k=0;k<segs.length;k++){(function(b){b.addEventListener('click',function(){
    if(busy)return;
    for(var i=0;i<segs.length;i++)segs[i].classList.remove('on');
    b.classList.add('on');choice=b.getAttribute('data-v');
    $('#sicboPickerLabel').textContent=(choice==='double')?'Pick a face (1–6)':'Pick a total (4–17)';
    sfx.click();renderPicker();
  });})(segs[k]);}
  $('#sicboPlay').addEventListener('click',function(){
    if(busy)return;
    var bet=getBet("sicboBet");if(bet==null)return;
    var totalBet=bet;
    charge(bet);busy=true;sfx.click();
    var btn=this;btn.disabled=true;btn.style.opacity='.5';
    flyChip(btn,$('#sicboStage'));
    var dice=[1+Math.floor(Math.random()*6),1+Math.floor(Math.random()*6),1+Math.floor(Math.random()*6)];
    var myChoice=choice,myDouble=pickDouble,myTotal=pickTotal;
    var diceBox=$('#sicboDice'),msg=$('#sicboMsg'),totEl=$('#sicboTotal');
    msg.textContent='Rolling...';totEl.textContent='Total —';
    function showDice(ds,tumble){
      var h='';for(var i=0;i<3;i++)h+=dieHtml(ds[i]);
      diceBox.innerHTML=h;
      if(tumble&&ngAnim()){var svgs=diceBox.querySelectorAll('.sb-die');for(var j=0;j<svgs.length;j++)svgs[j].classList.add('sb-tumble');}
    }
    function finish(){
      pending=null;busy=false;btn.disabled=false;btn.style.opacity='';
      showDice(dice,false);
      var s=dice[0]+dice[1]+dice[2];
      var triple=(dice[0]===dice[1]&&dice[1]===dice[2]);
      var mult=0,label='';
      if(myChoice==='small'){mult=(s>=4&&s<=10&&!triple)?2:0;label='SMALL '+(mult?'WINS':'LOSES');}
      else if(myChoice==='big'){mult=(s>=11&&s<=17&&!triple)?2:0;label='BIG '+(mult?'WINS':'LOSES');}
      else if(myChoice==='triple'){mult=triple?25:0;label=triple?'ANY TRIPLE!':'NO TRIPLE';}
      else if(myChoice==='double'){var cnt=0;for(var i=0;i<3;i++)if(dice[i]===myDouble)cnt++;mult=(cnt>=2)?9:0;label='DOUBLE '+myDouble+(mult?' HITS ×'+cnt:' MISSES');}
      else{mult=(s===myTotal)?(TOT_PROFIT[myTotal]+1):0;label='TOTAL '+myTotal+(mult?' HITS':' MISSES');}
      totEl.textContent='Total '+s+(triple?' · Triple '+dice[0]:'');
      var stage=$('#sicboStage');
      var payout=settle("Sic Bo",totalBet,totalBet>0?mult:0);
      hist.unshift({t:dice.join('+')+'='+s,w:mult>1});histChips($('#sicboHist'),hist.slice(0,12));
      msg.textContent='Rolled '+dice[0]+', '+dice[1]+', '+dice[2]+' — total '+s+'. '+label+(mult>1?' — Won '+fmt$(payout):'');
      if(mult>1){stageFx(stage,'win');burstFX(stage,{});winBanner(stage,'WON '+fmt$(payout));if(mult>=25)sfx.big();else sfx.win();}
      else{stageFx(stage,'lose');sfx.lose();}
    }
    pending={finish:finish};
    if(ngAnim()){
      showDice([1+Math.floor(Math.random()*6),1+Math.floor(Math.random()*6),1+Math.floor(Math.random()*6)],true);
      var iv=_bvSetInterval(function(){showDice([1+Math.floor(Math.random()*6),1+Math.floor(Math.random()*6),1+Math.floor(Math.random()*6)],false);},110);
      timers.push(iv);
      later(function(){_bvClearInterval(iv);if(pending)finish();},620);
    }else{finish();}
  });
  addDust($('#sicboStage'),10);
};
/* ==================== GAMES42: LUCKY7 ==================== */
BUILDERS.lucky7=function(mount){
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
  /* Honest RTP math for the exact payouts in the spec:
     Under 7 (sums 2-6): 15/36 outcomes x mult 2 = 30/36 = 83.33%
     Exactly 7:           6/36 outcomes x mult 5 = 30/36 = 83.33%
     Over 7 (sums 8-12): 15/36 outcomes x mult 2 = 30/36 = 83.33%
     Every bet returns 83.3% -> registry "83.3% RTP". */
  var PIPS={1:[4],2:[0,6],3:[0,4,6],4:[0,1,5,6],5:[0,1,4,5,6],6:[0,1,2,3,5,6]};
  var POS=[[19,19],[41,19],[19,30],[41,30],[30,30],[19,41],[41,41]];
  function dieHtml(v){
    var c='';var idx=PIPS[v]||[4];
    for(var i=0;i<idx.length;i++){var p=POS[idx[i]];c+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5.2" fill="'+((v===1||v===4)?'#b3122e':'#1c2733')+'"/>';}
    return '<svg class="l7-die" viewBox="0 0 60 60"><rect x="3" y="3" width="54" height="54" rx="11" fill="#f8f4e8" stroke="#caa14f" stroke-width="2.5"/>'+c+'</svg>';
  }
  var SUMCOUNT=[0,0,1,2,3,4,5,6,5,4,3,2,1];
  var probs='';
  for(var s=2;s<=12;s++){
    var pct=(SUMCOUNT[s]/36*100);
    probs+='<div class="l7-prow'+(s===7?' l7-seven':'')+'"><span class="l7-plab">'+s+'</span><span class="l7-pbar"><i style="width:'+(SUMCOUNT[s]/6*100).toFixed(1)+'%"></i></span><span class="l7-pval">'+pct.toFixed(1)+'%</span></div>';
  }
  var hist=[],choice='under',busy=false,pending=null,timers=[];
  function later(fn,ms){var t=_bvSetTimeout(fn,ms);timers.push(t);return t;}
  onCleanup(function(){for(var i=0;i<timers.length;i++)_bvClearTimeout(timers[i]);timers=[];if(pending){var p=pending;pending=null;p.finish();}});
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("lucky7Bet","10.00")
    +'<div class="field"><label>Bet on the two-dice total</label><div class="seg" id="lucky7Choice">'
    +'<button data-v="under" class="on">Under 7 · 1:1</button><button data-v="seven">Exactly 7 · 4:1</button><button data-v="over">Over 7 · 1:1</button>'
    +'</div></div>'
    +'<div class="field"><label>Sum probabilities (two dice)</label><div class="l7-probs">'+probs+'</div></div>'
    +'<button class="action-btn" id="lucky7Play" style="margin-top:16px">Roll Dice</button>'
    +'<div class="hist-row" id="lucky7Hist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>Two dice are rolled and added together (totals 2–12).</li>'
    +'<li><b>Under 7</b> — total 2–6 pays <b>1:1</b> (mult 2). 15 of 36 rolls win.</li>'
    +'<li><b>Exactly 7</b> — total exactly 7 pays <b>4:1</b> (mult 5). 6 of 36 rolls win.</li>'
    +'<li><b>Over 7</b> — total 8–12 pays <b>1:1</b> (mult 2). 15 of 36 rolls win.</li>'
    +'<li>Sum chances: 2 and 12 → 1/36 · 3 and 11 → 2/36 · 4 and 10 → 3/36 · 5 and 9 → 4/36 · 6 and 8 → 5/36 · 7 → 6/36.</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="lucky7Stage">'+gameHeaderHtml('lucky7')
    +'<div class="l7-felt"><div class="l7-dicerow" id="lucky7Dice">'+dieHtml(3)+dieHtml(4)+'</div>'
    +'<div class="l7-bigtotal" id="lucky7Total">7</div>'
    +'<div class="l7-msg" id="lucky7Msg">Pick Under, Exactly or Over, then roll.</div></div>'
    +'</div></div>';
  wireAmount("lucky7Bet");
  var segs=$('#lucky7Choice').querySelectorAll('button');
  for(var k=0;k<segs.length;k++){(function(b){b.addEventListener('click',function(){
    if(busy)return;
    for(var i=0;i<segs.length;i++)segs[i].classList.remove('on');
    b.classList.add('on');choice=b.getAttribute('data-v');sfx.click();
  });})(segs[k]);}
  $('#lucky7Play').addEventListener('click',function(){
    if(busy)return;
    var bet=getBet("lucky7Bet");if(bet==null)return;
    var totalBet=bet;
    charge(bet);busy=true;sfx.click();
    var btn=this;btn.disabled=true;btn.style.opacity='.5';
    flyChip(btn,$('#lucky7Stage'));
    var dice=[1+Math.floor(Math.random()*6),1+Math.floor(Math.random()*6)];
    var myChoice=choice;
    var diceBox=$('#lucky7Dice'),msg=$('#lucky7Msg'),totEl=$('#lucky7Total');
    msg.textContent='Rolling...';totEl.textContent='?';totEl.classList.remove('l7-hit');
    function rndDie(){return 1+Math.floor(Math.random()*6);}
    function showDice(ds,tumble){
      diceBox.innerHTML=dieHtml(ds[0])+dieHtml(ds[1]);
      if(tumble&&ngAnim()){var svgs=diceBox.querySelectorAll('.l7-die');for(var j=0;j<svgs.length;j++)svgs[j].classList.add('l7-tumble');}
    }
    function finish(){
      pending=null;busy=false;btn.disabled=false;btn.style.opacity='';
      showDice(dice,false);
      var s=dice[0]+dice[1];
      var mult=0,label='';
      if(myChoice==='under'){mult=(s<7)?2:0;label='UNDER 7 '+(mult?'WINS':'LOSES');}
      else if(myChoice==='seven'){mult=(s===7)?5:0;label=(s===7)?'EXACTLY 7!':'NOT 7';}
      else{mult=(s>7)?2:0;label='OVER 7 '+(mult?'WINS':'LOSES');}
      totEl.textContent=''+s;
      if(ngAnim())countUp(totEl,s,function(v){return ''+Math.round(v)},300);
      if(mult>1)totEl.classList.add('l7-hit');
      var stage=$('#lucky7Stage');
      var payout=settle("Lucky 7",totalBet,mult);
      hist.unshift({t:''+s+' '+(myChoice==='seven'?'7':(myChoice==='under'?'U7':'O7')),w:mult>1});histChips($('#lucky7Hist'),hist.slice(0,12));
      msg.textContent='Rolled '+dice[0]+' + '+dice[1]+' = '+s+'. '+label+(mult>1?' — Won '+fmt$(payout):'');
      if(mult>1){stageFx(stage,'win');burstFX(stage,{});winBanner(stage,'WON '+fmt$(payout));if(mult>=5)sfx.big();else sfx.win();}
      else{stageFx(stage,'lose');sfx.lose();}
    }
    pending={finish:finish};
    if(ngAnim()){
      showDice([rndDie(),rndDie()],true);
      var iv=_bvSetInterval(function(){showDice([rndDie(),rndDie()],false);},110);
      timers.push(iv);
      later(function(){_bvClearInterval(iv);if(pending)finish();},620);
    }else{finish();}
  });
  addDust($('#lucky7Stage'),10);
};
/* ==================== GAMES42: SCRATCHCARDS ==================== */
BUILDERS.scratchcards=function(mount){
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
  /* Prize design (exact, verified by scratchcards-sim.js, 1,000,000 cards):
     71.20% of cards win nothing. 28.80% are winning cards, split by symbol:
       Cherry 2x  p=0.1553 | Lemon 3x  p=0.0788 | Bell 5x   p=0.0320
       Clover 8x  p=0.0160 | Star 15x  p=0.0040 | Money Bag 25x p=0.0010
       Gem 40x    p=0.0005 | Seven 50x p=0.0004
     Win prob = 0.2880, EV = 2*.1553+3*.0788+5*.032+8*.016+15*.004+25*.001
       +40*.0005+50*.0004 = 0.3106+0.2364+0.16+0.128+0.06+0.025+0.02+0.02
       = 0.9600 -> "96.0% RTP". A winning card holds EXACTLY 3 of its symbol;
     every other symbol is capped at 2 per card, so only it can reach 3. */
  var SYMS=[
    {k:'cherry',name:'Cherry',pay:2,p:0.1553,svg:'<svg viewBox="0 0 24 24" fill="none" stroke="#ff5c7a" stroke-width="1.7" stroke-linecap="round"><path d="M8 12C10 6 14 4 19 3.5M8 12c1.5 2 4 2.6 6.5 2"/><circle cx="7" cy="16.5" r="4" fill="rgba(255,92,122,.3)"/><circle cx="16.5" cy="17.5" r="3.4" fill="rgba(255,92,122,.3)"/></svg>'},
    {k:'lemon',name:'Lemon',pay:3,p:0.0788,svg:'<svg viewBox="0 0 24 24" fill="none" stroke="#e8bc1a" stroke-width="1.7" stroke-linejoin="round"><ellipse cx="12" cy="13" rx="7.5" ry="5.6" fill="rgba(255,217,77,.35)" transform="rotate(-24 12 13)"/><path d="M17.5 6.5c.8-2 2.4-3 4.5-3-.3 2.2-1.4 3.6-3.4 4.2" stroke="#00b368"/></svg>'},
    {k:'bell',name:'Bell',pay:5,p:0.0320,svg:'<svg viewBox="0 0 24 24" fill="none" stroke="#f5b942" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 3h-15L6 16Z" fill="rgba(245,185,66,.25)"/><path d="M10 21a2.2 2.2 0 0 0 4 0M12 5V3.5"/></svg>'},
    {k:'clover',name:'Clover',pay:8,p:0.0160,svg:'<svg viewBox="0 0 24 24" fill="none" stroke="#00c95c" stroke-width="1.7" stroke-linejoin="round"><circle cx="8.5" cy="8.5" r="3.6" fill="rgba(0,224,101,.22)"/><circle cx="15.5" cy="8.5" r="3.6" fill="rgba(0,224,101,.22)"/><circle cx="8.5" cy="15" r="3.6" fill="rgba(0,224,101,.22)"/><circle cx="15.5" cy="15" r="3.6" fill="rgba(0,224,101,.22)"/><path d="M12 12c0 4-1 6.5-3 9" stroke-linecap="round"/></svg>'},
    {k:'star',name:'Star',pay:15,p:0.0040,svg:'<svg viewBox="0 0 24 24" fill="none" stroke="#e8a93c" stroke-width="1.4" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9l-5.4 2.9 1.1-6.1L3.2 9.4l6.1-.8z" fill="rgba(245,185,66,.4)"/></svg>'},
    {k:'moneybag',name:'Money Bag',pay:25,p:0.0010,svg:'<svg viewBox="0 0 24 24" fill="none" stroke="#0a8f5c" stroke-width="1.7" stroke-linejoin="round"><path d="M9 3h6l-1 3h-4L9 3z" fill="rgba(0,224,101,.2)"/><path d="M10 6c-2.8 1.6-4.5 4-4.5 7a6.5 5.4 0 0 0 13 0c0-3-1.7-5.4-4.5-7" fill="rgba(0,224,101,.2)"/><text x="12" y="16.8" text-anchor="middle" font-size="8.5" font-weight="900" fill="#0a8f5c" stroke="none">$</text></svg>'},
    {k:'gem',name:'Gem',pay:40,p:0.0005,svg:'<svg viewBox="0 0 24 24" fill="none" stroke="#37c8f5" stroke-width="1.7" stroke-linejoin="round"><path d="M7 3h10l3.5 5.5L12 21 3.5 8.5 7 3Z" fill="rgba(55,200,245,.22)"/><path d="M3.5 8.5h17M12 21 8.5 8.5 12 3l3.5 5.5L12 21"/></svg>'},
    {k:'seven',name:'Seven',pay:50,p:0.0004,svg:'<svg viewBox="0 0 24 24"><text x="12" y="18.5" text-anchor="middle" font-family="Sora" font-weight="800" font-size="17" fill="#ff8a3d">7</text></svg>'}
  ];
  var COVER='<span class="sc-cover"><svg viewBox="0 0 24 24" fill="none" stroke="#3d4757" stroke-width="1.8"><circle cx="12" cy="12" r="8.5"/><text x="12" y="16.5" text-anchor="middle" font-size="11" font-weight="900" fill="#3d4757" stroke="none">$</text></svg>SCRATCH</span>';
  var hist=[],card=null;
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function genCard(){
    var r=Math.random(),acc=0,win=-1,i;
    for(i=0;i<SYMS.length;i++){acc+=SYMS[i].p;if(r<acc){win=i;break;}}
    var grid=[],pos;
    if(win>=0){
      /* exactly 3 of the winning symbol */
      for(i=0;i<3;i++)grid.push(win);
      /* other 6 cells: 4 distinct other symbols with counts (2,2,1,1) - all capped at 2 */
      var others=[];for(i=0;i<SYMS.length;i++)if(i!==win)others.push(i);
      shuffle(others);
      var pats=[2,2,1,1];
      for(var o=0;o<4;o++)for(var c=0;c<pats[o];c++)grid.push(others[o]);
    }else{
      /* no-win card: 5 distinct symbols, counts (2,2,2,2,1) - nothing can reach 3 */
      var pool=[];for(i=0;i<SYMS.length;i++)pool.push(i);
      shuffle(pool);
      var counts=[2,2,2,2,1];
      for(var o2=0;o2<5;o2++)for(var c2=0;c2<counts[o2];c2++)grid.push(pool[o2]);
    }
    shuffle(grid);
    return {grid:grid,win:win,revealed:[false,false,false,false,false,false,false,false,false],nOpen:0,settled:false,bet:0};
  }
  function countsOf(cd){
    var counts={},best=-1,bestN=0;
    for(var i=0;i<9;i++)if(cd.revealed[i]){var s=cd.grid[i];counts[s]=(counts[s]||0)+1;if(counts[s]>bestN){bestN=counts[s];best=s;}}
    return {counts:counts,best:best,bestN:bestN};
  }
  function renderCard(){
    var box=$('#scratchcardsGrid');
    if(!card){box.innerHTML='<div class="sc-empty" style="grid-column:1/-1">No card yet.<br>Buy a card to start scratching.</div>';return;}
    var h='';
    for(var i=0;i<9;i++){
      var s=SYMS[card.grid[i]];
      h+='<button class="sc-cell'+(card.revealed[i]?' sc-open':'')+'" data-i="'+i+'" '+(card.settled||card.revealed[i]?'disabled':'')+'>'
        +'<span class="sc-sym">'+s.svg+'<small>'+s.name+' '+s.pay+'x</small></span>'+COVER+'</button>';
    }
    box.innerHTML=h;
    var cells=box.querySelectorAll('.sc-cell');
    for(var j=0;j<cells.length;j++){(function(b){b.addEventListener('click',function(){openCell(parseInt(b.getAttribute('data-i'),10),b);});})(cells[j]);}
  }
  function paintState(){
    if(!card)return;
    var box=$('#scratchcardsGrid'),cells=box.querySelectorAll('.sc-cell');
    var co=countsOf(card);
    for(var i=0;i<cells.length&&i<9;i++){
      if(card.revealed[i])cells[i].classList.add('sc-open');
      cells[i].disabled=card.settled||card.revealed[i];
      if(card.settled){
        if(card.win>=0&&card.grid[i]===card.win)cells[i].classList.add('sc-match');
        else if(card.revealed[i])cells[i].classList.add('sc-dim');
      }
    }
    if(!card.settled){
      if(co.best>=0)$('#scratchcardsHint').innerHTML='Matches found: <span class="sc-need">'+SYMS[co.best].name+' x'+co.bestN+'</span> — need 3 to win '+SYMS[co.best].pay+'x';
      else $('#scratchcardsHint').textContent='Click a cell to scratch it off.';
    }
  }
  function finish(fromCleanup){
    if(!card||card.settled)return;
    card.settled=true;
    var winSym=card.win,mult=winSym>=0?SYMS[winSym].pay:0;
    /* predetermined outcome: a winning card always pays its symbol prize, a no-win card pays 0 */
    var payout=settle("Scratch Cards",card.bet,mult);
    hist.unshift({t:winSym>=0?SYMS[winSym].name+' '+mult+'x':'No match',w:mult>1});
    histChips($('#scratchcardsHist'),hist.slice(0,12));
    var stage=$('#scratchcardsStage');
    $('#scratchcardsBuy').disabled=false;$('#scratchcardsBuy').style.opacity='';
    $('#scratchcardsReveal').disabled=true;
    if(!fromCleanup){
      paintState();
      if(mult>0){
        $('#scratchcardsHint').textContent='3 x '+SYMS[winSym].name+' — you win '+mult+'x your card price!';
        $('#scratchcardsMsg').textContent='Winning card! '+SYMS[winSym].name+' pays '+fmt$(payout)+'.';
        stageFx(stage,'win');burstFX(stage,{});winBanner(stage,'WON '+fmt$(payout));
        if(mult>=25)sfx.big();else sfx.win();
      }else{
        $('#scratchcardsHint').textContent='No symbol reached 3 matches.';
        $('#scratchcardsMsg').textContent='No match — this card wins nothing. Buy another card to try again.';
        stageFx(stage,'lose');sfx.lose();
      }
    }
    card.active=false;
  }
  function evaluate(){
    if(!card||card.settled)return;
    var co=countsOf(card),found=false;
    for(var s in co.counts)if(co.counts[s]>=3)found=true;
    if(found){
      /* reveal the rest for show; outcome is already decided and settles exactly once */
      for(var i=0;i<9;i++)card.revealed[i]=true;
      card.nOpen=9;
      finish(false);
    }else if(card.nOpen>=9){finish(false);}
    else paintState();
  }
  function openCell(i,btn){
    if(!card||card.settled||card.revealed[i])return;
    card.revealed[i]=true;card.nOpen++;
    if(btn){btn.classList.add('sc-open');if(!ngAnim())btn.querySelector('.sc-cover').style.display='none';}
    sfx.coin();
    evaluate();
  }
  onCleanup(function(){if(card&&card.active&&!card.settled)finish(true);});
  var prizeRows='';
  for(var pi=0;pi<SYMS.length;pi++)prizeRows+='<li><b>'+SYMS[pi].name+'</b> — 3 matches pay <b>'+SYMS[pi].pay+'x</b> the card price.</li>';
  mount.innerHTML='<div class="game-layout">'
    +'<div class="panel"><h4>Bet Controls</h4>'
    +betAmountHtml("scratchcardsBet","10.00")
    +'<div style="color:#c9a86a;font-size:12px;line-height:1.6">The bet is the card price. The card is generated the moment you buy it — scratch all 9 cells, or hit Reveal All.</div>'
    +'<button class="action-btn" id="scratchcardsBuy" style="margin-top:16px">Buy Card</button>'
    +'<div class="hist-row" id="scratchcardsHist"></div>'
    +'<div class="g42-rules"><h5>Rules &amp; Payouts</h5><ul>'
    +'<li>Buy a card for the bet amount, then click cells to scratch them off (or use Reveal All).</li>'
    +'<li><b>3 matching symbols anywhere on the 3x3 grid win</b> that symbol\'s prize, paid as a multiple of the card price. Only one symbol can ever reach 3 on a card.</li>'
    +prizeRows
    +'<li>71.2% of cards have no 3-match and win nothing; 28.8% of cards are winners. The card settles as soon as the 3rd match is found, or when all 9 cells are revealed.</li>'
    +'</ul></div></div>'
    +'<div class="stage" id="scratchcardsStage">'+gameHeaderHtml('scratchcards')
    +'<div class="sc-wrap"><div class="sc-grid" id="scratchcardsGrid"></div>'
    +'<div class="sc-hint" id="scratchcardsHint">Buy a card to play.</div>'
    +'<div class="sc-rowbtns"><button class="mini-btn" id="scratchcardsReveal" disabled>Reveal All</button></div>'
    +'<div class="sc-msg" id="scratchcardsMsg"></div></div>'
    +'</div></div>';
  wireAmount("scratchcardsBet");
  renderCard();
  $('#scratchcardsBuy').addEventListener('click',function(){
    if(card&&card.active&&!card.settled)return;
    var bet=getBet("scratchcardsBet");if(bet==null)return;
    var totalBet=bet;
    charge(bet);sfx.click();
    flyChip(this,$('#scratchcardsStage'));
    card=genCard();card.bet=totalBet;card.active=true;
    this.disabled=true;this.style.opacity='.5';
    $('#scratchcardsReveal').disabled=false;
    $('#scratchcardsMsg').textContent='Card bought for '+fmt$(totalBet)+'. Scratch the cells!';
    renderCard();
    $('#scratchcardsHint').textContent='Click a cell to scratch it off.';
  });
  $('#scratchcardsReveal').addEventListener('click',function(){
    if(!card||card.settled||!card.active)return;
    sfx.click();
    var cells=$('#scratchcardsGrid').querySelectorAll('.sc-cell');
    for(var i=0;i<9;i++){
      card.revealed[i]=true;
      if(cells[i]){cells[i].classList.add('sc-open');var cv2=cells[i].querySelector('.sc-cover');if(cv2)cv2.style.transitionDelay=ngAnim()?(i*55)+'ms':'0ms';if(!ngAnim()){if(cv2)cv2.style.display='none';}}
    }
    card.nOpen=9;
    evaluate();
  });
  addDust($('#scratchcardsStage'),10);
};
