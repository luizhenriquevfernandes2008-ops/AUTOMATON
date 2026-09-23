// Computador: roda programas Jiboia devagarinho e controla as máquinas.
import * as THREE from 'three';
import { Machine, ENTITY_CLASSES, MachineRef, findByName } from './machines.js';
import { parse, Interpreter, Builtin, Blocking, JiboiaError, JDict, STEP, WAIT, suggest, str } from './lang/jiboia.js';
import { powerText } from './power.js';
import { ITEMS, STARTER_CODE, MACHINES } from './data.js';
import { game } from './state.js';
import { audio } from './audio.js';

const SCREEN_W = 512, SCREEN_H = 234;
// posição da tela em cima do modelo "screen-panel-wide" (coordenadas do modelo já normalizado)
export const SCREEN_POSE = { x: 0, y: 0.775, z: 0.01, rx: -0.2014, ry: Math.PI, w: 1.17, h: 0.535 };

export class Computer extends Machine {
  constructor(type, x, z, dir) {
    super(type, x, z, dir);
    const first = !game.entities.some((e) => e.type === 'computador');
    this.code = first && !game.economy.stats.ranCode ? STARTER_CODE : '# Novo programa\n\nwhile True:\n    print("Olá, fábrica!")\n    esperar(2)\n';
    this.running = false;
    this.console = [];
    this.error = null;
    this.errorLine = null;
    this.curLine = 0;
    this.acc = 0;
    this.timers = [];
    this.instructions = 0;
    this.makeScreen();
    this.dirty = true;
    this.screenTimer = 0;
  }

  makeScreen() {
    const c = document.createElement('canvas');
    c.width = SCREEN_W; c.height = SCREEN_H;
    this.canvas = c;
    this.ctx2d = c.getContext('2d');
    this.tex = new THREE.CanvasTexture(c);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.tex.anisotropy = 4;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_POSE.w, SCREEN_POSE.h), new THREE.MeshBasicMaterial({ map: this.tex, toneMapped: false }));
    m.position.set(SCREEN_POSE.x, SCREEN_POSE.y, SCREEN_POSE.z);
    m.rotation.set(SCREEN_POSE.rx, SCREEN_POSE.ry, 0, 'YXZ');
    m.userData.entity = this;
    this.screen = m;
    this.model.add(m);
    // o modelo interno é girado; a tela fica "na frente" do modelo
  }

  log(text, kind = 'out') {
    this.console.push({ text, kind, t: game.time });
    if (this.console.length > 300) this.console.splice(0, this.console.length - 300);
    this.dirty = true;
    game.emit('console', this);
  }

  run() {
    this.stop(true);
    this.console = [];
    this.error = null; this.errorLine = null;
    let ast;
    try { ast = parse(this.code); }
    catch (e) {
      this.fail(e);
      return false;
    }
    this.interp = new Interpreter(ast, { print: (s) => { this.log(s); audio.play('beep', { pos: this.pos, volume: 0.25 }); }, builtins: this.builtins() });
    this.gen = this.interp.run();
    this.lastYield = STEP;
    this.acc = 1;
    this.running = true;
    this.instructions = 0;
    this.log('▶ Programa iniciado', 'sys');
    game.economy.stats.ranCode = true;
    audio.play('run', { pos: this.pos, volume: 0.6 });
    game.emit('computer', this);
    return true;
  }

  stop(silent) {
    if (this.interp && this.interp.currentBlocking) this.interp.currentBlocking.cancelled = true;
    for (const t of this.timers) t.b.cancelled = true;
    this.timers = [];
    const was = this.running;
    this.running = false;
    this.gen = null;
    this.dirty = true;
    if (was && !silent) { this.log('■ Programa parado', 'sys'); audio.play('stop', { pos: this.pos, volume: 0.5 }); }
    game.emit('computer', this);
  }

  fail(e) {
    const line = e instanceof JiboiaError ? e.line : this.curLine;
    const msg = e instanceof JiboiaError ? e.message : 'Erro interno: ' + (e.message || e);
    if (!(e instanceof JiboiaError)) console.error(e);
    this.error = msg;
    this.errorLine = line;
    this.log(`✖ Linha ${line}: ${msg}`, 'err');
    this.stop(true);
    audio.play('error', { pos: this.pos, volume: 0.6 });
  }

  builtins() {
    const B = (name, fn, min = 0, max = min) => new Builtin(name, fn, min, max);
    const self = this;
    return {
      maquina: B('maquina', ([n]) => {
        if (typeof n !== 'string') throw new JiboiaError('maquina() precisa do nome entre aspas, ex: maquina("minerador1")');
        const e = findByName(n);
        if (!e) {
          const names = game.entities.filter((x) => x.isMachine && x.name).map((x) => x.name);
          const s = suggest(n, names);
          throw new JiboiaError(`Não achei a máquina "${n}"` + (s ? `. Você quis dizer "${s}"?` : names.length ? `. Existem: ${names.slice(0, 8).join(', ')}` : ''));
        }
        return new MachineRef(e);
      }, 1),
      maquinas: B('maquinas', (a) => {
        const t = a[0] ?? null;
        return game.entities.filter((e) => e.isMachine && e.name && (!t || e.type === t)).map((e) => e.name);
      }, 0, 1),
      esperar: B('esperar', ([s]) => {
        if (typeof s !== 'number' || s < 0) throw new JiboiaError('esperar() precisa de um número de segundos');
        const b = new Blocking();
        b.label = 'esperando';
        self.timers.push({ until: game.time + s, b });
        return b;
      }, 1),
      tempo: B('tempo', () => Math.round(game.time * 100) / 100),
      dinheiro: B('dinheiro', () => game.economy.money),
      nivel: B('nivel', () => game.economy.level),
      preco: B('preco', ([t]) => {
        if (!ITEMS[t]) throw new JiboiaError(`O item "${t}" não existe`);
        return game.economy.price(t);
      }, 1),
      itens: B('itens', () => Object.keys(ITEMS)),
      apitar: B('apitar', () => { audio.play('beep', { pos: self.pos, rate: 1.3 }); return null; }),
      eu: B('eu', () => self.name),
      energia: B('energia', () => {
        const n = self.net;
        return new JDict([['gerado', n ? n.supply : 0], ['usado', n ? n.demand : 0], ['nivel', Math.round(self.power * 100) / 100]]);
      }),
    };
  }

  update(dt) {
    this.animate(dt);
    // timers de esperar()
    for (let i = this.timers.length - 1; i >= 0; i--) {
      if (game.time >= this.timers[i].until) { this.timers[i].b.resolve(null); this.timers.splice(i, 1); }
    }
    const pw = this.power;
    if (this.noPower !== (pw <= 0)) { this.noPower = pw <= 0; this.dirty = true; }
    if (this.running && this.gen && pw > 0) {
      const hz = game.economy.cpuHz * pw;
      this.acc = Math.min(this.acc + dt * hz, Math.max(1.5, hz * 0.25));
      let guard = 0;
      try {
        while (this.running && guard++ < 200) {
          if (this.lastYield === STEP) {
            if (this.acc < 1) break;
            this.acc -= 1;
            this.instructions++;
          }
          const r = this.gen.next();
          if (r.done) {
            this.running = false;
            this.log('✔ Programa terminou', 'sys');
            game.emit('computer', this);
            break;
          }
          const prevLine = this.curLine;
          this.lastYield = r.value;
          this.curLine = this.interp.line;
          if (prevLine !== this.curLine) this.dirty = true;
          if (r.value === WAIT) break;
        }
      } catch (e) {
        this.fail(e);
      }
    }
    this.screenTimer -= dt;
    if (this.dirty && this.screenTimer <= 0) {
      const d = this.pos.distanceTo(game.camera.position);
      if (d < 30) { this.drawScreen(); this.dirty = false; this.screenTimer = 0.15; }
    }
  }

  animate(dt) {
    this.anim += dt;
    if (this.noPower) {
      this.lamp.material.color.setHex(0xff4455);
      this.lamp.material.emissive.setHex(0xff2233);
      this.lamp.material.emissiveIntensity = Math.sin(this.anim * 4) > 0 ? 1.4 : 0.1;
      return;
    }
    const col = this.error ? 0xff5566 : this.running ? (this.lastYield === WAIT ? 0xffc44d : 0x5dff8a) : 0x666677;
    this.lamp.material.color.setHex(col);
    this.lamp.material.emissive.setHex(col);
    this.lamp.material.emissiveIntensity = this.running ? 1 + Math.sin(this.anim * 8) * 0.4 : 0.4;
  }

  get statusText() {
    if (this.noPower) return 'Sem energia ⚡ (ligue um cabo 🔌)';
    if (this.error) return 'Erro na linha ' + this.errorLine;
    if (!this.running) return 'Parado';
    if (this.lastYield === WAIT) return 'Esperando: ' + (this.interp?.waitLabel || '...');
    return 'Executando linha ' + this.curLine;
  }

  drawScreen() {
    const g = this.ctx2d;
    if (this.noPower) {
      g.fillStyle = '#07060d';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      g.fillStyle = '#ff6a7a';
      g.font = '600 30px "Chakra Petch", sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('⚡ SEM ENERGIA', SCREEN_W / 2, SCREEN_H / 2 - 16);
      g.fillStyle = '#8f89b8';
      g.font = '400 18px "Chakra Petch", sans-serif';
      g.fillText('Ligue um cabo 🔌 do gerador até aqui', SCREEN_W / 2, SCREEN_H / 2 + 20);
      g.textAlign = 'left';
      this.tex.needsUpdate = true;
      return;
    }
    g.fillStyle = '#1b1830';
    g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    // barra de título
    g.fillStyle = this.error ? '#7a2a3a' : this.running ? '#2f5a44' : '#3a3560';
    g.fillRect(0, 0, SCREEN_W, 34);
    g.font = '600 20px "Chakra Petch", sans-serif';
    g.fillStyle = '#fff4e0';
    g.textBaseline = 'middle';
    g.fillText('🐍 ' + this.name, 12, 18);
    g.textAlign = 'right';
    g.font = '500 16px "Chakra Petch", sans-serif';
    g.fillText(this.statusText, SCREEN_W - 10, 18);
    g.textAlign = 'left';
    // código
    const lines = this.code.split('\n');
    const lh = 19, visible = Math.floor((SCREEN_H - 84) / lh);
    const focus = this.error ? this.errorLine : this.running ? this.curLine : 1;
    let start = Math.max(1, Math.min(focus - 4, lines.length - visible + 1));
    g.font = '15px "JetBrains Mono", monospace';
    for (let i = 0; i < visible; i++) {
      const ln = start + i;
      if (ln > lines.length) break;
      const y = 44 + i * lh;
      if (ln === focus && (this.running || this.error)) {
        g.fillStyle = this.error ? 'rgba(255,80,100,0.35)' : 'rgba(255,200,80,0.28)';
        g.fillRect(0, y - 2, SCREEN_W, lh);
        g.fillStyle = this.error ? '#ff7a8a' : '#ffc850';
        g.fillText('▶', 4, y + 9);
      }
      g.fillStyle = '#6d6a90';
      g.fillText(String(ln).padStart(2, ' '), 20, y + 9);
      const txt = lines[ln - 1];
      const t = txt.trim();
      g.fillStyle = t.startsWith('#') ? '#7f8a6a' : '#e8e4ff';
      g.fillText(txt.length > 50 ? txt.slice(0, 49) + '…' : txt, 50, y + 9);
    }
    // última saída
    g.fillStyle = '#131126';
    g.fillRect(0, SCREEN_H - 44, SCREEN_W, 44);
    const last = this.console.slice(-2);
    g.font = '14px "JetBrains Mono", monospace';
    last.forEach((l, i) => {
      g.fillStyle = l.kind === 'err' ? '#ff7a8a' : l.kind === 'sys' ? '#8fb0ff' : '#b8f5c8';
      const s = '> ' + l.text;
      g.fillText(s.length > 58 ? s.slice(0, 57) + '…' : s, 10, SCREEN_H - 32 + i * 18);
    });
    this.tex.needsUpdate = true;
  }

  api() { return {}; }
  infoLines() { return [this.statusText, powerText(this), `Instruções executadas: ${this.instructions}`]; }
  serialize() { return { ...super.serialize(), code: this.code, running: this.running }; }
  load(d) {
    super.load(d);
    if (typeof d.code === 'string') this.code = d.code;
    this.dirty = true;
    if (d.running) setTimeout(() => { if (!this.removed) this.run(); }, 500);
  }
  onRemove() { this.stop(true); super.onRemove(); }
}

ENTITY_CLASSES.computador = Computer;
void MACHINES; void str;
