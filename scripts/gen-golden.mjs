// 코어(dist)의 실제 출력을 testdata/golden.json에 기록한다.
// TypeScript와 Python 구현은 이 파일과 같은 결과를 내야 한다. 의도한 동작 변경일 때만 다시 만든다.
//   npm run build -w spamhell && node scripts/gen-golden.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { TEMPLATE_KINDS, getTemplate, toKorean, toSpam } from '../packages/core/dist/index.js';

const seeds = [0, 1, 42, 'abc', '한글', '😀'];
const spamInputs = ['입금 확인 바랍니다 010-1234-5678', 'Hello 123 world', '안녕', '😀입금😀', '', 'a'];
const spamOptions = [
  {},
  { frame: false },
  { disassembleRate: 1, frame: false },
  { disassembleRate: 0, dotRate: 1, frame: false },
  { numberRate: 1, noiseRate: 0 },
  { noiseRate: 1 },
];
const koreanInputs = ['지금 바로 입금하세요', '안녕', 'a b c d e', ''];

const cases = [];
for (const input of spamInputs) {
  for (const seed of seeds) {
    for (const options of spamOptions) {
      cases.push({ fn: 'toSpam', input, seed, options, expected: toSpam(input, { ...options, seed }) });
    }
  }
}
for (const input of koreanInputs) {
  for (const seed of seeds) {
    cases.push({ fn: 'toKorean', input, seed, expected: toKorean(input, { seed }) });
  }
}
for (const kind of TEMPLATE_KINDS) {
  for (let seed = 0; seed < 10; seed++) {
    cases.push({ fn: 'getTemplate', kind, seed, expected: getTemplate(kind, { seed }) });
  }
}

mkdirSync(new URL('../testdata/', import.meta.url), { recursive: true });
writeFileSync(new URL('../testdata/golden.json', import.meta.url), `${JSON.stringify({ version: 1, cases }, null, 1)}\n`);
console.log(`wrote ${cases.length} cases`);
