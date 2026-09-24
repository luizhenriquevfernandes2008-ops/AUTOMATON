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
import { loadSettings, applySettings, bindSettingInputs, syncStation, settings } from './settings.js';
import { initMenu, openMenu, updateMenuCamera } from './menu.js';
import { updateFx, puff } from './fx.js';
import './computer.js';
import './farm.js';
import { animateBelts, updateDecorBonus, setTechNamer, flushBelts, markBeltsDirty } from './machines.js';
import { flushItems } from './itemMeshes.js';
import { updateEvents, collectPickup } from './events.js';
import { countPaintings } from './structures.js';
import { actionOf, bindKeyUI } from './input.js';
import { initGamepad, updateGamepad } from './gamepad.js';
import { updateDrones, updateTimers } from './machines2.js';
import { updatePower } from './power.js';
import { initSky, updateSky } from './sky.js';
import { Pet } from './pet.js';
import { photo, togglePhoto, photoKey, photoWheel, updatePhoto } from './photo.js';
import { startTutorial, updateTutorial, refreshTutorial, tutorialActive } from './tutorial.js';
import { NO_PANEL } from './ui.js';
import { clearRegion } from './world.js';
import { TECHS, PAINTINGS } from './data.js';
import { buildContractBoard, updateContracts, updateShips } from './contracts.js';
import { buildTerminal } from './challengeUI.js';
import { buildCrates, openCrate } from './disks.js';
import { updateOrbit } from './space.js';
import { checkDaily, openMail } from './mail.js';

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
  if (!innerWidth || !innerHeight) return; // janela minimizada/escondida
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ─── modos ───
game.setMode = (m) => {
  if (m !== 'play' && photo.on) togglePhoto(false);
  game.mode = m;
  if (m !== 'play') game.player?.stop();
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
  if (game.noLock || game.padActive) return;
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
const isActive = () => game.mode === 'play' && (!!document.pointerLockElement || game.noLock || game.padActive);
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
  bootLog('AUTOMATON v1.3 · kernel jiboia 🐍');
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
  setTechNamer((id) => TECHS[id]?.nome || id);
  buildWorld();
  buildContractBoard();
  buildTerminal();
  initSky();
  game.player = new Player(camera, renderer.domElement);
  game.builder = new Builder();
  generateThumbs();
  game.ui = new UI();
  game.pet = new Pet();
  loadSettings();
  applySettings();
  bindSettingInputs();
  bindKeyUI((msg) => { if (msg) game.ui.toast(msg, 'warn'); game.emit('hotbar'); });
  initGamepad();

  game.player.teleport(game.spawn, 0);
  const had = hasSave() && loadGame();
  if (!had) game.player.teleport(game.spawn, 0);
  game.hadSave = had;
  for (const r of game.economy.regions) clearRegion(r);
  buildCrates();
  game.pet.applyLook();
  refreshTutorial();
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
    const eco = game.economy;
    const fresh = !game.hadSave && !eco.stats.ranCode && !game.entities.length;
    if (fresh) {
      // jogo novo: pergunta se quer o tutorial
      setTimeout(() => game.ui.confirm('Bem-vindo(a) ao AUTOMATON! 👋', '<p>Quer fazer o <b>tutorial interativo</b>? Ele te guia passo a passo na primeira fábrica (uns 5 minutos).</p><p class="muted">Dá pra pular a qualquer hora, e refazer depois no menu “Como jogar”.</p>',
        () => startTutorial(), { yes: '🎓 Sim, me ensina', no: 'Não, quero explorar' }), 400);
    }
    const gift = checkDaily(fresh);
    if (fresh) { /* jogo novo: o correio começa amanhã */ } else if (gift || eco.offlineReport) {
      const off = eco.offlineReport;
      eco.offlineReport = null;
      setTimeout(() => openMail(gift, off), 400);
    } else {
      game.ui.toast('Bem-vindo(a) de volta ao AUTOMATON! 🎯');
    }
    if (!fresh) setTimeout(() => game.ui.toast('Dica: <kbd>H</kbd> guia · <kbd>Tab</kbd> mapa · <kbd>K</kbd> estatísticas · <kbd>P</kbd> modo foto'), 2500);
  }
}
$('#btn-stats').onclick = () => game.ui.openOverlay('stats');
$('#btn-map').onclick = () => game.ui.openOverlay('map');
$('#btn-projects').onclick = () => game.ui.openOverlay('projects');
$('#menu-tutorial').onclick = () => { startPlay(); setTimeout(() => startTutorial(), 600); };
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
  if (game.noLock && game.mode === 'play' && e.code === 'Escape') { if (photo.on) togglePhoto(false); game.setMode('pause'); return; }
  if (!isActive()) return;
  if (photo.on) { e.preventDefault(); photoKey(e); return; }
  const b = game.builder;
  if (e.ctrlKey && e.code === 'KeyZ') { e.preventDefault(); game.player.sliding = false; b.undo(); return; }
  if (e.code.startsWith('Digit')) {
    const n = +e.code.slice(5);
    if (n >= 1 && n <= 9) b.selectIndex(n - 1);
    if (n === 0) b.select(null);
  }
  if (e.code === 'Tab') e.preventDefault();
  switch (actionOf(e.code)) {
    case 'girar': b.rotate(); break;
    case 'soltar': actions.cancel(); break;
    case 'guardar': b.removeHovered(); break;
    case 'usar': interact(); break;
    case 'loja': game.ui.openOverlay('shop'); break;
    case 'musica': audio.nextTrack(); break;
    case 'radio': actions.radio(); break;
    case 'guia': game.ui.openOverlay('guide'); break;
    case 'stats': game.ui.openOverlay('stats'); break;
    case 'mapa': e.preventDefault(); game.ui.openOverlay('map'); break;
    case 'copiar': b.startCopy(); game.emit('hotbar'); break;
    case 'colar': b.startPaste(); game.emit('hotbar'); break;
    case 'foto': togglePhoto(true); break;
    case 'projetos': game.ui.openOverlay('projects'); break;
    case 'contratos': game.ui.openOverlay('contracts'); break;
    case 'peca': actions.piece(e.shiftKey ? -1 : 1); break;
    case 'material': actions.material(e.shiftKey ? -1 : 1); break;
  }
});
// ações usadas pelo teclado e pelo controle
const actions = {
  cancel() { const b = game.builder; if (b.copyMode || b.pasteMode) b.cancelModes(); else if (b.selected) b.select(b.selected); game.emit('hotbar'); },
  interact: () => interact(),
  primary: () => primaryClick(),
  rotate: () => game.builder.rotate(),
  shop: () => game.ui.openOverlay('shop'),
  radio() { const s = audio.nextStation(); syncStation(); game.ui.toast(`📻 ${s.icone} ${s.nome}`); },
  piece(d = 1) {
    const b = game.builder;
    if (b.selected === 'construir') b.cyclePiece(d);
    else if (b.hover?.pet) game.ui.openOverlay('pet');
    else if (!b.selected) { b.select('construir'); }
  },
  material(d = 1) { const b = game.builder; if (b.selected === 'construir') b.cycleMaterial(d); },
  pause() { if (photo.on) togglePhoto(false); if (document.pointerLockElement) document.exitPointerLock(); game.setMode('pause'); },
  resume() { game.gesture = true; game.setMode('play'); },
  menuPlay() { if (!$('#menu').classList.contains('hidden') && startPlay) startPlay(); },
};
function primaryClick() {
  const b = game.builder;
  if (b.selected || b.copyMode || b.pasteMode) b.place();
  else interact();
}
let drag = null;
renderer.domElement.addEventListener('mousedown', (e) => {
  if (!isActive() || photo.on) return;
  if (e.button === 0) {
    if (game.noLock) drag = { moved: 0 };
    else primaryClick();
  }
  if (e.button === 2) game.builder.removeHovered();
});
// modo sem trava do mouse: arrastar pra olhar, clique curto = ação
addEventListener('mousedown', (e) => { if (photo.on && game.noLock && e.button === 0 && game.mode === 'play') drag = { moved: 0 }; });
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
  if (d.moved < 6 && isActive() && !photo.on) primaryClick();
});
addEventListener('contextmenu', (e) => e.preventDefault());
addEventListener('wheel', (e) => {
  if (!isActive()) return;
  if (photo.on) { photoWheel(e.deltaY); return; }
  game.builder.cycle(e.deltaY > 0 ? 1 : -1);
}, { passive: true });

function interact() {
  const h = game.builder.hover;
  if (!h) return;
  if (h.pet) { game.pet.pet(); return; }
  if (h.pickup) { collectPickup(h.pickup); return; }
  if (h.struct) {
    if (h.struct.kind === 'quadro') { const P = PAINTINGS[h.struct.painting]; game.ui.toast(`🖼️ <b>${P.nome}</b><br>${P.autor} · domínio público`); }
    return;
  }
  if (h.entity) {
    const e = h.entity;
    if (e.type === 'computador') game.ui.openOverlay('editor', e);
    else if (e.type === 'laboratorio') game.ui.openOverlay('research', e);
    else if (e.isMachine && !NO_PANEL.has(e.type)) game.ui.openOverlay('panel', e);
    return;
  }
  const a = h.interact?.action;
  if (!a) return;
  if (a === 'shop') game.ui.openOverlay('shop', 'maquinas');
  if (a === 'market') game.ui.openOverlay('shop', 'mercado');
  if (a === 'platform') game.ui.openOverlay('platform');
  if (a === 'contracts') game.ui.openOverlay('contracts');
  if (a === 'challenges') game.ui.openOverlay('challenges');
  if (a.startsWith('crate:')) openCrate(a.slice(6));
  if (a.startsWith('region:')) game.ui.buyRegion(a.slice(7));
  if (a === 'radio') { const s = audio.nextStation(); syncStation(); game.ui.toast(`📻 ${s.icone} ${s.nome}: ${audio.currentTrack().nome}`); }
  if (a === 'coffee') {
    game.player.drinkCoffee();
    const p = h.interact.obj.getWorldPosition(new THREE.Vector3());
    puff(new THREE.Vector3(p.x, p.y + 0.5, p.z), { color: 0xffffff, count: 6, size: 0.25, up: 0.5, life: 2, opacity: 0.5 });
    game.ui.toast('☕ Cafezinho! +30% de velocidade por 90 segundos.', 'good');
  }
}

// regiões compradas: tira as árvores
game.on('region', (id) => clearRegion(id));

// ─── loop ───
let last = performance.now();
let objTimer = 0, saveTimer = 30, powerTimer = 0, decorTimer = 0, achTimer = 3, recordTimer = 30;
game.on('moved', (e) => { if (e.instanced) markBeltsDirty(); });
function simStep(dt) {
  game.time += dt;
  game.economy.update(dt);
  const ents = game.entities;
  powerTimer -= dt;
  if (powerTimer <= 0) { powerTimer = 0.25; updatePower(); }
  for (let i = 0; i < ents.length; i++) if (ents[i].items) ents[i].update(dt);
  for (let i = 0; i < ents.length; i++) if (!ents[i].items) ents[i].update(dt);
  game.platform?.update(dt);
  updateDrones(dt);
  updateTimers();
  decorTimer -= dt;
  if (decorTimer <= 0) { decorTimer = 2; updateDecorBonus(); }
  objTimer -= dt;
  if (objTimer <= 0) { objTimer = 1; game.economy.checkObjective(); }
  updateEvents(dt);
  updateContracts(dt);
  achTimer -= dt;
  if (achTimer <= 0) { achTimer = 2; game.economy.stats.paintingsHung = countPaintings(); game.economy.checkAchievements(); }
  recordTimer -= dt;
  if (recordTimer <= 0) { recordTimer = 30; game.economy.checkRecords(); }
  saveTimer -= dt;
  if (saveTimer <= 0) { saveTimer = 30; saveGame(); }
}
game.simStep = simStep;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const simulate = (game.mode === 'play' || game.mode === 'ui') && !(photo.on && photo.freeze);
  if (simulate) simStep(dt);
  updateSky(dt, simulate || game.mode === 'menu');
  updateFx(dt);
  updateShips(dt);
  updateOrbit(dt);
  animateBelts(dt);
  updateMarketBoard(dt);
  if (game.mode === 'menu') updateMenuCamera(dt);
  else if (photo.on) updatePhoto(dt);
  else if (!game.debugCam) game.player.update(dt, isActive());
  if (game.mode === 'play' && !photo.on) game.builder.update();
  else { game.builder.hover = null; }
  if (game.pet) game.pet.update(dt);
  updateTutorial(dt);
  game.ui.update(dt);
  // sol/lua acompanham o jogador (sombras)
  const p = camera.position;
  const d = game.sunDir || new THREE.Vector3(0.6, 0.7, 0.4);
  game.sun.position.set(Math.round(p.x) + d.x * 80, d.y * 80, Math.round(p.z) + d.z * 80);
  game.sun.target.position.set(Math.round(p.x), 0, Math.round(p.z));
  if (game.campfire) game.campfire.intensity = 7 + Math.sin(now * 0.013) * 1.2 + Math.sin(now * 0.031) * 0.8;
  updateGamepad(dt, actions);
  flushBelts();
  flushItems();
  renderer.render(scene, camera);
}
addEventListener('beforeunload', () => { if (!game.skipSave && game.economy) saveGame(); });

boot().catch((e) => {
  console.error(e);
  $('#load-text').textContent = 'Erro ao carregar: ' + e.message + ' — abra pelo Jogar.bat (precisa do servidor local).';
});
