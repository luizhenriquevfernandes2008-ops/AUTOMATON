// Manual da Jiboia que aparece dentro do editor.
import { ITEMS, RECIPES, SMELT, ORES, recipeOut } from './data.js';

const code = (s) => `<pre class="doc-code">${s.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre>`;

export function manualHTML(level) {
  const itemRows = Object.entries(ITEMS).map(([k, v]) => `<tr><td><code>"${k}"</code></td><td>${v.nome}</td><td>$ ${v.base}</td></tr>`).join('');
  const smeltRows = Object.entries(SMELT).map(([k, v]) => `<tr class="${v.nivel > level ? 'locked' : ''}"><td><code>"${k}"</code>${v.alt ? ' 💾' : ''}</td><td>${Object.entries(v.in).map(([i, n]) => `${n}× ${ITEMS[i].nome}`).join(' + ')} → ${v.qtd || 1}× ${ITEMS[v.out].nome}</td><td>${v.tempo}s</td><td>nív. ${v.nivel}</td></tr>`).join('');
  const recRows = Object.entries(RECIPES).map(([k, r]) => `<tr class="${r.nivel > level ? 'locked' : ''}"><td><code>"${k}"</code>${r.alt ? ' 💾' : ''}</td><td>${Object.entries(r.in).map(([i, n]) => `${n}× ${ITEMS[i].nome}`).join(' + ')}</td><td>→ ${r.qtd}× ${ITEMS[recipeOut(k, r)].nome}</td><td>${r.tempo}s</td><td>nív. ${r.nivel}</td></tr>`).join('');
  const oreRows = Object.entries(ORES).map(([k, o]) => `<tr><td>${o.nome}</td><td><code>"${o.item}"</code></td><td>${o.tempo}s</td><td>${o.nivel ? 'nív. ' + o.nivel : '—'}</td></tr>`).join('');
  return `
<div class="doc">
<h2>🐍 Jiboia — manual rápido</h2>
<p>A Jiboia é parecida com Python. O computador executa <b>uma instrução por vez</b>, no ritmo do <b>clock da CPU</b> (comece com 2 instruções por segundo; compre melhorias na loja). Veja a setinha ▶ andando no código!</p>

<h3>O básico</h3>
${code(`# isto é um comentário
x = 10
nome = "AUTOMATON"
print("Olá", nome, x * 2)
print(f"x vale {x} e o dobro é {x * 2}")`)}

<h3>Condições</h3>
${code(`if x > 5 and x < 100:
    print("médio")
elif x >= 100:
    print("grande")
else:
    print("pequeno")`)}

<h3>Laços</h3>
${code(`while True:        # repete pra sempre
    print("oi")
    esperar(1)

for i in range(5):  # 0, 1, 2, 3, 4
    print(i)

for item in ["a", "b"]:
    if item == "b":
        break          # sai do laço`)}

<h3>Funções</h3>
${code(`def dobro(n):
    return n * 2

print(dobro(21))`)}

<h3>Listas e dicionários</h3>
${code(`lista = [1, 2, 3]
lista.append(4)
print(len(lista), lista[0], lista[-1])

precos = {"ferro": 2, "cobre": 3}
precos["quartzo"] = 5
for k, v in precos.items():
    print(k, v)`)}

<h3>Também em português!</h3>
<p>Você pode usar: <code>se</code> (if), <code>senaose</code> (elif), <code>senao</code> (else), <code>enquanto</code> (while), <code>para</code>/<code>em</code> (for/in), <code>funcao</code> (def), <code>retorne</code>, <code>pare</code>, <code>continuar</code>, <code>passe</code>, <code>Verdadeiro</code>, <code>Falso</code>, <code>Nada</code>, <code>nao</code>, e <code>escrever()</code> no lugar de <code>print()</code>.</p>
${code(`enquanto Verdadeiro:
    se dinheiro() > 100:
        escrever("tô rico!")
    esperar(5)`)}

<h3>Funções do jogo</h3>
<table>
<tr><td><code>maquina("nome")</code></td><td>Pega uma máquina pelo nome (o nome aparece em cima dela)</td></tr>
<tr><td><code>maquinas()</code></td><td>Lista com o nome de todas as máquinas. <code>maquinas("minerador")</code> filtra por tipo</td></tr>
<tr><td><code>esperar(s)</code></td><td>Espera <i>s</i> segundos</td></tr>
<tr><td><code>preco("item")</code></td><td>Preço atual de um item no mercado</td></tr>
<tr><td><code>dinheiro()</code>, <code>nivel()</code>, <code>tempo()</code></td><td>Seu dinheiro, seu nível, segundos de jogo</td></tr>
<tr><td><code>itens()</code></td><td>Lista com o nome de todos os itens</td></tr>
<tr><td><code>apitar()</code></td><td>Faz o computador apitar 🔔</td></tr>
<tr><td><code>energia()</code></td><td>Energia da rede deste computador: <code>{"gerado": 20, "usado": 10, "nivel": 1}</code></td></tr>
<tr><td><code>len, range, str, int, float, abs, min, max, round, sum, sorted, aleatorio(a, b)</code></td><td>Funções comuns do Python</td></tr>
</table>

<h3>Rede entre computadores 🛰️ <small>(pesquisa "Rede")</small></h3>
<table>
<tr><td><code>enviar("pc2", valor)</code></td><td>Manda uma mensagem (texto, número, lista, dicionário). Use <code>"todos"</code> pra todos</td></tr>
<tr><td><code>receber()</code> ⏳ / <code>receber(5)</code></td><td>Espera uma mensagem: <code>{"de": "pc1", "msg": ...}</code>. Com número, desiste depois de N segundos (retorna None)</td></tr>
<tr><td><code>tem_mensagem()</code></td><td>True se tem mensagem esperando</td></tr>
<tr><td><code>compartilhar("chave", valor)</code> / <code>ler("chave")</code></td><td>Uma memória compartilhada por todos os computadores</td></tr>
</table>

<h3>Sensores e eventos 📡 <small>(pesquisa "Sensores")</small></h3>
<table>
<tr><td><code>ouvir("sensor1")</code></td><td>Recebe um evento pra cada item que passa na Esteira com Sensor</td></tr>
<tr><td><code>ouvir("vendas")</code>, <code>ouvir("rede")</code>, <code>ouvir("tempo", 10)</code></td><td>Eventos de vendas, de mensagens e de relógio (a cada N segundos)</td></tr>
<tr><td><code>esperar_evento()</code> ⏳</td><td>Espera o próximo evento: <code>{"tipo": "item", "fonte": "sensor1", "item": "..."}</code></td></tr>
<tr><td><code>esperar_ate(funcao)</code> ⏳</td><td>Fica chamando a função até ela retornar True. Ex: <code>esperar_ate(caixa_cheia)</code></td></tr>
</table>

<h3>Contratos 📋 <small>(nível 2)</small></h3>
<table>
<tr><td><code>contratos()</code></td><td>Lista dos contratos aceitos: <code>{"cliente", "raridade", "premio", "faltando": {...}, "segundos"}</code></td></tr>
<tr><td><code>fichas()</code>, <code>estrelas()</code></td><td>Suas 🎟️ fichas e ⭐ estrelas</td></tr>
<tr><td><code>doca.faltando()</code>, <code>doca.aceita("item")</code></td><td>Na Doca de Entrega: o que falta entregar e se ela aceita um item agora</td></tr>
</table>

<h3>Funções dos desafios 🧩 <small>(cada uma libera ao resolver um desafio)</small></h3>
<table>
<tr><td><code>anunciar(texto)</code></td><td>Mostra um aviso na tela</td></tr>
<tr><td><code>contar(lista, x)</code></td><td>Quantas vezes <i>x</i> aparece</td></tr>
<tr><td><code>media(lista)</code></td><td>Média dos números</td></tr>
<tr><td><code>unicos(lista)</code></td><td>A lista sem repetidos</td></tr>
<tr><td><code>mais_caro(lista)</code></td><td>O item com o maior preço agora: <code>mais_caro(["chip", "motor"])</code></td></tr>
<tr><td><code>maior_chave(dic)</code></td><td>A chave com o maior valor (ótimo com <code>.estoque()</code>)</td></tr>
<tr><td><code>faltando()</code></td><td>Tudo que os contratos aceitos ainda pedem</td></tr>
<tr><td><code>relatorio()</code></td><td><code>{"dinheiro", "nivel", "fichas", "estrelas", "contratos", "por_minuto"}</code></td></tr>
<tr><td><code>inverter(lista)</code>, <code>chance(p)</code></td><td>Lista de trás pra frente · True com probabilidade <i>p</i></td></tr>
</table>
${code(`# manda pra doca só o que os contratos pedem
sep = maquina("separador1")
while True:
    item = sep.esperar_item()
    if item in faltando():
        sep.enviar("esquerda")   # esteira até a doca de entrega
    else:
        sep.enviar("direita")    # caixa de venda`)}

<h3>Braço Robótico 🦾 <small>(nível 3)</small></h3>
<p>Pega do que está <b>atrás</b> dele (seta azul: esteira, baú, caixa de venda, saída de máquina, canteiro) e solta <b>na frente</b> (seta laranja).</p>
<table>
<tr><td><code>b.mover()</code> / <code>b.mover("chip")</code></td><td>Pega atrás e solta na frente (espera ter item e espaço)</td></tr>
<tr><td><code>b.pegar("item")</code>, <code>b.soltar()</code></td><td>As duas metades separadas</td></tr>
<tr><td><code>b.segurando()</code>, <code>b.atras()</code>, <code>b.frente()</code>, <code>b.movidos()</code></td><td>O que segura, o que tem atrás e na frente, quantos já moveu</td></tr>
</table>
${code(`b = maquina("braco1")      # baú atrás, esteira na frente
while True:
    b.mover("motor")          # tira só os motores do baú`)}

<h3>Oopi programável 🤖 <small>(amizade nível 2)</small></h3>
<table>
<tr><td><code>o = maquina("oopi")</code></td><td>O Oopi obedece programas de quem é amigo dele</td></tr>
<tr><td><code>o.ir_para("bau1")</code>, <code>o.ir(x, z)</code>, <code>o.voltar()</code></td><td>Anda até uma máquina, uma célula ou até você (espera chegar)</td></tr>
<tr><td><code>o.pegar("item")</code>, <code>o.soltar()</code>, <code>o.colher()</code></td><td>Pega/entrega na máquina mais perto dele, colhe o canteiro mais perto</td></tr>
<tr><td><code>o.dizer("oi!")</code>, <code>o.pular()</code></td><td>Balãozinho de fala e comemoração 🎉</td></tr>
<tr><td><code>o.seguir()</code>, <code>o.ficar()</code>, <code>o.carga()</code>, <code>o.humor()</code>, <code>o.amizade()</code></td><td>Modo, o que carrega, humor (0 a 100) e amizade (1 a 5)</td></tr>
</table>
${code(`o = maquina("oopi")
while True:
    o.ir_para("bau1")
    o.pegar("chip")
    o.ir_para("doca_entrega1")
    o.soltar()
    o.dizer("entreguei! 📦")`)}

<h3>Bibliotecas 📚</h3>
<p>Na aba <b>Bibliotecas</b> você escreve funções uma vez. Em qualquer computador: <code>importar("util")</code> e as funções ficam disponíveis.</p>

<h3>Depurador 🔍</h3>
<p>Clique no <b>número da linha</b> pra marcar um breakpoint (bolinha vermelha). O programa pausa antes dela. Use <b>⏭ Passo</b> (<kbd>F10</kbd>) pra rodar uma instrução e veja as variáveis na aba <b>Depurar</b>.</p>

<h3>Métodos das máquinas</h3>
<p>Métodos marcados com ⏳ <b>esperam</b>: o programa fica parado até a máquina terminar (a setinha fica amarela).</p>
<table>
<tr><th colspan="2">Todas as máquinas</th></tr>
<tr><td><code>.nome</code>, <code>.tipo</code></td><td>Nome e tipo</td></tr>
<tr><td><code>.quantidade()</code> / <code>.quantidade("item")</code></td><td>Quantos itens tem dentro</td></tr>
<tr><td><code>.estoque()</code></td><td>Dicionário {item: quantidade}</td></tr>
<tr><td><code>.saida()</code></td><td>Itens esperando pra sair pela frente</td></tr>
<tr><td><code>.ocupada()</code>, <code>.status()</code></td><td>Se está trabalhando / o que está fazendo</td></tr>
<tr><td><code>.energia()</code></td><td>1 = energia total, 0 = sem energia (precisa de cabo 🔌)</td></tr>
<tr><th colspan="2">Gerador</th></tr>
<tr><td><code>.producao()</code>, <code>.consumo()</code></td><td>Quanto ⚡ ele gera / quanto a rede dele está usando</td></tr>
<tr><th colspan="2">Minerador</th></tr>
<tr><td><code>.minerar()</code> ⏳</td><td>Tira 1 minério do veio. Sai pela frente (seta laranja) numa esteira</td></tr>
<tr><td><code>.minerio()</code></td><td>Qual minério tem embaixo</td></tr>
<tr><th colspan="2">Fornalha</th></tr>
<tr><td><code>.fundir()</code> ⏳ / <code>.fundir("minerio_ferro")</code></td><td>Derrete 1 minério em lingote (espera o minério chegar)</td></tr>
<tr><th colspan="2">Montadora</th></tr>
<tr><td><code>.fabricar("receita")</code> ⏳</td><td>Fabrica uma receita (espera os ingredientes)</td></tr>
<tr><td><code>.pode_fabricar("receita")</code></td><td>True se já tem tudo</td></tr>
<tr><td><code>.receitas()</code></td><td>Receitas liberadas</td></tr>
<tr><th colspan="2">Caixa de Venda</th></tr>
<tr><td><code>.vender()</code> ⏳ / <code>.vender("item")</code></td><td>Vende tudo (ou um tipo). Retorna quanto ganhou</td></tr>
<tr><td><code>.preco("item")</code></td><td>Preço atual</td></tr>
<tr><th colspan="2">Separador</th></tr>
<tr><td><code>.item()</code></td><td>Item que está nele (ou None)</td></tr>
<tr><td><code>.esperar_item()</code> ⏳</td><td>Espera chegar um item e retorna o nome</td></tr>
<tr><td><code>.enviar("esquerda")</code> ⏳</td><td>Manda o item pra "esquerda", "direita" ou "frente"</td></tr>
<tr><th colspan="2">Baú</th></tr>
<tr><td><code>.retirar()</code> ⏳ / <code>.retirar("item")</code></td><td>Solta 1 item pela frente</td></tr>
<tr><th colspan="2">Laboratório</th></tr>
<tr><td><code>.pesquisar("logistica")</code>, <code>.pesquisa()</code>, <code>.progresso()</code>, <code>.faltando()</code></td><td>Escolhe e acompanha a pesquisa</td></tr>
<tr><th colspan="2">Drone (da Doca de Drones)</th></tr>
<tr><td><code>.ir_para("bau1")</code> ⏳, <code>.ir(x, z)</code> ⏳, <code>.voltar()</code> ⏳</td><td>Voa até uma máquina, uma célula do mapa ou a doca</td></tr>
<tr><td><code>.pegar()</code> ⏳ / <code>.pegar("item")</code>, <code>.soltar()</code> ⏳</td><td>Pega 1 item da máquina/esteira embaixo e solta em outra</td></tr>
<tr><td><code>.carga()</code>, <code>.posicao()</code>, <code>.embaixo()</code>, <code>.ocupado()</code></td><td>O que carrega, onde está, o que tem embaixo</td></tr>
<tr><th colspan="2">Lâmpada · Tela · Alto-falante</th></tr>
<tr><td><code>.ligar()</code>, <code>.desligar()</code>, <code>.cor("verde")</code>, <code>.piscar(0.5)</code></td><td>Lâmpada colorida</td></tr>
<tr><td><code>.escrever("txt")</code>, <code>.mostrar("txt")</code>, <code>.limpar()</code>, <code>.titulo("x")</code>, <code>.grafico([1,4,2])</code></td><td>Tela</td></tr>
<tr><td><code>.tocar("do")</code> ⏳, <code>.tocar("sol#", 0.5)</code>, <code>.som("sino")</code></td><td>Alto-falante: notas do re mi fa sol la si (+ "#" e oitava, ex "do5")</td></tr>
<tr><th colspan="2">Esteira com Sensor</th></tr>
<tr><td><code>.contagem()</code>, <code>.ultimo()</code>, <code>.esperar_item()</code> ⏳, <code>.zerar()</code></td><td>Conta os itens que passam</td></tr>
<tr><th colspan="2">Gerador a Carvão</th></tr>
<tr><td><code>.ligar()</code>, <code>.desligar()</code>, <code>.combustivel()</code>, <code>.producao()</code></td><td>Desligue quando não precisar pra economizar carvão</td></tr>
<tr><th colspan="2">Lixeira</th></tr>
<tr><td><code>.destruidos()</code></td><td>Quantos itens já destruiu</td></tr>
<tr><th colspan="2">Canteiro (horta)</th></tr>
<tr><td><code>.plantar("cafe")</code> ⏳</td><td>Planta: "cafe", "milho", "cenoura", "abobora", "melancia" ou "bambu" (vira madeira)</td></tr>
<tr><td><code>.colher()</code> ⏳</td><td>Espera ficar pronta e colhe; sai pela seta laranja</td></tr>
<tr><td><code>.pronta()</code>, <code>.crescimento()</code>, <code>.umidade()</code>, <code>.planta()</code></td><td>Estado da planta e da terra (0 a 1)</td></tr>
<tr><td><code>.replantar(True)</code></td><td>Planta de novo sozinho depois de colher</td></tr>
<tr><th colspan="2">Irrigador</th></tr>
<tr><td><code>.regar()</code> ⏳, <code>.ligar()</code>, <code>.desligar()</code>, <code>.ligado()</code></td><td>Rega os canteiros num raio de 2 células</td></tr>
<tr><th colspan="2">Depósito de Materiais</th></tr>
<tr><td><code>.estoque()</code></td><td>Materiais de construção que você tem</td></tr>
</table>
<p><b>Memória:</b> cada computador guarda um número limitado de variáveis e de itens por lista (começa com 24 e 256). Melhore na aba <b>⚙ Hardware</b>. Funções não contam.</p>

<h3>Veios de minério</h3>
<table><tr><th>Veio</th><th>Item</th><th>Tempo</th><th>Libera</th></tr>${oreRows}</table>

<h3>Fornalha</h3>
<table><tr><th>Receita</th><th>Entra → sai</th><th>Tempo</th><th>Libera</th></tr>${smeltRows}</table>

<h3>Receitas da Montadora</h3>
<table><tr><th>Nome</th><th>Precisa</th><th>Faz</th><th>Tempo</th><th>Libera</th></tr>${recRows}</table>

<h3>Todos os itens</h3>
<table><tr><th>Nome no código</th><th>Item</th><th>Preço base</th></tr>${itemRows}</table>

<h3>Dicas</h3>
<ul>
<li>Cada linha custa tempo de CPU. Código enxuto = fábrica mais rápida!</li>
<li>Um computador faz uma coisa de cada vez. Pra várias máquinas trabalharem juntas, use vários computadores.</li>
<li>Os preços do mercado sobem e descem. Vender tudo de uma vez baixa um pouquinho o preço.</li>
<li>As esteiras levam os itens sozinhas, na direção das setinhas amarelas. As máquinas soltam os itens pela seta laranja e recebem pelas setas azuis.</li>
<li>Sem energia ⚡ nada funciona: ligue cabos 🔌 do gerador até as máquinas. Veja a aba <b>Guia</b>.</li>
<li>Se der erro, a linha fica vermelha e o console explica o que aconteceu.</li>
</ul>
</div>`;
}
