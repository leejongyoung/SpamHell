// "왜 만들었나" 섹션의 데이터. 수치는 2026년 10월 기준 언론 보도(경찰·금융당국 발표 인용)를 정리한 것이다.
// 집계 기관과 범위(발생 기준, 피해자 기준)에 따라 같은 해의 숫자도 다를 수 있으므로, 출처 표기를 함께 둔다.

/** 억원 단위 수를 "1조 2,578억"처럼 읽기 쉽게 바꾼다. */
export function formatEok(eok: number): string {
  const whole = Math.round(eok);
  const jo = Math.floor(whole / 10000);
  const rest = whole % 10000;
  const parts: string[] = [];
  if (jo > 0) parts.push(`${jo.toLocaleString('en-US')}조`);
  if (rest > 0 || jo === 0) parts.push(`${rest.toLocaleString('en-US')}억`);
  return parts.join(' ');
}

/** 만원 단위 수를 "5,384만원"으로. */
export function formatMan(man: number): string {
  return `${Math.round(man).toLocaleString('en-US')}만원`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** 증감률(%)을 소수점 한 자리로. 예: 8545 -> 12578 은 47.2 */
export function growthPercent(from: number, to: number): number {
  return Math.round(((to - from) / from) * 1000) / 10;
}

export interface Stat {
  readonly id: string;
  readonly value: number;
  readonly format: (value: number) => string;
  readonly label: string;
  readonly note: string;
  readonly source: string;
}

export const STATS: readonly Stat[] = [
  {
    id: 'loss-2025',
    value: 12578,
    format: (n) => `${formatEok(n)}원`,
    label: '2025년 피해액',
    note: '사상 처음 1조 원을 넘은 역대 최대 규모',
    source: '폴리스TV 2026-02-16, 신아일보 2026-09-29 등',
  },
  {
    id: 'average',
    value: 5384,
    format: formatMan,
    label: '건당 평균 피해액',
    note: '역대 최대. 2024년에는 약 4,100만원이었습니다',
    source: '매일신문 2026-09-24, MTN 2025-02-24',
  },
  {
    id: 'impersonation',
    value: 80,
    format: formatPercent,
    label: '기관 사칭 비중',
    note: '피해의 대부분이 수사기관·금융기관을 사칭한 수법',
    source: '한국경제 2025-11-24',
  },
  {
    id: 'phone-sms',
    value: 94,
    format: formatPercent,
    label: '전화·문자로 시작',
    note: '모르는 번호의 전화와 문자가 입구입니다',
    source: '광명포스트 2026-09-30',
  },
  {
    id: 'refund',
    value: 26,
    format: formatPercent,
    label: '피해금 환급률',
    note: '약 10만 계좌를 막았는데도 돌려받은 비율은 낮았습니다',
    source: '시사프리즘 2026-09-30',
  },
  {
    id: 'drop-2026',
    value: 43,
    format: formatPercent,
    label: '종합대책 1년, 피해액 감소',
    note: '같은 기간 발생 건수도 약 40% 줄었다는 보도',
    source: '데일리시큐 2026-09-03',
  },
];

/** 연간 피해액 막대 차트(억원). 같은 집계에서 확인된 두 해만 비교한다. */
export const LOSS_BARS: readonly { readonly year: number; readonly eok: number }[] = [
  { year: 2024, eok: 8545 },
  { year: 2025, eok: 12578 },
];

export interface TimelineItem {
  readonly year: string;
  readonly title: string;
  readonly chip: string;
  readonly body: string;
  readonly source: string;
}

export const TIMELINE: readonly TimelineItem[] = [
  {
    year: '2022',
    title: '16년 만의 감소, 수법은 메신저로',
    chip: '피해액 약 -30%',
    body: '피해가 1년 만에 약 30% 줄어 "16년 만의 감소"로 보도됐습니다. 하지만 카카오톡 같은 메신저로 지인을 사칭하는 수법이 메신저 피싱의 대부분이었고, 피해자가 가장 많은 연령대는 20대였습니다.',
    source: '데이터솜 2023-02-03, 조선비즈 2023-03-06, 매일경제 2023-02-21, 국민일보 2023-02-01',
  },
  {
    year: '2023',
    title: '덜 낚이고, 더 많이 털렸다',
    chip: '피해액 +35.4%',
    body: '피해 건수는 줄었지만 한 번 당할 때의 피해가 커졌습니다(1인당 약 1,710만원으로 보도). 택배와 부고 문자에 담긴 링크로 악성 앱을 깔게 하는 수법에 사기주의보가 이어졌습니다.',
    source: '뉴시스·한겨레 2024-03-07, 연합뉴스 2024-01-30',
  },
  {
    year: '2024',
    title: '역대 최대 8,545억원',
    chip: '1인당 약 4,100만원',
    body: '피해액이 당시 사상 최고인 8,545억원을 기록했습니다. "카드 배송" 사칭이 1년 새 75배 늘었고, QR코드를 이용한 수법과 여러 명이 함께 당하는 다중피해 사기가 극성이었습니다.',
    source: '금강일보 2025-07-15, MTN 2025-02-24, 서울경제 2025-01-22',
  },
  {
    year: '2025',
    title: '사상 첫 1조원 돌파',
    chip: '1조 2,578억원',
    body: '10개월 만에 1조 원을 넘겼고 연간 피해액은 1조 2,578억원이 됐습니다. 건당 평균은 5,384만원으로 역대 최대였습니다. 기관 사칭이 약 80%, 시작은 94%가 전화·문자였고 60대 이상이 피해자 세 명 중 한 명이었습니다. AI를 쓴 수법이 늘었다는 보도도 이어졌습니다.',
    source: '조선일보 2025-11-15, 한국경제 2025-11-24, ebn 2025-09-30, 문화일보 2026-05-06',
  },
  {
    year: '2026',
    title: '통합대응단 출범, 감소세로',
    chip: '피해액 약 -43%',
    body: '경찰청 통합대응단과 종합대책이 시작된 뒤 1년 동안 발생 건수는 약 40%, 피해액은 약 43% 줄었다는 보도가 나왔습니다. 7월 피해액은 337억원으로 올해 최저였고, 8월은 전년 대비 76.4% 줄어 11개월째 작년보다 감소하고 있습니다. 다만 줄어든 것은 지난해의 기록적인 수치와 비교한 결과입니다.',
    source: '데일리시큐 2026-09-03, 한국일보 2026-08-25, 뉴데일리 2026-09-29, 머니투데이 2026-09-29',
  },
];

export interface StoryChapter {
  readonly when: string;
  readonly title: string;
  readonly body: string;
}

/** 프로젝트 이력(저장소 커밋 기록)을 바탕으로 한 이야기. */
export const STORY: readonly StoryChapter[] = [
  {
    when: '2022.10',
    title: '장난으로 시작했습니다',
    body: '사기 문자를 닮은 문장으로 되돌려 주면 어떨까 하는 가벼운 생각이었습니다. 밍피디(mingpd)님의 스팸체 변환 데모에서 아이디어를 얻어, 이틀 만에 첫 웹 버전을 만들었습니다.',
  },
  {
    when: '2022 - 2025',
    title: '숫자가 커지는 동안',
    body: '프로젝트는 한동안 손을 못 댔지만, 보이스피싱은 쉬지 않았습니다. 지인 사칭에서 기관 사칭으로, 문자 링크와 QR, AI 음성으로 옮겨 가며 피해액은 해마다 기록을 새로 썼습니다.',
  },
  {
    when: '2026.03',
    title: '다시 만들기',
    body: '낡은 코드를 걷어내고 바닐라 JavaScript로 전면 개편했습니다. 장난감으로 두기엔 현실의 피해가 너무 컸다는 생각이 방향을 바꿨습니다.',
  },
  {
    when: '2026.10',
    title: '어디서나 쓰는 도구로',
    body: '변환 엔진을 라이브러리, CLI, Python, AI(MCP)로 나누고, 휴대폰에서 문자처럼 쓰고 내 문자 앱으로 보내는 화면을 만들었습니다. 흔한 사기 상황 21가지마다 어울리는 답장을 모았습니다.',
  },
];

export const PROMISES: readonly { readonly title: string; readonly body: string }[] = [
  {
    title: '신고가 먼저, 답장은 선택',
    body: '이 도구는 풍자입니다. 사기를 막는 가장 확실한 방법은 통화를 끊고 링크와 앱을 열지 않는 것, 그리고 신고입니다.',
  },
  {
    title: '번호는 도용될 수 있어요',
    body: '발신 번호는 조작되거나 도용된 번호일 수 있습니다. 답장이 엉뚱한 사람에게 가지 않도록, 보내기 전에 한 번 더 생각하세요.',
  },
  {
    title: '보내는 건 사람이',
    body: '자동 전송과 대량 발송은 만들지 않습니다. 문자 앱을 본문이 채워진 채로 열 뿐, 보내는 결정은 항상 사용자가 합니다.',
  },
];

export const REPORT_STEPS: readonly string[] = [
  '의심되면 통화를 끊고 링크와 앱은 열지 않습니다.',
  '이미 송금했다면 즉시 112 또는 거래 금융회사에 지급정지를 요청합니다.',
  '금융감독원 1332에서 상담받고, 스팸 문자는 118(한국인터넷진흥원)에 신고합니다.',
];
