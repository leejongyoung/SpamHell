"""`spamhell` 명령. npm의 spamhell-cli와 같은 옵션과 같은 결과를 낸다."""
from __future__ import annotations

import argparse
import sys
from typing import IO, List, Optional

from . import __version__
from ._templates import TEMPLATE_KINDS, TEMPLATE_LABELS, get_template
from ._transform import to_korean, to_spam

MODES = ("spam", "korean")


class _Parser(argparse.ArgumentParser):
    def error(self, message: str) -> "None":  # type: ignore[override]
        raise _UsageError(message)


class _UsageError(Exception):
    pass


def _build_parser() -> argparse.ArgumentParser:
    parser = _Parser(
        prog="spamhell",
        description="Transform text into spam-style (스팸체). Reads stdin when no text is given.",
        add_help=False,
    )
    parser.add_argument("text", nargs="*")
    parser.add_argument("-m", "--mode", default="spam", help="Transformation mode: spam or korean (default: spam)")
    parser.add_argument("-t", "--template", help="Print a template instead: " + ", ".join(TEMPLATE_KINDS))
    parser.add_argument("-s", "--seed", help="Make the output reproducible")
    parser.add_argument("--list-templates", action="store_true", help="List template kinds")
    parser.add_argument("-h", "--help", action="store_true", help="Show this help")
    parser.add_argument("-v", "--version", action="store_true", help="Show version")
    return parser


def run(
    argv: List[str],
    stdin: Optional[IO[str]] = None,
    stdout: Optional[IO[str]] = None,
    stderr: Optional[IO[str]] = None,
) -> int:
    """명령을 실행하고 종료 코드를 돌려준다. 결과는 stdout, 사용법 오류는 stderr에 쓴다."""
    stdin = stdin if stdin is not None else sys.stdin
    stdout = stdout if stdout is not None else sys.stdout
    stderr = stderr if stderr is not None else sys.stderr

    def fail(message: str) -> int:
        stderr.write("spamhell: %s\nTry 'spamhell --help'.\n" % message)
        return 2

    parser = _build_parser()
    try:
        args = parser.parse_args(argv)
    except _UsageError as error:
        return fail(str(error))

    if args.help:
        stdout.write(parser.format_help())
        return 0
    if args.version:
        stdout.write("%s\n" % __version__)
        return 0
    if args.list_templates:
        for kind in TEMPLATE_KINDS:
            stdout.write("%s\t%s\n" % (kind, TEMPLATE_LABELS[kind]))
        return 0

    if args.mode not in MODES:
        return fail("invalid mode '%s' (expected %s)" % (args.mode, " or ".join(MODES)))

    if args.template is not None:
        if args.text:
            return fail("--template cannot be combined with input text")
        if args.template not in TEMPLATE_KINDS:
            return fail("unknown template '%s' (expected %s)" % (args.template, ", ".join(TEMPLATE_KINDS)))
        stdout.write("%s\n" % get_template(args.template, seed=args.seed))
        return 0

    if args.text:
        text = " ".join(args.text)
    elif not stdin.isatty():
        text = stdin.read()
        if text.endswith("\r\n"):
            text = text[:-2]
        elif text.endswith("\n"):
            text = text[:-1]
    else:
        return fail("no input text (pass text as arguments or pipe it via stdin)")
    if text == "":
        return fail("input text is empty")

    if args.mode == "korean":
        output = to_korean(text, seed=args.seed)
    else:
        output = to_spam(text, seed=args.seed)
    stdout.write("%s\n" % output)
    return 0


def main() -> None:
    sys.exit(run(sys.argv[1:]))
