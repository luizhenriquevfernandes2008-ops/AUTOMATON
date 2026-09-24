// Guia ilustrado (aparece com a tecla H e na aba "Guia" do editor).

// desenha um mini-mapa visto de cima. Cada célula: [emoji, rótulo, classe]
function grid(rows) {
  return `<div class="gd-grid" style="grid-template-columns: repeat(${rows[0].length}, 64px)">${rows.flat().map((c) => {
    if (!c) return '<div class="gd-cell empty"></div>';
    const [icon, label, cls] = c;
    return `<div class="gd-cell ${cls || ''}"><span class="gi">${icon}</span><span class="gl">${label || ''}</span></div>`;
  }).join('')}</div>`;
}
const code = (s) => `<pre class="doc-code">${s.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre>`;

const B = (dir) => [{ L: '➡️', O: '⬅️', N: '⬆️', S: '⬇️' }[dir], 'esteira', 'belt'];

export function guideHTML() {
  return `
<div class="doc guide">
<h2>📖 Guia do AUTOMATON</h2>
<h3>Movimento e cafezinho ☕</h3>
<p><kbd>WASD</kbd> anda, <kbd>Shift</kbd> corre e ganha embalo aos poucos. <kbd>Ctrl</kbd> durante a corrida desliza por até 1,1 s: solte para levantar ou use <kbd>Espaço</kbd> para saltar conservando o impulso. Solte e aperte Ctrl de novo para outro deslize (intervalo de 1,5 s). Parar, inverter a direção ou bater reduz o embalo.</p>
<p>Aperte <kbd>E</kbd> na <b>cafeteira do escritório</b> pra tomar um cafezinho: <b>+30% de velocidade por 90 segundos</b>. O HUD mostra a velocidade, o embalo e o tempo do café.</p>
<p>No AUTOMATON <b>nada funciona sozinho</b>. As máquinas só trabalham quando <b>um computador manda</b>, e tudo que usa <b>energia ⚡</b> precisa de um <b>cabo 🔌</b> ligado num <b>gerador</b>.</p>

<h3>1. Os sinais que aparecem no chão e nas máquinas</h3>
<table>
<tr><td class="sw"><span class="sw-arrow out">▲</span></td><td><b>Seta laranja</b> no chão = <b>SAÍDA</b>. É por onde a máquina solta o item pronto. Coloque uma esteira ali, apontando pra fora.</td></tr>
<tr><td class="sw"><span class="sw-arrow in">▲</span></td><td><b>Setas azuis</b> = <b>ENTRADA</b>. Por onde a máquina aceita itens. Nunca entra item pela seta laranja.</td></tr>
<tr><td class="sw">⌃⌃</td><td><b>Setinhas amarelas andando</b> em cima da esteira mostram pra onde o item vai.</td></tr>
<tr><td class="sw">⬆</td><td>Enquanto você segura uma peça, a <b>seta amarela grande</b> no chão mostra a direção dela. Aperte <kbd>R</kbd> pra girar <b>antes</b> de colocar.</td></tr>
<tr><td class="sw"><span class="dot g"></span></td><td>Luz <b>verde</b>: trabalhando.</td></tr>
<tr><td class="sw"><span class="dot y"></span></td><td>Luz <b>amarela</b>: esperando alguma coisa (item chegar, saída liberar…).</td></tr>
<tr><td class="sw"><span class="dot b"></span></td><td>Luz <b>azul</b>: tem item pronto esperando pra sair.</td></tr>
<tr><td class="sw"><span class="dot r"></span></td><td>Luz <b>vermelha piscando</b>: <b>SEM ENERGIA</b>. Ligue um cabo 🔌.</td></tr>
<tr><td class="sw"><span class="dot c"></span></td><td>Luz <b>cinza</b>: parada, nenhum programa mandou ela fazer nada.</td></tr>
</table>

<h3>2. Primeira fábrica: minerar e vender</h3>
${grid([
    [['💎', 'veio', 'ore'], null, null, null],
    [['⛏️', 'minerador<br>seta → leste', 'm'], B('L'), B('L'), ['💰', 'venda1', 'm']],
  ])}
<ol>
<li>Tecla do <b>Minerador</b>, mire num veio de ferro (cristais azuis), gire com <kbd>R</kbd> até a seta amarela apontar pra onde você quer mandar o minério e clique.</li>
<li>Coloque <b>Esteiras</b> começando na seta laranja do minerador, <b>todas apontando pro mesmo lado</b> (confira as setinhas).</li>
<li>No fim da esteira, a <b>Caixa de Venda</b> (ela aceita itens por qualquer lado).</li>
<li>Faça a energia (passo 3) e depois o programa (passo 4).</li>
</ol>

<h3>3. Energia ⚡: gerador, cabos e postes</h3>
${grid([
    [['🔋', 'gerador<br>+20 ⚡', 'gen'], ['〰️', 'cabo', 'wire'], ['🗼', 'poste', 'pole'], ['〰️', 'cabo', 'wire'], ['⛏️', 'minerador<br>−3 ⚡', 'm']],
    [null, null, ['〰️', 'cabo', 'wire'], null, null],
    [null, null, ['🖥️', 'pc1<br>−2 ⚡', 'm'], null, null],
  ])}
<ul>
<li>Coloque o <b>Gerador</b> (produz 20 ⚡).</li>
<li>Escolha o <b>🔌 Cabo</b> (sempre é a tecla <kbd>1</kbd>). Clique no <b>gerador</b> e depois na <b>máquina</b>: o fio aparece. Ele continua preso na última peça, então dá pra ir clicando em várias seguidas. <b>Botão direito</b> solta o cabo.</li>
<li>Cada máquina aceita <b>2 cabos</b>, então dá pra passar a energia de uma máquina pra outra vizinha. Geradores aceitam 4 (o grande, 6) e postes, 6.</li>
<li>O cabo tem no máximo <b>16 m</b>. Pra ir mais longe, use <b>Postes</b> no meio do caminho (gerador → poste → máquina).</li>
<li>Tudo ligado por cabos forma uma <b>rede</b>. Se a rede gasta mais do que gera, <b>tudo nela fica mais lento</b>. Compre mais geradores e ligue na mesma rede.</li>
<li>Olhe o HUD: <b>⚡ usado/gerado</b>. Mirando numa máquina, aparece se ela tem energia.</li>
</ul>
<table>
<tr><th>Gasta energia</th><th>⚡</th><th>Não precisa de energia</th></tr>
<tr><td>Computador</td><td>2</td><td rowspan="6">Esteiras, Baú, Postes, Decoração</td></tr>
<tr><td>Minerador</td><td>3</td></tr>
<tr><td>Fornalha</td><td>4</td></tr>
<tr><td>Montadora</td><td>6</td></tr>
<tr><td>Separador</td><td>1</td></tr>
<tr><td>Caixa de Venda</td><td>1</td></tr>
</table>

<h3>4. O computador</h3>
<p>Com o computador ligado na energia, aperte <kbd>E</kbd> nele, escreva o programa e aperte <b>▶ Executar</b>. Ele roda <b>uma linha de cada vez</b>; dá pra ver a setinha andando. Pode fechar o editor que ele continua rodando.</p>
${code(`mina = maquina("minerador1")   # o nome aparece em cima da máquina
caixa = maquina("venda1")

while True:
    mina.minerar()             # espera ~3 s e solta 1 minério na esteira
    if caixa.quantidade() >= 5:
        caixa.vender()`)}

<h3>5. 🔥 A Fornalha, passo a passo</h3>
<p>A fornalha transforma <b>minério</b> em <b>lingote</b> (que vale mais). Ela funciona assim:</p>
<ol>
<li><b>O minério chega pela esteira</b> e entra pelas <b>setas azuis</b> (trás ou lados). Ele fica <b>guardado dentro</b> da fornalha (cabem 20).</li>
<li><b>Ela NÃO derrete sozinha.</b> Um computador tem que chamar <code>forno.fundir()</code>. Cada chamada derrete <b>1 minério</b> (leva 2,5 s).</li>
<li>O <b>lingote sai pela seta laranja</b>. Precisa ter uma esteira ali levando embora. Senão a saída enche (10 itens) e ela para.</li>
<li>Ela precisa de <b>4 ⚡</b> de energia.</li>
</ol>
${grid([
    [['⛏️', 'minerador1<br>→', 'm'], B('L'), ['🔥', 'fornalha1<br>entra atrás,<br>sai na frente', 'f'], B('L'), B('L'), ['💰', 'venda1', 'm']],
    [null, null, ['〰️', 'cabo', 'wire'], null, null, null],
    [['🔋', 'gerador', 'gen'], ['〰️', 'cabo', 'wire'], ['🖥️', 'pc1', 'm'], null, null, null],
  ])}
<p>A fornalha fica <b>virada pro mesmo lado da esteira</b>: a esteira chega nas costas dela (seta azul) e continua na frente (seta laranja).</p>
${code(`mina = maquina("minerador1")
forno = maquina("fornalha1")
caixa = maquina("venda1")

while True:
    mina.minerar()                 # 1) tira minério -> vai pela esteira até a fornalha
    if forno.quantidade() > 0:     # 2) tem minério guardado lá dentro?
        forno.fundir()             # 3) derrete 1 -> o lingote sai pela seta laranja
    if caixa.quantidade() >= 3:
        caixa.vender()             # 4) vende os lingotes`)}
<p><b>Dica:</b> <code>forno.fundir()</code> sem nada dentro <b>espera</b> o minério chegar (luz amarela, "Esperando minério"). Por isso, num computador só, é melhor perguntar <code>forno.quantidade() &gt; 0</code> antes. Com dois computadores, um pode só minerar e o outro só fundir:</p>
${code(`# pc2: só cuida da fornalha
forno = maquina("fornalha1")
while True:
    forno.fundir()   # espera o minério e derrete, pra sempre`)}
<table>
<tr><th>Fornalha mostra…</th><th>O que fazer</th></tr>
<tr><td>Esperando minério</td><td>O minério não está chegando. A esteira aponta pra fornalha? Está chegando pelas costas/lados (setas azuis), e não pela frente?</td></tr>
<tr><td>Saída cheia</td><td>Falta esteira na seta laranja, ou a esteira está apontando de volta pra fornalha.</td></tr>
<tr><td>Sem energia ⚡</td><td>Ligue um cabo 🔌 dela até o gerador (ou um poste da rede).</td></tr>
<tr><td>Parada</td><td>Nenhum programa chamou <code>fundir()</code>.</td></tr>
</table>
<p>Ela também funde <b>cobre</b> (<code>"minerio_cobre"</code> → lingote de cobre) e, no nível 5, <b>quartzo</b> → silício. Pra escolher: <code>forno.fundir("minerio_cobre")</code>.</p>

<h3>6. 🛠️ A Montadora</h3>
<p>Igual à fornalha: os ingredientes entram pelas setas azuis e ficam guardados. <code>mont.fabricar("engrenagem")</code> gasta 2 lingotes de ferro e solta 1 engrenagem pela seta laranja. Use <code>mont.pode_fabricar("engrenagem")</code> pra saber se já tem tudo.</p>
${code(`mont = maquina("montadora1")
while True:
    mont.fabricar("engrenagem")   # espera os 2 lingotes chegarem`)}

<h3>7. 🔀 O Separador</h3>
<p>O item entra <b>só por trás</b> (seta azul) e o programa decide se ele sai pela <b>frente</b>, <b>esquerda</b> ou <b>direita</b> (setas laranjas).</p>
${code(`sep = maquina("separador1")
while True:
    item = sep.esperar_item()
    if item == "minerio_ferro":
        sep.enviar("esquerda")
    else:
        sep.enviar("direita")`)}

<h3>8. 🔬 Laboratório e pesquisas</h3>
<p>Compre um <b>Laboratório</b> (nível 2), ligue na energia e aperte <kbd>E</kbd> nele pra ver a <b>árvore de pesquisas</b>. Escolha uma e mande os itens pedidos por esteira: o laboratório aceita por qualquer lado. Quando completar, a tecnologia libera máquinas, receitas e funções novas da Jiboia.</p>
<p>Algumas pesquisas só aparecem depois de completar <b>fases do Projeto Foguete</b>.</p>

<h3>9. 🚀 Projeto Foguete (o objetivo grande)</h3>
<p>Ao norte da fábrica tem a <b>Plataforma de Lançamento</b>. Cada fase pede uma lista de itens (aparece no canto direito e no <kbd>E</kbd> da plataforma). Leve tudo por esteira até qualquer lado da plataforma. Cada fase dá dinheiro, XP, monta um pedaço do foguete e libera pesquisas novas. Na fase 5, aperte <b>🚀 Lançar</b>!</p>

<h3>10. 🗺️ Regiões novas</h3>
<p>Nas bordas da floresta tem <b>placas 🔒</b>. Aperte <kbd>E</kbd> numa delas pra comprar a região: as árvores somem e aparecem veios novos (inclusive carvão). Veja tudo no mapa (<kbd>Tab</kbd>).</p>

<h3>11. 🔀 Logística: divisor, juntador e 2º andar</h3>
<ul>
<li><b>Divisor</b>: entra por trás, sai um item pra esquerda, um pra frente, um pra direita. Sem código.</li>
<li><b>Juntador</b>: junta até 3 esteiras numa só, revezando, sem engarrafar.</li>
<li><b>Rampa (sobe)</b> → <b>Esteira Elevada</b> → <b>Rampa (desce)</b>: passa por cima de outras esteiras e máquinas baixas. Seu boneco passa por baixo.</li>
<li><b>Esteira com Sensor</b>: conta os itens e avisa o programa (<code>ouvir("sensor1")</code>).</li>
<li><b>Lixeira</b>: some com o que chegar (ótima pra sobras).</li>
</ul>

<h3>12. 🔥 Carvão, sol e escória</h3>
<ul>
<li><b>Gerador a Carvão</b>: 75 ⚡, mas queima 1 carvão a cada 8 s. Leve carvão por esteira nas setas azuis. <code>.desligar()</code> economiza.</li>
<li><b>Painel Solar</b>: até 35 ⚡ de graça, só de dia (e menos na chuva).</li>
<li>A fornalha solta <b>escória</b> junto com os lingotes. Separe com um separador e mande pra <b>Lixeira</b>, ou faça <b>tijolos</b> na montadora (3 escórias = 1 tijolo, usado no foguete).</li>
<li><b>Aço</b> = lingote de ferro + carvão na fornalha: <code>forno.fundir("aco")</code>.</li>
</ul>

<h3>13. 🚁 Drones, ⬆ Mk2/Mk3 e decoração</h3>
<ul>
<li>A <b>Doca de Drones</b> cria um drone. No código: <code>d = maquina("drone1")</code>, <code>d.ir_para("bau1")</code>, <code>d.pegar()</code>, <code>d.ir_para("venda1")</code>, <code>d.soltar()</code>.</li>
<li>Depois das pesquisas Mk2/Mk3, aperte <kbd>E</kbd> numa máquina e clique <b>⬆ Melhorar</b>: ela fica mais rápida (e gasta mais energia).</li>
<li>Decoração perto das máquinas dá bônus: plantas/árvores aumentam o clock dos computadores; luminárias e barris aceleram as máquinas.</li>
</ul>

<h3>14. 🌱 Horta</h3>
<ul>
<li>Coloque um <b>Canteiro</b>, aperte <kbd>E</kbd> nele e escolha a semente: <b>café, milho, cenoura, abóbora, melancia</b> ou <b>bambu</b> (bambu vira <b>madeira</b> pra construir).</li>
<li>Precisa de <b>água</b>: a chuva molha, o botão 💧 Regar também, e o <b>Irrigador</b> (1 ⚡) rega sozinho num raio de 2 células. De noite cresce pela metade.</li>
<li><b>Estufa:</b> um <b>teto de vidro</b> em cima do canteiro: +50% e cresce igual de noite (a chuva não molha lá dentro).</li>
<li>A colheita sai pela <b>seta laranja</b>. Código: <code>h = maquina("canteiro1")</code>, <code>h.plantar("cafe")</code>, <code>h.colher()</code>, <code>h.umidade()</code>.</li>
</ul>

<h3>15. 🧱 Construção e escritório</h3>
<ul>
<li>Tecla <kbd>2</kbd>: ferramenta <b>🧱 Construção</b>. <kbd>F</kbd> troca a peça (parede, janela, porta, piso, teto, cerca, pintar) e <kbd>T</kbd> troca o material (madeira, tijolo, concreto, vidro, aço) ou a cor da tinta.</li>
<li>Paredes vão na <b>borda da célula mais perto da mira</b>. <kbd>X</kbd> desmonta e devolve o material.</li>
<li>Materiais: bambu → madeira · 3 escórias → tijolo · <code>fundir("vidro")</code> (2 quartzos) · montadora: 2 escórias + 1 quartzo → 2 concretos · aço. Mande por esteira pro <b>Depósito de Materiais</b>, ou compre na loja (aba Materiais).</li>
<li>No escritório só entram <b>móveis</b> (loja → Escritório) e construção. <b>Quadros</b> de domínio público (loja → Quadros): clique numa parede pra pendurar.</li>
</ul>

<h3>16. 🤖 Oopi, ☄️ eventos e ⚙️ hardware</h3>
<ul>
<li><kbd>E</kbd> no Oopi = carinho. <kbd>F</kbd> olhando pra ele = <b>tarefas</b>: colher a horta, buscar meteoritos, levar itens, seguir ou ficar. Ele comemora os <b>recordes</b> da fábrica 🏆.</li>
<li><b>Chuva de meteoros</b> (noite): deixa um <b>veio de meteorito</b> (ponha um minerador!) e pedrinhas pra pegar com <kbd>E</kbd>. <b>Feira</b> (dia): 3 itens +60%. <b>Aurora</b> e <b>arco-íris</b>: só pra curtir.</li>
<li>No editor, aba <b>⚙ Hardware</b>: <b>overclock</b> (até 3×) e <b>memória</b> (variáveis e tamanho das listas) de cada computador.</li>
</ul>

<h3>17. 🧰 Ferramentas</h3>
<ul>
<li><kbd>C</kbd> copiar uma área (clique em 2 cantos) · <kbd>V</kbd> colar de novo · <kbd>R</kbd> gira o grupo. Peças que faltarem são compradas.</li>
<li><kbd>Ctrl+Z</kbd> desfaz (colocar, tirar, cabos, colar, girar).</li>
<li><kbd>Tab</kbd> mapa · <kbd>K</kbd> estatísticas, placar dos computadores e conquistas · <kbd>P</kbd> modo foto · <kbd>G</kbd> troca a estação do rádio.</li>
<li>No editor: autocompletar (dá pra desligar embaixo), depurador (clique no número da linha) e bibliotecas.</li>
<li>Menu: <b>3 fábricas</b> (saves separados). Configurações: <b>teclas</b>, <b>modo daltônico</b>, <b>fonte do editor</b> e <b>controle</b> 🎮 (alavancas andam e olham, <kbd>A</kbd> pula, <kbd>X</kbd> usa, <kbd>RT</kbd> coloca, <kbd>Start</kbd> pausa).</li>
</ul>

<h3>18. Problemas comuns</h3>
<table>
<tr><th>Problema</th><th>Solução</th></tr>
<tr><td>O item para no fim da esteira</td><td>A próxima peça não aceita por esse lado (seta laranja) ou está cheia.</td></tr>
<tr><td>A esteira faz uma curva estranha</td><td>Ela vira curva sozinha quando o item chega pelo lado. Gire com <kbd>R</kbd> (ou tecla <kbd>E</kbd> na máquina → Girar).</td></tr>
<tr><td>Computador com tela "SEM ENERGIA"</td><td>Ligue um cabo nele.</td></tr>
<tr><td>Erro "Não achei a máquina"</td><td>O nome no código tem que ser igual à plaquinha em cima da máquina.</td></tr>
<tr><td>Tudo lento</td><td>Energia fraca (HUD ⚡ vermelho): mais geradores. Ou compre "Clock da CPU" na loja.</td></tr>
<tr><td>"Memória cheia" / "Lista cheia"</td><td>Reaproveite variáveis, use <code>.pop(0)</code>, ou melhore a memória no ⚙ Hardware.</td></tr>
<tr><td>A planta não cresce</td><td>Terra seca, teto que não é de vidro em cima, ou é de noite.</td></tr>
</table>
</div>`;
}
