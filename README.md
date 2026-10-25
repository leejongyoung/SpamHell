# SpamHell

보이스피싱범에게 보내는 역공 메시지를 **스팸체**로 바꿔 주는 도구 모음입니다. 자음 분리, 숫자 변형, 특수문자 삽입 같은 스팸 문자의 시각적 특징을 재현하고, 미리 만든 풍자 템플릿을 제공합니다.

변환 엔진 하나를 세 가지 방식으로 쓸 수 있습니다.

| 구성 | 경로 | 용도 |
| :--- | :--- | :--- |
| 라이브러리 `spamhell` | [`packages/core`](./packages/core) | 코드에서 변환 함수 호출 (TypeScript, 의존성 없음) |
| CLI `spamhell-cli` | [`packages/cli`](./packages/cli) | 터미널과 파이프에서 변환 |
| 웹 데모 | [`apps/web`](./apps/web) | 브라우저 체험, 이미지 카드 저장 · [leejongyoung.github.io/SpamHell](https://leejongyoung.github.io/SpamHell/) |

## 라이브러리

```ts
import { toSpam, toKorean, getTemplate } from 'spamhell';

toSpam('입금 확인 바랍니다', { seed: 42 });
// -> "▼ 입금 확.ㅇㅣㄴ ㅂㅏ랍.니다_\n[거/부] 080-철창행-열차"

toKorean('지금 바로 입금하세요', { seed: 1 });  // -> "지금 바로 ㄹㅇ 입금하세요 ㅠㅠ"
getTemplate('prize', { seed: 1 });             // 템플릿 종류: prize, bot, horror
```

- 같은 `seed`와 입력이면 결과가 항상 같습니다. 숫자 `42`와 문자열 `"42"`는 같은 시드입니다. `rng`로 난수 함수를 직접 넣을 수도 있습니다.
- `toSpam` 옵션은 `disassembleRate`, `dotRate`, `numberRate`, `noiseRate`(각 0~1), `frame`(머리말과 꼬리말 여부)입니다. 범위를 벗어나면 `RangeError`입니다.
- 한글 처리는 완성형 음절(가-힣)만 대상으로 하고, 이모지 같은 비BMP 문자는 그대로 보존합니다.

## CLI

```bash
spamhell "입금 확인 바랍니다"                 # 인자로 입력
echo "지금 바로 입금하세요" | spamhell -m korean   # 표준 입력
spamhell --template prize --seed 7            # 템플릿 출력
spamhell --list-templates
```

| 옵션 | 설명 |
| :--- | :--- |
| `-m, --mode <spam\|korean>` | 변환 방식 (기본 `spam`) |
| `-t, --template <kind>` | 입력 대신 템플릿 출력 |
| `-s, --seed <value>` | 재현 가능한 결과 |
| `-h`, `-v` | 도움말, 버전 |

결과는 표준 출력에만 쓰고, 사용법 오류는 표준 오류와 종료 코드 `2`로 알립니다.

## 개발

Node.js 20 이상 (CI는 22).

```bash
npm ci
npm run typecheck   # 소스와 테스트 타입 검사
npm test            # vitest (core, cli)
npm run build       # core -> cli -> web 순서로 빌드
npm run dev -w @spamhell/web   # 웹 데모 개발 서버 (먼저 build 필요)
```

처음 클론한 뒤에는 `npm run build`를 한 번 실행하고 `npm install`을 다시 실행해야 `spamhell` 명령이 `node_modules/.bin`에 연결됩니다. 연결 없이 쓰려면 `node packages/cli/dist/bin.js`를 실행하면 됩니다.

`main`에 push하면 GitHub Actions가 검사와 테스트, 빌드를 거쳐 `apps/web/dist`를 GitHub Pages에 배포합니다.

## 사용 원칙

이 프로젝트는 보이스피싱에 대한 풍자적 대응 도구입니다. 스팸 필터를 우회해 실제 스팸을 보내는 용도로 쓰지 않습니다. 그래서 발송, 대량 생성, 일괄 처리 기능은 의도적으로 제공하지 않습니다. 템플릿은 실제 기관의 이름이나 발신자를 사칭하지 않도록 작성합니다.

## 권리 관련 메모

- 패키지는 라이선스가 정해지기 전까지 `UNLICENSED`와 `private`입니다. 공개 배포는 라이선스를 정한 뒤에 합니다.
- 웹 데모의 카드 이미지(포돌이)는 경찰청 캐릭터입니다. 이용 조건을 확인하기 전에는 공개 배포 대상에 포함하지 않습니다.
- 원작 `mingpd/spammaker`의 라이선스는 확인하지 못했습니다. 공개 전에 정리가 필요합니다.

## 감사의 글

이 프로젝트는 [밍피디(mingpd)](https://github.com/mingpd)님의 `spammaker`에서 영감을 받았습니다. 멋진 아이디어를 공유해 주셔서 감사합니다.

---

Developed by [leejongyoung](https://github.com/leejongyoung)
