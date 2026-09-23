// Interface: HUD, barra de itens, loja, painel de máquina, menus e avisos.
import { game } from './state.js';
import { MACHINES, DECOR, UPGRADES, ITEMS, OBJECTIVES, unlocksAt, RECIPES } from './data.js';
import { thumbs } from './thumbs.js';
import { audio } from './audio.js';
import { Editor } from './editor.js';
import { itemName } from './machines.js';
import { defOf } from './build.js';
import { powerText, usesPower, totals } from './power.js';
import { guideHTML } from './guide.js';

const $ = (s) => document.querySelector(s);
const fmt = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

export class UI {
  constructor() {
    this.overlay = null;
    this.editor = new Editor();
    this.shopTab = 'maquinas';
    this.panelEntity = null;
    game.on('money', () => this.updateStats());
    game.on('xp', () => this.updateStats());
    game.on('inventory', () => this.renderHotbar());
    game.on('hotbar', () => this.renderHotbar());
    game.on('levelup', (l) => this.levelUp(l));
    game.on('objective', (o) => {
      audio.play('quest', { volume: 0.6 });
      this.toast(`✔ Objetivo concluído!${o.premio ? ` +$ ${o.premio}` : ''}`, 'good');
      this.renderObjective();
    });
    audio.onTrackChange = (t) => { $('#track').textContent = t.nome; };

    $('#shop-close').onclick = () => this.closeOverlay();
    document.querySelectorAll('.shop-tab').forEach((b) => { b.onclick = () => { this.shopTab = b.dataset.tab; audio.play('click', { volume: 0.4 }); this.renderShop(); }; });
    $('#panel-close').onclick = () => this.closeOverlay();
    $('#guide-close').onclick = () => this.closeOverlay();
    game.on('power', () => this.updateStats());
    $('#music-next').onclick = () => audio.nextTrack();
    $('#music-toggle').onclick = () => { const on = audio.toggleMusic(); $('#music-toggle').textContent = on ? '⏸' : '▶'; };
    addEventListener('keydown', (e) => {
      if (performance.now() - this.openTime < 200 || e.repeat) return; // a mesma tecla que abriu não fecha
      if (e.target && e.target.tagName === 'INPUT') return;
      if (e.key === 'Escape' && ['shop', 'panel', 'guide'].includes(this.overlay)) { e.preventDefault(); this.closeOverlay(); }
      if (e.code === 'KeyB' && this.overlay === 'shop') this.closeOverlay();
      if (e.code === 'KeyH' && this.overlay === 'guide') this.closeOverlay();
      if (e.code === 'KeyE' && (this.overlay === 'shop' || this.overlay === 'panel')) this.closeOverlay();
    });
  }

  // ─── HUD ───
  updateStats() {
    const eco = game.economy;
    $('#money').textContent = '$ ' + fmt(eco.money);
    $('#level').textContent = eco.level;
    $('#xpbar').style.width = Math.min(100, (eco.xp / eco.xpNeeded) * 100) + '%';
    $('#xptext').textContent = `${fmt(Math.floor(eco.xp))} / ${fmt(eco.xpNeeded)} XP`;
    const t = totals();
    $('#cpu').innerHTML = `🖥️ ${eco.cpuHz} instr/s · <span class="${t.demand > t.supply ? 'bad' : ''}">⚡ ${t.demand}/${t.supply}</span>`;
    if (this.overlay === 'shop') $('#shop-money').textContent = '$ ' + fmt(eco.money);
  }

  renderObjective() {
    const o = OBJECTIVES[game.economy.objective];
    $('#objective').innerHTML = o ? `<div class="obj-title">🎯 Objetivo ${game.economy.objective + 1}/${OBJECTIVES.length}</div><div>${o.texto}</div>${o.premio ? `<div class="obj-prize">Prêmio: $ ${o.premio}</div>` : ''}` : '<div class="obj-title">🌟 Todos os objetivos completos!</div><div>Continue construindo com calma.</div>';
  }

  renderHotbar() {
    const b = game.builder;
    const hb = b.hotbar();
    const inv = game.economy.inventory;
    $('#hotbar').innerHTML = hb.map((t, i) => {
      const def = defOf(t);
      return `<div class="slot ${b.selected === t ? 'sel' : ''} ${t === 'cabo' ? 'tool' : ''}" data-t="${t}"><span class="key">${i < 9 ? i + 1 : ''}</span><img src="${thumbs[t] || ''}"><span class="cnt">${t === 'cabo' ? '∞' : inv[t]}</span><span class="nm">${def.nome}</span></div>`;
    }).join('');
    const sel = b.selected ? defOf(b.selected) : null;
    const keys = b.selected === 'cabo'
      ? '<kbd>Clique</kbd> prender/ligar · <kbd>Botão direito</kbd> soltar o cabo · <kbd>X</kbd> tirar cabos da peça'
      : '<kbd>Clique</kbd> colocar · <kbd>R</kbd> girar (a seta amarela mostra pra onde os itens vão) · <kbd>Q</kbd> guardar na mão';
    $('#buildhint').innerHTML = sel ? `<b>${sel.nome}</b>: ${sel.desc || 'Decoração'}<br>${keys}` : '';
    $('#buildhint').style.display = sel ? 'block' : 'none';
  }

  updatePrompt() {
    const b = game.builder;
    const p = $('#prompt');
    let html = '';
    if (game.mode === 'play' && b.hover) {
      if (b.hover.entity) {
        const e = b.hover.entity;
        const def = defOf(e.type);
        const nm = e.name ? `<b>${e.name}</b> · ${def.nome}` : `<b>${def.nome}</b>`;
        const act = e.type === 'computador' ? '<kbd>E</kbd> programar' : e.isMachine && !['esteira', 'poste'].includes(e.type) ? '<kbd>E</kbd> detalhes' : '';
        html = b.selected === 'cabo' ? `${nm}<br><kbd>Clique</kbd> ligar cabo` : `${nm}<br>${act} ${act ? '·' : ''} <kbd>X</kbd> guardar`;
        if (e.isMachine && e.type !== 'esteira' && e.status) html += `<div class="pstatus">${e.type === 'computador' ? e.statusText : e.status}</div>`;
        const pt = powerText(e);
        if (pt) html += `<div class="ppower ${e.noPower && usesPower(e) ? 'bad' : ''}">${pt}</div>`;
      } else if (b.hover.interact) html = `<kbd>E</kbd> ${b.hover.interact.label}`;
    }
    if (p.innerHTML !== html) p.innerHTML = html;
    p.style.display = html ? 'block' : 'none';
  }

  toast(text, kind = '') {
    const d = document.createElement('div');
    d.className = 'toast ' + kind;
    d.innerHTML = text;
    $('#toasts').appendChild(d);
    setTimeout(() => d.classList.add('out'), 3800);
    setTimeout(() => d.remove(), 4400);
    while ($('#toasts').children.length > 5) $('#toasts').firstChild.remove();
  }

  levelUp(l) {
    audio.play('levelup', { volume: 0.8 });
    const un = unlocksAt(l);
    const el = $('#levelup');
    el.innerHTML = `<div class="lv-title">✨ Nível ${l}! ✨</div>${un.length ? '<div class="lv-sub">Liberado:</div><ul>' + un.map((u) => `<li>${u}</li>`).join('') + '</ul>' : '<div class="lv-sub">Continue assim!</div>'}`;
    el.classList.remove('hidden');
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(this.lvT);
    this.lvT = setTimeout(() => el.classList.add('hidden'), 6500);
    this.updateStats();
  }

  // ─── overlays ───
  openOverlay(name, arg) {
    if (this.overlay) this.closeOverlay(true);
    this.overlay = name;
    this.openTime = performance.now();
    this.prevMode = game.mode;
    if (game.mode !== 'menu') game.setMode('ui'); // no menu, a janela abre por cima dele
    audio.play('open', { volume: 0.5 });
    if (name === 'editor') { $('#editor').classList.remove('hidden'); this.editor.open(arg); }
    if (name === 'shop') { $('#shop').classList.remove('hidden'); if (arg) this.shopTab = arg; this.renderShop(); }
    if (name === 'panel') { this.panelEntity = arg; $('#panel').classList.remove('hidden'); this.renderPanel(true); }
    if (name === 'guide') {
      $('#guide').classList.remove('hidden');
      $('#guide-body').innerHTML = guideHTML();
      if (arg) setTimeout(() => { const h = [...document.querySelectorAll('#guide-body h3')].find((x) => x.textContent.includes(arg)); h?.scrollIntoView(); }, 30);
    }
  }

  closeOverlay(silent) {
    if (!this.overlay) return;
    if (this.overlay === 'editor') { this.editor.close(); $('#editor').classList.add('hidden'); }
    if (this.overlay === 'shop') $('#shop').classList.add('hidden');
    if (this.overlay === 'panel') { $('#panel').classList.add('hidden'); this.panelEntity = null; }
    if (this.overlay === 'guide') $('#guide').classList.add('hidden');
    this.overlay = null;
    if (!silent) {
      audio.play('close', { volume: 0.5 });
      if (this.prevMode === 'menu') return;
      game.setMode(this.prevMode === 'pause' ? 'pause' : 'play');
    }
  }

  // ─── loja ───
  renderShop() {
    const eco = game.economy;
    $('#shop-money').textContent = '$ ' + fmt(eco.money);
    $('#shop-level').textContent = 'Nível ' + eco.level;
    document.querySelectorAll('.shop-tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === this.shopTab));
    const body = $('#shop-body');
    const card = (o) => `<div class="card ${o.locked ? 'locked' : ''}">
      <img src="${o.img || ''}" class="${o.img ? '' : 'noimg'}">
      <div class="c-name">${o.name}</div>
      <div class="c-desc">${o.desc || ''}</div>
      <div class="c-foot">${o.locked ? `<span class="lock">🔒 Nível ${o.lvl}</span>` : o.foot}</div></div>`;
    if (this.shopTab === 'maquinas' || this.shopTab === 'decoracao') {
      const src = this.shopTab === 'maquinas' ? MACHINES : DECOR;
      body.innerHTML = `<div class="cards">${Object.entries(src).map(([k, d]) => card({
        img: thumbs[k], name: d.nome, desc: d.desc || '', locked: d.nivel > eco.level, lvl: d.nivel,
        foot: `<span class="price">$ ${d.preco}</span><span class="own">tem ${eco.inventory[k] || 0}</span>
               <button class="buy" data-k="${k}" data-n="1" ${eco.money < d.preco ? 'disabled' : ''}>Comprar</button>
               ${k === 'esteira' ? `<button class="buy" data-k="${k}" data-n="10" ${eco.money < d.preco * 10 ? 'disabled' : ''}>×10</button>` : ''}`,
      })).join('')}</div>`;
      body.querySelectorAll('.buy').forEach((b) => { b.onclick = () => this.buy(b.dataset.k, +b.dataset.n); });
    } else if (this.shopTab === 'melhorias') {
      body.innerHTML = `<div class="cards">${Object.entries(UPGRADES).map(([k, u]) => {
        const lvl = eco.upgrades[k];
        const maxed = lvl >= u.precos.length;
        const locked = !maxed && u.niveis[lvl] > eco.level;
        const pips = u.valores.map((_, i) => `<i class="${i <= lvl ? 'on' : ''}"></i>`).join('');
        return card({
          name: u.nome, desc: `${u.desc}<br><b>${u.valores[lvl]}${u.unidade}</b>${maxed ? '' : ` → ${u.valores[lvl + 1]}${u.unidade}`}<div class="pips">${pips}</div>`,
          locked, lvl: maxed ? 0 : u.niveis[lvl],
          foot: maxed ? '<span class="own">Máximo! ✨</span>' : `<span class="price">$ ${u.precos[lvl]}</span><button class="up" data-k="${k}" ${eco.money < u.precos[lvl] ? 'disabled' : ''}>Melhorar</button>`,
        });
      }).join('')}</div>`;
      body.querySelectorAll('.up').forEach((b) => { b.onclick = () => this.upgrade(b.dataset.k); });
    } else if (this.shopTab === 'mercado') {
      body.innerHTML = `<p class="muted">Preços por unidade agora. Eles sobem e descem com o tempo — programe suas vendas pra aproveitar os picos! Vender muito de uma vez também abaixa o preço um pouco.</p>
      <table class="market">${Object.keys(ITEMS).map((k) => {
        const p = eco.price(k), tr = eco.trend(k);
        return `<tr><td><img src="${thumbs['item:' + k]}"></td><td><b>${ITEMS[k].nome}</b><br><code>"${k}"</code></td><td><canvas data-k="${k}" width="200" height="40"></canvas></td><td class="${tr > 0.05 ? 'up' : tr < -0.05 ? 'down' : ''}">${tr > 0.05 ? '▲' : tr < -0.05 ? '▼' : '•'} $ ${p.toFixed(1)}</td><td class="muted">vendidos: ${eco.stats.sold[k] || 0}</td></tr>`;
      }).join('')}</table>`;
      body.querySelectorAll('canvas').forEach((c) => this.sparkline(c, eco.history[c.dataset.k]));
    } else if (this.shopTab === 'receitas') {
      body.innerHTML = `<table class="market">${Object.entries(RECIPES).map(([k, r]) => `<tr class="${r.nivel > eco.level ? 'locked' : ''}"><td><img src="${thumbs['item:' + k]}"></td><td><b>${ITEMS[k].nome}</b><br><code>fabricar("${k}")</code></td><td>${Object.entries(r.in).map(([i, n]) => `${n}× ${ITEMS[i].nome}`).join(' + ')}</td><td>${r.tempo}s</td><td>${r.nivel > eco.level ? '🔒 nível ' + r.nivel : '✔'}</td></tr>`).join('')}</table>`;
    }
  }

  sparkline(c, h) {
    const g = c.getContext('2d');
    g.clearRect(0, 0, c.width, c.height);
    if (!h || h.length < 2) return;
    const mn = Math.min(...h), mx = Math.max(...h);
    g.strokeStyle = '#ffc050';
    g.lineWidth = 2;
    g.beginPath();
    h.forEach((v, i) => {
      const x = (i / (h.length - 1)) * (c.width - 4) + 2;
      const y = c.height - 4 - ((v - mn) / (mx - mn || 1)) * (c.height - 8);
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    });
    g.stroke();
  }

  buy(k, n) {
    const d = MACHINES[k] || DECOR[k];
    if (!game.economy.spend(d.preco * n)) { audio.play('deny'); return; }
    game.economy.addItem(k, n);
    audio.play('buy', { volume: 0.6 });
    this.toast(`Comprou ${n > 1 ? n + '× ' : ''}${d.nome}! Está na sua barra (teclas 1-9).`, 'good');
    this.renderShop();
  }

  upgrade(k) {
    const u = UPGRADES[k];
    const lvl = game.economy.upgrades[k];
    if (!game.economy.spend(u.precos[lvl])) { audio.play('deny'); return; }
    game.economy.upgrades[k]++;
    audio.play('levelup', { volume: 0.5 });
    this.toast(`${u.nome}: agora ${u.valores[lvl + 1]}${u.unidade}!`, 'good');
    this.updateStats();
    this.renderShop();
  }

  // ─── painel de máquina ───
  renderPanel(full) {
    const e = this.panelEntity;
    if (!e) return;
    if (e.removed) { this.closeOverlay(); return; }
    const def = MACHINES[e.type];
    if (full) {
      const api = e.api ? e.api() : {};
      $('#panel-img').src = thumbs[e.type] || '';
      $('#panel-type').textContent = def.nome;
      $('#panel-desc').textContent = def.desc;
      const guideTopic = { fornalha: 'Fornalha', montadora: 'Montadora', separador: 'Separador', gerador: 'Energia', gerador_grande: 'Energia', computador: 'computador', minerador: 'Primeira', venda: 'Primeira' }[e.type];
      $('#panel-guide').style.display = guideTopic ? '' : 'none';
      $('#panel-guide').onclick = () => this.openOverlay('guide', guideTopic);
      const inp = $('#panel-name');
      inp.value = e.name;
      inp.onchange = () => {
        const v = inp.value.trim();
        if (!/^[\wÀ-ɏ-]+$/.test(v)) { this.toast('Use só letras, números e _ no nome', 'warn'); inp.value = e.name; return; }
        if (game.entities.some((o) => o !== e && o.name === v)) { this.toast('Já existe uma máquina com esse nome', 'warn'); inp.value = e.name; return; }
        e.rename(v);
        this.toast(`Renomeado para "${v}". Lembre de usar maquina("${v}") no código!`);
      };
      inp.onkeydown = (ev) => { ev.stopPropagation(); if (ev.key === 'Enter') inp.blur(); if (ev.key === 'Escape') this.closeOverlay(); };
      const methods = Object.entries(api).map(([k, m]) => `<div class="meth"><code>.${k}(${m.min ? '"..."' : m.max ? '[...]' : ''})</code> <span>${m.doc || ''}</span></div>`).join('');
      $('#panel-api').innerHTML = `<div class="api-ex"><code>m = maquina("${e.name}")</code></div>${methods}`;
      $('#panel-rotate').onclick = () => { e.dir = (e.dir + 1) % 4; e.obj.rotation.y = -e.dir * Math.PI / 2; audio.play('tick'); import('./machines.js').then((m) => m.refreshBeltsAround(e.x, e.z)); };
      $('#panel-pick').onclick = () => { game.builder.hover = { entity: e }; game.builder.removeHovered(); this.closeOverlay(); };
    }
    $('#panel-info').innerHTML = e.infoLines().map((l) => `<div>${l}</div>`).join('');
  }

  update() {
    if (this.overlay === 'panel') this.renderPanel(false);
    if (this.overlay === 'editor') this.editor.update();
    this.updatePrompt();
  }
}

export { itemName };
