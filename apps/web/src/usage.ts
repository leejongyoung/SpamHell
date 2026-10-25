import { toSpam } from 'spamhell';

export interface TabItem {
  id: string;
  label: string;
  code: string;
}

/** 접근 가능한 탭(좌우 화살표 이동)과 코드 블록, 복사 버튼을 그린다. */
export function mountTabs(host: HTMLElement, items: readonly TabItem[], onCopy: (text: string) => void): void {
  const list = document.createElement('div');
  list.className = 'tab-list';
  list.setAttribute('role', 'tablist');
  host.append(list);

  const tabs: HTMLButtonElement[] = [];
  const panels: HTMLElement[] = [];

  const select = (index: number, focus = false): void => {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i]!.hidden = !selected;
      if (selected && focus) tab.focus();
    });
  };

  items.forEach((item, index) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tab';
    tab.id = `${host.id}-tab-${item.id}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `${host.id}-panel-${item.id}`);
    tab.textContent = item.label;
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', (event) => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (step === 0) return;
      event.preventDefault();
      select((index + step + items.length) % items.length, true);
    });
    list.append(tab);
    tabs.push(tab);

    const panel = document.createElement('div');
    panel.id = `${host.id}-panel-${item.id}`;
    panel.className = 'tab-panel';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = item.code;
    pre.append(code);
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'code-copy';
    copy.textContent = '복사';
    copy.addEventListener('click', () => onCopy(item.code));
    panel.append(pre, copy);
    host.append(panel);
    panels.push(panel);
  });
  select(0);
}

const SAMPLE = '입금 확인 바랍니다';
const SAMPLE_SEED = 42;

/** 설치 탭 내용. 예제 출력은 코어가 실제로 계산한 값이다. */
export function installTabs(): TabItem[] {
  const output = toSpam(SAMPLE, { seed: SAMPLE_SEED });
  const pythonRepr = `'${output.replaceAll('\n', '\\n')}'`;
  return [
    {
      id: 'cli',
      label: 'CLI',
      code: [
        '# npm',
        'npm install -g spamhell-cli',
        `spamhell "${SAMPLE}" --seed ${SAMPLE_SEED}`,
        '',
        '# Python (PyPI 공개 준비 중: 저장소에서 설치)',
        'pip install ./packages/python',
        `spamhell "${SAMPLE}" --seed ${SAMPLE_SEED}`,
        '',
        '# 출력 (두 CLI가 같은 결과)',
        output,
      ].join('\n'),
    },
    {
      id: 'js',
      label: 'JavaScript',
      code: [
        'npm install spamhell',
        '',
        "import { toSpam } from 'spamhell';",
        '',
        `toSpam('${SAMPLE}', { seed: ${SAMPLE_SEED} });`,
        `// ${JSON.stringify(output)}`,
      ].join('\n'),
    },
    {
      id: 'py',
      label: 'Python',
      code: [
        'pip install ./packages/python   # PyPI 공개 준비 중',
        '',
        'from spamhell import to_spam',
        '',
        `to_spam("${SAMPLE}", seed=${SAMPLE_SEED})`,
        `# ${pythonRepr}`,
      ].join('\n'),
    },
  ];
}

/** AI(MCP) 연결 탭 내용. */
export function aiTabs(): TabItem[] {
  return [
    {
      id: 'claude-code',
      label: 'Claude Code',
      code: 'claude mcp add spamhell -- npx -y spamhell-mcp',
    },
    {
      id: 'json',
      label: 'MCP 설정',
      code: JSON.stringify({ mcpServers: { spamhell: { command: 'npx', args: ['-y', 'spamhell-mcp'] } } }, null, 2),
    },
  ];
}

export interface RuleExample {
  title: string;
  body: string;
  before: string;
  after: string;
}

const PLAIN = { disassembleRate: 0, dotRate: 0, numberRate: 0, noiseRate: 0, frame: false } as const;

/** 변환 규칙 설명 카드. 예시는 해당 규칙만 켠 실제 변환 결과다. */
export function ruleExamples(): RuleExample[] {
  return [
    {
      title: '자음 분리',
      body: '글자를 초성, 중성, 종성으로 풀어 필터와 눈을 동시에 괴롭힙니다.',
      before: '안녕하세요',
      after: toSpam('안녕하세요', { ...PLAIN, disassembleRate: 1 }),
    },
    {
      title: '점 삽입',
      body: '붙어 있는 한글 사이에 점을 박아 단어를 끊습니다.',
      before: '입금확인',
      after: toSpam('입금확인', { ...PLAIN, dotRate: 1 }),
    },
    {
      title: '숫자 변형',
      body: '숫자를 글자나 기호로 바꿉니다. 읽을 수는 있지만 검색은 안 됩니다.',
      before: '010-1234',
      after: toSpam('010-1234', { ...PLAIN, numberRate: 1, seed: 3 }),
    },
    {
      title: '머리말과 꼬리말',
      body: '[광.고], [Web발신] 같은 머리말과 수신거부 꼬리말을 붙입니다.',
      before: '확인 바랍니다',
      after: toSpam('확인 바랍니다', { ...PLAIN, frame: true, seed: 5 }),
    },
  ];
}
