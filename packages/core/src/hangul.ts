const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const SYLLABLE_BASE = 0xac00; // '가'
const SYLLABLE_LAST = 0xd7a3; // '힣'

/** 완성형 한글 음절(가-힣)인지 확인한다. */
export function isHangulSyllable(char: string | undefined): char is string {
  if (!char) return false;
  const code = char.codePointAt(0)!;
  return code >= SYLLABLE_BASE && code <= SYLLABLE_LAST;
}

/** 음절 하나를 초성+중성+종성 자모로 풀어쓴다. 예: `녕` → `ㄴㅕㅇ` */
export function disassembleSyllable(char: string): string {
  if (!isHangulSyllable(char)) return char;
  const offset = char.codePointAt(0)! - SYLLABLE_BASE;
  const cho = Math.floor(offset / 588);
  const jung = Math.floor((offset % 588) / 28);
  const jong = offset % 28;
  return CHO[cho]! + JUNG[jung]! + JONG[jong]!;
}
