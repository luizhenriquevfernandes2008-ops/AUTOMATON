// Eventos tranquilos: chuva de meteoros (deixa um veio raro e pedrinhas pra pegar), feira (preços altos),
// aurora no céu à noite e arco-íris depois da chuva.
import * as THREE from 'three';
import { game } from './state.js';
import { CELL, ITEMS, ORES } from './data.js';
import { cloneModel, tint } from './assets.js';
import { audio } from './audio.js';
import { puff } from './fx.js';
import { grid, ores, key, cellCenter } from './machines.js';
import { isBuildableCell, colliders } from './world.js';

const VEIN_SIZE = 40;         // fragmentos em cada veio de meteorito
const state = {
  next: 300,                  // segundos até sortear o próximo evento
  active: null,               // { tipo, ate, ... }
  veins: [],                  // [{ x, z, left }]
  pickups: [],                // [{ x, z }]
};
game.events = state;
game.pickups = [];            // objetos 3D das pedrinhas (a mira detecta)
let streaks = [], falling = [], aurora = null, rainbow = null, lastWeather = null;

// ─── sorteio ───
export function updateEvents(dt) {
  const a = state.active;
  if (a) {
    if (a.tipo === 'meteoros') updateMeteorShower(dt);
    if (game.time >= a.ate) endEvent();
  } else {
    state.next -= dt;
    if (state.next <= 0) {
      state.next = 260 + Math.random() * 280;
      const r = Math.random();
      if (game.isNight) { if (r < 0.45) startEvent('meteoros'); else if (r < 0.85) startEvent('aurora'); }
      else if (r < 0.6) startEvent('feira');
    }
  }
  // arco-íris quando a chuva passa de dia
  const w = game.sky?.weather;
  if (lastWeather === 'chuva' && w !== 'chuva' && !game.isNight && !state.active) startEvent('arcoiris');
  lastWeather = w;
  updateVisuals(dt);
  // pedrinhas giram devagar
  for (const p of game.pickups) { p.rotation.y += dt * 0.8; p.position.y = 0.25 + Math.sin(game.time * 2 + p.position.x) * 0.05; }
}

export function startEvent(tipo) {
  if (state.active) endEvent(true);
  const dur = { meteoros: 55, feira: 240, aurora: 160, arcoiris: 90 }[tipo];
  state.active = { tipo, ate: game.time + dur, t0: game.time };
  if (tipo === 'meteoros') {
    state.active.landings = 2 + Math.floor(Math.random() * 2);
    state.active.landT = 8;
    game.ui?.banner('☄️ Chuva de meteoros!', 'Olhe pro céu', ['Alguns vão cair perto da fábrica', 'Deixam um veio raro de meteorito (coloque um minerador!)', 'Pegue as pedrinhas brilhantes com E']);
    game.emit('evento_mundo', 'meteoros');
  }
  if (tipo === 'feira') {
    const pool = Object.keys(ITEMS).filter((k) => ITEMS[k].base >= 2 && k !== 'fragmento_estelar');
    const items = [];
    while (items.length < 3) { const k = pool[Math.floor(Math.random() * pool.length)]; if (!items.includes(k)) items.push(k); }
    state.active.items = items;
    game.economy.fair = { items, mult: 1.6, ate: state.active.ate };
    game.ui?.banner('🎪 Dia de feira!', 'Preços +60% por 4 minutos:', items.map((k) => ITEMS[k].nome));
    audio.play('quest', { volume: 0.6 });
    game.emit('evento_mundo', 'feira');
  }
  if (tipo === 'aurora') {
    game.ui?.toast('🌌 Olha pro céu: uma aurora apareceu!', 'good');
    game.emit('evento_mundo', 'aurora');
  }
  if (tipo === 'arcoiris') {
    game.ui?.toast('🌈 Arco-íris depois da chuva!', 'good');
    game.emit('evento_mundo', 'arcoiris');
  }
}
function endEvent(silent) {
  const a = state.active;
  state.active = null;
  if (a?.tipo === 'feira') { game.economy.fair = null; if (!silent) game.ui?.toast('🎪 A feira acabou. Preços voltaram ao normal.'); }
}

// ─── meteoros ───
function streak() {
  const cam = game.camera.position;
  const a = Math.random() * Math.PI * 2;
  const start = new THREE.Vector3(cam.x + Math.cos(a) * 160, 90 + Math.random() * 50, cam.z + Math.sin(a) * 160);
  const dir = new THREE.Vector3(-Math.cos(a) + (Math.random() - 0.5) * 0.6, -0.35 - Math.random() * 0.2, -Math.sin(a) + (Math.random() - 0.5) * 0.6).normalize();
  const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), dir.clone().multiplyScalar(-14)]);
  g.setAttribute('color', new THREE.Float32BufferAttribute([1, 0.95, 0.85, 0.5, 0.35, 0.9], 3));
  const l = new THREE.Line(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1, fog: false, blending: THREE.AdditiveBlending, depthWrite: false }));
  l.position.copy(start);
  l.frustumCulled = false;
  game.scene.add(l);
  streaks.push({ l, dir, v: 110 + Math.random() * 60, life: 1.4 });
}
function freeCellNearFactory() {
  for (let tries = 0; tries < 80; tries++) {
    const x = Math.floor((Math.random() * 2 - 1) * 20), z = Math.floor((Math.random() * 2 - 1) * 20) - 2;
    const k = key(x, z);
    if (!isBuildableCell(x, z) || grid.has(k) || ores.has(k)) continue;
    const c = cellCenter(x, z);
    if (c.z > 18 && Math.abs(c.x) < 14) continue; // escritório
    if (colliders.some((col) => Math.hypot(col.x - c.x, col.z - c.z) < col.r + 1.2)) continue;
    let near = false;
    for (let dx = -1; dx <= 1 && !near; dx++) for (let dz = -1; dz <= 1; dz++) if (ores.has(key(x + dx, z + dz))) near = true;
    if (near) continue;
    return { x, z };
  }
  return null;
}
function launchMeteor() {
  const cell = freeCellNearFactory();
  if (!cell) return;
  const c = cellCenter(cell.x, cell.z);
  const m = cloneModel('meteorRock');
  tint(m, 0x7a5aa8, 0xff7a3a, 0.8);
  const from = new THREE.Vector3(c.x + 40, 70, c.z - 30);
  m.position.copy(from);
  game.scene.add(m);
  falling.push({ m, from, to: c, t: 0, cell });
}
function updateMeteorShower(dt) {
  const a = state.active;
  if (Math.random() < dt * 2.2) streak();
  a.landT -= dt;
  if (a.landT <= 0 && a.landings > 0) { a.landings--; a.landT = 9 + Math.random() * 8; launchMeteor(); }
}
function land(f) {
  game.scene.remove(f.m);
  audio.play('meteor', { pos: f.to, volume: 0.9 });
  puff(new THREE.Vector3(f.to.x, 0.6, f.to.z), { color: 0xffa060, count: 22, size: 0.8, up: 2.5, spread: 2.5, life: 1.6, additive: true });
  puff(new THREE.Vector3(f.to.x, 0.4, f.to.z), { color: 0x9a8a7a, count: 14, size: 1.1, up: 1.2, spread: 3, life: 2.4, opacity: 0.6 });
  if (!grid.has(key(f.cell.x, f.cell.z)) && !ores.has(key(f.cell.x, f.cell.z))) addVein(f.cell.x, f.cell.z, VEIN_SIZE);
  // pedrinhas em volta
  const n = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2, r = 1.6 + Math.random() * 2.2;
    addPickup(f.to.x + Math.cos(ang) * r, f.to.z + Math.sin(ang) * r);
  }
  game.pet?.say('Caiu um meteoro! ☄️ Bora pegar as pedrinhas?', 5);
}

// veio raro de meteorito (um minerador em cima tira fragmentos estelares)
const veinObjs = new Map();
export function addVein(x, z, left) {
  const k = key(x, z);
  ores.set(k, 'estelar');
  const c = cellCenter(x, z);
  const g = new THREE.Group();
  g.position.copy(c);
  const crater = cloneModel('crater'); g.add(crater);
  const rock = cloneModel('meteorRock');
  tint(rock, 0x6a4a9a, 0xb18cff, 0.5);
  rock.position.y = 0.05;
  g.add(rock);
  const light = new THREE.PointLight(0xb18cff, 3, 5, 1.5);
  light.position.y = 1;
  g.add(light);
  game.scene.add(g);
  veinObjs.set(k, g);
  game.oreModels = game.oreModels || new Map();
  game.oreModels.set(k, rock);
  state.veins = state.veins.filter((v) => !(v.x === x && v.z === z));
  state.veins.push({ x, z, left });
}
// chamado pelo minerador a cada fragmento tirado
export function mineVein(x, z) {
  const v = state.veins.find((a) => a.x === x && a.z === z);
  if (!v) return true;
  v.left--;
  if (v.left > 0) return true;
  // acabou: o veio some
  const k = key(x, z);
  ores.delete(k);
  const g = veinObjs.get(k);
  if (g) { game.scene.remove(g); veinObjs.delete(k); }
  game.oreModels?.delete(k);
  state.veins = state.veins.filter((a) => a !== v);
  const m = grid.get(k);
  if (m && m.type === 'minerador') { m.oreType = null; }
  game.ui?.toast('☄️ O veio de meteorito acabou. Espere a próxima chuva de meteoros!');
  return false;
}
export function veinLeft(x, z) { return state.veins.find((a) => a.x === x && a.z === z)?.left ?? 0; }
game.mineVein = mineVein;
game.veinLeft = veinLeft;

function addPickup(x, z) {
  const m = cloneModel('meteorSmall');
  tint(m, 0x8a6ad8, 0xb18cff, 0.9);
  m.position.set(x, 0.25, z);
  const p = { x, z, obj: m };
  m.userData.pickup = p;
  m.traverse((o) => { o.userData.pickup = p; });
  game.scene.add(m);
  game.pickups.push(m);
  state.pickups.push(p);
  return p;
}
export function collectPickup(p, by = 'jogador') {
  const i = state.pickups.indexOf(p);
  if (i < 0) return 0;
  state.pickups.splice(i, 1);
  game.scene.remove(p.obj);
  game.pickups = game.pickups.filter((o) => o !== p.obj);
  const eco = game.economy;
  const v = Math.round(ORES.estelar ? eco.price('fragmento_estelar') : 50);
  eco.addMoney(v);
  eco.stats.earned += v;
  eco.addXp(v);
  eco.stats.fragments = (eco.stats.fragments || 0) + 1;
  audio.play('coins', { volume: 0.6 });
  puff(new THREE.Vector3(p.x, 0.6, p.z), { color: 0xb18cff, count: 12, size: 0.18, up: 1.6, gravity: 3, additive: true, life: 0.9 });
  game.ui?.toast(`☄️ Fragmento estelar${by === 'oopi' ? ' (o Oopi trouxe!)' : ''}: +$ ${v}`, 'good');
  return v;
}

// ─── visuais: meteoros caindo, aurora e arco-íris ───
function updateVisuals(dt) {
  for (let i = streaks.length - 1; i >= 0; i--) {
    const s = streaks[i];
    s.life -= dt;
    s.l.position.addScaledVector(s.dir, s.v * dt);
    s.l.material.opacity = Math.max(0, s.life / 1.4);
    if (s.life <= 0) { game.scene.remove(s.l); s.l.geometry.dispose(); streaks.splice(i, 1); }
  }
  for (let i = falling.length - 1; i >= 0; i--) {
    const f = falling[i];
    f.t += dt / 2.2;
    const k = Math.min(1, f.t);
    f.m.position.lerpVectors(f.from, f.to, k * k);
    f.m.rotation.x += dt * 3; f.m.rotation.z += dt * 2;
    if (Math.random() < dt * 40) puff(f.m.position.clone(), { color: 0xffa050, count: 1, size: 1.2, up: 0.2, life: 0.8, additive: true, spread: 0.3 });
    if (k >= 1) { land(f); falling.splice(i, 1); }
  }
  const a = state.active;
  // aurora: cortinas de luz bem alto no céu
  const wantAurora = a?.tipo === 'aurora' && game.isNight ? Math.min(1, (game.time - a.t0) / 12, (a.ate - game.time) / 12) : 0;
  if (wantAurora > 0 && !aurora) aurora = makeAurora();
  if (aurora) {
    aurora.material.uniforms.uTime.value += dt;
    aurora.material.uniforms.uAlpha.value += (wantAurora - aurora.material.uniforms.uAlpha.value) * Math.min(1, dt);
    aurora.position.set(game.camera.position.x, 0, game.camera.position.z);
    if (wantAurora <= 0 && aurora.material.uniforms.uAlpha.value < 0.01) { game.scene.remove(aurora); aurora = null; }
    if (wantAurora > 0.5 && game.mode === 'play') game.economy.stats.auroraSeen = true;
  }
  const wantRain = a?.tipo === 'arcoiris' ? Math.min(1, (game.time - a.t0) / 8, (a.ate - game.time) / 10) * (1 - (game.sky?.cloudK || 0) * 0.6) : 0;
  if (wantRain > 0 && !rainbow) rainbow = makeRainbow();
  if (rainbow) {
    rainbow.material.opacity += (wantRain * 0.45 - rainbow.material.opacity) * Math.min(1, dt);
    const d = game.sunDir || new THREE.Vector3(0.6, 0.7, 0.4);
    rainbow.position.set(game.camera.position.x - d.x * 220, -20, game.camera.position.z - d.z * 220);
    rainbow.lookAt(game.camera.position.x, -20, game.camera.position.z);
    if (wantRain <= 0 && rainbow.material.opacity < 0.01) { game.scene.remove(rainbow); rainbow = null; }
  }
}

function makeAurora() {
  const geo = new THREE.CylinderGeometry(260, 260, 90, 96, 1, true, 0, Math.PI * 2);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec2 vUv; uniform float uTime; uniform float uAlpha;
      void main(){
        float x = vUv.x * 40.0;
        float wave = sin(x * 0.7 + uTime * 0.25) * 0.5 + sin(x * 1.9 - uTime * 0.4) * 0.25 + sin(x * 0.23 + uTime * 0.1) * 0.25;
        float band = smoothstep(0.0, 0.35, vUv.y) * (1.0 - smoothstep(0.35 + wave * 0.15, 0.95, vUv.y));
        float rays = 0.55 + 0.45 * sin(x * 6.0 + wave * 3.0 + uTime * 0.8);
        vec3 col = mix(vec3(0.15, 1.0, 0.55), vec3(0.65, 0.35, 1.0), smoothstep(0.35, 0.9, vUv.y + wave * 0.1));
        gl_FragColor = vec4(col * band * rays, band * rays * uAlpha * 0.55);
      }`,
  });
  const m = new THREE.Mesh(geo, mat);
  m.position.y = 0;
  m.geometry.translate(0, 150, 0);
  m.frustumCulled = false;
  m.renderOrder = -1;
  game.scene.add(m);
  return m;
}
function makeRainbow() {
  const geo = new THREE.RingGeometry(120, 150, 96, 6, 0, Math.PI);
  const cols = [];
  const bands = [[1, 0.2, 0.2], [1, 0.6, 0.1], [1, 0.95, 0.2], [0.3, 0.9, 0.3], [0.2, 0.5, 1], [0.6, 0.3, 0.9]];
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const r = Math.hypot(pos.getX(i), pos.getY(i));
    const b = bands[Math.min(5, Math.max(0, Math.floor(((r - 120) / 30) * 6)))];
    cols.push(...b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  m.frustumCulled = false;
  m.renderOrder = -1;
  game.scene.add(m);
  return m;
}

// ─── salvar ───
export function serializeEvents() {
  const a = state.active;
  return { next: state.next, veins: state.veins, pickups: state.pickups.map((p) => ({ x: p.x, z: p.z })), active: a && a.tipo === 'feira' ? { tipo: a.tipo, resta: a.ate - game.time, items: a.items } : null };
}
export function loadEvents(d) {
  if (!d) return;
  state.next = d.next ?? state.next;
  for (const v of d.veins || []) addVein(v.x, v.z, v.left); // carregado antes das máquinas (o minerador precisa achar o veio)
  for (const p of d.pickups || []) addPickup(p.x, p.z);
  if (d.active?.tipo === 'feira' && d.active.resta > 5) {
    state.active = { tipo: 'feira', ate: game.time + d.active.resta, t0: game.time, items: d.active.items };
    game.economy.fair = { items: d.active.items, mult: 1.6, ate: state.active.ate };
  }
  void CELL;
}
