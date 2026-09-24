// Execute: node --test tests/challenges.test.mjs
// Cada desafio tem uma solução de referência que precisa passar e ganhar as 3 medalhas de ouro.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHALLENGES, evaluate, medal, byId } from '../js/challenges.js';

export const REF = {
  entrega: `while True:
    entregar(pegar())`,
  separar: `while True:
    x = pegar()
    if x == "minerio_ferro":
        entregar(x, "esquerda")
    else:
        entregar(x, "direita")`,
  contador: `n = 0
while tem_mais():
    if pegar() == "quartzo":
        n += 1
entregar(n)`,
  pares: `while True:
    x = pegar()
    if x % 2 == 0:
        entregar(x)`,
  somar: `while True:
    entregar(pegar() + pegar())`,
  maior: `m = 0
while True:
    x = pegar()
    if x == 0:
        entregar(m)
        m = 0
    elif x > m:
        m = x`,
  montadora: `f = 0
while True:
    x = pegar()
    if x == "lingote_cobre":
        entregar("fio")
        entregar("fio")
    else:
        f += 1
        if f % 2 == 0:
            entregar("engrenagem")`,
  compressao: `cur = pegar()
n = 1
while tem_mais():
    x = pegar()
    if x == cur:
        n += 1
    else:
        entregar(f"{n}x{cur}")
        cur = x
        n = 1
entregar(f"{n}x{cur}")`,
  ordenar: `l = []
while tem_mais():
    l.append(pegar())
for x in sorted(l):
    entregar(x)`,
  fibonacci: `while True:
    n = pegar()
    a, b = 0, 1
    for i in range(n):
        a, b = b, a + b
    entregar(a)`,
};

for (const ch of CHALLENGES) {
  test(`desafio ${ch.id}: solução de referência`, () => {
    const r = evaluate(REF[ch.id], ch);
    assert.ok(r.ok, JSON.stringify(r));
    for (const k of ['instr', 'linhas', 'vars']) assert.equal(medal(ch, k, r.score[k]), 'ouro', `${ch.id} ${k}=${r.score[k]} metas=${ch.metas[k]}`);
  });
}

test('resposta errada não passa', () => {
  const r = evaluate('while True:\n    pegar()\n', byId('entrega'));
  assert.equal(r.ok, false);
});
test('laço infinito é interrompido', () => {
  const r = evaluate('while True:\n    x = 1\n', byId('entrega'));
  assert.equal(r.ok, false);
  assert.match(r.error, /instruções/);
});
test('erro de sintaxe mostra a linha', () => {
  const r = evaluate('while True\n    entregar(pegar())\n', byId('entrega'));
  assert.equal(r.ok, false);
  assert.ok(r.line >= 1);
});
