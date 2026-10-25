/** `[0, 1)` 범위의 난수를 돌려주는 함수. */
export type Rng = () => number;

/** 시드 문자열/숫자를 32비트 정수로 해시한다 (FNV-1a). 숫자 42와 문자열 "42"는 같은 시드다. */
function hashSeed(seed: number | string): number {
  const text = String(seed);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32: 작고 빠른 시드 가능 PRNG. */
function mulberry32(state: number): Rng {
  let a = state;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 난수 함수를 고른다. 우선순위: `rng` > `seed` > `Math.random`.
 * 같은 시드와 같은 입력이면 항상 같은 결과가 나온다.
 */
export function resolveRng(options: { seed?: number | string; rng?: Rng } = {}): Rng {
  if (options.rng) return options.rng;
  if (options.seed !== undefined) return mulberry32(hashSeed(options.seed));
  return Math.random;
}

/** 배열에서 하나를 고른다. 빈 배열은 호출하지 않는다. */
export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)] as T;
}
