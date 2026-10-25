# spamhell-mcp

[`spamhell`](https://www.npmjs.com/package/spamhell) 변환 엔진을 AI 어시스턴트가 호출할 수 있게 해 주는 [MCP(Model Context Protocol)](https://modelcontextprotocol.io) 서버입니다. 보이스피싱범에게 보내는 역공 메시지를 **스팸체**로 바꾸거나 풍자 템플릿을 받아 옵니다. 표준 입출력(stdio)으로 동작하며, 네트워크·파일·환경 변수는 사용하지 않습니다.

## 설치

설치 없이 바로 실행할 수 있습니다.

```bash
npx -y spamhell-mcp
```

### 클라이언트 설정

Claude Desktop의 `claude_desktop_config.json`, 또는 stdio MCP 서버를 지원하는 다른 클라이언트의 설정에 다음을 추가합니다.

```json
{
  "mcpServers": {
    "spamhell": {
      "command": "npx",
      "args": ["-y", "spamhell-mcp"]
    }
  }
}
```

## 도구

| 도구 | 설명 |
| :--- | :--- |
| `spamhell_transform` | 문장을 스팸체(`spam`) 또는 띄어쓰기 변환(`korean`)으로 바꿉니다. |
| `spamhell_template` | 종류별 템플릿 메시지 하나를 돌려줍니다. |
| `spamhell_list_templates` | 템플릿 종류와 한국어 이름을 나열합니다. |

모든 도구는 읽기 전용이며 같은 입력과 시드에서 같은 결과를 냅니다. 결과는 텍스트뿐이고, 잘못된 입력은 오류 없이 `isError` 결과로 알립니다.

### `spamhell_transform`

| 인자 | 설명 |
| :--- | :--- |
| `text` | 변환할 문장, 1자 이상 2000자 이하 (필수) |
| `mode` | `spam`(기본) 또는 `korean` |
| `seed` | 재현 가능한 결과를 위한 문자열 또는 숫자. 생략하면 무작위 |
| `frame` | `spam` 모드에서 장식 틀 사용 여부 (기본 `true`) |
| `disassembleRate`, `dotRate`, `numberRate`, `noiseRate` | `spam` 모드 변환 확률, 0 이상 1 이하 |

호출 예:

```json
{ "name": "spamhell_transform", "arguments": { "text": "입금 확인 바랍니다", "seed": 42 } }
```

결과:

```text
▼ 입금 확.ㅇㅣㄴ ㅂㅏ랍.니다_
[거/부] 080-철창행-열차
```

### `spamhell_template`

`kind`(`prize`, `bot`, `horror`)와 선택 인자 `seed`를 받습니다. 템플릿은 실제 기관을 사칭하지 않습니다.

```json
{ "name": "spamhell_template", "arguments": { "kind": "prize", "seed": 7 } }
```

### `spamhell_list_templates`

인자가 없으며 `종류: 한국어 이름` 형식으로 한 줄씩 돌려줍니다.

## 사용 원칙

보이스피싱에 대한 풍자적 대응 도구입니다. 스팸 필터를 우회해 실제 스팸을 보내는 용도로 쓰지 않으며, 발송과 대량 생성 기능은 제공하지 않습니다. 결과는 항상 텍스트로만 돌려줍니다.

## 라이선스

Apache License 2.0. 자세한 내용은 [저장소](https://github.com/leejongyoung/SpamHell)를 참고하세요.
