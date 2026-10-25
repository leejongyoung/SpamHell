import {
  TEMPLATE_KINDS,
  TEMPLATE_LABELS,
  getTemplate,
  toKorean,
  toSpam,
  type TemplateKind,
} from 'spamhell';
import { renderCard } from './card';
import { icon, type IconName } from './icons';
import { LMS_LIMIT, SMS_LIMIT, detectSmsPlatform, smsBytes, smsHref, smsKind } from './sms';
import { aiTabs, installTabs, mountTabs, ruleExamples } from './usage';
import './style.css';

function must<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

// `data-icon="send"` 같은 자리 표시를 인라인 SVG로 바꾼다.
document.querySelectorAll<HTMLElement>('[data-icon]').forEach((slot) => {
  slot.outerHTML = icon(slot.dataset.icon as IconName, 20);
});

const source = must<HTMLTextAreaElement>('#source');
const recipient = must<HTMLInputElement>('#recipient');
const seedInput = must<HTMLInputElement>('#seed');
const seedLabel = must<HTMLElement>('#seed-label');
const outBubble = must<HTMLElement>('#out-bubble');
const outHint = must<HTMLElement>('#out-hint');
const counter = must<HTMLElement>('#counter');
const sendButton = must<HTMLButtonElement>('#send');
const toast = must<HTMLElement>('#toast');
const templatesHost = must<HTMLElement>('#templates');

sendButton.innerHTML = icon('send', 22);

type Mode = 'spam' | 'korean';
const state: { mode: Mode; template: TemplateKind | null; roll: number } = {
  mode: 'spam',
  template: null,
  roll: newRoll(),
};

function newRoll(): number {
  return Math.floor(Math.random() * 1_000_000);
}

/** 시드 칸이 비어 있으면 굴린 값을 쓴다. 숫자 42와 문자열 "42"는 같은 시드다. */
function currentSeed(): string | number {
  const manual = seedInput.value.trim();
  return manual === '' ? state.roll : manual;
}

/** 지금 보낼 최종 문자. 입력도 템플릿도 없으면 빈 문자열. */
function compute(): string {
  const seed = currentSeed();
  if (state.template) return getTemplate(state.template, { seed });
  const text = source.value;
  if (!text.trim()) return '';
  return state.mode === 'korean' ? toKorean(text, { seed }) : toSpam(text, { seed });
}

let toastTimer: number | undefined;
function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2600);
}

let current = '';
function render(): void {
  current = compute();
  outBubble.textContent = current || '아래에 답장을 써 보세요';
  outBubble.classList.toggle('is-empty', current === '');
  outHint.textContent = state.template ? `템플릿 · ${TEMPLATE_LABELS[state.template]}` : state.mode === 'korean' ? '한국인체 미리보기' : '스팸체 미리보기';
  sendButton.disabled = current === '';

  const bytes = smsBytes(current);
  const kind = smsKind(bytes);
  counter.textContent =
    current === ''
      ? ''
      : kind === 'OVER'
        ? `너무 깁니다 ${bytes}/${LMS_LIMIT}바이트`
        : `${kind} ${bytes}/${kind === 'SMS' ? SMS_LIMIT : LMS_LIMIT}바이트`;
  counter.classList.toggle('is-over', kind === 'OVER');

  seedLabel.textContent = `#${currentSeed()}`;
  templatesHost.querySelectorAll<HTMLButtonElement>('.chip').forEach((chip) => {
    chip.setAttribute('aria-pressed', String(chip.dataset.kind === state.template));
  });
}

function autoGrow(): void {
  source.style.height = 'auto';
  source.style.height = `${Math.min(source.scrollHeight, 132)}px`;
}

// 퀵 템플릿
for (const kind of TEMPLATE_KINDS) {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'chip';
  chip.dataset.kind = kind;
  chip.textContent = TEMPLATE_LABELS[kind];
  chip.addEventListener('click', () => {
    state.template = state.template === kind ? null : kind;
    if (state.template) state.roll = newRoll();
    render();
  });
  templatesHost.append(chip);
}

source.addEventListener('input', () => {
  state.template = null;
  autoGrow();
  render();
});
seedInput.addEventListener('input', render);
document.querySelectorAll<HTMLInputElement>('input[name="mode"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    if (!radio.checked) return;
    state.mode = radio.value as Mode;
    state.template = null;
    render();
  });
});

must('#reroll').addEventListener('click', () => {
  seedInput.value = '';
  state.roll = newRoll();
  render();
});

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    showToast('복사했어요.');
  } catch {
    showToast('자동 복사에 실패했어요. 글을 길게 눌러 직접 복사해 주세요.');
  }
}

must('#copy').addEventListener('click', () => {
  if (!current) return showToast('복사할 글이 없어요.');
  void copyText(current);
});

// 문자 앱으로 보내기: 본문이 채워진 기본 문자 앱을 열 뿐이고, 전송은 사용자가 앱에서 직접 누른다.
must<HTMLFormElement>('#compose').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!current) return showToast('먼저 답장을 써 주세요.');
  const href = smsHref({
    to: recipient.value,
    body: current,
    platform: detectSmsPlatform({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints,
    }),
  });
  const link = document.createElement('a');
  link.href = href;
  link.click();
  showToast('문자 앱으로 이동해요. 보내기는 문자 앱에서 직접 눌러 주세요.');
});

// 이미지 카드: 공유 시트(MMS 첨부)를 지원하면 공유하고, 아니면 PNG로 저장한다.
const shareButton = must<HTMLButtonElement>('#share');
shareButton.addEventListener('click', async () => {
  if (!current) return showToast('먼저 글을 만들어 주세요.');
  shareButton.disabled = true;
  try {
    const blob = await renderCard(current, `${import.meta.env.BASE_URL}logo.svg`);
    const file = new File([blob], `spamhell_${Date.now()}.png`, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (error) {
        if ((error as DOMException).name === 'AbortError') return;
      }
    }
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Image generation failed', error);
    showToast('이미지를 만들지 못했어요.');
  } finally {
    shareButton.disabled = false;
  }
});

// 원리 카드 (예시는 실제 변환 결과)
const rules = must<HTMLElement>('#rules');
for (const rule of ruleExamples()) {
  const card = document.createElement('article');
  card.className = 'rule';
  const title = document.createElement('h3');
  title.textContent = rule.title;
  const body = document.createElement('p');
  body.textContent = rule.body;
  const demo = document.createElement('p');
  demo.className = 'rule-demo';
  const before = document.createElement('span');
  before.textContent = rule.before;
  const arrow = document.createElement('span');
  arrow.className = 'rule-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '→';
  const after = document.createElement('strong');
  after.textContent = rule.after;
  demo.append(before, arrow, after);
  card.append(title, body, demo);
  rules.append(card);
}

mountTabs(must('#use-tabs'), installTabs(), (text) => void copyText(text));
mountTabs(must('#ai-tabs'), aiTabs(), (text) => void copyText(text));

autoGrow();
render();
