(() => {
  "use strict";

  // ---- small helpers ----
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function qsId(id) {
    return document.getElementById(id);
  }

  function reportMissing(ids) {
    const missing = ids.filter((id) => !qsId(id));
    if (missing.length) {
      console.error("❌ Missing element id(s) in index.html:", missing);
      console.error("請回到 index.html 確認這些 id 是否存在且拼字大小寫完全一致。");
      return false;
    }
    return true;
  }

  // ---- main init (wait for HTML ready) ----
  document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ game.js loaded & DOM ready");

    // 必備元素清單（缺一個就會沒反應）
    const requiredIds = [
      // buttons
      "btnFeed", "btnSun", "btnRest", "btnReset",
      // core UI
      "creature", "stageBadge", "toast",
      // bars & texts
      "growthBar", "growthText",
      "hpBar", "hpText",
      "moodBar", "moodText",
      // modal
      "modal", "modalTitle", "modalPoem", "modalAuthor", "modalClose",
      // ending
      "ending", "endingTitle", "endingPoem", "btnCopy", "btnBack"
    ];

    if (!reportMissing(requiredIds)) {
      // 如果缺 id，就先停止，避免你按了沒反應卻不知道原因
      showToastSafe("系統", "頁面元素缺漏，請看 Console 的 missing id 清單。");
      return;
    }

    // ---- state & config ----
    const state = {
      stage: 0,   // 0毛毛蟲 1蛹 2蝴蝶
      growth: 0,  // 0~100
      hp: 10,     // 0~10
      mood: 5     // 0~10
    };

    const cfg = {
      thresholds: [30, 70, 100],
      stageNames: ["毛毛蟲", "蛹", "蝴蝶"],
      stageClasses: ["caterpillar", "chrysalis", "butterfly"],

      stagePoems: [
        { text: "春眠不覺曉，處處聞啼鳥。", author: "孟浩然" }, // 開場提示也可用
        { text: "沉舟側畔千帆過，病樹前頭萬木春。", author: "劉禹錫" }, // 結蛹
        { text: "大鵬一日同風起，扶搖直上九萬里。", author: "李白" }  // 化蝶
      ],

      actionPoems: {
        feed: [{ text: "野火燒不盡，春風吹又生。", author: "白居易" }],
        sun:  [{ text: "日出江花紅勝火，春來江水綠如藍。", author: "白居易" }],
        rest: [{ text: "人閒桂花落，夜靜春山空。", author: "王維" }]
      },

      endings: [
        { title: "柳暗花明", text: "山重水複疑無路，柳暗花明又一村。", author: "陸游" },
        { title: "長風破浪", text: "長風破浪會有時，直掛雲帆濟滄海。", author: "李白" },
        { title: "化蝶之夢", text: "莊生曉夢迷蝴蝶。", author: "莊子" }
      ]
    };

    // ---- DOM refs ----
    const creature = qsId("creature");
    const stageBadge = qsId("stageBadge");

    const growthBar = qsId("growthBar");
    const hpBar = qsId("hpBar");
    const moodBar = qsId("moodBar");

    const growthText = qsId("growthText");
    const hpText = qsId("hpText");
    const moodText = qsId("moodText");

    const toast = qsId("toast");

    const modal = qsId("modal");
    const modalTitle = qsId("modalTitle");
    const modalPoem = qsId("modalPoem");
    const modalAuthor = qsId("modalAuthor");
    const modalClose = qsId("modalClose");

    const ending = qsId("ending");
    const endingTitle = qsId("endingTitle");
    const endingPoem = qsId("endingPoem");
    const btnCopy = qsId("btnCopy");
    const btnBack = qsId("btnBack");

    const btnFeed = qsId("btnFeed");
    const btnSun = qsId("btnSun");
    const btnRest = qsId("btnRest");
    const btnReset = qsId("btnReset");

    // ---- UI functions ----
    let toastTimer = null;

    function showToast(poem) {
      toast.innerHTML = `
        <div class="poem">「${poem.text}」</div>
        <div class="author">— ${poem.author}</div>
      `;
      toast.style.opacity = "1";
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => (toast.style.opacity = "0.88"), 1400);
    }

    function showToastSafe(author, text) {
      toast.innerHTML = `
        <div class="poem">「${text}」</div>
        <div class="author">— ${author}</div>
      `;
      toast.style.opacity = "1";
    }

    function openModal(title, poem) {
      modalTitle.textContent = title;
      modalPoem.textContent = 「${poem.text}」;
      modalAuthor.textContent = — ${poem.author};
      modal.classList.remove("hidden");
      modal.setAttribute("aria-hidden", "false");
    }

    function closeModal() {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
    }

    function openEnding(end) {
      endingTitle.textContent = 結局｜${end.title};
      endingPoem.textContent = 「${end.text}」 — ${end.author};
      ending.classList.remove("hidden");
      ending.setAttribute("aria-hidden", "false");
    }

    function closeEnding() {
      ending.classList.add("hidden");
      ending.setAttribute("aria-hidden", "true");
    }

    function render() {
      growthBar.style.width = ${clamp(state.growth, 0, 100)}%;
      hpBar.style.width = ${(clamp(state.hp, 0, 10) / 10) * 100}%;
      moodBar.style.width = ${(clamp(state.mood, 0, 10) / 10) * 100}%;

      growthText.textContent = ${state.growth} / 100;
      hpText.textContent = ${state.hp} / 10;
      moodText.textContent = ${state.mood} / 10;

      stageBadge.textContent = cfg.stageNames[state.stage];
      creature.className = creature ${cfg.stageClasses[state.stage]};
    }

    function checkEvolutionAndEnding() {
      // 進化（方式1）
      if (state.stage === 0 && state.growth >= cfg.thresholds[0]) {
        state.stage = 1;
        openModal("進化｜結成蛹", cfg.stagePoems[1]);
      } else if (state.stage === 1 && state.growth >= cfg.thresholds[1]) {
        state.stage = 2;
        openModal("進化｜羽化成蝶", cfg.stagePoems[2]);
      }

      // 結局（方式3）
      if (state.stage === 2 && state.growth >= cfg.thresholds[2] && ending.classList.contains("hidden")) {
        openEnding(randPick(cfg.endings));
      }
    }

    function act(type) {
      // 結局開著就不再動作
      if (!ending.classList.contains("hidden")) return;

      console.log("🟢 action:", type); // 你按了按鈕應該會看到這行

      if (type === "feed") {
        state.growth += 6;
        state.hp = clamp(state.hp + 1, 0, 10);
        state.mood = clamp(state.mood + 1, 0, 10);
      } else if (type === "sun") {
        state.growth += 5;
        state.mood = clamp(state.mood + 2, 0, 10);
        state.hp = clamp(state.hp - 1, 0, 10);
      } else if (type === "rest") {
        state.growth += 3;
        state.hp = clamp(state.hp + 2, 0, 10);
        state.mood = clamp(state.mood - 1, 0, 10);
      }

      state.growth = clamp(state.growth, 0, 100);

      // 方式2：短詩卡回饋
      const poem = randPick(cfg.actionPoems[type]);
      showToast(poem);

      // 小懲罰（可愛但不挫折）
      if (state.hp <= 0) {
        state.hp = 3;
        state.growth = clamp(state.growth - 8, 0, 100);
        showToastSafe("遊戲", "力竭一瞬，退一步再起。");
      }

      render();
      checkEvolutionAndEnding();
    }

    function resetGame() {
      console.log("🔄 reset");
      state.stage = 0;
      state.growth = 0;
      state.hp = 10;
      state.mood = 5;
      closeModal();
      closeEnding();
      render();
      showToastSafe("系統", "重置完成，從春天再走一次。");
    }

    // ---- bind events ----
    btnFeed.addEventListener("click", () => act("feed"));
    btnSun.addEventListener("click", () => act("sun"));
    btnRest.addEventListener("click", () => act("rest"));
    btnReset.addEventListener("click", resetGame);

    modalClose.addEventListener("click", closeModal);

    btnCopy.addEventListener("click", async () => {
      const text = ${endingTitle.textContent}\n${endingPoem.textContent};
      try {
        await navigator.clipboard.writeText(text);
        showToastSafe("系統", "已複製到剪貼簿。");
      } catch (e) {
        console.warn("clipboard failed:", e);
        showToastSafe("系統", "複製失敗（瀏覽器限制），可手動選取文字。");
      }
    });

    btnBack.addEventListener("click", () => window.location.reload());

    // ---- init ----
    render();
    showToastSafe("提示", "按「餵食／曬陽／歇息」，讓牠一步步破繭。");
  });
})();
