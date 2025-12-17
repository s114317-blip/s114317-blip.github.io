:root{
  --ink:#1d1d1f;
  --soft:#2b2b2b;
  --paper:#f6f1e6;
  --paper2:#efe6d6;
  --line:rgba(20,20,20,.18);
  --shadow:rgba(0,0,0,.12);
}

*{box-sizing:border-box}
body{
  margin:0;
  font-family: ui-serif, "Noto Serif TC", "Songti TC", "STSong", serif;
  color:var(--ink);
  background:
    radial-gradient(1200px 600px at 20% 10%, rgba(0,0,0,.06), transparent 60%),
    radial-gradient(900px 500px at 80% 30%, rgba(0,0,0,.05), transparent 60%),
    linear-gradient(180deg, var(--paper), var(--paper2));
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
}

.frame{
  width:min(980px, 92vw);
  padding:22px;
}

.title{
  display:flex;
  align-items:baseline;
  gap:14px;
  margin-bottom:12px;
}
.seal{
  width:38px;height:38px;
  display:grid;place-items:center;
  border:2px solid rgba(120,30,30,.55);
  color:rgba(120,30,30,.85);
  font-weight:700;
  letter-spacing:.1em;
  transform:rotate(-6deg);
}
h1{
  margin:0;
  font-size:34px;
  letter-spacing:.12em;
}
.subtitle{
  margin:0;
  opacity:.7;
  font-family: ui-sans-serif, system-ui, -apple-system, "Noto Sans TC", sans-serif;
  font-size:13px;
}

.panel{
  border:1px solid var(--line);
  background: rgba(255,255,255,.35);
  box-shadow: 0 10px 30px var(--shadow);
  border-radius:16px;
  padding:18px;
  position:relative;
  overflow:hidden;
}

/* 宣紙纖維感（很淡） */
.panel::before{
  content:"";
  position:absolute; inset:0;
  background:
    repeating-linear-gradient(90deg, rgba(0,0,0,.015), rgba(0,0,0,.015) 1px, transparent 1px, transparent 6px),
    repeating-linear-gradient(0deg, rgba(0,0,0,.012), rgba(0,0,0,.012) 1px, transparent 1px, transparent 9px);
  pointer-events:none;
  mix-blend-mode:multiply;
  opacity:.55;
}

.intro{
  margin:6px 0 14px;
  line-height:1.8;
  color:var(--soft);
}

.game{
  display:grid;
  grid-template-columns: 1.1fr .9fr;
  gap:16px;
}

.scene{
  border:1px solid var(--line);
  border-radius:14px;
  background: rgba(255,255,255,.25);
  position:relative;
  height:360px;
  overflow:hidden;
}

.badge{
  position:absolute;
  top:12px; left:12px;
  padding:6px 10px;
  border:1px solid var(--line);
  border-radius:999px;
  background: rgba(255,255,255,.35);
  font-size:13px;
  letter-spacing:.12em;
}

.creature{
  position:absolute;
  left:50%; top:55%;
  transform:translate(-50%,-50%);
  width:190px; height:190px;
  filter: drop-shadow(0 10px 18px rgba(0,0,0,.12));
}

/* 用純CSS做三個狀態的「墨筆剪影」 */
.caterpillar{
  background:
    radial-gradient(circle at 32% 55%, rgba(0,0,0,.70) 0 16px, transparent 17px),
    radial-gradient(circle at 46% 55%, rgba(0,0,0,.68) 0 18px, transparent 19px),
    radial-gradient(circle at 60% 55%, rgba(0,0,0,.66) 0 20px, transparent 21px),
    radial-gradient(circle at 74% 55%, rgba(0,0,0,.62) 0 22px, transparent 23px),
    radial-gradient(circle at 86% 52%, rgba(0,0,0,.60) 0 12px, transparent 13px);
  mask-image: radial-gradient(circle at 50% 50%, #000 0 65%, transparent 72%);
  animation: breathe 2.2s ease-in-out infinite;
}
.chrysalis{
  background:
    radial-gradient(ellipse at 50% 40%, rgba(0,0,0,.74) 0 38%, transparent 42%),
    radial-gradient(ellipse at 50% 62%, rgba(0,0,0,.62) 0 34%, transparent 40%);
  border-radius: 60% 60% 55% 55% / 70% 70% 45% 45%;
  animation: still 2.6s ease-in-out infinite;
}
.butterfly{
  background:
    radial-gradient(circle at 35% 45%, rgba(0,0,0,.70) 0 46px, transparent 47px),
    radial-gradient(circle at 65% 45%, rgba(0,0,0,.70) 0 46px, transparent 47px),
    radial-gradient(ellipse at 50% 58%, rgba(0,0,0,.75) 0 10px, transparent 11px);
  mask-image: radial-gradient(circle at 50% 50%, #000 0 70%, transparent 78%);
  animation: flutter 1.3s ease-in-out infinite;
}

@keyframes breathe{
  0%,100%{ transform:translate(-50%,-50%) scale(1); }
  50%{ transform:translate(-50%,-50%) scale(1.03); }
}
@keyframes still{
  0%,100%{ transform:translate(-50%,-50%) scale(1); opacity:.92; }
  50%{ transform:translate(-50%,-50%) scale(1.01); opacity:1; }
}
@keyframes flutter{
  0%,100%{ transform:translate(-50%,-50%) scale(1) rotate(-2deg); }
  50%{ transform:translate(-50%,-50%) scale(1.03) rotate(2deg); }
}

/* 墨暈背景 */
.inkwash{
  position:absolute; inset:-40px;
  background:
    radial-gradient(260px 200px at 20% 35%, rgba(0,0,0,.10), transparent 60%),
    radial-gradient(320px 260px at 75% 65%, rgba(0,0,0,.08), transparent 62%),
    radial-gradient(220px 180px at 55% 20%, rgba(0,0,0,.06), transparent 60%);
  filter: blur(2px);
  opacity:.85;
  pointer-events:none;
}

.stats{
  border:1px solid var(--line);
  border-radius:14px;
  padding:14px;
  background: rgba(255,255,255,.25);
  display:flex;
  flex-direction:column;
  gap:12px;
}

.stat .label{
  font-size:13px;
  letter-spacing:.12em;
  opacity:.85;
  margin-bottom:6px;
}
.bar{
  height:14px;
  border:1px solid var(--line);
  border-radius:999px;
  background: rgba(255,255,255,.25);
  overflow:hidden;
}
.bar.thin{ height:12px; }
.fill{
  height:100%;
  width:0%;
  background: linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,.18));
}
.value{
  margin-top:6px;
  font-family: ui-sans-serif, system-ui, -apple-system, "Noto Sans TC", sans-serif;
  font-size:12px;
  opacity:.75;
}

.actions{
  grid-column: 1 / -1;
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  margin-top:2px;
}

.btn{
  border:1px solid var(--line);
  background: rgba(255,255,255,.35);
  padding:10px 14px;
  border-radius:12px;
  cursor:pointer;
  letter-spacing:.08em;
  font-family: ui-sans-serif, system-ui, -apple-system, "Noto Sans TC", sans-serif;
}
.btn:hover{ transform: translateY(-1px); }
.btn:active{ transform: translateY(0px); }
.btn.ghost{
  background: transparent;
}

.toast{
  grid-column: 1 / -1;
  min-height:44px;
  padding:10px 12px;
  border:1px dashed var(--line);
  border-radius:12px;
  background: rgba(255,255,255,.18);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  opacity:.92;
}
.toast .poem{
  font-size:14px;
  line-height:1.6;
}
.toast .author{
  font-size:12px;
  opacity:.7;
  white-space:nowrap;
}

/* Modal（進化大詩卡） */
.modal{
  position:fixed; inset:0;
  background: rgba(0,0,0,.35);
  display:grid; place-items:center;
  padding:20px;
  z-index:50;
}
.hidden{ display:none !important; }
.modalCard{
  width:min(620px, 92vw);
  border:1px solid rgba(255,255,255,.35);
  border-radius:16px;
  background:
    radial-gradient(520px 280px at 30% 20%, rgba(255,255,255,.55), rgba(255,255,255,.28)),
    linear-gradient(180deg, rgba(246,241,230,.95), rgba(239,230,214,.92));
  box-shadow: 0 18px 50px rgba(0,0,0,.25);
  padding:14px 16px 16px;
}
.modalHeader{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom:10px;
}
.modalTitle{
  letter-spacing:.14em;
  font-weight:700;
}
.close{
  border:1px solid var(--line);
  background: rgba(255,255,255,.45);
  border-radius:10px;
  padding:6px 10px;
  cursor:pointer;
}
.modalPoem{
  font-size:20px;
  line-height:1.9;
  letter-spacing:.08em;
  margin:8px 0 6px;
}
.modalAuthor{
  opacity:.75;
  font-family: ui-sans-serif, system-ui, -apple-system, "Noto Sans TC", sans-serif;
}
.modalHint{
  margin-top:10px;
  font-size:12px;
  opacity:.65;
}

/* Ending */
.ending{
  position:fixed; inset:0;
  background: rgba(0,0,0,.42);
  display:grid; place-items:center;
  padding:20px;
  z-index:60;
}
.endingCard{
  width:min(720px, 92vw);
  border-radius:18px;
  border:1px solid rgba(255,255,255,.35);
  background:
    radial-gradient(520px 280px at 70% 20%, rgba(255,255,255,.52), rgba(255,255,255,.25)),
    linear-gradient(180deg, rgba(246,241,230,.95), rgba(239,230,214,.92));
  box-shadow: 0 20px 60px rgba(0,0,0,.28);
  padding:18px 18px 16px;
}
.endingCard h2{
  margin:0 0 10px;
  letter-spacing:.12em;
}
.endingPoem{
  font-size:22px;
  line-height:2.0;
  letter-spacing:.08em;
  margin:10px 0 14px;
}
.endingTools{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
}

.footnote{
  margin-top:12px;
  font-size:12px;
  opacity:.65;
  font-family: ui-sans-serif, system-ui, -apple-system, "Noto Sans TC", sans-serif;
}

@media (max-width: 860px){
  .game{ grid-template-columns: 1fr; }
  .scene{ height:320px; }
}
