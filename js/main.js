// AUTOMATON — ponto de entrada.
import * as THREE from 'three';
import { game } from './state.js';
import { loadAll } from './assets.js';
import { audio } from './audio.js';
import { buildWorld, updateMarketBoard } from './world.js';
import { Economy } from './economy.js';
import { Player } from './player.js';
import { Builder } from './build.js';
import { UI } from './ui.js';
import { generateThumbs } from './thumbs.js';
import { saveGame, loadGame, hasSave, deleteSave } from './save.js';
import { loadSettings, applySettings, bindSettingInputs } from './settings.js';
import { initMenu, openMenu, updateMenuCamera } from './menu.js';
import { updateFx, puff } from './fx.js';
import './computer.js';
import { animateBelts } from './machines.js';

const $ = (s) => document.querySelector(s);

// ─── renderer ───
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('#app').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.05, 900);
camera.rotation.order = 'YXZ';
Object.assign(game, { scene, camera, renderer });
window.automaton = game; // útil pra depurar no console (F12)
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ─── modos ───
game.setMode = (m) => {
  game.mode = m;
  if (m === 'ui' || m === 'menu' || m === 'pause') {
    if (document.pointerLockElement) document.exitPointerLock();
  }
  $('#pause').classList.toggle('hidden', m !== 'pause');
  $('#hud').classList.toggle('hidden', m === 'menu');
  $('#clickToPlay').classList.add('hidden');
  if (m === 'play') lockPointer(game.gesture);
  game.gesture = false;
};

// Se o navegador não deixar travar o mouse (mesmo com clique), entra no modo "arrastar pra olhar".
let lockFromGesture = false;
function lockPointer(fromGesture) {
  if (game.noLock) return;
  lockFromGesture = !!fromGesture;
  try {
    const p = renderer.domElement.requestPointerLock();
    if (p && p.catch) p.catch(() => lockFailed());
  } catch { lockFailed(); }
  setTimeout(() => { if (game.mode === 'play' && !document.pointerLockElement && !game.noLock) showClickToPlay(); }, 400);
}
function lockFailed() {
  if (lockFromGesture && !game.noLock) {
    game.noLock = true;
    $('#clickToPlay').classList.add('hidden');
    game.ui?.toast('Seu navegador não travou o mouse: <b>arraste com o botão esquerdo</b> pra olhar em volta.', 'warn');
    return;
  }
  showClickToPlay();
}
document.addEventListener('pointerlockerror', () => lockFailed());
function showClickToPlay() { if (game.mode === 'play' && !game.noLock) $('#clickToPlay').classList.remove('hidden'); }
$('#clickToPlay').addEventListener('click', () => { $('#clickToPlay').classList.add('hidden'); lockPointer(true); });
const isActive = () => game.mode === 'play' && (!!document.pointerLockElement || game.noLock);
document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === renderer.domElement;
  if (locked) $('#clickToPlay').classList.add('hidden');
  else if (game.mode === 'play') game.setMode('pause');
});

// ─── carregamento ───
function bootLog(text, state = 'ok') {
  const el = document.createElement('div');
  el.innerHTML = `<span class="${state}">[${state === 'ok' ? ' ok ' : ' .. '}]</span> ${text}`;
  $('#boot-log').appendChild(el);
  return el;
}
async function boot() {
  const bar = $('#load-bar'), txt = $('#load-text');
  bootLog('AUTOMATON v1.1 · kernel jiboia 🐍');
  const l1 = bootLog('carregando modelos 3D, texturas e céu…', 'run');
  await loadAll(renderer, (p) => { bar.style.width = Math.round(p * 80) + '%'; txt.textContent = `modelos ${Math.round(p * 100)}%`; });
  l1.innerHTML = '<span class="ok">[ ok ]</span> modelos 3D, texturas e céu';
  const l2 = bootLog('carregando efeitos sonoros…', 'run');
  await audio.load();
  l2.innerHTML = '<span class="ok">[ ok ]</span> efeitos sonoros e música';
  bar.style.width = '90%';
  const l3 = bootLog('montando a fábrica…', 'run');
  txt.textContent = 'montando a fábrica';
  await document.fonts.ready;

  game.economy = new Economy();
  buildWorld();
  game.player = new Player(camera, renderer.domElement);
  game.builder = new Builder();
  generateThumbs();
  game.ui = new UI();
  loadSettings();
  applySettings();
  bindSettingInputs();

  game.player.teleport(game.spawn, 0);
  const had = hasSave() && loadGame();
  if (!had) game.player.teleport(game.spawn, 0);
  rememberView();
  l3.innerHTML = '<span class="ok">[ ok ]</span> fábrica montada' + (had ? ' · save carregado' : '');
  bootLog('rede de energia ⚡ online');
  bar.style.width = '100%';
  game.ui.updateStats();
  game.ui.renderHotbar();
  game.ui.renderObjective();
  $('#track').textContent = audio.currentTrack().nome;
  $('#music-toggle').textContent = audio.musicOn ? '⏸' : '▶';

  renderer.compile(scene, camera);
  initMenu(startPlay);
  game.mode = 'menu';
  requestAnimationFrame(loop);
  setTimeout(() => {
    $('#loading').classList.add('hidden');
    $('#menu').classList.remove('hidden');
  }, 350);
}

// guarda/restaura a visão do jogador (o menu usa a câmera pra passear)
function rememberView() {
  const p = camera.position;
  game.playerView = { x: p.x, z: p.z, yaw: camera.rotation.y, pitch: camera.rotation.x };
}
function restoreView() {
  const v = game.playerView;
  if (!v) return;
  camera.position.set(v.x, 1.62, v.z);
  camera.rotation.set(v.pitch, v.yaw, 0, 'YXZ');
}

// ─── menu / pausa ───
function startPlay() {
  audio.start();
  restoreView();
  $('#menu').classList.add('hidden');
  game.gesture = true;
  game.setMode('play');
  if (!game.welcomed) {
    game.welcomed = true;
    game.ui.toast('Bem-vindo(a) ao AUTOMATON! Siga o objetivo no canto direito 🎯');
    setTimeout(() => game.ui.toast('Dica: aperte <kbd>H</kbd> pra abrir o 📖 Guia e <kbd>B</kbd> pra abrir a loja.'), 2500);
  }
}
$('#btn-resume').onclick = () => { game.gesture = true; game.setMode('play'); };
$('#btn-guide').onclick = () => game.ui.openOverlay('guide');
$('#btn-save').onclick = () => { if (saveGame()) game.ui.toast('Jogo salvo 💾', 'good'); };
$('#btn-reset').onclick = () => {
  if (!confirm('Apagar TUDO e começar do zero?')) return;
  deleteSave();
  game.skipSave = true;
  location.reload();
};
$('#btn-menu').onclick = () => {
  saveGame();
  rememberView();
  game.setMode('menu');
  openMenu();
  $('#menu').classList.remove('hidden');
};
// ─── entrada ───
addEventListener('keydown', (e) => {
  if (game.noLock && game.mode === 'play' && e.code === 'Escape') { game.setMode('pause'); return; }
  if (!isActive()) return;
  const b = game.builder;
  if (e.code.startsWith('Digit')) {
    const n = +e.code.slice(5);
    if (n >= 1 && n <= 9) b.selectIndex(n - 1);
    if (n === 0) b.select(null);
  }
  switch (e.code) {
    case 'KeyR': b.rotate(); break;
    case 'KeyQ': if (b.selected) b.select(b.selected); break;
    case 'KeyX': b.removeHovered(); break;
    case 'KeyE': interact(); break;
    case 'KeyB': game.ui.openOverlay('shop'); break;
    case 'KeyM': audio.nextTrack(); break;
    case 'KeyH': game.ui.openOverlay('guide'); break;
  }
});
function primaryClick() {
  if (game.builder.selected) game.builder.place();
  else interact();
}
let drag = null;
renderer.domElement.addEventListener('mousedown', (e) => {
  if (!isActive()) return;
  if (e.button === 0) {
    if (game.noLock) drag = { moved: 0 };
    else primaryClick();
  }
  if (e.button === 2) game.builder.removeHovered();
});
// modo sem trava do mouse: arrastar pra olhar, clique curto = ação
addEventListener('mousemove', (e) => {
  if (!drag || !game.noLock || game.mode !== 'play') return;
  drag.moved += Math.abs(e.movementX) + Math.abs(e.movementY);
  const s = 0.0035 * game.player.controls.pointerSpeed;
  camera.rotation.y -= e.movementX * s;
  camera.rotation.x = Math.max(-1.5, Math.min(1.5, camera.rotation.x - e.movementY * s));
});
addEventListener('mouseup', (e) => {
  if (e.button !== 0 || !drag) return;
  const d = drag;
  drag = null;
  if (d.moved < 6 && isActive()) primaryClick();
});
addEventListener('contextmenu', (e) => e.preventDefault());
addEventListener('wheel', (e) => {
  if (!isActive()) return;
  game.builder.cycle(e.deltaY > 0 ? 1 : -1);
}, { passive: true });

function interact() {
  const h = game.builder.hover;
  if (!h) return;
  if (h.entity) {
    const e = h.entity;
    if (e.type === 'computador') game.ui.openOverlay('editor', e);
    else if (e.isMachine && e.type !== 'esteira' && e.type !== 'poste') game.ui.openOverlay('panel', e);
    return;
  }
  const a = h.interact?.action;
  if (a === 'shop') game.ui.openOverlay('shop', 'maquinas');
  if (a === 'market') game.ui.openOverlay('shop', 'mercado');
  if (a === 'radio') { audio.nextTrack(); game.ui.toast('📻 Tocando: ' + audio.currentTrack().nome); }
  if (a === 'coffee') {
    audio.play('coffee');
    game.player.coffee = 90;
    const p = h.interact.obj.getWorldPosition(new THREE.Vector3());
    puff(new THREE.Vector3(p.x, p.y + 0.5, p.z), { color: 0xffffff, count: 6, size: 0.25, up: 0.5, life: 2, opacity: 0.5 });
    game.ui.toast('☕ Cafezinho! Você anda mais rápido por 90 segundos.', 'good');
  }
}

// ─── loop ───
let last = performance.now();
let objTimer = 0, saveTimer = 30;
const sunOffset = new THREE.Vector3(40, 60, 25);
function simStep(dt) {
  game.time += dt;
  game.economy.update(dt);
  const ents = game.entities;
  for (let i = 0; i < ents.length; i++) if (ents[i].type === 'esteira') ents[i].update(dt);
  for (let i = 0; i < ents.length; i++) if (ents[i].type !== 'esteira') ents[i].update(dt);
  objTimer -= dt;
  if (objTimer <= 0) { objTimer = 1; game.economy.checkObjective(); }
  saveTimer -= dt;
  if (saveTimer <= 0) { saveTimer = 30; saveGame(); }
}
game.simStep = simStep;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const simulate = game.mode === 'play' || game.mode === 'ui';
  if (simulate) simStep(dt);
  updateFx(dt);
  animateBelts(dt);
  updateMarketBoard(dt);
  if (game.mode === 'menu') updateMenuCamera(dt);
  else if (!game.debugCam) game.player.update(dt, isActive());
  if (game.mode === 'play') game.builder.update();
  else { game.builder.hover = null; }
  game.ui.update();
  // sombra segue o jogador
  const p = camera.position;
  game.sun.position.set(Math.round(p.x) + sunOffset.x, sunOffset.y, Math.round(p.z) + sunOffset.z);
  game.sun.target.position.set(Math.round(p.x), 0, Math.round(p.z));
  if (game.campfire) game.campfire.intensity = 7 + Math.sin(now * 0.013) * 1.2 + Math.sin(now * 0.031) * 0.8;
  renderer.render(scene, camera);
}

addEventListener('beforeunload', () => { if (!game.skipSave && game.economy) saveGame(); });

boot().catch((e) => {
  console.error(e);
  $('#load-text').textContent = 'Erro ao carregar: ' + e.message + ' — abra pelo Jogar.bat (precisa do servidor local).';
});
