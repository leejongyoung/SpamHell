"""TypeScript 구현이 만든 testdata/golden.json과 출력이 같은지 확인한다 (언어 간 동등성)."""
import json
from pathlib import Path

import pytest

from spamhell import get_reply, get_template, match_situation, to_korean, to_spam

GOLDEN = Path(__file__).resolve().parents[3] / "testdata" / "golden.json"
CASES = json.loads(GOLDEN.read_text(encoding="utf-8"))["cases"]

_OPTION_NAMES = {
    "disassembleRate": "disassemble_rate",
    "dotRate": "dot_rate",
    "numberRate": "number_rate",
    "noiseRate": "noise_rate",
    "frame": "frame",
}


def _options(case):
    return {_OPTION_NAMES[key]: value for key, value in case.get("options", {}).items()}


def _run(case):
    fn = case["fn"]
    if fn == "matchSituation":
        return match_situation(case["input"])
    seed = case["seed"]
    if fn == "toSpam":
        return to_spam(case["input"], seed=seed, **_options(case))
    if fn == "toKorean":
        return to_korean(case["input"], seed=seed)
    if fn == "getTemplate":
        return get_template(case["kind"], seed=seed)
    return get_reply(case["situation"], mode=case["mode"], seed=seed, **_options(case))


def test_golden_file_covers_every_function():
    assert {case["fn"] for case in CASES} == {"toSpam", "toKorean", "getTemplate", "getReply", "matchSituation"}


@pytest.mark.parametrize("index", range(len(CASES)))
def test_matches_typescript(index):
    case = CASES[index]
    assert _run(case) == case["expected"]
