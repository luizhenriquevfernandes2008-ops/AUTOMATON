# ⚙️ AUTOMATON

> 📖 **Não sabe por onde começar? Leia o [GUIA.md](GUIA.md)** (ou aperte **H** dentro do jogo).

Jogo **3D em primeira pessoa**, chill, de **automação de fábrica** (estilo Satisfactory) com uma diferença: **nada funciona sozinho**. Cada máquina é controlada por **computadores que você programa** em **Jiboia**, uma linguagem própria parecida com Python que roda **devagarinho, uma instrução por vez**. Dá pra ver a setinha andando pelo código na tela do computador.

---

## ▶ Como jogar

1. Dê dois cliques em **`Jogar.bat`**.
2. Uma janelinha preta vai abrir (é o servidor local, deixe ela aberta) e o jogo abre no navegador.
3. Clique em **▶ Jogar**.

> O jogo precisa desse servidorzinho local porque o navegador não carrega modelos 3D direto do disco. Ele usa só o PowerShell que já vem no Windows, não precisa instalar nada.
> Se a página não abrir sozinha, acesse **http://localhost:8765/** (ou a porta que aparecer na janela).

O progresso é **salvo automaticamente** a cada 30 segundos (no navegador, via `localStorage`).

### Controles

| Tecla | Ação |
|---|---|
| `W A S D` | andar |
| `Shift` | correr |
| `Espaço` | pular |
| `1` | 🔌 Cabo de energia (sempre o primeiro da barra) |
| `2`–`9` / roda do mouse | escolher item da barra |
| `Clique esquerdo` | colocar item / usar |
| `R` | girar antes de colocar |
| `Q` | guardar o item da mão |
| `E` | usar: programar computador, ver máquina, loja, rádio, café |
| `X` / `Clique direito` | guardar a máquina mirada no inventário (com o Cabo: soltar o cabo / tirar cabos) |
| `B` | abrir a loja |
| `M` | próxima música |
| `H` | 📖 guia |
| `Esc` | pausa (volume, sensibilidade, salvar) |

> Se o navegador não deixar o jogo travar o mouse, ele entra sozinho no modo **arrastar pra olhar**: segure o botão esquerdo e arraste pra virar a câmera. Um clique curto coloca/usa normalmente.

No editor de código: `Ctrl+Enter` executa, `Tab` / `Shift+Tab` indentam e `Esc` fecha. **O programa continua rodando com o editor fechado.**

---

## 🔁 O ciclo do jogo

```
Minerador ──esteira──▶ Fornalha ──esteira──▶ Montadora ──esteira──▶ Caixa de Venda ──▶ $ + XP
    ▲                     ▲                     ▲                        ▲
    └──────────── tudo comandado por Computadores rodando Jiboia ─────────┘
```

1. Coloque um **Minerador** sobre um veio (cristais azuis = ferro, laranja = cobre, rosa = quartzo).
2. Ligue a saída (**seta laranja** no chão) com **Esteiras** até a **Caixa de Venda**. As **setinhas amarelas** nas esteiras mostram pra onde o item anda; as **setas azuis** são as entradas das máquinas.
3. Coloque o **Gerador** e o **Computador** e ligue tudo com o **🔌 Cabo** (tecla `1`): clique no gerador, depois em cada máquina.
4. Aperte `E` no computador e rode o programa de exemplo.
5. Venda itens → ganhe **dinheiro** e **XP** → suba de **nível** → libere máquinas, receitas e melhorias na **Loja**.
6. Siga os **objetivos** (canto superior direito); cada um dá um prêmio.

### Máquinas

| Máquina | Nível | Preço | ⚡ | O que faz |
|---|---|---|---|---|
| Esteira | 1 | $5 | – | Leva itens na direção das setinhas, sozinha |
| Gerador | 1 | $150 | **+20** | Produz energia |
| Poste de Energia | 1 | $10 | – | Leva a energia mais longe (até 6 cabos) |
| Minerador | 1 | $60 | 3 | `.minerar()` tira 1 minério do veio |
| Caixa de Venda | 1 | $100 | 1 | `.vender()` transforma o estoque em dinheiro |
| Computador | 1 | $120 | 2 | Roda programas Jiboia |
| Baú | 2 | $40 | – | Guarda 60 itens, `.retirar()` solta 1 |
| Fornalha | 2 | $120 | 4 | `.fundir()` minério → lingote |
| Separador | 3 | $90 | 1 | `.enviar("esquerda" / "direita" / "frente")` |
| Montadora | 4 | $280 | 6 | `.fabricar("engrenagem")` e outras receitas |
| Gerador Grande | 4 | $700 | **+60** | Muita energia |

### Energia ⚡

Como no Satisfactory, **cada máquina precisa de um cabo** ligado numa rede com gerador. Escolha o **🔌 Cabo** (tecla `1`), clique no gerador e depois na máquina. Cabos têm até 16 m; use **postes** pra ir mais longe. Se a rede gasta mais do que gera, tudo nela fica mais lento. Sem energia a máquina para (luz vermelha piscando) e o computador desliga a tela. Detalhes no [GUIA.md](GUIA.md).

### Produção

- **Fornalha:** minério de ferro → lingote de ferro · minério de cobre → lingote de cobre · quartzo → silício (nível 5)
- **Montadora:**
  - `engrenagem` = 2 lingotes de ferro (nível 4)
  - `fio` = 1 lingote de cobre → 2 fios (nível 4)
  - `chip` = 1 silício + 2 fios (nível 5)
  - `motor` = 2 engrenagens + 2 fios (nível 6)
  - `robozinho` = 1 motor + 2 chips (nível 8) 🤖

### Melhorias (loja)

- **Clock da CPU:** 2 → 3 → 5 → 8 → 12 instruções por segundo
- **Motor das Esteiras:** 1.0 → 1.4 → 1.8 → 2.4 blocos por segundo
- **Engrenagens Turbo:** máquinas trabalham 1x → 1.3x → 1.6x → 2x mais rápido

### Mercado

Os preços **sobem e descem** com o tempo (painel do mercado ao lado do escritório e aba "Mercado" da loja). Vender muito de uma vez baixa o preço um pouco, que depois se recupera. Dá pra programar vendas espertas:

```python
caixa = maquina("venda1")
while True:
    if caixa.preco("lingote_ferro") > 8 and caixa.quantidade() > 0:
        caixa.vender()
    esperar(2)
```

---

## 🐍 A linguagem Jiboia

Parecida com Python: indentação de 4 espaços, `if/elif/else`, `while`, `for ... in`, `def`/`return`, `break`/`continue`, listas, dicionários, f-strings, `global` e desempacotamento (`a, b = b, a`).

**Também aceita palavras em português:** `se`, `senaose`, `senao`, `enquanto`, `para`/`em`, `funcao`, `retorne`, `pare`, `continuar`, `passe`, `Verdadeiro`, `Falso`, `Nada`, `nao`, `escrever()`.

```python
enquanto Verdadeiro:
    para nome em maquinas("minerador"):
        maquina(nome).minerar()
    se dinheiro() > 1000:
        escrever("tô rico! 💰")
```

**Por que devagar?** Cada instrução consome 1 "tick" do clock da CPU (começa em 2 por segundo). Métodos de máquina como `.minerar()` **esperam** a máquina terminar (a setinha fica amarela). Código mais enxuto e mais computadores deixam a fábrica mais rápida. Esse é o quebra-cabeça do jogo.

**Erros amigáveis:** `A variável 'prnt' não existe. Você quis dizer 'print'?`. A linha com erro fica vermelha no editor e na tela 3D do computador.

O **manual completo** fica dentro do jogo, na aba **Manual** do editor, junto com a aba **Máquinas** (clique pra inserir `maquina("nome")`) e uma lista de **Exemplos** prontos.

---

## 🗂 Estrutura do projeto

```
AUTOMATON/
├── Jogar.bat              # atalho: sobe o servidor e abre o navegador
├── servidor.ps1           # servidor HTTP local (PowerShell, sem dependências)
├── index.html             # HUD, editor, loja, menus
├── css/style.css          # visual (paleta roxa/laranja do Kenney Factory Kit)
├── js/
│   ├── main.js            # boot, loop do jogo, controles, pausa/menu
│   ├── state.js           # estado global + eventos
│   ├── data.js            # ITENS, RECEITAS, MÁQUINAS, LOJA, NÍVEIS, OBJETIVOS, EXEMPLOS
│   ├── assets.js          # carregamento/normalização dos modelos GLB, texturas e HDRI
│   ├── world.js           # céu, chão, floresta, veios, escritório, loja, painel do mercado
│   ├── player.js          # primeira pessoa (pointer lock, colisão, passos)
│   ├── build.js           # construção no grid, fantasma, mirar/remover
│   ├── machines.js        # grid, esteiras, máquinas e a API delas pra Jiboia
│   ├── power.js           # energia: cabos, redes, geradores e consumo
│   ├── guide.js           # guia ilustrado (tecla H)
│   ├── computer.js        # computador: executa Jiboia no ritmo do clock + tela 3D
│   ├── economy.js         # dinheiro, XP, níveis, inventário, mercado, objetivos
│   ├── itemMeshes.js      # visual dos itens nas esteiras
│   ├── fx.js              # partículas, textos flutuantes, plaquinhas de nome
│   ├── thumbs.js          # ícones gerados renderizando os modelos 3D
│   ├── audio.js           # efeitos posicionais, ambiente e playlist
│   ├── editor.js          # editor de código com realce de sintaxe
│   ├── docs.js            # manual da Jiboia
│   ├── ui.js              # HUD, loja, painel de máquina, avisos
│   ├── save.js            # salvar/carregar (localStorage)
│   └── lang/jiboia.js     # a linguagem: lexer → parser (AST) → interpretador
├── lib/                   # three.js r169 (+ addons) baixado do jsDelivr
└── assets/
    ├── models/            # Kenney: Factory Kit, Space Kit, Nature Kit, Furniture Kit (.glb)
    ├── sounds/            # Kenney (efeitos) + OpenGameArt (ambiente de floresta)
    ├── music/             # Kevin MacLeod (incompetech.com)
    ├── textures/          # Poly Haven (grama)
    ├── hdri/              # Poly Haven (céu)
    └── fonts/             # Fredoka + JetBrains Mono (Fontsource)
```

### Como o interpretador funciona

`js/lang/jiboia.js` tem três partes:

1. **Lexer**: transforma o texto em tokens e gera `INDENT`/`DEDENT` pela indentação, como o Python.
2. **Parser**: descida recursiva que monta uma AST (`If`, `While`, `For`, `Def`, `Call`, `Bin`...).
3. **Interpretador**: feito com **generators** do JavaScript. Cada instrução faz `yield STEP` e o computador só avança quando tem "tick" de CPU sobrando. Chamadas que demoram (minerar, fundir, esperar...) devolvem um objeto `Blocking`, e o interpretador faz `yield WAIT` até a máquina terminar. Por isso o código pode ter laços infinitos sem travar o jogo.

### Como adicionar coisas

- **Novo item:** adicione em `ITEMS` (`data.js`) e um visual em `itemMeshes.js`.
- **Nova receita:** adicione em `RECIPES` (`data.js`). A montadora já entende.
- **Nova máquina:** crie uma classe que estende `Machine` em `machines.js`, implemente `api()` com os métodos que a Jiboia vai ver, registre em `ENTITY_CLASSES` e em `MACHINES` (`data.js`), e escolha um modelo em `assets.js`.
- **Nova música:** coloque o `.mp3` em `assets/music/` e adicione em `TRACKS` (`audio.js`).

Pra depurar, abra o console do navegador (`F12`). O estado do jogo fica em `window.automaton`.

---

## 💡 Ideias pro futuro

- Ciclo de dia e noite com luzes nas máquinas
- Geradores que queimam combustível (e o código decide quando ligar)
- Rede entre computadores (`enviar_mensagem` / `receber_mensagem`)
- Drones programáveis que carregam itens
- Contratos/pedidos de clientes com prazo
- Esteiras em níveis diferentes (rampas)

---

## 📜 Créditos

Veja [CREDITOS.md](CREDITOS.md). Todos os modelos, sons, músicas, texturas e fontes foram baixados da internet de fontes com licença livre.
