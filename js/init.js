/* Betvora — init.js
   Boot sequence: initial renders, event wiring, splash handoff.
   Loaded LAST.
   Split from the single-file build; execution order preserved across files.
   Classic script (no modules) — works over file:// and http(s). */

     /* ==================== INIT ==================== *\/
   It only READS site helpers (renderGames, ngAnim, esc). It never
   touches game logic, wallet math, auth, or search behavior.

   WIRING PLAN (exact edits live in INTEGRATION.md):
     1. Category pills, "View all", search input -> call
        Skel.switchRender(cat) instead of renderGames(cat).
     2. INIT: replace `renderGames()` with `Skel.switchRender()`.
     3. openGame(): after `$("#gameMount").innerHTML="";` add
        `Skel.mountSkel();` and run BUILDERS[id] on the next frame.
     4. Empty branches: replace the literal empty strings with
        Empty.txs() / Empty.bets() / Empty.saved() / Empty.notifs() /
        Empty.feed(tab) as mapped in INTEGRATION.md.

   NEVER-STUCK GUARANTEES:
     - Skeletons are plain content: any real render writing innerHTML
       wipes them automatically.
     - A `data-skel` marker lets resolve() sweep leftovers.
     - Every show() arms a 1200ms safety timeout that force-resolves.
     - When animations are off (state.anim=false, prefers-reduced-motion,
       or html.no-motion) switchRender() skips the shimmer entirely and
       renders synchronously.
   ============================================================ */
(function(){
"use strict";

/* ---------- shared ---------- */
function q(s){ return document.querySelector(s); }
function animOn(){
  try{ if(typeof ngAnim==="function") return !!ngAnim(); }catch(e){}
  return !document.documentElement.classList.contains("no-motion");
}

/* ---------- skeletons ---------- */
var N_TILES=8, safetyT=null;

function tileHtml(){
  return '<div class="skel skel-tile" aria-hidden="true"></div>';
}
/* Paint skeleton tiles into a container. grid=true -> .skel-grid (#gamesGrid),
   otherwise a horizontal .skel-strip (lobby rows). Marks host with data-skel. */
function showRowSkeletons(sel,count,grid){
  var host=q(sel); if(!host) return false;
  if(grid===undefined) grid=(sel==="#gamesGrid");
  count=count||N_TILES;
  var h='<div class="'+(grid?"skel-grid":"skel-strip")+'" aria-hidden="true" role="presentation">';
  for(var i=0;i<count;i++) h+=tileHtml();
  h+='</div>';
  host.setAttribute("data-skel","1");
  host.innerHTML=h;
  return true;
}
/* Clear the data-skel marker + cancel the safety timer. Does not touch
   real content: the real render has already replaced the skeletons. */
function resolveSkeletons(){
  if(safetyT){ clearTimeout(safetyT); safetyT=null; }
  var marked=document.querySelectorAll("[data-skel]");
  for(var i=0;i<marked.length;i++) marked[i].removeAttribute("data-skel");
}
/* Category switch with a skeleton beat:
   paint skeletons now, renderGames() on the next frame so the shimmer
   actually paints, then resolve. No-motion -> instant sync render. */
function switchRender(cat){
  resolveSkeletons();
  if(!animOn()){ renderGames(cat); return; }
  showRowSkeletons("#gamesGrid",N_TILES,true);
  safetyT=setTimeout(function(){           /* 1200ms safety net */
    safetyT=null;
    var h=q("#gamesGrid");
    if(h && h.hasAttribute("data-skel")){  /* render never completed -> force */
      try{ renderGames(cat); }catch(e){}
    }
    resolveSkeletons();
  },1200);
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      try{ renderGames(cat); }finally{ resolveSkeletons(); }
    });
  });
}
/* Game-view mount shimmer (paint nicety: builders run synchronously,
   so this is only visible for a frame on slower devices). */
function mountSkel(host){
  host=host||q("#gameMount"); if(!host) return;
  host.setAttribute("data-skel","1");
  host.innerHTML='<div class="skel-game" aria-hidden="true" role="presentation">'
    +'<div class="skel skel-stage"></div>'
    +'<div class="skel-game-row"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>'
    +'<div class="skel skel-r8" style="height:52px;margin-top:10px"></div>'
    +'</div>';
}

window.Skel={
  show:showRowSkeletons,
  resolve:resolveSkeletons,
  switchRender:switchRender,
  mountSkel:mountSkel,
  animOn:animOn
};

/* ---------- empty states (HTML-string builders) ----------
   Inline SVG only, gold/grey line art. Each returns a <div class="empty-state">
   block. Styling lives in empty.css. CTAs use existing data-nav hooks only. */
var SVG={
  dice:'<svg viewBox="0 0 76 76" fill="none" aria-hidden="true">'
    +'<rect x="10" y="10" width="56" height="56" rx="14" style="stroke:var(--gold)" stroke-width="3"/>'
    +'<circle cx="26" cy="26" r="4.5" style="fill:var(--gold)"/><circle cx="50" cy="26" r="4.5" style="fill:var(--faint)"/>'
    +'<circle cx="38" cy="38" r="4.5" style="fill:var(--gold)"/><circle cx="26" cy="50" r="4.5" style="fill:var(--faint)"/>'
    +'<circle cx="50" cy="50" r="4.5" style="fill:var(--gold)"/></svg>',
  bookmark:'<svg viewBox="0 0 76 76" fill="none" aria-hidden="true">'
    +'<path d="M24 8h28v52l-14-10.5L24 60V8Z" style="stroke:var(--gold)" stroke-width="3" stroke-linejoin="round"/>'
    +'<path d="M31 24l4.5 4.5L44 20" style="stroke:var(--faint)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  wallet:'<svg viewBox="0 0 76 76" fill="none" aria-hidden="true">'
    +'<rect x="10" y="24" width="50" height="34" rx="9" style="stroke:var(--gold)" stroke-width="3"/>'
    +'<path d="M60 32h-6a5 5 0 0 0 0 12h6" style="stroke:var(--gold)" stroke-width="3" stroke-linecap="round"/>'
    +'<circle cx="47" cy="38" r="2.6" style="fill:var(--faint)"/>'
    +'<circle cx="26" cy="15" r="7" style="stroke:var(--faint)" stroke-width="3"/>'
    +'<path d="M26 11.5v7M22.5 15h7" style="stroke:var(--faint)" stroke-width="2.4" stroke-linecap="round"/></svg>',
  bell:'<svg viewBox="0 0 76 76" fill="none" aria-hidden="true">'
    +'<path d="M38 10c-9 0-15 6.5-15 15v10l-5 8h40l-5-8V25c0-8.5-6-15-15-15Z" style="stroke:var(--gold)" stroke-width="3" stroke-linejoin="round"/>'
    +'<path d="M32 50a6 6 0 0 0 12 0" style="stroke:var(--faint)" stroke-width="3" stroke-linecap="round"/>'
    +'<path d="M50 12l4 4 7-7" style="stroke:var(--faint)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  crown:'<svg viewBox="0 0 76 76" fill="none" aria-hidden="true">'
    +'<path d="M14 52 10 24l14 9 14-18 14 18 14-9-4 28H14Z" style="stroke:var(--gold)" stroke-width="3" stroke-linejoin="round"/>'
    +'<path d="M14 60h48" style="stroke:var(--faint)" stroke-width="3" stroke-linecap="round"/>'
    +'<circle cx="38" cy="42" r="3.4" style="fill:var(--faint)"/></svg>'
};
function emptyWrap(ill,title,sub,cta){
  return '<div class="empty-state" role="status">'
    +'<span class="empty-ill">'+ill+'</span>'
    +'<h3>'+title+'</h3>'
    +'<p>'+sub+'</p>'
    +(cta||'')
    +'</div>';
}
window.Empty={
  /* My Bets table (also reused for the profile recent-bets table) */
  bets:function(){
    return emptyWrap(SVG.dice,"No bets yet",
      "Every wager you place on a Betvora Original lands here with its payout.",
      '<button class="btn btn-green" data-nav="lobby">Play now</button>');
  },
  /* Live feed: "mine" tab vs high-roller tab */
  feed:function(tab){
    if(tab==="mine") return emptyWrap(SVG.dice,"No bets from you yet",
      "Switch a tab or place your first bet — it will show up here instantly.",
      '<button class="btn btn-green" data-nav="lobby">Play now</button>');
    return emptyWrap(SVG.crown,"No big demo bets right now",
      "Simulated demo bets of $250 and up appear here. None are showing at the moment — this feed is illustrative, not real players.");
  },
  /* Saved Games shelf */
  saved:function(){
    return emptyWrap(SVG.bookmark,"No saved games",
      "Tap Save on any Betvora Original and it will wait for you on this shelf.",
      '<button class="btn btn-green" data-nav="lobby">Browse games</button>');
  },
  /* Wallet / My transactions / Profile transactions */
  txs:function(){
    return emptyWrap(SVG.wallet,"No transactions yet",
      "Deposits, withdrawals and bonus credits will appear here with their amounts.");
  },
  /* Notifications dropdown */
  notifs:function(){
    return emptyWrap(SVG.bell,"You're all caught up",
      "New bonuses, races and rewards will pop up here.",
      '<button class="btn btn-ghost" data-nav="promos">View promotions</button>');
  }
};
})();
    /* ==================== INIT ==================== */
    Skel.switchRender(); renderFeed(); renderTxs(); renderMyBets(); renderVip(); renderRace(); renderBalance();
    initMotion();
