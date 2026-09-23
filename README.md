# ⚙️ AUTOMATON

> 📖 **Não sabe por onde começar? Leia o [GUIA.md](GUIA.md)**, ou aperte **H** dentro do jogo. Num jogo novo, o jogo também oferece um **tutorial interativo**.

Jogo **3D em primeira pessoa**, chill, de **automação de fábrica** (estilo Satisfactory) com uma diferença: **nada funciona sozinho**. Cada máquina é controlada por **computadores que você programa** em **Jiboia**, uma linguagem própria parecida com Python que roda **devagarinho, uma instrução por vez**. Dá pra ver a setinha andando pelo código na tela do computador.

O objetivo grande é o **Projeto Foguete**: juntar peças cada vez mais complexas, entregar na plataforma de lançamento em 5 fases e mandar um satélite pro espaço. 🚀

---

## ▶ Como jogar

1. Dê dois cliques em **`Jogar.bat`**.
2. Uma janelinha preta vai abrir (é o servidor local, deixe ela aberta) e o jogo abre no navegador.
3. Clique em **01 · Jogar**.

> O jogo precisa desse servidorzinho local porque o navegador não carrega modelos 3D direto do disco. Ele usa só o PowerShell que já vem no Windows, não precisa instalar nada.
> Se a página não abrir sozinha, acesse **http://localhost:8765/** (ou a porta que aparecer na janela).

O progresso é **salvo automaticamente** a cada 30 segundos, e a fábrica **continua rendendo enquanto você está fora** (metade do ritmo, por até 8 horas).

### Controles

| Tecla | Ação |
|---|---|
| `W A S D` · `Shift` · `Espaço` | andar · correr · pular |
| `1` | 🔌 Cabo de energia (sempre o primeiro da barra) |
| `2`–`9` / roda do mouse | escolher peça |
| `Clique` | colocar / usar / ligar cabo |
| `R` | girar a peça (ou o grupo colado) |
| `Q` | guardar a peça da mão / cancelar |
| `E` | programar computador, detalhes da máquina, pesquisas, foguete, loja, rádio, café, carinho no pet |
| `X` / botão direito | guardar a peça mirada (com o Cabo: soltar o cabo / tirar cabos) |
| `C` / `V` | copiar uma área / colar de novo |
| `Ctrl+Z` | desfazer |
| `B` | loja |
| `Tab` | mapa visto de cima |
| `K` | estatísticas, placar e conquistas |
| `H` | guia |
| `P` | modo foto |
| `M` / `G` | próxima música / próxima estação de rádio |
| `Esc` | pausa |

> Se o navegador não deixar o jogo travar o mouse, ele entra sozinho no modo **arrastar pra olhar**: segure o botão esquerdo e arraste. Um clique curto coloca/usa normalmente.

No editor de código: `Ctrl+Enter` executa, `Tab`/`Shift+Tab` indentam, `Ctrl+Espaço` pede sugestões, `F10` avança um passo no depurador e `Esc` fecha. **O programa continua rodando com o editor fechado.**

---

## ✨ O que tem no jogo

### Fábrica
- **Esteiras** com setinhas animadas, curvas automáticas, **divisor**, **juntador**, **esteira com sensor**, **rampas** e **esteiras elevadas (2º andar)** pra cruzar linhas.
- **Minerador, Fornalha, Montadora, Separador, Baú, Caixa de Venda, Lixeira** e **Laboratório**.
- **Energia como no Satisfactory:** gerador, gerador grande, **gerador a carvão** (precisa de combustível), **painel solar** (depende do sol), postes e cabos. Cada grupo ligado vira uma rede; se gastar mais do que gera, tudo fica lento.
- **Subprodutos:** a fornalha solta **escória**, que vira tijolo ou vai pra lixeira.
- **Máquinas Mk2 e Mk3:** melhore cada máquina individualmente.
- **Drones programáveis** que voam, pegam e entregam itens.
- **Lâmpadas, telas e alto-falantes programáveis** (dá pra fazer painel de status e tocar música).

### Progressão
- **Níveis e XP** vendendo produtos; **loja** com máquinas, melhorias e decoração.
- **Árvore de pesquisa** no Laboratório (12 tecnologias).
- **Projeto Foguete** em 5 fases, com o foguete sendo montado de verdade na plataforma e **lançamento** no final.
- **Expansão do mapa:** 4 regiões pra comprar, com veios novos (inclusive carvão).
- **34 conquistas**, **estatísticas com gráficos** e **placar de eficiência** (🥉🥈🥇) pra cada computador.
- **Mercado** com preços que sobem e descem.

### Clima chill
- **Ciclo de dia e noite** (postes acendem à noite, estrelas no céu) e **chuva leve** com som.
- **Rádio com 4 estações**: **Bossa FM** 🌴 (11 bossas), Lo-fi Chill, Jazz Lounge e Só Natureza.
- **Oopi**, o pet robozinho que te segue e comenta o que acontece (dá pra fazer carinho).
- **Decoração que dá bônus:** plantas perto dos computadores aumentam o clock, luminárias aceleram as máquinas.
- **Modo foto** com câmera livre, zoom, congelar o tempo e salvar PNG.
- Cafezinho no escritório pra andar mais rápido ☕.

### Ferramentas
- **Copiar e colar** grupos de máquinas (com código e cabos).
- **Desfazer** com `Ctrl+Z`.
- **Mapa** visto de cima com zoom.
- **Tutorial interativo** opcional (o jogo pergunta no começo; dá pra refazer no menu).

---

## 🔁 O ciclo do jogo

```
Minerador ─▶ Fornalha ─▶ Montadora ─▶ Plataforma do Foguete / Caixa de Venda
    ▲           ▲            ▲                 ▲
    └──── tudo comandado por Computadores rodando Jiboia, ligados na energia ────┘
```

| Máquina | Como libera | ⚡ | O que faz |
|---|---|---|---|
| Esteira | nível 1 | – | Leva itens na direção das setinhas |
| Gerador / Poste | nível 1 | +20 / – | Energia e alcance dos cabos |
| Minerador | nível 1 | 3 | `.minerar()` tira 1 minério do veio |
| Caixa de Venda | nível 1 | 1 | `.vender()` vira dinheiro |
| Computador | nível 1 | 2 | Roda programas Jiboia |
| Baú · Lixeira | nível 2 | – | Guardar itens · destruir sobras |
| Fornalha | nível 2 | 4 | `.fundir()` minério → lingote (+ escória), aço |
| Laboratório | nível 2 | 5 | Pesquisas |
| Separador | nível 3 | 1 | `.enviar("esquerda")` |
| Montadora | nível 4 | 6 | `.fabricar("engrenagem")` e mais 9 receitas |
| Gerador Grande | nível 4 | +60 | Muita energia |
| Divisor · Juntador | pesquisa Logística | – | Repartir e juntar esteiras, sem código |
| Lâmpada · Tela · Alto-falante | pesquisa Sinais | 1 | Luz, painel e música programáveis |
| Esteira com Sensor | pesquisa Sensores | 1 | Conta itens e gera eventos |
| Rampas · Esteira Elevada | pesquisa Esteiras Elevadas | – | 2º andar |
| Gerador a Carvão | pesquisa Carvão | +75 | Queima carvão |
| Painel Solar | pesquisa Solar | +35 | Só de dia |
| Doca de Drones | pesquisa Drones | 8 | Drone programável |

Itens: minério de ferro/cobre, quartzo, carvão, escória, lingotes, silício, aço, tijolo, engrenagem, fio, chip, viga, motor, processador, robozinho, **módulo de foguete** e **satélite**. A tabela completa fica na loja (aba Receitas) e no manual do editor.

---

## 🐍 A linguagem Jiboia

Parecida com Python: indentação de 4 espaços, `if/elif/else`, `while`, `for ... in`, `def`/`return`, `break`/`continue`, listas, dicionários, f-strings, `global` e desempacotamento (`a, b = b, a`). **Também aceita português:** `se`, `senao`, `enquanto`, `para`/`em`, `funcao`, `retorne`, `Verdadeiro`, `escrever()`…

```python
enquanto Verdadeiro:
    para nome em maquinas("minerador"):
        maquina(nome).minerar()
    se dinheiro() > 1000:
        escrever("tô rico! 💰")
```

**Por que devagar?** Cada instrução consome 1 "tick" do clock da CPU (começa em 2 por segundo). Métodos como `.minerar()` **esperam** a máquina terminar. Código mais enxuto e mais computadores deixam a fábrica mais rápida, e o **placar** mostra quem está indo melhor.

**Funções avançadas** (liberadas por pesquisa):

```python
enviar("pc2", {"pedido": "engrenagem"})   # rede entre computadores
m = receber()
compartilhar("estoque", 10); ler("estoque")

ouvir("sensor1"); ouvir("vendas"); ouvir("tempo", 30)
e = esperar_evento()                      # {"tipo": "item", "fonte": "sensor1", ...}
esperar_ate(caixa_cheia)                  # espera uma função virar True

importar("util")                          # bibliotecas de funções (aba Bibliotecas)
```

**Depurador:** clique no número da linha pra criar um breakpoint, use ⏭ Passo e veja as variáveis na aba **Depurar**. **Autocompletar** sugere funções, métodos, nomes de máquinas e itens (dá pra desligar).

**Erros amigáveis:** `A variável 'prnt' não existe. Você quis dizer 'print'?`

O **manual completo** fica dentro do jogo (aba **Manual** do editor), com **Exemplos** prontos pra cada recurso.

---

## 🗂 Estrutura do projeto

```
AUTOMATON/
├── Jogar.bat              # atalho: sobe o servidor e abre o navegador
├── servidor.ps1           # servidor HTTP local (PowerShell, sem dependências)
├── index.html             # menu, HUD, editor, loja, janelas
├── css/style.css          # visual (painel de controle industrial: tinta + âmbar)
├── js/
│   ├── main.js            # boot, loop do jogo, controles, pausa
│   ├── state.js           # estado global + eventos
│   ├── data.js            # itens, receitas, máquinas, pesquisas, fases, regiões, conquistas, exemplos
│   ├── assets.js          # modelos GLB, texturas, HDRI e modelos montados por código
│   ├── world.js           # chão, floresta, veios, regiões, escritório, loja, plataforma
│   ├── sky.js             # dia/noite, chuva, estrelas, postes de luz
│   ├── player.js          # primeira pessoa (pointer lock, colisão, passos)
│   ├── build.js           # construção, 2º andar, cabos, copiar/colar, desfazer
│   ├── machines.js        # grid, esteiras, máquinas base e a API delas pra Jiboia
│   ├── machines2.js       # laboratório, foguete, drones, sinais, sensor, divisor, juntador, rampas, carvão, solar
│   ├── power.js           # energia: cabos, redes, geração e consumo dinâmicos
│   ├── computer.js        # computador: executa Jiboia, rede, eventos, depurador, placar
│   ├── economy.js         # dinheiro, XP, níveis, pesquisas, foguete, conquistas, histórico, offline
│   ├── editor.js          # editor com realce, autocompletar, depurador e bibliotecas
│   ├── panels.js          # janelas de pesquisa, foguete, estatísticas e mapa
│   ├── tutorial.js        # tutorial interativo
│   ├── pet.js             # Oopi, o pet
│   ├── photo.js           # modo foto
│   ├── menu.js            # menu principal (câmera passeando, terminal animado)
│   ├── settings.js        # configurações (áudio, vídeo, rádio, pet, autocompletar)
│   ├── ui.js              # HUD, loja, painel de máquina, confirmações, avisos
│   ├── guide.js · docs.js # guia e manual dentro do jogo
│   ├── audio.js           # efeitos, estações de rádio, notas sintetizadas
│   ├── itemMeshes.js · fx.js · thumbs.js · save.js
│   └── lang/jiboia.js     # a linguagem: lexer → parser (AST) → interpretador
├── lib/                   # three.js r169 (+ addons)
└── assets/                # modelos, sons, músicas, texturas, céu, fontes
```

### Como o interpretador funciona

`js/lang/jiboia.js` tem três partes:

1. **Lexer**: transforma o texto em tokens e gera `INDENT`/`DEDENT` pela indentação, como o Python.
2. **Parser**: descida recursiva que monta uma AST (`If`, `While`, `For`, `Def`, `Call`, `Bin`...).
3. **Interpretador**: feito com **generators** do JavaScript. Cada instrução faz `yield STEP` e o computador só avança quando tem "tick" de CPU sobrando. Chamadas que demoram (minerar, esperar, receber…) devolvem um objeto `Blocking`, e o interpretador faz `yield WAIT` até terminar. Funções como `esperar_ate` e `importar` são *generators* que rodam dentro do próprio interpretador. O depurador só para o loop antes de pagar o próximo `STEP`.

### Como adicionar coisas

- **Novo item:** `ITEMS` (`data.js`) + visual em `itemMeshes.js`.
- **Nova receita:** `RECIPES` ou `SMELT` (`data.js`), com `tech` opcional.
- **Nova máquina:** classe que estende `Machine` (em `machines2.js`), com `api()`; registre em `ENTITY_CLASSES` e em `MACHINES`, e escolha um modelo em `assets.js`.
- **Nova pesquisa / fase / conquista:** `TECHS`, `PHASES`, `ACHIEVEMENTS` (`data.js`).
- **Nova música:** `.mp3` em `assets/music/` e uma linha em `STATIONS` (`audio.js`).

Pra depurar, abra o console do navegador (`F12`). O estado do jogo fica em `window.automaton`.

---

## 📜 Créditos

Veja [CREDITOS.md](CREDITOS.md). Todos os modelos, sons, músicas, texturas e fontes foram baixados da internet de fontes com licença livre (CC0, CC-BY e OFL).
