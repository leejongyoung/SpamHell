"""스팸체 변환. TypeScript 구현(packages/core/src/transform.ts)과 같은 순서로 난수를 소비한다."""
from __future__ import annotations

from typing import Dict, List, Optional, Tuple

from ._hangul import disassemble_syllable, is_hangul_syllable
from ._rng import Rng, Seed, pick, resolve_rng

_SPAM_MARKERS: Tuple[str, ...] = ("[광.고]", "(주)", "▶", "▼", "◈", "※", "[Web발신]", "(축)")
_SPAM_FOOTERS: Tuple[str, ...] = ("[거/부] 080-철창행-열차", "[무/료/수/신/거/부]")
_NOISE_MARKERS: Tuple[str, ...] = ("◈", "▶", "※", "/", ".", "_")

_NUMBER_MAP: Dict[str, Tuple[str, ...]] = {
    "0": ("영", "O", "ㅇ"),
    "1": ("l", "!", "ㅣ", "i"),
    "2": ("이", "ㄹ"),
    "3": ("삼", "E"),
    "4": ("사",),
    "5": ("오",),
    "6": ("육",),
    "7": ("칠",),
    "8": ("팔",),
    "9": ("구",),
}


def _rate(name: str, value: Optional[float], fallback: float) -> float:
    resolved = fallback if value is None else value
    # NaN은 어떤 비교도 만족하지 않으므로 같이 걸러진다.
    if not (0 <= resolved <= 1):
        raise ValueError("%s must be between 0 and 1, got %r" % (name, value))
    return resolved


def to_spam(
    text: str,
    *,
    seed: Optional[Seed] = None,
    rng: Optional[Rng] = None,
    disassemble_rate: Optional[float] = None,
    dot_rate: Optional[float] = None,
    number_rate: Optional[float] = None,
    noise_rate: Optional[float] = None,
    frame: bool = True,
) -> str:
    """텍스트를 스팸체로 바꾼다. 빈 문자열은 빈 문자열을 돌려준다.

    같은 `seed`와 입력이면 결과가 항상 같다 (숫자 42와 문자열 "42"는 동일).
    `rng`는 직접 넣는 난수 함수로 `seed`보다 우선한다.

    - disassemble_rate: 음절을 자모로 풀어쓸 확률 (기본 0.15). 예: `녕` -> `ㄴㅕㅇ`
    - dot_rate: 한글 음절 뒤에 점을 붙일 확률 (기본 0.15). 다음 글자도 한글일 때만. 예: `입.금`
    - number_rate: 숫자를 다른 글자로 바꿀 확률 (기본 0.7)
    - noise_rate: 문장 중간에 특수문자를 끼워 넣을 확률 (기본 0.5)
    - frame: 앞뒤에 스팸 머리말과 꼬리말을 붙일지 여부 (기본 True)
    """
    disassemble = _rate("disassemble_rate", disassemble_rate, 0.15)
    dot = _rate("dot_rate", dot_rate, 0.15)
    number = _rate("number_rate", number_rate, 0.7)
    noise = _rate("noise_rate", noise_rate, 0.5)
    if not text:
        return ""

    random = resolve_rng(seed, rng)
    chars = list(text)
    pieces: List[str] = []

    for index, char in enumerate(chars):
        if "0" <= char <= "9":
            variants = _NUMBER_MAP[char]
            pieces.append(pick(random, variants) if random() < number else char)
        elif is_hangul_syllable(char):
            roll = random()
            next_char = chars[index + 1] if index + 1 < len(chars) else None
            if roll < disassemble:
                pieces.append(disassemble_syllable(char))
            elif roll < disassemble + dot and is_hangul_syllable(next_char):
                pieces.append(char)
                pieces.append(".")
            else:
                pieces.append(char)
        else:
            pieces.append(char)

    if random() < noise:
        position = int(random() * (len(pieces) + 1))
        pieces.insert(position, pick(random, _NOISE_MARKERS))

    body = "".join(pieces)
    if not frame:
        return body
    return "%s %s\n%s" % (pick(random, _SPAM_MARKERS), body, pick(random, _SPAM_FOOTERS))


def to_korean(text: str, *, seed: Optional[Seed] = None, rng: Optional[Rng] = None) -> str:
    """말투를 인터넷 구어체로 바꾼다. 문장 중간에 `ㄹㅇ`을 끼우고 끝에 `ㅠㅠ`를 붙인다."""
    if not text:
        return ""
    random = resolve_rng(seed, rng)
    words = text.split(" ")
    if len(words) > 1:
        position = int(random() * (len(words) - 1)) + 1
        words.insert(position, "ㄹㅇ")
    return " ".join(words) + " ㅠㅠ"
