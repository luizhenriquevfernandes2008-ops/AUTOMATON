# ⚙️ AUTOMATON

> 📖 **Não sabe por onde começar? Leia o [GUIA.md](GUIA.md)**, ou aperte **H** dentro do jogo. Num jogo novo, o jogo também oferece um **tutorial interativo**.

Jogo **3D em primeira pessoa**, chill, de **automação de fábrica** (estilo Satisfactory) com uma diferença: **nada funciona sozinho**. Cada máquina é controlada por **computadores que você programa** em **Jiboia**, uma linguagem própria parecida com Python que roda **devagarinho, uma instrução por vez**. Dá pra ver a setinha andando pelo código na tela do computador.

O objetivo grande é o **Projeto Foguete**: juntar peças cada vez mais complexas, entregar na plataforma de lançamento em 5 fases e mandar um satélite pro espaço. 🚀

### 🆕 Novidades

**v1.4: jogar com amigos**
- 🤝 **Amigos** (tecla `N`), tudo por **código de texto**, sem servidor:
  - 📅 **Desafio da semana**: um quebra-cabeça novo toda segunda, igual pra todo mundo. Troque códigos de nota com os amigos e monte um **placar**; o jogo roda a solução de cada um pra conferir. Depois de resolver, dá pra ver o código dos amigos.
  - 👀 **Visitar fábrica**: mande sua fábrica (arquivo `.automaton` ou código) e visite a dos amigos, sem salvar nada lá. Dá pra copiar grupos com `C` e levar pra 📐 Projetos.
  - 🤝 **Parceria**: um contrato em dupla; cada um cumpre na sua fábrica e, trocando os comprovantes, os dois ganham +5 🎟️ e 1 💾.
- 🦾 **Braço Robótico** (nível 3): pega atrás e solta na frente, programável (`.mover()`, `.pegar()`, `.soltar()`).
- 🤖 **Oopi programável** (amizade nível 2): `maquina("oopi").ir_para("bau1")`, `.pegar()`, `.soltar()`, `.colher()`, `.dizer()`.
- 6 conquistas novas.

**v1.3: motivos pra voltar todo dia**
- 📋 **Quadro de Contratos** (nível 2): clientes pedem itens (comum, raro e 🌟 lendário) com prazo. Entregue por esteira na **Doca de Entrega** e ganhe dinheiro, XP e **🎟️ fichas**. Entrega rápida dá +25%; perder o prazo não tira nada.
- 🧩 **Terminal de Desafios**: 10 quebra-cabeças de programação estilo Zachtronics, com notas de **instruções, linhas e memória** (🥉🥈🥇). Cada um libera uma **função nova** da Jiboia.
- 🛰️ **Programa Espacial**: depois do foguete, lance missões repetíveis. Cada **satélite** em órbita dá um bônus permanente, e cada missão rende **⭐ estrelas**.
- ♾️ **Pesquisas infinitas** no Laboratório (pagas com itens + estrelas), sem fim de jogo.
- 💾 **Discos de dados** (8 caixas perdidas na floresta, meteoros, correio, contratos lendários) liberam **11 receitas alternativas**.
- 🔋 Itens novos: **Bateria**, **Painel de LED** e **Computador Quântico**.
- 🎟️ **Loja de fichas**: chapéus e cores pro Oopi, decoração exclusiva (astronauta, alien, rover, nave) e mais vagas de contrato.
- 💞 **Amizade com o Oopi** (níveis 1 a 5, com presentes) e 📖 **álbum de itens**.
- 📬 **Correio da manhã**: presente diário com sequência de 7 dias e o jornalzinho da fábrica.
- 🔥 **Combo de vendas** (até +20%), confete nos marcos e dinheiro que pula no HUD.
- 📐 **Projetos**: salve grupos copiados e troque com amigos por um código de texto.
- 19 conquistas e 5 objetivos novos.
- ⚡ **Desempenho**: árvores, pedras, cristais e gramadinhos desenhados em lote (~75% menos chamadas de desenho), **orçamento fixo de luzes** (no máximo 8 luzes pontuais, sem travadinhas ao colocar luminárias), painéis sem desfoque de fundo (pesado no Firefox), opção **Mostrar FPS** (com a placa de vídeo usada) e **diagnóstico de GPU**: o jogo avisa, com o passo a passo, quando o navegador está sem aceleração de hardware ou usando a placa integrada.

**v1.2**
- 🧱 **Construção com materiais** (madeira, tijolo, concreto, vidro, aço): paredes, janelas, portas, pisos, tetos, cercas, pintura e quadros de domínio público. **Depósito de Materiais** pra receber por esteira.
- 🛋️ **Escritório personalizável** com 14 móveis novos.
- 🌱 **Horta**: canteiros, irrigador e **estufa** (teto de vidro). Café, milho, cenoura, abóbora, melancia e bambu (vira madeira).
- ☄️ **Eventos**: chuva de meteoros com veio raro, dia de feira, aurora e arco-íris.
- 🤖 **Oopi com mais vida**: não roda mais em volta de você quando você gira a câmera, tem humor, comemora recordes e faz tarefas.
- ⚙️ **Hardware de cada computador**: overclock e memória (limite de variáveis e de itens por lista).
- 💾 **3 fábricas** (saves), ⌨️ **teclas configuráveis**, 🎮 **controle**, **modo daltônico** e **fonte do editor ajustável**.
- 🏃 Corrida com embalo e deslize; ⚡ esteiras e itens desenhados em lote (*instancing*) pra fábricas grandes.

**v1.1**: pesquisa, Projeto Foguete, drones, carvão e energia solar, 2º andar, rede entre computadores, sensores, depurador, dia e noite, rádio, conquistas, mapa, copiar/colar e desfazer.

---

## ▶ Como jogar

1. Dê dois cliques em **`Jogar.bat`**.
2. Uma janelinha preta vai abrir (é o servidor local, deixe ela aberta) e o jogo abre no navegador.
3. Clique em **01 · Jogar**.

> O jogo precisa desse servidorzinho local porque o navegador não carrega modelos 3D direto do disco. Ele usa só o PowerShell que já vem no Windows, não precisa instalar nada.
> Se a página não abrir sozinha, acesse **http://localhost:8765/** (ou a porta que aparecer na janela).

O progresso é **salvo automaticamente** a cada 30 segundos, e a fábrica **continua rendendo enquanto você está fora** (metade do ritmo, por até 8 horas). Tem **3 fábricas** (espaços de save) no menu: dá pra começar outra sem perder a sua.

### Controles

| Tecla | Ação |
|---|---|
| `W A S D` · `Shift` · `Espaço` | andar · correr · pular |
| `Ctrl` durante a corrida | deslizar; solte para levantar ou pule para conservar o impulso |
| `1` | 🔌 Cabo de energia (sempre o primeiro da barra) |
| `2` | 🧱 Construção: paredes, janelas, portas, pisos, tetos, cercas e pintura |
| `3`–`9` / roda do mouse | escolher peça |
| `F` / `T` | construção: trocar a peça / trocar o material (ou a cor da tinta) · `F` olhando pro Oopi: tarefas |
| `Clique` | colocar / usar / ligar cabo |
| `R` | girar a peça (ou o grupo colado) |
| `Q` | guardar a peça da mão / cancelar |
| `E` | programar computador, detalhes da máquina, pesquisas, foguete, loja, rádio, café, carinho no pet |
| `X` / botão direito | guardar a peça mirada (com o Cabo: soltar o cabo / tirar cabos) |
| `C` / `V` | copiar uma área / colar de novo |
| `Ctrl+Z` | desfazer |
| `B` | loja |
| `Tab` | mapa visto de cima |
| `L` | 📋 quadro de contratos |
| `J` | 📐 projetos salvos |
| `N` | 🤝 amigos (desafio da semana, visitas, parcerias) |
| `K` | estatísticas, placar e conquistas |
| `H` | guia |
| `P` | modo foto |
| `M` / `G` | próxima música / próxima estação de rádio |
| `Esc` | pausa |

**Todas as teclas podem ser trocadas** em Configurações → Teclas. **Controle (gamepad)** também funciona: alavanca esquerda anda, direita olha, `A` pula, `B` desliza/cancela, `X` usa, `Y` loja, `LB`/`RB` trocam a peça, `LT` guarda, `RT` coloca, `L3` corre, `R3` gira, ↑/↓ peça e material da construção, `Start` pausa.

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
- **Hardware de cada computador** (aba ⚙ Hardware do editor): **overclock** (até 3× mais instruções por segundo) e **memória** (mais variáveis e listas maiores). Programas que passam do limite param com um aviso amigável.

### Horta 🌱
- **Canteiros** pra plantar **café, milho, cenoura, abóbora, melancia e bambu** (o bambu vira **madeira**). As plantas crescem com **água** (chuva, regador ou **irrigador**) e **luz** (de noite crescem pela metade).
- **Estufa:** um **teto de vidro** em cima do canteiro deixa crescer 50% mais rápido, até de noite (mas aí a chuva não molha).
- A colheita sai pela seta laranja, então dá pra automatizar tudo com esteiras e código (`.plantar()`, `.colher()`, `.umidade()`).

### Construção e escritório 🧱
- **Sistema de materiais:** madeira, tijolo, concreto, vidro e aço. Fabrique e mande por esteira pro **Depósito de Materiais**, ou compre na loja (aba Materiais).
- **Paredes, janelas, portas, pisos, tetos e cercas** encaixadas nas bordas das células, com colisão de verdade. Portas deixam passar.
- **Pintura** com 9 cores e **quadros de domínio público** (Van Gogh, Hokusai, Monet, Vermeer, Almeida Júnior) pra pendurar nas paredes.
- **Móveis pro escritório:** estante, poltrona, sofá, TV, tapete, luminárias, mesa, frigobar, ursinho, ventilador de teto e mais. Eles podem ficar dentro do escritório.

### Metas que se renovam (v1.3)
- **📋 Contratos**: pedidos com prazo e raridade no quadro do escritório; entrega por esteira na **Doca de Entrega**. Rendem **🎟️ fichas**, que compram chapéus e cores pro Oopi, decoração exclusiva e vagas extras.
- **🧩 Desafios de programação**: 10 quebra-cabeças isolados (`pegar()` / `entregar()` / `tem_mais()`), com 3 medalhas por desafio. Resolver libera funções como `mais_caro()`, `faltando()` e `maior_chave()`.
- **🛰️ Programa Espacial**: missões repetíveis depois do foguete, com 6 tipos de satélite (até 5 de cada) e bônus que somam.
- **♾️ Pesquisas infinitas** e **💾 discos de dados** com receitas alternativas.
- **📬 Correio da manhã** diário, **🔥 combo de vendas**, **📖 álbum**, **💞 amizade com o Oopi** e **📐 projetos** compartilháveis.

### Progressão
- **Níveis e XP** vendendo produtos; **loja** com máquinas, melhorias e decoração.
- **Árvore de pesquisa** no Laboratório (14 tecnologias + 6 infinitas).
- **Projeto Foguete** em 5 fases, com o foguete sendo montado de verdade na plataforma e **lançamento** no final.
- **Expansão do mapa:** 4 regiões pra comprar, com veios novos (inclusive carvão).
- **71 conquistas**, **estatísticas com gráficos** e **placar de eficiência** (🥉🥈🥇) pra cada computador.
- **Mercado** com preços que sobem e descem.
- **Recordes da fábrica** ($/min, itens/min, maior venda): o Oopi comemora quando você bate um.

### Clima chill
- **Ciclo de dia e noite** (postes acendem à noite, estrelas no céu) e **chuva leve** com som.
- **Rádio com 4 estações**: **Bossa FM** 🌴 (11 bossas), Lo-fi Chill, Jazz Lounge e Só Natureza.
- **Oopi**, o pet robozinho: te segue sem ficar rodando em volta quando você gira a câmera, tem **humor** (carinho deixa ele feliz), **comemora recordes** e faz **tarefas** (`F` olhando pra ele): colher a horta, buscar meteoritos, levar itens de um baú pra uma máquina, seguir ou ficar parado.
- **Eventos tranquilos:** **chuva de meteoros** à noite (deixa um **veio raro de meteorito** pra minerar e pedrinhas brilhantes pra pegar), **dia de feira** (3 itens com preço +60% por 4 minutos), **aurora** no céu e **arco-íris** depois da chuva.
- **Decoração que dá bônus:** plantas perto dos computadores aumentam o clock, luminárias aceleram as máquinas.
- **Modo foto** com câmera livre, zoom, congelar o tempo e salvar PNG.
- Cafezinho ☕: `E` na cafeteira do escritório dá +30% de velocidade por 90 segundos.
- Corrida com embalo: segure `Shift` enquanto se move para ganhar velocidade aos poucos (até 10,8 m/s, ou 14 m/s com café). `Ctrl` inicia um deslize com impulso e câmera baixa; `Espaço` salta mantendo a velocidade. Parar, inverter a direção ou bater reduz o embalo.

### Ferramentas
- **Copiar e colar** grupos de máquinas (com código e cabos).
- **Desfazer** com `Ctrl+Z`.
- **Mapa** visto de cima com zoom.
- **Tutorial interativo** opcional (o jogo pergunta no começo; dá pra refazer no menu).
- **3 espaços de save**, **teclas configuráveis**, **controle (gamepad)**, **modo daltônico** (deuteranopia, protanopia e tritanopia) e **tamanho da fonte do editor**.
- **Otimizado pra fábricas grandes:** esteiras, itens e o cenário (árvores, pedras, cristais) são desenhados em lote (*instancing*), com uma chamada de desenho por tipo em vez de uma por objeto. As luzes pontuais passam por um orçamento fixo (`lights.js`): só as mais perto da câmera acendem de verdade.

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
| Canteiro | nível 1 | – | `.plantar("cafe")`, `.colher()`: horta |
| Irrigador | nível 2 | 1 | Rega os canteiros em volta |
| Depósito de Materiais | nível 1 | – | Guarda materiais de construção no estoque 🧱 |
| Doca de Entrega | nível 2 | – | Recebe os itens dos contratos aceitos 📋 |
| Braço Robótico | nível 3 | 2 | `.mover()`: pega atrás e solta na frente 🦾 |

Itens: minério de ferro/cobre, quartzo, carvão, escória, lingotes, silício, aço, tijolo, engrenagem, fio, chip, viga, motor, processador, robozinho, **módulo de foguete**, **satélite**, os da horta (**grão de café**, milho, cenoura, abóbora, melancia), os materiais (**madeira**, **concreto**, **vidro**), o raro **fragmento estelar** e os de ponta (**bateria**, **painel de LED**, **computador quântico**). A tabela completa fica na loja (aba Receitas) e no manual do editor.

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

**Por que devagar?** Cada instrução consome 1 "tick" do clock da CPU (começa em 2 por segundo). Métodos como `.minerar()` **esperam** a máquina terminar. Código mais enxuto e mais computadores deixam a fábrica mais rápida, e o **placar** mostra quem está indo melhor. Cada computador também tem **memória**: começa com 24 variáveis e listas de até 256 itens, e dá pra melhorar (e fazer overclock) na aba **⚙ Hardware** do editor.

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

**Contratos e desafios** (v1.3):

```python
for c in contratos():                     # contratos aceitos no quadro
    print(c["cliente"], c["faltando"], c["segundos"])
if "chip" in faltando():                  # liberada pelo desafio "Montadora de cabeça"
    anunciar("chegando chip!")            # liberada pelo desafio "Primeira entrega"
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
│   ├── player.js          # primeira pessoa, embalo, deslize, colisão e bônus do café
│   ├── build.js           # construção, 2º andar, cabos, copiar/colar, desfazer
│   ├── machines.js        # grid, esteiras, máquinas base e a API delas pra Jiboia
│   ├── machines2.js       # laboratório, foguete, drones, sinais, sensor, divisor, juntador, rampas, carvão, solar
│   ├── farm.js            # horta: canteiro, irrigador e depósito de materiais
│   ├── structures.js      # construção: paredes/pisos/tetos nas bordas das células, materiais, pintura, quadros
│   ├── events.js          # chuva de meteoros (veio raro), feira, aurora e arco-íris
│   ├── contracts.js       # quadro de contratos, doca de entrega, nave de carga
│   ├── challenges.js      # desafios de programação: dados, execução e notas (roda no Node também)
│   ├── challengeUI.js     # terminal de desafios e editor
│   ├── space.js           # programa espacial (missões, satélites no céu)
│   ├── disks.js           # discos de dados, caixas perdidas e receitas alternativas
│   ├── mail.js            # correio da manhã (presente diário)
│   ├── blueprints.js      # projetos salvos e códigos de compartilhar
│   ├── weekly.js          # desafio da semana (sorteado pela semana) e códigos de placar
│   ├── friends.js         # janela de amigos: placar, visitar fábrica, parcerias
│   ├── arm.js             # braço robótico
│   ├── input.js           # teclas configuráveis
│   ├── gamepad.js         # controle (gamepad)
│   ├── palette.js         # cores de sinal e modos pra daltonismo
│   ├── power.js           # energia: cabos, redes, geração e consumo dinâmicos
│   ├── computer.js        # computador: executa Jiboia, rede, eventos, depurador, placar
│   ├── economy.js         # dinheiro, XP, níveis, pesquisas, foguete, conquistas, histórico, offline
│   ├── editor.js          # editor com realce, autocompletar, depurador e bibliotecas
│   ├── panels.js          # janelas de pesquisa, foguete, estatísticas e mapa
│   ├── tutorial.js        # tutorial interativo
│   ├── pet.js             # Oopi: segue, humor, recordes e tarefas
│   ├── photo.js           # modo foto
│   ├── menu.js            # menu principal (câmera passeando, terminal animado)
│   ├── settings.js        # configurações (áudio, vídeo, rádio, pet, autocompletar, daltonismo, fonte, controle)
│   ├── ui.js              # HUD, loja, painel de máquina, confirmações, avisos
│   ├── guide.js · docs.js # guia e manual dentro do jogo
│   ├── audio.js           # efeitos, estações de rádio, notas sintetizadas
│   ├── itemMeshes.js      # visual dos itens, desenhados em lote (InstancedMesh)
│   ├── lights.js          # orçamento de luzes (só as N mais perto da câmera)
│   ├── gpu.js             # detecta a placa de vídeo do WebGL e avisa quando o FPS fica baixo
│   ├── staticBatch.js     # cenário parado desenhado em lote (InstancedMesh)
│   ├── fx.js · thumbs.js · save.js (3 fábricas)
│   └── lang/jiboia.js     # a linguagem: lexer → parser (AST) → interpretador
├── lib/                   # three.js r169 (+ addons)
└── assets/                # modelos, sons, músicas, texturas, céu, fontes, quadros
```

### Como o interpretador funciona

`js/lang/jiboia.js` tem três partes:

1. **Lexer**: transforma o texto em tokens e gera `INDENT`/`DEDENT` pela indentação, como o Python.
2. **Parser**: descida recursiva que monta uma AST (`If`, `While`, `For`, `Def`, `Call`, `Bin`...).
3. **Interpretador**: feito com **generators** do JavaScript. Cada instrução faz `yield STEP` e o computador só avança quando tem "tick" de CPU sobrando. Chamadas que demoram (minerar, esperar, receber…) devolvem um objeto `Blocking`, e o interpretador faz `yield WAIT` até terminar. Funções como `esperar_ate` e `importar` são *generators* que rodam dentro do próprio interpretador. O depurador só para o loop antes de pagar o próximo `STEP`.

### Como adicionar coisas

**Assets visuais devem ser baixados da internet, com licença de uso e fonte registradas em CREDITOS.md.** Não substituir os modelos por formas primitivas geradas em código.

- **Novo item:** `ITEMS` (`data.js`) + visual em `itemMeshes.js`.
- **Nova receita:** `RECIPES` ou `SMELT` (`data.js`), com `tech` opcional.
- **Nova máquina:** classe que estende `Machine` (em `machines2.js`), com `api()`; registre em `ENTITY_CLASSES` e em `MACHINES`, e escolha um modelo em `assets.js`.
- **Nova pesquisa / fase / conquista:** `TECHS`, `PHASES`, `ACHIEVEMENTS` (`data.js`).
- **Nova música:** `.mp3` em `assets/music/` e uma linha em `STATIONS` (`audio.js`).
- **Nova planta:** `CROPS` (`data.js`), com os modelos de cada fase em `assets.js`.
- **Nova peça de construção / material / quadro:** `PIECES`, `MATERIALS`, `PAINTINGS` (`data.js`).
- **Novo evento:** `startEvent` em `events.js`.
- **Novo cliente / raridade de contrato:** `CLIENTS`, `RARITY` (`data.js`).
- **Novo desafio:** `CHALLENGES` (`challenges.js`): gerador da entrada, solução esperada e metas; ponha a solução de referência em `tests/challenges.test.mjs`.
- **Novo satélite / pesquisa infinita / receita alternativa:** `SATELLITES`, `INF_TECHS` (`data.js`), receitas com `alt: true` em `RECIPES`/`SMELT`.
- **Novo chapéu do Oopi:** `OOPI_HATS` (`data.js`) + modelo em `assets.js`.

Pra depurar, abra o console do navegador (`F12`). O estado do jogo fica em `window.automaton`.

Para testar movimento, colisões (inclusive paredes), deslize, controle e café com Node.js (sem instalar pacotes):

```sh
node --experimental-vm-modules --test tests/player.test.mjs
node --test tests/challenges.test.mjs   # as soluções de referência de todos os desafios ganham ouro
node --test tests/weekly.test.mjs       # 3 anos de desafios da semana, todos resolvíveis; códigos de placar
```

---

## 📜 Créditos

Veja [CREDITOS.md](CREDITOS.md). Todos os modelos, sons, músicas, texturas e fontes foram baixados da internet de fontes com licença livre (CC0, CC-BY e OFL).

