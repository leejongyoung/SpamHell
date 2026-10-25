from __future__ import annotations

from typing import Optional

_CHO = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"]
_JUNG = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"]
_JONG = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"]

_SYLLABLE_BASE = 0xAC00  # '가'
_SYLLABLE_LAST = 0xD7A3  # '힣'


def is_hangul_syllable(char: Optional[str]) -> bool:
    """완성형 한글 음절(가-힣)인지 확인한다."""
    if not char:
        return False
    return _SYLLABLE_BASE <= ord(char[0]) <= _SYLLABLE_LAST


def disassemble_syllable(char: str) -> str:
    """음절 하나를 초성+중성+종성 자모로 풀어쓴다. 예: `녕` -> `ㄴㅕㅇ`"""
    if not is_hangul_syllable(char):
        return char
    offset = ord(char[0]) - _SYLLABLE_BASE
    return _CHO[offset // 588] + _JUNG[(offset % 588) // 28] + _JONG[offset % 28]
