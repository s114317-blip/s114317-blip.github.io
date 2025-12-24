document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ game.js loaded");

  // ====== 小工具 ======
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function chance(p) { return Math.random() < p; }

  // ====== 取得元素（缺 id 直接停） ======
  var need = [
    "btnFeed","btnSun","btnDew","btnSilk","btnGuard","btnRest","btnReset",
    "creature","stageBadge","toast","fxLayer",
    "growthBar","growthText","hpBar","hpText","moodBar","moodText","guardBar","guardText","hungerBar","hungerText",
    "modal","modalTitle","modalPoem","modalAuthor","modalClose",
    "enemy","enemyTitle","enemyDesc","btnHide","btnScare","btnRun",
    "ending","endingTitle","endingPoem","endingBreed","btnCopy","btnBack"
  ];
  var miss = [];
  for (var i=0;i<need.length;i++){ if(!document.getElementById(need[i])) miss.push(need[i]); }
  if(miss.length){ console.error("❌ Missing ids:", miss); alert("HTML 缺少 id，請看 Console"); return; }

  var btnFeed = document.getElementById("btnFeed");
  var btnSun  = document.getElementById("btnSun");
  var btnDew  = document.getElementById("btnDew");
  var btnSilk = document.getElementById("btnSilk");
  var btnGuard= document.getElementById("btnGuard");
  var btnRest = document.getElementById("btnRest");
  var btnReset= document.getElementById("btnReset");

  var creature = document.getElementById("creature");
  var stageBadge = document.getElementById("stageBadge");
  var toast = document.getElementById("toast");
  var fxLayer = document.getElementById("fxLayer");

  var growthBar = document.getElementById("growthBar");
  var hpBar = document.getElementById("hpBar");
  var moodBar = document.getElementById("moodBar");
  var guardBar = document.getElementById("guardBar");
  var hungerBar = document.getElementById("hungerBar");

  var growthText = document.getElementById("growthText");
  var hpText = document.getElementById("hpText");
  var moodText = document.getElementById("moodText");
  var guardText = document.getElementById("guardText");
  var hungerText = document.getElementById("hungerText");

  var modal = document.getElementById("modal");
  var modalTitle = document.getElementById("modalTitle");
  var modalPoem = document.getElementById("modalPoem");
  var modalAuthor = document.getElementById("modalAuthor");
  var modalClose = document.getElementById("modalClose");

  var enemy = document.getElementById("enemy");
  var enemyTitle = document.getElementById("enemyTitle");
  var enemyDesc  = document.getElementById("enemyDesc");
  var btnHide = document.getElementById("btnHide");
  var btnScare= document.getElementById("btnScare");
  var btnRun  = document.getElementById("btnRun");

  var ending = document.getElementById("ending");
  var endingTitle = document.getElementById("endingTitle");
  var endingPoem = document.getElementById("endingPoem");
  var endingBreed = document.getElementById("endingBreed");
  var btnCopy = document.getElementById("btnCopy");
  var btnBack = document.getElementById("btnBack");

  // ====== 設定與狀態 ======
  var cfg = {
    thresholds: [30, 70, 100],
    stageNames: ["毛毛蟲","蛹","蝴蝶"],
    stageClasses: ["caterpillar","chrysalis","butterfly"],
    // 行為詩詞（短卡）
    poems: {
      feed: { a:"白居易", t:"野火燒不盡，春風吹又生。" },
      sun:  { a:"白居易", t:"日出江花紅勝火，春來江水綠如藍。" },
      dew:  { a:"王維",   t:"明月松間照，清泉石上流。" },
      silk: { a:"遊戲",   t:"吐絲成網，護一寸安靜。" },
      guard:{ a:"遊戲",   t:"屏息凝神，聽風辨影。" },
      rest: { a:"王維",   t:"人閒桂花落，夜靜春山空。" }
    },
    // 進化大卡（含作者與意境）
    evolve: [
      { title:"進化｜結成蛹", a:"劉禹錫", t:"沉舟側畔千帆過，病樹前頭萬木春。" },
      { title:"進化｜羽化成蝶", a:"李白", t:"大鵬一日同風起，扶搖直上九萬里。" }
    ],
    // 天敵事件
    enemies: [
      { title:"🐦 小鳥掠影", desc:"枝頭一聲輕鳴，影子從上方掠過……" },
      { title:"🐜 螞蟻逼近", desc:"細小腳步如雨，氣味正在靠近……" },
      { title:"🌧 暴雨驟來", desc:"天色一沉，雨點打在葉上如鼓……" }
    ],
    endings: [
      { title:"柳暗花明", a:"陸游", t:"山重水複疑無路，柳暗花明又一村。" },
      { title:"長風破浪", a:"李白", t:"長風破浪會有時，直掛雲帆濟滄海。" },
      { title:"化蝶之夢", a:"莊子", t:"莊生曉夢迷蝴蝶。" }
    ]
  };

  // 初始值：你之前想從 0 開始，我保留
  var state = {
    stage: 0,
    growth: 0,
    hp: 0,
    mood: 0,
    guard: 0,
    hunger: 0,
    // 行為統計→決定花紋/品種
    cFeed: 0, cSun: 0, cDew: 0, cSilk: 0, cGuard: 0, cRest: 0,
    // 花紋解鎖
    traitLeaf: false, traitSun: false, traitInk: false, traitSpot: false
  };

  var toastTimer = null;
  function showToast(author, text){
    toast.innerHTML =
      '<div class="poem">「' + text + '」</div>' +
      '<div class="author">— ' + author + '</div>';
    toast.style.opacity = "1";
    if(toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toast.style.opacity = "0.88"; }, 1500);
  }

  function openModal(title, poemText, author){
    modalTitle.textContent = title;
    modalPoem.textContent = "「" + poemText + "」";
    modalAuthor.textContent = "— " + author;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden","false");
    // 墨點特效
    spawnFX("p-ink", 14);
  }
  function closeModalFn(){
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden","true");
  }

  // ====== 粒子特效 ======
  function spawnFX(kind, count){
    for(var i=0;i<count;i++){
      var p = document.createElement("div");
      p.className = "particle " + kind;
      p.style.setProperty("--dx", (Math.random()*300 - 150) + "px");
      p.style.setProperty("--dy", (Math.random()*240 - 190) + "px");
      fxLayer.appendChild(p);
      (function(node){ setTimeout(function(){ node.remove(); }, 950); })(p);
    }
  }

  // ====== 外觀：依養成路線改花紋（毛毛蟲）/品種（蝴蝶） ======
  function updateAppearance(){
    // 先決定毛毛蟲花紋
    // 規則：哪個行為最多 → 主花紋；再加少量隨機稀有
    var best = "leaf";
    var maxv = state.cFeed;
    if(state.cSun > maxv){ maxv = state.cSun; best="sun"; }
    if(state.cGuard + state.cSilk > maxv){ maxv = state.cGuard + state.cSilk; best="ink"; }
    if(state.cDew > maxv){ maxv = state.cDew; best="spot"; }

    // 稀有掉落：透過戳/天敵成功
    // trait 會在別處被打開

    // 清理 class
    creature.classList.remove("cat-leaf","cat-sun","cat-ink","cat-spot","bfly-leaf","bfly-sun","bfly-ink","bfly-spot");

    if(state.stage < 2){
      // 毛毛蟲/蛹（蛹也可以保留花紋）
      if(best==="leaf") creature.classList.add("cat-leaf");
      if(best==="sun")  creature.classList.add("cat-sun");
      if(best==="ink")  creature.classList.add("cat-ink");
      if(best==="spot") creature.classList.add("cat-spot");
    }else{
      // 蝴蝶：由 trait 優先決定品種
      var breed = getButterflyBreed();
      if(breed === "翠葉蝶") creature.classList.add("bfly-leaf");
      if(breed === "金暉蝶") creature.classList.add("bfly-sun");
      if(breed === "墨影蝶") creature.classList.add("bfly-ink");
      if(breed === "花斑蝶") creature.classList.add("bfly-spot");
    }
  }

  function getButterflyBreed(){
    // trait 優先：你有解到稀有花紋就決定品種
    if(state.traitInk)  return "墨影蝶";
    if(state.traitSun)  return "金暉蝶";
    if(state.traitSpot) return "花斑蝶";
    return "翠葉蝶";
  }

  // ====== render ======
  function render(){
    stageBadge.textContent = cfg.stageNames[state.stage];
    creature.classList.remove("caterpillar","chrysalis","butterfly");
    creature.classList.add(cfg.stageClasses[state.stage]);

    updateAppearance();

    growthBar.style.width = state.growth + "%";
    hpBar.style.width = (state.hp/10*100) + "%";
    moodBar.style.width = (state.mood/10*100) + "%";
    guardBar.style.width = (state.guard/10*100) + "%";
    hungerBar.style.width = (state.hunger/10*100) + "%";

    growthText.textContent = state.growth + " / 100";
    hpText.textContent = state.hp + " / 10";
    moodText.textContent = state.mood + " / 10";
    guardText.textContent = state.guard + " / 10";
    hungerText.textContent = state.hunger + " / 10";
  }

  // ====== 天敵事件 ======
  var enemyActive = false;
  var currentEnemy = null;

  function openEnemy(){
    if(enemyActive) return;
    if(!ending.classList.contains("hidden")) return;

    enemyActive = true;
    currentEnemy = pick(cfg.enemies);
    enemyTitle.textContent = currentEnemy.title;
    enemyDesc.textContent = currentEnemy.desc;

    enemy.classList.remove("hidden");
    enemy.setAttribute("aria-hidden","false");
    spawnFX("p-ink", 10);
    showToast("警報", "天敵來襲！快做出反應。");
  }

  function closeEnemy(){
    enemyActive = false;
    currentEnemy = null;
    enemy.classList.add("hidden");
    enemy.setAttribute("aria-hidden","true");
  }

  function resolveEnemy(choice){
    // choice: hide / scare / run
    // 成功率：依 guard/mood/hunger
    var base = 0.35;
    var g = state.guard / 10;
    var m = state.mood / 10;
    var h = state.hunger / 10;

    var p = base;
    if(choice === "hide")  p += 0.35*g + 0.10*(1-h);
    if(choice === "scare") p += 0.25*g + 0.05*(state.cSilk/10) - 0.10*h;
    if(choice === "run")   p += 0.20*m + 0.10*(1-h);

    var ok = Math.random() < p;

    if(ok){
      // 成功獎勵：成長+、警戒+，並小機率解鎖稀有花紋
      state.growth = clamp(state.growth + 8, 0, 100);
      state.guard  = clamp(state.guard + 1, 0, 10);
      state.mood   = clamp(state.mood + 1, 0, 10);
      spawnFX("p-leaf", 8);

      // 稀有掉落：成功事件 25% 開一個 trait（偏墨影/花斑）
      if(chance(0.25)){
        if(chance(0.5)) state.traitInk = true;
        else state.traitSpot = true;
        showToast("獎勵", "你撐過來了，留下了一道稀有花紋。");
      }else{
        showToast("勝利", "你成功避開了危機。");
      }
    }else{
      // 失敗懲罰
      state.hp = clamp(state.hp - 3, 0, 10);
      state.mood = clamp(state.mood - 2, 0, 10);
      state.growth = clamp(state.growth - 6, 0, 100);
      spawnFX("p-ink", 10);
      showToast("受挫", "受了點傷……下次要更警覺。");
    }

    closeEnemy();
    afterTick();
  }

  // ====== 進化與結局 ======
  function checkEvolveAndEnding(){
    if(state.stage === 0 && state.growth >= cfg.thresholds[0]){
      state.stage = 1;
      openModal(cfg.evolve[0].title, cfg.evolve[0].t, cfg.evolve[0].a);
    }
    if(state.stage === 1 && state.growth >= cfg.thresholds[1]){
      state.stage = 2;
      openModal(cfg.evolve[1].title, cfg.evolve[1].t, cfg.evolve[1].a);
      // 進蝶時：依路線解鎖一個基本品種 trait
      // 常曬陽→金暉；常餵食→翠葉
      if(state.cSun > state.cFeed) state.traitSun = true;
      else state.traitLeaf = true;
    }

    if(state.stage === 2 && state.growth >= cfg.thresholds[2] && ending.classList.contains("hidden")){
      var end = pick(cfg.endings);
      endingTitle.textContent = "結局｜" + end.title;
      endingPoem.textContent = "「" + end.t + "」 — " + end.a;
      endingBreed.textContent = "你羽化成為： " + getButterflyBreed();
      ending.classList.remove("hidden");
      ending.setAttribute("aria-hidden","false");
      spawnFX("p-sun", 10);
    }
  }

  // ====== 每次操作後的共通更新（飢餓、自然事件） ======
  var step = 0;

  function afterTick(){
    // 飢餓會慢慢上升，太餓扣血
    state.hunger = clamp(state.hunger + 1, 0, 10);
    if(state.hunger >= 9){
      state.hp = clamp(state.hp - 1, 0, 10);
      showToast("提醒", "太餓了……要記得餵食。");
    }

    // 步數累積，隨機天敵（你要刺激：大概 18% 機率）
    step++;
    if(!enemyActive && state.stage < 2 && step >= 2 && chance(0.18)){
      openEnemy();
      step = 0;
    }

    render();
    checkEvolveAndEnding();
  }

  // ====== 行為按鈕 ======
  function act(type){
    if(enemyActive) return; // 天敵事件時不能亂按
    if(!ending.classList.contains("hidden")) return;

    var p = cfg.poems[type];
    showToast(p.a, p.t);

    if(type === "feed"){
      state.cFeed++;
      state.growth = clamp(state.growth + 7, 0, 100);
      state.hp = clamp(state.hp + 1, 0, 10);
      state.mood = clamp(state.mood + 1, 0, 10);
      state.hunger = clamp(state.hunger - 3, 0, 10);
      spawnFX("p-leaf", 10);
    }
    if(type === "sun"){
      state.cSun++;
      state.growth = clamp(state.growth + 6, 0, 100);
      state.mood = clamp(state.mood + 2, 0, 10);
      state.hp = clamp(state.hp - 1, 0, 10);
      spawnFX("p-sun", 9);
    }
    if(type === "dew"){
      state.cDew++;
      state.hp = clamp(state.hp + 2, 0, 10);
      state.mood = clamp(state.mood + 1, 0, 10);
      state.hunger = clamp(state.hunger - 1, 0, 10);
      spawnFX("p-dew", 10);
    }
    if(type === "silk"){
      state.cSilk++;
      state.guard = clamp(state.guard + 2, 0, 10);
      state.hunger = clamp(state.hunger + 1, 0, 10);
      spawnFX("p-ink", 8);
      // 吐絲有機率解鎖墨影 trait
      if(chance(0.12)) state.traitInk = true;
    }
    if(type === "guard"){
      state.cGuard++;
      state.guard = clamp(state.guard + 2, 0, 10);
      state.mood = clamp(state.mood - 1, 0, 10);
      spawnFX("p-ink", 6);
    }
    if(type === "rest"){
      state.cRest++;
      state.hp = clamp(state.hp + 2, 0, 10);
      state.mood = clamp(state.mood + 1, 0, 10);
      state.hunger = clamp(state.hunger + 1, 0, 10);
      spawnFX("p-ink", 5);
    }

    // 生命歸零處理
    if(state.hp <= 0){
      state.hp = 2;
      state.growth = clamp(state.growth - 8, 0, 100);
      showToast("遊戲", "力竭一瞬，退一步再起。");
    }

    afterTick();
  }

  // ====== 戳毛毛蟲互動：台詞+特效+數值+掉落+引天敵 ======
  var pokeCount = 0;
  var lastPoke = 0;

  var pokeLines = [
    { a:"遊戲", t:"別戳啦……我在努力長大。" },
    { a:"蘇軾", t:"回首向來蕭瑟處，歸去，也無風雨也無晴。" },
    { a:"王維", t:"行到水窮處，坐看雲起時。" },
    { a:"遊戲", t:"你在看我嗎？那我也看看你。" }
  ];

  creature.addEventListener("click", function(){
    if(enemyActive) return;
    if(!ending.classList.contains("hidden")) return;

    var now = Date.now();
    var fast = (now - lastPoke) < 450;
    lastPoke = now;

    // 動畫
    creature.classList.remove("poke");
    void creature.offsetWidth;
    creature.classList.add("poke");
    setTimeout(function(){ creature.classList.remove("poke"); }, 280);

    pokeCount++;

    // 效果：正常戳→心境+；連戳太快→心境-且可能引天敵
    if(!fast){
      state.mood = clamp(state.mood + 1, 0, 10);
      spawnFX("p-ink", 6);
    }else{
      state.mood = clamp(state.mood - 1, 0, 10);
      spawnFX("p-ink", 10);
      // 太吵：20% 叫來天敵（刺激）
      if(state.stage < 2 && chance(0.20)){
        openEnemy();
      }
    }

    // 掉落：每 6 次慢慢戳，給獎勵；小機率解鎖花紋
    if(pokeCount % 6 === 0){
      state.guard = clamp(state.guard + 1, 0, 10);
      state.growth = clamp(state.growth + 4, 0, 100);
      showToast("彩蛋", "你摸到牠的節奏了，牠更信任你。");
      // 10% 送金暉 or 花斑
      if(chance(0.10)){
        if(chance(0.5)) state.traitSun = true;
        else state.traitSpot = true;
        showToast("獎勵", "你發現了稀有花紋的線索。");
      }
    }else{
      var line = pick(pokeLines);
      showToast(line.a, line.t);
    }

    render();
    checkEvolveAndEnding();
  });

  // ====== 綁定事件 ======
  btnFeed.addEventListener("click", function(){ act("feed"); });
  btnSun .addEventListener("click", function(){ act("sun"); });
  btnDew .addEventListener("click", function(){ act("dew"); });
  btnSilk.addEventListener("click", function(){ act("silk"); });
  btnGuard.addEventListener("click", function(){ act("guard"); });
  btnRest.addEventListener("click", function(){ act("rest"); });

  btnReset.addEventListener("click", function(){
    state.stage=0; state.growth=0; state.hp=0; state.mood=0; state.guard=0; state.hunger=0;
    state.cFeed=0; state.cSun=0; state.cDew=0; state.cSilk=0; state.cGuard=0; state.cRest=0;
    state.traitLeaf=false; state.traitSun=false; state.traitInk=false; state.traitSpot=false;
    step=0; enemyActive=false;
    enemy.classList.add("hidden"); ending.classList.add("hidden");
    enemy.setAttribute("aria-hidden","true"); ending.setAttribute("aria-hidden","true");
    closeModalFn();
    showToast("系統","重置完成，從春天再走一次。");
    render();
  });

  modalClose.addEventListener("click", closeModalFn);

  btnHide.addEventListener("click", function(){ resolveEnemy("hide"); });
  btnScare.addEventListener("click", function(){ resolveEnemy("scare"); });
  btnRun.addEventListener("click", function(){ resolveEnemy("run"); });

  btnCopy.addEventListener("click", function(){
    var text = endingTitle.textContent + "\n" + endingPoem.textContent + "\n" + endingBreed.textContent;
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){
        showToast("系統","已複製到剪貼簿。");
      }).catch(function(){
        showToast("系統","複製失敗，請手動選取。");
      });
    }else{
      showToast("系統","此瀏覽器不支援自動複製。");
    }
  });

  btnBack.addEventListener("click", function(){ window.location.reload(); });

  // ====== 初始化 ======
  showToast("提示","按按鈕養牠；也可以戳牠互動（連戳太吵會引來天敵）。");
  render();
});
Saffi正在輸入
Saffi正在輸入
撰寫內容給Saffi Wu
