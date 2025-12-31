document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ game.js loaded");

  function $(id){ return document.getElementById(id); }
  function clamp(n,min,max){ return Math.max(min, Math.min(max,n)); }
  function chance(p){ return Math.random() < p; }
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  // 必要元素（依你目前版型：沒有 btnFeed）
  var need = [
    "btnSun","btnDew","btnSilk","btnGuard","btnRest","btnReset",
    "leafTray",
    "creature","stageBadge","toast","fxLayer",
    "growthBar","growthText","hpBar","hpText","moodBar","moodText","guardBar","guardText","hungerBar","hungerText",
    "modal","modalTitle","modalPoem","modalAuthor","modalClose",
    "enemy","enemyTitle","enemyDesc","btnHide","btnScare","btnRun",
    "ending","endingTitle","endingPoem","endingBreed","btnCopy","btnBack"
  ];
  var miss = [];
  need.forEach(function(id){ if(!$(id)) miss.push(id); });
  if(miss.length){
    console.error("❌ Missing ids:", miss);
    alert("HTML 缺少 id：\n" + miss.join(", "));
    return;
  }

  // refs
  var btnSun=$("btnSun"), btnDew=$("btnDew"), btnSilk=$("btnSilk"), btnGuard=$("btnGuard"), btnRest=$("btnRest"), btnReset=$("btnReset");
  var leafTray=$("leafTray");
  var creature=$("creature"), stageBadge=$("stageBadge"), toast=$("toast"), fxLayer=$("fxLayer");

  var growthBar=$("growthBar"), hpBar=$("hpBar"), moodBar=$("moodBar"), guardBar=$("guardBar"), hungerBar=$("hungerBar");
  var growthText=$("growthText"), hpText=$("hpText"), moodText=$("moodText"), guardText=$("guardText"), hungerText=$("hungerText");

  var modal=$("modal"), modalTitle=$("modalTitle"), modalPoem=$("modalPoem"), modalAuthor=$("modalAuthor"), modalClose=$("modalClose");
  var enemy=$("enemy"), enemyTitle=$("enemyTitle"), enemyDesc=$("enemyDesc"), btnHide=$("btnHide"), btnScare=$("btnScare"), btnRun=$("btnRun");
  var ending=$("ending"), endingTitle=$("endingTitle"), endingPoem=$("endingPoem"), endingBreed=$("endingBreed"), btnCopy=$("btnCopy"), btnBack=$("btnBack");

  // 特效粒子
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

  // toast
  var toastTimer=null;
  function showToast(author, text){
    toast.innerHTML =
      '<div class="poem">「' + text + '」</div>' +
      '<div class="author">— ' + author + '</div>';
    toast.style.opacity="1";
    if(toastTimer) clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){ toast.style.opacity="0.88"; }, 1500);
    spawnFX("p-ink", 6);
  }

  // modal
  function openModal(title, text, author){
    modalTitle.textContent = title;
    modalPoem.textContent = "「" + text + "」";
    modalAuthor.textContent = "— " + author;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden","false");
    spawnFX("p-ink", 12);
  }
  function closeModalFn(){
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden","true");
  }

  // config：行動詩詞 + 進化詩詞 + 各色結局詩詞
  var cfg = {
    thresholds:[30,70,100],
    stageNames:["毛毛蟲","蛹","蝴蝶"],
    poems:{
      feed:{a:"白居易",t:"野火燒不盡，春風吹又生。"},
      sun:{a:"白居易",t:"日出江花紅勝火，春來江水綠如藍。"},
      dew:{a:"王維",t:"明月松間照，清泉石上流。"},
      silk:{a:"遊戲",t:"吐絲成網，護一寸安靜。"},
      guard:{a:"遊戲",t:"屏息凝神，聽風辨影。"},
      rest:{a:"王維",t:"人閒桂花落，夜靜春山空。"}
    },
    evolve:[
      {title:"進化｜結成蛹",a:"劉禹錫",t:"沉舟側畔千帆過，病樹前頭萬木春。"},
      {title:"進化｜羽化成蝶",a:"李白",t:"大鵬一日同風起，扶搖直上九萬里。"}
    ],
    enemies:[
      {title:"🐦 小鳥掠影",desc:"枝頭一聲輕鳴，影子從上方掠過……"},
      {title:"🐜 螞蟻逼近",desc:"細小腳步如雨，氣味正在靠近……"},
      {title:"🌧 暴雨驟來",desc:"天色一沉，雨點打在葉上如鼓……"}
    ],
    endingsByBreed:{
      emerald:{ title:"結局｜翠意不息", a:"白居易", t:"野火燒不盡，春風吹又生。", label:"翠綠蝶（滋養型）", className:"bf-emerald" },
      gold:   { title:"結局｜向光而生", a:"王之渙", t:"欲窮千里目，更上一層樓。", label:"金暉蝶（向陽型）", className:"bf-gold" },
      azure:  { title:"結局｜清泉入夢", a:"王維", t:"明月松間照，清泉石上流。", label:"青藍蝶（澄澈型）", className:"bf-azure" },
      ink:    { title:"結局｜墨落成形", a:"蘇軾", t:"回首向來蕭瑟處，歸去，也無風雨也無晴。", label:"墨影蝶（沉靜型）", className:"bf-ink" },
      crimson:{ title:"結局｜守住一線", a:"辛棄疾", t:"眾裡尋他千百度，驀然回首，那人卻在燈火闌珊處。", label:"朱紅蝶（警覺型）", className:"bf-crimson" },
      silver: { title:"結局｜靜養成春", a:"陶淵明", t:"採菊東籬下，悠然見南山。", label:"銀灰蝶（休養型）", className:"bf-silver" }
    }
  };

  // state（新增：行為統計，用來決定蝴蝶顏色）
  var state = {
    stage:0, growth:0, hp:0, mood:0, guard:0, hunger:0,
    counts:{ feed:0, sun:0, dew:0, silk:0, guard:0, rest:0, poke:0 },
    breedKey:"emerald"
  };

  // 外觀 class 套用
  function updateCreatureClass(){
    creature.className = "creature";
    if(state.stage===0) creature.classList.add("caterpillar");
    if(state.stage===1) creature.classList.add("chrysalis");
    if(state.stage===2){
      creature.classList.add("butterfly");
      creature.classList.add(cfg.endingsByBreed[state.breedKey].className);
    }
  }

  function render(){
    stageBadge.textContent = cfg.stageNames[state.stage];
    updateCreatureClass();

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

  // 根據玩家養成方式決定品種（看哪個行為最多）
  function decideBreed(){
    var c = state.counts;
    var pairs = [
      ["emerald", c.feed],
      ["gold", c.sun],
      ["azure", c.dew],
      ["ink", c.silk],
      ["crimson", c.guard],
      ["silver", c.rest]
    ];
    pairs.sort(function(a,b){ return b[1]-a[1]; });
    // 如果都一樣少，就用翠綠
    state.breedKey = (pairs[0][1]===0) ? "emerald" : pairs[0][0];
  }

  // enemy event
  var enemyActive=false;
  function openEnemy(){
    if(enemyActive || state.stage===2) return;
    enemyActive=true;
    var e = pick(cfg.enemies);
    enemyTitle.textContent = e.title;
    enemyDesc.textContent = e.desc;
    enemy.classList.remove("hidden");
    enemy.setAttribute("aria-hidden","false");
    spawnFX("p-ink", 10);
  }
  function closeEnemy(){
    enemyActive=false;
    enemy.classList.add("hidden");
    enemy.setAttribute("aria-hidden","true");
  }
  function resolveEnemy(mode){
    var p = 0.35 + (state.guard/10)*0.35 + (state.mood/10)*0.15 - (state.hunger/10)*0.10;
    if(mode==="run") p += 0.05;
    if(mode==="scare") p += 0.05;
    var ok = Math.random() < p;

    if(ok){
      state.growth = clamp(state.growth + 8, 0, 100);
      state.guard  = clamp(state.guard + 1, 0, 10);
      state.mood   = clamp(state.mood + 1, 0, 10);
      spawnFX("p-leaf", 8);
      showToast("勝利","你成功避開了危機。");
    }else{
      state.hp = clamp(state.hp - 3, 0, 10);
      state.mood = clamp(state.mood - 2, 0, 10);
      state.growth = clamp(state.growth - 6, 0, 100);
      spawnFX("p-ink", 10);
      showToast("受挫","受了點傷……下次更警覺。");
    }
    closeEnemy();
    tick();
  }

  // evolve & ending
  function checkEvolve(){
    if(state.stage===0 && state.growth>=cfg.thresholds[0]){
      state.stage=1;
      openModal(cfg.evolve[0].title, cfg.evolve[0].t, cfg.evolve[0].a);
    }
    if(state.stage===1 && state.growth>=cfg.thresholds[1]){
      state.stage=2;
      decideBreed(); // 羽化瞬間決定顏色品種
      openModal(cfg.evolve[1].title, cfg.evolve[1].t, cfg.evolve[1].a);
    }
    if(state.stage===2 && state.growth>=cfg.thresholds[2] && ending.classList.contains("hidden")){
      var end = cfg.endingsByBreed[state.breedKey];
      endingTitle.textContent = end.title;
      endingPoem.textContent = "「" + end.t + "」 — " + end.a;
      endingBreed.textContent = "你羽化成為： " + end.label;

      ending.classList.remove("hidden");
      ending.setAttribute("aria-hidden","false");
      spawnFX("p-sun", 10);
    }
  }

  // tick: hunger + random enemy
  var step=0;
  function tick(){
    state.hunger = clamp(state.hunger + 1, 0, 10);
    if(state.hunger>=9){
      state.hp = clamp(state.hp - 1, 0, 10);
      showToast("提醒","太餓了……拖葉子餵牠。");
    }
    step++;
    if(step>=2 && chance(0.18)) { openEnemy(); step=0; }

    if(state.hp<=0){
      state.hp=2;
      state.growth = clamp(state.growth - 8, 0, 100);
      showToast("遊戲","力竭一瞬，退一步再起。");
    }

    render();
    checkEvolve();
  }

  function act(type){
    if(enemyActive) return;
    if(!ending.classList.contains("hidden")) return;

    var p = cfg.poems[type];
    showToast(p.a, p.t);

    if(type==="feed"){
      state.counts.feed++;
      state.growth=clamp(state.growth+7,0,100);
      state.hp=clamp(state.hp+1,0,10);
      state.mood=clamp(state.mood+1,0,10);
      state.hunger=clamp(state.hunger-3,0,10);
      spawnFX("p-leaf",10);
    }
    if(type==="sun"){
      state.counts.sun++;
      state.growth=clamp(state.growth+6,0,100);
      state.mood=clamp(state.mood+2,0,10);
      state.hp=clamp(state.hp-1,0,10);
      spawnFX("p-sun",9);
    }
    if(type==="dew"){
      state.counts.dew++;
      state.hp=clamp(state.hp+2,0,10);
      state.mood=clamp(state.mood+1,0,10);
      state.hunger=clamp(state.hunger-1,0,10);
      spawnFX("p-dew",10);
    }
    if(type==="silk"){
      state.counts.silk++;
      state.guard=clamp(state.guard+2,0,10);
      state.hunger=clamp(state.hunger+1,0,10);
      spawnFX("p-ink",8);
    }
    if(type==="guard"){
      state.counts.guard++;
      state.guard=clamp(state.guard+2,0,10);
      state.mood=clamp(state.mood-1,0,10);
      spawnFX("p-ink",6);
    }
    if(type==="rest"){
      state.counts.rest++;
      state.hp=clamp(state.hp+2,0,10);
      state.mood=clamp(state.mood+1,0,10);
      state.hunger=clamp(state.hunger+1,0,10);
      spawnFX("p-ink",5);
    }

    tick();
  }

  // ===== 拖曳葉子餵食（核心）=====
  function wireLeaf(leafEl){
    leafEl.addEventListener("dragstart", function(e){
      e.dataTransfer.setData("text/plain","leaf");
      e.dataTransfer.effectAllowed = "move";
      creature.classList.add("dropReady");
    });
    leafEl.addEventListener("dragend", function(){
      creature.classList.remove("dropReady");
    });
  }
  Array.prototype.forEach.call(leafTray.querySelectorAll(".leaf"), wireLeaf);

  creature.addEventListener("dragover", function(e){
    e.preventDefault();
    creature.classList.add("dropReady");
  });
  creature.addEventListener("dragleave", function(){
    creature.classList.remove("dropReady");
  });
  creature.addEventListener("drop", function(e){
    e.preventDefault();
    creature.classList.remove("dropReady");
    var v = e.dataTransfer.getData("text/plain");
    if(v==="leaf"){
      act("feed");
    }
  });

  // ===== 戳互動 =====
  var lastPoke=0, pokeCount=0;
  var pokeLines=[
    {a:"遊戲",t:"別戳啦……我在努力長大。"},
    {a:"王維",t:"行到水窮處，坐看雲起時。"},
    {a:"蘇軾",t:"回首向來蕭瑟處，歸去，也無風雨也無晴。"}
  ];

  creature.addEventListener("click", function(){
    if(enemyActive) return;
    if(!ending.classList.contains("hidden")) return;

    var now=Date.now();
    var fast = (now-lastPoke)<450;
    lastPoke=now;

    creature.classList.remove("poke");
    void creature.offsetWidth;
    creature.classList.add("poke");
    setTimeout(function(){ creature.classList.remove("poke"); }, 260);

    spawnFX("p-ink", fast?10:6);

    if(!fast){
      state.mood=clamp(state.mood+1,0,10);
    }else{
      state.mood=clamp(state.mood-1,0,10);
      if(state.stage<2 && chance(0.18)) openEnemy();
    }

    state.counts.poke++;
    pokeCount++;
    if(pokeCount%6===0){
      state.guard=clamp(state.guard+1,0,10);
      state.growth=clamp(state.growth+4,0,100);
      showToast("彩蛋","你摸到牠的節奏了，牠更信任你。");
    }else{
      var line=pick(pokeLines);
      showToast(line.a,line.t);
    }

    render();
    checkEvolve();
  });

  // bind buttons
  btnSun.addEventListener("click", function(){ act("sun"); });
  btnDew.addEventListener("click", function(){ act("dew"); });
  btnSilk.addEventListener("click", function(){ act("silk"); });
  btnGuard.addEventListener("click", function(){ act("guard"); });
  btnRest.addEventListener("click", function(){ act("rest"); });

  modalClose.addEventListener("click", closeModalFn);
  btnHide.addEventListener("click", function(){ resolveEnemy("hide"); });
  btnScare.addEventListener("click", function(){ resolveEnemy("scare"); });
  btnRun.addEventListener("click", function(){ resolveEnemy("run"); });

  // 防卡死：點黑色背景也能關閉天敵視窗
  enemy.addEventListener("click", function(e){
    if(e.target === enemy){
      closeEnemy();
    }
  });

  btnCopy.addEventListener("click", function(){
    var text = endingTitle.textContent + "\n" + endingPoem.textContent + "\n" + endingBreed.textContent;
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){ showToast("系統","已複製到剪貼簿。"); })
      .catch(function(){ showToast("系統","複製失敗，請手動選取。"); });
    }else{
      showToast("系統","此瀏覽器不支援自動複製。");
    }
  });
  btnBack.addEventListener("click", function(){ window.location.reload(); });

  btnReset.addEventListener("click", function(){
    state.stage=0; state.growth=0; state.hp=0; state.mood=0; state.guard=0; state.hunger=0;
    state.counts={ feed:0, sun:0, dew:0, silk:0, guard:0, rest:0, poke:0 };
    state.breedKey="emerald";
    step=0; closeEnemy(); closeModalFn();
    ending.classList.add("hidden"); ending.setAttribute("aria-hidden","true");
    showToast("系統","重置完成。");
    render();
  });

  // init：全部從 0 開始（避免你之前遇到不是 0 的問題）
  showToast("提示","拖曳🍃餵食；按其他按鈕照顧；連戳太吵會引來天敵。");
  render();
});
