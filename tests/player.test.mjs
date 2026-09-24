// Execute: node --experimental-vm-modules --test tests/player.test.mjs
// Player real; DOM, áudio e mundo isolados.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SyntheticModule } from 'node:vm';
import { context, modules, loadModule, THREE } from './gltf-runtime.mjs';

const grid = new Map(), colliders = [];
const game = { mode: 'play', economy: { stats: {} }, ui: { toast() {} } };
function stub(path, exports) {
  const id = String(new URL(path, import.meta.url));
  modules.set(id, new SyntheticModule(Object.keys(exports), function () {
    for (const [name, value] of Object.entries(exports)) this.setExport(name, value);
  }, { context, identifier: id }));
}
stub('../lib/addons/controls/PointerLockControls.js', { PointerLockControls: class {} });
stub('../js/state.js', { game });
stub('../js/machines.js', { grid, key: (x, z) => `${x},${z}`, worldToCell: (x, z) => ({ x: Math.floor(x / 2), z: Math.floor(z / 2) }) });
stub('../js/world.js', { colliders, isPadCell: () => false });
stub('../js/data.js', { CELL: 2 });
stub('../js/audio.js', { audio: { play() {}, setListener() {} } });
const DEF_KEYS = { frente: 'KeyW', tras: 'KeyS', esquerda: 'KeyA', direita: 'KeyD', correr: 'ShiftLeft', pular: 'Space', deslizar: 'ControlLeft' };
stub('../js/input.js', {
  keyOf: (id) => DEF_KEYS[id],
  held: (k, id) => !!(k[DEF_KEYS[id]] || (id === 'correr' && k.ShiftRight) || (id === 'deslizar' && k.ControlRight)),
});
const walls = [];
stub('../js/structures.js', { structBlocked: (x, z, r) => walls.some((w) => Math.abs(x - w.x) < r + 0.09 && z > w.z0 && z < w.z1), floorMaterialAt: () => null });
const mod = await loadModule(new URL('../js/player.js', import.meta.url));
await mod.evaluate();
const { Player } = mod.namespace;
function player() {
  const p = new Player(new THREE.PerspectiveCamera(72, 16 / 9, 0.05, 900), {});
  p.blockedAt = () => false;
  return p;
}
function run(p, seconds, dt = 1 / 60) {
  for (let i = 0; i < Math.round(seconds / dt); i++) p.update(dt, true);
}

test('corrida ganha embalo, tem limite e não ganha velocidade extra na diagonal', () => {
  const p = player(); p.keys = { KeyW: true, ShiftLeft: true };
  run(p, 0.7); const early = p.speed;
  run(p, 5); assert(p.speed > early + 2); assert(Math.abs(p.speed - 10.8) < 0.02);
  const diagonal = player(); diagonal.keys = { KeyW: true, KeyD: true, ShiftLeft: true };
  run(diagonal, 5.7); assert(Math.abs(diagonal.speed - p.speed) < 0.001);
  p.keys = {}; run(p, 1.5); assert(p.speed < 0.01); assert.equal(p.momentum, 0);
});

test('deslize abaixa a câmera, dá impulso e salto preserva velocidade', () => {
  const p = player(); p.keys = { KeyW: true, ShiftLeft: true }; run(p, 5);
  const speed = p.speed; p.keys.ControlLeft = true; run(p, 0.1);
  assert(p.sliding); assert(p.speed > speed); assert(p.camera.position.y < 1.2);
  const slideSpeed = p.speed; p.keys.Space = true; run(p, 1 / 60);
  assert(!p.sliding); assert(!p.onGround); assert(p.speed > slideSpeed * 0.95);
  p.keys = {}; run(p, 0.25); assert(p.speed > slideSpeed * 0.95);
});

test('deslize exige movimento, termina e não repete segurando Ctrl', () => {
  const p = player(); p.keys.ControlLeft = true; run(p, 0.1); assert(!p.sliding);
  p.keys = { KeyW: true, ShiftLeft: true }; run(p, 3);
  p.keys.ControlLeft = true; run(p, 0.1); assert(p.sliding);
  run(p, 2); assert(!p.sliding); assert(p.eyeHeight > 1.6);
  p.keys.ControlLeft = false; run(p, 0.1);
  p.keys.ControlLeft = true; run(p, 0.1); assert(p.sliding);
});

test('colisão em alta velocidade não atravessa obstáculos finos e cancela embalo', () => {
  const p = player(); p.keys = { KeyW: true, ShiftLeft: true }; run(p, 5);
  p.keys.ControlLeft = true; run(p, 0.05);
  const wall = p.position.z - 0.35;
  p.blockedAt = (_x, z) => z < wall && z > wall - 0.2;
  run(p, 0.1, 0.05);
  assert(p.position.z >= wall); assert.equal(p.speed, 0); assert.equal(p.momentum, 0); assert(!p.sliding);
});

test('colisões reais de máquinas, árvores e borda continuam ativas', () => {
  const p = player(); p.blockedAt = Player.prototype.blockedAt;
  grid.set('0,0', { solid: true });
  assert(p.blockedAt(1, 1)); assert(!p.blockedAt(-1, -1)); grid.clear();
  colliders.push({ x: 4, z: 4, r: 0.5 }); assert(p.blockedAt(4.7, 4)); colliders.length = 0;
  assert(p.blockedAt(70.1, 0));
});

test('cafezinho dá +30% de velocidade por 90 s e renova o tempo', () => {
  const p = player(); const previous = game.economy.stats.coffees || 0;
  p.drinkCoffee(); assert.equal(p.coffee, 90); assert.equal(game.economy.stats.coffees, previous + 1);
  p.keys = { KeyW: true, ShiftLeft: true }; run(p, 5); assert(Math.abs(p.speed - 14.04) < 0.02);
  p.drinkCoffee(); assert.equal(p.coffee, 90);
  p.coffee = 0.1; run(p, 0.2); assert.equal(p.coffee, 0);
});

test('pausa interrompe movimento e congela a duração do café', () => {
  const p = player(); p.keys = { KeyW: true, ShiftLeft: true }; run(p, 2);
  p.drinkCoffee(); run(p, 0.2);
  const coffee = p.coffee, z = p.position.z;
  p.update(1, false);
  assert.equal(p.speed, 0); assert.equal(p.position.z, z); assert.equal(p.coffee, coffee);
});

test('paredes construídas seguram o jogador', () => {
  const p = player(); p.blockedAt = Player.prototype.blockedAt;
  walls.push({ x: 3, z0: -5, z1: 5 });
  p.camera.position.set(1, 1.62, 0); p.camera.rotation.set(0, -Math.PI / 2, 0, 'YXZ');
  p.keys = { KeyW: true }; run(p, 2);
  assert(p.position.x < 3 - 0.3); walls.length = 0;
});

test('alavanca do controle anda, e meio inclinada anda mais devagar', () => {
  const full = player(); full.pad.y = -1; run(full, 2);
  const half = player(); half.pad.y = -0.5; run(half, 2);
  assert(Math.abs(full.speed - 4.3) < 0.05); assert(half.speed < full.speed * 0.6);
});

test('física se mantém consistente a 20, 60 e 144 FPS', () => {
  const speeds = [20, 60, 144].map((fps) => {
    const p = player(); p.keys = { KeyW: true, ShiftLeft: true }; run(p, 4, 1 / fps); return p.speed;
  });
  assert(Math.max(...speeds) - Math.min(...speeds) < 0.08);
});
