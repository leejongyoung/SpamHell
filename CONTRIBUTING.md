# 기여 가이드

SpamHell에 관심을 가져 주셔서 고맙습니다. 버그 제보, 템플릿 제안, 코드 기여 모두 환영합니다. 시작하기 전에 [사용 원칙](#사용-원칙)을 한 번 읽어 주세요.

## 저장소 구조

| 경로 | 내용 |
| :--- | :--- |
| `packages/core` | npm `spamhell`. 변환 엔진(TypeScript). 모든 구현의 기준입니다. |
| `packages/cli` | npm `spamhell-cli`. 명령줄 도구. |
| `packages/mcp` | npm `spamhell-mcp`. AI 비서용 MCP 서버. |
| `packages/python` | PyPI `spamhell`. Python 구현과 CLI. |
| `apps/web` | 홈페이지와 문자 작성기(Vite). |
| `testdata/golden.json` | TS 코어가 만든 기대 출력. JS와 Python이 모두 검증합니다. |
| `assets` | 로고, 아이콘 원본, 소셜 미리보기 이미지. |

## 개발 환경

Node.js 22 이상(CI 기준), Python 3.9 이상, [uv](https://docs.astral.sh/uv/)가 필요합니다.

```bash
npm ci
npm run typecheck   # 소스와 테스트 타입 검사
npm test            # vitest: core, cli, mcp, web 헬퍼, golden
npm run build       # core -> cli -> mcp -> web

cd packages/python
uv run --with pytest python -m pytest   # golden 포함
```

웹을 고칠 때는 먼저 `npm run build`를 한 번 한 뒤 `npm run dev -w @spamhell/web`을 실행합니다.

## 가장 중요한 규칙: 두 구현은 늘 같아야 합니다

변환 규칙이나 템플릿을 바꾸면 **TypeScript(`packages/core/src`)와 Python(`packages/python/src/spamhell`)을 함께** 고쳐야 합니다. 같은 시드에서 어디서나 같은 결과가 나오는 것이 이 프로젝트의 약속입니다.

1. 두 구현을 같은 방식으로 수정합니다. 난수를 소비하는 순서까지 같아야 합니다.
2. 의도한 동작 변경이면 골든 파일을 다시 만듭니다.
   ```bash
   npm run build -w spamhell && node scripts/gen-golden.mjs
   ```
3. `npm test`와 Python 테스트가 모두 통과하는지 확인합니다. 한쪽만 고치면 다른 쪽 골든 테스트가 실패합니다.
4. 골든 파일이 바뀐 이유를 PR 설명에 적어 주세요.

그 밖에 지킬 것이 있습니다.

- `LICENSE`, `NOTICE`는 루트 파일이 기준이고 `packages/*`에 같은 사본이 있습니다. CI가 일치를 검사합니다.
- `assets/logo.svg`, `assets/icon.svg`를 고치면 `apps/web/public/logo.svg`, `apps/web/public/favicon/favicon.svg`도 같은 내용으로 맞춥니다.
- 패키지 버전(`packages/*/package.json`, `packages/python/pyproject.toml`, `packages/python/src/spamhell/__init__.py`)은 함께 올립니다.

## 사용 원칙

이 프로젝트는 보이스피싱에 대한 풍자적 대응 도구입니다. 다음은 받지 않습니다.

- **자동 전송, 대량 생성, 일괄 처리** 기능. 문자 앱을 본문이 채워진 채로 여는 것까지만 하고, 보내는 일은 항상 사람이 합니다.
- **실제 기관, 회사, 개인을 사칭하는** 템플릿이나 문구. 경찰, 금융기관, 통신사 등의 이름이나 발신자를 쓰지 않습니다.
- **스팸 필터 우회 목적**의 기능이나 옵션.
- 서버 전송, 추적, 분석(telemetry) 코드. 변환은 항상 사용자의 기기 안에서 일어납니다.

## 템플릿 기여

템플릿은 `packages/core/src/templates.ts`와 `packages/python/src/spamhell/_templates.py`에 같은 순서로 넣습니다.

- 풍자로 읽혀야 합니다. 협박이나 욕설, 개인정보, 실제 전화번호와 주소는 넣지 않습니다.
- 종류(`prize`, `bot`, `horror`)마다 변형을 추가하되, 기존 변형의 순서를 바꾸면 같은 시드의 결과가 달라집니다. 새 변형은 맨 뒤에 추가하세요.

## 풀 리퀘스트

- 작게, 하나의 목적으로 만들어 주세요.
- 버그 수정에는 실패하던 테스트를 함께 넣어 주세요.
- 새 동작에는 경계 조건을 확인하는 테스트를 넣어 주세요. 구현을 그대로 되풀이하는 테스트는 피합니다.
- 커밋 메시지는 `feat(core): ...`, `fix(python): ...`, `docs: ...`처럼 범위와 요약을 앞에 둡니다.
- PR 전에 `npm run typecheck`, `npm test`, `npm run build`, Python 테스트가 통과하는지 확인합니다.

## 이슈

- 버그: 입력, 시드, 기대한 결과와 실제 결과, 사용한 환경(Node/Python 버전, 브라우저)을 알려 주세요.
- **보안 문제는 공개 이슈에 올리지 마세요.** [SECURITY.md](./SECURITY.md)의 절차를 따라 주세요.

## 라이선스

기여한 코드는 이 저장소와 같은 [Apache License 2.0](./LICENSE)으로 제공됩니다.
