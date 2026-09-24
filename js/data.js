// Dados do jogo: itens, receitas, máquinas, loja, níveis e objetivos.

export const CELL = 1.5; // tamanho de um quadradinho do grid em metros
export const GRID_MIN = -24, GRID_MAX = 23; // área inicial construível (em células)
export const WORLD_MIN = -48, WORLD_MAX = 47; // mapa inteiro (com as regiões compráveis)

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
  carvao: { nome: 'Carvão', base: 3, cor: '#3a3a44' },
  escoria: { nome: 'Escória', base: 0.5, cor: '#7a6a5a' },
  tijolo: { nome: 'Tijolo', base: 6, cor: '#c0643c' },
  aco: { nome: 'Aço', base: 24, cor: '#8d9ab0' },
  viga: { nome: 'Viga de Aço', base: 55, cor: '#6f7d96' },
  processador: { nome: 'Processador', base: 170, cor: '#2f6fd6' },
  modulo_foguete: { nome: 'Módulo de Foguete', base: 1200, cor: '#f0f0f5' },
  satelite: { nome: 'Satélite', base: 1500, cor: '#ffd35a' },
  // horta
  grao_cafe: { nome: 'Grão de Café', base: 12, cor: '#6b3a22', horta: true },
  melancia: { nome: 'Melancia', base: 30, cor: '#3f9a4a', horta: true },
  abobora: { nome: 'Abóbora', base: 24, cor: '#f08a2a', horta: true },
  milho: { nome: 'Milho', base: 7, cor: '#f2d04a', horta: true },
  cenoura: { nome: 'Cenoura', base: 5, cor: '#f0782a', horta: true },
  // materiais de construção
  madeira: { nome: 'Madeira', base: 4, cor: '#b07a4a', material: true },
  concreto: { nome: 'Concreto', base: 9, cor: '#9a9ea6', material: true },
  vidro: { nome: 'Vidro', base: 12, cor: '#9fd8ff', material: true },
  // raro: cai com a chuva de meteoros
  fragmento_estelar: { nome: 'Fragmento Estelar', base: 60, cor: '#b18cff' },
  // itens de ponta (v1.3): contratos lendários e Programa Espacial
  bateria: { nome: 'Bateria', base: 75, cor: '#5dd39e' },
  painel_led: { nome: 'Painel de LED', base: 110, cor: '#ff6ec7' },
  computador_quantico: { nome: 'Computador Quântico', base: 950, cor: '#6cf5ff' },
};

// Minérios que existem no mapa
export const ORES = {
  ferro: { item: 'minerio_ferro', nome: 'Ferro', cor: 0x9fb4d6, tempo: 3 },
  cobre: { item: 'minerio_cobre', nome: 'Cobre', cor: 0xe8844a, tempo: 3.5 },
  quartzo: { item: 'quartzo', nome: 'Quartzo', cor: 0xf3c4ff, tempo: 4.5, nivel: 5 },
  carvao: { item: 'carvao', nome: 'Carvão', cor: 0x2e2e38, tempo: 3, tech: 'carvao' },
  estelar: { item: 'fragmento_estelar', nome: 'Meteorito', cor: 0xb18cff, tempo: 5, raro: true },
};

// Fornalha: receitas (a chave é o que você passa em .fundir(...)). escoria = quanto de escória sobra por fundição
export const SMELT = {
  minerio_ferro: { in: { minerio_ferro: 1 }, out: 'lingote_ferro', tempo: 2.5, nivel: 2, escoria: 0.5 },
  minerio_cobre: { in: { minerio_cobre: 1 }, out: 'lingote_cobre', tempo: 2.5, nivel: 2, escoria: 0.5 },
  quartzo: { in: { quartzo: 1 }, out: 'silicio', tempo: 4, nivel: 5 },
  aco: { in: { lingote_ferro: 1, carvao: 1 }, out: 'aco', tempo: 4, nivel: 2, tech: 'metalurgia', escoria: 1 },
  vidro: { in: { quartzo: 2 }, out: 'vidro', tempo: 3, nivel: 5 },
  // receitas alternativas (liberadas analisando 💾 discos de dados)
  silicio_puro: { in: { quartzo: 1, carvao: 1 }, out: 'silicio', qtd: 2, tempo: 5, nivel: 5, alt: true },
  aco_direto: { in: { minerio_ferro: 2, carvao: 1 }, out: 'aco', tempo: 5, nivel: 2, alt: true },
  vidro_temperado: { in: { quartzo: 1, escoria: 2 }, out: 'vidro', tempo: 3, nivel: 5, alt: true },
};

// Montadora: receitas
export const RECIPES = {
  engrenagem: { in: { lingote_ferro: 2 }, qtd: 1, tempo: 3, nivel: 4 },
  fio: { in: { lingote_cobre: 1 }, qtd: 2, tempo: 2, nivel: 4 },
  chip: { in: { silicio: 1, fio: 2 }, qtd: 1, tempo: 4, nivel: 5 },
  motor: { in: { engrenagem: 2, fio: 2 }, qtd: 1, tempo: 5, nivel: 6 },
  robozinho: { in: { motor: 1, chip: 2 }, qtd: 1, tempo: 8, nivel: 8 },
  tijolo: { in: { escoria: 3 }, qtd: 1, tempo: 3, nivel: 4 },
  viga: { in: { aco: 2 }, qtd: 1, tempo: 4, nivel: 4, tech: 'metalurgia' },
  processador: { in: { chip: 2, silicio: 1 }, qtd: 1, tempo: 6, nivel: 5, tech: 'foguete' },
  modulo_foguete: { in: { motor: 2, viga: 4, processador: 1 }, qtd: 1, tempo: 12, nivel: 5, tech: 'foguete' },
  satelite: { in: { processador: 2, robozinho: 1, fio: 4 }, qtd: 1, tempo: 14, nivel: 5, tech: 'foguete' },
  concreto: { in: { escoria: 2, quartzo: 1 }, qtd: 2, tempo: 3, nivel: 5 },
  bateria: { in: { lingote_cobre: 2, carvao: 1, aco: 1 }, qtd: 1, tempo: 5, nivel: 5, tech: 'eletronica' },
  painel_led: { in: { vidro: 1, chip: 1, fio: 2 }, qtd: 1, tempo: 6, nivel: 5, tech: 'eletronica' },
  computador_quantico: { in: { processador: 2, fragmento_estelar: 2, bateria: 1 }, qtd: 1, tempo: 16, nivel: 5, tech: 'quantica' },
  // receitas alternativas (💾 discos de dados). out = item que sai
  engrenagem_fundida: { in: { aco: 1 }, out: 'engrenagem', qtd: 2, tempo: 3, nivel: 4, alt: true },
  fio_de_ferro: { in: { lingote_ferro: 2 }, out: 'fio', qtd: 3, tempo: 3, nivel: 4, alt: true },
  chip_reciclado: { in: { fio: 3, quartzo: 1 }, out: 'chip', qtd: 1, tempo: 5, nivel: 5, alt: true },
  motor_compacto: { in: { engrenagem: 1, chip: 1 }, out: 'motor', qtd: 1, tempo: 5, nivel: 6, alt: true },
  tijolo_prensado: { in: { escoria: 2, carvao: 1 }, out: 'tijolo', qtd: 2, tempo: 3, nivel: 4, alt: true },
  concreto_armado: { in: { escoria: 1, aco: 1 }, out: 'concreto', qtd: 4, tempo: 4, nivel: 5, alt: true },
  robozinho_simples: { in: { motor: 2, processador: 1 }, out: 'robozinho', qtd: 1, tempo: 9, nivel: 8, alt: true },
  bateria_de_sal: { in: { lingote_cobre: 1, escoria: 3 }, out: 'bateria', qtd: 1, tempo: 6, nivel: 5, tech: 'eletronica', alt: true },
};
// item que uma receita (da fornalha ou da montadora) produz
export const recipeOut = (k, r) => r.out || k;

// ─── Horta ───
// tempo = segundos pra ficar pronta (com água e de dia). colheita = itens por colheita. estagios = modelos 3D de cada fase
export const CROPS = {
  cafe: { nome: 'Café', icone: '☕', item: 'grao_cafe', qtd: 3, tempo: 150, semente: 4, estagios: ['c_leafsA', 'c_leafsB', 'c_bush'] },
  milho: { nome: 'Milho', icone: '🌽', item: 'milho', qtd: 3, tempo: 110, semente: 2, estagios: ['c_cornA', 'c_cornB', 'c_cornC', 'c_cornD'] },
  cenoura: { nome: 'Cenoura', icone: '🥕', item: 'cenoura', qtd: 3, tempo: 80, semente: 1, estagios: ['c_leafsA', 'c_carrot'] },
  abobora: { nome: 'Abóbora', icone: '🎃', item: 'abobora', qtd: 1, tempo: 170, semente: 5, estagios: ['c_leafsA', 'c_leafsB', 'c_pumpkin'] },
  melancia: { nome: 'Melancia', icone: '🍉', item: 'melancia', qtd: 1, tempo: 200, semente: 6, estagios: ['c_leafsA', 'c_leafsB', 'c_melon'] },
  bambu: { nome: 'Bambu', icone: '🎋', item: 'madeira', qtd: 3, tempo: 120, semente: 2, estagios: ['c_bambooA', 'c_bambooB'] },
};

// ─── Construção: paredes, pisos e tetos ───
// custo = quantos itens do material cada peça gasta. borda = fica na borda entre duas células
export const PIECES = {
  parede: { nome: 'Parede', icone: '🧱', model: 's_wall', custo: 4, borda: true },
  janela: { nome: 'Janela', icone: '🪟', model: 's_window', custo: 3, vidro: 2, borda: true },
  porta: { nome: 'Porta', icone: '🚪', model: 's_door', custo: 3, borda: true, passa: true },
  piso: { nome: 'Piso', icone: '⬛', model: 's_floor', custo: 2 },
  teto: { nome: 'Teto', icone: '🏠', model: 's_floor', custo: 2, alto: true },
  cerca: { nome: 'Cerca', icone: '🪵', model: 's_fence', custo: 1, borda: true, fixo: 'madeira' },
};
// materiais: item gasto, cor e acabamento
export const MATERIALS = {
  madeira: { nome: 'Madeira', item: 'madeira', cor: 0xb98352, rough: 0.8 },
  tijolo: { nome: 'Tijolo', item: 'tijolo', cor: 0xb85a3e, rough: 0.95 },
  concreto: { nome: 'Concreto', item: 'concreto', cor: 0xa3a7ae, rough: 0.95 },
  vidro: { nome: 'Vidro', item: 'vidro', cor: 0xa8dcff, rough: 0.1, vidro: true },
  aco: { nome: 'Aço', item: 'aco', cor: 0x7f8b9c, rough: 0.35, metal: 0.6 },
};
export const PAINTS = [
  { nome: 'Sem tinta', cor: null }, { nome: 'Branco', cor: 0xf2eee6 }, { nome: 'Creme', cor: 0xf3dfb0 }, { nome: 'Terracota', cor: 0xd0714a },
  { nome: 'Verde-sálvia', cor: 0x9bb88f }, { nome: 'Azul-céu', cor: 0x8fb8e0 }, { nome: 'Lavanda', cor: 0xb8a4de }, { nome: 'Rosa', cor: 0xe8a4b8 },
  { nome: 'Amarelo', cor: 0xf2c94c }, { nome: 'Grafite', cor: 0x4a4e5a },
];
export const PAINT_PRICE = 2;
// preço de 1 material na loja (mais caro que fabricar)
export const MATERIAL_SHOP = { madeira: 8, tijolo: 12, concreto: 18, vidro: 24, aco: 45 };

// quadros de domínio público (Wikimedia Commons)
export const PAINTINGS = {
  q_noite: { nome: 'A Noite Estrelada', autor: 'Vincent van Gogh, 1889', img: 'vangogh_noite', w: 512, h: 405, preco: 120 },
  q_onda: { nome: 'A Grande Onda', autor: 'Katsushika Hokusai, c. 1831', img: 'hokusai_onda', w: 512, h: 344, preco: 120 },
  q_impressao: { nome: 'Impressão, Nascer do Sol', autor: 'Claude Monet, 1872', img: 'monet_impressao', w: 512, h: 398, preco: 120 },
  q_girassois: { nome: 'Girassóis', autor: 'Vincent van Gogh, 1889', img: 'vangogh_girassois', w: 512, h: 671, preco: 150 },
  q_perola: { nome: 'Moça com Brinco de Pérola', autor: 'Johannes Vermeer, c. 1665', img: 'vermeer_perola', w: 512, h: 606, preco: 150 },
  q_caipira: { nome: 'Caipira Picando Fumo', autor: 'Almeida Júnior, 1893', img: 'almeida_caipira', w: 512, h: 729, preco: 180 },
  q_fuji: { nome: 'Fuji Vermelho', autor: 'Katsushika Hokusai, c. 1831', img: 'hokusai_fuji', w: 512, h: 342, preco: 150 },
};

// melhorias de hardware de cada computador (compradas no ⚙ Hardware do editor)
export const PC_UPGRADES = {
  clock: { nome: 'Overclock', icone: '⏩', desc: 'Multiplica as instruções por segundo deste computador.', valores: [1, 1.5, 2, 3], precos: [300, 1200, 4000], niveis: [2, 4, 6], energia: [0, 1, 2, 4], unidade: '×' },
  memoria: { nome: 'Memória', icone: '🧠', desc: 'Quantas variáveis e itens por lista o programa pode guardar.', valores: [24, 48, 96, Infinity], lista: [256, 1024, 4096, Infinity], precos: [200, 800, 2500], niveis: [2, 4, 6], energia: [0, 0, 1, 2] },
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
  laboratorio: {
    nome: 'Laboratório', preco: 250, nivel: 2, prefixo: 'lab', model: 'lab', energia: 5,
    desc: 'Pesquisa tecnologias novas. Escolha uma pesquisa (E) e mande os itens pedidos por esteira. Gasta 5 ⚡.', solido: true,
  },
  lixeira: {
    nome: 'Lixeira', preco: 25, nivel: 2, prefixo: 'lixeira', model: 'trash',
    desc: 'Destrói qualquer item que chegar. Boa pra escória sobrando. Não gasta energia.', solido: true,
  },
  divisor: {
    nome: 'Divisor', preco: 30, nivel: 1, tech: 'logistica', prefixo: 'divisor', model: 'splitter',
    desc: 'Entra por trás e reparte os itens entre frente, esquerda e direita, um pra cada lado. Automático.', solido: false,
  },
  juntador: {
    nome: 'Juntador', preco: 30, nivel: 1, tech: 'logistica', prefixo: 'juntador', model: 'merger',
    desc: 'Junta até 3 esteiras (trás, esquerda, direita) numa só, sem engarrafar um lado. Automático.', solido: false,
  },
  sensor: {
    nome: 'Esteira com Sensor', preco: 40, nivel: 1, tech: 'sensores', prefixo: 'sensor', model: 'belt', energia: 1,
    desc: 'Uma esteira que conta e avisa cada item que passa. Use .esperar_item() ou ouvir("sensor1"). Gasta 1 ⚡.', solido: false,
  },
  esteira_alta: {
    nome: 'Esteira Elevada', preco: 12, nivel: 1, tech: 'rampas', prefixo: 'alta', model: 'beltHigh',
    desc: 'Esteira no 2º andar: passa por cima de outras esteiras e máquinas baixas. Use rampas pra subir e descer.', solido: false,
  },
  rampa_sobe: {
    nome: 'Rampa (sobe)', preco: 20, nivel: 1, tech: 'rampas', prefixo: 'rampa', model: 'rampUp',
    desc: 'Recebe do chão (por trás) e leva o item pra Esteira Elevada na frente.', solido: false,
  },
  rampa_desce: {
    nome: 'Rampa (desce)', preco: 20, nivel: 1, tech: 'rampas', prefixo: 'rampa', model: 'rampDown',
    desc: 'Recebe da Esteira Elevada (por trás) e desce o item pro chão na frente.', solido: false,
  },
  lampada: {
    nome: 'Lâmpada', preco: 20, nivel: 1, tech: 'sinais', prefixo: 'lampada', model: 'lamp', energia: 1,
    desc: 'Luz programável: .ligar(), .desligar(), .cor("verde"), .piscar(). Gasta 1 ⚡.', solido: true,
  },
  tela: {
    nome: 'Tela', preco: 80, nivel: 1, tech: 'sinais', prefixo: 'tela', model: 'display', energia: 1,
    desc: 'Painel programável: .escrever("texto"), .mostrar(), .grafico([1, 5, 3]). Gasta 1 ⚡.', solido: true,
  },
  altofalante: {
    nome: 'Alto-falante', preco: 60, nivel: 1, tech: 'sinais', prefixo: 'som', model: 'speakerBox', energia: 1,
    desc: 'Toca notas e sons: .tocar("do"), .som("sino"). Gasta 1 ⚡.', solido: true,
  },
  gerador_carvao: {
    nome: 'Gerador a Carvão', preco: 400, nivel: 1, tech: 'carvao', prefixo: 'geradorC', model: 'coalGen', gera: 75, combustivel: true,
    desc: 'Produz 75 ⚡ queimando carvão (1 a cada 8 s). Carvão entra pelas setas azuis. .ligar() / .desligar().', solido: true,
  },
  painel_solar: {
    nome: 'Painel Solar', preco: 300, nivel: 1, tech: 'solar', prefixo: 'solar', model: 'solar', gera: 35, solar: true,
    desc: 'Até 35 ⚡ de graça durante o dia. À noite e na chuva gera menos.', solido: true,
  },
  doca_drones: {
    nome: 'Doca de Drones', preco: 800, nivel: 1, tech: 'drones', prefixo: 'doca', model: 'hangar', energia: 8,
    desc: 'Cria um drone programável que voa e carrega itens: .ir_para("bau1"), .pegar(), .soltar(). Gasta 8 ⚡.', solido: true,
  },
  // horta
  canteiro: {
    nome: 'Canteiro', preco: 35, nivel: 1, prefixo: 'canteiro', model: 'plot',
    desc: 'Planta café, milho, cenoura, abóbora, melancia ou bambu (vira madeira). Precisa de água: chuva, regador (E) ou irrigador. A colheita sai pela seta laranja.', solido: false,
  },
  irrigador: {
    nome: 'Irrigador', preco: 90, nivel: 2, prefixo: 'irrigador', model: 'sprinkler', energia: 1,
    desc: 'Rega sozinho os canteiros em volta (2 células). .regar() rega na hora, .desligar() para. Gasta 1 ⚡.', solido: true,
  },
  doca_entrega: {
    nome: 'Doca de Entrega', preco: 150, nivel: 2, prefixo: 'doca_entrega', model: 'deliveryDock',
    desc: 'Recebe por esteira (qualquer lado) os itens dos contratos aceitos no 📋 Quadro de Contratos. Não gasta energia.', solido: true,
  },
  deposito: {
    nome: 'Depósito de Materiais', preco: 120, nivel: 1, prefixo: 'deposito', model: 'depot',
    desc: 'Recebe madeira, tijolo, concreto, vidro e aço por esteira e guarda no seu estoque de construção (🧱). Não gasta energia.', solido: true,
  },
};

// Máquinas que podem ser melhoradas pra Mk2 / Mk3
export const TIERS = [
  { nome: 'Mk1', vel: 1, energia: 1 },
  { nome: 'Mk2', vel: 1.5, energia: 1.5, tech: 'mk2', preco: 0.8 },
  { nome: 'Mk3', vel: 2.2, energia: 2.2, tech: 'mk3', preco: 2 },
];
export const TIERABLE = ['minerador', 'fornalha', 'montadora', 'separador', 'laboratorio', 'doca_drones'];

// Pesquisas do Laboratório. fase = fases do foguete que precisam estar prontas
export const TECHS = {
  logistica: { nome: 'Logística', icone: '🔀', desc: 'Divisor e Juntador de esteiras (automáticos, sem código).', custo: { lingote_ferro: 20 }, fase: 0 },
  sinais: { nome: 'Sinais e Telas', icone: '💡', desc: 'Lâmpada, Tela e Alto-falante programáveis.', custo: { lingote_cobre: 15, lingote_ferro: 10 }, fase: 0 },
  sensores: { nome: 'Sensores e Eventos', icone: '📡', desc: 'Esteira com Sensor, ouvir(), esperar_evento() e esperar_ate().', custo: { lingote_cobre: 20, lingote_ferro: 20 }, fase: 0 },
  rampas: { nome: 'Esteiras Elevadas', icone: '🌉', desc: 'Rampas e esteiras no 2º andar pra cruzar linhas.', custo: { lingote_ferro: 40, lingote_cobre: 10 }, fase: 1, requer: ['logistica'] },
  rede: { nome: 'Rede de Computadores', icone: '🛰️', desc: 'enviar(), receber(), compartilhar() e ler() entre computadores.', custo: { fio: 30, engrenagem: 10 }, fase: 1, requer: ['sensores'] },
  carvao: { nome: 'Energia a Carvão', icone: '🔥', desc: 'Minerar carvão e o Gerador a Carvão (75 ⚡, precisa de combustível).', custo: { lingote_ferro: 30, engrenagem: 15 }, fase: 1 },
  mk2: { nome: 'Máquinas Mk2', icone: '⬆️', desc: 'Melhore máquinas uma a uma pra Mk2: 1,5× mais rápidas.', custo: { engrenagem: 30, fio: 30 }, fase: 1 },
  metalurgia: { nome: 'Metalurgia', icone: '⚒️', desc: 'Aço na fornalha (lingote de ferro + carvão) e Vigas na montadora.', custo: { tijolo: 20, carvao: 30 }, fase: 2, requer: ['carvao'] },
  solar: { nome: 'Energia Solar', icone: '☀️', desc: 'Painel Solar: até 35 ⚡ de dia, nada à noite.', custo: { silicio: 20, lingote_cobre: 20 }, fase: 2 },
  drones: { nome: 'Drones', icone: '🚁', desc: 'Doca de Drones: drones voadores programáveis que carregam itens.', custo: { motor: 10, chip: 15 }, fase: 2, requer: ['rede'] },
  mk3: { nome: 'Máquinas Mk3', icone: '⏫', desc: 'Melhore máquinas pra Mk3: 2,2× mais rápidas.', custo: { aco: 30, chip: 20 }, fase: 3, requer: ['mk2', 'metalurgia'] },
  foguete: { nome: 'Engenharia Espacial', icone: '🚀', desc: 'Processador, Módulo de Foguete e Satélite.', custo: { aco: 40, chip: 30, robozinho: 3 }, fase: 3, requer: ['metalurgia'] },
  eletronica: { nome: 'Eletrônica Avançada', icone: '🔋', desc: 'Bateria e Painel de LED na montadora.', custo: { chip: 30, aco: 30, vidro: 20 }, fase: 4, requer: ['foguete'] },
  quantica: { nome: 'Computação Quântica', icone: '🧿', desc: 'Computador Quântico (usa fragmentos estelares dos meteoros).', custo: { processador: 15, bateria: 15, fragmento_estelar: 10 }, fase: 5, requer: ['eletronica'] },
};

// Pesquisas infinitas (depois do lançamento): cada nível custa mais itens e ⭐ Estrelas do Programa Espacial
export const INF_TECHS = {
  mineracao: { nome: 'Mineração Profunda', icone: '⛏️', desc: '+8% de velocidade nos mineradores', efeito: 0.08, custo: { lingote_ferro: 60, engrenagem: 20 } },
  fundicao: { nome: 'Metalurgia Fina', icone: '🔥', desc: '+8% de velocidade nas fornalhas e montadoras', efeito: 0.08, custo: { aco: 30, tijolo: 30 } },
  cpu: { nome: 'Compilador Otimizado', icone: '🧠', desc: '+6% de clock em todos os computadores', efeito: 0.06, custo: { chip: 25, processador: 5 } },
  mercado: { nome: 'Marketing', icone: '💵', desc: '+4% no preço de venda de tudo', efeito: 0.04, custo: { robozinho: 3, painel_led: 5 } },
  logistica: { nome: 'Esteiras Turbo', icone: '🚚', desc: '+5% de velocidade nas esteiras e drones', efeito: 0.05, custo: { motor: 10, bateria: 5 } },
  horta: { nome: 'Adubo Estelar', icone: '🌱', desc: '+10% de crescimento na horta', efeito: 0.1, custo: { grao_cafe: 30, fragmento_estelar: 5 } },
};
export function infCost(id, lvl) {
  const k = Math.pow(1.45, lvl);
  return {
    itens: Object.fromEntries(Object.entries(INF_TECHS[id].custo).map(([i, n]) => [i, Math.round(n * k)])),
    estrelas: 1 + Math.floor(lvl / 2),
  };
}

// Programa Espacial: satélites que ficam em órbita e dão bônus permanentes (até 5 de cada)
export const SATELLITES = {
  comunicacao: { nome: 'Satélite de Comunicação', icone: '📡', desc: '+8% de clock nos computadores', extra: { processador: 6 } },
  mercado: { nome: 'Satélite Financeiro', icone: '💹', desc: '+5% no preço de venda', extra: { robozinho: 3 } },
  gps: { nome: 'Satélite GPS', icone: '🧭', desc: '+6% nas esteiras e drones', extra: { bateria: 6 } },
  clima: { nome: 'Satélite Meteorológico', icone: '🌦️', desc: '+12% de crescimento na horta e mais chuva', extra: { painel_led: 4 } },
  telescopio: { nome: 'Telescópio Espacial', icone: '🔭', desc: 'Mais chuvas de meteoros e veios maiores', extra: { fragmento_estelar: 12 } },
  energia: { nome: 'Estação Solar Orbital', icone: '🛰️', desc: '+20% nos painéis solares, e eles geram um pouco à noite', extra: { painel_led: 3, bateria: 3 } },
};
export const SAT_MAX = 5;
// o que a missão n (0 = segundo lançamento) pede
export function missionNeeds(n, sat) {
  const k = 1 + 0.4 * n;
  const itens = { modulo_foguete: 2 + n, satelite: 1 + Math.floor(n / 3) };
  for (const [i, q] of Object.entries(SATELLITES[sat].extra)) itens[i] = (itens[i] || 0) + Math.round(q * k);
  return itens;
}
export const missionPrize = (n) => ({ dinheiro: Math.round(20000 * (1 + 0.5 * n)), estrelas: 2 + Math.floor(n / 2) });

// Projeto Foguete: fases entregues na Plataforma de Lançamento (tipo o Elevador Espacial do Satisfactory)
export const PHASES = [
  { nome: 'Fundação', itens: { lingote_ferro: 50, lingote_cobre: 30 }, premio: 500, desc: 'A base da plataforma de lançamento.' },
  { nome: 'Estrutura', itens: { engrenagem: 40, fio: 60, tijolo: 30 }, premio: 2000, desc: 'A torre e os tanques de combustível.' },
  { nome: 'Tanques', itens: { aco: 40, chip: 25, motor: 10 }, premio: 6000, desc: 'O corpo do foguete.' },
  { nome: 'Controle', itens: { viga: 25, processador: 10, robozinho: 5 }, premio: 15000, desc: 'Computador de bordo e a ponta.' },
  { nome: 'Lançamento!', itens: { modulo_foguete: 8, satelite: 2 }, premio: 50000, desc: 'Carregue o foguete e lance o satélite.', final: true },
];

// Regiões do mapa que podem ser compradas
export const REGIONS = {
  norte: { nome: 'Floresta Norte', x0: -24, x1: 23, z0: -48, z1: -25, preco: 3000, nivel: 3, desc: 'Carvão, ferro e quartzo.' },
  leste: { nome: 'Vale Leste', x0: 24, x1: 47, z0: -24, z1: 23, preco: 8000, nivel: 5, desc: 'Muito cobre, quartzo e carvão.' },
  oeste: { nome: 'Colinas Oeste', x0: -48, x1: -25, z0: -24, z1: 23, preco: 15000, nivel: 6, desc: 'Quartzo, carvão e o acampamento.' },
  sul: { nome: 'Campos do Sul', x0: -24, x1: 23, z0: 24, z1: 47, preco: 30000, nivel: 7, desc: 'Espaço de sobra pra megafábricas.' },
};

// Bônus de decoração (dentro de 3 células): cpu = +clock dos computadores, vel = +velocidade das máquinas
export const DECOR_BONUS = {
  planta: { cpu: 0.05 }, flores: { cpu: 0.04 }, arvore: { cpu: 0.06 },
  luminaria: { vel: 0.05 }, barris: { vel: 0.03 }, antena: { cpu: 0.05, vel: 0.05 },
  sofa: { cpu: 0.03 }, cafeteira: { vel: 0.04 }, banco: { cpu: 0.02 },
  estatua: { cpu: 0.1, vel: 0.1, raio: 5 },
  astronauta: { cpu: 0.06 }, alien: { vel: 0.05 }, rover: { cpu: 0.04, vel: 0.04 }, nave: { cpu: 0.08, raio: 4 },
  estante: { cpu: 0.04 }, poltrona: { cpu: 0.03 }, tv: { cpu: 0.02 }, urso: { cpu: 0.03 }, sofa_longo: { cpu: 0.04 },
  mesa_redonda: { cpu: 0.02 }, tapete: { cpu: 0.02 }, luminaria_piso: { vel: 0.04 }, geladeira: { vel: 0.03 }, vaso_flor: { cpu: 0.03 },
};
export const DECOR_BONUS_MAX = 0.3;

export const ACHIEVEMENTS = [
  { id: 'primeiro_minerio', nome: 'Primeira pedrinha', desc: 'Minere o primeiro minério.', icone: '⛏️' },
  { id: 'primeira_venda', nome: 'Primeiro dinheirinho', desc: 'Venda algo.', icone: '💰' },
  { id: 'primeiro_programa', nome: 'Olá, mundo', desc: 'Rode um programa.', icone: '🐍' },
  { id: 'vendeu_100', nome: 'Comerciante', desc: 'Venda 100 itens.', icone: '🧺' },
  { id: 'vendeu_1000', nome: 'Magnata', desc: 'Venda 1.000 itens.', icone: '🏦' },
  { id: 'rico_1k', nome: 'Primeiro milhar', desc: 'Tenha $ 1.000.', icone: '💵' },
  { id: 'rico_10k', nome: 'Rico', desc: 'Tenha $ 10.000.', icone: '💎' },
  { id: 'rico_100k', nome: 'Milionário (quase)', desc: 'Tenha $ 100.000.', icone: '👑' },
  { id: 'lingote', nome: 'Forjado no fogo', desc: 'Faça um lingote.', icone: '🔥' },
  { id: 'engrenagem', nome: 'Engrenado', desc: 'Fabrique uma engrenagem.', icone: '⚙️' },
  { id: 'chip', nome: 'Vale do Silício', desc: 'Fabrique um chip.', icone: '💾' },
  { id: 'robozinho', nome: 'Pai de robô', desc: 'Fabrique um robozinho.', icone: '🤖' },
  { id: 'cinco_pcs', nome: 'Data center', desc: 'Tenha 5 computadores rodando.', icone: '🖥️' },
  { id: 'erros_10', nome: 'Errar é humano', desc: 'Tenha 10 erros de programa. Faz parte!', icone: '🐛' },
  { id: 'ouro', nome: 'Código de ouro', desc: 'Ganhe uma medalha de ouro no placar.', icone: '🥇' },
  { id: 'pesquisa', nome: 'Cientista', desc: 'Termine uma pesquisa.', icone: '🔬' },
  { id: 'todas_pesquisas', nome: 'Sabe-tudo', desc: 'Termine todas as pesquisas.', icone: '🎓' },
  { id: 'fase1', nome: 'Pé na estrada', desc: 'Complete a fase 1 do foguete.', icone: '🏗️' },
  { id: 'foguete', nome: 'Houston, temos um jogo', desc: 'Lance o foguete!', icone: '🚀' },
  { id: 'regiao', nome: 'Desbravador', desc: 'Compre uma região nova.', icone: '🗺️' },
  { id: 'todas_regioes', nome: 'Dono do mapa', desc: 'Compre todas as regiões.', icone: '🌎' },
  { id: 'drone', nome: 'Controle aéreo', desc: 'Faça um drone voar.', icone: '🚁' },
  { id: 'rede', nome: 'Conectado', desc: 'Mande uma mensagem pela rede.', icone: '🛰️' },
  { id: 'biblioteca', nome: 'Reaproveitador', desc: 'Use importar() numa biblioteca.', icone: '📚' },
  { id: 'depurador', nome: 'Caçador de bugs', desc: 'Pare num breakpoint do depurador.', icone: '🔍' },
  { id: 'musico', nome: 'Maestro', desc: 'Toque 8 notas no alto-falante.', icone: '🎹' },
  { id: 'esteiras_100', nome: 'Rodovia', desc: 'Tenha 100 esteiras.', icone: '🛤️' },
  { id: 'noite', nome: 'Turno da noite', desc: 'Veja a fábrica funcionando à noite.', icone: '🌙' },
  { id: 'chuva', nome: 'Cantando na chuva', desc: 'Fique na chuva.', icone: '🌧️' },
  { id: 'foto', nome: 'Fotógrafo', desc: 'Tire uma foto no modo foto.', icone: '📷' },
  { id: 'cafe_10', nome: 'Cafeinado', desc: 'Tome 10 cafezinhos.', icone: '☕' },
  { id: 'pet', nome: 'Melhor amigo', desc: 'Faça carinho no Oopi.', icone: '💜' },
  { id: 'mk3', nome: 'Turbinado', desc: 'Melhore uma máquina pra Mk3.', icone: '⏫' },
  { id: 'copiar', nome: 'Ctrl+C, Ctrl+V', desc: 'Cole um grupo de máquinas.', icone: '📋' },
  { id: 'horta', nome: 'Mão verde', desc: 'Faça a primeira colheita na horta.', icone: '🌱' },
  { id: 'colheita_100', nome: 'Fazendeiro(a)', desc: 'Colha 100 itens.', icone: '🧑‍🌾' },
  { id: 'estufa', nome: 'Efeito estufa (do bom)', desc: 'Colha um canteiro debaixo de um teto de vidro.', icone: '🪴' },
  { id: 'arquiteto', nome: 'Arquiteto(a)', desc: 'Construa 30 peças (paredes, pisos, tetos...).', icone: '🏗️' },
  { id: 'pintor', nome: 'Mão na tinta', desc: 'Pinte uma parede.', icone: '🖌️' },
  { id: 'galeria', nome: 'Galeria de arte', desc: 'Pendure 3 quadros.', icone: '🖼️' },
  { id: 'meteoro', nome: 'Poeira de estrelas', desc: 'Pegue um fragmento estelar.', icone: '☄️' },
  { id: 'aurora', nome: 'Luzes do céu', desc: 'Veja uma aurora.', icone: '🌌' },
  { id: 'feira', nome: 'Dia de feira', desc: 'Venda durante uma feira.', icone: '🎪' },
  { id: 'overclock', nome: 'Overclock', desc: 'Melhore o hardware de um computador.', icone: '⏩' },
  { id: 'recorde', nome: 'Recordista', desc: 'Bata um recorde da fábrica.', icone: '🏆' },
  { id: 'oopi_tarefa', nome: 'Oopi ajudante', desc: 'Peça uma tarefa pro Oopi.', icone: '🤖' },
  // v1.3
  { id: 'contrato', nome: 'Negócio fechado', desc: 'Cumpra um contrato.', icone: '📋' },
  { id: 'contratos_25', nome: 'Fornecedor oficial', desc: 'Cumpra 25 contratos.', icone: '🤝' },
  { id: 'lendario', nome: 'Lenda do bairro', desc: 'Cumpra um contrato lendário.', icone: '🌟' },
  { id: 'relampago', nome: 'Entrega relâmpago', desc: 'Cumpra um contrato na primeira metade do prazo.', icone: '⚡' },
  { id: 'desafio', nome: 'Quebra-cabeça', desc: 'Resolva um desafio de programação.', icone: '🧩' },
  { id: 'desafio_ouro', nome: 'Perfeccionista', desc: 'Ganhe as 3 medalhas de ouro num desafio.', icone: '🏅' },
  { id: 'desafios_todos', nome: 'Mestre da Jiboia', desc: 'Resolva todos os desafios.', icone: '🐍' },
  { id: 'disco', nome: 'Arqueologia de dados', desc: 'Encontre um disco de dados.', icone: '💾' },
  { id: 'receita_alt', nome: 'Receita da vovó', desc: 'Libere uma receita alternativa.', icone: '📜' },
  { id: 'satelite2', nome: 'Constelação', desc: 'Lance uma segunda missão espacial.', icone: '🛰️' },
  { id: 'missao_5', nome: 'Agência espacial', desc: 'Complete 5 missões do Programa Espacial.', icone: '🌌' },
  { id: 'infinita', nome: 'Sem limites', desc: 'Termine uma pesquisa infinita.', icone: '♾️' },
  { id: 'quantico', nome: 'Ação fantasmagórica', desc: 'Fabrique um computador quântico.', icone: '🧿' },
  { id: 'combo_10', nome: 'Combo!', desc: 'Faça um combo de vendas ×10.', icone: '🔥' },
  { id: 'correio_7', nome: 'Freguesia fiel', desc: 'Abra o correio da manhã 7 dias seguidos.', icone: '📬' },
  { id: 'projeto', nome: 'Projetista', desc: 'Salve um projeto de máquinas.', icone: '📐' },
  { id: 'album', nome: 'Colecionador(a)', desc: 'Descubra todos os itens do álbum.', icone: '📖' },
  { id: 'chapeu', nome: 'Estiloso', desc: 'Coloque um chapéu no Oopi.', icone: '🎩' },
  { id: 'amizade', nome: 'Amigos pra sempre', desc: 'Chegue à amizade nível 5 com o Oopi.', icone: '💞' },
];

// Contratos: clientes e o que eles gostam de pedir
export const CLIENTS = [
  { nome: 'Padaria da Dona Cida', icone: '🥖', gosta: ['milho', 'cenoura', 'abobora', 'grao_cafe', 'lingote_ferro'] },
  { nome: 'Oficina do Seu Zé', icone: '🔧', gosta: ['engrenagem', 'motor', 'lingote_ferro', 'aco', 'viga'] },
  { nome: 'Cafeteria Grão Bom', icone: '☕', gosta: ['grao_cafe', 'melancia', 'milho', 'vidro'] },
  { nome: 'Construtora Tijolinho', icone: '🧱', gosta: ['tijolo', 'concreto', 'vidro', 'madeira', 'aco', 'viga'] },
  { nome: 'Robótica Estrela', icone: '🤖', gosta: ['chip', 'motor', 'robozinho', 'processador', 'bateria'] },
  { nome: 'Escola de Programação da Prof. Ada', icone: '🎓', gosta: ['chip', 'fio', 'silicio', 'processador', 'painel_led'] },
  { nome: 'Agência Espacial Tupi', icone: '🛰️', gosta: ['modulo_foguete', 'satelite', 'computador_quantico', 'bateria', 'processador'] },
  { nome: 'Feira do Bairro', icone: '🎪', gosta: ['melancia', 'abobora', 'cenoura', 'milho', 'fio'] },
  { nome: 'Joalheria Cometa', icone: '💎', gosta: ['fragmento_estelar', 'quartzo', 'lingote_cobre', 'silicio'] },
  { nome: 'Estúdio de Luz Neon', icone: '💡', gosta: ['painel_led', 'fio', 'vidro', 'bateria', 'lingote_cobre'] },
];
export const RARITY = {
  comum: { nome: 'Comum', mult: 1.6, fichas: 1, cor: '#9fb4d6', prazo: 600 },
  raro: { nome: 'Raro', mult: 2.2, fichas: 2, cor: '#3ee6b8', prazo: 900 },
  lendario: { nome: 'Lendário', mult: 3, fichas: 4, cor: '#ffcf5c', prazo: 1500 },
};

// Loja de fichas 🎟️: chapéus e cores do Oopi
export const OOPI_HATS = {
  flor: { nome: 'Florzinha', model: 'hat_flower', fichas: 3, y: 0.02 },
  cone: { nome: 'Cone de obra', model: 'hat_cone', fichas: 4, y: -0.02 },
  cogumelo: { nome: 'Cogumelo', model: 'hat_mushroom', fichas: 5, y: -0.03 },
  engrenagem: { nome: 'Engrenagem', model: 'cog', fichas: 5, y: 0.04, deitado: true },
  antena: { nome: 'Antena parabólica', model: 'hat_dish', fichas: 7, y: 0 },
  coroa: { nome: 'Coroa de cristal', model: 'hat_crystal', fichas: 10, y: 0 },
};
export const OOPI_COLORS = {
  padrao: { nome: 'Original', cor: null, fichas: 0 },
  rosa: { nome: 'Rosa', cor: 0xff8ac7, fichas: 2 },
  menta: { nome: 'Menta', cor: 0x7ff0c0, fichas: 2 },
  lavanda: { nome: 'Lavanda', cor: 0xb8a4ff, fichas: 2 },
  dourado: { nome: 'Dourado', cor: 0xffcf5c, fichas: 4 },
  grafite: { nome: 'Grafite', cor: 0x555a6a, fichas: 3 },
};
// amizade do Oopi: pontos pra cada nível (carinho +1, tarefa +3)
export const FRIEND_LEVELS = [0, 10, 30, 60, 100];
export const FRIEND_PERKS = ['', 'Ganha a florzinha de presente 🌼', 'Pega as pedrinhas de meteoro sozinho quando está perto', 'Ganha a coroa de cristal de presente 👑', 'Oopi sortudo: +1 ficha a cada contrato raro ou lendário'];

// Correio da manhã: presente de cada dia da sequência (repete a cada 7)
export const DAILY = [
  { dinheiro: 1 }, { dinheiro: 1.5 }, { fichas: 1 }, { dinheiro: 2 }, { disco: 1 }, { dinheiro: 2.5 }, { fichas: 3, dinheiro: 3 },
];

// ferramentas que ficam sempre na barra
export const TOOLS = {
  cabo: {
    nome: 'Cabo 🔌',
    desc: 'Clique no gerador (ou poste) e depois na máquina pra ligar. Continua ligando em sequência. Botão direito / Q para. X remove os cabos da peça mirada.',
  },
  construir: {
    nome: 'Construção 🧱',
    desc: 'Paredes, janelas, portas, pisos, tetos e cercas. F troca a peça, T troca o material (ou a cor no 🖌️ Pintar). Paredes ficam na borda mais perto da mira. X desmonta e devolve o material.',
  },
};

// quantos cabos cada coisa aceita
export const WIRE_MAX = { poste: 6, gerador: 4, gerador_grande: 6, gerador_carvao: 4, painel_solar: 2 };
export const WIRE_MAX_MACHINE = 2;
export const WIRE_MAX_LEN = 16; // metros

// Decoração — pra deixar a fábrica aconchegante
export const DECOR = {
  planta: { nome: 'Vaso de Planta', preco: 15, nivel: 1, model: 'd_plant', bonus: '+5% CPU nos computadores perto' },
  flores: { nome: 'Flores', preco: 10, nivel: 1, model: 'd_flowers', bonus: '+4% CPU nos computadores perto' },
  arvore: { nome: 'Árvore', preco: 40, nivel: 2, model: 'd_tree', bonus: '+6% CPU nos computadores perto' },
  banco: { nome: 'Banco', preco: 40, nivel: 2, model: 'd_bench', bonus: '+2% CPU perto' },
  luminaria: { nome: 'Luminária', preco: 50, nivel: 3, model: 'd_lamp', luz: true, bonus: '+5% velocidade nas máquinas perto' },
  sofa: { nome: 'Sofá', preco: 80, nivel: 3, model: 'd_sofa', bonus: '+3% CPU perto' },
  cafeteira: { nome: 'Cafeteira', preco: 60, nivel: 4, model: 'd_coffee', bonus: '+4% velocidade nas máquinas perto' },
  barris: { nome: 'Barris', preco: 30, nivel: 4, model: 'd_barrels', bonus: '+3% velocidade nas máquinas perto' },
  antena: { nome: 'Antena Parabólica', preco: 150, nivel: 5, model: 'd_dish', bonus: '+5% CPU e velocidade perto' },
  estatua: { nome: 'Estátua do Oopi', preco: 1500, nivel: 8, model: 'd_statue', bonus: '+10% CPU e velocidade num raio grande' },
  // exclusivos da loja de fichas 🎟️
  astronauta: { nome: 'Astronauta', preco: 0, fichas: 6, nivel: 1, model: 'd_astronaut', bonus: '+6% CPU nos computadores perto' },
  alien: { nome: 'Alienzinho', preco: 0, fichas: 6, nivel: 1, model: 'd_alien', bonus: '+5% velocidade nas máquinas perto' },
  rover: { nome: 'Rover Lunar', preco: 0, fichas: 8, nivel: 1, model: 'd_rover', bonus: '+4% CPU e velocidade perto' },
  nave: { nome: 'Nave Estelar', preco: 0, fichas: 12, nivel: 1, model: 'd_ship', bonus: '+8% CPU num raio de 4 células' },
  // móveis do escritório (podem ficar dentro do escritório)
  estante: { nome: 'Estante de Livros', preco: 70, nivel: 1, model: 'o_bookcase', casa: true, bonus: '+4% CPU perto' },
  poltrona: { nome: 'Poltrona', preco: 60, nivel: 1, model: 'o_armchair', casa: true, bonus: '+3% CPU perto' },
  sofa_longo: { nome: 'Sofá Grande', preco: 110, nivel: 2, model: 'o_sofaLong', casa: true, bonus: '+4% CPU perto' },
  tv: { nome: 'TV com Rack', preco: 140, nivel: 2, model: 'o_tv', casa: true, bonus: '+2% CPU perto' },
  tapete: { nome: 'Tapete', preco: 25, nivel: 1, model: 'o_rug', casa: true, baixo: true, bonus: '+2% CPU perto' },
  luminaria_piso: { nome: 'Luminária de Pé', preco: 45, nivel: 1, model: 'o_floorLamp', casa: true, luz: true, bonus: '+4% velocidade perto' },
  mesa_redonda: { nome: 'Mesa Redonda', preco: 50, nivel: 1, model: 'o_tableRound', casa: true, bonus: '+2% CPU perto' },
  cadeira: { nome: 'Cadeira', preco: 20, nivel: 1, model: 'o_chair', casa: true },
  mesinha: { nome: 'Mesinha com Abajur', preco: 40, nivel: 1, model: 'o_sideTable', casa: true, luz: true },
  geladeira: { nome: 'Frigobar', preco: 90, nivel: 2, model: 'o_fridge', casa: true, bonus: '+3% velocidade perto' },
  cabideiro: { nome: 'Cabideiro', preco: 20, nivel: 1, model: 'o_coatRack', casa: true },
  urso: { nome: 'Ursinho de Pelúcia', preco: 30, nivel: 1, model: 'o_bear', casa: true, bonus: '+3% CPU perto (fofura)' },
  vaso_flor: { nome: 'Plantinha', preco: 15, nivel: 1, model: 'o_plant', casa: true, bonus: '+3% CPU perto' },
  ventilador: { nome: 'Ventilador de Teto', preco: 60, nivel: 2, model: 'o_fan', casa: true, noTeto: true },
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
  for (const m of Object.values(MACHINES)) if (m.nivel === level && !m.tech) out.push(m.nome);
  for (const [k, r] of Object.entries(RECIPES)) if (r.nivel === level && !r.tech && !r.alt) out.push('Receita: ' + ITEMS[recipeOut(k, r)].nome);
  for (const [k, s] of Object.entries(SMELT)) if (s.nivel === level && level > 2 && !s.tech && !s.alt) out.push('Fundir: ' + ITEMS[s.out].nome);
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

EXAMPLES.push(
  {
    nome: '🛰️ Rede: chefe e ajudante', code: `# Precisa da pesquisa "Rede de Computadores"
# pc1 manda ordens, pc2 obedece (rode este no pc1)
while True:
    enviar("pc2", "minerar")
    compartilhar("ultimo_pedido", tempo())
    esperar(5)

# --- no pc2, use: ---
# while True:
#     m = receber()
#     if m["msg"] == "minerar":
#         maquina("minerador1").minerar()
`,
  },
  {
    nome: '📡 Eventos do sensor', code: `# Precisa da pesquisa "Sensores e Eventos"
ouvir("sensor1")      # avisa cada item que passa
ouvir("vendas")       # avisa cada venda
ouvir("tempo", 30)    # e um "tique" a cada 30 s
total = 0
while True:
    e = esperar_evento()
    if e["tipo"] == "item":
        total += 1
    elif e["tipo"] == "venda":
        print("vendeu $", e["valor"])
    elif e["tipo"] == "tempo":
        print("itens nos últimos 30 s:", total)
        total = 0
`,
  },
  {
    nome: '⏳ esperar_ate com função', code: `caixa = maquina("venda1")

def caixa_cheia():
    return caixa.quantidade() >= 20

while True:
    esperar_ate(caixa_cheia)   # checa a condição até ela virar True
    caixa.vender()
`,
  },
  {
    nome: '🚁 Drone entregador', code: `# Precisa da pesquisa "Drones" e de uma Doca de Drones
d = maquina("drone1")
while True:
    d.ir_para("bau1")
    item = d.pegar()          # pega 1 item do baú
    d.ir_para("venda1")
    d.soltar()                # solta na caixa de venda
    print("entreguei", item)
`,
  },
  {
    nome: '💡 Tela e lâmpada de status', code: `# Precisa da pesquisa "Sinais e Telas"
t = maquina("tela1")
l = maquina("lampada1")
t.titulo("Fábrica")
historico = []
while True:
    d = dinheiro()
    historico.append(d)
    if len(historico) > 30:
        historico.pop(0)       # guarda só os últimos 30 (economiza memória)
    t.grafico(historico)
    if energia()["usado"] > energia()["gerado"]:
        l.cor("vermelho")
        l.piscar(0.5)
    else:
        l.cor("verde")
        l.ligar()
    esperar(10)
`,
  },
  {
    nome: '⚒️ Aço + escória', code: `# Aço precisa da pesquisa "Metalurgia"
forno = maquina("fornalha1")
sep = maquina("separador1")   # na frente da fornalha
while True:
    forno.fundir("aco")       # lingote de ferro + carvão
    item = sep.esperar_item()
    if item == "escoria":
        sep.enviar("direita")  # manda a escória pra lixeira/montadora de tijolo
    else:
        sep.enviar("frente")
`,
  },
  {
    nome: '📚 Usando uma biblioteca', code: `# A biblioteca "util" fica na aba Bibliotecas
importar("util")
caixa = maquina("venda1")
while True:
    minerar_varios(["minerador1"])
    vender_se_caro(caixa, "minerio_ferro", 2.3)
`,
  },
  {
    nome: '🌱 Horta automática', code: `# Planta, espera crescer e colhe (a colheita sai pela seta laranja)
horta = maquina("canteiro1")
agua = maquina("irrigador1")    # opcional: rega sozinho
caixa = maquina("venda1")

horta.plantar("cafe")
while True:
    if horta.umidade() < 0.3:
        agua.regar()
    horta.colher()             # espera ficar pronta e colhe
    if caixa.quantidade() >= 6:
        caixa.vender()
`,
  },
  {
    nome: '🎹 Musiquinha', code: `# Precisa de um Alto-falante (pesquisa "Sinais e Telas")
som = maquina("som1")
musica = ["do", "mi", "sol", "do5", "sol", "mi", "do"]
for nota in musica:
    som.tocar(nota, 0.25)
som.som("sino")
`,
  },
);

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
  { id: 'rich', texto: 'Junte $ 20.000. Você é o(a) dev da fábrica mais chill do mundo!', premio: 500 },
  { id: 'contract', texto: 'Aceite um pedido no 📋 Quadro de Contratos (no escritório), coloque uma Doca de Entrega e cumpra o contrato.', premio: 800 },
  { id: 'challenge', texto: 'Resolva um desafio no 🧩 Terminal de Desafios (na mesa do escritório).', premio: 600 },
  { id: 'disk', texto: 'Ache um 💾 disco de dados (caixas perdidas na floresta, meteoros ou correio) e analise no Laboratório.', premio: 1000 },
  { id: 'launch', texto: 'Lance o foguete do Projeto Foguete 🚀', premio: 0 },
  { id: 'mission', texto: 'Programa Espacial: escolha um satélite na plataforma e lance a missão 2.', premio: 5000 },
];
