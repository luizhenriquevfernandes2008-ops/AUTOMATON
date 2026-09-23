// Editor de código dos computadores.
import { game } from './state.js';
import { EXAMPLES, MACHINES } from './data.js';
import { manualHTML } from './docs.js';
import { guideHTML } from './guide.js';
import { audio } from './audio.js';
import { parse, JiboiaError } from './lang/jiboia.js';

const KW = new Set(['if', 'elif', 'else', 'while', 'for', 'in', 'def', 'return', 'break', 'continue', 'pass', 'and', 'or', 'not', 'is', 'global',
  'se', 'senaose', 'senao', 'enquanto', 'para', 'em', 'funcao', 'retorne', 'pare', 'continuar', 'passe', 'nao']);
const CONSTS = new Set(['True', 'False', 'None', 'Verdadeiro', 'Falso', 'Nada']);
const BUILTINS = new Set(['print', 'escrever', 'mostrar', 'len', 'tamanho', 'range', 'intervalo', 'str', 'texto', 'int', 'inteiro', 'float', 'decimal', 'bool',
  'abs', 'round', 'arredondar', 'min', 'max', 'sum', 'soma', 'list', 'lista', 'dict', 'sorted', 'ordenado', 'aleatorio', 'randint', 'random', 'tipo', 'type',
  'maquina', 'maquinas', 'esperar', 'tempo', 'dinheiro', 'nivel', 'preco', 'itens', 'apitar', 'eu']);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function highlight(src) {
  const re = /(#.*$)|([fF]?"(?:[^"\\]|\\.)*"?|[fF]?'(?:[^'\\]|\\.)*'?)|(\b\d+\.?\d*\b)|(\.[A-Za-z_À-ɏ][\wÀ-ɏ]*)|([A-Za-z_À-ɏ][\wÀ-ɏ]*)|([^#"'\w.]+|.)/gm;
  let out = '', m, prevDef = false;
  while ((m = re.exec(src))) {
    if (m[0] === '') { re.lastIndex++; continue; }
    if (m[1]) out += `<span class="t-com">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="t-str">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="t-num">${m[3]}</span>`;
    else if (m[4]) out += `.<span class="t-meth">${esc(m[4].slice(1))}</span>`;
    else if (m[5]) {
      const w = m[5];
      if (prevDef) out += `<span class="t-def">${w}</span>`;
      else if (KW.has(w)) out += `<span class="t-kw">${w}</span>`;
      else if (CONSTS.has(w)) out += `<span class="t-const">${w}</span>`;
      else if (BUILTINS.has(w)) out += `<span class="t-fn">${w}</span>`;
      else out += esc(w);
      prevDef = w === 'def' || w === 'funcao';
      continue;
    } else out += esc(m[6]);
    if (!/^\s*$/.test(m[0])) prevDef = false;
  }
  return out + '\n';
}

export class Editor {
  constructor() {
    this.el = document.getElementById('editor');
    this.ta = this.el.querySelector('#code');
    this.hl = this.el.querySelector('#code-hl');
    this.gutter = this.el.querySelector('#gutter');
    this.execLine = this.el.querySelector('#exec-line');
    this.errLine = this.el.querySelector('#err-line');
    this.consoleEl = this.el.querySelector('#console');
    this.status = this.el.querySelector('#ed-status');
    this.title = this.el.querySelector('#ed-title');
    this.lint = this.el.querySelector('#ed-lint');
    this.pc = null;
    this.lineH = 21;
    this.tab = 'console';

    this.ta.addEventListener('input', () => this.onInput());
    this.ta.addEventListener('scroll', () => this.syncScroll());
    this.ta.addEventListener('keydown', (e) => this.onKey(e));
    this.el.querySelector('#ed-run').onclick = () => this.run();
    this.el.querySelector('#ed-stop').onclick = () => { this.pc && this.pc.stop(); this.refresh(); };
    this.el.querySelector('#ed-close').onclick = () => game.ui.closeOverlay();
    const sel = this.el.querySelector('#ed-examples');
    EXAMPLES.forEach((ex, i) => { const o = document.createElement('option'); o.value = i; o.textContent = ex.nome; sel.appendChild(o); });
    sel.onchange = () => {
      const ex = EXAMPLES[+sel.value];
      sel.value = '';
      if (!ex || !this.pc) return;
      if (this.ta.value.trim() && !confirm('Substituir o código atual pelo exemplo "' + ex.nome + '"?')) return;
      this.ta.value = ex.code;
      this.onInput();
    };
    this.el.querySelectorAll('.ed-tab').forEach((b) => { b.onclick = () => this.showTab(b.dataset.tab); });
    game.on('console', (pc) => { if (pc === this.pc && this.tab === 'console') this.renderConsole(); });
    game.on('computer', (pc) => { if (pc === this.pc) this.refresh(); });
  }

  open(pc) {
    this.pc = pc;
    this.ta.value = pc.code;
    this.title.textContent = '🐍 ' + pc.name;
    this.onInput();
    this.showTab(this.tab);
    this.refresh();
    setTimeout(() => this.ta.focus(), 50);
  }

  close() {
    if (this.pc) this.pc.code = this.ta.value;
    this.pc = null;
  }

  showTab(t) {
    this.tab = t;
    this.el.querySelectorAll('.ed-tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === t));
    const side = this.el.querySelector('#ed-side');
    if (t === 'console') { side.innerHTML = ''; side.appendChild(this.consoleEl); this.renderConsole(); }
    else if (t === 'manual') { side.innerHTML = manualHTML(game.economy.level); }
    else if (t === 'guia') { side.innerHTML = guideHTML(); }
    else if (t === 'maquinas') this.renderMachines(side);
  }

  renderMachines(side) {
    const list = game.entities.filter((e) => e.isMachine && e.name);
    side.innerHTML = `<div class="doc"><h3>Suas máquinas</h3><p>Clique pra inserir <code>maquina("nome")</code> no código.</p>
      <div class="mlist">${list.map((e) => `<button class="mitem" data-n="${e.name}"><b>${e.name}</b><span>${MACHINES[e.type].nome}</span></button>`).join('') || '<i>Nenhuma máquina ainda.</i>'}</div></div>`;
    side.querySelectorAll('.mitem').forEach((b) => {
      b.onclick = () => this.insert(`maquina("${b.dataset.n}")`);
    });
  }

  insert(text) {
    const ta = this.ta;
    const s = ta.selectionStart, e = ta.selectionEnd;
    ta.setRangeText(text, s, e, 'end');
    ta.focus();
    this.onInput();
  }

  renderConsole() {
    const pc = this.pc;
    if (!pc) return;
    const c = this.consoleEl;
    const atBottom = c.scrollTop + c.clientHeight >= c.scrollHeight - 30;
    c.innerHTML = pc.console.slice(-200).map((l) => `<div class="c-${l.kind}">${esc(l.text)}</div>`).join('') || '<div class="c-sys">O que o programa escrever com print() aparece aqui.</div>';
    if (atBottom) c.scrollTop = c.scrollHeight;
  }

  onInput() {
    const v = this.ta.value;
    this.hl.innerHTML = highlight(v);
    const n = v.split('\n').length;
    let g = '';
    for (let i = 1; i <= n; i++) g += i + '\n';
    this.gutter.textContent = g;
    if (this.pc) this.pc.code = v;
    // checagem de sintaxe enquanto digita
    clearTimeout(this.lintT);
    this.lintT = setTimeout(() => {
      try { parse(v); this.lint.textContent = '✓ sintaxe ok'; this.lint.className = 'ok'; this.lintErr = null; }
      catch (e) {
        if (e instanceof JiboiaError) { this.lint.textContent = `⚠ linha ${e.line}: ${e.message}`; this.lint.className = 'bad'; this.lintErr = e.line; }
      }
      this.refresh();
    }, 350);
    this.syncScroll();
  }

  syncScroll() {
    const y = this.ta.scrollTop, x = this.ta.scrollLeft;
    this.hl.style.transform = `translate(${-x}px, ${-y}px)`;
    this.gutter.style.transform = `translateY(${-y}px)`;
    this.scrollY = y;
    this.positionMarkers();
  }

  positionMarkers() {
    const pc = this.pc;
    const y = this.scrollY || 0;
    const pad = 10;
    if (pc && pc.running) {
      this.execLine.style.display = 'block';
      this.execLine.style.top = (pad + (pc.curLine - 1) * this.lineH - y) + 'px';
      this.execLine.classList.toggle('waiting', pc.lastYield === 'wait');
    } else this.execLine.style.display = 'none';
    const errL = pc && pc.error ? pc.errorLine : null;
    if (errL) {
      this.errLine.style.display = 'block';
      this.errLine.style.top = (pad + (errL - 1) * this.lineH - y) + 'px';
    } else this.errLine.style.display = 'none';
  }

  refresh() {
    const pc = this.pc;
    if (!pc) return;
    this.status.textContent = pc.statusText;
    this.status.className = pc.error ? 'err' : pc.running ? (pc.lastYield === 'wait' ? 'wait' : 'run') : '';
    this.el.querySelector('#ed-run').textContent = pc.running ? '↻ Reiniciar' : '▶ Executar';
    this.el.querySelector('#ed-cpu').textContent = `CPU: ${game.economy.cpuHz} instr/s`;
    this.positionMarkers();
  }

  run() {
    if (!this.pc) return;
    this.pc.code = this.ta.value;
    this.pc.run();
    this.showTab('console');
    this.refresh();
  }

  onKey(e) {
    const ta = this.ta;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); game.ui.closeOverlay(); return; }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); e.stopPropagation(); this.run(); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = ta.selectionStart, en = ta.selectionEnd;
      const v = ta.value;
      if (s !== en || e.shiftKey) {
        const ls = v.lastIndexOf('\n', s - 1) + 1;
        const block = v.slice(ls, en);
        const nb = e.shiftKey ? block.replace(/^ {1,4}/gm, '') : block.replace(/^/gm, '    ');
        ta.setRangeText(nb, ls, en, 'select');
      } else ta.setRangeText('    ', s, s, 'end');
      this.onInput();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const s = ta.selectionStart;
      const v = ta.value;
      const ls = v.lastIndexOf('\n', s - 1) + 1;
      const line = v.slice(ls, s);
      let ind = /^ */.exec(line)[0];
      if (/:\s*(#.*)?$/.test(line)) ind += '    ';
      ta.setRangeText('\n' + ind, s, ta.selectionEnd, 'end');
      this.onInput();
      return;
    }
    if (e.key === 'Backspace' && ta.selectionStart === ta.selectionEnd) {
      const s = ta.selectionStart, v = ta.value;
      const ls = v.lastIndexOf('\n', s - 1) + 1;
      const before = v.slice(ls, s);
      if (before.length >= 4 && /^ +$/.test(before) && before.length % 4 === 0) {
        e.preventDefault();
        ta.setRangeText('', s - 4, s, 'end');
        this.onInput();
      }
    }
    e.stopPropagation();
    void audio;
  }

  update() {
    if (!this.pc) return;
    this.refresh();
  }
}
