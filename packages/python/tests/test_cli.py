import io

import pytest

from spamhell import TEMPLATE_KINDS, get_template, to_korean, to_spam
from spamhell.cli import run


class _Stdin(io.StringIO):
    def __init__(self, data="", tty=False):
        super().__init__(data)
        self._tty = tty

    def isatty(self):
        return self._tty


def call(args, stdin=None):
    out, err = io.StringIO(), io.StringIO()
    code = run(args, stdin=stdin or _Stdin(tty=True), stdout=out, stderr=err)
    return code, out.getvalue(), err.getvalue()


def test_positional_text_is_joined_with_spaces():
    assert call(["--seed", "3", "입금", "확인"]) == (0, to_spam("입금 확인", seed="3") + "\n", "")


def test_reads_stdin_and_strips_one_trailing_newline():
    code, out, _ = call(["-s", "3"], _Stdin("입금 확인\n"))
    assert (code, out) == (0, to_spam("입금 확인", seed="3") + "\n")


def test_korean_mode_and_template():
    assert call(["--mode", "korean", "--seed", "5", "지금 바로 입금"])[1] == to_korean("지금 바로 입금", seed="5") + "\n"
    assert call(["--template", "horror", "--seed", "2"])[1] == get_template("horror", seed="2") + "\n"


def test_list_templates():
    _, out, _ = call(["--list-templates"])
    assert [line.split("\t")[0] for line in out.splitlines()] == list(TEMPLATE_KINDS)


@pytest.mark.parametrize(
    "args, message",
    [
        (["--mode", "loud", "x"], "invalid mode"),
        (["--template", "nope"], "unknown template"),
        (["--template", "prize", "text"], "cannot be combined"),
        (["--bogus"], "bogus"),
        ([], "no input text"),
    ],
)
def test_usage_errors_exit_2_with_nothing_on_stdout(args, message):
    code, out, err = call(args)
    assert code == 2
    assert out == ""
    assert message in err


def test_empty_piped_input_fails():
    code, _, err = call([], _Stdin("\n"))
    assert code == 2 and "empty" in err


def test_help_and_version():
    assert call(["--help"])[1].startswith("usage: spamhell")
    assert call(["--version"])[1].count(".") == 2
