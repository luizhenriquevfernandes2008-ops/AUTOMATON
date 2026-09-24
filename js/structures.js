// Construção: paredes, janelas, portas, cercas (nas bordas das células), pisos e tetos,
// materiais (madeira, tijolo, concreto, vidro, aço), pintura e quadros pendurados nas paredes.
import * as THREE from 'three';
import { game } from './state.js';
import { CELL, PIECES, MATERIALS, PAINTS, PAINTINGS } from './data.js';
import { cloneModel } from './assets.js';

export const WALL_H = 2.58;           // altura das paredes (e do teto)
const THICK = 0.09;                   // meia espessura usada na colisão
export const structures = new Map();  // chave -> peça
export const structRoot = new THREE.Group();
structRoot.name = 'estruturas';

// ─── chaves ───
// borda norte da célula (x,z): "e:x,z,n" · borda oeste: "e:x,z,w" · piso "f:x,z" · teto "c:x,z" · quadro "p:<borda>:<lado>"
export function edgeKey(x, z, o) { return `e:${x},${z},${o}`; }
export function parseEdge(k) {
  const m = /^e:(-?\d+),(-?\d+),([nw])$/.exec(k);
  return m ? { x: +m[1], z: +m[2], o: m[3] } : null;
}
// borda mais perto de um ponto no chão
export function nearestEdge(px, pz) {
  const x = Math.floor(px / CELL), z = Math.floor(pz / CELL);
  const u = px / CELL - x, v = pz / CELL - z;
  const d = [v, 1 - v, u, 1 - u];
  const i = d.indexOf(Math.min(...d));
  if (i === 0) return { x, z, o: 'n' };
  if (i === 1) return { x, z: z + 1, o: 'n' };
  if (i === 2) return { x, z, o: 'w' };
  return { x: x + 1, z, o: 'w' };
}
// segmento da borda em metros
export function edgeSegment(e) {
  const ax = e.x * CELL, az = e.z * CELL;
  return e.o === 'n' ? { ax, az, bx: ax + CELL, bz: az } : { ax, az, bx: ax, bz: az + CELL };
}
// células dos dois lados da borda
export function edgeCells(e) {
  return e.o === 'n' ? [[e.x, e.z - 1], [e.x, e.z]] : [[e.x - 1, e.z], [e.x, e.z]];
}
function segDist(px, pz, s) {
  const dx = s.bx - s.ax, dz = s.bz - s.az;
  const L = dx * dx + dz * dz;
  let t = L ? ((px - s.ax) * dx + (pz - s.az) * dz) / L : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = s.ax + dx * t, cz = s.az + dz * t;
  return Math.hypot(px - cx, pz - cz);
}

// ─── materiais (cacheados pra não criar um por peça) ───
const matCache = new Map();
function bodyMaterial(orig, matId, paint) {
  const k = `${orig.uuid}|${matId}|${paint ?? ''}`;
  let m = matCache.get(k);
  if (m) return m;
  const M = MATERIALS[matId];
  m = orig.clone();
  const col = paint != null && !M.vidro ? paint : M.cor;
  m.color = new THREE.Color(col);
  m.roughness = M.rough;
  m.metalness = M.metal || 0;
  if (M.vidro) { m.transparent = true; m.opacity = 0.32; m.depthWrite = false; }
  matCache.set(k, m);
  return m;
}
// pinta o corpo da peça (a parte "_defaultMat" das paredes, ou a madeira do piso/cerca)
function applyLook(obj, matId, paint) {
  let bodyName = null;
  obj.traverse((o) => { if (o.isMesh && o.material.name === '_defaultMat') bodyName = '_defaultMat'; });
  if (!bodyName) bodyName = 'wood';
  obj.traverse((o) => {
    if (!o.isMesh) return;
    if (!o.userData.origMat) o.userData.origMat = o.material;
    const orig = o.userData.origMat;
    if (orig.name === bodyName) o.material = bodyMaterial(orig, matId, paint);
    else if (MATERIALS[matId].vidro && orig.name !== 'glass') o.material = bodyMaterial(orig, matId, null);
    else o.material = orig;
    o.castShadow = !MATERIALS[matId].vidro;
  });
}

// ─── custo ───
export function pieceCost(pieceId, matId) {
  const p = PIECES[pieceId];
  const mat = p.fixo || matId;
  const c = { [MATERIALS[mat].item]: p.custo };
  if (p.vidro) c.vidro = (c.vidro || 0) + p.vidro;
  return c;
}
export function costText(cost) {
  return Object.entries(cost).map(([k, n]) => `${n}× ${MATERIALS[Object.keys(MATERIALS).find((m) => MATERIALS[m].item === k)]?.nome || k}`).join(' + ');
}

// ─── objeto 3D de uma peça ───
export function buildPieceObject(pieceId, matId, paint, keyInfo) {
  const p = PIECES[pieceId];
  const mat = p.fixo || matId;
  const holder = new THREE.Group();
  const m = cloneModel(p.model);
  holder.add(m);
  applyLook(m, mat, paint);
  placeObject(holder, pieceId, keyInfo);
  return holder;
}
function placeObject(holder, pieceId, info) {
  const p = PIECES[pieceId];
  if (p.borda) {
    const s = edgeSegment(info);
    holder.position.set((s.ax + s.bx) / 2, 0, (s.az + s.bz) / 2);
    holder.rotation.y = info.o === 'n' ? 0 : Math.PI / 2;
  } else {
    holder.position.set((info.x + 0.5) * CELL, p.alto ? WALL_H - 0.03 : 0.006, (info.z + 0.5) * CELL);
  }
}

// ─── colocar / tirar ───
export function addStructure(d) {
  const p = PIECES[d.piece];
  if (!p) return null;
  const info = p.borda ? parseEdge(d.key) : { x: d.x, z: d.z };
  if (!info) return null;
  const obj = buildPieceObject(d.piece, d.mat, d.paint, info);
  const s = { key: d.key, kind: 'peca', piece: d.piece, mat: p.fixo || d.mat, paint: d.paint ?? null, x: info.x, z: info.z, o: info.o, obj };
  obj.userData.struct = s;
  obj.traverse((o) => { o.userData.struct = s; });
  structRoot.add(obj);
  structures.set(d.key, s);
  game.emit('structures');
  return s;
}
export function removeStructure(key) {
  const s = structures.get(key);
  if (!s) return null;
  structRoot.remove(s.obj);
  structures.delete(key);
  // quadros presos nessa parede caem junto (voltam pro inventário)
  if (s.kind === 'peca') for (const side of [1, -1]) {
    const q = structures.get(`p:${key}:${side}`);
    if (q) { removeStructure(q.key); game.economy.addItem(q.painting); }
  }
  game.emit('structures');
  return s;
}
export function paintStructure(s, paint) {
  s.paint = paint;
  applyLook(s.obj.children[0], s.mat, paint);
}

// ─── quadros ───
const texCache = {};
function paintingTexture(id) {
  if (texCache[id]) return texCache[id];
  const t = new THREE.TextureLoader().load(`assets/paintings/${PAINTINGS[id].img}.jpg`);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  texCache[id] = t;
  return t;
}
const frameMat = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.6 });
const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4a84a, roughness: 0.35, metalness: 0.6 });
export function buildPaintingObject(id) {
  const P = PAINTINGS[id];
  const maxS = 1.05;
  const asp = P.w / P.h;
  const w = asp >= 1 ? maxS : maxS * asp, h = asp >= 1 ? maxS / asp : maxS;
  const g = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.14, h + 0.14, 0.05), frameMat);
  frame.castShadow = true;
  g.add(frame);
  const inner = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, h + 0.04, 0.052), goldMat);
  g.add(inner);
  const art = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: paintingTexture(id), roughness: 0.7 }));
  art.position.z = 0.028;
  g.add(art);
  return g;
}
export function addPainting(d) {
  const [, edge, side] = /^p:(e:[^:]+):(-?1)$/.exec(d.key) || [];
  const wall = structures.get(edge);
  if (!wall || !PAINTINGS[d.painting]) return null;
  const obj = buildPaintingObject(d.painting);
  const seg = edgeSegment(wall);
  const sd = +side;
  const nx = wall.o === 'n' ? 0 : sd, nz = wall.o === 'n' ? sd : 0;
  obj.position.set((seg.ax + seg.bx) / 2 + nx * 0.075, 1.55, (seg.az + seg.bz) / 2 + nz * 0.075);
  obj.rotation.y = Math.atan2(nx, nz);
  const s = { key: d.key, kind: 'quadro', painting: d.painting, edge, side: sd, obj };
  obj.userData.struct = s;
  obj.traverse((o) => { o.userData.struct = s; });
  structRoot.add(obj);
  structures.set(d.key, s);
  game.emit('structures');
  return s;
}

// ─── consultas ───
export function wallAt(key) { const s = structures.get(key); return s && s.kind === 'peca' && PIECES[s.piece].borda ? s : null; }
export function ceilingAt(x, z) { return structures.get(`c:${x},${z}`) || null; }
export function floorAt(x, z) { return structures.get(`f:${x},${z}`) || null; }
export function countPieces() { let n = 0; for (const s of structures.values()) if (s.kind === 'peca') n++; return n; }
export function countPaintings() { let n = 0; for (const s of structures.values()) if (s.kind === 'quadro') n++; return n; }

// o jogador bate nas paredes (portas deixam passar pelo meio)
export function structBlocked(px, pz, radius) {
  const cx = Math.floor(px / CELL), cz = Math.floor(pz / CELL);
  for (let dx = -1; dx <= 2; dx++) for (let dz = -1; dz <= 2; dz++) {
    for (const o of ['n', 'w']) {
      const s = structures.get(edgeKey(cx + dx, cz + dz, o));
      if (!s || s.kind !== 'peca') continue;
      const p = PIECES[s.piece];
      const seg = edgeSegment(s);
      if (p.passa) {
        // só os batentes da porta seguram
        const k = 0.28;
        const a = { ax: seg.ax, az: seg.az, bx: seg.ax + (seg.bx - seg.ax) * k, bz: seg.az + (seg.bz - seg.az) * k };
        const b = { ax: seg.bx - (seg.bx - seg.ax) * k, az: seg.bz - (seg.bz - seg.az) * k, bx: seg.bx, bz: seg.bz };
        if (segDist(px, pz, a) < radius + THICK || segDist(px, pz, b) < radius + THICK) return true;
      } else if (segDist(px, pz, seg) < radius + THICK) return true;
    }
  }
  return false;
}
// distância de um ponto até uma borda (pra não construir parede em cima de alguém/algo)
export function edgeDistance(e, px, pz) { return segDist(px, pz, edgeSegment(e)); }

// ─── piso de madeira faz passo de madeira ───
export function floorMaterialAt(px, pz) {
  const f = floorAt(Math.floor(px / CELL), Math.floor(pz / CELL));
  return f ? f.mat : null;
}

// ─── salvar ───
export function serializeStructures() {
  const out = [];
  for (const s of structures.values()) {
    if (s.kind === 'peca') out.push({ key: s.key, piece: s.piece, mat: s.mat, paint: s.paint, x: s.x, z: s.z });
  }
  for (const s of structures.values()) if (s.kind === 'quadro') out.push({ key: s.key, painting: s.painting });
  return out;
}
export function loadStructures(list) {
  for (const d of list || []) {
    try { if (d.painting) addPainting(d); else addStructure(d); } catch (e) { console.warn('estrutura não carregou', d, e); }
  }
}
export function paintName(c) { return (PAINTS.find((p) => p.cor === c) || PAINTS[0]).nome; }
