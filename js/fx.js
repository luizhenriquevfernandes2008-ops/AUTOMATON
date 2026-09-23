// Partículas e textos flutuantes simples.
import * as THREE from 'three';
import { game } from './state.js';

let softTex = null;
function getSoftTex() {
  if (softTex) return softTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.4, 'rgba(255,255,255,0.6)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  softTex = new THREE.CanvasTexture(c);
  softTex.colorSpace = THREE.SRGBColorSpace;
  return softTex;
}

const particles = [];
const pool = [];

export function puff(pos, opts = {}) {
  const n = opts.count ?? 6;
  for (let i = 0; i < n; i++) {
    let s = pool.pop();
    if (!s) {
      s = new THREE.Sprite(new THREE.SpriteMaterial({ map: getSoftTex(), transparent: true, depthWrite: false }));
    }
    s.material.color.set(opts.color ?? 0xffffff);
    s.material.opacity = opts.opacity ?? 0.7;
    s.material.blending = opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    s.position.set(pos.x + (Math.random() - 0.5) * (opts.spread ?? 0.4), pos.y, pos.z + (Math.random() - 0.5) * (opts.spread ?? 0.4));
    const size = (opts.size ?? 0.3) * (0.7 + Math.random() * 0.6);
    s.scale.setScalar(size);
    s.visible = true;
    game.scene.add(s);
    particles.push({
      s, life: 0, max: (opts.life ?? 1.2) * (0.7 + Math.random() * 0.6), size, grow: opts.grow ?? 1.5,
      v: new THREE.Vector3((Math.random() - 0.5) * (opts.speed ?? 0.4), (opts.up ?? 0.8) * (0.6 + Math.random() * 0.8), (Math.random() - 0.5) * (opts.speed ?? 0.4)),
      g: opts.gravity ?? 0, o0: s.material.opacity,
    });
  }
}

// texto que sobe e some (ex: "+$12")
const floaters = [];
export function floatText(pos, text, color = '#ffd35a') {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.font = '600 40px "Chakra Petch", sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.lineWidth = 8;
  g.strokeStyle = 'rgba(30,20,50,0.85)';
  g.strokeText(text, 128, 34);
  g.fillStyle = color;
  g.fillText(text, 128, 34);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false }));
  s.renderOrder = 999;
  s.scale.set(1.6, 0.4, 1);
  s.position.copy(pos);
  game.scene.add(s);
  floaters.push({ s, life: 0 });
}

export function updateFx(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life += dt;
    const k = p.life / p.max;
    if (k >= 1) {
      p.s.visible = false;
      game.scene.remove(p.s);
      pool.push(p.s);
      particles.splice(i, 1);
      continue;
    }
    p.v.y -= p.g * dt;
    p.s.position.addScaledVector(p.v, dt);
    p.s.scale.setScalar(p.size * (1 + k * p.grow));
    p.s.material.opacity = p.o0 * (1 - k);
  }
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i];
    f.life += dt;
    f.s.position.y += dt * 0.7;
    f.s.material.opacity = Math.min(1, 2.5 - f.life * 1.4);
    if (f.life > 1.8) {
      game.scene.remove(f.s);
      f.s.material.map.dispose();
      f.s.material.dispose();
      floaters.splice(i, 1);
    }
  }
}

// placa com nome em cima das máquinas
export function makeLabel(text) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
  s.scale.set(1.3, 0.325, 1);
  s.userData.canvas = c;
  setLabel(s, text);
  return s;
}
export function setLabel(sprite, text) {
  const c = sprite.userData.canvas;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 256, 64);
  g.font = '500 30px "Chakra Petch", sans-serif';
  const w = Math.min(248, g.measureText(text).width + 30);
  g.fillStyle = 'rgba(10,14,20,0.82)';
  const x = 128 - w / 2;
  g.beginPath();
  g.roundRect(x, 10, w, 44, 22);
  g.fill();
  g.fillStyle = '#fff4e0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 128, 33);
  sprite.material.map.needsUpdate = true;
}
