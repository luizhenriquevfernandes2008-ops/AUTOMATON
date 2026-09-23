// Oopi: o robozinho mascote que segue você e comenta o que acontece na fábrica.
import * as THREE from 'three';
import { game } from './state.js';
import { cloneModel } from './assets.js';
import { audio } from './audio.js';
import { puff } from './fx.js';

const IDLE_LINES = [
  'Que dia bonito pra automatizar 😊', 'Bip bop! 🤖', 'Já tomou um cafezinho hoje? ☕', 'Essa esteira tá linda!',
  'Tô de olho nos preços do mercado 📈', 'Aperta H se precisar de ajuda!', 'Bossa nova e fábrica: combinação perfeita 🎶',
  'Um dia a gente lança aquele foguete 🚀', 'Quer apostar quem chega primeiro no laboratório?', 'Zzz… ah, oi!',
];

export class Pet {
  constructor() {
    this.obj = new THREE.Group();
    const m = cloneModel('oopi');
    m.scale.setScalar(2.2);
    this.obj.add(m);
    this.obj.traverse((o) => { o.userData.pet = true; });
    this.obj.userData.pet = true;
    this.p = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.hop = 0;
    this.t = 0;
    this.talkT = 25;
    this.bubble = null;
    this.bubbleT = 0;
    this.hearts = 0;
    game.scene.add(this.obj);
    const cam = game.camera.position;
    this.p.set(cam.x + 1.5, 0, cam.z + 1);
    game.on('sold', (v) => { if (v >= 20 && Math.random() < 0.3) this.say(`Uhul! +$ ${v} 💰`); });
    game.on('levelup', (l) => this.say(`Nível ${l}!!! Você é demais ✨`, 5));
    game.on('tech', () => this.say('Pesquisa nova! Vamos testar? 🔬', 5));
    game.on('phaseDone', (n) => this.say(`Fase ${n} do foguete pronta! 🚀`, 5));
    game.on('weather', (w) => { if (w === 'chuva') this.say('Olha a chuva! 🌧️ Os painéis solares vão render menos.'); });
    game.on('computerError', (pc) => { if (Math.random() < 0.6) this.say(`Ih, o ${pc.name} deu erro na linha ${pc.errorLine} 😬`); });
  }
  setVisible(v) { this.obj.visible = v; if (!v && this.bubble) this.bubble.visible = false; }
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
    game.economy.stats.pets = (game.economy.stats.pets || 0) + 1;
    puff(new THREE.Vector3(this.p.x, 0.9, this.p.z), { color: 0xff6ec7, count: 8, size: 0.2, up: 1.4, additive: true, spread: 0.6, life: 1.2 });
    this.say(['Hihi, cócegas! 💜', 'Você é meu humano favorito 💜', 'Bip bip ❤️', 'Obrigado pelo carinho!'][Math.floor(Math.random() * 4)]);
  }
  update(dt) {
    if (!this.obj.visible) return;
    this.t += dt;
    const cam = game.camera.position;
    // fica um pouco atrás e ao lado do jogador
    const fwd = new THREE.Vector3();
    game.camera.getWorldDirection(fwd);
    fwd.y = 0; fwd.normalize();
    const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
    const target = new THREE.Vector3(cam.x, 0, cam.z).addScaledVector(fwd, -1.2).addScaledVector(right, 1.3);
    const d = target.clone().sub(this.p);
    d.y = 0;
    const dist = d.length();
    if (dist > 25) this.p.copy(target); // teletransporta se ficou muito pra trás
    const moving = dist > 0.6;
    if (moving) {
      const speed = Math.min(9, dist * 2.2);
      d.normalize().multiplyScalar(speed * dt);
      this.p.add(d);
      this.obj.rotation.y = Math.atan2(d.x, d.z);
    } else {
      // olha pro jogador
      const look = new THREE.Vector3(cam.x - this.p.x, 0, cam.z - this.p.z);
      this.obj.rotation.y += (Math.atan2(look.x, look.z) - this.obj.rotation.y) * Math.min(1, dt * 3);
    }
    if (this.hop > 0) this.hop -= dt;
    const h = moving ? Math.abs(Math.sin(this.t * 10)) * 0.12 : Math.sin(this.t * 2) * 0.03 + 0.03;
    const hopY = this.hop > 0 ? Math.sin((0.35 - this.hop) / 0.35 * Math.PI) * 0.5 : 0;
    this.obj.position.set(this.p.x, h + hopY, this.p.z);
    if (this.hearts > 0) this.hearts -= dt;
    // falas aleatórias
    this.talkT -= dt;
    if (this.talkT <= 0) { this.talkT = 45 + Math.random() * 60; if (game.mode === 'play') this.say(IDLE_LINES[Math.floor(Math.random() * IDLE_LINES.length)]); }
    if (this.bubble && this.bubble.visible) {
      this.bubbleT -= dt;
      this.bubble.position.set(this.p.x, 1.55 + hopY, this.p.z);
      this.bubble.material.opacity = Math.min(1, this.bubbleT * 2);
      if (this.bubbleT <= 0) this.bubble.visible = false;
    }
  }
}
