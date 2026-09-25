# 📖 Guia do AUTOMATON

> Num jogo novo, o jogo pergunta se você quer o **tutorial interativo** (dá pra refazer no menu → Como jogar).
>
> Esse guia também está **dentro do jogo**: aperte **`H`**. Ou abra **Pausa → 📖 Guia**, a aba **Guia** no editor de código, ou o botão **"📖 Como funciona?"** no painel de cada máquina.

No AUTOMATON **nada funciona sozinho**:

1. As **máquinas só trabalham quando um computador manda** (programa em Jiboia).
2. Tudo que usa **energia ⚡** precisa de um **cabo 🔌** ligado num **gerador**.
3. As **esteiras** não precisam de nada: elas levam os itens sozinhas, na direção das setinhas.

---

## 1. Os sinais no chão e nas máquinas

| Sinal | O que significa |
|---|---|
| 🟧 **Seta laranja** no chão | **SAÍDA**. É por onde a máquina solta o item pronto. Coloque uma esteira ali, apontando pra fora. |
| 🟦 **Setas azuis** no chão | **ENTRADA**. Por onde a máquina aceita itens. **Nunca** entra item pela seta laranja. |
| **⌃⌃ Setinhas amarelas andando** na esteira | Pra onde o item vai. |
| **Seta amarela grande** ao segurar uma peça | A direção da peça. Aperte **`R`** pra girar **antes** de colocar. |
| 🟢 Luz verde | Trabalhando |
| 🟡 Luz amarela | Esperando algo (item chegar, saída liberar…) |
| 🔵 Luz azul | Tem item pronto esperando pra sair |
| 🔴 Luz vermelha **piscando** | **SEM ENERGIA**: ligue um cabo |
| ⚪ Luz cinza | Parada: nenhum programa mandou ela trabalhar |

### Por onde cada máquina recebe e solta

| Máquina | Entrada (azul) | Saída (laranja) |
|---|---|---|
| Minerador | nenhuma, tira do chão | frente |
| Fornalha | trás e lados | frente |
| Montadora | trás e lados | frente |
| Separador | **só trás** | frente, esquerda e direita |
| Baú | trás e lados | frente (quando o código chama `.retirar()`) |
| Caixa de Venda | todos os lados | nenhuma, vira dinheiro |

---

## 2. Primeira fábrica: minerar e vender

Visto de cima:

```
  💎 = veio de minério (o minerador fica EM CIMA dele)

  [⛏️ minerador1] → [esteira →] → [esteira →] → [💰 venda1]
       seta laranja
       apontando →
```

1. Escolha o **Minerador** na barra (teclas `1`–`9`), mire num **veio de ferro** (cristais azuis), gire com **`R`** até a seta amarela apontar pra onde você quer mandar o minério e clique.
2. Coloque **Esteiras** começando na seta laranja do minerador, **todas apontando pro mesmo lado**. Confira as setinhas amarelas.
3. No fim da esteira, coloque a **Caixa de Venda**.
4. Faça a **energia** (passo 3) e depois o **programa** (passo 4).

> A esteira faz **curva sozinha**: se um item chega pelo lado, ela vira curva. Se ficou estranho, gire com `R`.

---

## 3. Energia ⚡: gerador, cabos e postes

```
  [🔋 gerador +20⚡] ~~~cabo~~~ [🗼 poste] ~~~cabo~~~ [⛏️ minerador −3⚡]
                                    ~
                                   cabo
                                    ~
                              [🖥️ pc1 −2⚡]
```

1. Coloque o **Gerador** (produz **20 ⚡**).
2. Escolha o **🔌 Cabo**. Ele é **sempre a tecla `1`**.
3. **Clique no gerador**, depois **clique na máquina**. O fio aparece.
4. O cabo continua preso na última peça, então dá pra ir clicando em várias seguidas. **Botão direito** solta o cabo.
5. Pra tirar cabos: com o Cabo na mão, mire na peça e aperte **`X`**.

**Regras:**

- O cabo tem no máximo **16 metros**. Pra ir mais longe, coloque **Postes** no meio do caminho.
- Máquinas aceitam **2 cabos** (dá pra passar energia de uma pra vizinha). Gerador: 4 cabos. Gerador Grande e Poste: 6.
- Tudo que está ligado forma uma **rede**. Se a rede **gasta mais do que gera**, tudo nela fica **mais lento**. Coloque mais geradores na mesma rede.
- O HUD (canto de cima) mostra **⚡ usado/gerado**. Fica vermelho se faltar energia.

| Gasta energia | ⚡ | | Gera energia | ⚡ |
|---|---|---|---|---|
| Computador | 2 | | Gerador (nível 1, $150) | +20 |
| Minerador | 3 | | Gerador Grande (nível 4, $700) | +60 |
| Fornalha | 4 | | | |
| Montadora | 6 | | | |
| Separador | 1 | | | |
| Caixa de Venda | 1 | | | |

**Não precisam de energia:** esteiras, baú, postes e decoração.

---

## 4. O computador

Com o computador ligado na energia, aperte **`E`** nele, escreva o programa e clique em **▶ Executar** (ou `Ctrl+Enter`).
Ele roda **uma linha por vez** (dá pra ver a setinha andando). **Pode fechar o editor**: o programa continua rodando.

```python
mina = maquina("minerador1")   # o nome aparece na plaquinha em cima da máquina
caixa = maquina("venda1")

while True:
    mina.minerar()             # espera uns 3 segundos e solta 1 minério na esteira
    if caixa.quantidade() >= 5:
        caixa.vender()
```

---

## 5. 🔥 A Fornalha, passo a passo

A fornalha transforma **minério** em **lingote**, que vale bem mais. Ela funciona **assim**:

1. **O minério chega pela esteira** e entra pelas **setas azuis** (trás ou lados). Ele fica **guardado dentro** da fornalha (cabem 20).
2. **Ela NÃO derrete sozinha.** Um computador tem que chamar **`forno.fundir()`**. **Cada chamada derrete 1 minério** e leva 2,5 segundos.
3. O **lingote sai pela seta laranja**, na frente. **Precisa ter uma esteira ali** levando embora; senão a saída enche (10 itens) e ela para.
4. Ela precisa de **4 ⚡** de energia.

Montagem, vista de cima:

```
  [⛏️ minerador1 →] → [esteira →] → [🔥 fornalha1 →] → [esteira →] → [💰 venda1]
                                          ~
                                        cabo
                                          ~
  [🔋 gerador] ~~~~~~~~~~ cabo ~~~~~~ [🖥️ pc1]
```

A fornalha fica **virada pro mesmo lado da esteira**: a esteira chega nas **costas** dela (seta azul) e continua na **frente** (seta laranja).

Programa:

```python
mina = maquina("minerador1")
forno = maquina("fornalha1")
caixa = maquina("venda1")

while True:
    mina.minerar()                 # 1) tira minério, que vai pela esteira até a fornalha
    if forno.quantidade() > 0:     # 2) tem minério guardado dentro da fornalha?
        forno.fundir()             # 3) derrete 1; o lingote sai pela seta laranja
    if caixa.quantidade() >= 3:
        caixa.vender()             # 4) vende os lingotes
```

**Por que o `if forno.quantidade() > 0`?** Porque `forno.fundir()` sem minério dentro **fica esperando** o minério chegar (luz amarela, "Esperando minério chegar pela esteira"). Num computador só, isso travaria o minerador.

**Jeito mais fácil, com 2 computadores:** um só minera, o outro só funde:

```python
# pc1
mina = maquina("minerador1")
while True:
    mina.minerar()
```

```python
# pc2
forno = maquina("fornalha1")
while True:
    forno.fundir()   # espera o minério chegar e derrete, pra sempre
```

**Outros minérios:** ela também funde **cobre** (`"minerio_cobre"` → lingote de cobre). No nível 5, funde **quartzo** → silício. Pra escolher qual: `forno.fundir("minerio_cobre")`.

### Se a fornalha não funciona

| A fornalha mostra… | O que fazer |
|---|---|
| **Esperando minério chegar pela esteira** | O minério não está chegando. A esteira aponta pra fornalha? Chega pelas **costas/lados** (azul), e não pela frente (laranja)? |
| **Saída cheia** | Falta esteira na seta laranja, ou a esteira está apontando de volta pra fornalha. |
| **Sem energia ⚡** (luz vermelha) | Ligue um cabo 🔌 dela até o gerador ou até um poste da rede. |
| **Parada** (luz cinza) | Nenhum programa chamou `fundir()`. Confira se o computador está rodando e se o nome está certo (`"fornalha1"`). |
| Erro **"precisa do nível 2"** | A fornalha só funciona a partir do nível 2. |

---

## 6. 🛠️ A Montadora (nível 4)

Funciona igual à fornalha: os ingredientes entram pelas setas azuis e ficam guardados dentro. `mont.fabricar("engrenagem")` gasta **2 lingotes de ferro** e solta **1 engrenagem** pela seta laranja.

```python
mont = maquina("montadora1")
while True:
    mont.fabricar("engrenagem")   # espera os 2 lingotes chegarem
```

`mont.pode_fabricar("engrenagem")` diz se já tem tudo, sem esperar.

| Receita | Precisa | Faz | Nível |
|---|---|---|---|
| `"engrenagem"` | 2 lingotes de ferro | 1 engrenagem | 4 |
| `"fio"` | 1 lingote de cobre | 2 fios | 4 |
| `"chip"` | 1 silício + 2 fios | 1 chip | 5 |
| `"motor"` | 2 engrenagens + 2 fios | 1 motor | 6 |
| `"robozinho"` | 1 motor + 2 chips | 1 robozinho 🤖 | 8 |

---

## 7. 🔀 O Separador (nível 3)

O item entra **só por trás** (seta azul). O programa decide se ele sai pela **frente**, **esquerda** ou **direita** (setas laranjas).

```python
sep = maquina("separador1")
while True:
    item = sep.esperar_item()
    if item == "minerio_ferro":
        sep.enviar("esquerda")
    else:
        sep.enviar("direita")
```

---

## 8. 🔬 Laboratório e pesquisas

1. Compre um **Laboratório** (nível 2) e ligue na energia (5 ⚡).
2. Aperte **`E`** nele: abre a **árvore de pesquisas**.
3. Escolha uma pesquisa. Ela mostra os itens que precisa (ex: 20 lingotes de ferro).
4. Mande os itens **por esteira**: o laboratório aceita por qualquer lado, mas só o que a pesquisa pede.
5. Quando completar, a tecnologia libera máquinas, receitas e funções novas da Jiboia.

| Pesquisa | Libera | Precisa da fase |
|---|---|---|
| 🔀 Logística | Divisor e Juntador | – |
| 💡 Sinais e Telas | Lâmpada, Tela, Alto-falante | – |
| 📡 Sensores e Eventos | Esteira com Sensor, `ouvir()`, `esperar_evento()`, `esperar_ate()` | – |
| 🌉 Esteiras Elevadas | Rampas e esteiras no 2º andar | 1 |
| 🛰️ Rede de Computadores | `enviar()`, `receber()`, `compartilhar()`, `ler()` | 1 |
| 🔥 Energia a Carvão | Minerar carvão, Gerador a Carvão | 1 |
| ⬆️ Máquinas Mk2 | Melhorar máquinas pra Mk2 | 1 |
| ⚒️ Metalurgia | Aço na fornalha, Vigas | 2 |
| ☀️ Energia Solar | Painel Solar | 2 |
| 🚁 Drones | Doca de Drones | 2 |
| ⏫ Máquinas Mk3 | Melhorar máquinas pra Mk3 | 3 |
| 🚀 Engenharia Espacial | Processador, Módulo de Foguete, Satélite | 3 |

---

## 9. 🚀 Projeto Foguete (o objetivo grande)

Ao **norte** da fábrica fica a **Plataforma de Lançamento** (3×3). É como o Elevador Espacial do Satisfactory:

- Cada **fase** pede uma lista de itens (aparece no canto direito da tela e no **`E`** da plataforma).
- Leve os itens **por esteira até qualquer lado** da plataforma.
- Cada fase dá **dinheiro, XP**, monta um pedaço do foguete e **libera pesquisas novas**.

| Fase | Pede |
|---|---|
| 1 · Fundação | 50 lingotes de ferro, 30 lingotes de cobre |
| 2 · Estrutura | 40 engrenagens, 60 fios, 30 tijolos |
| 3 · Tanques | 40 aços, 25 chips, 10 motores |
| 4 · Controle | 25 vigas, 10 processadores, 5 robozinhos |
| 5 · Lançamento! | 8 módulos de foguete, 2 satélites, e então **🚀 Lançar** |

---

## 10. 🗺️ Regiões novas

Nas bordas da floresta tem **placas 🔒**. Mire numa e aperte **`E`** pra comprar a região: as árvores somem e você pode construir lá, com veios novos (inclusive **carvão**).

| Região | Preço | Nível |
|---|---|---|
| Floresta Norte | $ 3.000 | 3 |
| Vale Leste | $ 8.000 | 5 |
| Colinas Oeste | $ 15.000 | 6 |
| Campos do Sul | $ 30.000 | 7 |

Veja tudo no **mapa** (`Tab`).

---

## 11. 🔀 Logística

- **Divisor**: o item entra por trás e sai revezando: esquerda → frente → direita. Sem código.
- **Juntador**: junta até 3 esteiras (trás, esquerda, direita) numa só, revezando pra nenhum lado engarrafar.
- **Esteira com Sensor**: igual a uma esteira, mas conta cada item e avisa o programa (`ouvir("sensor1")`). Gasta 1 ⚡.
- **2º andar**: **Rampa (sobe)** → **Esteira Elevada** → **Rampa (desce)**. Passa por cima de outras esteiras e de máquinas baixas, e você passa por baixo.

```
chão:     [esteira →][rampa ↗]            [rampa ↘][baú]
2º andar:                     [elevada →][elevada →]
chão:                          ↓ outra esteira passando por baixo
```

- **Lixeira**: destrói qualquer item. Ótima pra escória sobrando.

---

## 12. 🔥 Carvão, sol, escória e aço

- **Gerador a Carvão**: 75 ⚡, queimando 1 carvão a cada 8 segundos. O carvão entra pelas setas azuis. No código: `g.desligar()` quando não precisar (economiza carvão) e `g.ligar()` de novo.
- **Painel Solar**: até 35 ⚡ de graça, só de dia. À noite dá zero, e na chuva, menos.
- **Escória**: a fornalha solta 1 escória a cada 2 lingotes (e 1 a cada aço). Ela sai junto, pela seta laranja. Separe com um **Separador** e mande pra **Lixeira**, ou faça **tijolos** na montadora (3 escórias = 1 tijolo, usado no foguete).
- **Aço**: lingote de ferro + carvão na fornalha: `forno.fundir("aco")`.

---

## 13. 🚁 Drones, ⬆ Mk2/Mk3 e decoração

**Drones:** a **Doca de Drones** cria um drone (o nome aparece em cima dele).

```python
d = maquina("drone1")
while True:
    d.ir_para("bau1")
    d.pegar()
    d.ir_para("venda1")
    d.soltar()
```

**Mk2 e Mk3:** depois das pesquisas, aperte **`E`** numa máquina e clique **⬆ Melhorar**. Mk2 = 1,5× mais rápida, Mk3 = 2,2×, e gastam um pouco mais de energia. Um anel colorido aparece no pé da máquina.

**Decoração com bônus** (num raio de 3 células):

| Decoração | Bônus |
|---|---|
| Vaso de Planta, Flores, Árvore, Sofá, Banco | + clock dos computadores |
| Luminária, Barris, Cafeteira | + velocidade das máquinas |
| Antena Parabólica | os dois |
| Estátua do Oopi | +10% nos dois, raio grande |

---

## 14. 🌱 Horta

1. Compre um **Canteiro** na loja e coloque no chão. A **seta laranja** é por onde a colheita sai.
2. Aperte **`E`** nele e escolha a semente (custa poucos $):

| Planta | Colheita | Tempo (com água, de dia) |
|---|---|---|
| ☕ Café | 3 grãos de café | ~2,5 min |
| 🌽 Milho | 3 milhos | ~2 min |
| 🥕 Cenoura | 3 cenouras | ~1,5 min |
| 🎃 Abóbora | 1 abóbora | ~3 min |
| 🍉 Melancia | 1 melancia | ~3,5 min |
| 🎋 Bambu | 3 **madeiras** | ~2 min |

3. **Água:** a terra seca em uns 4 minutos. Seca, a planta quase para. A **chuva** rega de graça, o botão **💧 Regar** do painel também, e o **Irrigador** (1 ⚡) rega sozinho tudo num raio de 2 células.
4. **Luz:** de noite cresce pela metade. Um **teto de vidro** em cima vira **estufa**: +50% e cresce igual de noite (mas aí a chuva não molha, use o irrigador). Teto de outro material faz sombra e quase para a planta.
5. Pronta, ela brilha. Colha no painel (**🧺 Colher**), peça pro Oopi, ou por código. Por padrão ela **replanta sozinha**.

```python
horta = maquina("canteiro1")
horta.plantar("cafe")
while True:
    horta.colher()        # espera ficar pronta e colhe (sai pela seta laranja)
```

Outros métodos: `.pronta()`, `.crescimento()` (0 a 1), `.umidade()` (0 a 1), `.planta()`, `.replantar(False)`. No irrigador: `.regar()`, `.ligar()`, `.desligar()`.

---

## 15. 🧱 Construção, materiais e escritório

Aperte **`2`** (a ferramenta **🧱 Construção**, sempre a segunda da barra):

- **`F`** troca a peça: **Parede, Janela, Porta, Piso, Teto, Cerca** e **🖌️ Pintar**.
- **`T`** troca o material: **madeira, tijolo, concreto, vidro, aço** (ou a cor, no modo Pintar).
- **Clique** constrói. Paredes, janelas, portas e cercas vão na **borda da célula mais perto da mira**. Pisos e tetos ocupam a célula inteira (e máquinas podem ficar em cima do piso).
- **`X`** desmonta e **devolve todo o material**. `Ctrl+Z` desfaz.
- Portas deixam passar; paredes e janelas seguram o jogador.

**Materiais** ficam num **estoque 🧱** separado (aparece na barra da construção):

| Material | Como conseguir |
|---|---|
| Madeira | plante **bambu** na horta |
| Tijolo | montadora: 3 escórias |
| Vidro | fornalha: `fundir("vidro")` (2 quartzos) |
| Concreto | montadora: 2 escórias + 1 quartzo → 2 concretos |
| Aço | fornalha, pesquisa Metalurgia |

Mande os materiais por esteira pro **Depósito de Materiais**: tudo que entra vai pro estoque. Também dá pra comprar na loja (aba **Materiais**), só que mais caro. Você começa com 24 madeiras.

| Peça | Custo |
|---|---|
| Parede | 4 do material |
| Janela | 3 do material + 2 vidros |
| Porta | 3 do material |
| Piso / Teto | 2 do material |
| Cerca | 1 madeira |

**Escritório:** a área do escritório não aceita máquinas, mas aceita **móveis** (loja → aba **Escritório**: estante, poltrona, sofá, TV, tapete, luminária, mesa, frigobar, ursinho, ventilador de teto…) e **construção**. Vários móveis dão um bônus pequeno de CPU ou de velocidade, como a decoração.

**Pintura:** no modo 🖌️ Pintar, `T` escolhe a cor e o clique pinta ($ 2). "Sem tinta" volta ao material original. Vidro não pega tinta.

**Quadros:** loja → aba **Quadros** (obras de domínio público: Van Gogh, Hokusai, Monet, Vermeer, Almeida Júnior). Escolha na barra e clique numa **parede** (sem janela). Ele fica do lado da parede em que você está. `X` tira.

---

## 16. 🤖 O Oopi

O Oopi te segue e para a uns 2 metros, **do lado em que ele já está**: girar a câmera não faz ele rodar em volta de você.

- **`E`** nele: carinho 💜. O **humor** sobe com carinho e com tarefas, e cai devagar com o tempo.
- **`F`** olhando pra ele: abre a janela de **tarefas**:
  - **🧺 Colher a horta**: vai em todos os canteiros prontos e colhe.
  - **☄️ Buscar meteoritos**: pega as pedrinhas brilhantes da chuva de meteoros.
  - **📦 Levar itens**: escolha de onde (baú, caixa de venda, canteiro ou saída de máquina), qual item, pra onde e quantos.
  - **🐾 Me seguir / 🧍 Ficar aqui.**
- Quando a fábrica bate um **recorde** ($/min, itens/min ou maior venda), ele comemora 🏆.

---

## 17. ☄️ Eventos tranquilos

- **Chuva de meteoros** (à noite): alguns caem perto da fábrica e deixam um **veio de meteorito** (40 fragmentos estelares, valem bem). Coloque um **minerador** em cima! E pegue as **pedrinhas** em volta com `E` (ou peça pro Oopi).
- **Dia de feira** (de dia): 3 itens ficam **+60% mais caros** por 4 minutos. O painel do mercado mostra 🎪.
- **Aurora** (à noite) e **arco-íris** (depois da chuva): só pra olhar 🌌🌈.

---

## 18. ⚙️ Hardware do computador

No editor, aba **⚙ Hardware**:

- **Overclock:** ×1,5, ×2 e ×3 nas instruções por segundo **deste** computador (o Clock da CPU da loja vale pra todos). Gasta mais energia.
- **Memória:** quantas **variáveis** (24 → 48 → 96 → ∞) e quantos **itens por lista** (256 → 1024 → 4096 → ∞) o programa pode ter. Funções (`def`) não contam.

Se passar do limite, o programa para com um aviso. Dica: `lista.pop(0)` tira o item mais velho.

---

## 19. 🧰 Ferramentas

- **Copiar e colar** (`C` / `V`): clique em dois cantos pra copiar uma área (máquinas, código e cabos). Aparece um fantasma: `R` gira, clique cola. Peças que faltarem são compradas.
- **Desfazer** (`Ctrl+Z`): colocar, guardar, cabos, colar e girar.
- **Mapa** (`Tab`): visto de cima, com zoom (roda do mouse) e arrastar.
- **Estatísticas** (`K`): gráficos de ganhos, produção e energia, **placar** dos computadores (🥉🥈🥇) e **conquistas**.
- **Modo foto** (`P`): câmera voando livre, `F` tira foto (salva PNG), `T` congela o tempo, `N` avança o horário.
- **Depurador** (no editor): clique no número da linha pra marcar um breakpoint, use **⏭ Passo** e veja as variáveis na aba **Depurar**.
- **Autocompletar** (no editor): sugere funções, métodos, máquinas e itens. Desliga no rodapé do editor ou nas configurações.
- **Bibliotecas** (no editor): funções que você escreve uma vez e usa com `importar("nome")`.
- **Rádio**: `G` troca de estação (**Bossa FM**, Lo-fi, Jazz, Só Natureza). O rádio do escritório também.
- **Oopi**: o pet robozinho. Mire nele e aperte `E` pra fazer carinho 💜, ou `F` pras tarefas.
- **3 fábricas**: no menu, cada fábrica é um save separado. **Abrir** troca de fábrica, **Apagar** apaga só aquela.
- **Configurações**: **teclas** (clique e aperte a nova), **modo daltônico** (deuteranopia, protanopia, tritanopia: muda as luzes das máquinas e as cores de aviso), **fonte do editor** e sensibilidade do **controle**.
- **Controle (gamepad)**: alavanca esquerda anda, direita olha, `A` pula, `B` desliza/cancela, `X` usa, `Y` loja, `LB`/`RB` trocam a peça, `LT` guarda, `RT` coloca, `L3` corre, `R3` gira, ↑/↓ peça e material da construção, ← rádio, → guia, `Select` mapa, `Start` pausa.

---

## 20. 📋 Contratos e 🎟️ fichas (nível 2)

No escritório tem o **📋 Quadro de Contratos** (`E` nele, ou `L` de qualquer lugar). Clientes da cidade pedem itens da sua fábrica.

1. Escolha um pedido e clique em **Aceitar** (começa com 2 vagas; dá pra comprar mais com fichas).
2. Compre uma **Doca de Entrega** (loja, nível 2, $ 150) e mande os itens **por esteira** até ela (qualquer lado). Ela só aceita o que os contratos pedem.
3. Quando chegar tudo, uma navezinha leva a encomenda e você ganha **dinheiro, XP e 🎟️ fichas**.

| Raridade | Fichas | Extra |
|---|---|---|
| Comum | 1 | |
| Raro | 2 | pedidos maiores, prêmio maior |
| 🌟 Lendário | 4 | + 1 💾 disco de dados (a partir do nível 5) |

- Entregou na **primeira metade do prazo**? **+25%** ⚡.
- **Perder o prazo não tira nada**: o pedido só some e outro cliente aparece.
- No código: `contratos()` lista os aceitos, `maquina("doca_entrega1").faltando()` diz o que falta.

**Loja de fichas** (loja → aba **🎟️ Fichas**): chapéus pro Oopi (florzinha, cone, cogumelo, engrenagem, antena, coroa de cristal), cores pro Oopi, decoração exclusiva (astronauta, alienzinho, rover, nave estelar, todas com bônus) e **mais vagas de contrato**.

## 21. 🧩 Desafios de programação

Na mesa do escritório (lado direito) fica o **🧩 Terminal de Desafios**: 10 quebra-cabeças em Jiboia, separados da fábrica.

```python
# pegar() tira o próximo item da entrada; entregar(x) responde
while True:
    entregar(pegar())     # quando a entrada acaba, pegar() termina o programa
```

`tem_mais()` diz se ainda tem entrada. Cada solução é testada em 3 entradas e ganha **3 notas**, cada uma com 🥉 (resolveu), 🥈 ou 🥇:

| Nota | O que mede |
|---|---|
| ⚙️ Instruções | quantas instruções o programa executou (média das 3 entradas) |
| 📏 Linhas | linhas de código (sem comentários e linhas vazias) |
| 🧠 Memória | quantas variáveis ele guardou ao mesmo tempo |

Resolver dá dinheiro, fichas (cada 🥇 nova dá +1) e libera uma **função nova pros computadores da fábrica**:

| Desafio | Libera |
|---|---|
| 1 · Primeira entrega | `anunciar(texto)`: aviso na tela |
| 2 · Separador esperto | `contar(lista, x)` |
| 3 · Contador de quartzo | `media(lista)` |
| 4 · Só os pares | `unicos(lista)` |
| 5 · Pares de lingotes | `mais_caro(lista)`: o item mais caro agora |
| 6 · Maior de cada lote | `maior_chave(dicionario)` |
| 7 · Montadora de cabeça | `faltando()`: o que os contratos ainda pedem |
| 8 · Compressão de esteira | `relatorio()` |
| 9 · Fila de pedidos | `inverter(lista)` |
| 10 · Espiral de Fibonacci | `chance(p)` |

## 22. 💾 Discos de dados e receitas alternativas

Discos vêm de:
- **📦 Caixas perdidas**: 8 espalhadas pela floresta em volta da fábrica, com uma luzinha azul. Chegue perto e aperte `E`. O Oopi às vezes dá dica de onde estão.
- **Chuva de meteoros**: às vezes uma pedrinha vem com um disco grudado.
- **Correio da manhã** (dia 5 da sequência) e **contratos lendários**.

No **Laboratório** (`E`), lá embaixo: **🔍 Analisar um disco** mostra 2 receitas alternativas; escolha uma. Exemplos:

| Receita | Onde | Faz |
|---|---|---|
| `"engrenagem_fundida"` | montadora | 1 aço → 2 engrenagens |
| `"fio_de_ferro"` | montadora | 2 lingotes de ferro → 3 fios |
| `"motor_compacto"` | montadora | 1 engrenagem + 1 chip → 1 motor |
| `"silicio_puro"` | fornalha | 1 quartzo + 1 carvão → 2 silícios |
| `"aco_direto"` | fornalha | 2 minérios de ferro + 1 carvão → 1 aço |

(são 11 no total; a aba **Receitas** da loja mostra as que você já liberou)

## 23. 🛰️ Programa Espacial e ♾️ pesquisas infinitas

Depois do primeiro lançamento, a plataforma vira o **Programa Espacial** (+2 ⭐ de presente):

1. `E` na plataforma e escolha um **satélite**.
2. Leve os itens da missão por esteira (módulos de foguete, satélites e itens de ponta). Cada missão pede um pouco mais que a anterior.
3. **🚀 Lançar missão**: o satélite fica em órbita (dá pra ver os pontinhos no céu à noite) e você ganha dinheiro e **⭐ estrelas**.

| Satélite | Bônus (cada um, até 5) |
|---|---|
| 📡 Comunicação | +8% de clock nos computadores |
| 💹 Financeiro | +5% no preço de venda |
| 🧭 GPS | +6% nas esteiras e drones |
| 🌦️ Meteorológico | +12% de crescimento na horta e mais chuva |
| 🔭 Telescópio | mais chuvas de meteoros e veios maiores |
| 🛰️ Estação Solar | +20% nos painéis solares, e eles geram um pouco à noite |

**♾️ Pesquisas infinitas** (Laboratório, depois do lançamento): Mineração Profunda, Metalurgia Fina, Compilador Otimizado, Marketing, Esteiras Turbo e Adubo Estelar. Cada nível custa mais itens e algumas ⭐ (as estrelas voltam se você trocar de pesquisa).

**Itens de ponta**: **Bateria** e **Painel de LED** (pesquisa *Eletrônica Avançada*, fase 4 do foguete) e **Computador Quântico** (pesquisa *Computação Quântica*, depois do lançamento: 2 processadores + 2 fragmentos estelares + 1 bateria).

## 24. 📬 Correio, 🔥 combo, 📐 projetos, 📖 álbum e 💞 amizade

- **Correio da manhã**: a primeira vez que você entra no dia (dia de verdade) chega um pacote. Dias seguidos rendem mais: dia 3 = 1 🎟️, dia 5 = 💾, dia 7 = 3 🎟️ + dinheiro. Tem até o jornalzinho da fábrica 📰.
- **Combo de vendas**: vendas com menos de 10 segundos entre elas somam combo. Cada passo dá +2% (até +20%) e o som fica mais agudo 🔥.
- **Projetos** (`J`): copie um grupo com `C`, dê um nome e salve. Serve pra qualquer fábrica. O botão **🔗 Código** gera um texto `AUTOMATON1:…` pra mandar pra um amigo, que cola em **📥 Importar** (o programa dos computadores importados não roda sozinho).
- **Álbum** (`K` → Álbum): todo item que você fabrica, colhe ou vende aparece lá.
- **Amizade com o Oopi**: carinho (+1, no máximo a cada 20 s) e tarefas (+3). Nível 2 ganha a florzinha, nível 3 ele pega as pedrinhas de meteoro sozinho, nível 4 ganha a coroa de cristal, nível 5 dá +1 ficha nos contratos raros e lendários.

## 25. 🤝 Jogar com amigos (tecla `N`)

Tudo funciona trocando **códigos de texto** (pelo WhatsApp, Discord…), sem servidor. Ponha **seu nome** no topo da janela.

- **📅 Desafio da semana**: toda segunda-feira chega um quebra-cabeça novo, **igual pra todo mundo**, no 🧩 Terminal de Desafios (primeiro item da lista). Resolva, copie o **seu código** e mande pros amigos; cole o código deles em **Adicionar**. O jogo roda a solução de cada amigo pra conferir a nota (não dá pra trapacear editando o código). O melhor de cada nota ganha 👑. Depois de resolver, dá pra **ver o código** dos amigos e aprender com eles.
- **👀 Visitar fábrica**: **💾 Baixar arquivo** gera um `.automaton` com a sua fábrica inteira. O amigo abre em **📂 Abrir arquivo** e passeia por ela. Na visita **nada é salvo** (a fábrica dele fica guardada, esperando), os computadores começam desligados, e dá pra copiar grupos com `C` e salvar em 📐 Projetos pra usar em casa. Pra voltar: botão **⌂ Voltar pra minha fábrica** no topo da tela.
- **🤝 Parceria**: quem cria manda o código; o outro cola. Os dois recebem o mesmo contrato grande no Quadro de Contratos (sem prazo e sem ocupar vaga) e cada um cumpre **na sua fábrica**. Quando terminar, clique em **📄 Comprovante** e mande pro amigo. Com os dois comprovantes trocados, cada um ganha **+5 🎟️ e 1 💾**, além do prêmio.

## 26. 🦾 Braço Robótico e 🤖 Oopi programável

**Braço Robótico** (nível 3, $ 150, 2 ⚡): pega do que está **atrás** (seta azul: esteira, baú, caixa de venda, saída de máquina, canteiro) e solta **na frente** (seta laranja).

```python
b = maquina("braco1")
while True:
    b.mover("motor")      # pega um motor atrás e solta na frente
```

Também tem `.pegar("item")`, `.soltar()`, `.segurando()`, `.atras()`, `.frente()` e `.movidos()`.

**Oopi programável** (precisa de **amizade nível 2**: faça carinho e peça tarefas):

```python
o = maquina("oopi")
while True:
    o.ir_para("bau1")
    o.pegar("chip")          # pega da máquina mais perto dele
    o.ir_para("doca_entrega1")
    o.soltar()
    o.dizer("entreguei! 📦")
```

Outros: `.ir(x, z)`, `.voltar()`, `.colher()`, `.pular()`, `.seguir()`, `.ficar()`, `.carga()`, `.humor()`, `.amizade()`.

## 27. Problemas comuns

| Problema | Solução |
|---|---|
| O item para no fim da esteira | A próxima peça não aceita por esse lado (é a seta laranja dela) ou está cheia. |
| A esteira fez uma curva estranha | Ela vira curva sozinha quando o item chega pelo lado. Gire com `R`, ou tire com `X` e coloque de novo. |
| Tela do computador "SEM ENERGIA" | Ligue um cabo nele. |
| Erro "Não achei a máquina" | O nome no código tem que ser igual à plaquinha em cima da máquina. |
| Tudo lento | Energia fraca (HUD ⚡ vermelho): coloque mais geradores. Ou compre "Clock da CPU" na loja. |
| O jogo está travando (FPS baixo) | Ligue **Configurações → Mostrar FPS**: ele mostra o FPS e **qual placa de vídeo o navegador está usando**. Se aparecer “sem placa de vídeo”, ligue a aceleração: no Chrome/Edge, `chrome://settings/system` → **Usar aceleração de gráficos quando disponível** → Reiniciar (no Firefox: `about:preferences` → Desempenho). Se aparecer uma placa Intel/AMD integrada num PC com NVIDIA/AMD dedicada: Windows → **Configurações → Sistema → Tela → Gráficos** → escolha o navegador → **Alto desempenho**. O jogo também avisa sozinho quando detecta isso. |
| Programa parado na linha amarela | Ele está **esperando** a máquina. Veja o status dela (mire e leia, ou `E` → detalhes). |
| "Memória cheia" / "Lista cheia" | Reaproveite variáveis, tire itens velhos com `.pop(0)`, ou melhore a memória no ⚙ Hardware. |
| A planta não cresce | Terra seca (💧), teto que não é de vidro em cima, ou é de noite. |
| "Falta material" na construção | Mande material pro Depósito de Materiais ou compre na loja (aba Materiais). |
| Não consigo colocar máquina no escritório | Lá só vão móveis e construção. |
| A Doca de Entrega não aceita o item | Nenhum contrato aceito pede esse item (ou já chegou tudo dele). Veja o 📋 quadro. |
| "função liberada resolvendo o desafio…" | Resolva o desafio indicado no 🧩 Terminal de Desafios. |
| "O Oopi só obedece programas de quem é amigo dele" | Faça carinho (`E`) e peça tarefas (`F`) até a amizade nível 2. |
| O código do amigo "é de outra semana" | Os desafios da semana mudam toda segunda; peça o código da semana atual. |
| Não acho as caixas perdidas | Elas brilham em azul na floresta, fora do piso. Olhe o mapa com calma e escute as dicas do Oopi. |

---

## Atalhos

### Movimento e café

Segure **Shift + WASD** para correr: a velocidade aumenta enquanto você mantém o movimento. A barra de **embalo** mostra esse ganho. Parar, inverter a direção ou bater numa máquina reduz o embalo.

Durante a corrida, pressione e segure **Ctrl** para deslizar. A câmera abaixa e você ganha um impulso curto. Solte Ctrl para levantar ou aperte **Espaço** para pular conservando a velocidade. O deslize dura até 1,1 segundo e tem um intervalo de 1,5 segundo entre impulsos; solte e aperte Ctrl de novo para repetir.

Aperte **E na cafeteira do escritório** pra tomar um cafezinho: **+30% de velocidade por 90 segundos**. O HUD mostra o tempo restante.

| Tecla | Ação |
|---|---|
| `WASD` · `Shift` · `Espaço` | andar · correr e ganhar embalo · pular |
| `Ctrl` durante a corrida | deslizar |
| `Q` | guardar a peça da mão |
| `1` | 🔌 Cabo de energia |
| `2` | 🧱 Construção |
| `F` / `T` | construção: peça / material ou cor · `F` no Oopi: tarefas |
| `3`–`9` / roda do mouse | escolher peça |
| `R` | girar a peça |
| `Clique` | colocar / ligar cabo / usar |
| `X` / botão direito | guardar a peça (ou soltar o cabo) |
| `E` | programar computador / ver máquina / loja / rádio / café / carinho no Oopi / pegar meteorito |
| `C` / `V` | copiar área / colar |
| `Ctrl+Z` | desfazer |
| `B` | loja |
| `Tab` | mapa |
| `L` | 📋 contratos |
| `N` | 🤝 amigos |
| `J` | 📐 projetos |
| `K` | estatísticas, placar e conquistas |
| `P` | modo foto |
| `G` | trocar estação do rádio |
| `H` | este guia |
| `Esc` | pausa |
