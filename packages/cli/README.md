# spamhell-cli

보이스피싱범에게 보내는 역공 메시지를 **스팸체**로 바꾸는 명령줄 도구입니다. 변환 엔진은 [`spamhell`](https://www.npmjs.com/package/spamhell) 패키지이고, Python 버전([`spamhell` on PyPI](https://pypi.org/project/spamhell/))과 같은 옵션, 같은 시드에서 같은 결과를 냅니다.

## 설치

```bash
npm install -g spamhell-cli     # 전역 설치
npx spamhell-cli "입금 확인 바랍니다"   # 설치 없이 실행 (명령 이름은 spamhell)
```

## 사용

```bash
spamhell "입금 확인 바랍니다"
echo "지금 바로 입금하세요" | spamhell --mode korean --seed 7
spamhell --template prize --seed 7
spamhell --list-templates
```

| 옵션 | 설명 |
| :--- | :--- |
| `-m, --mode <spam\|korean>` | 변환 방식 (기본 `spam`) |
| `-t, --template <kind>` | 입력 대신 템플릿 출력 (`prize`, `bot`, `horror`) |
| `-s, --seed <value>` | 재현 가능한 결과 |
| `-h`, `-v` | 도움말, 버전 |

결과는 표준 출력에만 쓰고, 사용법 오류는 표준 오류와 종료 코드 `2`로 알립니다.

## 사용 원칙

보이스피싱에 대한 풍자적 대응 도구입니다. 스팸 필터를 우회해 실제 스팸을 보내는 용도로 쓰지 않으며, 발송과 대량 생성 기능은 제공하지 않습니다.

## 라이선스

Apache License 2.0. 자세한 내용은 [저장소](https://github.com/leejongyoung/SpamHell)를 참고하세요.
