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

## 14. 🧰 Ferramentas

- **Copiar e colar** (`C` / `V`): clique em dois cantos pra copiar uma área (máquinas, código e cabos). Aparece um fantasma: `R` gira, clique cola. Peças que faltarem são compradas.
- **Desfazer** (`Ctrl+Z`): colocar, guardar, cabos, colar e girar.
- **Mapa** (`Tab`): visto de cima, com zoom (roda do mouse) e arrastar.
- **Estatísticas** (`K`): gráficos de ganhos, produção e energia, **placar** dos computadores (🥉🥈🥇) e **conquistas**.
- **Modo foto** (`P`): câmera voando livre, `F` tira foto (salva PNG), `T` congela o tempo, `N` avança o horário.
- **Depurador** (no editor): clique no número da linha pra marcar um breakpoint, use **⏭ Passo** e veja as variáveis na aba **Depurar**.
- **Autocompletar** (no editor): sugere funções, métodos, máquinas e itens. Desliga no rodapé do editor ou nas configurações.
- **Bibliotecas** (no editor): funções que você escreve uma vez e usa com `importar("nome")`.
- **Rádio**: `G` troca de estação (**Bossa FM**, Lo-fi, Jazz, Só Natureza). O rádio do escritório também.
- **Oopi**: o pet robozinho. Mire nele e aperte `E` pra fazer carinho 💜.

---

## 15. Problemas comuns

| Problema | Solução |
|---|---|
| O item para no fim da esteira | A próxima peça não aceita por esse lado (é a seta laranja dela) ou está cheia. |
| A esteira fez uma curva estranha | Ela vira curva sozinha quando o item chega pelo lado. Gire com `R`, ou tire com `X` e coloque de novo. |
| Tela do computador "SEM ENERGIA" | Ligue um cabo nele. |
| Erro "Não achei a máquina" | O nome no código tem que ser igual à plaquinha em cima da máquina. |
| Tudo lento | Energia fraca (HUD ⚡ vermelho): coloque mais geradores. Ou compre "Clock da CPU" na loja. |
| Programa parado na linha amarela | Ele está **esperando** a máquina. Veja o status dela (mire e leia, ou `E` → detalhes). |

---

## Atalhos

| Tecla | Ação |
|---|---|
| `1` | 🔌 Cabo de energia |
| `2`–`9` / roda do mouse | escolher peça |
| `R` | girar a peça |
| `Clique` | colocar / ligar cabo / usar |
| `X` / botão direito | guardar a peça (ou soltar o cabo) |
| `E` | programar computador / ver máquina / loja / rádio / café |
| `C` / `V` | copiar área / colar |
| `Ctrl+Z` | desfazer |
| `B` | loja |
| `Tab` | mapa |
| `K` | estatísticas, placar e conquistas |
| `P` | modo foto |
| `G` | trocar estação do rádio |
| `H` | este guia |
| `Esc` | pausa |
