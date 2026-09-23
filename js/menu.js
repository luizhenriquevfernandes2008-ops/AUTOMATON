// Menu principal: painéis, navegação por teclado, terminal animado e câmera orbitando a fábrica.
import { game } from './state.js';
import { audio } from './audio.js';
import { saveInfo, deleteSave } from './save.js';
import { OBJECTIVES } from './data.js';
import { CELL } from './data.js';

const $ = (s) => document.querySelector(s);

const TAGLINES = [
  'programe as máquinas. relaxe. repita.',
  'while True: fabrica_feliz()',
  'uma instrução por vez, sem pressa.',
  'minério entra, lingote sai.',
  'energia ligada. esteiras girando.',
];

const TIPS = [
  'A <b>seta laranja</b> no chão é a saída de cada máquina. As <b>azuis</b> são as entradas.',
  'Sem <b>energia</b> nada funciona: pegue o 🔌 <b>Cabo</b> (tecla 1) e ligue do gerador até a máquina.',
  'A <b>fornalha</b> não derrete sozinha: cada <code>forno.fundir()</code> derrete 1 minério.',
  'Os preços do <b>mercado</b> sobem e descem. Programe pra vender no pico com <code>caixa.preco()</code>.',
  'Um computador faz uma coisa por vez. Use <b>vários computadores</b> pra máquinas trabalharem juntas.',
  'Aperte <kbd>H</kbd> a qualquer momento pra abrir o <b>guia</b>.',
  'A Jiboia entende português: <code>enquanto Verdadeiro:</code> funciona igual a <code>while True:</code>.',
  'Tome um <b>cafezinho</b> na cafeteira do escritório pra andar mais rápido ☕',
];

const DEMO = [
  'mina = maquina("minerador1")',
  'forno = maquina("fornalha1")',
  'caixa = maquina("venda1")',
  '',
  'while True:',
  '    mina.minerar()',
  '    forno.fundir()',
  '    if caixa.quantidade() >= 5:',
  '        ganho = caixa.vender()',
  '        print(f"+$ {ganho}")',
];
// sequência de linhas executadas (linha, espera?)
const DEMO_RUN = [[1], [2], [3], [5], [6, 1], [7, 1], [8], [5], [6, 1], [7, 1], [8], [9, 1], [10], [5]];

let panel = 'home';
let focusIdx = 0;
let startPlay = null;

export function initMenu(onPlay) {
  startPlay = onPlay;
  const items = [...document.querySelectorAll('#menu-nav .mi')];
  items.forEach((b, i) => {
    b.addEventListener('mouseenter', () => focus(i, false));
    b.addEventListener('click', () => activate(i));
  });
  $('#new-cancel').onclick = () => { showPanel('home'); focus(0, false); };
  $('#new-confirm').onclick = () => { deleteSave(); game.skipSave = true; location.reload(); };
  $('#menu-guide').onclick = () => game.ui.openOverlay('guide');
  // começa a música no primeiro clique no menu
  $('#menu').addEventListener('pointerdown', () => audio.start(), { once: true });
  addEventListener('keydown', (e) => {
    if (game.mode !== 'menu' || game.ui?.overlay) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); focus((focusIdx + 1) % items.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); focus((focusIdx - 1 + items.length) % items.length); }
    if (e.key === 'Enter') { e.preventDefault(); audio.start(); activate(focusIdx); }
    if (e.key === 'Escape' && panel !== 'home') { showPanel('home'); focus(0, false); }
  });
  audio.onTrackChangeMenu = (t) => { $('#menu-track').textContent = '♪ ' + t.nome; };
  $('#menu-track').textContent = '♪ ' + audio.currentTrack().nome;
  typeLoop();
  termLoop();
  tipLoop();
  refreshMenu();
  focus(0, false);
}

function focus(i, sound = true) {
  const items = [...document.querySelectorAll('#menu-nav .mi')];
  if (items[i].style.display === 'none') i = (i + (i > focusIdx ? 1 : -1) + items.length) % items.length;
  focusIdx = i;
  items.forEach((b, j) => b.classList.toggle('focus', j === i));
  const p = items[i].dataset.panel;
  if (p && p !== 'newgame') showPanel(p);
  if (sound) audio.play('tick', { volume: 0.35 });
}

function activate(i) {
  const b = [...document.querySelectorAll('#menu-nav .mi')][i];
  audio.play('select', { volume: 0.5 });
  if (b.id === 'btn-play') { startPlay && startPlay(); return; }
  if (b.id === 'btn-new') {
    const info = saveInfo();
    if (!info) { startPlay && startPlay(); return; }
    $('#new-text').innerHTML = `Isso apaga a fábrica salva (<b>nível ${info.level}</b>, <b>$ ${fmtMoney(info.money)}</b>, ${info.machines} máquinas) e começa do zero. Não dá pra desfazer.`;
    showPanel('newgame');
    return;
  }
  showPanel(b.dataset.panel);
}

function showPanel(p) {
  if (p === panel) return;
  panel = p;
  document.querySelectorAll('.mpanel').forEach((el) => el.classList.toggle('show', el.dataset.panel === p));
}

const fmtMoney = (n) => n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
const fmtTime = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
};

export function openMenu() {
  refreshMenu();
  panel = null;
  showPanel('home');
  focus(0, false);
}

export function refreshMenu() {
  const info = saveInfo();
  $('#play-label').textContent = info ? 'Continuar' : 'Jogar';
  $('#play-sub').textContent = info ? `nív ${info.level} · $${fmtMoney(info.money)}` : 'nova fábrica';
  $('#btn-new').style.display = info ? '' : 'none';
  let n = 1;
  document.querySelectorAll('#menu-nav .mi').forEach((b) => {
    if (b.style.display !== 'none') b.querySelector('.mi-n').textContent = String(n++).padStart(2, '0');
  });
  $('#save-state').textContent = info ? 'online' : 'vazio';
  if (info) {
    const pct = Math.min(100, (info.objective / OBJECTIVES.length) * 100);
    $('#save-card').innerHTML = `
      <div class="save-grid">
        <div><span>nível</span><b class="amber">${info.level}</b></div>
        <div><span>dinheiro</span><b>$ ${fmtMoney(info.money)}</b></div>
        <div><span>tempo</span><b>${fmtTime(info.time)}</b></div>
        <div><span>máquinas</span><b>${info.machines}</b></div>
        <div><span>esteiras</span><b>${info.belts}</b></div>
        <div><span>total ganho</span><b>$ ${fmtMoney(info.earned)}</b></div>
      </div>
      <div class="progress-line"><i style="width:${pct}%"></i></div>
      <div class="muted" style="margin-top:6px;font-size:12px">objetivos ${Math.min(info.objective, OBJECTIVES.length)}/${OBJECTIVES.length}</div>`;
  } else {
    $('#save-card').innerHTML = `<div class="save-empty">Nenhuma fábrica ainda.<br>Aperte <b>01 · Jogar</b> pra começar com um minerador, um gerador, um computador e 10 esteiras.</div>`;
  }
}

// digitação do subtítulo
function typeLoop() {
  const el = $('#typed');
  let li = 0, ci = 0, del = false;
  const step = () => {
    const txt = '> ' + TAGLINES[li];
    if (!del) {
      ci++;
      el.textContent = txt.slice(0, ci);
      if (ci >= txt.length) { del = true; return setTimeout(step, 2600); }
      return setTimeout(step, 45 + Math.random() * 50);
    }
    ci -= 2;
    el.textContent = txt.slice(0, Math.max(2, ci));
    if (ci <= 2) { del = false; ci = 2; li = (li + 1) % TAGLINES.length; return setTimeout(step, 400); }
    setTimeout(step, 18);
  };
  step();
}

// terminal mostrando Jiboia rodando devagar
function termLoop() {
  const term = $('#term'), out = $('#term-out');
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const hl = (s) => esc(s)
    .replace(/(".*?")/g, '<span class="t-str">$1</span>')
    .replace(/\b(while|if|True)\b/g, '<span class="t-kw">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="t-num">$1</span>')
    .replace(/\.(\w+)\(/g, '.<span class="t-meth">$1</span>(')
    .replace(/\b(maquina|print)\(/g, '<span class="t-fn">$1</span>(');
  term.innerHTML = DEMO.map((l, i) => `<div class="ln"><span class="n">${i + 1}</span><span>${hl(l) || ' '}</span></div>`).join('');
  const lines = [...term.children];
  let k = 0, money = 0;
  const logs = [];
  const tick = () => {
    const [ln, wait] = DEMO_RUN[k % DEMO_RUN.length];
    lines.forEach((el, i) => { el.classList.toggle('cur', i === ln - 1 && !wait); el.classList.toggle('wait', i === ln - 1 && !!wait); });
    if (ln === 10) {
      const g = +(9 + Math.random() * 6).toFixed(1);
      money += g;
      logs.push(`+$ ${g}   (total $ ${money.toFixed(1)})`);
      if (logs.length > 2) logs.shift();
      out.innerHTML = logs.map((l) => `<div>${l}</div>`).join('');
    }
    k++;
    setTimeout(tick, wait ? 1300 : 520);
  };
  tick();
}

function tipLoop() {
  const el = $('#tip'), n = $('#tip-n');
  let i = Math.floor(Math.random() * TIPS.length);
  const show = () => {
    el.style.opacity = 0;
    setTimeout(() => {
      el.innerHTML = TIPS[i];
      n.textContent = String(i + 1).padStart(2, '0');
      el.style.opacity = 1;
      i = (i + 1) % TIPS.length;
    }, 350);
  };
  show();
  setInterval(show, 7000);
}

// câmera passeando em volta da fábrica enquanto o menu está aberto
let orbitT = Math.random() * 10;
export function updateMenuCamera(dt) {
  const cam = game.camera;
  orbitT += dt * 0.045;
  // centro: média das máquinas (ou o meio do mapa)
  let cx = 0, cz = -2 * CELL, n = 0;
  for (const e of game.entities) { cx += e.pos.x; cz += e.pos.z; n++; }
  if (n) { cx /= n; cz /= n; }
  const r = (n ? 15 : 22) + Math.sin(orbitT * 0.7) * 3;
  cam.position.set(cx + Math.cos(orbitT) * r, (n ? 6.5 : 9) + Math.sin(orbitT * 0.5) * 1.5, cz + Math.sin(orbitT) * r);
  cam.lookAt(cx - Math.sin(orbitT) * 5, 0.8, cz + Math.cos(orbitT) * 5);
}
