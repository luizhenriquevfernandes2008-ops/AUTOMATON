// Dinheiro, XP, níveis, inventário, melhorias e mercado com preços que flutuam.
import { ITEMS, UPGRADES, xpForLevel, START_INVENTORY, START_MONEY, OBJECTIVES } from './data.js';
import { game } from './state.js';

export class Economy {
  constructor() {
    this.money = START_MONEY;
    this.xp = 0;
    this.level = 1;
    this.upgrades = { cpu: 0, esteira: 0, maquinas: 0 };
    this.inventory = { ...START_INVENTORY };
    this.stats = { sold: {}, soldCount: 0, earned: 0, produced: {}, ranCode: false };
    this.objective = 0;
    this.market = {};
    this.marketTime = 0;
    this.history = {};
    let seed = 1;
    for (const k of Object.keys(ITEMS)) {
      seed = (seed * 9301 + 49297) % 233280;
      this.market[k] = { phase: (seed / 233280) * Math.PI * 2, period: 90 + ((seed * 7) % 140), sat: 1 };
      this.history[k] = [];
    }
    this.histTimer = 0;
  }

  get cpuHz() { return UPGRADES.cpu.valores[this.upgrades.cpu]; }
  get beltSpeed() { return UPGRADES.esteira.valores[this.upgrades.esteira]; }
  get machineSpeed() { return UPGRADES.maquinas.valores[this.upgrades.maquinas]; }
  get xpNeeded() { return xpForLevel(this.level); }

  price(item) {
    const m = this.market[item];
    const base = ITEMS[item]?.base;
    if (!m || base == null) return 0;
    const t = this.marketTime;
    const wave = 1 + 0.22 * Math.sin((t * Math.PI * 2) / m.period + m.phase) + 0.08 * Math.sin((t * Math.PI * 2) / (m.period * 0.37) + m.phase * 2.3);
    return Math.max(0.5, Math.round(base * wave * m.sat * 10) / 10);
  }

  trend(item) {
    const h = this.history[item];
    if (!h || h.length < 2) return 0;
    return this.price(item) - h[Math.max(0, h.length - 4)];
  }

  sell(item, count) {
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += this.price(item);
      this.market[item].sat = Math.max(0.55, this.market[item].sat - 0.004);
    }
    total = Math.round(total * 10) / 10;
    this.money = Math.round((this.money + total) * 10) / 10;
    this.stats.sold[item] = (this.stats.sold[item] || 0) + count;
    this.stats.soldCount += count;
    this.stats.earned += total;
    this.addXp(total);
    game.emit('money');
    return total;
  }

  addMoney(n) { this.money = Math.round((this.money + n) * 10) / 10; game.emit('money'); }
  spend(n) {
    if (this.money < n) return false;
    this.money = Math.round((this.money - n) * 10) / 10;
    game.emit('money');
    return true;
  }

  addXp(n) {
    this.xp += n;
    while (this.xp >= this.xpNeeded) {
      this.xp -= this.xpNeeded;
      this.level++;
      game.emit('levelup', this.level);
    }
    game.emit('xp');
  }

  produced(item, n = 1) {
    this.stats.produced[item] = (this.stats.produced[item] || 0) + n;
  }

  addItem(type, n = 1) { this.inventory[type] = (this.inventory[type] || 0) + n; game.emit('inventory'); }
  takeItem(type) {
    if (!this.inventory[type]) return false;
    this.inventory[type]--;
    if (!this.inventory[type]) delete this.inventory[type];
    game.emit('inventory');
    return true;
  }

  update(dt) {
    this.marketTime += dt;
    for (const m of Object.values(this.market)) m.sat += (1 - m.sat) * Math.min(1, dt * 0.012);
    this.histTimer -= dt;
    if (this.histTimer <= 0) {
      this.histTimer = 5;
      for (const k of Object.keys(ITEMS)) {
        const h = this.history[k];
        h.push(this.price(k));
        if (h.length > 60) h.shift();
      }
    }
  }

  checkObjective(ctx) {
    const o = OBJECTIVES[this.objective];
    if (!o) return;
    const s = this.stats;
    const has = (t) => game.entities.some((e) => e.type === t);
    let ok = false;
    switch (o.id) {
      case 'miner': ok = game.entities.some((e) => e.type === 'minerador' && e.oreType === 'ferro'); break;
      case 'seller': ok = has('venda') && game.entities.filter((e) => e.type === 'esteira').length >= 2; break;
      case 'power': {
        const on = (t) => game.entities.some((e) => e.type === t && e.net && e.net.supply > 0);
        ok = on('computador') && on('minerador');
        break;
      }
      case 'computer': ok = game.entities.some((e) => e.type === 'computador' && e.running && !e.noPower && e.instructions > 3); break;
      case 'sell10': ok = s.soldCount >= 10; break;
      case 'level2': ok = this.level >= 2; break;
      case 'ingot': ok = (s.sold.lingote_ferro || 0) + (s.sold.lingote_cobre || 0) > 0; break;
      case 'twoPcs': ok = game.entities.filter((e) => e.type === 'computador' && e.running).length >= 2; break;
      case 'gear': ok = (s.produced.engrenagem || 0) > 0; break;
      case 'chip': ok = (s.produced.chip || 0) > 0; break;
      case 'motor': ok = (s.produced.motor || 0) > 0; break;
      case 'robot': ok = (s.produced.robozinho || 0) > 0; break;
      case 'rich': ok = this.money >= 20000; break;
    }
    void ctx;
    if (ok) {
      this.objective++;
      if (o.premio) this.addMoney(o.premio);
      game.emit('objective', o);
    }
  }

  serialize() {
    return {
      money: this.money, xp: this.xp, level: this.level, upgrades: this.upgrades, inventory: this.inventory,
      stats: this.stats, objective: this.objective, objVersion: 2, marketTime: this.marketTime,
      sat: Object.fromEntries(Object.entries(this.market).map(([k, m]) => [k, m.sat])),
    };
  }
  load(d) {
    Object.assign(this, {
      money: d.money, xp: d.xp, level: d.level, upgrades: { ...this.upgrades, ...d.upgrades },
      inventory: d.inventory || {}, stats: { ...this.stats, ...d.stats }, objective: d.objective || 0, marketTime: d.marketTime || 0,
    });
    // saves antigos não tinham o objetivo de energia (índice 2)
    if (!d.objVersion && this.objective >= 2) this.objective++;
    if (d.sat) for (const [k, v] of Object.entries(d.sat)) if (this.market[k]) this.market[k].sat = v;
  }
}
