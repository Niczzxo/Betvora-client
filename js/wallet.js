/* Betvora — wallet.js
   Auth (login/register), wallet panel, deposit flow (currency, amount,
   address, QR, 30-min timer, deposit simulation), withdraw + turnover gate.
   Loaded SECOND (before pages.js: the navbar init binds openWallet at load).
   Split from the single-file build; execution order preserved across files.
   Classic script (no modules) — works over file:// and http(s). */

    /* ==================== AUTH ==================== */
    let authMode="login";
    function setAuthMode(m){
      authMode=m;
      $("#tabLogin").classList.toggle("on",m==="login");
      $("#tabRegister").classList.toggle("on",m==="register");
      $("#authNameField").style.display= m==="register"? "block":"none";
      $("#authTitle").textContent= m==="register"? "Create your account":"Welcome back";
      $("#authSubmit").textContent= m==="register"? "Register & claim $1,000":"Log in";
      $("#authAlt").innerHTML= m==="register"? 'Already have an account? <button id="authAltBtn" type="button">Log in</button>' : 'New to Betvora? <button id="authAltBtn" type="button">Create an account</button>';
      $("#authAltBtn").addEventListener("click",()=>setAuthMode(m==="register"?"login":"register"));
      $("#authErr").classList.remove("show");
    }
    $("#tabLogin").addEventListener("click",()=>setAuthMode("login"));
    $("#tabRegister").addEventListener("click",()=>setAuthMode("register"));
    $("#loginBtn").addEventListener("click",()=>{ openOverlay("authOverlay"); setAuthMode("login"); });
    $("#registerBtn").addEventListener("click",()=>{ openOverlay("authOverlay"); setAuthMode("register"); });
    $("#sideLoginBtn").addEventListener("click",()=>{ openOverlay("authOverlay"); setAuthMode("login"); });
    $("#sideRegisterBtn").addEventListener("click",()=>{ openOverlay("authOverlay"); setAuthMode("register"); });
    $("#authForm").addEventListener("submit",e=>{
      e.preventDefault();
      const email=$("#authEmail").value.trim(), pass=$("#authPass").value, name=$("#authName").value.trim();
      const err=$("#authErr");
      const fail=m=>{ err.textContent=m; err.classList.add("show"); };
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Enter a valid email address.");
      if(pass.length<6) return fail("Password must be at least 6 characters.");
      if(authMode==="register" && name.length<3) return fail("Username must be at least 3 characters.");
      const uname= authMode==="register"? name : (email.split("@")[0].replace(/[._-]+/g," ").replace(/\b\w/g,c=>c.toUpperCase()));
      state.user={name:uname,email:email};
      if(typeof restoreSaved==="function") restoreSaved();
      if(!state.joined) state.joined=new Date();
      document.body.dataset.auth="user";
      renderLobbyRows();
      if(state.balance<=0) state.balance=1000;
      $("#authBtns").style.display="none";
      $("#balancePill").style.display="flex";
      $("#rewardsAnchor").style.display="block";
      $("#bellAnchor").style.display="block";
      $("#userAnchor").style.display="block";
      renderAvatar();
      $("#dropUserName").textContent=uname;
      renderBalance();
      closeOverlay("authOverlay");
      sfx.coin();
      toast(authMode==="register"?"Account created":"Welcome back, "+uname, authMode==="register"?"$1,000 play balance is in your wallet. Good luck at Betvora!":"Your balance and bonuses are ready.");
      addTx("bonus","Welcome balance",0);
      state.txs.shift(); renderTxs();
    });
    function doLogout(){
      state.user=null;
      if(typeof resetSaved==="function") resetSaved();
      document.body.dataset.auth="guest";
      state.search=""; const si=$("#searchInput"); if(si) si.value=""; $("#searchBox").classList.remove("has-q");
      renderLobbyRows();
      if(MEMBER_ROUTES.indexOf(state.view)>=0) navigate("lobby");
      $("#authBtns").style.display="flex";
      $("#balancePill").style.display="none";
      $("#rewardsAnchor").style.display="none";
      $("#bellAnchor").style.display="none";
      $("#userAnchor").style.display="none";
      $$(".drop").forEach(d=>d.classList.remove("open"));
      toast("Logged out","See you soon. Your demo session stays in this tab.");
    }
    $("#logoutBtn").addEventListener("click",doLogout);
    $("#profLogoutBtn").addEventListener("click",doLogout);
    /* dropdowns */
    $("#bellBtn").addEventListener("click",e=>{ e.stopPropagation(); const d=$("#bellDrop"), was=d.classList.contains("open"); $$(".drop").forEach(x=>x.classList.remove("open")); if(!was) d.classList.add("open"); });
    $("#rewardsBtn").addEventListener("click",e=>{ e.stopPropagation(); const d=$("#rewardsDrop"), was=d.classList.contains("open"); $$(".drop").forEach(x=>x.classList.remove("open")); if(!was) d.classList.add("open"); });
    $("#avatarBtn").addEventListener("click",e=>{ e.stopPropagation(); const d=$("#userDrop"), was=d.classList.contains("open"); $$(".drop").forEach(x=>x.classList.remove("open")); if(!was) d.classList.add("open"); });
    const NOTIFS=[
      {t:"Welcome bonus waiting",s:"200% up to $2,000 + 50 Betvora Slots spins on your first deposit.",gold:true},
      {t:"$100K Weekly Race is live",s:"Every wager climbs the board. $25,000 to first place.",gold:false},
      {t:"Rakeback accrues automatically",s:"You earn rakeback on every bet — claim it in the VIP Club.",gold:false}
    ];
    function renderNotifs(){
      $("#notifList").innerHTML=NOTIFS.length? NOTIFS.map((n,i)=>'<div class="drop-item" style="cursor:default"><span class="di-ic" style="'+(n.gold?"color:var(--gold)":"color:var(--green)")+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7m0 0H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7Zm0 0h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z"/></svg></span><span><b>'+esc(n.t)+'</b><span>'+esc(n.s)+'</span></span><button class="notif-x" data-notif="'+i+'" aria-label="Dismiss notification">×</button></div>').join("") : Empty.notifs();
      $("#bellDot").style.display=NOTIFS.length?"":"none";
    }
    renderNotifs();
    $("#notifList").addEventListener("click",e=>{ const x=e.target.closest("[data-notif]"); if(!x) return; e.stopPropagation(); NOTIFS.splice(+x.dataset.notif,1); renderNotifs(); sfx.click(); });
    $("#markReadBtn").addEventListener("click",()=>{ $("#bellDot").style.display="none"; $$(".drop").forEach(d=>d.classList.remove("open")); toast("All caught up","Notifications marked as read."); });

/* Compact QR encoder: byte mode, EC level M, versions 1-8. Returns module matrix. */
function makeQrMatrix(text) {
  // ---- GF(256) tables ----
  const EXP = new Array(512), LOG = new Array(256);
  (function () {
    let x = 1;
    for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11D; }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();
  function gfMul(a, b) { return (a && b) ? EXP[LOG[a] + LOG[b]] : 0; }

  function rsDivisor(deg) {
    const res = new Array(deg).fill(0); res[deg - 1] = 1;
    let root = 1;
    for (let i = 0; i < deg; i++) {
      for (let j = 0; j < res.length; j++) {
        res[j] = gfMul(res[j], root);
        if (j + 1 < res.length) res[j] ^= res[j + 1];
      }
      root = gfMul(root, 0x02);
    }
    return res;
  }
  function rsRemainder(data, div) {
    const res = new Array(div.length).fill(0);
    for (const b of data) {
      const factor = b ^ res.shift(); res.push(0);
      for (let i = 0; i < div.length; i++) res[i] ^= gfMul(div[i], factor);
    }
    return res;
  }

  // EC level M block table: [ecPerBlock, [[numBlocks, dataCwPerBlock], ...]]
  const ECC_M = [
    null,
    [10, [[1, 16]]],
    [16, [[1, 28]]],
    [26, [[1, 44]]],
    [18, [[2, 32]]],
    [24, [[2, 43]]],
    [16, [[4, 27]]],
    [18, [[4, 31]]],
    [22, [[2, 38], [2, 39]]]
  ];
  const ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42]];
  const REMAINDER = [0, 0, 7, 7, 7, 7, 7, 0, 0];

  const bytes = [];
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) { bytes.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F)); }
    else { bytes.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)); }
  }

  // pick version
  let version = 0, dataCwTotal = 0;
  for (let v = 1; v <= 8; v++) {
    const dcw = ECC_M[v][1].reduce((a, g) => a + g[0] * g[1], 0);
    if (4 + 8 + bytes.length * 8 <= dcw * 8) { version = v; dataCwTotal = dcw; break; }
  }
  if (!version) throw new Error("payload too long");

  // build data bitstream
  const bits = [];
  function pushBits(val, len) { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
  pushBits(0x4, 4);            // byte mode
  pushBits(bytes.length, 8);   // count (versions 1-9)
  for (const b of bytes) pushBits(b, 8);
  const capBits = dataCwTotal * 8;
  pushBits(0, Math.min(4, capBits - bits.length));
  while (bits.length % 8) bits.push(0);
  const dataBytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    dataBytes.push(b);
  }
  for (let pad = 0xEC; dataBytes.length < dataCwTotal; pad ^= 0xEC ^ 0x11) dataBytes.push(pad);

  // split into blocks + EC, interleave
  const ecLen = ECC_M[version][0], div = rsDivisor(ecLen);
  const blocks = [];
  let off = 0;
  for (const [count, dcw] of ECC_M[version][1]) {
    for (let k = 0; k < count; k++) {
      const d = dataBytes.slice(off, off + dcw); off += dcw;
      blocks.push({ data: d, ec: rsRemainder(d, div) });
    }
  }
  const finalBits = [];
  const maxDcw = Math.max(...blocks.map(b => b.data.length));
  for (let i = 0; i < maxDcw; i++) for (const b of blocks) if (i < b.data.length) pushBitsTo(finalBits, b.data[i]);
  for (let i = 0; i < ecLen; i++) for (const b of blocks) pushBitsTo(finalBits, b.ec[i]);
  function pushBitsTo(arr, byte) { for (let i = 7; i >= 0; i--) arr.push((byte >>> i) & 1); }
  for (let i = 0; i < REMAINDER[version]; i++) finalBits.push(0);

  // ---- matrix ----
  const size = version * 4 + 17;
  const mod = [], func = [];
  for (let y = 0; y < size; y++) { mod.push(new Array(size).fill(0)); func.push(new Array(size).fill(false)); }
  function setF(x, y, v) { if (0 <= x && x < size && 0 <= y && y < size) { mod[y][x] = v ? 1 : 0; func[y][x] = true; } }
  function getBit(x, i) { return (x >>> i) & 1; }

  // timing
  for (let i = 0; i < size; i++) { setF(i, 6, i % 2 === 0); setF(6, i, i % 2 === 0); }
  // finders
  function finder(cx, cy) {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const d = Math.max(Math.abs(dx), Math.abs(dy));
      setF(cx + dx, cy + dy, d !== 2 && d !== 4);
    }
  }
  finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
  // alignment
  const pos = ALIGN[version];
  for (let i = 0; i < pos.length; i++) for (let j = 0; j < pos.length; j++) {
    const skip = (i === 0 && j === 0) || (i === 0 && j === pos.length - 1) || (i === pos.length - 1 && j === 0);
    if (skip) continue;
    const cx = pos[i], cy = pos[j];
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const d = Math.max(Math.abs(dx), Math.abs(dy));
      setF(cx + dx, cy + dy, d !== 1);
    }
  }
  // format placeholder + dark module
  drawFormat(0);
  setF(8, size - 8, 1);
  if (version >= 7) drawVersion();

  function drawFormat(mask) {
    const data = (0 << 3) | mask; // EC level M formatBits = 0
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;
    for (let i = 0; i <= 5; i++) setF(8, i, getBit(bits, i));
    setF(8, 7, getBit(bits, 6));
    setF(8, 8, getBit(bits, 7));
    setF(7, 8, getBit(bits, 8));
    for (let i = 9; i < 15; i++) setF(14 - i, 8, getBit(bits, i));
    for (let i = 0; i < 8; i++) setF(size - 1 - i, 8, getBit(bits, i));
    for (let i = 8; i < 15; i++) setF(8, size - 15 + i, getBit(bits, i));
    setF(8, size - 8, 1);
  }
  function drawVersion() {
    let rem = version;
    for (let i = 0; i < 6; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
    const bits = (version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const a = size - 11 + (i % 3), b = Math.floor(i / 3);
      setF(a, b, getBit(bits, i));
      setF(b, a, getBit(bits, i));
    }
  }

  const MASKS = [
    (r, c) => (r + c) % 2 === 0,
    (r, c) => r % 2 === 0,
    (r, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => (r * c) % 2 + (r * c) % 3 === 0,
    (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
    (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0
  ];

  // place data bits (no mask yet)
  (function place() {
    let i = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? size - 1 - vert : vert;
          if (!func[y][x] && i < finalBits.length) { mod[y][x] = finalBits[i]; i++; }
        }
      }
    }
  })();

  function applyMask(mask) {
    const f = MASKS[mask];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++)
      if (!func[y][x] && f(y, x)) mod[y][x] ^= 1;
  }

  function penalty() {
    let score = 0;
    // rule 1 + 3 via run scanning (rows then cols)
    function scan(get) {
      let runs = []; // [color, len]
      for (let i = 0; i < size; i++) {
        const c = get(i);
        if (runs.length && runs[runs.length - 1][0] === c) runs[runs.length - 1][1]++;
        else runs.push([c, 1]);
      }
      for (const r of runs) if (r[1] >= 5) score += 3 + (r[1] - 5);
      // rule 3: D L DDD L D pattern (1,1,3,1,1)*k with >=4k light before or after
      for (let i = 0; i + 4 < runs.length + 1 && i + 4 <= runs.length - 1 + 1; i++) {
        // window of 5 runs centered: idx i..i+4, middle is the 3x dark
      }
      for (let i = 0; i + 4 < runs.length; i++) {
        const w = runs.slice(i, i + 5);
        if (w[0][0] === 1 && w[1][0] === 0 && w[2][0] === 1 && w[3][0] === 0 && w[4][0] === 1) {
          const k = w[0][1];
          if (w[1][1] === k && w[2][1] === 3 * k && w[3][1] === k && w[4][1] === k) {
            const before = i > 0 ? runs[i - 1][1] : size;
            const after = i + 5 < runs.length ? runs[i + 5][1] : size;
            if (before >= 4 * k || after >= 4 * k) score += 40;
          }
        }
      }
      return runs;
    }
    for (let y = 0; y < size; y++) scan(x => mod[y][x]);
    for (let x = 0; x < size; x++) scan(y => mod[y][x]);
    // rule 2: 2x2 same-color blocks
    for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++)
      if (mod[y][x] === mod[y][x + 1] && mod[y][x] === mod[y + 1][x] && mod[y][x] === mod[y + 1][x + 1]) score += 3;
    // rule 4: balance
    let dark = 0; for (const row of mod) for (const c of row) dark += c;
    const total = size * size;
    const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
    if (k > 0) score += k * 10;
    return score;
  }

  let bestMask = 0, bestScore = Infinity, bestMod = null;
  const base = mod.map(r => r.slice());
  for (let m = 0; m < 8; m++) {
    for (let y = 0; y < size; y++) mod[y] = base[y].slice();
    applyMask(m);
    drawFormat(m);
    const s = penalty();
    if (s < bestScore) { bestScore = s; bestMask = m; bestMod = mod.map(r => r.slice()); }
  }
  return { size, modules: bestMod, version, mask: bestMask };
}

function drawQrToCanvas(text, canvas, target) {
  const { size, modules } = makeQrMatrix(text);
  const quiet = 4, cells = size + quiet * 2;
  const cell = Math.max(2, Math.floor((target || 200) / cells));
  const px = cell * cells;
  canvas.width = px; canvas.height = px;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, px, px);
  ctx.fillStyle = "#101418";
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++)
    if (modules[y][x]) ctx.fillRect((x + quiet) * cell, (y + quiet) * cell, cell, cell);
  return px;
}
    /* ==================== WALLET ==================== */
    function rndFrom(cs,n){ let s=""; for(let i=0;i<n;i++) s+=cs.charAt(Math.floor(Math.random()*cs.length)); return s; }
    const B58="123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const DEP_CURS={
      USDT:{name:"USDT", summary:"USDT · Tether (TRC20)", addrLabel:"Your USDT deposit address", netChip:"Network · TRC20 (demo)", curChip:"Currency · USDT Tether", tx:"USDT (TRC20)", gen:()=>"T"+rndFrom(B58,33)},
      BTC:{name:"BTC", summary:"BTC · Bitcoin", addrLabel:"Your Bitcoin deposit address", netChip:"Network · Bitcoin (demo)", curChip:"Currency · BTC Bitcoin", tx:"Bitcoin (BTC)", gen:()=>"bc1q"+rndFrom("023456789acdefghjklmnpqrstuvwxyz",38)},
      GRAM:{name:"GRAM", summary:"GRAM · Gram (TON)", addrLabel:"Your Gram deposit address", netChip:"Network · TON (demo)", curChip:"Currency · GRAM Gram", tx:"Gram (TON)", gen:()=>"EQ"+rndFrom("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",46)}
    };
    let depCur="USDT";
    const depAddrs={};
    function depAddr(){ if(!depAddrs[depCur]) depAddrs[depCur]=DEP_CURS[depCur].gen(); return depAddrs[depCur]; }
    let pendingDep=0, depTimer=null, depClock=null, depSecsLeft=0, depExpired=false;
    function showDepStep(n){
      $("#depStepCurrency").style.display= n===1? "block":"none";
      $("#depStepAmount").style.display= n===2? "block":"none";
      $("#depStepPay").style.display= n===3? "block":"none";
      $$("#depStepsBar .dep-step").forEach(s=>{
        const k=parseInt(s.dataset.ds,10);
        s.classList.toggle("on",k===n);
        s.classList.toggle("done",k<n);
      });
    }
    function openWallet(){ if(!state.user){ requireAuth(openWallet); return; } openOverlay("walletOverlay"); renderBalance(); renderTurnover(); }
    $$("#walletTabs button").forEach(b=>b.addEventListener("click",()=>{
      $$("#walletTabs button").forEach(x=>x.classList.toggle("on",x===b));
      ["deposit","withdraw","history"].forEach(k=>{ $("#wtab-"+k).style.display= b.dataset.wtab===k? "block":"none"; });
      const _we=$("#wdErr"); if(_we){ _we.textContent=""; _we.classList.remove("show"); }
      if(b.dataset.wtab==="withdraw") renderTurnover();
      sfx.click();
    }));
    $("#copyAddrBtn").addEventListener("click",()=>{
      const txt=depAddr();
      if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(()=>toast("Address copied","Your "+depCur+" deposit address is on your clipboard.")).catch(()=>toast("Copy this address",txt)); }
      else toast("Copy this address",txt);
    });
    $$("#depCurRow .coin-opt").forEach(b=>b.addEventListener("click",()=>{
      depCur=b.dataset.cur;
      $$("#depCurRow .coin-opt").forEach(x=>x.classList.toggle("on",x===b));
      $("#depCurSummary").textContent=DEP_CURS[depCur].summary;
      depClearErr();
      showDepStep(2);
      sfx.click();
    }));
    $("#depChangeCurBtn").addEventListener("click",()=>{ showDepStep(1); sfx.click(); });
    function depFail(m){ const e=$("#depErr"); e.textContent=m; e.classList.add("show"); }
    function depClearErr(){ $("#depErr").classList.remove("show"); }
    $$("#depAmts button").forEach(b=>b.addEventListener("click",()=>{ $("#depAmount").value=b.dataset.amt; depClearErr(); sfx.click(); }));
    $("#depAmount").addEventListener("input",depClearErr);
    function drawDepQr(){
      try{ drawQrToCanvas(depAddr(), $("#depQrCanvas"), 200); }
      catch(e){ const c=$("#depQrCanvas"), x=c.getContext("2d"); x.fillStyle="#fff"; x.fillRect(0,0,c.width,c.height); x.fillStyle="#101418"; x.font="700 13px Manrope"; x.textAlign="center"; x.fillText("QR unavailable — copy the address", c.width/2, c.height/2); }
    }
    function fmtClock(s){ const m=Math.floor(s/60), ss=s%60; return (m<10?"0":"")+m+":"+(ss<10?"0":"")+ss; }
    function paintDepTimer(){
      $("#depTimerTxt").textContent=fmtClock(Math.max(0,depSecsLeft));
      $("#depTimerBox").classList.toggle("low",!depExpired&&depSecsLeft<=60);
    }
    function stopDepClock(){ if(depClock){ clearInterval(depClock); depClock=null; } }
    function expireDep(){
      stopDepClock();
      depExpired=true;
      $("#depTimerTxt").textContent="00:00";
      $("#depTimerBox").classList.add("low");
      $("#depQr").classList.add("expired");
      $("#depExpired").style.display="block";
      $("#depSimBtn").disabled=true;
      sfx.lose();
    }
    function startDepClock(){
      stopDepClock();
      depExpired=false;
      depSecsLeft=30*60;
      $("#depExpired").style.display="none";
      $("#depQr").classList.remove("expired");
      $("#depSimBtn").disabled=false;
      paintDepTimer();
      depClock=setInterval(()=>{
        depSecsLeft--;
        if(depSecsLeft<=0){ expireDep(); return; }
        paintDepTimer();
      },1000);
    }
    function enterPayStep(){
      const c=DEP_CURS[depCur];
      $("#depAddrLabel").textContent=c.addrLabel;
      $("#depAddress").textContent=depAddr();
      $("#depPayAmt").textContent=fmt$(pendingDep);
      $("#depPayCur").textContent=c.name;
      $("#depNetChip").textContent=c.netChip;
      $("#depCurChip").textContent=c.curChip;
      drawDepQr();
      startDepClock();
      showDepStep(3);
    }
    $("#depRegenBtn").addEventListener("click",()=>{
      depAddrs[depCur]=DEP_CURS[depCur].gen();
      $("#depAddress").textContent=depAddr();
      drawDepQr();
      startDepClock();
      sfx.click();
      toast("New address generated","A fresh "+depCur+" demo address and a new 30-minute window are ready.");
    });
    $("#depNextBtn").addEventListener("click",()=>{
      const amt=parseFloat($("#depAmount").value);
      if(!amt||isNaN(amt)||amt<=0) return depFail("Enter a deposit amount — the minimum deposit is $5.00.");
      if(amt<5) return depFail("Minimum deposit is $5.00 — you entered "+fmt$(amt)+". Please top it up to at least $5.00.");
      depClearErr();
      pendingDep=Math.round(amt*100)/100;
      enterPayStep();
      sfx.click();
    });
    $("#depBackBtn").addEventListener("click",()=>{
      if(depTimer) return;
      stopDepClock();
      showDepStep(2);
      sfx.click();
    });
    $("#depSimBtn").addEventListener("click",()=>{
      if(depTimer||pendingDep<=0) return;
      if(depExpired){ toast("Payment window expired","Generate a new address to restart the 30-minute window.","err"); return; }
      const btn=$("#depSimBtn");
      btn.disabled=true;
      btn.innerHTML='<span class="dep-spin"></span>Waiting for payment — confirming…';
      const wait=state.anim?2600:700;
      depTimer=setTimeout(()=>{
        depTimer=null;
        btn.disabled=false;
        btn.textContent="Simulate a deposit";
        stopDepClock();
        const amt=pendingDep; pendingDep=0;
        state.balance+=amt; addTx("dep","Deposit · "+DEP_CURS[depCur].tx,amt);
        state.lastDeposit=amt; state.wageredSinceDeposit=0;
        if(!state.firstDepositDone){
          const bonus=Math.min(amt,1000); state.firstDepositDone=true;
          state.rewards.push({id:"firstdep",title:"First Deposit Bonus · 100%",desc:"Your 100% match on your first "+fmt$(amt)+" deposit — redeem it into your balance.",amount:bonus});
          renderRewards(); sfx.big();
          $("#fdWalletTitle").textContent="Bonus unlocked — claim it in Rewards";
          $("#fdWalletText").textContent="Your "+fmt$(bonus)+" match is waiting under Rewards in the top bar. Hit Redeem there and it lands straight in your balance.";
          $("#fdWalletTag").textContent="CLAIM";
          const pb=$("#firstDepBtn"); if(pb) pb.textContent="Claim in Rewards ↑";
          toast("First deposit bonus unlocked!",fmt$(amt)+" deposited — your "+fmt$(bonus)+" match is waiting under Rewards in the navbar. Redeem it there.","gold");
        } else {
          sfx.coin();
          toast("Deposit confirmed",fmt$(amt)+" of play money added via "+DEP_CURS[depCur].tx+".");
        }
        renderBalance(); renderTurnover();
        showDepStep(2);
        $("#depAmount").value="";
      },wait);
    });
    /* ---- 2x turnover gate on withdrawals (applies to the most recent deposit) ---- */
    function turnoverReq(){ return state.lastDeposit>0? Math.round(state.lastDeposit*2*100)/100 : 0; }
    function turnoverLocked(){ const r=turnoverReq(); return r>0 && Math.round((state.wageredSinceDeposit||0)*100)/100<r; }
    function renderTurnover(){
      const msg=$("#turnoverMsg"), bar=$("#turnoverBar"), btn=$("#wdBtn");
      if(!msg||!bar) return;
      const req=turnoverReq(), wag=Math.round((state.wageredSinceDeposit||0)*100)/100;
      if(req<=0){
        msg.textContent="No deposit yet this session — withdrawals are open. Once you deposit, a 2x turnover on that deposit applies before you can withdraw.";
        bar.style.width="100%";
        if(btn) btn.disabled=false;
        return;
      }
      bar.style.width=Math.min(100,wag/req*100)+"%";
      if(wag>=req){
        msg.textContent="Turnover complete ✓ — you deposited "+fmt$(state.lastDeposit)+", wagered "+fmt$(wag)+" of the required "+fmt$(req)+". Withdrawals are unlocked.";
        if(btn) btn.disabled=false;
      } else {
        msg.textContent="Withdrawals unlock after 2x turnover — you deposited "+fmt$(state.lastDeposit)+", wagered "+fmt$(wag)+" of the required "+fmt$(req)+".";
        if(btn) btn.disabled=true;
      }
    }
    $("#wdMax").addEventListener("click",()=>{ $("#wdAmount").value=Math.floor(state.balance*100)/100; });
    $("#wdBtn").addEventListener("click",()=>{
      const amt=parseFloat($("#wdAmount").value), addr=$("#wdAddress").value.trim(), err=$("#wdErr");
      const fail=m=>{ err.textContent=m; err.classList.add("show"); };
      err.textContent=""; err.classList.remove("show");
      if(turnoverLocked()) return fail("Withdrawals unlock after 2x turnover — you deposited "+fmt$(state.lastDeposit)+", wagered "+fmt$(state.wageredSinceDeposit)+" of the required "+fmt$(turnoverReq())+". Keep playing to unlock.");
      if(!amt||amt<=0) return fail("Enter an amount to withdraw.");
      if(amt<20) return fail("Minimum withdrawal is $20.00.");
      if(amt>state.balance) return fail("Amount exceeds your balance of "+fmt$(state.balance)+".");
      if(addr.length<12) return fail("Enter a valid destination wallet address.");
      state.balance-=amt; renderBalance(); addTx("wd","Withdrawal · USDT",-amt); sfx.coin();
      $("#wdAmount").value=""; $("#wdAddress").value="";
      err.textContent=""; err.classList.remove("show");
      toast("Withdrawal sent",fmt$(amt)+" is on its way to your wallet (demo).","gold");
    });
