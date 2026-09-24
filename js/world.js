// Monta o cenário: céu, chão, floresta, veios de minério, escritório, loja e painel do mercado.
import * as THREE from 'three';
import { assets, cloneModel, tint, TREE_KEYS, PROP_KEYS } from './assets.js';
import { CELL, GRID_MIN, GRID_MAX, ORES, ITEMS, REGIONS } from './data.js';
import { grid, ores, key, cellCenter } from './machines.js';
import { Platform } from './machines2.js';
import { makeLabel } from './fx.js';
import { game } from './state.js';

export const colliders = []; // círculos {x, z, r}
export const interactables = []; // {obj, label, action}
export const PAD = { min: -12, max: 11 };

let seed = 1234;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

export const ORE_NODES = {
  ferro: [[-4, -4], [-5, -6], [-8, -3], [6, -14], [-16, 5], [-15, 7], [-3, -9],
    [12, -30], [15, -34], [-44, 10], [-10, 34], [8, 40]],
  cobre: [[5, -5], [7, -7], [10, 1], [-12, -12], [14, 10], [9, -10],
    [30, -10], [34, -5], [40, 5], [-18, 30]],
  quartzo: [[0, -16], [2, -18], [17, -15], [-19, -17],
    [-18, -42], [28, 12], [38, -18], [-30, -8], [-36, 4], [0, 44]],
  carvao: [[-20, -20], [19, -19],
    [-10, -30], [-6, -34], [5, -40], [44, -2], [-40, -14], [-28, 16], [15, 30]],
};

// ─── regiões compráveis ───
export function regionAt(x, z) {
  for (const [id, r] of Object.entries(REGIONS)) if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) return id;
  return null;
}
export function isBuildableCell(x, z) {
  if (x >= GRID_MIN && x <= GRID_MAX && z >= GRID_MIN && z <= GRID_MAX) return true;
  const r = regionAt(x, z);
  return !!r && game.economy.hasRegion(r);
}
// tira árvores/pedras da região comprada
export function clearRegion(id) {
  const list = game.regionDecor?.[id] || [];
  for (const d of list) {
    game.scene.remove(d.obj);
    if (d.col) { const i = colliders.indexOf(d.col); if (i >= 0) colliders.splice(i, 1); }
  }
  if (game.regionDecor) game.regionDecor[id] = [];
  const s = game.regionSigns?.[id];
  if (s) { game.scene.remove(s.group); const i = interactables.indexOf(s.inter); if (i >= 0) interactables.splice(i, 1); const ci = colliders.indexOf(s.col); if (ci >= 0) colliders.splice(ci, 1); }
}

function blockCell(x, z, info = {}) {
  grid.set(key(x, z), { static: true, solid: true, ...info });
}

function place(keyName, x, z, rotY = 0, parent = game.scene) {
  const m = cloneModel(keyName);
  m.position.set(x, 0, z);
  m.rotation.y = rotY;
  parent.add(m);
  return m;
}

export function buildWorld() {
  const scene = game.scene;
  scene.background = assets.skyTexture;
  scene.environment = assets.envMap;
  scene.environmentIntensity = 0.55;
  scene.backgroundIntensity = 0.95;
  scene.fog = new THREE.Fog(0xcfd9e6, 70, 260);

  // luzes
  const hemi = new THREE.HemisphereLight(0xcfe3ff, 0x5b6b3a, 0.7);
  scene.add(hemi);
  game.hemi = hemi;
  const sun = new THREE.DirectionalLight(0xffe4bf, 2.4);
  sun.position.set(40, 60, 25);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -45; sc.right = 45; sc.top = 45; sc.bottom = -45; sc.near = 1; sc.far = 160;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  game.sun = sun;

  // chão de grama
  const t = assets.textures;
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 600),
    new THREE.MeshStandardMaterial({ map: t.grass, normalMap: t.grassN, roughnessMap: t.grassR, color: 0x9fd46a, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'ground';
  scene.add(ground);
  game.ground = ground;

  // piso da fábrica: ladrilhos xadrez do Factory Kit (cada ladrilho = 2x2 células)
  const padSize = (PAD.max - PAD.min + 1) * CELL;
  const pad = { position: new THREE.Vector3((PAD.min + PAD.max + 1) / 2 * CELL, 0, (PAD.min + PAD.max + 1) / 2 * CELL) };
  const tpl = assets.models.floorTileB;
  tpl.updateMatrixWorld(true);
  let tileMesh = null;
  tpl.traverse((o) => { if (o.isMesh && !tileMesh) tileMesh = o; });
  if (tileMesh) {
    const n = (PAD.max - PAD.min + 1) / 2;
    const inst = new THREE.InstancedMesh(tileMesh.geometry, tileMesh.material, n * n);
    const local = tileMesh.matrixWorld.clone();
    const m4 = new THREE.Matrix4();
    let i = 0;
    for (let ix = 0; ix < n; ix++) for (let iz = 0; iz < n; iz++) {
      m4.makeTranslation((PAD.min + ix * 2 + 1) * CELL, 0.012, (PAD.min + iz * 2 + 1) * CELL).multiply(local);
      inst.setMatrixAt(i++, m4);
    }
    inst.receiveShadow = true;
    scene.add(inst);
  }
  // pátio do escritório (ladrilho liso)
  const tpl2 = assets.models.floorTile;
  tpl2.updateMatrixWorld(true);
  let tile2 = null;
  tpl2.traverse((o) => { if (o.isMesh && !tile2) tile2 = o; });
  if (tile2) {
    const cols = 9, rows = 3;
    const inst = new THREE.InstancedMesh(tile2.geometry, tile2.material, cols * rows);
    const local = tile2.matrixWorld.clone();
    const m4 = new THREE.Matrix4();
    let i = 0;
    for (let ix = 0; ix < cols; ix++) for (let iz = 0; iz < rows; iz++) {
      m4.makeTranslation((ix - (cols - 1) / 2) * CELL * 2, 0.011, (PAD.max + 1) * CELL + 1.8 + CELL + iz * CELL * 2).multiply(local);
      inst.setMatrixAt(i++, m4);
    }
    inst.receiveShadow = true;
    scene.add(inst);
  }
  // borda amarela/preta do piso
  const edge = new THREE.Mesh(new THREE.RingGeometry(padSize * 0.5 * Math.SQRT2, padSize * 0.5 * Math.SQRT2 + 0.35, 4, 1), new THREE.MeshStandardMaterial({ color: 0xf2a33a, roughness: 0.8 }));
  edge.rotation.x = -Math.PI / 2; edge.rotation.z = Math.PI / 4;
  edge.position.set(pad.position.x, 0.014, pad.position.z);
  edge.receiveShadow = true;
  scene.add(edge);

  // grade de construção (aparece quando segura algo)
  const size = (GRID_MAX - GRID_MIN + 1);
  const gc = document.createElement('canvas');
  gc.width = gc.height = 64;
  const g2 = gc.getContext('2d');
  g2.strokeStyle = 'rgba(255,255,255,0.55)';
  g2.lineWidth = 2;
  g2.strokeRect(1, 1, 62, 62);
  const gt = new THREE.CanvasTexture(gc);
  gt.wrapS = gt.wrapT = THREE.RepeatWrapping;
  gt.repeat.set(size, size);
  const gridMesh = new THREE.Mesh(new THREE.PlaneGeometry(size * CELL, size * CELL), new THREE.MeshBasicMaterial({ map: gt, transparent: true, opacity: 0.35, depthWrite: false }));
  gridMesh.rotation.x = -Math.PI / 2;
  gridMesh.position.set((GRID_MIN + GRID_MAX + 1) / 2 * CELL, 0.03, (GRID_MIN + GRID_MAX + 1) / 2 * CELL);
  gridMesh.visible = false;
  scene.add(gridMesh);
  game.gridMesh = gridMesh;

  buildOres();
  buildNature();
  buildOffice();
  buildShop();
  buildMarketBoard();
  buildRegionSigns();
  // plataforma de lançamento do Projeto Foguete
  game.platform = new Platform(0, -21);
  interactables.push({ obj: game.platform.obj, label: 'Plataforma de Lançamento: Projeto Foguete 🚀', action: 'platform' });
}

function buildRegionSigns() {
  game.regionSigns = {};
  const spots = { norte: [0, -37.5, 0], leste: [37.5, 0, -Math.PI / 2], oeste: [-37.5, 0, Math.PI / 2], sul: [8, 37.5, Math.PI] };
  for (const [id, r] of Object.entries(REGIONS)) {
    const [x, z, rot] = spots[id];
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    const s = cloneModel('sign');
    s.scale.multiplyScalar(1.6);
    g.add(s);
    const lab = makeLabel(`🔒 ${r.nome} · $ ${r.preco.toLocaleString('pt-BR')}`);
    lab.position.y = 3;
    lab.scale.set(3.2, 0.8, 1);
    g.add(lab);
    game.scene.add(g);
    const inter = { obj: g, label: `Comprar ${r.nome} ($ ${r.preco.toLocaleString('pt-BR')}, nível ${r.nivel})`, action: 'region:' + id };
    interactables.push(inter);
    const col = { x, z, r: 0.6 };
    colliders.push(col);
    game.regionSigns[id] = { group: g, inter, col };
  }
}

function buildOres() {
  for (const [type, cells] of Object.entries(ORE_NODES)) {
    const ore = ORES[type];
    cells.forEach(([x, z], i) => {
      ores.set(key(x, z), type);
      const c = cellCenter(x, z);
      const m = cloneModel(i % 2 ? 'crystalA' : 'crystalB');
      tint(m, ore.cor, ore.cor, 0.12);
      m.position.copy(c);
      m.rotation.y = rnd() * Math.PI * 2;
      m.scale.setScalar(0.95);
      m.userData.ore = type;
      game.scene.add(m);
      // manchinha no chão
      const spot = new THREE.Mesh(new THREE.CircleGeometry(CELL * 0.62, 20), new THREE.MeshStandardMaterial({ color: ore.cor, roughness: 1, transparent: true, opacity: 0.35, depthWrite: false }));
      spot.rotation.x = -Math.PI / 2;
      spot.position.set(c.x, 0.02, c.z);
      game.scene.add(spot);
      ores.set(key(x, z), type);
      game.oreModels = game.oreModels || new Map();
      game.oreModels.set(key(x, z), m);
    });
  }
}

export function setOreVisible(x, z, v) {
  const m = game.oreModels?.get(key(x, z));
  if (m) m.scale.setScalar(v ? 0.95 : 0.45);
}

function buildNature() {
  const half = (GRID_MAX + 1) * CELL; // ~36m
  game.regionDecor = {};
  const nearOre = (x, z) => { const c = { x: Math.floor(x / CELL), z: Math.floor(z / CELL) }; for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) if (ores.has(key(c.x + dx, c.z + dz))) return true; return false; };
  // árvore/pedra dentro de uma região comprável fica anotada pra sumir quando comprar
  const tag = (x, z, obj, col) => {
    const id = regionAt(Math.floor(x / CELL), Math.floor(z / CELL));
    if (id) (game.regionDecor[id] || (game.regionDecor[id] = [])).push({ obj, col });
  };
  const addTree = (x, z) => {
    const k = TREE_KEYS[Math.floor(rnd() * TREE_KEYS.length)];
    const m = place(k, x, z, rnd() * Math.PI * 2);
    m.scale.setScalar(1.1 + rnd() * 0.9);
    const col = { x, z, r: 0.7 };
    colliders.push(col);
    tag(x, z, m, col);
  };
  // anel de floresta
  let n = 0;
  while (n < 320) {
    const a = rnd() * Math.PI * 2;
    const r = half + 6 + Math.pow(rnd(), 0.8) * 90;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.max(Math.abs(x), Math.abs(z)) < half + 5) continue;
    if (nearOre(x, z)) continue;
    addTree(x, z);
    n++;
  }
  // pedras, flores e arbustos na borda
  for (let i = 0; i < 260; i++) {
    const a = rnd() * Math.PI * 2;
    const r = half + 1 + rnd() * 40;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.max(Math.abs(x), Math.abs(z)) < half + 1) continue;
    if (nearOre(x, z)) continue;
    const k = PROP_KEYS[Math.floor(rnd() * PROP_KEYS.length)];
    const m = place(k, x, z, rnd() * Math.PI * 2);
    const small = /flower|grass|mushroom/.test(k);
    m.scale.setScalar(small ? 0.6 + rnd() * 0.3 : 0.7 + rnd() * 0.7);
    let col = null;
    if (/rock_large|rock_tall|log|stump/.test(k)) { col = { x, z, r: 0.9 }; colliders.push(col); }
    tag(x, z, m, col);
  }
  // gramadinhos dentro da área (só na grama, fora do piso)
  for (let i = 0; i < 90; i++) {
    const x = (rnd() * 2 - 1) * half, z = (rnd() * 2 - 1) * half;
    const cx = Math.floor(x / CELL), cz = Math.floor(z / CELL);
    if (cx >= PAD.min - 1 && cx <= PAD.max + 1 && cz >= PAD.min - 1 && cz <= PAD.max + 1) continue;
    const k = ['n_grass', 'n_grass_large', 'n_flower_yellowA', 'n_flower_purpleA', 'n_flower_redA', 'n_grass_leafs'][Math.floor(rnd() * 6)];
    const m = place(k, x, z, rnd() * 6);
    m.scale.setScalar(0.5);
    m.userData.tuft = true;
    game.tufts = game.tufts || [];
    game.tufts.push(m);
  }
  // acampamento chill fora da área
  const cx = -half - 10, cz = 14;
  place('tent', cx, cz, Math.PI / 2.5); colliders.push({ x: cx, z: cz, r: 1.6 });
  place('campfire', cx + 4, cz + 1, 0); colliders.push({ x: cx + 4, z: cz + 1, r: 0.7 });
  place('logStack', cx + 3, cz + 4.5, 0.4); colliders.push({ x: cx + 3, z: cz + 4.5, r: 1 });
  const fire = new THREE.PointLight(0xff9a4a, 8, 10, 1.6);
  fire.position.set(cx + 4, 0.8, cz + 1);
  game.scene.add(fire);
  game.campfire = fire;
}

function buildOffice() {
  // cantinho do escritório ao sul do piso (onde o jogador nasce)
  const z0 = (PAD.max + 1) * CELL + 4.5; // um pouco pra fora do piso
  game.spawn = new THREE.Vector3(0, 0, z0 + 1.5);
  const rug = place('rug', 0, z0 + 1, 0);
  rug.position.y = 0.01;
  const desk = place('desk', -3.6, z0 + 2.4, Math.PI);
  colliders.push({ x: -3.6, z: z0 + 2.4, r: 0.9 });
  const deskTop = (desk.userData.size?.y || 0.76) + 0.0;
  const scr = place('pcScreen', -3.8, z0 + 2.55, Math.PI); scr.position.y = deskTop;
  const kb = place('keyboard', -3.6, z0 + 2.15, Math.PI); kb.position.y = deskTop;
  const radio = place('radio', -2.95, z0 + 2.5, Math.PI + 0.3); radio.position.y = deskTop;
  place('chairDesk', -3.6, z0 + 1.5, 0.2);
  interactables.push({ obj: radio, label: 'Rádio — trocar de música', action: 'radio' });
  const sofa = place('d_sofa', 3.2, z0 + 3.0, Math.PI);
  sofa.scale.setScalar(1.4);
  colliders.push({ x: 3.2, z: z0 + 3, r: 1.1 });
  place('tableCoffee', 3.2, z0 + 1.2, 0); colliders.push({ x: 3.2, z: z0 + 1.2, r: 0.5 });
  const coffee = place('d_coffee', 3.0, z0 + 1.2, Math.PI); coffee.position.y = 0.42;
  interactables.push({ obj: coffee, label: 'Cafeteira — tomar um cafezinho ☕', action: 'coffee' });
  place('d_plant', 5.2, z0 + 3.2, 0); colliders.push({ x: 5.2, z: z0 + 3.2, r: 0.4 });
  place('d_plant', -5.6, z0 + 3.0, 1); colliders.push({ x: -5.6, z: z0 + 3, r: 0.4 });
  const lamp = place('d_lamp', -1.4, z0 + 3.2, 0); colliders.push({ x: -1.4, z: z0 + 3.2, r: 0.3 });
  const l = new THREE.PointLight(0xffc98a, 5, 8, 1.5); l.position.set(-1.4, 1.7, z0 + 3.2); game.scene.add(l);
  void lamp;
  place('bookcase', -6.4, z0 + 4.2, 0); colliders.push({ x: -6.4, z: z0 + 4.2, r: 0.7 });
  place('plantSmall', -6.4, z0 + 4.4, 0).position.y = 0.72;
  const sign = place('sign', 6.8, z0 - 1.2, -0.5);
  void sign;
}

function textCanvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.userData = { canvas: c };
  return t;
}

function buildShop() {
  // quiosque da loja: balcão + antena + placa
  const cx = 8.5, cz = (PAD.max + 1) * CELL + 3.2;
  const g = new THREE.Group();
  g.position.set(cx, 0, cz);
  game.scene.add(g);
  const bar = cloneModel('bar'); bar.scale.setScalar(1.35); bar.position.set(-1.0, 0, 0); g.add(bar);
  const bar2 = cloneModel('bar'); bar2.scale.setScalar(1.35); bar2.position.set(1.0, 0, 0); g.add(bar2);
  const w = cloneModel('wireless'); w.position.set(0, 0, 1.1); g.add(w);
  const sp1 = cloneModel('traffic'); sp1.position.set(-2.2, 0, 0.2); g.add(sp1);
  const sp2 = cloneModel('traffic'); sp2.position.set(2.2, 0, 0.2); g.add(sp2);
  // placa "LOJA"
  const tex = textCanvasTexture(512, 160, (c, W, H) => {
    c.fillStyle = '#0f141c'; c.beginPath(); c.roundRect(4, 4, W - 8, H - 8, 30); c.fill();
    c.strokeStyle = '#ffb020'; c.lineWidth = 10; c.stroke();
    c.fillStyle = '#ffd35a'; c.font = '600 84px "Chakra Petch", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('🛒 LOJA', W / 2, H / 2 + 4);
  });
  const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.94), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, side: THREE.DoubleSide }));
  signMesh.position.set(0, 2.9, 0.2);
  g.add(signMesh);
  for (const sx of [-1.3, 1.3]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8), new THREE.MeshStandardMaterial({ color: 0x4a4570 }));
    post.position.set(sx, 1.25, 0.25);
    g.add(post);
  }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  colliders.push({ x: cx - 1, z: cz, r: 1 }, { x: cx + 1, z: cz, r: 1 }, { x: cx, z: cz + 1.1, r: 0.7 });
  interactables.push({ obj: g, label: 'Loja — comprar máquinas e melhorias', action: 'shop' });
  game.shopKiosk = g;
}

function buildMarketBoard() {
  const cx = -9.5, cz = (PAD.max + 1) * CELL + 3.2;
  const g = new THREE.Group();
  g.position.set(cx, 0, cz);
  game.scene.add(g);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.3, 0.15), new THREE.MeshStandardMaterial({ color: 0x3a3560, roughness: 0.6 }));
  frame.position.set(0, 2.1, 0);
  frame.castShadow = true;
  g.add(frame);
  for (const sx of [-1.5, 1.5]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.2, 0.14), new THREE.MeshStandardMaterial({ color: 0x2b2750 }));
    post.position.set(sx, 0.6, 0);
    post.castShadow = true;
    g.add(post);
  }
  const tex = textCanvasTexture(640, 400, () => { });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.12), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  screen.position.set(0, 2.1, 0.08);
  g.add(screen);
  colliders.push({ x: cx - 1.5, z: cz, r: 0.3 }, { x: cx + 1.5, z: cz, r: 0.3 });
  interactables.push({ obj: g, label: 'Painel do Mercado — ver preços', action: 'market' });
  game.marketBoard = { tex, t: 0 };
}

export function updateMarketBoard(dt) {
  const mb = game.marketBoard;
  if (!mb) return;
  mb.t -= dt;
  if (mb.t > 0) return;
  mb.t = 2;
  const c = mb.tex.userData.canvas;
  const g = c.getContext('2d');
  const W = c.width, H = c.height;
  g.fillStyle = '#0b1017'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#ffd35a'; g.font = '600 34px "Chakra Petch", sans-serif'; g.textBaseline = 'middle';
  g.fillText('📈 Mercado', 20, 32);
  g.font = '400 18px "Chakra Petch", sans-serif'; g.fillStyle = '#9d98c8';
  const eco = game.economy;
  const all = Object.keys(ITEMS);
  // itens da feira primeiro; o painel vai passando as páginas sozinho
  const fair = eco.fair ? all.filter((k) => eco.onFair(k)) : [];
  const ordered = [...fair, ...all.filter((k) => !fair.includes(k))];
  const per = 11, pages = Math.ceil(ordered.length / per);
  mb.n = (mb.n || 0) + 1;
  const page = Math.floor(mb.n / 3) % pages;
  const items = ordered.slice(page * per, page * per + per);
  g.textAlign = 'right'; g.fillText(`${eco.fair ? '🎪 FEIRA! · ' : ''}pág. ${page + 1}/${pages}`, W - 20, 34); g.textAlign = 'left';
  items.forEach((k, i) => {
    const y = 78 + i * 29;
    const p = eco.price(k), tr = eco.trend(k);
    const locked = false;
    g.fillStyle = i % 2 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)';
    g.fillRect(12, y - 14, W - 24, 28);
    g.fillStyle = locked ? '#666' : '#efeaff';
    g.font = '500 20px "Chakra Petch", sans-serif';
    g.fillText((eco.onFair(k) ? '🎪 ' : '') + ITEMS[k].nome, 24, y);
    g.fillStyle = tr > 0.05 ? '#6dff9a' : tr < -0.05 ? '#ff7a8a' : '#cfcfe8';
    g.textAlign = 'right';
    g.fillText(`${tr > 0.05 ? '▲' : tr < -0.05 ? '▼' : '•'} $ ${p.toFixed(1)}`, W - 24, y);
    g.textAlign = 'left';
  });
  mb.tex.needsUpdate = true;
}

export function isPadCell(x, z) { return x >= PAD.min && x <= PAD.max && z >= PAD.min && z <= PAD.max; }
export { blockCell };
