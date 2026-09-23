// Manual da Jiboia que aparece dentro do editor.
import { ITEMS, RECIPES, SMELT, ORES } from './data.js';

const code = (s) => `<pre class="doc-code">${s.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre>`;

export function manualHTML(level) {
  const itemRows = Object.entries(ITEMS).map(([k, v]) => `<tr><td><code>"${k}"</code></td><td>${v.nome}</td><td>$ ${v.base}</td></tr>`).join('');
  const smeltRows = Object.entries(SMELT).map(([k, v]) => `<tr class="${v.nivel > level ? 'locked' : ''}"><td>${ITEMS[k].nome}</td><td>→ ${ITEMS[v.out].nome}</td><td>${v.tempo}s</td><td>nív. ${v.nivel}</td></tr>`).join('');
  const recRows = Object.entries(RECIPES).map(([k, r]) => `<tr class="${r.nivel > level ? 'locked' : ''}"><td><code>"${k}"</code></td><td>${Object.entries(r.in).map(([i, n]) => `${n}× ${ITEMS[i].nome}`).join(' + ')}</td><td>→ ${r.qtd}× ${ITEMS[k].nome}</td><td>${r.tempo}s</td><td>nív. ${r.nivel}</td></tr>`).join('');
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
</table>

<h3>Veios de minério</h3>
<table><tr><th>Veio</th><th>Item</th><th>Tempo</th><th>Libera</th></tr>${oreRows}</table>

<h3>Fornalha</h3>
<table><tr><th>Entra</th><th>Sai</th><th>Tempo</th><th>Libera</th></tr>${smeltRows}</table>

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
