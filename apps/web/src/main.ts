import { TEMPLATE_KINDS, TEMPLATE_LABELS, getTemplate, toKorean, toSpam } from 'spamhell';
import './style.css';

function must<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

const source = must<HTMLTextAreaElement>('#text-source');
const seedInput = must<HTMLInputElement>('#seed');
const result = must<HTMLTextAreaElement>('#text-transformed');
const preview = must<HTMLElement>('#preview-text-target');
const saveButton = must<HTMLButtonElement>('#btn-save-image');
const toast = must<HTMLElement>('#toast');

const PREVIEW_PLACEHOLDER = '변환된 메시지 미리보기';
let toastTimer: number | undefined;

function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2200);
}

async function copyText(text: string, fallbackTarget?: HTMLTextAreaElement): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    showToast('복사했습니다.');
  } catch {
    fallbackTarget?.select();
    showToast('자동 복사에 실패했습니다. 선택된 텍스트를 직접 복사해주세요.');
  }
}

/** 시드 칸이 비어 있으면 매번 다른 결과(undefined). 숫자 42와 문자열 "42"는 같은 시드다. */
function currentSeed(): string | undefined {
  const value = seedInput.value.trim();
  return value === '' ? undefined : value;
}

function setResult(text: string): void {
  result.value = text;
  preview.textContent = text || PREVIEW_PLACEHOLDER;
}

// 퀵 템플릿 버튼은 코어가 가진 종류와 이름에서 만든다.
const templateList = must<HTMLElement>('#template-list');
for (const kind of TEMPLATE_KINDS) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'chip';
  button.textContent = TEMPLATE_LABELS[kind];
  button.addEventListener('click', () => setResult(getTemplate(kind, { seed: currentSeed() })));
  templateList.append(button);
}

document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!source.value.trim()) {
      showToast('메시지를 먼저 입력해주세요.');
      source.focus();
      return;
    }
    const seed = currentSeed();
    setResult(button.dataset.mode === 'korean' ? toKorean(source.value, { seed }) : toSpam(source.value, { seed }));
  });
});

must('#btn-reset').addEventListener('click', () => {
  source.value = '';
  seedInput.value = '';
  setResult('');
});

must('#btn-copy').addEventListener('click', () => {
  if (!result.value) {
    showToast('복사할 결과가 없습니다.');
    return;
  }
  void copyText(result.value, result);
});

saveButton.addEventListener('click', async () => {
  if (!result.value) {
    showToast('먼저 메시지를 변환해주세요.');
    return;
  }
  const original = saveButton.textContent;
  saveButton.textContent = '이미지 생성 중...';
  saveButton.disabled = true;
  try {
    // 이미지 저장을 누를 때만 html2canvas를 내려받는다.
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(must('#combined-card-area'), {
      useCORS: true,
      backgroundColor: '#ffffff',
      scale: 2,
    });
    const link = document.createElement('a');
    link.download = `spamhell_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Image generation failed', error);
    showToast('이미지 생성에 실패했습니다.');
  } finally {
    saveButton.textContent = original;
    saveButton.disabled = false;
  }
});

// --- 사용하기: CLI / JavaScript / Python 예제 (출력은 실제 코어로 계산한다) ---
const SAMPLE = '입금 확인 바랍니다';
const SAMPLE_SEED = 42;
const sampleOutput = toSpam(SAMPLE, { seed: SAMPLE_SEED });
const pythonRepr = `'${sampleOutput.replaceAll('\n', '\\n')}'`;

const USAGE = [
  {
    id: 'cli',
    label: 'CLI',
    code: [
      '# npm',
      'npm install -g spamhell-cli',
      `spamhell "${SAMPLE}" --seed ${SAMPLE_SEED}`,
      '',
      '# Python',
      'pip install spamhell',
      `spamhell "${SAMPLE}" --seed ${SAMPLE_SEED}`,
      '',
      '# 출력 (두 CLI가 같은 결과)',
      sampleOutput,
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
      `// ${JSON.stringify(sampleOutput)}`,
    ].join('\n'),
  },
  {
    id: 'py',
    label: 'Python',
    code: [
      'pip install spamhell',
      '',
      'from spamhell import to_spam',
      '',
      `to_spam("${SAMPLE}", seed=${SAMPLE_SEED})`,
      `# ${pythonRepr}`,
    ].join('\n'),
  },
] as const;

const tabList = must<HTMLElement>('#use-tabs');
const panels = must<HTMLElement>('#use-panels');
const tabButtons: HTMLButtonElement[] = [];
const panelElements: HTMLElement[] = [];

function selectTab(index: number, focus = false): void {
  tabButtons.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    panelElements[i]!.hidden = !selected;
    if (selected && focus) tab.focus();
  });
}

USAGE.forEach((usage, index) => {
  const tab = document.createElement('button');
  tab.type = 'button';
  tab.className = 'tab';
  tab.id = `tab-${usage.id}`;
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', `panel-${usage.id}`);
  tab.textContent = usage.label;
  tab.addEventListener('click', () => selectTab(index));
  tab.addEventListener('keydown', (event) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    selectTab((index + step + USAGE.length) % USAGE.length, true);
  });
  tabList.append(tab);
  tabButtons.push(tab);

  const panel = document.createElement('div');
  panel.id = `panel-${usage.id}`;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', tab.id);
  const pre = document.createElement('pre');
  pre.className = 'code';
  const code = document.createElement('code');
  code.textContent = usage.code;
  pre.append(code);
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'btn btn-outline code-copy';
  copy.textContent = '코드 복사';
  copy.addEventListener('click', () => void copyText(usage.code));
  panel.append(pre, copy);
  panels.append(panel);
  panelElements.push(panel);
});
selectTab(0);
