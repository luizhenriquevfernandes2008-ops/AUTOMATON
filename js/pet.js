// Oopi: o robozinho mascote. Segue você (sem ficar rodando em volta quando você gira a câmera),
// ganha carinho, comemora recordes e faz tarefinhas: colher a horta, buscar meteoritos e levar itens.
import * as THREE from 'three';
import { game } from './state.js';
import { cloneModel } from './assets.js';
import { audio } from './audio.js';
import { puff } from './fx.js';
import { findByName, itemName } from './machines.js';
import { takeFrom } from './machines2.js';
import { takeItemMesh, releaseItemMesh } from './itemMeshes.js';
import { collectPickup } from './events.js';

const IDLE_LINES = [
  'Que dia bonito pra automatizar 😊', 'Bip bop! 🤖', 'Já tomou um cafezinho hoje? ☕', 'Essa esteira tá linda!',
  'Tô de olho nos preços do mercado 📈', 'Aperta H se precisar de ajuda!', 'Bossa nova e fábrica: combinação perfeita 🎶',
  'Um dia a gente lança aquele foguete 🚀', 'Quer apostar quem chega primeiro no laboratório?', 'Zzz… ah, oi!',
  'Me aperta E se quiser que eu ajude em alguma coisa!', 'Se plantar café, a gente toma o nosso próprio ☕',
];
const NEAR = 2.2, FAR = 4.2, SPEED = 4.6;

export class Pet {
  constructor() {
    this.obj = new THREE.Group();
    const m = cloneModel('oopi');
    m.scale.setScalar(2.2);
    this.body = m;
    this.obj.add(m);
    this.obj.traverse((o) => { o.userData.pet = true; });
    this.obj.userData.pet = true;
    this.p = new THREE.Vector3();
    this.hop = 0;
    this.spin = 0;
    this.t = 0;
    this.talkT = 25;
    this.bubble = null;
    this.bubbleT = 0;
    this.hearts = 0;
    this.mode = 'seguir';     // seguir | ficar
    this.task = null;         // tarefa atual
    this.cargo = null;        // item carregado
    this.mood = 0.6;          // 0..1 (carinho sobe, o tempo baixa devagar)
    this.home = new THREE.Vector3();
    game.scene.add(this.obj);
    const cam = game.camera.position;
    this.p.set(cam.x + 1.5, 0, cam.z + 1);
    game.on('sold', (v) => { if (v >= 20 && Math.random() < 0.3) this.say(`Uhul! +$ ${v} 💰`); });
    game.on('levelup', (l) => { this.say(`Nível ${l}!!! Você é demais ✨`, 5); this.celebrate(); });
    game.on('tech', () => this.say('Pesquisa nova! Vamos testar? 🔬', 5));
    game.on('phaseDone', (n) => { this.say(`Fase ${n} do foguete pronta! 🚀`, 5); this.celebrate(); });
    game.on('weather', (w) => { if (w === 'chuva') this.say('Olha a chuva! 🌧️ Rega a horta de graça.'); });
    game.on('computerError', (pc) => { if (Math.random() < 0.6) this.say(`Ih, o ${pc.name} deu erro na linha ${pc.errorLine} 😬`); });
    game.on('record', (r) => { this.say(`🏆 Recorde! ${r.texto}`, 6); this.celebrate(); });
    game.on('evento_mundo', (t) => {
      if (t === 'feira') this.say('Dia de feira! 🎪 Bora vender caro!', 5);
      if (t === 'aurora') this.say('Que lindo… 🌌', 5);
      if (t === 'arcoiris') this.say('Arco-íris! 🌈', 4);
    });
  }
  setVisible(v) { this.obj.visible = v; if (!v && this.bubble) this.bubble.visible = false; if (!v) this.cancelTask(); }
  say(text, secs = 4) {
    if (!this.obj.visible) return;
    if (!this.bubble) {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 96;
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      this.bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false }));
      this.bubble.renderOrder = 998;
      this.bubble.scale.set(2.6, 0.49, 1);
      game.scene.add(this.bubble);
    }
    const c = this.bubble.material.map.image;
    const g = c.getContext('2d');
    g.clearRect(0, 0, 512, 96);
    g.font = '500 28px "Chakra Petch", sans-serif';
    const w = Math.min(500, g.measureText(text).width + 40);
    g.fillStyle = 'rgba(12,17,25,0.9)';
    g.beginPath(); g.roundRect(256 - w / 2, 8, w, 64, 14); g.fill();
    g.strokeStyle = '#ffb020'; g.lineWidth = 3; g.stroke();
    g.beginPath(); g.moveTo(246, 72); g.lineTo(256, 90); g.lineTo(266, 72); g.fillStyle = 'rgba(12,17,25,0.9)'; g.fill();
    g.fillStyle = '#ece5d5'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, 256, 41);
    this.bubble.material.map.needsUpdate = true;
    this.bubble.visible = true;
    this.bubbleT = secs;
    audio.play('beep', { pos: this.p, volume: 0.25, rate: 1.6 });
  }
  pet() {
    this.hearts = 1.5;
    this.hop = 0.35;
    this.mood = Math.min(1, this.mood + 0.15);
    game.economy.stats.pets = (game.economy.stats.pets || 0) + 1;
    puff(new THREE.Vector3(this.p.x, 0.9, this.p.z), { color: 0xff6ec7, count: 8, size: 0.2, up: 1.4, additive: true, spread: 0.6, life: 1.2 });
    const lines = this.mood > 0.9 ? ['Te amo, humano! 💜💜', 'Melhor dia da minha vida ✨', 'Bip bip bip!!! ❤️'] : ['Hihi, cócegas! 💜', 'Você é meu humano favorito 💜', 'Bip bip ❤️', 'Obrigado pelo carinho!'];
    this.say(lines[Math.floor(Math.random() * lines.length)]);
  }
  // pulinho + giro + confete
  celebrate() {
    this.hop = 0.35;
    this.spin = 1;
    this.mood = Math.min(1, this.mood + 0.05);
    audio.play('record', { pos: this.p, volume: 0.5 });
    const cols = [0xffd35a, 0xff6ec7, 0x5dff8a, 0x7fb2ff];
    for (const c of cols) puff(new THREE.Vector3(this.p.x, 1, this.p.z), { color: c, count: 5, size: 0.14, up: 2.2, gravity: 4, additive: true, spread: 0.8, life: 1.1 });
  }
  get moodText() {
    return this.mood > 0.85 ? 'radiante 🤩' : this.mood > 0.6 ? 'feliz 😊' : this.mood > 0.35 ? 'de boa 🙂' : 'carente 🥺 (faça carinho!)';
  }

  // ─── tarefas ───
  setMode(m) {
    this.mode = m;
    if (m === 'ficar') this.home.copy(this.p);
    this.say(m === 'ficar' ? 'Tá bom, fico aqui 🧍' : 'Bora! Tô te seguindo 🐾');
  }
  cancelTask() {
    if (this.cargo) { releaseItemMesh(this.cargo.mesh); this.cargo = null; }
    this.task = null;
  }
  startTask(t) {
    this.cancelTask();
    this.task = { ...t, step: 0, wait: 0, done: 0 };
    game.economy.stats.oopiTasks = (game.economy.stats.oopiTasks || 0) + 1;
    const msg = { colher: 'Deixa comigo! Vou colher a horta 🧺', meteoritos: 'Vou atrás das pedrinhas brilhantes ☄️', buscar: `Vou buscar ${t.item ? itemName(t.item) : 'itens'} no ${t.from} 📦` }[t.tipo];
    this.say(msg, 4);
  }
  // próximo alvo da tarefa (ou null quando acabou)
  taskTarget() {
    const t = this.task;
    if (t.tipo === 'colher') {
      const ripe = game.entities.filter((e) => e.type === 'canteiro' && e.ready && e.out.length + 3 <= e.outCap);
      if (!ripe.length) return null;
      ripe.sort((a, b) => a.pos.distanceToSquared(this.p) - b.pos.distanceToSquared(this.p));
      return { pos: ripe[0].pos, act: () => { if (ripe[0].harvest()) t.done++; } };
    }
    if (t.tipo === 'meteoritos') {
      const ps = game.events?.pickups || [];
      if (!ps.length) return null;
      const p = [...ps].sort((a, b) => Math.hypot(a.x - this.p.x, a.z - this.p.z) - Math.hypot(b.x - this.p.x, b.z - this.p.z))[0];
      return { pos: new THREE.Vector3(p.x, 0, p.z), act: () => { collectPickup(p, 'oopi'); t.done++; } };
    }
    if (t.tipo === 'buscar') {
      const from = findByName(t.from), to = findByName(t.to);
      if (!from || !to) { this.say('Não achei essas máquinas 🤔'); return null; }
      if (!this.cargo) {
        if (t.done >= t.n) return null;
        return {
          pos: from.pos, act: () => {
            const got = takeFrom(from, t.item || null);
            if (!got) { this.say(`O ${t.from} não tem ${t.item ? itemName(t.item) : 'nada'} 😕`); t.done = t.n; return; }
            const mesh = got.mesh || takeItemMesh(got.type);
            if (mesh.parent !== game.scene) game.scene.add(mesh);
            this.cargo = { type: got.type, mesh };
          },
        };
      }
      return {
        pos: to.pos, act: () => {
          if (to.canAccept && to.canAccept(this.cargo.type, -1)) {
            to.accept(this.cargo.type, -1, this.cargo.mesh);
            this.cargo = null;
            t.done++;
            audio.play('drop', { pos: this.p, volume: 0.4 });
          } else { this.say(`O ${t.to} não quis ${itemName(this.cargo.type)} agora 😕`); t.wait = 3; }
        },
      };
    }
    return null;
  }
  finishTask() {
    const t = this.task;
    const msg = t.tipo === 'colher' ? (t.done ? `Colhi ${t.done} canteiro(s)! 🌽` : 'Nada pronto pra colher ainda 🌱')
      : t.tipo === 'meteoritos' ? (t.done ? `Peguei ${t.done} fragmento(s)! ✨` : 'Não tem pedrinha nenhuma por aí')
        : t.done ? `Entreguei ${t.done} item(ns) 📦` : 'Não consegui buscar 😕';
    this.say(msg, 4);
    if (t.done) this.mood = Math.min(1, this.mood + 0.05);
    this.cancelTask();
  }

  update(dt) {
    if (!this.obj.visible) return;
    this.t += dt;
    this.mood = Math.max(0.1, this.mood - dt / 1800);
    const cam = game.camera.position;
    let goal = null;
    // tarefa?
    if (this.task) {
      if (this.task.wait > 0) this.task.wait -= dt;
      else {
        const tg = this.taskTarget();
        if (!tg) this.finishTask();
        else {
          goal = tg.pos;
          if (Math.hypot(tg.pos.x - this.p.x, tg.pos.z - this.p.z) < 1.1) { tg.act(); this.task && (this.task.wait = 0.7); this.hop = 0.35; }
        }
      }
    }
    // seguir: só anda quando você se afasta; e para a uns 2 m, no lado em que ele já está (não gira junto com a câmera)
    let moving = false;
    const stayHome = this.mode === 'ficar' && !this.task;
    if (!goal) {
      const anchor = stayHome ? this.home : cam;
      const dx = this.p.x - anchor.x, dz = this.p.z - anchor.z;
      const dist = Math.hypot(dx, dz);
      if (!stayHome && dist > 30) this.p.set(cam.x + 1.5, 0, cam.z + 1.5); // ficou muito pra trás: aparece do lado
      else if (dist > (stayHome ? 0.4 : FAR) || this.chasing) {
        this.chasing = dist > (stayHome ? 0.3 : NEAR);
        const k = stayHome ? 0 : NEAR / Math.max(dist, 0.001);
        goal = new THREE.Vector3(anchor.x + dx * k, 0, anchor.z + dz * k);
      }
    }
    if (goal) {
      const d = new THREE.Vector3(goal.x - this.p.x, 0, goal.z - this.p.z);
      const dist = d.length();
      if (dist > 0.05) {
        moving = true;
        const sp = Math.min(this.task || this.chasing ? SPEED * 1.4 : SPEED, dist * 3 + 0.5);
        d.normalize();
        this.p.addScaledVector(d, Math.min(dist, sp * dt));
        this.turnTo(Math.atan2(d.x, d.z), dt * 8);
      }
    }
    if (!moving) {
      // parado: olha pra você
      this.turnTo(Math.atan2(cam.x - this.p.x, cam.z - this.p.z), dt * 3);
    }
    if (this.hop > 0) this.hop -= dt;
    if (this.spin > 0) { this.spin -= dt; this.body.rotation.y = (1 - this.spin) * Math.PI * 2; } else this.body.rotation.y = 0;
    const happy = this.mood > 0.85 && !moving ? Math.abs(Math.sin(this.t * 3)) * 0.06 : 0;
    const h = moving ? Math.abs(Math.sin(this.t * 10)) * 0.12 : Math.sin(this.t * 2) * 0.03 + 0.03 + happy;
    const hopY = this.hop > 0 ? Math.sin((0.35 - this.hop) / 0.35 * Math.PI) * 0.5 : 0;
    this.obj.position.set(this.p.x, h + hopY, this.p.z);
    if (this.cargo) this.cargo.mesh.position.set(this.p.x, this.obj.position.y + 0.95, this.p.z);
    if (this.hearts > 0) this.hearts -= dt;
    // falas aleatórias
    this.talkT -= dt;
    if (this.talkT <= 0) {
      this.talkT = 45 + Math.random() * 60;
      if (game.mode === 'play' && !this.task) this.say(this.mood < 0.35 ? 'Tô com saudade de um carinho… 🥺' : IDLE_LINES[Math.floor(Math.random() * IDLE_LINES.length)]);
    }
    if (this.bubble && this.bubble.visible) {
      this.bubbleT -= dt;
      this.bubble.position.set(this.p.x, 1.55 + hopY, this.p.z);
      this.bubble.material.opacity = Math.min(1, this.bubbleT * 2);
      if (this.bubbleT <= 0) this.bubble.visible = false;
    }
  }
  turnTo(target, k) {
    let d = target - this.obj.rotation.y;
    d = Math.atan2(Math.sin(d), Math.cos(d)); // menor caminho
    this.obj.rotation.y += d * Math.min(1, k);
  }
  serialize() { return { mood: this.mood, mode: this.mode, home: this.mode === 'ficar' ? [this.home.x, this.home.z] : null }; }
  load(d) {
    if (!d) return;
    this.mood = d.mood ?? this.mood;
    this.mode = d.mode === 'ficar' ? 'ficar' : 'seguir';
    if (d.home) { this.home.set(d.home[0], 0, d.home[1]); this.p.copy(this.home); }
  }
}
