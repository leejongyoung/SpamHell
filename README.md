# 🚨 SpamHell - Anti-Phishing Workbench

**SpamHell**은 보이스피싱범들을 당혹스럽게 만들고 역공하기 위한 **'스팸체 생성기'**이자 **'사이버 보안 워크벤치'**입니다. 래거시 프로젝트를 현대적인 Vanilla JS와 세련된 Cyber-UI로 전면 개편하여, 실질적인 대응 도구로 재탄생시켰습니다.

## ✨ 주요 기능 (Key Features)

- **스팸체 변환 프로토콜:** 한글 자음 분리, 교묘한 숫자 변형, 특수문자 과다 사용 등 스팸의 시각적 요소를 완벽하게 구현합니다.
- **퀵 템플릿 시스템:** 당첨형, AI 봇 코스프레형, 정신 공격형 등 검증된 3가지 유형의 역공 멘트를 무작위로 생성합니다.
- **MMS 이미지 카드 제작:** 생성된 텍스트와 포돌이(Police) 이미지를 결합한 직사각형 카드를 실시간으로 미리보고 이미지로 저장할 수 있습니다.
- **Single-Screen UI:** PC 화면에서 스크롤 없이 모든 작업(입력-결과-저장)을 한눈에 처리할 수 있는 컴팩트한 레이아웃을 제공합니다.
- **모바일 최적화:** 블로그 스타일의 세로형 배치를 통해 모바일 환경에서도 쾌적한 사용이 가능합니다.

## 🛠️ 스팸체 핵심 공식 (Visual Identity)

1.  **특수문자 남용:** `[광.고]`, `◈`, `▶`, `※` 등을 문장 앞뒤와 중간에 전략적으로 배치합니다.
2.  **강제 자음 분리:** `안녕` → `안ㄴㅕㅇ`과 같이 확률적으로 자음을 분리하거나 `입.금` 처럼 점을 삽입합니다.
3.  **교묘한 숫자 변형:** `0` → `O/영`, `1` → `l/!` 등 가독성을 해치지 않으면서 필터를 피하는 변형을 적용합니다.

## 🚀 시작하기 (How to Use)

1.  `index.html` 파일을 웹 브라우저로 엽니다.
2.  **메시지 입력하기:** 사기꾼에게 보낼 멘트를 직접 입력하거나 **퀵 템플릿** 중 하나를 선택합니다.
3.  **변환 및 복사:** `스팸체 변환` 버튼을 누르고 결과물을 복사하여 문자로 전송합니다.
4.  **이미지 저장:** 하단의 **이미지 출력 결과**에서 생성된 카드를 `이미지 저장` 버튼으로 다운로드하여 MMS에 첨부합니다.

## 🏗️ 프로젝트 구조 (Project Structure)

```text
/
├── index.html          # 메인 레이아웃 및 대시보드 구조
├── css/
│   └── style.css       # 사이버 보안 테마 및 반응형 디자인
├── js/
│   ├── spammaker.js    # 스팸 변환 핵심 로직 엔진
│   └── main.js         # UI 인터랙션 및 이미지 캡처 제어
└── assets/
    ├── images/
    │   └── police.png  # 정의구현 포돌이 공식 이미지
    └── favicon/        # 프로젝트 파비콘 에셋
```

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (Vanilla)
- **Library:** 
  - [jQuery](https://jquery.com/) (DOM Control)
  - [Bootstrap 5](https://getbootstrap.com/) (Grid System)
  - [Clipboard.js](https://clipboardjs.com/) (Text Copy)
  - [html2canvas](https://html2canvas.hertzen.com/) (Image Generation)

## 👮‍♂️ 저작권 및 응원 (Copyright)

© 2026 **SPAMHELL**. All Rights Reserved.
이 프로젝트는 보이스피싱 근절을 진심으로 응원합니다.

## 🙏 감사의 글 (Acknowledgment)

이 프로젝트는 **[밍피디(mingpd)](https://github.com/mingpd)**님의 **[spammaker](https://github.com/mingpd/spammaker)** 프로젝트에서 영감을 받아 제작되었으며, 기존 로직을 기반으로 현대적인 웹 기술과 새로운 UI/UX를 적용하여 개편되었습니다. 멋진 아이디어를 공유해주신 밍피디님께 감사드립니다.

---
*Developed by [leejongyoung](https://github.com/leejongyoung)*
