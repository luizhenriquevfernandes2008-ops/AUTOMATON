// Carrega modelos 3D (Kenney), texturas e o céu HDRI (Poly Haven).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { CELL } from './data.js';

const F = 'assets/models/factory/', S = 'assets/models/space/', N = 'assets/models/nature/', U = 'assets/models/furniture/';

// key: [arquivo, opções de normalização]
// fit: tamanho alvo do maior lado horizontal (m) | h: altura alvo (m) | scale: escala fixa
export const MODEL_DEFS = {
  belt: [F + 'conveyor-stripe-sides.glb', { scale: CELL }],
  beltCorner: [F + 'conveyor-stripe-corner.glb', { scale: CELL }],
  miner: [F + 'machine-connection-pipe.glb', { fit: CELL * 0.92 }],
  smelter: [F + 'machine-window.glb', { fit: CELL * 0.92 }],
  assembler: [F + 'machine-fortified.glb', { fit: CELL * 0.92 }],
  sorter: [F + 'scanner-high.glb', { fit: CELL * 0.95 }],
  seller: [F + 'hopper-high-square.glb', { fit: CELL * 0.9 }],
  chest: [F + 'box-large.glb', { fit: CELL * 0.8 }],
  computer: [F + 'screen-panel-wide.glb', { fit: CELL * 0.95 }],
  generator: [S + 'machine_generator.glb', { fit: CELL * 0.95 }],
  generatorBig: [S + 'machine_generatorLarge.glb', { fit: CELL * 0.98 }],
  pole: [S + 'pipe_supportHigh.glb', { h: 2.6 }],
  // máquinas novas
  lab: [S + 'hangar_roundGlass.glb', { fit: CELL * 0.98 }],
  hangar: [S + 'hangar_smallA.glb', { fit: CELL * 0.98 }],
  coalGen: [S + 'machine_barrelLarge.glb', { fit: CELL * 0.85 }],
  trash: [U + 'trashcan.glb', { h: 0.95 }],
  speakerBox: [U + 'speaker.glb', { h: 1.05 }],
  lamp: [F + 'warning-orange.glb', { h: 1.25 }],
  splitter: [F + 'conveyor-stripe-junction-t.glb', { scale: CELL }],
  merger: [F + 'conveyor-stripe-cross.glb', { scale: CELL }],
  scanArch: [F + 'scanner-low.glb', { fit: CELL * 0.95 }],
  supportHigh: [S + 'supports_high.glb', { h: 1.8 }],
  // plataforma de lançamento e foguete
  launchPad: [S + 'platform_large.glb', { fit: CELL * 3 }],
  tower: [S + 'supports_high.glb', { h: 3.2 }],
  rocketBase: [S + 'rocket_baseA.glb', { scale: 1.7 }],
  rocketFuel: [S + 'rocket_fuelA.glb', { scale: 1.7 }],
  rocketSides: [S + 'rocket_sidesA.glb', { scale: 1.7 }],
  rocketFins: [S + 'rocket_finsA.glb', { scale: 1.7 }],
  rocketTop: [S + 'rocket_topA.glb', { scale: 1.7 }],
  cog: [F + 'cog-a.glb', { fit: 0.32, center: true }],
  oopi: [F + 'oopi.glb', { h: 0.36 }],
  robotArm: [F + 'robot-arm-a.glb', { h: 0.9 }],
  screenWide: [F + 'screen-hanging-wide.glb', { scale: 2.4 }],
  warning: [F + 'warning-orange.glb', { h: 1.2 }],
  traffic: [F + 'warning-traffic.glb', { h: 1.4 }],
  pipe: [F + 'pipe-large-long.glb', { scale: 1.5 }],
  crane: [F + 'crane.glb', { scale: 1.6 }],
  floorTile: [F + 'floor-large.glb', { scale: CELL }],
  floorTileB: [F + 'top-large-checkerboard.glb', { scale: CELL }],
  // minérios (cristais do Space Kit, recoloridos)
  crystalA: [S + 'rock_crystalsLargeA.glb', { fit: CELL * 0.95 }],
  crystalB: [S + 'rock_crystalsLargeB.glb', { fit: CELL * 0.95 }],
  crystalSmall: [S + 'rock_crystals.glb', { fit: 0.3, center: true }],
  meteor: [S + 'meteor_detailed.glb', { fit: 0.3, center: true }],
  // decoração comprável
  d_plant: [U + 'pottedPlant.glb', { h: 1.1 }],
  d_flowers: [N + 'flower_yellowA.glb', { h: 0.55 }],
  d_tree: [N + 'tree_default.glb', { h: 4.2 }],
  d_bench: [U + 'bench.glb', { fit: CELL * 0.95 }],
  d_lamp: [U + 'lampRoundFloor.glb', { h: 1.8 }],
  d_sofa: [U + 'loungeSofa.glb', { fit: CELL * 0.98 }],
  d_coffee: [U + 'kitchenCoffeeMachine.glb', { h: 0.55 }],
  d_barrels: [S + 'barrels.glb', { fit: CELL * 0.85 }],
  d_dish: [S + 'satelliteDish_large.glb', { h: 2.2 }],
  d_statue: [F + 'oopi.glb', { h: 2.6 }],
  // cenário
  desk: [U + 'desk.glb', { fit: 1.45 }],
  chairDesk: [U + 'chairDesk.glb', { h: 1.0 }],
  pcScreen: [U + 'computerScreen.glb', { fit: 0.8 }],
  keyboard: [U + 'computerKeyboard.glb', { fit: 0.45 }],
  radio: [U + 'radio.glb', { fit: 0.45 }],
  rug: [U + 'rugRound.glb', { fit: 3.2 }],
  bar: [U + 'kitchenBar.glb', { fit: CELL }],
  barEnd: [U + 'kitchenBarEnd.glb', { fit: CELL }],
  bookcase: [U + 'bookcaseOpenLow.glb', { fit: 1.4 }],
  tableCoffee: [U + 'tableCoffee.glb', { fit: 1.1 }],
  plantSmall: [U + 'plantSmall1.glb', { h: 0.35 }],
  speaker: [U + 'speaker.glb', { h: 1.0 }],
  wireless: [S + 'machine_wireless.glb', { fit: 1.3 }],
  tent: [N + 'tent_detailedOpen.glb', { h: 2.2 }],
  campfire: [N + 'campfire_stones.glb', { fit: 1.2 }],
  logStack: [N + 'log_stack.glb', { fit: 1.6 }],
  sign: [N + 'sign.glb', { h: 1.2 }],
  fence: [N + 'fence_simple.glb', { scale: 3.2 }],
  stump: [N + 'stump_round.glb', { h: 0.5 }],
};

const TREES = ['tree_default', 'tree_oak', 'tree_detailed', 'tree_fat', 'tree_pineRoundA', 'tree_pineRoundB', 'tree_pineRoundC',
  'tree_pineTallA', 'tree_pineTallB', 'tree_simple', 'tree_small', 'tree_tall', 'tree_cone', 'tree_plateau',
  'tree_default_fall', 'tree_oak_fall', 'tree_fat_fall', 'tree_small_fall', 'tree_cone_fall'];
TREES.forEach((t) => { MODEL_DEFS[t] = [N + t + '.glb', { scale: 3.2 }]; });
const PROPS = ['rock_largeA', 'rock_largeB', 'rock_largeC', 'rock_smallA', 'rock_smallB', 'rock_smallC', 'rock_tallA', 'rock_tallB',
  'flower_purpleA', 'flower_purpleB', 'flower_redA', 'flower_redB', 'flower_yellowA', 'flower_yellowB', 'grass', 'grass_large',
  'grass_leafs', 'plant_bush', 'plant_bushLarge', 'plant_bushDetailed', 'mushroom_red', 'mushroom_tanGroup', 'log', 'stump_round'];
PROPS.forEach((t) => { MODEL_DEFS['n_' + t] = [N + t + '.glb', { scale: 3.2 }]; });
export const TREE_KEYS = TREES;
export const PROP_KEYS = PROPS.map((p) => 'n_' + p);

export const assets = {
  models: {},
  textures: {},
  envMap: null,
  skyTexture: null,
};

function normalize(root, opt) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  let s = 1;
  if (opt.scale) s = opt.scale;
  else if (opt.fit) s = opt.fit / Math.max(size.x, size.z);
  else if (opt.h) s = opt.h / size.y;
  const center = box.getCenter(new THREE.Vector3());
  const inner = new THREE.Group();
  inner.add(root);
  root.position.set(-center.x, opt.center ? -center.y : -box.min.y, -center.z);
  const outer = new THREE.Group();
  inner.scale.setScalar(s);
  outer.add(inner);
  outer.userData.size = size.multiplyScalar(s);
  root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (m.map) m.map.anisotropy = 4;
        if (m.metalness > 0.5) m.metalness = 0.3;
      });
    }
  });
  return outer;
}

export async function loadAll(renderer, onProgress) {
  const manager = new THREE.LoadingManager();
  const gltf = new GLTFLoader(manager);
  const texLoader = new THREE.TextureLoader(manager);
  const entries = Object.entries(MODEL_DEFS);
  const total = entries.length + 4;
  let done = 0;
  const tick = (label) => { done++; onProgress && onProgress(done / total, label); };

  const modelPromises = entries.map(([key, [url, opt]]) =>
    gltf.loadAsync(url).then((g) => {
      assets.models[key] = normalize(g.scene, opt);
      tick(url);
    }).catch((e) => { console.warn('Falhou modelo', url, e); assets.models[key] = new THREE.Group(); tick(url); })
  );

  const tex = (name, file, srgb, rep) => texLoader.loadAsync('assets/textures/' + file).then((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rep, rep);
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    assets.textures[name] = t;
    tick(file);
  });
  const texPromises = [
    tex('grass', 'grass_diffuse.jpg', true, 60), tex('grassN', 'grass_nor_gl.jpg', false, 60), tex('grassR', 'grass_rough.jpg', false, 60),
  ];

  const hdr = new RGBELoader(manager).loadAsync('assets/hdri/sky_2k.hdr').then((t) => {
    t.mapping = THREE.EquirectangularReflectionMapping;
    assets.skyTexture = t;
    const pm = new THREE.PMREMGenerator(renderer);
    assets.envMap = pm.fromEquirectangular(t).texture;
    pm.dispose();
    tick('céu');
  });

  await Promise.all([...modelPromises, ...texPromises, hdr]);
  buildProcedural();
}

// modelos montados por código (a partir das peças já carregadas)
const ELEV = 1.8;
function buildProcedural() {
  const M = assets.models;
  const wrap = (g, size) => { const o = new THREE.Group(); o.add(g); o.userData.size = size; o.traverse((x) => { if (x.isMesh) { x.castShadow = true; x.receiveShadow = true; } }); return o; };
  const beltClone = () => { const b = M.belt.clone(true); b.rotation.y = Math.PI / 2; return b; };
  // esteira elevada: esteira em cima de uma torre
  {
    const g = new THREE.Group();
    const b = beltClone(); b.position.y = ELEV; g.add(b);
    const s = M.supportHigh.clone(true); s.scale.multiplyScalar(0.55); g.add(s);
    M.beltHigh = wrap(g, new THREE.Vector3(CELL, ELEV + 0.6, CELL));
  }
  // rampas: esteira inclinada
  for (const up of [true, false]) {
    const g = new THREE.Group();
    const len = Math.hypot(CELL, ELEV);
    const ang = Math.atan2(ELEV, CELL);
    const holder = new THREE.Group();
    const b = beltClone(); b.scale.z = len / CELL; holder.add(b);
    holder.rotation.x = up ? ang : -ang;
    holder.position.y = ELEV / 2 - 0.2;
    g.add(holder);
    const s = M.supportHigh.clone(true); s.scale.multiplyScalar(0.45); s.position.z = up ? -CELL * 0.35 : CELL * 0.35; g.add(s);
    M[up ? 'rampUp' : 'rampDown'] = wrap(g, new THREE.Vector3(CELL, ELEV + 0.6, CELL));
  }
  // tela: painel com moldura em dois pés
  {
    const g = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x3a3560, roughness: 0.5 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(CELL * 0.95, 1.05, 0.12), frameMat);
    frame.position.y = 1.35;
    g.add(frame);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(CELL * 0.88, 0.95), new THREE.MeshBasicMaterial({ color: 0x0b1017 }));
    screen.name = 'screen';
    screen.position.set(0, 1.35, -0.065);
    screen.rotation.y = Math.PI;
    g.add(screen);
    for (const x of [-0.5, 0.5]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.1), frameMat);
      leg.position.set(x, 0.42, 0);
      g.add(leg);
    }
    M.display = wrap(g, new THREE.Vector3(CELL, 1.9, 0.3));
  }
  // painel solar
  {
    const g = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.9, 8), new THREE.MeshStandardMaterial({ color: 0x8a93a6 }));
    post.position.y = 0.45;
    g.add(post);
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = '#1b3d8f'; x.fillRect(0, 0, 128, 128);
    x.strokeStyle = '#8fb8ff'; x.lineWidth = 3;
    for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32, 128); x.stroke(); x.beginPath(); x.moveTo(0, i * 32); x.lineTo(128, i * 32); x.stroke(); }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(CELL * 0.92, 0.05, CELL * 0.72), [
      new THREE.MeshStandardMaterial({ color: 0xcfd6e2 }), new THREE.MeshStandardMaterial({ color: 0xcfd6e2 }),
      new THREE.MeshStandardMaterial({ map: t, roughness: 0.25, metalness: 0.4 }), new THREE.MeshStandardMaterial({ color: 0xcfd6e2 }),
      new THREE.MeshStandardMaterial({ color: 0xcfd6e2 }), new THREE.MeshStandardMaterial({ color: 0xcfd6e2 }),
    ]);
    panel.position.y = 0.95;
    panel.rotation.x = 0.45;
    g.add(panel);
    M.solar = wrap(g, new THREE.Vector3(CELL, 1.3, CELL));
  }
}

export function cloneModel(key) {
  const t = assets.models[key];
  if (!t) { console.warn('modelo não existe', key); return new THREE.Group(); }
  const c = t.clone(true);
  c.userData.size = t.userData.size;
  return c;
}

// recolore todos os materiais do objeto (clonando os materiais)
export function tint(obj, color, emissive = 0, emissiveIntensity = 0) {
  obj.traverse((o) => {
    if (o.isMesh) {
      o.material = o.material.clone();
      o.material.color = new THREE.Color(color);
      if (emissive) { o.material.emissive = new THREE.Color(emissive); o.material.emissiveIntensity = emissiveIntensity; }
    }
  });
  return obj;
}
