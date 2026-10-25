"""TypeScript 구현이 만든 testdata/golden.json과 출력이 같은지 확인한다 (언어 간 동등성)."""
import json
from pathlib import Path

import pytest

from spamhell import get_template, to_korean, to_spam

GOLDEN = Path(__file__).resolve().parents[3] / "testdata" / "golden.json"
CASES = json.loads(GOLDEN.read_text(encoding="utf-8"))["cases"]

_OPTION_NAMES = {
    "disassembleRate": "disassemble_rate",
    "dotRate": "dot_rate",
    "numberRate": "number_rate",
    "noiseRate": "noise_rate",
    "frame": "frame",
}


def _run(case):
    seed = case["seed"]
    if case["fn"] == "toSpam":
        options = {_OPTION_NAMES[key]: value for key, value in case["options"].items()}
        return to_spam(case["input"], seed=seed, **options)
    if case["fn"] == "toKorean":
        return to_korean(case["input"], seed=seed)
    return get_template(case["kind"], seed=seed)


def test_golden_file_covers_every_function():
    assert {case["fn"] for case in CASES} == {"toSpam", "toKorean", "getTemplate"}


@pytest.mark.parametrize("index", range(len(CASES)))
def test_matches_typescript(index):
    case = CASES[index]
    assert _run(case) == case["expected"]
