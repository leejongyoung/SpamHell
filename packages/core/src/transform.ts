import { disassembleSyllable, isHangulSyllable } from './hangul.js';
import { pick, resolveRng, type Rng } from './rng.js';

const SPAM_MARKERS = ['[광.고]', '(주)', '▶', '▼', '◈', '※', '[Web발신]', '(축)'] as const;
const SPAM_FOOTERS = ['[거/부] 080-철창행-열차', '[무/료/수/신/거/부]'] as const;
const NOISE_MARKERS = ['◈', '▶', '※', '/', '.', '_'] as const;

const NUMBER_MAP: Readonly<Record<string, readonly string[]>> = {
  '0': ['영', 'O', 'ㅇ'],
  '1': ['l', '!', 'ㅣ', 'i'],
  '2': ['이', 'ㄹ'],
  '3': ['삼', 'E'],
  '4': ['사'],
  '5': ['오'],
  '6': ['육'],
  '7': ['칠'],
  '8': ['팔'],
  '9': ['구'],
};

export interface SpamOptions {
  /** 같은 시드와 입력이면 같은 결과. 숫자 42와 문자열 "42"는 동일. */
  seed?: number | string;
  /** 직접 난수 함수를 주입한다. `seed`보다 우선. */
  rng?: Rng;
  /** 음절을 자모로 풀어쓸 확률 (기본 0.15). 예: `녕` → `ㄴㅕㅇ` */
  disassembleRate?: number;
  /** 한글 음절 뒤에 점을 붙일 확률 (기본 0.15). 다음 글자도 한글일 때만. 예: `입.금` */
  dotRate?: number;
  /** 숫자를 다른 글자로 바꿀 확률 (기본 0.7). */
  numberRate?: number;
  /** 문장 중간에 특수문자를 끼워 넣을 확률 (기본 0.5). */
  noiseRate?: number;
  /** 앞뒤에 스팸 머리말·꼬리말을 붙일지 여부 (기본 true). */
  frame?: boolean;
}

const DEFAULTS = {
  disassembleRate: 0.15,
  dotRate: 0.15,
  numberRate: 0.7,
  noiseRate: 0.5,
  frame: true,
} as const;

function rate(name: string, value: number | undefined, fallback: number): number {
  const resolved = value ?? fallback;
  if (!(resolved >= 0 && resolved <= 1)) {
    throw new RangeError(`${name} must be between 0 and 1, got ${String(value)}`);
  }
  return resolved;
}

/** 텍스트를 스팸체로 바꾼다. 빈 문자열은 빈 문자열을 돌려준다. */
export function toSpam(text: string, options: SpamOptions = {}): string {
  const disassembleRate = rate('disassembleRate', options.disassembleRate, DEFAULTS.disassembleRate);
  const dotRate = rate('dotRate', options.dotRate, DEFAULTS.dotRate);
  const numberRate = rate('numberRate', options.numberRate, DEFAULTS.numberRate);
  const noiseRate = rate('noiseRate', options.noiseRate, DEFAULTS.noiseRate);
  if (!text) return '';

  const rng = resolveRng(options);
  // 유니코드 코드 포인트 단위로 순회해 이모지 같은 서로게이트 쌍이 깨지지 않게 한다.
  const chars = Array.from(text);
  const pieces: string[] = [];

  chars.forEach((char, index) => {
    if (char >= '0' && char <= '9') {
      const variants = NUMBER_MAP[char]!;
      pieces.push(rng() < numberRate ? pick(rng, variants) : char);
    } else if (isHangulSyllable(char)) {
      const roll = rng();
      if (roll < disassembleRate) {
        pieces.push(disassembleSyllable(char));
      } else if (roll < disassembleRate + dotRate && isHangulSyllable(chars[index + 1])) {
        pieces.push(char, '.');
      } else {
        pieces.push(char);
      }
    } else {
      pieces.push(char);
    }
  });

  if (rng() < noiseRate) {
    const position = Math.floor(rng() * (pieces.length + 1));
    pieces.splice(position, 0, pick(rng, NOISE_MARKERS));
  }

  const body = pieces.join('');
  if (!(options.frame ?? DEFAULTS.frame)) return body;
  return `${pick(rng, SPAM_MARKERS)} ${body}\n${pick(rng, SPAM_FOOTERS)}`;
}

export interface KoreanOptions {
  seed?: number | string;
  rng?: Rng;
}

/** 말투를 인터넷 구어체로 바꾼다. 문장 중간에 `ㄹㅇ`을 끼우고 끝에 `ㅠㅠ`를 붙인다. */
export function toKorean(text: string, options: KoreanOptions = {}): string {
  if (!text) return '';
  const rng = resolveRng(options);
  const words = text.split(' ');
  if (words.length > 1) {
    const position = Math.floor(rng() * (words.length - 1)) + 1;
    words.splice(position, 0, 'ㄹㅇ');
  }
  return `${words.join(' ')} ㅠㅠ`;
}
