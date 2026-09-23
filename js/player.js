// Controle em primeira pessoa: WASD, correr, pular, colisão simples com máquinas e cenário.
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { game } from './state.js';
import { grid, key, worldToCell } from './machines.js';
import { colliders, isPadCell } from './world.js';
import { CELL } from './data.js';
import { audio } from './audio.js';

const EYE = 1.62, RADIUS = 0.32, WORLD_LIMIT = 70;

export class Player {
  constructor(camera, dom) {
    this.camera = camera;
    this.controls = new PointerLockControls(camera, dom);
    this.controls.pointerSpeed = 0.8;
    this.vel = new THREE.Vector3();
    this.keys = {};
    this.onGround = true;
    this.y = 0;
    this.stepTimer = 0;
    this.coffee = 0;
    this.bob = 0;
    addEventListener('keydown', (e) => { this.keys[e.code] = true; });
    addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    addEventListener('blur', () => { this.keys = {}; });
  }

  get position() { return this.camera.position; }

  teleport(v, lookYaw = 0) {
    this.camera.position.set(v.x, EYE, v.z);
    this.camera.rotation.set(0, lookYaw, 0, 'YXZ');
    this.y = 0;
  }

  blockedAt(x, z) {
    const c = worldToCell(x, z);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const e = grid.get(key(c.x + dx, c.z + dz));
      if (!e || !e.solid) continue;
      const cx = (c.x + dx) * CELL, cz = (c.z + dz) * CELL;
      const m = e.static ? 0 : CELL * 0.1;
      const nx = Math.max(cx + m, Math.min(x, cx + CELL - m));
      const nz = Math.max(cz + m, Math.min(z, cz + CELL - m));
      if ((x - nx) ** 2 + (z - nz) ** 2 < RADIUS * RADIUS) return true;
    }
    for (const c2 of colliders) {
      const r = c2.r + RADIUS;
      if (Math.abs(x - c2.x) < r && Math.abs(z - c2.z) < r && (x - c2.x) ** 2 + (z - c2.z) ** 2 < r * r) return true;
    }
    return Math.abs(x) > WORLD_LIMIT || Math.abs(z) > WORLD_LIMIT;
  }

  update(dt, active) {
    const k = active ? this.keys : {};
    const f = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
    const s = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0);
    const sprint = k.ShiftLeft || k.ShiftRight;
    if (this.coffee > 0) this.coffee -= dt;
    const speed = (sprint ? 7.2 : 4.3) * (this.coffee > 0 ? 1.3 : 1);
    const fwd = new THREE.Vector3();
    this.camera.getWorldDirection(fwd);
    fwd.y = 0; fwd.normalize();
    const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
    const wish = fwd.multiplyScalar(f).add(right.multiplyScalar(s));
    if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(speed);
    const accel = this.onGround ? 14 : 4;
    this.vel.x += (wish.x - this.vel.x) * Math.min(1, accel * dt);
    this.vel.z += (wish.z - this.vel.z) * Math.min(1, accel * dt);

    if (active && k.Space && this.onGround) { this.vel.y = 5.2; this.onGround = false; audio.play('jump', { volume: 0.25 }); }
    this.vel.y -= 16 * dt;

    const p = this.camera.position;
    const nx = p.x + this.vel.x * dt;
    if (!this.blockedAt(nx, p.z)) p.x = nx; else this.vel.x = 0;
    const nz = p.z + this.vel.z * dt;
    if (!this.blockedAt(p.x, nz)) p.z = nz; else this.vel.z = 0;

    this.y += this.vel.y * dt;
    if (this.y <= 0) { this.y = 0; if (!this.onGround && this.vel.y < -6) audio.play('stepConcrete', { volume: 0.4 }); this.vel.y = 0; this.onGround = true; }

    const hs = Math.hypot(this.vel.x, this.vel.z);
    if (this.onGround && hs > 0.5) {
      this.bob += dt * hs * 1.9;
      this.stepTimer -= dt * hs;
      if (this.stepTimer <= 0) {
        this.stepTimer = 2.3;
        const c = worldToCell(p.x, p.z);
        const onPad = isPadCell(c.x, c.z) || (Math.abs(p.x) < 12 && p.z > 18 && p.z < 30);
        audio.play(onPad ? 'stepConcrete' : 'stepGrass', { volume: sprint ? 0.35 : 0.25 });
      }
    }
    p.y = EYE + this.y + Math.sin(this.bob * 2) * 0.035 * Math.min(1, hs / 4);

    const r = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    audio.setListener(p, r.x, r.z);
  }
}
