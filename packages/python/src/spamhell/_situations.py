"""상황별 레퍼런스와 답장. TypeScript 구현(packages/core/src/situations.ts)과 같은 순서로 난수를 소비한다."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Tuple

from ._data import SITUATION_KEYWORDS
from ._data import SITUATIONS as _RAW
from ._rng import Rng, Seed, pick, resolve_rng
from ._transform import to_korean, to_spam


@dataclass(frozen=True)
class Situation:
    """상황 하나. `incoming`은 가상의 수신 문자 예시, `replies`는 변환 전의 답장 문구다."""

    id: str
    label: str
    description: str
    incoming: str
    replies: Tuple[str, ...]


SITUATIONS: Tuple[Situation, ...] = tuple(Situation(*row) for row in _RAW)
SITUATION_IDS: Tuple[str, ...] = tuple(s.id for s in SITUATIONS)

_BY_ID = {s.id: s for s in SITUATIONS}


def is_situation_id(value: object) -> bool:
    return isinstance(value, str) and value in _BY_ID


def get_situation(situation_id: str) -> Situation:
    if not is_situation_id(situation_id):
        raise ValueError(
            "Unknown situation: %r (expected one of %s)" % (situation_id, ", ".join(SITUATION_IDS))
        )
    return _BY_ID[situation_id]


def get_reply_line(situation_id: str, *, seed: Optional[Seed] = None, rng: Optional[Rng] = None) -> str:
    """상황에 맞는 답장 문구 하나(평문)를 고른다."""
    return pick(resolve_rng(seed, rng), get_situation(situation_id).replies)


def get_reply(
    situation_id: str,
    *,
    mode: str = "spam",
    seed: Optional[Seed] = None,
    rng: Optional[Rng] = None,
    disassemble_rate: Optional[float] = None,
    dot_rate: Optional[float] = None,
    number_rate: Optional[float] = None,
    noise_rate: Optional[float] = None,
    frame: bool = True,
) -> str:
    """상황에 맞는 답장을 골라 바로 변환한다. 답장 선택과 변환이 하나의 난수열을 이어서 쓴다."""
    if mode not in ("spam", "korean"):
        raise ValueError("mode must be 'spam' or 'korean', got %r" % (mode,))
    random = resolve_rng(seed, rng)
    line = pick(random, get_situation(situation_id).replies)
    if mode == "korean":
        return to_korean(line, rng=random)
    return to_spam(
        line,
        rng=random,
        disassemble_rate=disassemble_rate,
        dot_rate=dot_rate,
        number_rate=number_rate,
        noise_rate=noise_rate,
        frame=frame,
    )


def match_situation(text: str) -> Optional[str]:
    """받은 문자에 가장 잘 맞는 상황 id. 일치한 키워드가 가장 많은 상황이고 동점이면 앞선 쪽이다. 없으면 None."""
    haystack = text.lower()
    best: Optional[str] = None
    best_score = 0
    for situation_id in SITUATION_IDS:
        score = sum(1 for keyword in SITUATION_KEYWORDS[situation_id] if keyword in haystack)
        if score > best_score:
            best, best_score = situation_id, score
    return best
