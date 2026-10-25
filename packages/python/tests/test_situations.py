import pytest

from spamhell import (
    SITUATION_IDS,
    SITUATIONS,
    get_reply,
    get_reply_line,
    get_situation,
    is_situation_id,
)

OFF = dict(disassemble_rate=0, dot_rate=0, number_rate=0, noise_rate=0, frame=False)


def test_reference_data_is_varied_and_unique():
    assert len(set(SITUATION_IDS)) == len(SITUATIONS) >= 20
    for situation in SITUATIONS:
        assert situation.label and situation.incoming
        assert len(situation.replies) >= 5
        assert len(set(situation.replies)) == len(situation.replies)


def test_id_checks():
    assert is_situation_id("loan")
    assert not is_situation_id("nope")
    with pytest.raises(ValueError):
        get_situation("nope")


def test_reply_line_is_one_of_the_replies_and_reproducible():
    for situation_id in SITUATION_IDS:
        line = get_reply_line(situation_id, seed=5)
        assert line in get_situation(situation_id).replies
        assert get_reply_line(situation_id, seed=5) == line
    assert len({get_reply_line("parcel", seed=seed) for seed in range(40)}) > 1


def test_reply_shares_one_rng_stream_with_the_line_pick():
    for situation_id in SITUATION_IDS:
        assert get_reply(situation_id, seed=9) == get_reply(situation_id, seed=9)
        assert get_reply(situation_id, seed=9, **OFF) == get_reply_line(situation_id, seed=9)


def test_options_and_modes():
    plain = get_reply_line("loan", seed=3)
    jamo = get_reply("loan", seed=3, **{**OFF, "disassemble_rate": 1})
    assert jamo != plain and any("ㄱ" <= char <= "ㅣ" for char in jamo)
    assert get_reply("gov", mode="korean", seed=2).endswith(" ㅠㅠ")


def test_rejects_unknown_situation_and_mode():
    with pytest.raises(ValueError):
        get_reply("nope")
    with pytest.raises(ValueError):
        get_reply("loan", mode="loud")


def test_match_situation():
    from spamhell import match_situation

    for situation in SITUATIONS:
        assert match_situation(situation.incoming) == situation.id
    assert match_situation("VIP 리딩방 수익 인증 코인 에어드랍") == "invest"
    assert match_situation("코인 이벤트") == "coupon"  # 동점이면 앞선 상황
    assert match_situation("vip LEADING 입장") == "invest"
    assert match_situation("") is None
    assert match_situation("내일 회의 3시입니다") is None
