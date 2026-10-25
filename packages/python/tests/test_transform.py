import re

import pytest

from spamhell import TEMPLATE_KINDS, get_template, to_korean, to_spam

OFF = dict(disassemble_rate=0, dot_rate=0, number_rate=0, noise_rate=0, frame=False)


def test_same_seed_same_output_and_int_equals_str():
    text = "입금 확인 부탁드립니다 010-1234-5678"
    assert to_spam(text, seed=42) == to_spam(text, seed=42)
    assert to_spam(text, seed=42) == to_spam(text, seed="42")


def test_output_varies_with_seed():
    text = "입금 확인 부탁드립니다 010-1234-5678 입금 확인 부탁드립니다"
    assert len({to_spam(text, seed=seed) for seed in range(20)}) > 1


def test_identity_when_everything_is_disabled():
    text = "안녕하세요 123 hello 😀"
    assert to_spam(text, **OFF) == text


def test_empty_input():
    assert to_spam("", seed=1) == ""
    assert to_korean("") == ""


def test_spells_out_syllables_as_jamo():
    assert to_spam("안녕", **{**OFF, "disassemble_rate": 1}) == "ㅇㅏㄴㄴㅕㅇ"
    assert to_spam("가", **{**OFF, "disassemble_rate": 1}) == "ㄱㅏ"


def test_dots_only_between_two_hangul_syllables():
    on = {**OFF, "dot_rate": 1}
    assert to_spam("입금확인", **on) == "입.금.확.인"
    assert to_spam("입a금", **on) == "입a금"
    assert to_spam("입 금", **on) == "입 금"
    assert to_spam("😀입금😀", **on) == "😀입.금😀"


def test_digit_replacement():
    for seed in range(5):
        one, four, seven = to_spam("147", **{**OFF, "number_rate": 1}, seed=seed)
        assert one in ("l", "!", "ㅣ", "i")
        assert (four, seven) == ("사", "칠")


def test_forced_noise_adds_exactly_one_marker():
    output = to_spam("abcdef", **{**OFF, "noise_rate": 1}, seed=7)
    assert len(output) == 7
    assert re.sub(r"[◈▶※/._]", "", output, count=1) == "abcdef"


def test_frame_has_header_and_footer():
    header, footer = to_spam("테스트", **{**OFF, "frame": True}, seed=3).split("\n")
    assert header.endswith(" 테스트")
    assert footer in ("[거/부] 080-철창행-열차", "[무/료/수/신/거/부]")


@pytest.mark.parametrize("value", [-0.1, 1.1, float("nan")])
@pytest.mark.parametrize("name", ["disassemble_rate", "dot_rate", "number_rate", "noise_rate"])
def test_rejects_out_of_range_rates(name, value):
    with pytest.raises(ValueError):
        to_spam("a", **{name: value})


def test_injected_rng_wins_over_seed():
    output = to_spam("입금", **{**OFF, "disassemble_rate": 1}, rng=lambda: 0.0, seed=1)
    assert output == "ㅇㅣㅂㄱㅡㅁ"


@pytest.mark.parametrize("seed", [1.5, True, b"x"])
def test_rejects_unsupported_seed_types(seed):
    with pytest.raises(TypeError):
        to_spam("a", seed=seed)


def test_korean_filler_and_tail():
    output = to_korean("지금 바로 입금하세요", seed=5)
    assert output.endswith(" ㅠㅠ")
    assert "ㄹㅇ" in output.split(" ")
    assert not output.startswith("ㄹㅇ")
    assert not output.endswith("ㄹㅇ ㅠㅠ")
    assert to_korean("안녕", seed=1) == "안녕 ㅠㅠ"


@pytest.mark.parametrize("kind", TEMPLATE_KINDS)
def test_templates(kind):
    assert get_template(kind, seed=1)
    assert len({get_template(kind, seed=seed) for seed in range(30)}) > 1


def test_unknown_template_kind():
    with pytest.raises(ValueError):
        get_template("nope")


def test_version_matches_pyproject():
    import spamhell
    from pathlib import Path

    pyproject = (Path(__file__).resolve().parents[1] / "pyproject.toml").read_text(encoding="utf-8")
    assert re.search(r'^version = "%s"$' % re.escape(spamhell.__version__), pyproject, re.MULTILINE)
