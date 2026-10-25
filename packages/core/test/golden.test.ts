import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getTemplate, toKorean, toSpam, type SpamOptions, type TemplateKind } from 'spamhell';

type Seed = number | string;
type GoldenCase =
  | { fn: 'toSpam'; input: string; seed: Seed; options: SpamOptions; expected: string }
  | { fn: 'toKorean'; input: string; seed: Seed; expected: string }
  | { fn: 'getTemplate'; kind: TemplateKind; seed: Seed; expected: string };

const golden = JSON.parse(
  readFileSync(new URL('../../../testdata/golden.json', import.meta.url), 'utf8'),
) as { cases: GoldenCase[] };

// 같은 파일을 Python 구현도 검증한다. 출력이 바뀌면 의도한 변경인지 확인하고 scripts/gen-golden.mjs로 다시 만든다.
describe('golden vectors', () => {
  it('has cases for every function', () => {
    const fns = new Set(golden.cases.map((c) => c.fn));
    expect([...fns].sort()).toEqual(['getTemplate', 'toKorean', 'toSpam']);
  });

  it.each(golden.cases.map((c, index) => [index, c] as const))('case %i matches', (_index, c) => {
    const actual =
      c.fn === 'toSpam'
        ? toSpam(c.input, { ...c.options, seed: c.seed })
        : c.fn === 'toKorean'
          ? toKorean(c.input, { seed: c.seed })
          : getTemplate(c.kind, { seed: c.seed });
    expect(actual).toBe(c.expected);
  });
});
