import { describe, expect, it } from 'vitest';
import { TEMPLATE_KINDS, getTemplate, toKorean, toSpam } from 'spamhell';

const OFF = { disassembleRate: 0, dotRate: 0, numberRate: 0, noiseRate: 0, frame: false } as const;

describe('toSpam', () => {
  it('returns the same output for the same seed and input', () => {
    const text = '입금 확인 부탁드립니다 010-1234-5678';
    expect(toSpam(text, { seed: 42 })).toBe(toSpam(text, { seed: 42 }));
    expect(toSpam(text, { seed: 42 })).toBe(toSpam(text, { seed: '42' }));
  });

  it('varies with the seed', () => {
    const text = '입금 확인 부탁드립니다 010-1234-5678 입금 확인 부탁드립니다';
    const outputs = new Set(Array.from({ length: 20 }, (_, seed) => toSpam(text, { seed })));
    expect(outputs.size).toBeGreaterThan(1);
  });

  it('is the identity when every transformation is disabled', () => {
    const text = '안녕하세요 123 hello 😀';
    expect(toSpam(text, OFF)).toBe(text);
  });

  it('returns an empty string for empty input', () => {
    expect(toSpam('', { seed: 1 })).toBe('');
  });

  it('spells out whole syllables as jamo', () => {
    expect(toSpam('안녕', { ...OFF, disassembleRate: 1 })).toBe('ㅇㅏㄴㄴㅕㅇ');
    expect(toSpam('가', { ...OFF, disassembleRate: 1 })).toBe('ㄱㅏ');
  });

  it('inserts dots only between two Hangul syllables', () => {
    expect(toSpam('입금확인', { ...OFF, dotRate: 1 })).toBe('입.금.확.인');
    expect(toSpam('입a금', { ...OFF, dotRate: 1 })).toBe('입a금');
    expect(toSpam('입 금', { ...OFF, dotRate: 1 })).toBe('입 금');
  });

  it('replaces digits with a mapped variant', () => {
    const variants: Record<string, string[]> = { '1': ['l', '!', 'ㅣ', 'i'], '4': ['사'], '7': ['칠'] };
    for (const seed of [1, 2, 3, 4, 5]) {
      const output = toSpam('147', { ...OFF, numberRate: 1, seed });
      const [one, four, seven] = Array.from(output);
      expect(variants['1']).toContain(one);
      expect(four).toBe('사');
      expect(seven).toBe('칠');
    }
  });

  it('inserts exactly one noise marker when noise is forced', () => {
    const output = toSpam('abcdef', { ...OFF, noiseRate: 1, seed: 7 });
    expect(output.length).toBe('abcdef'.length + 1);
    expect(output.replace(/[◈▶※/._]/, '')).toBe('abcdef');
  });

  it('wraps the body with a header and footer by default', () => {
    const output = toSpam('테스트', { ...OFF, frame: true, seed: 3 });
    const [header, ...rest] = output.split('\n');
    expect(header).toMatch(/^(\[광\.고\]|\(주\)|▶|▼|◈|※|\[Web발신\]|\(축\)) 테스트$/);
    expect(rest.join('\n')).toMatch(/^(\[거\/부\] 080-철창행-열차|\[무\/료\/수\/신\/거\/부\])$/);
  });

  it('keeps characters outside the BMP intact', () => {
    expect(toSpam('😀입금😀', { ...OFF, dotRate: 1 })).toBe('😀입.금😀');
  });

  it.each([-0.1, 1.1, Number.NaN])('rejects an out-of-range rate (%s)', (value) => {
    expect(() => toSpam('a', { disassembleRate: value })).toThrow(RangeError);
    expect(() => toSpam('a', { dotRate: value })).toThrow(RangeError);
    expect(() => toSpam('a', { numberRate: value })).toThrow(RangeError);
    expect(() => toSpam('a', { noiseRate: value })).toThrow(RangeError);
  });

  it('uses an injected rng before the seed', () => {
    const rng = () => 0;
    expect(toSpam('입금', { ...OFF, disassembleRate: 1, rng, seed: 1 })).toBe('ㅇㅣㅂㄱㅡㅁ');
  });
});

describe('toKorean', () => {
  it('inserts the filler inside multi-word text and appends the tail', () => {
    const output = toKorean('지금 바로 입금하세요', { seed: 5 });
    expect(output.endsWith(' ㅠㅠ')).toBe(true);
    expect(output.split(' ')).toContain('ㄹㅇ');
    // 첫 단어 앞이나 맨 끝(꼬리말 앞)에는 들어가지 않는다.
    expect(output.startsWith('ㄹㅇ')).toBe(false);
    expect(output.endsWith('ㄹㅇ ㅠㅠ')).toBe(false);
  });

  it('does not insert the filler into a single word', () => {
    expect(toKorean('안녕', { seed: 1 })).toBe('안녕 ㅠㅠ');
  });

  it('returns an empty string for empty input', () => {
    expect(toKorean('')).toBe('');
  });

  it('is deterministic for a seed', () => {
    expect(toKorean('a b c d e', { seed: 9 })).toBe(toKorean('a b c d e', { seed: 9 }));
  });
});

describe('getTemplate', () => {
  it.each(TEMPLATE_KINDS)('returns non-empty text for %s', (kind) => {
    expect(getTemplate(kind, { seed: 1 }).length).toBeGreaterThan(0);
  });

  it('is deterministic for a seed and reaches more than one variant', () => {
    expect(getTemplate('prize', { seed: 11 })).toBe(getTemplate('prize', { seed: 11 }));
    const variants = new Set(Array.from({ length: 30 }, (_, seed) => getTemplate('prize', { seed })));
    expect(variants.size).toBeGreaterThan(1);
  });

  it('rejects an unknown kind', () => {
    expect(() => getTemplate('nope' as never)).toThrow(TypeError);
  });
});
