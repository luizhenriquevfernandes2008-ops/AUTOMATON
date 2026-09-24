// Construção: barra de itens, fantasma no grid, colocar/remover, cabos, 2º andar,
// copiar e colar grupos (C / V) e desfazer (Ctrl+Z).
import * as THREE from 'three';
import { game } from './state.js';
import { CELL, WORLD_MIN, WORLD_MAX, MACHINES, DECOR, TOOLS, REGIONS, PIECES, MATERIALS, PAINTS, PAINT_PRICE, PAINTINGS } from './data.js';
import {
  grid, gridUp, ores, key, cellCenter, worldToCell, createEntity, addEntity, removeEntity, MODEL_YAW, DIRS, groundArrow, ELEV,
} from './machines.js';
import { cloneModel } from './assets.js';
import { colliders, interactables, setOreVisible, isBuildableCell, regionAt } from './world.js';
import { audio } from './audio.js';
import { canWire, checkConnect, connect, disconnect, disconnectAll, showPreview, wirePoint, wiresOf } from './power.js';
import {
  structures, structRoot, nearestEdge, edgeKey, edgeCells, edgeDistance, edgeSegment, buildPieceObject, addStructure, removeStructure,
  paintStructure, pieceCost, costText, addPainting, WALL_H,
} from './structures.js';

export const ORDER = [...Object.keys(MACHINES), ...Object.keys(DECOR), ...Object.keys(PAINTINGS)];
export const PIECE_ORDER = [...Object.keys(PIECES), 'pintar'];
export const MAT_ORDER = Object.keys(MATERIALS);
const REACH_BUILD = 14, REACH_USE = 6, REACH_CABLE = 12;
const UPPER = new Set(['esteira_alta']);
const TALL = new Set(['poste', 'tela', 'lampada', 'arvore', 'luminaria', 'antena', 'estatua']); // não cabe esteira elevada por cima

export const defOf = (t) => MACHINES[t] || DECOR[t] || TOOLS[t] || PAINTINGS[t];
const layerOf = (t) => (UPPER.has(t) ? 1 : 0);

export class Builder {
  constructor() {
    this.selected = null;
    this.dir = 0;
    this.ghost = null;
    this.ray = new THREE.Raycaster();
    this.target = null;
    this.hover = null;
    this.cableFrom = null;
    this.codeStash = [];
    this.undoStack = [];
    // copiar/colar
    this.copyMode = false;
    this.copyA = null;
    this.clipboard = null;
    this.pasteMode = false;
    this.pasteRot = 0;
    this.pasteGhost = null;
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(CELL * 0.98, 0.02, CELL * 0.98));
    this.box = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
    this.box.visible = false;
    game.scene.add(this.box);
    this.selBox = new THREE.Mesh(new THREE.BoxGeometry(1, 0.3, 1), new THREE.MeshBasicMaterial({ color: 0x3ee6b8, transparent: true, opacity: 0.18, depthWrite: false }));
    this.selBox.visible = false;
    game.scene.add(this.selBox);
    this.ghostMatOk = new THREE.MeshBasicMaterial({ color: 0x7dffb0, transparent: true, opacity: 0.45, depthWrite: false });
    this.ghostMatBad = new THREE.MeshBasicMaterial({ color: 0xff6a7a, transparent: true, opacity: 0.45, depthWrite: false });
    this.arrow = groundArrow(0xffc050, 2.2);
    this.arrow.children[0].position.y = 0.06;
    this.arrow.visible = false;
    game.scene.add(this.arrow);
    // construção
    this.piece = 'parede';
    this.mat = 'madeira';
    this.paintIdx = 1;
    this.structGhost = null;
    this.structTarget = null;
    game.scene.add(structRoot);
  }

  hotbar() {
    return ['cabo', 'construir', ...ORDER.filter((t) => game.economy.inventory[t] > 0)];
  }

  select(type) {
    if (this.selected === type) type = null;
    this.cancelModes();
    this.selected = type;
    this.cableFrom = null;
    showPreview(null);
    game.gridMesh.visible = !!type && type !== 'cabo' && !PAINTINGS[type];
    this.refreshGhost();
    if (type === 'construir' && !game.economy.stats.buildHint) {
      game.economy.stats.buildHint = true;
      game.ui?.toast('🧱 Construção: <kbd>F</kbd> troca a peça · <kbd>T</kbd> troca o material · <kbd>X</kbd> desmonta');
    }
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
  rotate() {
    if (this.pasteMode) { this.pasteRot = (this.pasteRot + 1) % 4; this.buildPasteGhost(); }
    else this.dir = (this.dir + 1) % 4;
    audio.play('tick', { volume: 0.4 });
  }

  refreshGhost() {
    if (this.ghost) { game.scene.remove(this.ghost); this.ghost = null; }
    this.refreshStructGhost();
    if (!this.selected || this.selected === 'cabo' || this.selected === 'construir' || PAINTINGS[this.selected]) return;
    const mk = defOf(this.selected).model;
    const g = new THREE.Group();
    const m = cloneModel(mk);
    m.rotation.y = MODEL_YAW[mk] || 0;
    m.traverse((o) => { if (o.isMesh) { o.material = this.ghostMatOk; o.castShadow = false; } });
    g.add(m);
    this.ghost = g;
    game.scene.add(g);
  }

  // motivo pra não poder construir (ou null se pode)
  cellValid(x, z, t = this.selected) {
    if (x < WORLD_MIN || x > WORLD_MAX || z < WORLD_MIN || z > WORLD_MAX) return 'Fora do mapa';
    if (!isBuildableCell(x, z)) {
      const r = regionAt(x, z);
      return r ? `Região "${REGIONS[r].nome}" ainda não é sua (compre na placa 🔒)` : 'Fora da área da fábrica';
    }
    const k = key(x, z);
    const c = cellCenter(x, z);
    if (c.z > 18.5 && c.z < 29 && Math.abs(c.x) < 13 && !DECOR[t]?.casa) return 'Área do escritório (aqui só móveis 🛋️ e construção 🧱)';
    for (const col of colliders) if (Math.hypot(col.x - c.x, col.z - c.z) < col.r + CELL * 0.55) return 'Tem algo no caminho';
    if (layerOf(t) === 1) {
      if (gridUp.has(k)) return 'Já tem algo no 2º andar aqui';
      const g = grid.get(k);
      if (g && (g.static || g.isPlatform || TALL.has(g.type))) return 'Tem algo alto demais embaixo';
      return null;
    }
    if (grid.has(k)) return 'Lugar ocupado';
    if ((t === 'rampa_sobe' || t === 'rampa_desce') && gridUp.has(k)) return 'Tem uma esteira elevada em cima';
    const ore = ores.get(k);
    if (t === 'minerador' && !ore) return 'O minerador precisa ficar em cima de um veio';
    if (ore && t !== 'minerador') return 'Veio de minério: só minerador aqui';
    const def = defOf(t);
    const pc = worldToCell(game.camera.position.x, game.camera.position.z);
    if ((def.solido || DECOR[t]) && pc.x === x && pc.z === z) return 'Você está em cima!';
    return null;
  }

  update() {
    const cam = game.camera;
    const cable = this.selected === 'cabo';
    this.ray.setFromCamera({ x: 0, y: 0 }, cam);
    this.ray.far = REACH_BUILD;
    const objs = game.entities.map((e) => e.obj).concat(interactables.map((i) => i.obj), (game.drones || []).map((d) => d.obj), game.pickups || []);
    if (game.pet) objs.push(game.pet.obj);
    objs.push(structRoot);
    const hits = this.ray.intersectObjects(objs, true);
    this.hover = null;
    const building = this.selected === 'construir' || !!PAINTINGS[this.selected];
    const reach = cable ? REACH_CABLE : building ? REACH_BUILD : REACH_USE;
    for (const h of hits) {
      if (h.distance > reach) break;
      let o = h.object;
      while (o && !o.userData.entity && !o.userData.pet && !o.userData.struct && !o.userData.pickup && !interactables.some((i) => i.obj === o)) o = o.parent;
      if (!o) continue;
      if (o.userData.struct) {
        // pisos e tetos não atrapalham mirar nas máquinas (só com a ferramenta de construção)
        const s = o.userData.struct;
        if (!building && s.kind === 'peca' && !PIECES[s.piece].borda) continue;
        this.hover = { struct: s, point: h.point };
        break;
      }
      if (o.userData.pickup) { this.hover = { pickup: o.userData.pickup }; break; }
      if (o.userData.pet) this.hover = { pet: true };
      else if (o.userData.entity) {
        const e = o.userData.entity;
        if (e.isPlatform) this.hover = { interact: interactables.find((i) => i.action === 'platform') };
        else this.hover = { entity: e };
      } else this.hover = { interact: interactables.find((i) => i.obj === o) };
      break;
    }
    // chão (ou 2º andar pra esteira elevada)
    const layer = layerOf(this.selected);
    let gh = null;
    if (layer === 1) {
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -ELEV);
      const p = new THREE.Vector3();
      if (this.ray.ray.intersectPlane(plane, p) && p.distanceTo(cam.position) < REACH_BUILD) gh = { point: p };
    } else gh = this.ray.intersectObject(game.ground, false)[0];
    this.target = null;
    if (gh) {
      const c = worldToCell(gh.point.x, gh.point.z);
      this.target = { x: c.x, z: c.z, point: gh.point };
    }
    // copiar: retângulo de seleção
    if (this.copyMode) {
      this.selBox.visible = !!this.target;
      if (this.target) {
        const a = this.copyA || this.target, b = this.target;
        const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), z0 = Math.min(a.z, b.z), z1 = Math.max(a.z, b.z);
        this.selBox.scale.set((x1 - x0 + 1) * CELL, 1, (z1 - z0 + 1) * CELL);
        this.selBox.position.set((x0 + x1 + 1) / 2 * CELL, 0.15, (z0 + z1 + 1) / 2 * CELL);
      }
    } else this.selBox.visible = false;
    // colar: fantasma do grupo
    if (this.pasteMode && this.pasteGhost) {
      this.pasteGhost.visible = !!this.target;
      if (this.target) {
        this.pasteGhost.position.set(this.target.x * CELL, 0, this.target.z * CELL);
        const bad = this.pasteProblem();
        this.pasteGhost.traverse((o) => { if (o.isMesh) o.material = bad ? this.ghostMatBad : this.ghostMatOk; });
      }
    }
    if (this.selected === 'construir') this.updateStructGhost();
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
      const t = this.selected;
      this.arrow.visible = !!MACHINES[t] && !['poste', 'gerador', 'gerador_grande', 'painel_solar', 'lampada', 'tela', 'altofalante', 'lixeira', 'laboratorio'].includes(t);
      this.arrow.position.set(c.x, layer ? ELEV + 0.7 : 0, c.z);
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
    } else if (e && !this.selected && e.pos) {
      this.box.visible = true;
      this.box.position.set(e.pos.x, (e.layer === 1 ? ELEV : 0) + 0.04, e.pos.z);
      this.box.material.color.set(0xffffff);
    } else this.box.visible = false;
  }

  // ─── construção: paredes, pisos, tetos, pintura ───
  cyclePiece(d = 1) {
    const i = PIECE_ORDER.indexOf(this.piece);
    this.piece = PIECE_ORDER[(i + d + PIECE_ORDER.length) % PIECE_ORDER.length];
    this.refreshStructGhost();
    audio.play('tick', { volume: 0.4 });
    game.emit('hotbar');
  }
  cycleMaterial(d = 1) {
    if (this.piece === 'pintar') this.paintIdx = (this.paintIdx + d + PAINTS.length) % PAINTS.length;
    else {
      const i = MAT_ORDER.indexOf(this.mat);
      this.mat = MAT_ORDER[(i + d + MAT_ORDER.length) % MAT_ORDER.length];
    }
    this.refreshStructGhost();
    audio.play('tick', { volume: 0.4 });
    game.emit('hotbar');
  }
  refreshStructGhost() {
    if (this.structGhost) { game.scene.remove(this.structGhost); this.structGhost = null; }
    if (this.selected !== 'construir' || this.piece === 'pintar') return;
    const g = buildPieceObject(this.piece, this.mat, null, { x: 0, z: 0, o: 'n' });
    g.traverse((o) => { if (o.isMesh) { o.material = this.ghostMatOk; o.castShadow = false; } });
    g.visible = false;
    this.structGhost = g;
    game.scene.add(g);
  }
  // onde a peça iria (chave + posição)
  structSpot() {
    if (!this.target) return null;
    const p = PIECES[this.piece];
    const pt = this.target.point;
    if (p.borda) {
      const e = nearestEdge(pt.x, pt.z);
      return { key: edgeKey(e.x, e.z, e.o), info: e };
    }
    const c = worldToCell(pt.x, pt.z);
    return { key: `${p.alto ? 'c' : 'f'}:${c.x},${c.z}`, info: { x: c.x, z: c.z } };
  }
  structProblem(spot) {
    const p = PIECES[this.piece];
    if (!spot) return 'Mire no chão';
    if (structures.has(spot.key)) return 'Já tem uma peça aqui';
    const cells = p.borda ? edgeCells(spot.info) : [[spot.info.x, spot.info.z]];
    if (!cells.some(([x, z]) => isBuildableCell(x, z))) return 'Fora da área da fábrica';
    if (p.borda) {
      for (const col of colliders) if (edgeDistance(spot.info, col.x, col.z) < col.r + 0.1) return 'Tem algo no caminho';
      const cp = game.camera.position;
      if (!p.passa && edgeDistance(spot.info, cp.x, cp.z) < 0.5) return 'Você está no caminho!';
    }
    const cost = pieceCost(this.piece, this.mat);
    const st = game.economy.materials;
    const falta = Object.entries(cost).filter(([k, n]) => (st[k] || 0) < n);
    if (falta.length) return `Falta material: ${costText(Object.fromEntries(falta))}. Loja → Materiais, ou mande pro Depósito de Materiais`;
    return null;
  }
  updateStructGhost() {
    const g = this.structGhost;
    if (!g) return;
    const spot = this.structSpot();
    this.structTarget = spot;
    if (!spot) { g.visible = false; return; }
    const p = PIECES[this.piece];
    g.visible = true;
    if (p.borda) {
      const s = edgeSegment(spot.info);
      g.position.set((s.ax + s.bx) / 2, 0, (s.az + s.bz) / 2);
      g.rotation.y = spot.info.o === 'n' ? 0 : Math.PI / 2;
    } else g.position.set((spot.info.x + 0.5) * CELL, p.alto ? WALL_H - 0.03 : 0.02, (spot.info.z + 0.5) * CELL);
    spot.reason = this.structProblem(spot);
    const mat = spot.reason ? this.ghostMatBad : this.ghostMatOk;
    g.traverse((o) => { if (o.isMesh) o.material = mat; });
  }
  structClick() {
    if (this.piece === 'pintar') return this.paintClick();
    const spot = this.structTarget || this.structSpot();
    if (!spot) return;
    const why = this.structProblem(spot);
    if (why) { game.ui.toast(why, 'warn'); audio.play('deny', { volume: 0.5 }); return; }
    const cost = pieceCost(this.piece, this.mat);
    const st = game.economy.materials;
    for (const [k, n] of Object.entries(cost)) st[k] -= n;
    const s = addStructure({ key: spot.key, piece: this.piece, mat: this.mat, paint: null, x: spot.info.x, z: spot.info.z });
    this.pushUndo({ kind: 'struct', key: s.key, cost });
    game.economy.stats.built = (game.economy.stats.built || 0) + 1;
    audio.play(MATERIALS[s.mat].vidro ? 'glass' : s.mat === 'madeira' ? 'plank' : 'place', { pos: s.obj.position, volume: 0.7 });
    game.emit('materials');
  }
  paintClick() {
    const s = this.hover?.struct;
    if (!s || s.kind !== 'peca') { game.ui.toast('Mire numa parede, piso ou teto pra pintar 🖌️', 'warn'); return; }
    if (MATERIALS[s.mat].vidro) { game.ui.toast('Vidro não pega tinta 😅', 'warn'); return; }
    const paint = PAINTS[this.paintIdx].cor;
    if (s.paint === paint) return;
    if (paint != null && !game.economy.spend(PAINT_PRICE)) { game.ui.toast(`Tinta custa $ ${PAINT_PRICE}`, 'warn'); audio.play('deny'); return; }
    this.pushUndo({ kind: 'paint', key: s.key, prev: s.paint });
    paintStructure(s, paint);
    if (paint != null) game.economy.stats.painted = (game.economy.stats.painted || 0) + 1;
    audio.play('water', { pos: s.obj.position, volume: 0.35, rate: 1.4 });
  }
  paintingClick() {
    const t = this.selected;
    const s = this.hover?.struct;
    if (!s || s.kind !== 'peca' || s.piece !== 'parede') { game.ui.toast('Mire numa <b>parede</b> (sem janela) pra pendurar o quadro 🖼️', 'warn'); audio.play('deny', { volume: 0.4 }); return; }
    const seg = edgeSegment(s);
    const cp = game.camera.position;
    const side = s.o === 'n' ? Math.sign(cp.z - seg.az) || 1 : Math.sign(cp.x - seg.ax) || 1;
    const k = `p:${s.key}:${side}`;
    if (structures.has(k)) { game.ui.toast('Já tem um quadro desse lado da parede', 'warn'); return; }
    if (!game.economy.takeItem(t)) return;
    addPainting({ key: k, painting: t });
    this.pushUndo({ kind: 'painting', key: k, painting: t });
    audio.play('plank', { volume: 0.5 });
    game.ui.toast(`🖼️ ${PAINTINGS[t].nome} pendurado!`, 'good');
    if (!game.economy.inventory[t]) { this.selected = null; game.gridMesh.visible = false; }
    game.emit('hotbar');
  }
  removeStruct(s) {
    if (s.kind === 'quadro') {
      removeStructure(s.key);
      game.economy.addItem(s.painting);
      this.pushUndo({ kind: 'unpainting', key: s.key, painting: s.painting });
      audio.play('remove', { volume: 0.6 });
      game.ui.toast(`🖼️ ${PAINTINGS[s.painting].nome} guardado`);
      game.emit('hotbar');
      return;
    }
    const cost = pieceCost(s.piece, s.mat);
    removeStructure(s.key);
    const st = game.economy.materials;
    for (const [k, n] of Object.entries(cost)) st[k] = (st[k] || 0) + n;
    this.pushUndo({ kind: 'unstruct', data: { key: s.key, piece: s.piece, mat: s.mat, paint: s.paint, x: s.x, z: s.z }, cost });
    audio.play('remove', { pos: s.obj.position, volume: 0.7 });
    game.ui.toast(`${PIECES[s.piece].nome} desmontada: +${costText(cost)} no estoque · <kbd>Ctrl+Z</kbd> desfaz`);
    game.emit('materials');
  }

  // ─── colocar / tirar (com histórico pro Ctrl+Z) ───
  spawn(t, x, z, dir, data) {
    const e = createEntity(t, x, z, dir);
    if (data) {
      const d = { ...data };
      if (d.name && game.entities.some((o) => o.name === d.name)) delete d.name; // nome já em uso
      e.load(d);
    }
    addEntity(e);
    if (t === 'minerador') setOreVisible(x, z, false);
    const c = cellCenter(x, z);
    for (const tf of game.tufts || []) if (Math.hypot(tf.position.x - c.x, tf.position.z - c.z) < CELL * 0.8) tf.visible = false;
    return e;
  }
  despawn(e) {
    if (e.type === 'computador') this.codeStash.push({ name: e.name, code: e.code });
    removeEntity(e);
    if (e.type === 'minerador') setOreVisible(e.x, e.z, true);
  }
  pushUndo(entry) {
    this.undoStack.push(entry);
    if (this.undoStack.length > 60) this.undoStack.shift();
  }

  place() {
    if (this.copyMode) return this.copyClick();
    if (this.pasteMode) return this.pasteClick();
    if (this.selected === 'cabo') return this.cableClick();
    if (this.selected === 'construir') return this.structClick();
    if (PAINTINGS[this.selected]) return this.paintingClick();
    if (!this.selected || !this.target) return;
    const { x, z, reason } = this.target;
    if (reason) { game.ui.toast(reason, 'warn'); audio.play('deny', { volume: 0.5 }); return; }
    const t = this.selected;
    if (!game.economy.takeItem(t)) return;
    let data = null;
    if (t === 'computador' && this.codeStash.length) {
      const s = this.codeStash.pop();
      data = { code: s.code };
      game.ui.toast(`Código de '${s.name}' restaurado neste computador 💾`);
    }
    const e = this.spawn(t, x, z, this.dir, data);
    this.pushUndo({ kind: 'place', e });
    audio.play('place', { pos: e.pos, volume: 0.8 });
    if (MACHINES[t]?.energia && !game.economy.stats.cableHint) {
      game.economy.stats.cableHint = true;
      game.ui.toast('Essa máquina precisa de energia ⚡. Use o 🔌 Cabo (tecla 1) pra ligar ela num gerador.', 'warn');
    }
    if (!game.economy.inventory[t]) { this.selected = null; game.gridMesh.visible = false; this.refreshGhost(); }
    game.emit('hotbar');
    game.emit('built', e);
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
    const a = this.cableFrom;
    const err = connect(a, e);
    if (err) { game.ui.toast(err, 'warn'); audio.play('deny', { volume: 0.5 }); return; }
    this.pushUndo({ kind: 'wire', a, b: e });
    audio.play('place', { pos: e.pos, volume: 0.6 });
    this.cableFrom = e;
    showPreview(null);
    game.emit('hotbar');
    game.emit('wired');
  }

  // clique direito / X
  removeHovered() {
    if (this.copyMode || this.pasteMode) { this.cancelModes(); return; }
    if (this.selected === 'cabo') {
      if (this.cableFrom) { this.cableFrom = null; showPreview(null); audio.play('close', { volume: 0.4 }); return; }
      const e = this.hover?.entity;
      if (e && wiresOf(e).length) {
        const pairs = wiresOf(e).map((w) => [w.a, w.b]);
        const n = disconnectAll(e);
        this.pushUndo({ kind: 'unwire', pairs });
        audio.play('remove', { pos: e.pos, volume: 0.6 });
        game.ui.toast(`${n} cabo(s) removido(s)`);
      }
      return;
    }
    if (this.hover?.struct) { this.removeStruct(this.hover.struct); return; }
    const e = this.hover?.entity;
    if (!e || !e.type || e.isPlatform) return;
    const snap = this.snapshot(e);
    this.despawn(e);
    game.economy.addItem(e.type);
    this.pushUndo({ kind: 'remove', snaps: [snap] });
    audio.play('remove', { pos: e.pos, volume: 0.8 });
    game.ui.toast(`${defOf(e.type).nome} guardado no inventário · <kbd>Ctrl+Z</kbd> desfaz`);
    game.emit('hotbar');
  }

  // guarda tudo que precisa pra recriar a entidade (inclusive os cabos)
  snapshot(e) {
    return { type: e.type, x: e.x, z: e.z, dir: e.dir, layer: e.layer, data: e.serialize(), wires: wiresOf(e).map((w) => { const o = w.a === e ? w.b : w.a; return [o.x, o.z, o.layer || 0]; }) };
  }
  restore(s) {
    if (!game.economy.takeItem(s.type)) return null;
    const e = this.spawn(s.type, s.x, s.z, s.dir, s.data);
    for (const [x, z, l] of s.wires) {
      const o = (l ? gridUp : grid).get(key(x, z));
      if (o && !o.static && !o.isPlatform) connect(e, o);
    }
    return e;
  }

  rotateEntity(e) {
    this.pushUndo({ kind: 'rotate', e, dir: e.dir });
    e.dir = (e.dir + 1) % 4;
    e.obj.rotation.y = -e.dir * Math.PI / 2;
    game.emit('moved', e);
  }

  undo() {
    const u = this.undoStack.pop();
    if (!u) { game.ui.toast('Nada pra desfazer'); return; }
    switch (u.kind) {
      case 'place':
        if (!u.e.removed) { this.despawn(u.e); game.economy.addItem(u.e.type); }
        break;
      case 'group':
        for (const e of u.ents) if (!e.removed) { this.despawn(e); game.economy.addItem(e.type); }
        break;
      case 'remove':
        for (const s of u.snaps) this.restore(s);
        break;
      case 'wire':
        disconnect(u.a, u.b);
        break;
      case 'unwire':
        for (const [a, b] of u.pairs) if (!a.removed && !b.removed) connect(a, b);
        break;
      case 'rotate':
        if (!u.e.removed) { u.e.dir = u.dir; u.e.obj.rotation.y = -u.dir * Math.PI / 2; game.emit('moved', u.e); }
        break;
      case 'struct': {
        if (!structures.has(u.key)) break;
        removeStructure(u.key);
        const st = game.economy.materials;
        for (const [k, n] of Object.entries(u.cost)) st[k] = (st[k] || 0) + n;
        game.emit('materials');
        break;
      }
      case 'unstruct': {
        if (structures.has(u.data.key)) break;
        const st = game.economy.materials;
        if (Object.entries(u.cost).some(([k, n]) => (st[k] || 0) < n)) { game.ui.toast('Sem material pra reconstruir', 'warn'); break; }
        for (const [k, n] of Object.entries(u.cost)) st[k] -= n;
        addStructure(u.data);
        game.emit('materials');
        break;
      }
      case 'paint': { const s = structures.get(u.key); if (s) paintStructure(s, u.prev); break; }
      case 'painting':
        if (structures.has(u.key)) { removeStructure(u.key); game.economy.addItem(u.painting); }
        break;
      case 'unpainting':
        if (!structures.has(u.key) && game.economy.takeItem(u.painting)) addPainting({ key: u.key, painting: u.painting });
        break;
    }
    audio.play('back', { volume: 0.5 });
    game.ui.toast('↶ Desfeito');
    game.emit('hotbar');
  }

  // ─── copiar e colar grupos ───
  startCopy() {
    this.select(null);
    this.copyMode = true;
    this.copyA = null;
    game.gridMesh.visible = true;
    game.ui.toast('📋 Copiar: clique no primeiro canto da área, depois no segundo. Botão direito cancela.');
  }
  copyClick() {
    if (!this.target) return;
    if (!this.copyA) { this.copyA = { x: this.target.x, z: this.target.z }; audio.play('click', { volume: 0.5 }); return; }
    const a = this.copyA, b = this.target;
    const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), z0 = Math.min(a.z, b.z), z1 = Math.max(a.z, b.z);
    const ents = game.entities.filter((e) => e.x >= x0 && e.x <= x1 && e.z >= z0 && e.z <= z1 && e.type);
    this.copyMode = false;
    this.selBox.visible = false;
    if (!ents.length) { game.ui.toast('Nada pra copiar nessa área', 'warn'); game.gridMesh.visible = false; return; }
    const set = new Set(ents);
    const items = ents.map((e) => {
      const d = e.serialize();
      delete d.name; delete d.inv; delete d.out; delete d.items; delete d.held; delete d.progress;
      return { type: e.type, dx: e.x - x0, dz: e.z - z0, dir: e.dir, data: d };
    });
    const wires = [];
    for (const e of ents) for (const w of wiresOf(e)) if (w.a === e && set.has(w.b)) wires.push([ents.indexOf(w.a), ents.indexOf(w.b)]);
    this.clipboard = { items, wires, w: x1 - x0 + 1, h: z1 - z0 + 1 };
    audio.play('buy', { volume: 0.5 });
    game.ui.toast(`📋 Copiado: ${ents.length} peças. Clique pra colar, <kbd>R</kbd> gira, <kbd>V</kbd> cola de novo depois.`, 'good');
    this.startPaste();
  }
  startPaste() {
    if (!this.clipboard) { game.ui.toast('Copie algo antes com a tecla C', 'warn'); return; }
    this.selected = null;
    this.refreshGhost();
    this.pasteMode = true;
    this.pasteRot = 0;
    game.gridMesh.visible = true;
    this.buildPasteGhost();
    game.emit('hotbar');
  }
  // posição/direção de um item do grupo depois de girar
  rotated(it) {
    const { w, h } = this.clipboard;
    let dx = it.dx, dz = it.dz;
    for (let i = 0; i < this.pasteRot; i++) { const ndx = (i % 2 === 0 ? h : w) - 1 - dz; dz = dx; dx = ndx; }
    return { dx, dz, dir: (it.dir + this.pasteRot) % 4 };
  }
  buildPasteGhost() {
    if (this.pasteGhost) game.scene.remove(this.pasteGhost);
    const g = new THREE.Group();
    for (const it of this.clipboard.items) {
      const r = this.rotated(it);
      const mk = defOf(it.type).model;
      const m = cloneModel(mk);
      m.rotation.y = MODEL_YAW[mk] || 0;
      const holder = new THREE.Group();
      holder.add(m);
      holder.position.set((r.dx + 0.5) * CELL, layerOf(it.type) ? 0 : 0, (r.dz + 0.5) * CELL);
      holder.rotation.y = -r.dir * Math.PI / 2;
      g.add(holder);
    }
    g.traverse((o) => { if (o.isMesh) { o.material = this.ghostMatOk; o.castShadow = false; } });
    this.pasteGhost = g;
    game.scene.add(g);
  }
  pasteNeeds() {
    const need = {};
    for (const it of this.clipboard.items) need[it.type] = (need[it.type] || 0) + 1;
    let cost = 0;
    for (const [t, n] of Object.entries(need)) cost += Math.max(0, n - (game.economy.inventory[t] || 0)) * (defOf(t).preco || 0);
    return { need, cost };
  }
  pasteProblem() {
    if (!this.target) return 'Mire no chão';
    for (const it of this.clipboard.items) {
      const r = this.rotated(it);
      const why = this.cellValid(this.target.x + r.dx, this.target.z + r.dz, it.type);
      if (why) return why;
    }
    const { cost } = this.pasteNeeds();
    if (cost > game.economy.money) return `Faltam peças ($ ${cost}) e não tem dinheiro`;
    return null;
  }
  pasteClick() {
    const why = this.pasteProblem();
    if (why) { game.ui.toast(why, 'warn'); audio.play('deny', { volume: 0.5 }); return; }
    // compra o que faltar
    const { need, cost } = this.pasteNeeds();
    if (cost > 0) {
      for (const [t, n] of Object.entries(need)) { const falta = n - (game.economy.inventory[t] || 0); if (falta > 0) game.economy.addItem(t, falta); }
      game.economy.spend(cost);
      game.ui.toast(`Comprou as peças que faltavam: $ ${cost}`);
    }
    const made = [];
    for (const it of this.clipboard.items) {
      const r = this.rotated(it);
      game.economy.takeItem(it.type);
      made.push(this.spawn(it.type, this.target.x + r.dx, this.target.z + r.dz, r.dir, it.data));
    }
    for (const [i, j] of this.clipboard.wires) if (made[i] && made[j]) connect(made[i], made[j]);
    this.pushUndo({ kind: 'group', ents: made });
    game.economy.stats.pasted = (game.economy.stats.pasted || 0) + 1;
    audio.play('place', { volume: 0.9 });
    game.ui.toast(`📋 Colou ${made.length} peças · <kbd>Ctrl+Z</kbd> desfaz`, 'good');
    game.emit('hotbar');
  }
  cancelModes() {
    const was = this.copyMode || this.pasteMode;
    this.copyMode = false;
    this.pasteMode = false;
    this.copyA = null;
    this.selBox.visible = false;
    if (this.pasteGhost) { game.scene.remove(this.pasteGhost); this.pasteGhost = null; }
    if (was) game.gridMesh.visible = false;
  }
}

export { DIRS };
