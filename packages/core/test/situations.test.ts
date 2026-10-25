import { describe, expect, it } from 'vitest';
import {
  SITUATIONS,
  SITUATION_IDS,
  getReply,
  getReplyLine,
  getSituation,
  isSituationId,
  matchSituation,
  type SituationId,
} from 'spamhell';

const OFF = { disassembleRate: 0, dotRate: 0, numberRate: 0, noiseRate: 0, frame: false } as const;

describe('situation reference data', () => {
  it('has unique ids and enough variety to reply differently', () => {
    expect(new Set(SITUATION_IDS).size).toBe(SITUATIONS.length);
    expect(SITUATIONS.length).toBeGreaterThanOrEqual(20);
    for (const situation of SITUATIONS) {
      expect(situation.label).not.toBe('');
      expect(situation.incoming).not.toBe('');
      expect(situation.replies.length).toBeGreaterThanOrEqual(5);
      expect(new Set(situation.replies).size).toBe(situation.replies.length);
    }
  });

  it('keeps replies as plain text (styling is applied by the transform, not stored)', () => {
    for (const situation of SITUATIONS) {
      for (const reply of situation.replies) {
        expect(reply).not.toMatch(/^\[(광\.고|Web발신)\]|\n/);
      }
    }
  });

  it('recognises ids and rejects anything else', () => {
    expect(isSituationId('loan')).toBe(true);
    expect(isSituationId('nope')).toBe(false);
    expect(() => getSituation('nope' as SituationId)).toThrow(TypeError);
  });
});

describe('getReplyLine', () => {
  it('returns one of the situation replies, reproducibly', () => {
    for (const id of SITUATION_IDS) {
      const line = getReplyLine(id, { seed: 5 });
      expect(getSituation(id).replies).toContain(line);
      expect(getReplyLine(id, { seed: 5 })).toBe(line);
    }
  });

  it('reaches more than one reply across seeds', () => {
    const lines = new Set(Array.from({ length: 40 }, (_, seed) => getReplyLine('parcel', { seed })));
    expect(lines.size).toBeGreaterThan(1);
  });
});

describe('getReply', () => {
  it('is deterministic and picks the same line as getReplyLine', () => {
    for (const id of SITUATION_IDS) {
      expect(getReply(id, { seed: 9 })).toBe(getReply(id, { seed: 9 }));
      // 변환을 모두 끄면 선택된 평문이 그대로 나온다: 선택과 변환이 같은 난수열을 이어 쓴다.
      expect(getReply(id, { ...OFF, seed: 9 })).toBe(getReplyLine(id, { seed: 9 }));
    }
  });

  it('applies transform options after choosing the reply', () => {
    const plain = getReplyLine('loan', { seed: 3 });
    const jamo = getReply('loan', { ...OFF, disassembleRate: 1, seed: 3 });
    expect(jamo).not.toBe(plain);
    expect(jamo).toMatch(/[ㄱ-ㅣ]/);
  });

  it('supports the korean mode', () => {
    const reply = getReply('gov', { mode: 'korean', seed: 2 });
    expect(reply.endsWith(' ㅠㅠ')).toBe(true);
  });

  it('rejects an unknown situation and an unknown mode', () => {
    expect(() => getReply('nope' as SituationId)).toThrow(TypeError);
    expect(() => getReply('loan', { mode: 'loud' as never })).toThrow(TypeError);
  });
});

describe('matchSituation', () => {
  it('recognises the example incoming message of every situation', () => {
    for (const situation of SITUATIONS) {
      expect(matchSituation(situation.incoming), situation.id).toBe(situation.id);
    }
  });

  it('prefers the situation with more matching keywords and breaks ties by order', () => {
    expect(matchSituation('VIP 리딩방 수익 인증 코인 에어드랍')).toBe('invest');
    // '코인'(crypto)과 '이벤트'(coupon)는 각각 1점으로 동점이라 SITUATIONS에서 앞선 coupon이 이긴다.
    expect(matchSituation('코인 이벤트')).toBe('coupon');
  });

  it('is case-insensitive and returns null when nothing matches', () => {
    expect(matchSituation('vip LEADING 입장')).toBe('invest');
    expect(matchSituation('')).toBeNull();
    expect(matchSituation('내일 회의 3시입니다')).toBeNull();
  });
});
