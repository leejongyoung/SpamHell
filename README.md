<p align="center">
  <img src="./assets/logo.svg" width="128" alt="SpamHell 로고: 불꽃이 타오르는 말풍선" />
</p>

<h1 align="center">SpamHell</h1>

<p align="center">
  <strong>사기꾼에게는 텍스트 지옥을.</strong><br />
  보이스피싱범에게 보내는 역공 문자를 스팸체로 바꿔 주는 도구 모음
</p>

<p align="center">
  <a href="https://leejongyoung.github.io/SpamHell/">웹 데모</a> ·
  <a href="./CONTRIBUTING.md">기여하기</a> ·
  <a href="./SECURITY.md">보안 정책</a> ·
  <a href="./LICENSE">Apache-2.0</a>
</p>

---

자음 분리, 숫자 변형, 특수문자 삽입 같은 스팸 문자의 특징을 재현하고, 미리 만든 풍자 템플릿을 제공합니다. 변환 엔진 하나를 JavaScript, Python, CLI, AI 비서(MCP), 웹에서 쓸 수 있고, **같은 시드는 어디서나 같은 결과**를 냅니다.

| 구성 | 경로 | 패키지 | 용도 |
| :--- | :--- | :--- | :--- |
| JS 라이브러리 | [`packages/core`](./packages/core) | npm `spamhell` | TypeScript/JavaScript 코드에서 호출 (ESM, 의존성 없음) |
| CLI | [`packages/cli`](./packages/cli) | npm `spamhell-cli` | 터미널과 파이프에서 변환 |
| AI 연결 | [`packages/mcp`](./packages/mcp) | npm `spamhell-mcp` | AI 비서가 도구로 호출하는 MCP 서버 |
| Python | [`packages/python`](./packages/python) | PyPI `spamhell` | Python 3.9+ 라이브러리와 CLI (의존성 없음) |
| 웹 | [`apps/web`](./apps/web) | 없음 | 문자처럼 쓰고 내 문자 앱으로 보내는 홈페이지 |

> 레지스트리(npm, PyPI) 공개는 아직 하지 않았습니다. 아래 `npm install`, `pip install`, `npx` 명령은 공개 후에 동작하고, 공개 전에는 [개발](#개발)의 로컬 설치를 쓰세요.

## 웹: 문자처럼 쓰고 보내기

[홈페이지](https://leejongyoung.github.io/SpamHell/)는 휴대폰에서 쓰기 좋게 만든 문자 작성기입니다.

- 문자 앱 같은 화면에서 답장을 쓰면 스팸체 미리보기가 바로 보입니다. 한국인체, 다시 굴리기, 시드 고정을 지원하고 SMS/LMS 바이트를 세어 줍니다.
- **상황별 레퍼런스**: 흔한 사기 문자 21가지 상황(대출, 택배, 수사기관 사칭, 가족 사칭, 투자 리딩방 등)마다 어울리는 답장을 준비했습니다. 상황을 고르면 받은 문자 예시와 답장이 채워지고, 받은 문자를 붙여넣으면 키워드로 상황을 찾아 줍니다. 이 과정도 브라우저 안에서만 일어납니다.
- **위쪽 화살표(전송)를 누르면 기기에 설치된 기본 문자 앱이 본문이 채워진 채로 열립니다**(`sms:` 링크). 받는 번호는 선택입니다. 실제 전송은 문자 앱에서 사용자가 직접 누릅니다.
- 이미지 카드는 공유 시트(MMS 첨부)나 PNG 저장으로 내보냅니다.
- **왜 만들었나** 섹션에 2022년부터 2026년까지 보이스피싱의 흐름을 숫자(카운트업), 연간 피해액 막대 차트, 타임라인으로 정리하고, 프로젝트가 걸어 온 이야기와 신고 안내(112, 금융감독원 1332, 스팸 118)를 담았습니다. 수치는 경찰과 금융당국 발표를 인용한 언론 보도를 정리한 것이며 카드마다 매체와 날짜를 적었습니다. 집계 기관과 범위에 따라 숫자가 다를 수 있어 정확한 값은 원 발표를 확인하세요.
- 메시지 입력창은 문자 앱처럼 글이 늘어나면 창 자체가 함께 커집니다(안에서 스크롤하지 않습니다).
- 라이트와 다크 테마를 지원합니다(시스템 설정을 따르고 직접 바꿀 수도 있습니다). 움직임 줄이기 설정을 켜면 애니메이션이 꺼집니다.
- 입력한 글과 번호는 브라우저 밖으로 나가지 않습니다. 저장하는 것은 테마 선택뿐입니다. 휴대폰이 아니거나 문자 앱이 열리지 않으면 복사해서 붙여넣으세요.

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

상황별 답장은 아래처럼 받습니다.

```ts
import { getReply } from 'spamhell';

getReply('loan', { seed: 7 });
// -> "(주) 한도 상ㅎㅑㅇ ㅁㅏㄹㄱㅗ 반ㅅㅓㅇ 상ㅎㅑㅇ부ㅌㅓ/ 신청하세요.\n[거/부] 080-철창행-열차"
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

상황별 답장은 아래처럼 받습니다.

```python
from spamhell import get_reply

get_reply("loan", seed=7)
# '(주) 한도 상ㅎㅑㅇ ㅁㅏㄹㄱㅗ 반ㅅㅓㅇ 상ㅎㅑㅇ부ㅌㅓ/ 신청하세요.\n[거/부] 080-철창행-열차'
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
| `-c, --situation <id>` | 사기 상황에 맞는 답장 출력 (`--list-situations`로 목록) |
| `-h`, `-v` | 도움말, 버전 |

결과는 표준 출력에만 쓰고, 사용법 오류는 표준 오류와 종료 코드 `2`로 알립니다.

### AI 연결 (MCP)

[MCP](https://modelcontextprotocol.io) 서버를 연결하면 Claude 같은 AI 비서가 직접 변환 도구를 호출합니다. 도구는 텍스트만 돌려주며 네트워크, 파일, 환경 변수에 접근하지 않습니다.

```bash
claude mcp add spamhell -- npx -y spamhell-mcp
```

```json
{ "mcpServers": { "spamhell": { "command": "npx", "args": ["-y", "spamhell-mcp"] } } }
```

| 도구 | 설명 |
| :--- | :--- |
| `spamhell_transform` | 글을 스팸체 또는 한국인체로 변환 (시드, 확률 옵션 지원) |
| `spamhell_template` | 풍자 템플릿 하나 가져오기 |
| `spamhell_list_templates` | 템플릿 종류와 이름 보기 |
| `spamhell_reply` | 받은 사기 문자의 상황 id에 맞는 풍자 답장 (시드 지원) |
| `spamhell_list_situations` | 상황 id, 이름, 설명, 예시 수신 문자 보기 |

자세한 내용은 [`packages/mcp`](./packages/mcp)를 보세요. 크롤러와 LLM을 위한 요약은 홈페이지의 [`llms.txt`](./apps/web/public/llms.txt)에 있습니다.

### 옵션과 재현성

- `seed`(숫자 또는 문자열)를 주면 결과가 항상 같습니다. 숫자 `42`와 문자열 `"42"`는 같은 시드입니다. 직접 난수 함수를 넣는 `rng`도 있습니다.
- 변환 확률 옵션은 JS의 `disassembleRate`, `dotRate`, `numberRate`, `noiseRate`와 Python의 `disassemble_rate`, `dot_rate`, `number_rate`, `noise_rate`입니다. 값은 0~1이고 벗어나면 JS는 `RangeError`, Python은 `ValueError`입니다. `frame`은 머리말과 꼬리말 여부입니다.
- 한글은 완성형 음절(가-힣)만 변환하고 이모지 같은 문자는 그대로 둡니다.
- JS와 Python은 같은 해시(FNV-1a)와 난수(mulberry32)를 구현하고, 난수를 같은 순서로 소비합니다. [`testdata/golden.json`](./testdata/golden.json)의 270개 사례를 두 구현의 테스트가 모두 검증합니다.

## 개발

Node.js 22 이상(CI 기준), Python 3.9 이상, [uv](https://docs.astral.sh/uv/). 기여 방법은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 보세요.

```bash
# JavaScript
npm ci
npm run typecheck   # 소스와 테스트 타입 검사
npm test            # vitest (core, cli, mcp, web 헬퍼, golden)
npm run build       # core -> cli -> mcp -> web 순서로 빌드

# Python
cd packages/python
uv run --with pytest python -m pytest   # golden 포함
```

공개 전 로컬 설치:

```bash
npm run build && npm install -g ./packages/cli   # CLI (core는 같은 저장소에서 연결)
pip install ./packages/python                    # Python
```

처음 클론한 뒤에는 `npm run build`를 한 번 실행하고 `npm install`을 다시 실행해야 워크스페이스에서 `spamhell` 명령이 `node_modules/.bin`에 연결됩니다. 연결 없이 쓰려면 `node packages/cli/dist/bin.js`를 실행하면 됩니다. 웹 개발 서버는 먼저 빌드한 뒤 `npm run dev -w @spamhell/web`입니다.

변환 규칙이나 템플릿을 바꾸면 TS와 Python을 함께 고치고 골든 파일을 다시 만듭니다(`npm run build -w spamhell && node scripts/gen-golden.mjs`). 한쪽만 고치면 다른 쪽 골든 테스트가 실패합니다.

### 릴리스 (공개할 때)

네 패키지의 버전(`packages/core`, `packages/cli`, `packages/mcp`, `packages/python`의 `pyproject.toml`과 `__init__.py`)을 맞추고 CI가 통과한 상태에서 합니다.

```bash
npm login
npm publish -w spamhell && npm publish -w spamhell-cli && npm publish -w spamhell-mcp
```

PyPI는 토큰 대신 Trusted Publishing을 씁니다. PyPI에서 Publisher(저장소 `leejongyoung/SpamHell`, 워크플로 `publish-python.yml`, 환경 `pypi`)를 등록한 뒤 Actions의 **Publish Python package**를 수동 실행하면 테스트, 빌드, 공개를 합니다.

`main`에 push하면 GitHub Actions가 검사와 테스트, 빌드(`npm pack` 드라이런과 `twine check` 포함)를 거쳐 웹을 GitHub Pages에 배포합니다.

## 사용 원칙

이 프로젝트는 보이스피싱에 대한 풍자적 대응 도구입니다. 스팸 필터를 우회해 실제 스팸을 보내는 용도로 쓰지 않습니다.

- **보내는 일은 항상 사람이 합니다.** 웹은 문자 앱을 본문이 채워진 채로 열 뿐이고, 자동 전송, 대량 생성, 일괄 처리 기능은 의도적으로 제공하지 않습니다.
- 템플릿은 실제 기관이나 발신자를 사칭하지 않도록 작성합니다.
- 변환은 사용자의 기기 안에서 일어나고 입력은 서버로 전송되지 않습니다.

## 라이선스

소스 코드는 [Apache License 2.0](./LICENSE)을 따릅니다. 저작권 고지는 [NOTICE](./NOTICE)에 있습니다.

## 출처와 감사

이 프로젝트는 [밍피디(mingpd)](https://github.com/mingpd)님이 2019년에 블로그에 공개한 스팸체 변환 데모 `spammaker`에서 아이디어를 얻었습니다. 멋진 아이디어를 공유해 주셔서 감사합니다.

원작은 사용 조건(라이선스)을 따로 밝히지 않았으므로 원작의 소스 코드는 가져오지 않았습니다. 이 저장소의 현재 소스와 배포 패키지(npm, PyPI)는 TypeScript와 Python으로 새로 작성한 구현이며, 템플릿과 웹 화면도 이 프로젝트에서 새로 만들었습니다.
