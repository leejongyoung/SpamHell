# spamhell

보이스피싱범에게 보내는 역공 메시지를 **스팸체**로 바꾸는 TypeScript/JavaScript 라이브러리입니다. 의존성이 없고 Node.js 20 이상과 번들러 환경에서 동작하는 ESM 패키지입니다.

[Python 패키지](https://github.com/leejongyoung/SpamHell/tree/main/packages/python)와 **같은 시드에서 같은 결과**를 냅니다. 명령줄에서는 [`spamhell-cli`](https://www.npmjs.com/package/spamhell-cli)를 쓰세요.

## 설치

```bash
npm install spamhell
```

## 사용

```ts
import { toSpam, toKorean, getTemplate } from 'spamhell';

toSpam('입금 확인 바랍니다', { seed: 42 });
// -> "▼ 입금 확.ㅇㅣㄴ ㅂㅏ랍.니다_\n[거/부] 080-철창행-열차"

toKorean('지금 바로 입금하세요', { seed: 1 });  // -> "지금 바로 ㄹㅇ 입금하세요 ㅠㅠ"
getTemplate('prize', { seed: 1 });             // 템플릿 종류: prize, bot, horror
```

- `seed`(숫자 또는 문자열)를 주면 결과가 항상 같습니다. `42`와 `"42"`는 같은 시드입니다. `rng`로 난수 함수를 직접 넣을 수도 있습니다.
- `toSpam` 옵션: `disassembleRate`, `dotRate`, `numberRate`, `noiseRate`(각 0~1, 벗어나면 `RangeError`), `frame`(머리말과 꼬리말 여부).
- 한글은 완성형 음절(가-힣)만 변환하고 이모지 같은 문자는 그대로 둡니다.

## 사용 원칙

보이스피싱에 대한 풍자적 대응 도구입니다. 스팸 필터를 우회해 실제 스팸을 보내는 용도로 쓰지 않으며, 발송과 대량 생성 기능은 제공하지 않습니다.

## 라이선스

Apache License 2.0. 자세한 내용은 [저장소](https://github.com/leejongyoung/SpamHell)를 참고하세요.
