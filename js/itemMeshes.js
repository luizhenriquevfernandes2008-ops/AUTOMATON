// Visual dos itens que andam nas esteiras.
import * as THREE from 'three';
import { cloneModel } from './assets.js';

const cache = {};
const pools = {};

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: opts.r ?? 0.6, metalness: opts.m ?? 0.1, flatShading: opts.flat ?? false, emissive: opts.e ?? 0x000000, emissiveIntensity: opts.ei ?? 0, transparent: !!opts.t, opacity: opts.t ?? 1 });
}

function build(type) {
  const g = new THREE.Group();
  const add = (geo, m, x = 0, y = 0, z = 0) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = true; g.add(me); return me; };
  switch (type) {
    case 'minerio_ferro':
      add(new THREE.DodecahedronGeometry(0.16, 0), mat(0x7f8fa8, { flat: true, r: 0.9 }), 0, 0.14, 0);
      add(new THREE.OctahedronGeometry(0.07, 0), mat(0xb8d4ff, { flat: true, e: 0x5577aa, ei: 0.4 }), 0.08, 0.24, 0.04);
      break;
    case 'minerio_cobre':
      add(new THREE.DodecahedronGeometry(0.16, 0), mat(0x8a5a3c, { flat: true, r: 0.9 }), 0, 0.14, 0);
      add(new THREE.OctahedronGeometry(0.07, 0), mat(0xff9a52, { flat: true, e: 0xaa5522, ei: 0.4 }), -0.07, 0.24, 0.03);
      break;
    case 'quartzo': {
      const m = mat(0xf6d2ff, { flat: true, r: 0.2, e: 0xb070d0, ei: 0.35, t: 0.9 });
      add(new THREE.OctahedronGeometry(0.15, 0), m, 0, 0.18, 0).scale.set(0.7, 1.4, 0.7);
      add(new THREE.OctahedronGeometry(0.09, 0), m, 0.09, 0.1, 0.05).scale.set(0.7, 1.3, 0.7);
      break;
    }
    case 'lingote_ferro':
    case 'lingote_cobre': {
      const m = type === 'lingote_ferro' ? mat(0xd5dce8, { m: 0.7, r: 0.3 }) : mat(0xe98a4c, { m: 0.7, r: 0.3 });
      const geo = new THREE.BoxGeometry(0.36, 0.13, 0.18);
      add(geo, m, 0, 0.08, 0);
      break;
    }
    case 'silicio':
      add(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 20), mat(0x34407a, { m: 0.6, r: 0.2, e: 0x2a3a90, ei: 0.3 }), 0, 0.04, 0);
      add(new THREE.CylinderGeometry(0.12, 0.12, 0.052, 4), mat(0x8fb0ff, { m: 0.5, r: 0.1, e: 0x6688ff, ei: 0.4 }), 0, 0.045, 0);
      break;
    case 'engrenagem': {
      const c = cloneModel('cog');
      c.position.y = 0.1;
      g.add(c);
      break;
    }
    case 'fio': {
      const m = mat(0xf0994f, { m: 0.7, r: 0.3 });
      const t = add(new THREE.TorusGeometry(0.13, 0.045, 8, 18), m, 0, 0.1, 0);
      t.rotation.x = Math.PI / 2;
      const t2 = add(new THREE.TorusGeometry(0.13, 0.045, 8, 18), m, 0, 0.18, 0);
      t2.rotation.x = Math.PI / 2;
      break;
    }
    case 'chip': {
      add(new THREE.BoxGeometry(0.34, 0.05, 0.34), mat(0x2e9e62, { r: 0.5 }), 0, 0.05, 0);
      add(new THREE.BoxGeometry(0.16, 0.05, 0.16), mat(0x1c2230, { r: 0.4 }), 0, 0.09, 0);
      const pin = mat(0xffd35a, { m: 0.9, r: 0.2 });
      const pg = new THREE.BoxGeometry(0.03, 0.02, 0.07);
      for (let i = -2; i <= 2; i++) { add(pg, pin, i * 0.06, 0.08, 0.13); add(pg, pin, i * 0.06, 0.08, -0.13); }
      break;
    }
    case 'motor': {
      const body = add(new THREE.CylinderGeometry(0.15, 0.15, 0.3, 16), mat(0x6f79ad, { m: 0.5, r: 0.4 }), 0, 0.16, 0);
      body.rotation.z = Math.PI / 2;
      const ring = add(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 16), mat(0xf29a3a, { r: 0.5 }), 0, 0.16, 0);
      ring.rotation.z = Math.PI / 2;
      const shaft = add(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8), mat(0xdddddd, { m: 0.9, r: 0.2 }), 0.21, 0.16, 0);
      shaft.rotation.z = Math.PI / 2;
      break;
    }
    case 'robozinho': {
      const c = cloneModel('oopi');
      g.add(c);
      break;
    }
    default:
      add(new THREE.BoxGeometry(0.25, 0.25, 0.25), mat(0xff00ff), 0, 0.13, 0);
  }
  return g;
}

export function takeItemMesh(type) {
  const pool = pools[type] || (pools[type] = []);
  if (pool.length) { const m = pool.pop(); m.visible = true; return m; }
  if (!cache[type]) cache[type] = build(type);
  const m = cache[type].clone(true);
  m.userData.itemType = type;
  return m;
}

export function releaseItemMesh(mesh) {
  if (!mesh) return;
  if (mesh.parent) mesh.parent.remove(mesh);
  const type = mesh.userData.itemType;
  (pools[type] || (pools[type] = [])).push(mesh);
}

export function itemPreviewObject(type) {
  if (!cache[type]) cache[type] = build(type);
  return cache[type].clone(true);
}
