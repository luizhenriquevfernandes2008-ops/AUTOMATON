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
