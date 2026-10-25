import { describe, expect, it } from 'vitest';
import { STATS, TIMELINE, formatEok, formatMan, formatPercent, growthPercent } from '../src/background';
import { wrapText } from '../src/card';
import { resolveTheme } from '../src/theme';
import { detectSmsPlatform, normalizePhone, smsBytes, smsHref, smsKind } from '../src/sms';

describe('smsHref', () => {
  const body = '입금 확인\n바랍니다 & 100%';

  it('uses ?body= on Android-like platforms and &body= on Apple platforms', () => {
    expect(smsHref({ to: '010-1234-5678', body: 'a', platform: 'other' })).toBe('sms:01012345678?body=a');
    expect(smsHref({ to: '010-1234-5678', body: 'a', platform: 'apple' })).toBe('sms:01012345678&body=a');
  });

  it('percent-encodes the body, including newlines and reserved characters', () => {
    const href = smsHref({ to: '', body, platform: 'other' });
    expect(href).toBe(`sms:?body=${encodeURIComponent(body)}`);
    expect(href).toContain('%0A');
    expect(href).not.toMatch(/\s/);
    expect(decodeURIComponent(href.split('body=')[1]!)).toBe(body);
  });

  it('works without a recipient', () => {
    expect(smsHref({ to: '  ', body: 'x', platform: 'apple' })).toBe('sms:&body=x');
  });
});

describe('normalizePhone', () => {
  it('keeps digits and a leading plus only', () => {
    expect(normalizePhone('+82 10-1234-5678')).toBe('+821012345678');
    expect(normalizePhone('(02) 123 4567')).toBe('021234567');
    expect(normalizePhone('010+1234')).toBe('0101234');
    expect(normalizePhone('abc')).toBe('');
  });
});

describe('detectSmsPlatform', () => {
  it('treats iPhone, iPad (desktop UA) and macOS as apple', () => {
    expect(detectSmsPlatform({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)', platform: 'iPhone', maxTouchPoints: 5 })).toBe('apple');
    expect(detectSmsPlatform({ userAgent: 'Mozilla/5.0 (Macintosh)', platform: 'MacIntel', maxTouchPoints: 5 })).toBe('apple');
    expect(detectSmsPlatform({ userAgent: 'Mozilla/5.0 (Linux; Android 15)', platform: 'Linux armv8l', maxTouchPoints: 5 })).toBe('other');
  });
});

describe('smsBytes / smsKind', () => {
  it('counts Hangul as two bytes and ASCII as one', () => {
    expect(smsBytes('abc')).toBe(3);
    expect(smsBytes('가나다')).toBe(6);
    expect(smsBytes('a가\n')).toBe(4);
  });

  it('switches from SMS to LMS above 90 bytes and to OVER above 2000', () => {
    expect(smsKind(90)).toBe('SMS');
    expect(smsKind(91)).toBe('LMS');
    expect(smsKind(2000)).toBe('LMS');
    expect(smsKind(2001)).toBe('OVER');
  });
});

describe('wrapText', () => {
  const measure = (s: string) => [...s].length * 10;

  it('wraps at the max width and keeps explicit newlines', () => {
    expect(wrapText('abcdef\nxy', 30, measure)).toEqual(['abc', 'def', 'xy']);
  });

  it('keeps empty paragraphs as blank lines', () => {
    expect(wrapText('a\n\nb', 100, measure)).toEqual(['a', '', 'b']);
  });

  it('never splits a surrogate pair', () => {
    expect(wrapText('😀😀😀', 20, measure)).toEqual(['😀😀', '😀']);
  });
});

describe('resolveTheme', () => {
  it('prefers a saved choice over the system setting', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('follows the system setting when nothing valid is saved', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
    expect(resolveTheme('sepia', true)).toBe('dark');
  });
});

describe('background helpers', () => {
  it('formats 억 amounts with 조 and thousands separators', () => {
    expect(formatEok(12578)).toBe('1조 2,578억');
    expect(formatEok(8545)).toBe('8,545억');
    expect(formatEok(337)).toBe('337억');
    expect(formatEok(10000)).toBe('1조');
    expect(formatEok(20001)).toBe('2조 1억');
    expect(formatEok(0)).toBe('0억');
  });

  it('formats 만원 and percentages', () => {
    expect(formatMan(5384)).toBe('5,384만원');
    expect(formatPercent(43.2)).toBe('43%');
  });

  it('computes growth to one decimal place', () => {
    expect(growthPercent(8545, 12578)).toBe(47.2);
    expect(growthPercent(200, 100)).toBe(-50);
    expect(growthPercent(100, 100)).toBe(0);
  });

  it('keeps every figure attributable and the timeline in order', () => {
    for (const stat of STATS) {
      expect(stat.source).not.toBe('');
      expect(stat.format(stat.value)).not.toBe('');
    }
    expect(TIMELINE.map((item) => item.year)).toEqual(['2022', '2023', '2024', '2025', '2026']);
    for (const item of TIMELINE) expect(item.source).not.toBe('');
  });
});
