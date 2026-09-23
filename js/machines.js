// Grid, entidades e máquinas da fábrica.
import * as THREE from 'three';
import { CELL, ITEMS, ORES, SMELT, RECIPES, MACHINES, DECOR } from './data.js';
import { cloneModel } from './assets.js';
import { game } from './state.js';
import { takeItemMesh, releaseItemMesh } from './itemMeshes.js';
import { Blocking, Builtin, JDict, JiboiaError, suggest } from './lang/jiboia.js';
import { audio } from './audio.js';
import { puff, floatText, makeLabel, setLabel } from './fx.js';
import { powerRatio, powerText, usesPower, disconnectAll, recompute as recomputePower, canWire } from './power.js';

export const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // N L S O
export const grid = new Map();     // "x,z" -> entidade ou bloqueio estático
export const ores = new Map();     // "x,z" -> tipo de minério
export const ENTITY_CLASSES = {};
export const key = (x, z) => x + ',' + z;
export const cellCenter = (x, z) => new THREE.Vector3((x + 0.5) * CELL, 0, (z + 0.5) * CELL);
export const worldToCell = (wx, wz) => ({ x: Math.floor(wx / CELL), z: Math.floor(wz / CELL) });

// Ajuste de orientação de cada modelo (pra "frente" do modelo apontar pro norte, -z)
export const MODEL_YAW = {
  belt: Math.PI / 2, beltCorner: 0, miner: -Math.PI / 2, smelter: -Math.PI / 2, assembler: -Math.PI / 2, sorter: Math.PI / 2,
  seller: 0, chest: 0, computer: 0,
};

const BELT_Y = 0.4 * CELL; // altura da superfície da esteira
const SPACING = 0.34;

// setinhas animadas em cima das esteiras (uma textura só, compartilhada)
function chevronTexture() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const g = c.getContext('2d');
  g.strokeStyle = 'rgba(255,190,90,0.95)';
  g.lineWidth = 10;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(14, 44); g.lineTo(32, 22); g.lineTo(50, 44);
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
const chevTex = chevronTexture();
chevTex.repeat.set(1, 2);
export const chevronMat = new THREE.MeshBasicMaterial({ map: chevTex, transparent: true, depthWrite: false, opacity: 0.85 });
const chevTexShort = chevTex.clone();
chevTexShort.repeat.set(1, 1);
const chevronMatShort = new THREE.MeshBasicMaterial({ map: chevTexShort, transparent: true, depthWrite: false, opacity: 0.85 });
const chevGeo = new THREE.PlaneGeometry(CELL * 0.42, CELL);
const chevGeoShort = new THREE.PlaneGeometry(CELL * 0.42, CELL * 0.5);
export function animateBelts(dt) {
  const v = (game.economy?.beltSpeed || 1) * dt;
  chevTex.offset.y -= v * 2;
  chevTexShort.offset.y -= v * 2;
}

// setinha no chão (laranja = saída, azul = entrada)
// a ponta aponta pra -z local (a "frente"); yaw gira o grupo
export function groundArrow(color, size = 1, yaw = 0) {
  const s = new THREE.Shape();
  s.moveTo(0, 0.22); s.lineTo(0.2, -0.05); s.lineTo(0.07, -0.05); s.lineTo(0.07, -0.2);
  s.lineTo(-0.07, -0.2); s.lineTo(-0.07, -0.05); s.lineTo(-0.2, -0.05); s.closePath();
  const m = new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.scale.setScalar(size);
  const g = new THREE.Group();
  g.add(m);
  g.rotation.y = yaw;
  return g;
}
// coloca a seta na borda da célula. side: 0 frente, 1 direita, 2 trás, 3 esquerda (local). inward: aponta pra dentro
function portArrow(color, side, inward) {
  const yawOut = [0, -Math.PI / 2, Math.PI, Math.PI / 2][side];
  const a = groundArrow(color, 0.8, inward ? yawOut + Math.PI : yawOut);
  const d = CELL * 0.5 - 0.02;
  const off = [[0, -d], [d, 0], [0, d], [-d, 0]][side];
  a.position.set(off[0], 0.035, off[1]);
  return a;
}

export function isItem(name) { return Object.prototype.hasOwnProperty.call(ITEMS, name); }
export function itemName(t) { return ITEMS[t]?.nome || t; }

function uniqueName(prefix) {
  let i = 1;
  const names = new Set(game.entities.map((e) => e.name));
  while (names.has(prefix + i)) i++;
  return prefix + i;
}

// ───────────────────────── Entidade base ─────────────────────────
export class Entity {
  constructor(type, x, z, dir) {
    this.type = type;
    this.x = x; this.z = z; this.dir = dir;
    this.def = MACHINES[type] || DECOR[type] || {};
    this.name = '';
    this.removed = false;
    this.obj = new THREE.Group();
    this.obj.position.copy(cellCenter(x, z));
    this.obj.rotation.y = -dir * Math.PI / 2;
    this.obj.userData.entity = this;
    this.solid = !!this.def.solido;
  }
  get pos() { return this.obj.position; }
  get isMachine() { return !!MACHINES[this.type]; }
  cellIn(d) { return [this.x + DIRS[d][0], this.z + DIRS[d][1]]; }
  entityIn(d) { const [x, z] = this.cellIn(d); return grid.get(key(x, z)); }
  canAccept() { return false; }
  accept() { }
  update() { }
  onRemove() { }
  addModel(modelKey) {
    const m = cloneModel(modelKey);
    m.rotation.y = MODEL_YAW[modelKey] || 0;
    this.model = m;
    this.obj.add(m);
    m.traverse((o) => { if (o.isMesh) o.userData.entity = this; });
    return m;
  }
  serialize() { return { type: this.type, x: this.x, z: this.z, dir: this.dir, name: this.name }; }
  load() { }
  infoLines() { return []; }
}

// ───────────────────────── Esteira ─────────────────────────
export class Belt extends Entity {
  constructor(type, x, z, dir) {
    super(type, x, z, dir);
    this.items = [];
    this.shape = 'straight';
    this.addModel('belt');
    this.name = '';
    this.chev = new THREE.Mesh(chevGeo, chevronMat);
    this.chev.rotation.x = -Math.PI / 2; // +v da textura aponta pra -z local (a frente)
    this.chev.position.y = BELT_Y + 0.006;
    this.chev.renderOrder = 2;
    this.obj.add(this.chev);
  }
  get outputDirs() { return [this.dir]; }
  canAccept(type, travelDir) {
    if (travelDir === (this.dir + 2) % 4) return false;
    if (this.items.length >= 4) return false;
    const last = this.items[this.items.length - 1];
    return !last || last.p >= SPACING;
  }
  accept(type, travelDir, mesh) {
    mesh = mesh || takeItemMesh(type);
    if (mesh.parent !== game.scene) game.scene.add(mesh);
    const it = { type, p: 0, entry: (travelDir + 2) % 4, mesh };
    this.items.push(it);
    this.placeItem(it);
  }
  placeItem(it) {
    const c = this.obj.position;
    const e = DIRS[it.entry], x = DIRS[this.dir];
    let px, pz;
    if (it.p < 0.5) { const k = it.p * 2; px = e[0] * 0.5 * (1 - k); pz = e[1] * 0.5 * (1 - k); }
    else { const k = (it.p - 0.5) * 2; px = x[0] * 0.5 * k; pz = x[1] * 0.5 * k; }
    it.mesh.position.set(c.x + px * CELL, BELT_Y, c.z + pz * CELL);
    it.mesh.rotation.y = -this.dir * Math.PI / 2;
  }
  update(dt) {
    const v = game.economy.beltSpeed * dt;
    for (let i = 0; i < this.items.length; i++) {
      const it = this.items[i];
      const limit = i === 0 ? 1 : this.items[i - 1].p - SPACING;
      if (it.p < limit) it.p = Math.min(it.p + v, limit);
      if (i === 0 && it.p >= 1) {
        const t = this.entityIn(this.dir);
        if (t && !t.removed && t.canAccept(it.type, this.dir)) {
          this.items.shift();
          i--;
          t.accept(it.type, this.dir, it.mesh);
          continue;
        }
      }
      this.placeItem(it);
    }
  }
  // escolhe entre reta e curva olhando os vizinhos
  refreshShape() {
    const feedsMe = (d) => {
      const n = this.entityIn(d);
      if (!n || !n.outputDirs) return false;
      return n.outputDirs.includes((d + 2) % 4);
    };
    const back = (this.dir + 2) % 4, left = (this.dir + 3) % 4, right = (this.dir + 1) % 4;
    let shape = 'straight';
    if (!feedsMe(back)) {
      if (feedsMe(left) && !feedsMe(right)) shape = 'left';
      else if (feedsMe(right) && !feedsMe(left)) shape = 'right';
    }
    if (shape === this.shape) return;
    this.shape = shape;
    this.obj.remove(this.model);
    if (shape === 'straight') {
      this.addModel('belt');
      this.chev.geometry = chevGeo;
      this.chev.material = chevronMat;
      this.chev.position.z = 0;
    } else {
      // o modelo da curva, sem girar, liga os lados oeste e sul; giramos pra ligar entrada -> frente
      const m = this.addModel('beltCorner');
      m.rotation.y = shape === 'left' ? -Math.PI / 2 : -Math.PI;
      this.chev.geometry = chevGeoShort;
      this.chev.material = chevronMatShort;
      this.chev.position.z = -CELL * 0.25;
    }
  }
  onRemove() {
    for (const it of this.items) releaseItemMesh(it.mesh);
    this.items = [];
  }
  serialize() { return { ...super.serialize(), items: this.items.map((i) => [i.type, i.p, i.entry]) }; }
  load(d) {
    for (const [type, p, entry] of d.items || []) {
      if (!isItem(type)) continue;
      const it = { type, p, entry, mesh: takeItemMesh(type) };
      game.scene.add(it.mesh);
      this.items.push(it);
      this.placeItem(it);
    }
  }
}

// ───────────────────────── Máquina base ─────────────────────────
export class Machine extends Entity {
  constructor(type, x, z, dir) {
    super(type, x, z, dir);
    this.inv = {};
    this.out = [];
    this.outCap = 10;
    this.job = null;
    this.queue = [];
    this.status = 'Parada';
    this.ejectCd = 0;
    this.anim = 0;
    this.name = uniqueName(this.def.prefixo || type);
    this.addModel(this.def.model);
    this.label = makeLabel(this.name);
    this.label.position.y = (this.model.userData.size?.y || 1.3) + 0.45;
    this.obj.add(this.label);
    // luz de status
    this.lamp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshStandardMaterial({ color: 0x777777, emissive: 0x000000 }));
    this.lamp.position.y = (this.model.userData.size?.y || 1.3) + 0.08;
    this.obj.add(this.lamp);
    // portas: laranja = saída (frente), azul = entrada
    if (this.hasOutput) this.obj.add(portArrow(0xffa640, 0, false));
    for (const side of this.inputSides) this.obj.add(portArrow(0x5fb4ff, side, true));
  }
  get hasOutput() { return false; }
  get outputDirs() { return this.hasOutput ? [this.dir] : []; }
  get inputSides() { return []; } // lados locais que recebem itens: 1 direita, 2 trás, 3 esquerda, 0 frente
  // item chegando pela frente (andando contra a máquina)?
  fromFront(travelDir) { return travelDir === (this.dir + 2) % 4; }
  get power() { return powerRatio(this); }
  rename(n) { this.name = n; setLabel(this.label, n); }
  invCount(t) { return t ? (this.inv[t] || 0) : Object.values(this.inv).reduce((a, b) => a + b, 0); }
  addInv(t, n = 1) { this.inv[t] = (this.inv[t] || 0) + n; }
  takeInv(t, n = 1) { this.inv[t] -= n; if (this.inv[t] <= 0) delete this.inv[t]; }

  accept(type, travelDir, mesh) {
    releaseItemMesh(mesh);
    this.addInv(type);
  }

  // pedido vindo de um programa. check() => null se pode começar, texto se deve esperar; lança erro se inválido
  request(opts) {
    const b = new Blocking();
    b.label = opts.label || '';
    this.queue.push({ ...opts, b });
    return b;
  }

  update(dt) {
    const pw = this.power;
    this.noPower = pw <= 0;
    if (this.job) {
      this.job.t += dt * game.economy.machineSpeed * pw;
      if (this.job.t >= this.job.dur) {
        const j = this.job;
        this.job = null;
        const v = j.finish ? j.finish() : null;
        j.b.resolve(v);
      }
    }
    if (!this.job) {
      let waiting = null;
      while (this.queue.length) {
        const q = this.queue[0];
        if (q.b.cancelled) { this.queue.shift(); continue; }
        if (this.noPower && usesPower(this)) { waiting = 'Sem energia ⚡'; break; }
        let r = null;
        try { r = q.check ? q.check() : null; }
        catch (e) { this.queue.shift(); q.b.fail(e.message); continue; }
        if (r) { waiting = r; break; }
        this.queue.shift();
        if (q.start) q.start();
        const dur = typeof q.dur === 'function' ? q.dur() : q.dur;
        if (!dur) { q.b.resolve(q.finish ? q.finish() : null); continue; }
        this.job = { ...q, dur, t: 0 };
        break;
      }
      this.status = this.job ? this.job.label : waiting || (this.out.length ? 'Entregando' : 'Parada');
      this.waiting = !!waiting;
    } else this.status = this.job.label;
    if (this.noPower && (this.job || this.queue.length)) this.status = 'Sem energia ⚡';
    this.tryEject(dt);
    this.animate(dt);
  }

  tryEject(dt) {
    this.ejectCd -= dt;
    if (this.ejectCd > 0 || !this.out.length) return;
    const t = this.entityIn(this.dir);
    if (t && !t.removed && t.canAccept(this.out[0], this.dir)) {
      t.accept(this.out.shift(), this.dir, null);
      this.ejectCd = 0.3;
    }
  }

  animate(dt) {
    this.anim += dt;
    if (usesPower(this) && this.noPower) {
      // sem energia: luz vermelha piscando devagar
      this.lamp.material.color.setHex(0xff4455);
      this.lamp.material.emissive.setHex(0xff2233);
      this.lamp.material.emissiveIntensity = Math.sin(this.anim * 4) > 0 ? 1.4 : 0.1;
      if (this.model) this.model.scale.set(1, 1, 1);
      return;
    }
    const working = !!this.job;
    const target = working ? 0x5dff8a : this.waiting ? 0xffc44d : (this.out.length ? 0x7fb2ff : 0x666677);
    this.lamp.material.color.setHex(target);
    this.lamp.material.emissive.setHex(target);
    this.lamp.material.emissiveIntensity = working ? 1.2 + Math.sin(this.anim * 10) * 0.4 : 0.5;
    if (this.model) {
      const s = working ? 1 + Math.sin(this.anim * 16) * 0.012 : 1;
      this.model.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
    }
  }

  onRemove() { for (const q of this.queue) q.b.fail(`A máquina '${this.name}' foi removida`); if (this.job) this.job.b.fail(`A máquina '${this.name}' foi removida`); }

  infoLines() {
    const l = [`Status: ${this.status}`];
    const pt = powerText(this);
    if (pt) l.push(pt);
    const inv = Object.entries(this.inv);
    if (inv.length) l.push('Entrada: ' + inv.map(([k, v]) => `${v}× ${itemName(k)}`).join(', '));
    if (this.out.length) l.push(`Saída: ${this.out.length}× ${itemName(this.out[0])}${this.out.length >= this.outCap ? ' (cheia!)' : ''}`);
    return l;
  }

  serialize() { return { ...super.serialize(), inv: this.inv, out: this.out }; }
  load(d) {
    if (d.name) this.rename(d.name);
    this.inv = {}; for (const [k, v] of Object.entries(d.inv || {})) if (isItem(k)) this.inv[k] = v;
    this.out = (d.out || []).filter(isItem);
  }

  // métodos disponíveis na Jiboia
  api() {
    return {
      ocupada: { fn: () => !!this.job || this.queue.length > 0, doc: 'True se estiver trabalhando' },
      status: { fn: () => this.status, doc: 'Texto com o que a máquina está fazendo' },
      estoque: { fn: () => new JDict(Object.entries(this.inv)), doc: 'Dicionário com os itens guardados' },
      quantidade: { fn: (a) => this.invCount(a[0] || null), max: 1, doc: 'Quantos itens (de um tipo, ou todos) tem dentro' },
      saida: { fn: () => this.out.length, doc: 'Quantos itens estão esperando pra sair' },
      energia: { fn: () => Math.round(this.power * 100) / 100, doc: '1 = energia total, 0 = sem energia' },
    };
  }
}

function checkItemArg(name, fname) {
  if (typeof name !== 'string') throw new JiboiaError(`${fname}() precisa do nome do item entre aspas, ex: "minerio_ferro"`);
  if (!isItem(name)) {
    const s = suggest(name, Object.keys(ITEMS));
    throw new JiboiaError(`O item "${name}" não existe` + (s ? `. Você quis dizer "${s}"?` : ''));
  }
}

// ───────────────────────── Minerador ─────────────────────────
export class Miner extends Machine {
  constructor(type, x, z, dir) {
    super(type, x, z, dir);
    this.oreType = ores.get(key(x, z)) || null;
  }
  get hasOutput() { return true; }
  api() {
    return {
      ...super.api(),
      minerar: {
        doc: 'Tira 1 minério do chão (demora alguns segundos). Retorna o nome do item.',
        fn: () => {
          const ore = ORES[this.oreType];
          if (!ore) throw new JiboiaError(`O minerador '${this.name}' não está em cima de um veio de minério`);
          return this.request({
            label: 'Minerando',
            check: () => {
              if (ore.nivel && game.economy.level < ore.nivel) throw new JiboiaError(`Minerar ${ore.nome} precisa do nível ${ore.nivel}`);
              return this.out.length >= this.outCap ? 'Saída cheia' : null;
            },
            dur: ore.tempo,
            finish: () => {
              this.out.push(ore.item);
              game.economy.produced(ore.item);
              audio.play('mine', { pos: this.pos, volume: 0.6 });
              puff(new THREE.Vector3(this.pos.x, 0.3, this.pos.z), { color: 0xc9b89a, count: 5, size: 0.35, spread: 1, up: 0.6 });
              return ore.item;
            },
          });
        },
      },
      minerio: { fn: () => this.oreType ? ORES[this.oreType].item : null, doc: 'Qual minério está embaixo' },
    };
  }
  infoLines() { return [`Veio: ${this.oreType ? ORES[this.oreType].nome : 'nenhum!'}`, ...super.infoLines()]; }
}

// ───────────────────────── Fornalha ─────────────────────────
export class Smelter extends Machine {
  get hasOutput() { return true; }
  get inputSides() { return [1, 2, 3]; }
  canAccept(type, travelDir) { return !this.fromFront(travelDir) && !!SMELT[type] && this.invCount() < 20; }
  api() {
    return {
      ...super.api(),
      fundir: {
        max: 1,
        doc: 'Derrete 1 minério em lingote. Espera o minério chegar se não tiver.',
        fn: (a) => {
          const want = a[0] ?? null;
          if (want !== null) {
            checkItemArg(want, 'fundir');
            if (!SMELT[want]) throw new JiboiaError(`A fornalha não sabe derreter "${want}". Ela funde: ${Object.keys(SMELT).join(', ')}`);
          }
          let chosen = null;
          return this.request({
            label: 'Fundindo',
            check: () => {
              const lvl = game.economy.level;
              if (want && SMELT[want].nivel > lvl) throw new JiboiaError(`Fundir ${itemName(want)} precisa do nível ${SMELT[want].nivel}`);
              if (this.out.length >= this.outCap) return 'Saída cheia';
              chosen = want || Object.keys(this.inv).find((k) => SMELT[k] && SMELT[k].nivel <= lvl);
              if (!chosen) {
                const locked = Object.keys(this.inv).find((k) => SMELT[k]);
                if (locked) throw new JiboiaError(`Fundir ${itemName(locked)} precisa do nível ${SMELT[locked].nivel}`);
              }
              if (!chosen || !this.inv[chosen]) return want ? `Esperando ${itemName(want)} chegar pela esteira` : 'Esperando minério chegar pela esteira';
              return null;
            },
            start: () => { this.takeInv(chosen); },
            dur: () => SMELT[chosen].tempo,
            finish: () => {
              const o = SMELT[chosen].out;
              this.out.push(o);
              game.economy.produced(o);
              audio.play('smelt', { pos: this.pos, volume: 0.35 });
              return o;
            },
          });
        },
      },
    };
  }
  animate(dt) {
    super.animate(dt);
    if (this.job && Math.random() < dt * 4) puff(new THREE.Vector3(this.pos.x, 1.7, this.pos.z), { color: 0xd8d0e8, count: 1, size: 0.4, up: 0.9, life: 1.8, opacity: 0.45 });
    if (this.job && Math.random() < dt * 6) puff(new THREE.Vector3(this.pos.x, 0.9, this.pos.z), { color: 0xff8a3a, count: 1, size: 0.15, up: 0.5, additive: true, spread: 0.6, life: 0.6 });
  }
}

// ───────────────────────── Montadora ─────────────────────────
const ALL_INGREDIENTS = new Set(Object.values(RECIPES).flatMap((r) => Object.keys(r.in)));
export class Assembler extends Machine {
  get hasOutput() { return true; }
  get inputSides() { return [1, 2, 3]; }
  canAccept(type, travelDir) { return !this.fromFront(travelDir) && ALL_INGREDIENTS.has(type) && this.invCount() < 30; }
  hasIngredients(r) { return Object.entries(RECIPES[r].in).every(([k, n]) => (this.inv[k] || 0) >= n); }
  checkRecipe(r) {
    if (typeof r !== 'string') throw new JiboiaError('fabricar() precisa do nome da receita entre aspas, ex: "engrenagem"');
    if (!RECIPES[r]) {
      const s = suggest(r, Object.keys(RECIPES));
      throw new JiboiaError(`Receita "${r}" não existe` + (s ? `. Você quis dizer "${s}"?` : `. Receitas: ${Object.keys(RECIPES).join(', ')}`));
    }
    if (RECIPES[r].nivel > game.economy.level) throw new JiboiaError(`A receita "${r}" precisa do nível ${RECIPES[r].nivel}`);
  }
  api() {
    return {
      ...super.api(),
      fabricar: {
        min: 1, max: 1,
        doc: 'Fabrica uma receita (espera os ingredientes chegarem).',
        fn: ([r]) => {
          this.checkRecipe(r);
          const rec = RECIPES[r];
          return this.request({
            label: 'Fabricando ' + itemName(r),
            check: () => {
              if (this.out.length + rec.qtd > this.outCap) return 'Saída cheia';
              if (!this.hasIngredients(r)) return 'Esperando ' + Object.entries(rec.in).map(([k, n]) => `${n}× ${itemName(k)}`).join(' + ');
              return null;
            },
            start: () => { for (const [k, n] of Object.entries(rec.in)) this.takeInv(k, n); },
            dur: rec.tempo,
            finish: () => {
              for (let i = 0; i < rec.qtd; i++) this.out.push(r);
              game.economy.produced(r, rec.qtd);
              audio.play('assemble', { pos: this.pos, volume: 0.5 });
              puff(new THREE.Vector3(this.pos.x, 1.4, this.pos.z), { color: 0xffe08a, count: 8, size: 0.12, up: 1.6, gravity: 3, additive: true, spread: 0.5, life: 0.8 });
              return r;
            },
          });
        },
      },
      pode_fabricar: {
        min: 1, max: 1, doc: 'True se já tem os ingredientes da receita',
        fn: ([r]) => { this.checkRecipe(r); return this.hasIngredients(r) && this.out.length + RECIPES[r].qtd <= this.outCap; },
      },
      receitas: { fn: () => Object.keys(RECIPES).filter((k) => RECIPES[k].nivel <= game.economy.level), doc: 'Lista de receitas liberadas' },
    };
  }
  animate(dt) {
    super.animate(dt);
    if (this.cog) this.cog.rotation.y += dt * (this.job ? 6 : 0.3);
  }
}

// ───────────────────────── Separador ─────────────────────────
export class Sorter extends Machine {
  constructor(...a) {
    super(...a);
    this.held = null;
    this.obj.add(portArrow(0xffa640, 1, false), portArrow(0xffa640, 3, false));
  }
  get hasOutput() { return true; }
  get inputSides() { return [2]; }
  get outputDirs() { return [this.dir, (this.dir + 1) % 4, (this.dir + 3) % 4]; }
  canAccept(type, travelDir) { return !this.held && travelDir === this.dir; } // só entra por trás
  accept(type, travelDir, mesh) {
    mesh = mesh || takeItemMesh(type);
    if (mesh.parent !== game.scene) game.scene.add(mesh);
    mesh.position.set(this.pos.x, 0.62, this.pos.z);
    this.held = { type, mesh };
  }
  tryEject() { }
  dirFromName(n) {
    const map = { frente: 0, direita: 1, esquerda: 3, tras: 2, 'trás': 2 };
    if (!(n in map)) throw new JiboiaError(`Direção "${n}" não existe. Use "esquerda", "direita" ou "frente"`);
    return (this.dir + map[n]) % 4;
  }
  api() {
    return {
      ...super.api(),
      item: { fn: () => this.held ? this.held.type : null, doc: 'Nome do item que está no separador (ou None)' },
      esperar_item: {
        doc: 'Espera chegar um item e retorna o nome dele',
        fn: () => this.request({ label: 'Esperando item', check: () => this.held ? null : 'Esperando item', finish: () => this.held.type }),
      },
      enviar: {
        min: 1, max: 1, doc: 'Manda o item pra "esquerda", "direita" ou "frente"',
        fn: ([n]) => {
          const d = this.dirFromName(n);
          return this.request({
            label: 'Enviando',
            check: () => {
              if (!this.held) return 'Esperando item';
              const t = this.entityIn(d);
              if (!t || !t.canAccept(this.held.type, d)) return `Saída "${n}" bloqueada`;
              return null;
            },
            start: () => {
              const t = this.entityIn(d);
              t.accept(this.held.type, d, this.held.mesh);
              this.held = null;
              audio.play('sorter', { pos: this.pos, volume: 0.4 });
            },
            dur: 0.35,
            finish: () => true,
          });
        },
      },
    };
  }
  onRemove() { super.onRemove(); if (this.held) releaseItemMesh(this.held.mesh); }
  infoLines() { return [`Segurando: ${this.held ? itemName(this.held.type) : 'nada'}`, `Status: ${this.status}`]; }
  serialize() { return { ...super.serialize(), held: this.held?.type }; }
  load(d) { super.load(d); if (d.held && isItem(d.held)) this.accept(d.held, this.dir, null); }
}

// ───────────────────────── Caixa de Venda ─────────────────────────
export class Seller extends Machine {
  constructor(...a) { super(...a); this.cap = 99; }
  get inputSides() { return [0, 1, 2, 3]; }
  canAccept() { return this.invCount() < this.cap; }
  accept(type, travelDir, mesh) {
    releaseItemMesh(mesh);
    this.addInv(type);
    this.bump = 0.2;
    audio.play('drop', { pos: this.pos, volume: 0.25 });
  }
  api() {
    return {
      ...super.api(),
      vender: {
        max: 1, doc: 'Vende tudo (ou só um tipo de item). Retorna quanto ganhou.',
        fn: (a) => {
          const want = a[0] ?? null;
          if (want !== null) checkItemArg(want, 'vender');
          return this.request({
            label: 'Vendendo',
            dur: 0.5,
            finish: () => {
              let total = 0;
              for (const [t, n] of Object.entries(this.inv)) {
                if (want && t !== want) continue;
                total += game.economy.sell(t, n);
                delete this.inv[t];
              }
              total = Math.round(total * 10) / 10;
              if (total > 0) {
                audio.play('sell', { pos: this.pos, volume: 0.7 });
                floatText(new THREE.Vector3(this.pos.x, 2.3, this.pos.z), `+$ ${total}`);
                puff(new THREE.Vector3(this.pos.x, 1.6, this.pos.z), { color: 0xffd35a, count: 10, size: 0.14, up: 2, gravity: 4, additive: true, life: 0.9 });
                game.emit('sold', total);
              }
              return total;
            },
          });
        },
      },
      preco: {
        min: 1, max: 1, doc: 'Preço atual de 1 unidade no mercado',
        fn: ([t]) => { checkItemArg(t, 'preco'); return game.economy.price(t); },
      },
    };
  }
  animate(dt) {
    super.animate(dt);
    if (this.bump > 0) { this.bump -= dt; const k = 1 + Math.sin(this.bump * 30) * this.bump * 0.2; this.model.scale.set(k, 1 / k, k); }
  }
  infoLines() {
    const inv = Object.entries(this.inv);
    let val = 0; for (const [k, v] of inv) val += v * game.economy.price(k);
    return [`Guardado: ${this.invCount()}/${this.cap}`, ...(inv.length ? [inv.map(([k, v]) => `${v}× ${itemName(k)}`).join(', ')] : []), `Valor atual: $ ${val.toFixed(1)}`, `Status: ${this.status}`];
  }
}

// ───────────────────────── Baú ─────────────────────────
export class Chest extends Machine {
  constructor(...a) { super(...a); this.cap = 60; }
  get hasOutput() { return true; }
  get inputSides() { return [1, 2, 3]; }
  canAccept(type, travelDir) { return !this.fromFront(travelDir) && this.invCount() < this.cap; }
  tryEject() { }
  api() {
    return {
      ...super.api(),
      retirar: {
        max: 1, doc: 'Solta 1 item (do tipo pedido, ou qualquer um) pela frente',
        fn: (a) => {
          const want = a[0] ?? null;
          if (want !== null) checkItemArg(want, 'retirar');
          let chosen = null;
          return this.request({
            label: 'Retirando',
            check: () => {
              chosen = want || Object.keys(this.inv)[0];
              if (!chosen || !this.inv[chosen]) return want ? `Sem ${itemName(want)}` : 'Vazio';
              const t = this.entityIn(this.dir);
              if (!t || !t.canAccept(chosen, this.dir)) return 'Saída bloqueada';
              return null;
            },
            start: () => { this.takeInv(chosen); this.entityIn(this.dir).accept(chosen, this.dir, null); },
            dur: 0.3,
            finish: () => chosen,
          });
        },
      },
    };
  }
  infoLines() { return [`Guardado: ${this.invCount()}/${this.cap}`, ...super.infoLines().slice(1)]; }
}

// ───────────────────────── Decoração ─────────────────────────
export class Decor extends Entity {
  constructor(type, x, z, dir) {
    super(type, x, z, dir);
    this.solid = true;
    this.addModel(this.def.model);
    if (this.def.luz) {
      const l = new THREE.PointLight(0xffc98a, 6, 7, 1.5);
      l.position.y = 1.6;
      this.obj.add(l);
    }
  }
}

// ───────────────────────── Gerador ─────────────────────────
export class Generator extends Machine {
  get producing() { return this.net && this.net.demand > 0; }
  api() {
    return {
      producao: { fn: () => MACHINES[this.type].gera, doc: 'Quanto ⚡ este gerador produz' },
      consumo: { fn: () => this.net ? this.net.demand : 0, doc: 'Quanto ⚡ a rede dele está usando' },
    };
  }
  update(dt) {
    this.status = this.producing ? 'Gerando energia' : 'Ligado (ninguém usando)';
    this.animate(dt);
  }
  animate(dt) {
    this.anim += dt;
    const on = this.producing;
    this.lamp.material.color.setHex(on ? 0xffc040 : 0x7fb2ff);
    this.lamp.material.emissive.setHex(on ? 0xffa020 : 0x4a70c0);
    this.lamp.material.emissiveIntensity = on ? 1.2 + Math.sin(this.anim * 12) * 0.5 : 0.6;
    if (on) {
      const s = 1 + Math.sin(this.anim * 30) * 0.008;
      this.model.scale.set(s, 1 / s, s);
      if (Math.random() < dt * 1.5) puff(new THREE.Vector3(this.pos.x, 1.1, this.pos.z), { color: 0xcfc8e0, count: 1, size: 0.3, up: 0.8, life: 1.4, opacity: 0.35 });
    }
  }
  infoLines() { return [`Status: ${this.status}`, powerText(this)]; }
}

// ───────────────────────── Poste de energia ─────────────────────────
export class Pole extends Entity {
  constructor(type, x, z, dir) {
    super(type, x, z, dir);
    this.addModel('pole').scale.set(0.3, 1, 0.3);
    // isoladorzinho laranja no topo
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffa640, emissive: 0x663300, emissiveIntensity: 0.4 }));
    cap.position.y = 2.55;
    cap.userData.entity = this;
    this.cap = cap;
    this.obj.add(cap);
  }
  update() {
    const on = this.net && this.net.supply > 0;
    this.cap.material.emissiveIntensity = on ? 0.9 : 0.15;
  }
  infoLines() { return [this.net ? `⚡ Rede: gera ${this.net.supply} · usa ${this.net.demand}` : 'Sem cabos']; }
}

Object.assign(ENTITY_CLASSES, {
  esteira: Belt, minerador: Miner, fornalha: Smelter, montadora: Assembler,
  separador: Sorter, venda: Seller, bau: Chest, gerador: Generator, gerador_grande: Generator, poste: Pole,
});

export function createEntity(type, x, z, dir) {
  const C = ENTITY_CLASSES[type] || (DECOR[type] ? Decor : null);
  if (!C) throw new Error('tipo desconhecido ' + type);
  const e = new C(type, x, z, dir);
  if (e.type === 'montadora') {
    const c = cloneModel('cog');
    c.position.set(0, (e.model.userData.size?.y || 1.3) + 0.02, 0);
    c.scale.setScalar(1.3);
    e.obj.add(c);
    e.cog = c;
  }
  return e;
}

export function addEntity(e) {
  game.entities.push(e);
  grid.set(key(e.x, e.z), e);
  game.scene.add(e.obj);
  refreshBeltsAround(e.x, e.z);
  if (canWire(e)) recomputePower();
  game.emit('entities');
  return e;
}

export function removeEntity(e) {
  e.removed = true;
  disconnectAll(e);
  e.onRemove();
  game.scene.remove(e.obj);
  grid.delete(key(e.x, e.z));
  const i = game.entities.indexOf(e);
  if (i >= 0) game.entities.splice(i, 1);
  refreshBeltsAround(e.x, e.z);
  recomputePower();
  game.emit('entities');
}

export function refreshBeltsAround(x, z) {
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
    const e = grid.get(key(x + dx, z + dz));
    if (e && e.type === 'esteira') e.refreshShape();
  }
}

export function findByName(name) {
  return game.entities.find((e) => e.name === name && e.isMachine);
}

// Referência de máquina usada dentro da Jiboia
export class MachineRef {
  constructor(e) { this.e = e; this.jTypeName = 'máquina'; }
  jStr() { return `<máquina ${this.e.name}>`; }
  jEq(o) { return o instanceof MachineRef && o.e === this.e; }
  jGetAttr(name, line, interp) {
    const e = this.e;
    if (e.removed) throw new JiboiaError(`A máquina '${e.name}' não existe mais`, line);
    if (name === 'nome') return e.name;
    if (name === 'tipo') return e.type;
    const api = e.api ? e.api() : {};
    const m = api[name];
    if (!m) {
      const s = suggest(name, Object.keys(api));
      throw new JiboiaError(`${MACHINES[e.type]?.nome || e.type} '${e.name}' não tem o método '${name}'` + (s ? `. Você quis dizer '${s}'?` : `. Métodos: ${Object.keys(api).join(', ')}`), line);
    }
    void interp;
    return new Builtin(name, (args) => m.fn(args), m.min ?? 0, m.max ?? m.min ?? 0);
  }
}
