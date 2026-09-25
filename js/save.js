// Salvar/carregar no navegador (localStorage).
import { game } from './state.js';
import { createEntity, addEntity, cellCenter, grid, gridUp, key } from './machines.js';
import { serializeSky, loadSky } from './sky.js';
import { serializeWires, loadWires } from './power.js';
import { setOreVisible } from './world.js';
import { MACHINES, DECOR, CELL } from './data.js';
import { audio } from './audio.js';
import { serializeStructures, loadStructures } from './structures.js';
import { serializeEvents, loadEvents } from './events.js';

// 3 fábricas (espaços de save). A 1 usa a chave antiga pra não perder saves de versões anteriores.
export const SLOTS = [1, 2, 3];
const slotKey = (n) => (n === 1 ? 'automaton_save_v1' : `automaton_save_slot${n}`);
export function currentSlot() {
  try { const n = +localStorage.getItem('automaton_slot'); return SLOTS.includes(n) ? n : 1; } catch { return 1; }
}
export function setSlot(n) { try { localStorage.setItem('automaton_slot', String(n)); } catch { /* ignora */ } }
// visitando a fábrica de um amigo (?visita=1): carrega de outra chave e nunca salva
export const VISITING = typeof location !== 'undefined' && new URLSearchParams(location.search).has('visita');
export const VISIT_KEY = 'automaton_visit';
const KEY = VISITING ? VISIT_KEY : slotKey(currentSlot());
// o jogo se chamava "Fabriquinha": traz o save antigo, se existir
try {
  const old = localStorage.getItem('fabriquinha_save_v1');
  if (old && !localStorage.getItem(KEY)) localStorage.setItem(KEY, old);
  if (old) localStorage.removeItem('fabriquinha_save_v1');
} catch { /* sem localStorage */ }

export function saveInfo(slot = currentSlot()) {
  try {
    const d = JSON.parse(localStorage.getItem(slotKey(slot)) || 'null');
    if (!d) return null;
    return {
      level: d.economy?.level || 1,
      money: d.economy?.money || 0,
      time: d.time || 0,
      machines: (d.entities || []).filter((e) => e.type !== 'esteira').length,
      belts: (d.entities || []).filter((e) => e.type === 'esteira').length,
      objective: d.economy?.objective || 0,
      earned: d.economy?.stats?.earned || 0,
      name: d.name || '',
      saved: d.savedAt || 0,
    };
  } catch { return null; }
}

export function hasSave() {
  try { return !!localStorage.getItem(KEY); } catch { return false; }
}
export function renameSlot(slot, name) {
  try {
    const d = JSON.parse(localStorage.getItem(slotKey(slot)) || 'null');
    if (!d) return;
    d.name = name;
    localStorage.setItem(slotKey(slot), JSON.stringify(d));
  } catch { /* ignora */ }
}

// tudo que vai no save (também usado pra mandar a fábrica pra um amigo)
export function saveData() {
  const p = game.camera.position;
  return {
    v: 1,
    time: game.time,
    economy: game.economy.serialize(),
    entities: game.entities.map((e) => e.serialize()),
    wires: serializeWires(),
    sky: serializeSky(),
    player: { x: p.x, z: p.z, yaw: game.camera.rotation.y, pitch: game.camera.rotation.x },
    stash: game.builder.codeStash,
    settings: { ...audio.settings, sens: game.player.controls.pointerSpeed, musicOn: audio.musicOn },
    structures: serializeStructures(),
    events: serializeEvents(),
    pet: game.pet?.serialize(),
    name: game.slotName || '',
    savedAt: Date.now(),
  };
}
export function saveGame() {
  if (VISITING) return false;
  try {
    const data = saveData();
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn('save falhou', e);
    return false;
  }
}

export function loadSettings() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null');
    return d?.settings || null;
  } catch { return null; }
}

export function loadGame() {
  let d;
  try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { d = null; }
  if (!d) return false;
  game.time = d.time || 0;
  game.slotName = d.name || '';
  game.visitDe = VISITING ? String(d.visitDe || '').replace(/[<>&"']/g, '').slice(0, 24) : '';
  game.economy.load(d.economy);
  loadEvents(d.events); // antes das máquinas: o minerador precisa achar o veio de meteorito
  loadStructures(d.structures);
  game.pet?.load(d.pet);
  for (const ed of d.entities || []) {
    if (!MACHINES[ed.type] && !DECOR[ed.type]) continue;
    try {
      const e = createEntity(ed.type, ed.x, ed.z, ed.dir || 0);
      e.load(ed);
      addEntity(e);
      if (ed.type === 'minerador') setOreVisible(ed.x, ed.z, false);
      const c = cellCenter(ed.x, ed.z);
      for (const tf of game.tufts || []) if (Math.hypot(tf.position.x - c.x, tf.position.z - c.z) < CELL * 0.8) tf.visible = false;
    } catch (err) { console.warn('entidade não carregou', ed, err); }
  }
  loadWires(d.wires, grid, key, gridUp);
  loadSky(d.sky);
  game.builder.codeStash = d.stash || [];
  if (d.player) {
    game.camera.position.x = d.player.x;
    game.camera.position.z = d.player.z;
    game.camera.rotation.set(d.player.pitch || 0, d.player.yaw || 0, 0, 'YXZ');
  }
  return true;
}

export function deleteSave(slot = currentSlot()) {
  try { localStorage.removeItem(slotKey(slot)); } catch { /* ignore */ }
}
