"""템플릿 API. 원문 데이터는 _data.py(생성물)에 있다."""
from __future__ import annotations

from typing import Optional

from ._data import TEMPLATE_KINDS, TEMPLATE_LABELS, TEMPLATES
from ._rng import Rng, Seed, pick, resolve_rng

__all__ = ["TEMPLATE_KINDS", "TEMPLATE_LABELS", "get_template", "is_template_kind"]


def is_template_kind(value: object) -> bool:
    return isinstance(value, str) and value in TEMPLATES


def get_template(kind: str, *, seed: Optional[Seed] = None, rng: Optional[Rng] = None) -> str:
    """종류별 템플릿 중 하나를 무작위로 돌려준다. 알 수 없는 종류는 `ValueError`."""
    if not is_template_kind(kind):
        raise ValueError("Unknown template kind: %r (expected one of %s)" % (kind, ", ".join(TEMPLATE_KINDS)))
    return pick(resolve_rng(seed, rng), TEMPLATES[kind])
