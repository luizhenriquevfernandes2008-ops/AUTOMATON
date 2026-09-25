// Dinheiro, XP, níveis, inventário, melhorias e mercado com preços que flutuam.
import { ITEMS, UPGRADES, xpForLevel, START_INVENTORY, START_MONEY, OBJECTIVES, TECHS, REGIONS, ACHIEVEMENTS, INF_TECHS, SATELLITES, FRIEND_LEVELS, RECIPES, SMELT } from './data.js';

const DEFAULT_LIB = `# Biblioteca "util": use importar("util") em qualquer computador
# Tudo que for definido aqui vira disponível no programa.

def vender_se_caro(caixa, item, minimo):
    # vende o item só se o preço estiver bom
    if caixa.preco(item) >= minimo:
        return caixa.vender(item)
    return 0

def minerar_varios(nomes):
    # minera uma vez em cada minerador da lista
    for n in nomes:
        maquina(n).minerar()
`;
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
    // progresso novo
    this.techs = [];
    this.phase = 0;
    this.phaseProgress = {};
    this.launched = false;
    this.regions = [];
    this.achievements = [];
    this.libs = { util: DEFAULT_LIB };
    this.netStore = {};
    this.series = [];          // amostras a cada 10 s pros gráficos
    this.sampleT = 10;
    this.lastEarned = 0;
    this.lastProducedTotal = 0;
    this.lastSeen = Date.now();
    this.offlineReport = null;
    this.tutorialStep = -1;
    // construção, feira e recordes
    this.materials = { madeira: 24, tijolo: 0, concreto: 0, vidro: 0, aco: 0 };
    this.fair = null;
    this.records = { moneyMin: 0, itemsMin: 0, sale: 0 };
    this.recentSale = 0;
    game.on('sold', (v) => { this.recentSale = Math.max(this.recentSale, v); });
    // v1.3: fichas, estrelas, contratos, desafios, discos, programa espacial, correio, Oopi
    this.tokens = 0;             // 🎟️ fichas (contratos, desafios, correio)
    this.stars = 0;              // ⭐ estrelas (missões do Programa Espacial)
    this.contracts = null;       // estado do quadro de contratos (contracts.js)
    this.challenges = {};        // id -> { code, best: { instr, linhas, vars }, solved }
    this.disks = 0;              // 💾 discos ainda não analisados
    this.altRecipes = [];        // receitas alternativas liberadas
    this.crates = [];            // caixas perdidas já abertas
    this.inf = {};               // nível das pesquisas infinitas
    this.sats = {};              // satélites em órbita (tipo -> quantos)
    this.mission = { n: 0, sat: null, progress: {} };
    this.daily = { last: null, streak: 0 };
    this.oopi = { hats: [], colors: ['padrao'], hat: null, color: 'padrao', friend: 0 };
    this.combo = { n: 0, t: 0 };
  }

  // ─── bônus permanentes (pesquisas infinitas × satélites) ───
  infLvl(id) { return this.inf[id] || 0; }
  satLvl(id) { return this.sats[id] || 0; }
  infBonus(id) { return this.infLvl(id) * INF_TECHS[id].efeito; }
  get cpuMul() { return (1 + this.infBonus('cpu')) * (1 + 0.08 * this.satLvl('comunicacao')); }
  get marketMul() { return (1 + this.infBonus('mercado')) * (1 + 0.05 * this.satLvl('mercado')); }
  get logMul() { return (1 + this.infBonus('logistica')) * (1 + 0.06 * this.satLvl('gps')); }
  get farmMul() { return (1 + this.infBonus('horta')) * (1 + 0.12 * this.satLvl('clima')); }
  typeSpeed(type) {
    if (type === 'minerador') return 1 + this.infBonus('mineracao');
    if (type === 'fornalha' || type === 'montadora') return 1 + this.infBonus('fundicao');
    return 1;
  }
  hasAlt(k) { return this.altRecipes.includes(k); }
  addTokens(n) { this.tokens += n; game.emit('tokens', n); }
  spendTokens(n) { if (this.tokens < n) return false; this.tokens -= n; game.emit('tokens', -n); return true; }
  // itens descobertos (álbum)
  discovered(k) { const s = this.stats; return (s.produced[k] || 0) > 0 || (s.sold[k] || 0) > 0 || (k === 'fragmento_estelar' && (s.fragments || 0) > 0) || !!(s.gotItems && s.gotItems[k]); }
  get friendLevel() { let l = 0; FRIEND_LEVELS.forEach((p, i) => { if (this.oopi.friend >= p) l = i; }); return l + 1; }

  // combo de vendas: vendas seguidas (menos de 10 s entre elas) dão bônus de até +20%
  comboSale(total) {
    const c = this.combo;
    c.n = game.time - c.t < 10 ? c.n + 1 : 1;
    c.t = game.time;
    this.stats.bestCombo = Math.max(this.stats.bestCombo || 0, c.n);
    const pct = Math.min(c.n - 1, 10) * 0.02;
    const bonus = Math.round(total * pct * 10) / 10;
    if (bonus > 0) { this.addMoney(bonus); this.stats.earned += bonus; }
    game.emit('combo', c.n);
    return { n: c.n, bonus, pct };
  }

  // ─── recordes (o Oopi comemora) ───
  checkRecords() {
    if (game.time < 90) return;
    const r = this.records;
    const s = this.series.slice(-6);
    const itemsMin = s.length >= 3 ? Math.round((s.reduce((a, b) => a + b.items, 0) / (s.length * 10)) * 60) : 0;
    const tests = [
      ['moneyMin', Math.round(this.moneyPerMinute()), 30, (v) => `$ ${v.toLocaleString('pt-BR')} por minuto`],
      ['itemsMin', itemsMin, 20, (v) => `${v} itens por minuto`],
      ['sale', Math.round(this.recentSale), 100, (v) => `venda de $ ${v.toLocaleString('pt-BR')} de uma vez`],
    ];
    this.recentSale = 0;
    for (const [k, v, min, fmt] of tests) {
      if (v >= min && v > (r[k] || 0) * 1.1 + 1) {
        r[k] = v;
        this.stats.records = (this.stats.records || 0) + 1;
        game.emit('record', { k, v, texto: fmt(v) });
        break;
      }
    }
  }

  // ─── pesquisa ───
  hasTech(id) { return this.techs.includes(id); }
  techBlocked(id) {
    const t = TECHS[id];
    if (!t) return 'Pesquisa desconhecida';
    if (this.hasTech(id)) return 'Já pesquisado';
    if (t.fase > this.phase) return `Precisa completar a fase ${t.fase} do Projeto Foguete`;
    const miss = (t.requer || []).filter((r) => !this.hasTech(r));
    if (miss.length) return 'Precisa antes: ' + miss.map((r) => TECHS[r].nome).join(', ');
    return null;
  }
  unlockTech(id) {
    if (this.hasTech(id)) return;
    this.techs.push(id);
    this.addXp(60 * (TECHS[id].fase + 1));
    game.emit('tech', id);
  }

  // ─── regiões ───
  hasRegion(id) { return this.regions.includes(id); }

  // ─── conquistas ───
  achieve(id) {
    if (this.achievements.includes(id)) return;
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    if (!a) return;
    this.achievements.push(id);
    game.emit('achievement', a);
  }
  checkAchievements() {
    const s = this.stats, p = s.produced;
    const has = (id, ok) => { if (ok) this.achieve(id); };
    const minerios = (p.minerio_ferro || 0) + (p.minerio_cobre || 0) + (p.quartzo || 0) + (p.carvao || 0);
    has('primeiro_minerio', minerios > 0);
    has('primeira_venda', s.soldCount > 0);
    has('primeiro_programa', s.ranCode);
    has('vendeu_100', s.soldCount >= 100);
    has('vendeu_1000', s.soldCount >= 1000);
    has('rico_1k', this.money >= 1000);
    has('rico_10k', this.money >= 10000);
    has('rico_100k', this.money >= 100000);
    has('lingote', (p.lingote_ferro || 0) + (p.lingote_cobre || 0) > 0);
    has('engrenagem', (p.engrenagem || 0) > 0);
    has('chip', (p.chip || 0) > 0);
    has('robozinho', (p.robozinho || 0) > 0);
    has('cinco_pcs', game.entities.filter((e) => e.type === 'computador' && e.running).length >= 5);
    has('erros_10', (s.errors || 0) >= 10);
    has('pesquisa', this.techs.length > 0);
    has('todas_pesquisas', this.techs.length >= Object.keys(TECHS).length);
    has('fase1', this.phase >= 1);
    has('foguete', this.launched);
    has('regiao', this.regions.length > 0);
    has('todas_regioes', this.regions.length >= Object.keys(REGIONS).length);
    has('drone', (s.droneFlights || 0) > 0);
    has('rede', (s.netMsgs || 0) > 0);
    has('biblioteca', (s.libsImported || 0) > 0);
    has('depurador', (s.breakpoints || 0) > 0);
    has('musico', (s.notes || 0) >= 8);
    has('esteiras_100', game.entities.filter((e) => e.type === 'esteira').length >= 100);
    has('noite', !!s.nightSeen);
    has('chuva', !!s.rainSeen);
    has('foto', (s.photos || 0) > 0);
    has('cafe_10', (s.coffees || 0) >= 10);
    has('pet', (s.pets || 0) > 0);
    has('mk3', game.entities.some((e) => e.tier >= 2));
    has('copiar', (s.pasted || 0) > 0);
    has('ouro', !!s.gold);
    has('horta', (s.harvested || 0) > 0);
    has('colheita_100', (s.harvested || 0) >= 100);
    has('estufa', !!s.greenhouse);
    has('arquiteto', (s.built || 0) >= 30);
    has('pintor', (s.painted || 0) > 0);
    has('galeria', (s.paintingsHung || 0) >= 3);
    has('meteoro', (s.fragments || 0) > 0);
    has('aurora', !!s.auroraSeen);
    has('feira', (s.fairSales || 0) > 0);
    has('overclock', (s.hwUpgrades || 0) > 0);
    has('recorde', (s.records || 0) > 0);
    has('oopi_tarefa', (s.oopiTasks || 0) > 0);
    has('contrato', (s.contracts || 0) > 0);
    has('contratos_25', (s.contracts || 0) >= 25);
    has('lendario', (s.legendary || 0) > 0);
    has('relampago', (s.fastContracts || 0) > 0);
    const ch = Object.values(this.challenges);
    has('desafio', ch.some((c) => c.solved));
    has('desafio_ouro', !!s.challengeGold);
    has('desafios_todos', !!s.allChallenges);
    has('disco', (s.disksFound || 0) > 0);
    has('receita_alt', this.altRecipes.length > 0);
    has('satelite2', this.mission.n >= 1);
    has('missao_5', this.mission.n >= 5);
    has('infinita', Object.values(this.inf).some((v) => v > 0));
    has('quantico', (p.computador_quantico || 0) > 0);
    has('combo_10', (s.bestCombo || 0) >= 10);
    has('correio_7', (this.daily.streak || 0) >= 7);
    has('projeto', (s.blueprints || 0) > 0);
    has('album', Object.keys(ITEMS).every((k) => this.discovered(k)));
    has('chapeu', !!this.oopi.hat);
    has('amizade', this.friendLevel >= 5);
  }

  // ─── histórico pros gráficos ───
  sample() {
    const producedTotal = Object.values(this.stats.produced).reduce((a, b) => a + b, 0);
    let sup = 0, dem = 0;
    for (const n of game.powerNets || []) { sup += n.supply; dem += n.demand; }
    this.series.push({
      t: Math.round(game.time),
      money: Math.round((this.stats.earned - this.lastEarned) * 10) / 10,
      items: producedTotal - this.lastProducedTotal,
      supply: Math.round(sup), demand: Math.round(dem),
      cash: Math.round(this.money),
    });
    if (this.series.length > 360) this.series.shift();
    this.lastEarned = this.stats.earned;
    this.lastProducedTotal = producedTotal;
  }
  // dinheiro por minuto nos últimos ~5 min
  moneyPerMinute() {
    const s = this.series.slice(-30);
    if (!s.length) return 0;
    return (s.reduce((a, b) => a + b.money, 0) / (s.length * 10)) * 60;
  }
  // progresso offline: a fábrica rende metade do ritmo recente enquanto você está fora (máx 8h)
  applyOffline(lastSeen) {
    if (!lastSeen) return;
    const secs = Math.min(8 * 3600, (Date.now() - lastSeen) / 1000);
    if (secs < 120) return;
    const perSec = this.moneyPerMinute() / 60;
    const gain = Math.round(perSec * secs * 0.5);
    if (gain <= 0) return;
    this.addMoney(gain);
    this.stats.earned += gain;
    this.offlineReport = { secs, gain };
  }

  get cpuHz() { return UPGRADES.cpu.valores[this.upgrades.cpu]; }
  get beltSpeed() { return UPGRADES.esteira.valores[this.upgrades.esteira] * this.logMul; }
  get machineSpeed() { return UPGRADES.maquinas.valores[this.upgrades.maquinas]; }
  get xpNeeded() { return xpForLevel(this.level); }

  price(item) {
    const m = this.market[item];
    const base = ITEMS[item]?.base;
    if (!m || base == null) return 0;
    const t = this.marketTime;
    const wave = 1 + 0.22 * Math.sin((t * Math.PI * 2) / m.period + m.phase) + 0.08 * Math.sin((t * Math.PI * 2) / (m.period * 0.37) + m.phase * 2.3);
    const fair = this.fair && this.fair.items.includes(item) ? this.fair.mult : 1;
    return Math.max(0.5, Math.round(base * wave * m.sat * fair * this.marketMul * 10) / 10);
  }
  onFair(item) { return !!(this.fair && this.fair.items.includes(item)); }

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
    if (this.onFair(item)) this.stats.fairSales = (this.stats.fairSales || 0) + count;
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
    this.sampleT -= dt;
    if (this.sampleT <= 0) { this.sampleT = 10; this.sample(); }
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
      case 'contract': ok = (s.contracts || 0) > 0; break;
      case 'challenge': ok = Object.values(this.challenges).some((c) => c.solved); break;
      case 'disk': ok = this.altRecipes.length > 0; break;
      case 'launch': ok = this.launched; break;
      case 'mission': ok = this.mission.n >= 1; break;
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
      techs: this.techs, phase: this.phase, phaseProgress: this.phaseProgress, launched: this.launched,
      regions: this.regions, achievements: this.achievements, libs: this.libs, netStore: this.netStore,
      series: this.series.slice(-120), lastSeen: Date.now(), tutorialStep: this.tutorialStep,
      materials: this.materials, records: this.records,
      tokens: this.tokens, stars: this.stars, contracts: this.contracts, challenges: this.challenges, disks: this.disks,
      altRecipes: this.altRecipes, diskChoice: this.diskChoice || null, crates: this.crates, inf: this.inf, sats: this.sats, mission: this.mission, daily: this.daily, oopi: this.oopi,
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
    this.techs = (d.techs || []).filter((t) => TECHS[t]);
    this.phase = d.phase || 0;
    this.phaseProgress = d.phaseProgress || {};
    this.launched = !!d.launched;
    this.regions = (d.regions || []).filter((r) => REGIONS[r]);
    this.achievements = d.achievements || [];
    this.libs = d.libs || { util: DEFAULT_LIB };
    this.netStore = d.netStore || {};
    this.series = d.series || [];
    this.tutorialStep = d.tutorialStep ?? -1;
    this.materials = { ...this.materials, ...(d.materials || {}) };
    this.records = { ...this.records, ...(d.records || {}) };
    this.tokens = d.tokens || 0;
    this.stars = d.stars || 0;
    this.contracts = d.contracts || null;
    this.challenges = d.challenges || {};
    this.disks = d.disks || 0;
    this.altRecipes = (d.altRecipes || []).filter((k) => RECIPES[k]?.alt || SMELT[k]?.alt);
    this.crates = d.crates || [];
    this.diskChoice = (d.diskChoice || []).filter((k) => (RECIPES[k]?.alt || SMELT[k]?.alt) && !this.altRecipes.includes(k));
    if (!this.diskChoice.length) this.diskChoice = null;
    this.inf = Object.fromEntries(Object.entries(d.inf || {}).filter(([k]) => INF_TECHS[k]));
    this.sats = Object.fromEntries(Object.entries(d.sats || {}).filter(([k]) => SATELLITES[k]));
    this.mission = { n: 0, sat: null, progress: {}, ...(d.mission || {}) };
    if (this.mission.sat && !SATELLITES[this.mission.sat]) this.mission.sat = null;
    this.daily = { last: null, streak: 0, ...(d.daily || {}) };
    this.oopi = { ...this.oopi, ...(d.oopi || {}) };
    this.lastEarned = this.stats.earned;
    this.lastProducedTotal = Object.values(this.stats.produced || {}).reduce((a, b) => a + b, 0);
    this.applyOffline(d.lastSeen);
    if (d.sat) for (const [k, v] of Object.entries(d.sat)) if (this.market[k]) this.market[k].sat = v;
  }
}
