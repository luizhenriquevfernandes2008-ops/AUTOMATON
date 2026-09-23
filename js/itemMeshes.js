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
    case 'carvao':
      add(new THREE.DodecahedronGeometry(0.15, 0), mat(0x24242c, { flat: true, r: 0.4, m: 0.3 }), 0, 0.13, 0);
      add(new THREE.DodecahedronGeometry(0.09, 0), mat(0x34343f, { flat: true, r: 0.4, m: 0.3 }), 0.1, 0.1, 0.06);
      break;
    case 'escoria': {
      const m = add(new THREE.DodecahedronGeometry(0.15, 0), mat(0x6e5f52, { flat: true, r: 1 }), 0, 0.09, 0);
      m.scale.set(1.2, 0.6, 1);
      add(new THREE.OctahedronGeometry(0.05, 0), mat(0xff7a3a, { flat: true, e: 0xaa3300, ei: 0.5 }), 0.06, 0.15, 0.02);
      break;
    }
    case 'tijolo':
      add(new THREE.BoxGeometry(0.36, 0.15, 0.18), mat(0xc0643c, { r: 0.9 }), 0, 0.08, 0);
      break;
    case 'aco':
      add(new THREE.BoxGeometry(0.38, 0.14, 0.2), mat(0x8d9ab0, { m: 0.85, r: 0.25 }), 0, 0.08, 0);
      add(new THREE.BoxGeometry(0.39, 0.03, 0.21), mat(0x3a4a66, { m: 0.8, r: 0.3 }), 0, 0.12, 0);
      break;
    case 'viga': {
      const m = mat(0x6f7d96, { m: 0.8, r: 0.3 });
      add(new THREE.BoxGeometry(0.46, 0.035, 0.2), m, 0, 0.02, 0);
      add(new THREE.BoxGeometry(0.46, 0.035, 0.2), m, 0, 0.2, 0);
      add(new THREE.BoxGeometry(0.46, 0.18, 0.04), m, 0, 0.11, 0);
      break;
    }
    case 'processador':
      add(new THREE.BoxGeometry(0.34, 0.06, 0.34), mat(0x1a3f8a, { r: 0.4 }), 0, 0.05, 0);
      add(new THREE.BoxGeometry(0.2, 0.04, 0.2), mat(0xffd35a, { m: 0.9, r: 0.2 }), 0, 0.1, 0);
      add(new THREE.BoxGeometry(0.1, 0.02, 0.1), mat(0x6cf5ff, { e: 0x3ab8ff, ei: 0.8 }), 0, 0.125, 0);
      break;
    case 'modulo_foguete': {
      add(new THREE.CylinderGeometry(0.13, 0.13, 0.32, 16), mat(0xf0f0f5, { r: 0.4 }), 0, 0.17, 0);
      add(new THREE.CylinderGeometry(0.135, 0.135, 0.05, 16), mat(0xffa640, { r: 0.5 }), 0, 0.2, 0);
      add(new THREE.ConeGeometry(0.13, 0.16, 16), mat(0xff5a6e, { r: 0.5 }), 0, 0.41, 0);
      break;
    }
    case 'satelite': {
      add(new THREE.BoxGeometry(0.16, 0.16, 0.16), mat(0xffd35a, { m: 0.8, r: 0.3 }), 0, 0.12, 0);
      const p = mat(0x2a55c9, { m: 0.4, r: 0.3, e: 0x1a3399, ei: 0.3 });
      add(new THREE.BoxGeometry(0.2, 0.02, 0.12), p, 0.19, 0.12, 0);
      add(new THREE.BoxGeometry(0.2, 0.02, 0.12), p, -0.19, 0.12, 0);
      add(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 6), mat(0xdddddd), 0, 0.25, 0);
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
