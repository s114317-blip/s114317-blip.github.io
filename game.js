// 安全版：不使用模板字串 ${}，避免 SyntaxError
document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ game.js loaded");

  // ===== 0) 取得元素（如果少任何一個 id，就直接報錯）=====
  var ids = [
    "btnFeed", "btnSun", "btnRest", "btnReset",
    "creature", "stageBadge", "toast",
    "growthBar", "growthText", "hpBar", "hpText", "moodBar", "moodText",
    "modal", "modalTitle", "modalPoem", "modalAuthor", "modalClose",
    "ending", "endingTitle", "endingPoem", "btnCopy", "btnBack"
  ];

  var missing = [];
  for (var i = 0; i < ids.length; i++) {
    if (!document.getElementById(ids[i])) missing.push(ids[i]);
  }
  if (missing.length > 0) {
    console.error("❌ index.html 缺少這些 id：", missing);
    alert("HTML 缺少 id，請開 Console 看 missing 清單。");
    return;
  }

  var btnFeed = document.getElementById("btnFeed");
  var btnSun = document.getElementById("btnSun");
  var btnRest = document.getElementById("btnRest");
  var btnReset = document.getElementById("btnReset");

  var creature = document.getElementById("creature");
  var stageBadge = document.getElementById("stageBadge");
  var toast = document.getElementById("toast");

  var growthBar = document.getElementById("growthBar");
  var growthText = document.getElementById("growthText");
  var hpBar = document.getElementById("hpBar");
  var hpText = document.getElementById("hpText");
  var moodBar = document.getElementById("moodBar");
  var moodText = document.getElementById("moodText");

  var modal = document.getElementById("modal");
  var modalTitle = document.getElementById("modalTitle");
  var modalPoem = document.getElementById("modalPoem");
  var modalAuthor = document.getElementById("modalAuthor");
  var modalClose = document.getElementById("modalClose");

  var ending = document.getElementById("ending");
  var endingTitle = document.getElementById("endingTitle");
  var endingPoem = document.getElementById("endingPoem");
  var btnCopy = document.getElementById("btnCopy");
  var btnBack = document.getElementById("btnBack");

  // ===== 1) 小工具 =====
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  var toastTimer = null;
  function showToast(author, text) {
    toast.innerHTML =
      '<div class="poem">「' + text + '」</div>' +
      '<div class="author">— ' + author + "</div>";

    toast.style.opacity = "1";
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.style.opacity = "0.88";
    }, 1400);
  }

  function openModal(title, poemText, poemAuthor) {
    modalTitle.textContent = title;
    modalPoem.textContent = "「" + poemText + "」";
    modalAuthor.textContent = "— " + poemAuthor;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModalFn() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }

  function openEnding(title, text, author) {
    endingTitle.textContent = "結局｜" + title;
    endingPoem.textContent = "「" + text + "」 — " + author;
    ending.classList.remove("hidden");
    ending.setAttribute("aria-hidden", "false");
  }

  function closeEndingFn() {
    ending.classList.add("hidden");
    ending.setAttribute("aria-hidden", "true");
  }

  // ===== 2) 遊戲資料 =====
  var cfg = {
    thresholds: [30, 70, 100],
    stageNames: ["毛毛蟲", "蛹", "蝴蝶"],
    stageClasses: ["caterpillar", "chrysalis", "butterfly"],

    // 方式1：進化詩句（大卡）
    evolvePoems: [
      { title: "進化｜結成蛹", text: "沉舟側畔千帆過，病樹前頭萬木春。", author: "劉禹錫" },
      { title: "進化｜羽化成蝶", text: "大鵬一日同風起，扶搖直上九萬里。", author: "李白" }
    ],

    // 方式2：按鈕詩句（短卡）
    actionPoems: {
      feed: { text: "野火燒不盡，春風吹又生。", author: "白居易" },
      sun:  { text: "日出江花紅勝火，春來江水綠如藍。", author: "白居易" },
      rest: { text: "人閒桂花落，夜靜春山空。", author: "王維" }
    },

    // 方式3：結局
    endings: [
      { title: "柳暗花明", text: "山重水複疑無路，柳暗花明又一村。", author: "陸游" },
      { title: "長風破浪", text: "長風破浪會有時，直掛雲帆濟滄海。", author: "李白" },
      { title: "化蝶之夢", text: "莊生曉夢迷蝴蝶。", author: "莊子" }
    ]
  };

  var state = {
    stage: 0,   // 0毛毛蟲 1蛹 2蝴蝶
    growth: 0,  // 0~100
    hp: 10,     // 0~10
    mood: 5     // 0~10
  };

  // ===== 3) 畫面更新 =====
  function render() {
    stageBadge.textContent = cfg.stageNames[state.stage];
    creature.className = "creature " + cfg.stageClasses[state.stage];

    growthBar.style.width = state.growth + "%";
    hpBar.style.width = (state.hp / 10 * 100) + "%";
    moodBar.style.width = (state.mood / 10 * 100) + "%";

    growthText.textContent = state.growth + " / 100";
    hpText.textContent = state.hp + " / 10";
    moodText.textContent = state.mood + " / 10";
  }

  // ===== 4) 進化與結局判斷 =====
  function checkProgress() {
    // 進化：毛毛蟲 -> 蛹
    if (state.stage === 0 && state.growth >= cfg.thresholds[0]) {
      state.stage = 1;
      var p1 = cfg.evolvePoems[0];
      openModal(p1.title, p1.text, p1.author);
    }

    // 進化：蛹 -> 蝴蝶
    if (state.stage === 1 && state.growth >= cfg.thresholds[1]) {
      state.stage = 2;
      var p2 = cfg.evolvePoems[1];
      openModal(p2.title, p2.text, p2.author);
    }

    // 結局：蝴蝶 & 成長滿
    if (state.stage === 2 && state.growth >= cfg.thresholds[2] && ending.classList.contains("hidden")) {
      var end = pick(cfg.endings);
      openEnding(end.title, end.text, end.author);
    }
  }

  // ===== 5) 行為（按鈕）=====
  function act(type) {
    if (!ending.classList.contains("hidden")) return;

    console.log("🟢 action:", type);

    if (type === "feed") {
      state.growth += 6;
      state.hp += 1;
      state.mood += 1;
    } else if (type === "sun") {
      state.growth += 5;
      state.mood += 2;
      state.hp -= 1;
    } else if (type === "rest") {
      state.growth += 3;
      state.hp += 2;
      state.mood -= 1;
    }

    state.growth = clamp(state.growth, 0, 100);
    state.hp = clamp(state.hp, 0, 10);
    state.mood = clamp(state.mood, 0, 10);

    var ap = cfg.actionPoems[type];
    showToast(ap.author, ap.text);

    if (state.hp <= 0) {
      state.hp = 3;
      state.growth = clamp(state.growth - 8, 0, 100);
      showToast("遊戲", "力竭一瞬，退一步再起。");
    }

    render();
    checkProgress();
  }

  function resetGame() {
    state.stage = 0;
    state.growth = 0;
    state.hp = 10;
    state.mood = 5;
    closeModalFn();
    closeEndingFn();
    render();
    showToast("系統", "重置完成，從春天再走一次。");
  }

  // ===== 6) 綁定事件 =====
  btnFeed.addEventListener("click", function () { act("feed"); });
  btnSun.addEventListener("click", function () { act("sun"); });
  btnRest.addEventListener("click", function () { act("rest"); });
  btnReset.addEventListener("click", resetGame);

  modalClose.addEventListener("click", closeModalFn);

  btnCopy.addEventListener("click", function () {
    var text = endingTitle.textContent + "\n" + endingPoem.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast("系統", "已複製到剪貼簿。");
      }).catch(function () {
        showToast("系統", "複製失敗，請手動選取文字。");
      });
    } else {
      showToast("系統", "此瀏覽器不支援自動複製，請手動選取文字。");
    }
  });

  btnBack.addEventListener("click", function () {
    window.location.reload();
  });

  // ===== 7) 初始化 =====
  render();
  showToast("提示", "按「餵食／曬陽／歇息」，讓牠一步步破繭。");
});
