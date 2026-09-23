// Dados do jogo: itens, receitas, máquinas, loja, níveis e objetivos.

export const CELL = 1.5; // tamanho de um quadradinho do grid em metros
export const GRID_MIN = -24, GRID_MAX = 23; // área construível (em células)

export const ITEMS = {
  minerio_ferro: { nome: 'Minério de Ferro', base: 2, cor: '#8fa3c0' },
  minerio_cobre: { nome: 'Minério de Cobre', base: 3, cor: '#d9824a' },
  quartzo: { nome: 'Quartzo', base: 5, cor: '#f1c9ff' },
  lingote_ferro: { nome: 'Lingote de Ferro', base: 7, cor: '#cfd6e2' },
  lingote_cobre: { nome: 'Lingote de Cobre', base: 9, cor: '#e8894f' },
  silicio: { nome: 'Silício', base: 16, cor: '#5767a8' },
  engrenagem: { nome: 'Engrenagem', base: 20, cor: '#9aa3c9' },
  fio: { nome: 'Fio de Cobre', base: 6, cor: '#f09a5a' },
  chip: { nome: 'Chip', base: 55, cor: '#3fbf7f' },
  motor: { nome: 'Motor', base: 85, cor: '#7c86b8' },
  robozinho: { nome: 'Robozinho', base: 320, cor: '#e9f0ff' },
};

// Minérios que existem no mapa
export const ORES = {
  ferro: { item: 'minerio_ferro', nome: 'Ferro', cor: 0x9fb4d6, tempo: 3 },
  cobre: { item: 'minerio_cobre', nome: 'Cobre', cor: 0xe8844a, tempo: 3.5 },
  quartzo: { item: 'quartzo', nome: 'Quartzo', cor: 0xf3c4ff, tempo: 4.5, nivel: 5 },
};

// Fornalha: minério -> resultado
export const SMELT = {
  minerio_ferro: { out: 'lingote_ferro', tempo: 2.5, nivel: 2 },
  minerio_cobre: { out: 'lingote_cobre', tempo: 2.5, nivel: 2 },
  quartzo: { out: 'silicio', tempo: 4, nivel: 5 },
};

// Montadora: receitas
export const RECIPES = {
  engrenagem: { in: { lingote_ferro: 2 }, qtd: 1, tempo: 3, nivel: 4 },
  fio: { in: { lingote_cobre: 1 }, qtd: 2, tempo: 2, nivel: 4 },
  chip: { in: { silicio: 1, fio: 2 }, qtd: 1, tempo: 4, nivel: 5 },
  motor: { in: { engrenagem: 2, fio: 2 }, qtd: 1, tempo: 5, nivel: 6 },
  robozinho: { in: { motor: 1, chip: 2 }, qtd: 1, tempo: 8, nivel: 8 },
};

// Máquinas colocáveis
// energia: quanto ⚡ a máquina consome (precisa de cabo ligado num gerador)
// gera: quanto ⚡ o gerador produz
export const MACHINES = {
  esteira: {
    nome: 'Esteira', preco: 5, nivel: 1, prefixo: 'esteira', model: 'belt',
    desc: 'Leva itens na direção das setinhas. Não precisa de energia nem de código.', solido: false,
  },
  gerador: {
    nome: 'Gerador', preco: 150, nivel: 1, prefixo: 'gerador', model: 'generator', gera: 20,
    desc: 'Produz 20 ⚡. Ligue cabos (🔌) dele até as máquinas ou postes.', solido: true,
  },
  poste: {
    nome: 'Poste de Energia', preco: 10, nivel: 1, prefixo: 'poste', model: 'pole',
    desc: 'Leva a energia mais longe. Aceita até 6 cabos.', solido: false,
  },
  minerador: {
    nome: 'Minerador', preco: 60, nivel: 1, prefixo: 'minerador', model: 'miner', energia: 3,
    desc: 'Coloque sobre um veio. O minério sai pela seta laranja. Use .minerar() no código. Gasta 3 ⚡.', solido: true,
  },
  venda: {
    nome: 'Caixa de Venda', preco: 100, nivel: 1, prefixo: 'venda', model: 'seller', energia: 1,
    desc: 'Recebe itens por qualquer lado. Use .vender() pra virar dinheiro. Gasta 1 ⚡.', solido: true,
  },
  computador: {
    nome: 'Computador', preco: 120, nivel: 1, prefixo: 'pc', model: 'computer', energia: 2,
    desc: 'Roda seus programas em Jiboia e controla as máquinas. Gasta 2 ⚡.', solido: true,
  },
  bau: {
    nome: 'Baú', preco: 40, nivel: 2, prefixo: 'bau', model: 'chest',
    desc: 'Guarda até 60 itens. Use .retirar() pra soltar pela seta laranja. Não gasta energia.', solido: true,
  },
  fornalha: {
    nome: 'Fornalha', preco: 120, nivel: 2, prefixo: 'fornalha', model: 'smelter', energia: 4,
    desc: 'Minério entra pelas setas azuis, .fundir() transforma em lingote, que sai pela seta laranja. Gasta 4 ⚡.', solido: true,
  },
  separador: {
    nome: 'Separador', preco: 90, nivel: 3, prefixo: 'separador', model: 'sorter', energia: 1,
    desc: 'Segura um item e manda pra esquerda, direita ou frente. Use .enviar(). Gasta 1 ⚡.', solido: true,
  },
  montadora: {
    nome: 'Montadora', preco: 280, nivel: 4, prefixo: 'montadora', model: 'assembler', energia: 6,
    desc: 'Fabrica peças a partir de lingotes. Use .fabricar("engrenagem"). Gasta 6 ⚡.', solido: true,
  },
  gerador_grande: {
    nome: 'Gerador Grande', preco: 700, nivel: 4, prefixo: 'geradorG', model: 'generatorBig', gera: 60,
    desc: 'Produz 60 ⚡ de uma vez.', solido: true,
  },
};

// ferramentas que ficam sempre na barra
export const TOOLS = {
  cabo: {
    nome: 'Cabo 🔌',
    desc: 'Clique no gerador (ou poste) e depois na máquina pra ligar. Continua ligando em sequência. Botão direito / Q para. X remove os cabos da peça mirada.',
  },
};

// quantos cabos cada coisa aceita
export const WIRE_MAX = { poste: 6, gerador: 4, gerador_grande: 6 };
export const WIRE_MAX_MACHINE = 2;
export const WIRE_MAX_LEN = 16; // metros

// Decoração — pra deixar a fábrica aconchegante
export const DECOR = {
  planta: { nome: 'Vaso de Planta', preco: 15, nivel: 1, model: 'd_plant' },
  flores: { nome: 'Flores', preco: 10, nivel: 1, model: 'd_flowers' },
  arvore: { nome: 'Árvore', preco: 40, nivel: 2, model: 'd_tree' },
  banco: { nome: 'Banco', preco: 40, nivel: 2, model: 'd_bench' },
  luminaria: { nome: 'Luminária', preco: 50, nivel: 3, model: 'd_lamp', luz: true },
  sofa: { nome: 'Sofá', preco: 80, nivel: 3, model: 'd_sofa' },
  cafeteira: { nome: 'Cafeteira', preco: 60, nivel: 4, model: 'd_coffee' },
  barris: { nome: 'Barris', preco: 30, nivel: 4, model: 'd_barrels' },
  antena: { nome: 'Antena Parabólica', preco: 150, nivel: 5, model: 'd_dish' },
  estatua: { nome: 'Estátua do Oopi', preco: 1500, nivel: 8, model: 'd_statue' },
};

export const UPGRADES = {
  cpu: {
    nome: 'Clock da CPU', desc: 'Instruções por segundo em todos os computadores',
    valores: [2, 3, 5, 8, 12], precos: [150, 450, 1200, 3000], niveis: [2, 3, 5, 7], unidade: ' instr/s',
  },
  esteira: {
    nome: 'Motor das Esteiras', desc: 'Velocidade das esteiras',
    valores: [1.0, 1.4, 1.8, 2.4], precos: [120, 450, 1400], niveis: [3, 5, 7], unidade: ' blocos/s',
  },
  maquinas: {
    nome: 'Engrenagens Turbo', desc: 'Velocidade de trabalho das máquinas',
    valores: [1, 1.3, 1.6, 2.0], precos: [250, 800, 2200], niveis: [4, 6, 8], unidade: 'x',
  },
};

export function xpForLevel(level) { // xp necessário pra passar do nível `level` pro próximo
  return Math.round(100 * Math.pow(1.6, level - 1));
}

export function unlocksAt(level) {
  const out = [];
  for (const [k, m] of Object.entries(MACHINES)) if (m.nivel === level) out.push(m.nome);
  for (const [k, r] of Object.entries(RECIPES)) if (r.nivel === level) out.push('Receita: ' + ITEMS[k].nome);
  for (const [k, s] of Object.entries(SMELT)) if (s.nivel === level && level > 2) out.push('Fundir: ' + ITEMS[k].nome);
  for (const [k, u] of Object.entries(UPGRADES)) u.niveis.forEach((n) => { if (n === level) out.push('Melhoria: ' + u.nome); });
  for (const d of Object.values(DECOR)) if (d.nivel === level) out.push('Decoração: ' + d.nome);
  return out;
}

export const START_INVENTORY = { computador: 1, minerador: 1, venda: 1, esteira: 10, gerador: 1, poste: 4 };
export const START_MONEY = 50;

export const STARTER_CODE = `# Bem-vindo à Jiboia! 🐍  (parecida com Python)
# Este programa controla suas máquinas, uma linha de cada vez.
# Aperte ▶ Executar (ou Ctrl+Enter) e veja a setinha andar.

mina = maquina("minerador1")
caixa = maquina("venda1")

while True:
    mina.minerar()
    if caixa.quantidade() >= 5:
        ganho = caixa.vender()
        print(f"Vendi tudo! +$ {ganho}")
`;

export const EXAMPLES = [
  {
    nome: 'Minerar e vender', code: STARTER_CODE,
  },
  {
    nome: 'Vender só com preço bom', code: `# Espera o mercado pagar bem antes de vender
caixa = maquina("venda1")
mina = maquina("minerador1")

while True:
    mina.minerar()
    preco = caixa.preco("minerio_ferro")
    if preco >= 2.3 and caixa.quantidade() > 0:
        print(f"Preço bom ({preco})! Vendendo...")
        caixa.vender()
`,
  },
  {
    nome: 'Fornalha de lingotes', code: `# Minério entra pela esteira, lingote sai pela frente
mina = maquina("minerador1")
forno = maquina("fornalha1")
caixa = maquina("venda1")

while True:
    mina.minerar()
    if forno.quantidade("minerio_ferro") > 0:
        forno.fundir()
    if caixa.quantidade() >= 3:
        caixa.vender()
`,
  },
  {
    nome: 'Separador por tipo', code: `# Manda ferro pra esquerda e o resto pra direita
sep = maquina("separador1")

while True:
    item = sep.esperar_item()
    if item == "minerio_ferro":
        sep.enviar("esquerda")
    else:
        sep.enviar("direita")
`,
  },
  {
    nome: 'Funções e listas', code: `# Controlando várias máquinas com uma função
minas = ["minerador1", "minerador2"]

def trabalhar(nome):
    m = maquina(nome)
    item = m.minerar()
    print(nome, "->", item)

while True:
    for nome in minas:
        trabalhar(nome)
`,
  },
  {
    nome: 'Montadora de engrenagens', code: `forno = maquina("fornalha1")
mont = maquina("montadora1")

while True:
    forno.fundir()
    if mont.pode_fabricar("engrenagem"):
        mont.fabricar("engrenagem")
        print("Engrenagem pronta! ⚙")
`,
  },
];

export const OBJECTIVES = [
  { id: 'miner', texto: 'Coloque o Minerador em cima de um veio de Ferro (cristais azuis). Tecla 1-9 escolhe, R gira, clique coloca. A seta laranja é por onde o minério sai.', premio: 10 },
  { id: 'seller', texto: 'Coloque a Caixa de Venda e ligue a seta laranja do minerador nela com Esteiras. As setinhas nas esteiras mostram pra onde o item vai.', premio: 10 },
  { id: 'power', texto: 'Energia ⚡! Coloque o Gerador e o Computador. Depois escolha o 🔌 Cabo (tecla 1), clique no gerador e depois em cada máquina: minerador, caixa de venda e computador.', premio: 25 },
  { id: 'computer', texto: 'Aperte E no Computador e rode o programa (▶ Executar). Ele precisa estar com energia.', premio: 25 },
  { id: 'sell10', texto: 'Venda 10 itens.', premio: 30 },
  { id: 'level2', texto: 'Chegue ao nível 2.', premio: 30 },
  { id: 'ingot', texto: 'Compre uma Fornalha (loja: tecla B) e venda um lingote.', premio: 60 },
  { id: 'twoPcs', texto: 'Tenha 2 computadores rodando ao mesmo tempo.', premio: 80 },
  { id: 'gear', texto: 'Chegue ao nível 4 e fabrique uma Engrenagem na Montadora.', premio: 150 },
  { id: 'chip', texto: 'Fabrique um Chip (quartzo → silício + fios).', premio: 300 },
  { id: 'motor', texto: 'Fabrique um Motor.', premio: 500 },
  { id: 'robot', texto: 'Fabrique um Robozinho 🤖', premio: 2000 },
  { id: 'rich', texto: 'Junte $ 20.000. Você é o(a) dev da fábrica mais chill do mundo!', premio: 0 },
];
