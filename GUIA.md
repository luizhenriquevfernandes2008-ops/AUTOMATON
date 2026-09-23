# 📖 Guia do AUTOMATON

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

## 8. Problemas comuns

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
| `B` | loja |
| `H` | este guia |
| `Esc` | pausa |
