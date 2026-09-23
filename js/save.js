// Salvar/carregar no navegador (localStorage).
import { game } from './state.js';
import { createEntity, addEntity, cellCenter, grid, key } from './machines.js';
import { serializeWires, loadWires } from './power.js';
import { setOreVisible } from './world.js';
import { MACHINES, DECOR, CELL } from './data.js';
import { audio } from './audio.js';

const KEY = 'automaton_save_v1';
// o jogo se chamava "Fabriquinha": traz o save antigo, se existir
try {
  const old = localStorage.getItem('fabriquinha_save_v1');
  if (old && !localStorage.getItem(KEY)) localStorage.setItem(KEY, old);
  if (old) localStorage.removeItem('fabriquinha_save_v1');
} catch { /* sem localStorage */ }

export function saveInfo() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!d) return null;
    return {
      level: d.economy?.level || 1,
      money: d.economy?.money || 0,
      time: d.time || 0,
      machines: (d.entities || []).filter((e) => e.type !== 'esteira').length,
      belts: (d.entities || []).filter((e) => e.type === 'esteira').length,
      objective: d.economy?.objective || 0,
      earned: d.economy?.stats?.earned || 0,
    };
  } catch { return null; }
}

export function hasSave() {
  try { return !!localStorage.getItem(KEY); } catch { return false; }
}

export function saveGame() {
  try {
    const p = game.camera.position;
    const data = {
      v: 1,
      time: game.time,
      economy: game.economy.serialize(),
      entities: game.entities.map((e) => e.serialize()),
      wires: serializeWires(),
      player: { x: p.x, z: p.z, yaw: game.camera.rotation.y, pitch: game.camera.rotation.x },
      stash: game.builder.codeStash,
      settings: { ...audio.settings, sens: game.player.controls.pointerSpeed, musicOn: audio.musicOn },
    };
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
  game.economy.load(d.economy);
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
  loadWires(d.wires, grid, key);
  game.builder.codeStash = d.stash || [];
  if (d.player) {
    game.camera.position.x = d.player.x;
    game.camera.position.z = d.player.z;
    game.camera.rotation.set(d.player.pitch || 0, d.player.yaw || 0, 0, 'YXZ');
  }
  return true;
}

export function deleteSave() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
