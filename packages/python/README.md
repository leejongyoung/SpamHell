# spamhell (Python)

보이스피싱범에게 보내는 역공 메시지를 **스팸체**로 바꾸는 Python 라이브러리와 CLI입니다. 의존성이 없고 Python 3.9 이상에서 동작합니다.

npm 패키지 [`spamhell`](../core)과 **같은 시드에서 같은 결과**를 냅니다. 저장소의 `testdata/golden.json`으로 두 구현의 출력을 계속 대조합니다.

## 설치

```bash
pip install spamhell
```

## 사용

```python
from spamhell import to_spam, to_korean, get_template

to_spam("입금 확인 바랍니다", seed=42)
# '▼ 입금 확.ㅇㅣㄴ ㅂㅏ랍.니다_\n[거/부] 080-철창행-열차'

to_korean("지금 바로 입금하세요", seed=1)   # '지금 바로 ㄹㅇ 입금하세요 ㅠㅠ'
get_template("prize", seed=1)               # 템플릿 종류: prize, bot, horror
```

- `seed`(int 또는 str)를 주면 결과가 항상 같습니다. `42`와 `"42"`는 같은 시드입니다. `rng`로 난수 함수를 직접 넣을 수도 있습니다.
- `to_spam` 옵션: `disassemble_rate`, `dot_rate`, `number_rate`, `noise_rate`(각 0~1, 벗어나면 `ValueError`), `frame`(머리말과 꼬리말 여부).

### 상황별 답장

`SITUATIONS`(상황 21개: `id`, `label`, `description`, `incoming`, `replies`), `SITUATION_IDS`, `is_situation_id`, `get_situation`, `get_reply_line`, `get_reply`를 제공합니다. 알 수 없는 id나 mode는 `ValueError`입니다.

```python
from spamhell import get_reply

get_reply("loan", seed=7)
# '(주) 한도 상ㅎㅑㅇ ㅁㅏㄹㄱㅗ 반ㅅㅓㅇ 상ㅎㅑㅇ부ㅌㅓ/ 신청하세요.\n[거/부] 080-철창행-열차'
```

## CLI

```bash
spamhell "입금 확인 바랍니다"
echo "지금 바로 입금하세요" | spamhell --mode korean --seed 7
spamhell --template prize --seed 7
spamhell --list-templates
spamhell --situation loan --seed 7
spamhell --list-situations
python -m spamhell --help
```

결과는 표준 출력에만 쓰고, 사용법 오류는 표준 오류와 종료 코드 `2`로 알립니다.

## 사용 원칙

보이스피싱에 대한 풍자적 대응 도구입니다. 스팸 필터를 우회해 실제 스팸을 보내는 용도로 쓰지 않으며, 발송과 대량 생성 기능은 제공하지 않습니다.

## 라이선스

Apache License 2.0. 자세한 내용은 [저장소](https://github.com/leejongyoung/SpamHell)를 참고하세요.
