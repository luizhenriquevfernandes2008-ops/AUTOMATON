// Execute: node --test tests/weekly.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { weeklyChallenge, weekKey, encodeScore, decodeScore } from '../js/weekly.js';
import { evaluate, medal } from '../js/challenges.js';

test('semana ISO', () => {
  assert.equal(weekKey(new Date(2026, 0, 1)), '2026-S01');
  assert.equal(weekKey(new Date(2026, 8, 24)), '2026-S39');
  assert.equal(weekKey(new Date(2027, 0, 1)), '2026-S53');
});

test('toda semana gera um desafio que a referência resolve com ouro', () => {
  const seen = new Set();
  for (let y = 2026; y <= 2028; y++) for (let w = 1; w <= 52; w++) {
    const week = `${y}-S${String(w).padStart(2, '0')}`;
    const ch = weeklyChallenge(week);
    seen.add(ch.nome.split(' ')[0]);
    const r = evaluate(ch.ref, ch);
    assert.ok(r.ok, week + ' ' + ch.nome + ' ' + JSON.stringify(r));
    for (const k of ['instr', 'linhas', 'vars']) assert.equal(medal(ch, k, r.score[k]), 'ouro', week + ' ' + k);
  }
  assert.ok(seen.size >= 8, 'variedade de modelos: ' + [...seen]);
});

test('mesma semana = mesmo desafio (igual pra todo mundo)', () => {
  const a = weeklyChallenge('2026-S40'), b = weeklyChallenge('2026-S40');
  assert.deepEqual([a.nome, a.seeds, a.metas], [b.nome, b.seeds, b.metas]);
});

test('código de placar vai e volta, e detecta alteração', () => {
  const code = encodeScore('2026-S40', 'Luiz', { instr: 30, linhas: 3, vars: 1 }, 'while True:\n    entregar(pegar())');
  const d = decodeScore(code);
  assert.equal(d.nome, 'Luiz');
  assert.equal(d.instr, 30);
  const raw = JSON.parse(Buffer.from(code.split(':')[1], 'base64').toString());
  raw.i = 1;
  const forged = 'AUTOMATON-SEMANA:' + Buffer.from(JSON.stringify(raw)).toString('base64');
  assert.throws(() => decodeScore(forged), /alterado/);
});
