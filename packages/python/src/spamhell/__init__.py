"""스팸체(spam-style) 텍스트 변환기. 보이스피싱 역공 메시지용.

>>> from spamhell import to_spam, to_korean, get_template
>>> to_korean("지금 바로 입금하세요", seed=1)
'지금 바로 ㄹㅇ 입금하세요 ㅠㅠ'
"""
from __future__ import annotations

from ._rng import Rng, Seed
from ._situations import (
    SITUATION_IDS,
    SITUATIONS,
    Situation,
    get_reply,
    get_reply_line,
    get_situation,
    is_situation_id,
    match_situation,
)
from ._templates import TEMPLATE_KINDS, TEMPLATE_LABELS, get_template, is_template_kind
from ._transform import to_korean, to_spam

__version__ = "1.0.1"

__all__ = [
    "Rng",
    "SITUATIONS",
    "SITUATION_IDS",
    "Seed",
    "Situation",
    "TEMPLATE_KINDS",
    "TEMPLATE_LABELS",
    "get_reply",
    "get_reply_line",
    "get_situation",
    "get_template",
    "is_situation_id",
    "is_template_kind",
    "match_situation",
    "to_korean",
    "to_spam",
    "__version__",
]
