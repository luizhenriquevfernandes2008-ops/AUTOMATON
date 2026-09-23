// Construção: escolher item na barra, fantasma no grid, colocar/remover, cabos de energia e mirar em coisas.
import * as THREE from 'three';
import { game } from './state.js';
import { CELL, GRID_MIN, GRID_MAX, MACHINES, DECOR, TOOLS } from './data.js';
import { grid, ores, key, cellCenter, worldToCell, createEntity, addEntity, removeEntity, MODEL_YAW, DIRS, groundArrow } from './machines.js';
import { cloneModel } from './assets.js';
import { colliders, interactables, setOreVisible } from './world.js';
import { audio } from './audio.js';
import { canWire, checkConnect, connect, disconnectAll, showPreview, wirePoint, wiresOf } from './power.js';

export const ORDER = [...Object.keys(MACHINES), ...Object.keys(DECOR)];
const REACH_BUILD = 14, REACH_USE = 6, REACH_CABLE = 12;

export const defOf = (t) => MACHINES[t] || DECOR[t] || TOOLS[t];

export class Builder {
  constructor() {
    this.selected = null;
    this.dir = 0;
    this.ghost = null;
    this.ray = new THREE.Raycaster();
    this.target = null;      // célula mirada {x,z,reason}
    this.hover = null;       // entidade ou interativo mirado
    this.cableFrom = null;   // primeira ponta do cabo
    this.codeStash = [];
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(CELL * 0.98, 0.02, CELL * 0.98));
    this.box = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
    this.box.visible = false;
    game.scene.add(this.box);
    this.ghostMatOk = new THREE.MeshBasicMaterial({ color: 0x7dffb0, transparent: true, opacity: 0.45, depthWrite: false });
    this.ghostMatBad = new THREE.MeshBasicMaterial({ color: 0xff6a7a, transparent: true, opacity: 0.45, depthWrite: false });
    // seta grande mostrando pra onde a peça vai soltar/levar os itens
    this.arrow = groundArrow(0xffc050, 2.2);
    this.arrow.children[0].position.y = 0.06;
    this.arrow.visible = false;
    game.scene.add(this.arrow);
  }

  hotbar() {
    return ['cabo', ...ORDER.filter((t) => game.economy.inventory[t] > 0)];
  }

  select(type) {
    if (this.selected === type) type = null;
    this.selected = type;
    this.cableFrom = null;
    showPreview(null);
    game.gridMesh.visible = !!type && type !== 'cabo';
    this.refreshGhost();
    audio.play('select', { volume: 0.4 });
    game.emit('hotbar');
  }
  selectIndex(i) {
    const hb = this.hotbar();
    if (i < hb.length) this.select(hb[i]);
  }
  cycle(d) {
    const hb = this.hotbar();
    let i = hb.indexOf(this.selected);
    i = i < 0 ? 0 : (i + d + hb.length) % hb.length;
    this.selected = null;
    this.select(hb[i]);
  }
  rotate() { this.dir = (this.dir + 1) % 4; audio.play('tick', { volume: 0.4 }); }

  refreshGhost() {
    if (this.ghost) { game.scene.remove(this.ghost); this.ghost = null; }
    if (!this.selected || this.selected === 'cabo') return;
    const mk = defOf(this.selected).model;
    const g = new THREE.Group();
    const m = cloneModel(mk);
    m.rotation.y = MODEL_YAW[mk] || 0;
    m.traverse((o) => { if (o.isMesh) { o.material = this.ghostMatOk; o.castShadow = false; } });
    g.add(m);
    this.ghost = g;
    game.scene.add(g);
  }

  cellValid(x, z) {
    const t = this.selected;
    if (x < GRID_MIN || x > GRID_MAX || z < GRID_MIN || z > GRID_MAX) return 'Fora da área da fábrica';
    if (grid.has(key(x, z))) return 'Lugar ocupado';
    const c = cellCenter(x, z);
    if (c.z > 18.5 && c.z < 29 && Math.abs(c.x) < 13) return 'Área do escritório';
    for (const col of colliders) if (Math.hypot(col.x - c.x, col.z - c.z) < col.r + CELL * 0.55) return 'Tem algo no caminho';
    const ore = ores.get(key(x, z));
    if (t === 'minerador' && !ore) return 'O minerador precisa ficar em cima de um veio';
    if (ore && t !== 'minerador') return 'Veio de minério: só minerador aqui';
    const def = defOf(t);
    const p = game.camera.position;
    const pc = worldToCell(p.x, p.z);
    if ((def.solido || DECOR[t]) && pc.x === x && pc.z === z) return 'Você está em cima!';
    return null;
  }

  update() {
    const cam = game.camera;
    const cable = this.selected === 'cabo';
    this.ray.setFromCamera({ x: 0, y: 0 }, cam);
    this.ray.far = REACH_BUILD;
    // mira em entidades / interativos
    const objs = game.entities.map((e) => e.obj).concat(interactables.map((i) => i.obj));
    const hits = this.ray.intersectObjects(objs, true);
    this.hover = null;
    const reach = cable ? REACH_CABLE : REACH_USE;
    for (const h of hits) {
      if (h.distance > reach) break;
      let o = h.object;
      while (o && !o.userData.entity && !interactables.some((i) => i.obj === o)) o = o.parent;
      if (!o) continue;
      if (o.userData.entity) this.hover = { entity: o.userData.entity };
      else this.hover = { interact: interactables.find((i) => i.obj === o) };
      break;
    }
    // chão
    const gh = this.ray.intersectObject(game.ground, false)[0];
    this.target = null;
    if (gh) {
      const c = worldToCell(gh.point.x, gh.point.z);
      this.target = { x: c.x, z: c.z, point: gh.point };
    }
    // fantasma + seta de direção
    if (this.ghost && this.target) {
      const reason = this.cellValid(this.target.x, this.target.z);
      this.target.reason = reason;
      const c = cellCenter(this.target.x, this.target.z);
      this.ghost.position.copy(c);
      this.ghost.rotation.y = -this.dir * Math.PI / 2;
      this.ghost.visible = true;
      const mat = reason ? this.ghostMatBad : this.ghostMatOk;
      this.ghost.traverse((o) => { if (o.isMesh) o.material = mat; });
      const showArrow = this.selected === 'esteira' || !!MACHINES[this.selected]?.solido;
      this.arrow.visible = showArrow;
      this.arrow.position.copy(c);
      this.arrow.rotation.y = -this.dir * Math.PI / 2;
    } else {
      if (this.ghost) this.ghost.visible = false;
      this.arrow.visible = false;
    }
    // caixa de seleção
    const e = this.hover?.entity;
    if (cable) {
      const okTarget = e && canWire(e);
      if (okTarget) {
        this.box.visible = true;
        this.box.position.set(e.pos.x, 0.04, e.pos.z);
        const bad = this.cableFrom ? checkConnect(this.cableFrom, e) : null;
        this.box.material.color.set(bad ? 0xff6a7a : 0x7dffb0);
      } else this.box.visible = false;
      if (this.cableFrom) {
        if (this.cableFrom.removed) { this.cableFrom = null; showPreview(null); }
        else if (okTarget) showPreview(this.cableFrom, wirePoint(e), !checkConnect(this.cableFrom, e));
        else if (this.target) showPreview(this.cableFrom, new THREE.Vector3(this.target.point.x, 0.2, this.target.point.z), false);
        else showPreview(null);
      }
    } else if (e && !this.selected) {
      this.box.visible = true;
      this.box.position.set(e.pos.x, 0.04, e.pos.z);
      this.box.material.color.set(0xffffff);
    } else this.box.visible = false;
  }

  place() {
    if (this.selected === 'cabo') return this.cableClick();
    if (!this.selected || !this.target) return;
    const { x, z, reason } = this.target;
    if (reason) { game.ui.toast(reason, 'warn'); audio.play('deny', { volume: 0.5 }); return; }
    const t = this.selected;
    if (!game.economy.takeItem(t)) return;
    const e = createEntity(t, x, z, this.dir);
    if (t === 'computador' && this.codeStash.length) {
      const s = this.codeStash.pop();
      e.code = s.code;
      game.ui.toast(`Código de '${s.name}' restaurado neste computador 💾`);
    }
    addEntity(e);
    if (t === 'minerador') setOreVisible(x, z, false);
    const c = cellCenter(x, z);
    for (const tf of game.tufts || []) if (Math.hypot(tf.position.x - c.x, tf.position.z - c.z) < CELL * 0.8) tf.visible = false;
    audio.play('place', { pos: c, volume: 0.8 });
    if (MACHINES[t]?.energia && !game.economy.stats.cableHint) {
      game.economy.stats.cableHint = true;
      game.ui.toast('Essa máquina precisa de energia ⚡. Use o 🔌 Cabo (tecla 1) pra ligar ela num gerador.', 'warn');
    }
    if (!game.economy.inventory[t]) { this.selected = null; game.gridMesh.visible = false; this.refreshGhost(); }
    game.emit('hotbar');
  }

  cableClick() {
    const e = this.hover?.entity;
    if (!e || !canWire(e)) {
      game.ui.toast('Mire num gerador, poste ou máquina que usa energia ⚡', 'warn');
      audio.play('deny', { volume: 0.4 });
      return;
    }
    if (!this.cableFrom) {
      this.cableFrom = e;
      audio.play('click', { volume: 0.5 });
      game.ui.toast('Cabo preso! Agora clique na outra ponta (máquina, poste ou gerador).');
      return;
    }
    const err = connect(this.cableFrom, e);
    if (err) { game.ui.toast(err, 'warn'); audio.play('deny', { volume: 0.5 }); return; }
    audio.play('place', { pos: e.pos, volume: 0.6 });
    this.cableFrom = e; // continua ligando a partir daqui
    showPreview(null);
    game.emit('hotbar');
  }

  // clique direito / X
  removeHovered() {
    if (this.selected === 'cabo') {
      if (this.cableFrom) { this.cableFrom = null; showPreview(null); audio.play('close', { volume: 0.4 }); return; }
      const e = this.hover?.entity;
      if (e && wiresOf(e).length) {
        const n = disconnectAll(e);
        audio.play('remove', { pos: e.pos, volume: 0.6 });
        game.ui.toast(`${n} cabo(s) removido(s)`);
      }
      return;
    }
    const e = this.hover?.entity;
    if (!e) return;
    if (e.type === 'computador') this.codeStash.push({ name: e.name, code: e.code });
    removeEntity(e);
    if (e.type === 'minerador') setOreVisible(e.x, e.z, true);
    game.economy.addItem(e.type);
    audio.play('remove', { pos: e.pos, volume: 0.8 });
    game.ui.toast(`${defOf(e.type).nome} guardado no inventário`);
    game.emit('hotbar');
  }
}

export { DIRS };
