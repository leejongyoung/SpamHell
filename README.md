# SpamHell

보이스피싱범에게 보내는 역공 메시지를 **스팸체**로 바꿔 주는 도구 모음입니다. 자음 분리, 숫자 변형, 특수문자 삽입 같은 스팸 문자의 시각적 특징을 재현하고, 미리 만든 풍자 템플릿을 제공합니다.

변환 엔진 하나를 JavaScript와 Python, CLI, 웹에서 쓸 수 있고, **같은 시드는 어디서나 같은 결과**를 냅니다.

| 구성 | 경로 | 패키지 | 용도 |
| :--- | :--- | :--- | :--- |
| JS 라이브러리 | [`packages/core`](./packages/core) | npm `spamhell` | TypeScript/JavaScript 코드에서 호출 (ESM, 의존성 없음) |
| CLI | [`packages/cli`](./packages/cli) | npm `spamhell-cli` | 터미널과 파이프에서 변환 |
| Python 라이브러리와 CLI | [`packages/python`](./packages/python) | PyPI `spamhell` | Python 3.9+ 코드와 터미널에서 사용 (의존성 없음) |
| 웹 데모 | [`apps/web`](./apps/web) | 없음 | 브라우저 체험, 이미지 카드 저장 · [leejongyoung.github.io/SpamHell](https://leejongyoung.github.io/SpamHell/) |

> 레지스트리(npm, PyPI) 공개는 아직 하지 않았습니다. 아래 `npm install`과 `pip install` 명령은 공개 후에 동작하고, 공개 전에는 [개발](#개발)의 로컬 설치를 쓰세요.

## 사용

### JavaScript / TypeScript

```bash
npm install spamhell
```

```ts
import { toSpam, toKorean, getTemplate } from 'spamhell';

toSpam('입금 확인 바랍니다', { seed: 42 });
// -> "▼ 입금 확.ㅇㅣㄴ ㅂㅏ랍.니다_\n[거/부] 080-철창행-열차"

toKorean('지금 바로 입금하세요', { seed: 1 });  // -> "지금 바로 ㄹㅇ 입금하세요 ㅠㅠ"
getTemplate('prize', { seed: 1 });             // 템플릿 종류: prize, bot, horror
```

### Python

```bash
pip install spamhell
```

```python
from spamhell import to_spam, to_korean, get_template

to_spam("입금 확인 바랍니다", seed=42)
# '▼ 입금 확.ㅇㅣㄴ ㅂㅏ랍.니다_\n[거/부] 080-철창행-열차'

to_korean("지금 바로 입금하세요", seed=1)   # '지금 바로 ㄹㅇ 입금하세요 ㅠㅠ'
get_template("prize", seed=1)               # 템플릿 종류: prize, bot, horror
```

### CLI

npm(`spamhell-cli`)과 Python(`spamhell`)이 같은 이름의 명령과 같은 옵션을 제공합니다.

```bash
npm install -g spamhell-cli    # 또는: pip install spamhell

spamhell "입금 확인 바랍니다"
echo "지금 바로 입금하세요" | spamhell --mode korean --seed 7
spamhell --template prize --seed 7
spamhell --list-templates
```

| 옵션 | 설명 |
| :--- | :--- |
| `-m, --mode <spam\|korean>` | 변환 방식 (기본 `spam`) |
| `-t, --template <kind>` | 입력 대신 템플릿 출력 |
| `-s, --seed <value>` | 재현 가능한 결과 |
| `-h`, `-v` | 도움말, 버전 |

결과는 표준 출력에만 쓰고, 사용법 오류는 표준 오류와 종료 코드 `2`로 알립니다.

### 옵션과 재현성

- `seed`(숫자 또는 문자열)를 주면 결과가 항상 같습니다. 숫자 `42`와 문자열 `"42"`는 같은 시드입니다. 직접 난수 함수를 넣는 `rng`도 있습니다.
- 변환 확률 옵션은 JS의 `disassembleRate`, `dotRate`, `numberRate`, `noiseRate`와 Python의 `disassemble_rate`, `dot_rate`, `number_rate`, `noise_rate`입니다. 값은 0~1이고 벗어나면 JS는 `RangeError`, Python은 `ValueError`입니다. `frame`은 머리말과 꼬리말 여부입니다.
- 한글은 완성형 음절(가-힣)만 변환하고 이모지 같은 문자는 그대로 둡니다.
- JS와 Python은 같은 해시(FNV-1a)와 난수(mulberry32)를 구현하고, 난수를 같은 순서로 소비합니다. [`testdata/golden.json`](./testdata/golden.json)의 270개 사례를 두 구현의 테스트가 모두 검증합니다.

## 개발

Node.js 20 이상(CI는 22), Python 3.9 이상, [uv](https://docs.astral.sh/uv/).

```bash
# JavaScript
npm ci
npm run typecheck   # 소스와 테스트 타입 검사
npm test            # vitest (core, cli, golden)
npm run build       # core -> cli -> web 순서로 빌드

# Python
cd packages/python
uv run --with pytest python -m pytest   # golden 포함
```

공개 전 로컬 설치:

```bash
npm run build && npm install -g ./packages/cli   # CLI (core는 같은 저장소에서 연결)
pip install ./packages/python                    # Python
```

처음 클론한 뒤에는 `npm run build`를 한 번 실행하고 `npm install`을 다시 실행해야 워크스페이스에서 `spamhell` 명령이 `node_modules/.bin`에 연결됩니다. 연결 없이 쓰려면 `node packages/cli/dist/bin.js`를 실행하면 됩니다.

웹 데모 개발 서버는 먼저 빌드한 뒤 `npm run dev -w @spamhell/web`입니다.

### 동작을 바꿀 때

변환 규칙이나 템플릿을 바꾸면 TS(`packages/core/src`)와 Python(`packages/python/src/spamhell`)을 함께 고쳐야 합니다. 그다음 의도한 변경인지 확인하고 골든 파일을 다시 만듭니다.

```bash
npm run build -w spamhell && node scripts/gen-golden.mjs
```

한쪽만 고치면 다른 쪽의 골든 테스트가 실패합니다.

### 릴리스 (공개할 때)

세 패키지의 버전(`packages/core`, `packages/cli`, `packages/python/pyproject.toml`와 `__init__.py`)을 맞추고 CI가 통과한 상태에서 합니다. 인증은 각자의 계정으로 합니다.

```bash
npm login && npm publish -w spamhell && npm publish -w spamhell-cli   # 패키지의 private 필드는 이미 없음
cd packages/python && uv build && uv publish
```

`main`에 push하면 GitHub Actions가 검사와 테스트, 빌드(`npm pack` 드라이런과 `twine check` 포함)를 거쳐 웹 데모를 GitHub Pages에 배포합니다.

## 사용 원칙

이 프로젝트는 보이스피싱에 대한 풍자적 대응 도구입니다. 스팸 필터를 우회해 실제 스팸을 보내는 용도로 쓰지 않습니다. 그래서 발송, 대량 생성, 일괄 처리 기능은 의도적으로 제공하지 않습니다. 템플릿은 실제 기관의 이름이나 발신자를 사칭하지 않도록 작성합니다.

## 라이선스

소스 코드는 [Apache License 2.0](./LICENSE)을 따릅니다. 저작권 고지는 [NOTICE](./NOTICE)에 있습니다.

- 웹 데모의 카드 이미지(포돌이)는 경찰청 캐릭터이고 이 라이선스의 대상이 아닙니다. 이용 조건을 확인하기 전에는 공개 배포 대상에 포함하지 않으며, npm과 PyPI 패키지에도 들어 있지 않습니다.
- 원작 `mingpd/spammaker`의 라이선스는 확인하지 못했습니다. 공개 전에 정리가 필요합니다.

## 감사의 글

이 프로젝트는 [밍피디(mingpd)](https://github.com/mingpd)님의 `spammaker`에서 영감을 받았습니다. 멋진 아이디어를 공유해 주셔서 감사합니다.

---

Developed by [leejongyoung](https://github.com/leejongyoung)
