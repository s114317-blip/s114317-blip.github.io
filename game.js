const state = {
  stage: 0,          // 0:毛毛蟲 1:蛹 2:蝴蝶
  growth: 0,         // 0~100
  hp: 10,            // 0~10
  mood: 5,           // 0~10
  unlocked: new Set() // 解鎖詩句（可之後做圖鑑頁）
};

const cfg = {
  thresholds: [30, 70, 100],
  stageNames: ["毛毛蟲", "蛹", "蝴蝶"],
  stageClasses: ["caterpillar", "chrysalis", "butterfly"],

  // 方式1：進化解鎖詩句（每階段代表）
  stagePoems: [
    { text: "春眠不覺曉，處處聞啼鳥。", author: "孟浩然" },
    { text: "沉舟側畔千帆過，病樹前頭萬木春。", author: "劉禹錫" },
    { text: "大鵬一日同風起，扶搖直上九萬里。", author: "李白" }
  ],

  // 方式2：按鈕觸發詩句（短卡）
  actionPoems: {
    feed: [
      { text: "野火燒不盡，春風吹又生。", author: "白居易" }
    ],
    sun: [
      { text: "日出江花紅勝火，春來江水綠如藍。", author: "白居易" }
    ],
    rest: [
      { text: "人閒桂花落，夜靜春山空。", author: "王維" }
    ]
  },

  // 方式3：結局（隨機/可依成就選）
  endings: [
    { title: "柳暗花明", text: "山重水複疑無路，柳暗花明又一村。", author: "陸游" },
    { title: "長風破浪", text: "長風破浪會有時，直掛雲帆濟滄海。", author: "李白" },
    { title: "化蝶之夢", text: "莊生曉夢迷蝴蝶。", author: "莊子" }
  ]
};

// ===== DOM =====
const creature = document.getElementById("creature");
const stageBadge = document.getElementById("stageBadge");

const growthBar = document.getElementById("growthBar");
const hpBar = document.getElementById("hpBar");
const moodBar = document.getElementById("moodBar");
const growthText = document.getElementById("growthText");
const hpText = document.getElementById("hpText");
const moodText = document.getElementById("moodText");

const toast = document.getElementById("toast");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalPoem = document.getElementById("modalPoem");
const modalAuthor = document.getElementById("modalAuthor");
const modalClose = document.getElementById("modalClose");

const ending = document.getElementById("ending");
const endingTitle = document.getElementById("endingTitle");
const endingPoem = document.getElementById("endingPoem");
const btnCopy = document.getElementById("btnCopy");
const btnBack = document.getElementById("btnBack");

// buttons
document.getElementById("btnFeed").addEventListener("click", () => act("feed"));
document.getElementById("btnSun").addEventListener("click", () => act("sun"));
document.getElementById("btnRest").addEventListener("click", () => act("rest"));
document.getElementById("btnReset").addEventListener("click", resetGame);
modalClose.addEventListener("click", closeModal);

btnCopy.addEventListener("click", async () => {
  const text = ${endingTitle.textContent}\n${endingPoem.textContent};
  try{
    await navigator.clipboard.writeText(text);
    showToast({ text: "已複製到剪貼簿。", author: "系統" });
  }catch{
    showToast({ text: "複製失敗（可能瀏覽器限制），你可以手動選取。", author: "系統" });
  }
});
btnBack.addEventListener("click", () => window.location.reload());

// ===== Helpers =====
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }
function randPick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

let toastTimer = null;
function showToast(poem){
  toast.innerHTML = `
    <div class="poem">「${poem.text}」</div>
    <div class="author">— ${poem.author}</div>
  `;
  toast.style.opacity = "1";
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.style.opacity = "0.88"; }, 1600);
}

function openModal(title, poem){
  modalTitle.textContent = title;
  modalPoem.textContent = 「${poem.text}」;
  modalAuthor.textContent = — ${poem.author};
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(){
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function openEnding(end){
  endingTitle.textContent = 結局｜${end.title};
  endingPoem.textContent = 「${end.text}」 — ${end.author};
  ending.classList.remove("hidden");
  ending.setAttribute("aria-hidden", "false");
}

function render(){
  // bars
  growthBar.style.width = ${clamp(state.growth,0,100)}%;
  hpBar.style.width = ${(clamp(state.hp,0,10)/10)*100}%;
  moodBar.style.width = ${(clamp(state.mood,0,10)/10)*100}%;

  growthText.textContent = ${state.growth} / 100;
  hpText.textContent = ${state.hp} / 10;
  moodText.textContent = ${state.mood} / 10;

  // stage
  stageBadge.textContent = cfg.stageNames[state.stage];
  creature.className = creature ${cfg.stageClasses[state.stage]};
}

function checkEvolution(){
  const t0 = cfg.thresholds[0], t1 = cfg.thresholds[1], t2 = cfg.thresholds[2];

  // stage up rules
  if(state.stage === 0 && state.growth >= t0){
    state.stage = 1;
    const poem = cfg.stagePoems[1];
    state.unlocked.add(poem.text);
    openModal("進化｜結成蛹", poem); // 方式1
  }else if(state.stage === 1 && state.growth >= t1){
    state.stage = 2;
    const poem = cfg.stagePoems[2];
    state.unlocked.add(poem.text);
    openModal("進化｜羽化成蝶", poem); // 方式1
  }

  // ending
  if(state.growth >= t2 && state.stage === 2){
    // 方式3：結局（這裡先隨機，你也可用成就條件選）
    const end = randPick(cfg.endings);
    openEnding(end);
  }
}

function act(type){
  if(!ending.classList.contains("hidden")) return; // 結局時不再操作

  // 數值變化：保持簡單但有策略
  if(type === "feed"){
    state.growth += 6;
    state.hp = clamp(state.hp + 1, 0, 10);
    state.mood = clamp(state.mood + 1, 0, 10);
  }else if(type === "sun"){
    state.growth += 5;
    state.mood = clamp(state.mood + 2, 0, 10);
    state.hp = clamp(state.hp - 1, 0, 10); // 曬太久會耗力（小代價）
  }else if(type === "rest"){
    state.growth += 3;
    state.hp = clamp(state.hp + 2, 0, 10);
    state.mood = clamp(state.mood - 1, 0, 10); // 太躺會無聊（小代價）
  }

  state.growth = clamp(state.growth, 0, 100);

  // 方式2：按鈕觸發詩句短卡
  const poem = randPick(cfg.actionPoems[type]);
  showToast(poem);

  // 若生命歸零：小懲罰（不直接結束，避免太挫折）
  if(state.hp <= 0){
    state.hp = 3;
    state.growth = clamp(state.growth - 8, 0, 100);
    showToast({ text: "力竭一瞬，退一步再起。", author: "遊戲" });
  }

  render();
  checkEvolution();
}

function resetGame(){
  state.stage = 0;
  state.growth = 0;
  state.hp = 10;
  state.mood = 5;
  state.unlocked = new Set();

  ending.classList.add("hidden");
  ending.setAttribute("aria-hidden", "true");

  closeModal();
  showToast({ text: "重置完成，從春天再走一次。", author: "系統" });
  render();
}

// init
showToast({ text: "按「餵食／曬陽／歇息」，讓牠一步步破繭。", author: "提示" });
render();
