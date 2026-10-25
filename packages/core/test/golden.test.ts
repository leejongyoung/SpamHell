import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  getReply,
  getTemplate,
  matchSituation,
  toKorean,
  toSpam,
  type SituationId,
  type SpamOptions,
  type TemplateKind,
} from 'spamhell';

type Seed = number | string;
type GoldenCase =
  | { fn: 'toSpam'; input: string; seed: Seed; options: SpamOptions; expected: string }
  | { fn: 'toKorean'; input: string; seed: Seed; expected: string }
  | { fn: 'getTemplate'; kind: TemplateKind; seed: Seed; expected: string }
  | { fn: 'getReply'; situation: SituationId; mode: 'spam' | 'korean'; seed: Seed; options?: SpamOptions; expected: string }
  | { fn: 'matchSituation'; input: string; expected: SituationId | null };

const golden = JSON.parse(
  readFileSync(new URL('../../../testdata/golden.json', import.meta.url), 'utf8'),
) as { cases: GoldenCase[] };

function run(c: GoldenCase): string | null {
  switch (c.fn) {
    case 'toSpam':
      return toSpam(c.input, { ...c.options, seed: c.seed });
    case 'toKorean':
      return toKorean(c.input, { seed: c.seed });
    case 'getTemplate':
      return getTemplate(c.kind, { seed: c.seed });
    case 'getReply':
      return getReply(c.situation, { ...c.options, mode: c.mode, seed: c.seed });
    case 'matchSituation':
      return matchSituation(c.input);
  }
}

// 같은 파일을 Python 구현도 검증한다. 출력이 바뀌면 의도한 변경인지 확인하고 scripts/gen-golden.mjs로 다시 만든다.
describe('golden vectors', () => {
  it('has cases for every function', () => {
    const fns = new Set(golden.cases.map((c) => c.fn));
    expect([...fns].sort()).toEqual(['getReply', 'getTemplate', 'matchSituation', 'toKorean', 'toSpam']);
  });

  it.each(golden.cases.map((c, index) => [index, c] as const))('case %i matches', (_index, c) => {
    expect(run(c)).toBe(c.expected);
  });
});
