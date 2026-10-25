"""시드 가능한 난수. TypeScript 구현(packages/core/src/rng.ts)과 비트 단위로 같은 수열을 만든다."""
from __future__ import annotations

import struct
from typing import Callable, Optional, Sequence, TypeVar, Union

Rng = Callable[[], float]
Seed = Union[int, str]

T = TypeVar("T")

_MASK = 0xFFFFFFFF


def _imul(a: int, b: int) -> int:
    """JavaScript `Math.imul`의 하위 32비트 결과 (부호 없는 표현)."""
    return (a * b) & _MASK


def _utf16_units(text: str) -> Sequence[int]:
    # JavaScript의 charCodeAt은 UTF-16 코드 유닛 단위라서 이모지는 서로게이트 두 개로 해시된다.
    data = text.encode("utf-16-le", "surrogatepass")
    return struct.unpack("<%dH" % (len(data) // 2), data)


def _hash_seed(seed: Seed) -> int:
    """FNV-1a. 숫자 42와 문자열 "42"는 같은 시드다."""
    h = 2166136261
    for unit in _utf16_units(str(seed)):
        h ^= unit
        h = _imul(h, 16777619)
    return h


def _mulberry32(state: int) -> Rng:
    a = state & _MASK

    def rng() -> float:
        nonlocal a
        a = (a + 0x6D2B79F5) & _MASK
        t = _imul(a ^ (a >> 15), 1 | a)
        t = ((t + _imul(t ^ (t >> 7), 61 | t)) & _MASK) ^ t
        return ((t ^ (t >> 14)) & _MASK) / 4294967296

    return rng


def resolve_rng(seed: Optional[Seed] = None, rng: Optional[Rng] = None) -> Rng:
    """우선순위: `rng` > `seed` > `random.random`."""
    if rng is not None:
        return rng
    if seed is not None:
        if isinstance(seed, bool) or not isinstance(seed, (int, str)):
            raise TypeError("seed must be an int or str")
        return _mulberry32(_hash_seed(seed))
    import random

    return random.random


def pick(rng: Rng, items: Sequence[T]) -> T:
    return items[int(rng() * len(items))]
