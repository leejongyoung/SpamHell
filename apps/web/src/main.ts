import {
  SITUATIONS,
  TEMPLATE_KINDS,
  TEMPLATE_LABELS,
  getReply,
  getReplyLine,
  getSituation,
  getTemplate,
  matchSituation,
  toKorean,
  toSpam,
  type SituationId,
  type TemplateKind,
} from 'spamhell';
import { renderCard } from './card';
import { icon, type IconName } from './icons';
import { LMS_LIMIT, SMS_LIMIT, detectSmsPlatform, smsBytes, smsHref, smsKind } from './sms';
import { initTheme } from './theme';
import {
  LOSS_BARS,
  PROMISES,
  REPORT_STEPS,
  STATS,
  STORY,
  TIMELINE,
  formatEok,
  growthPercent,
  type Stat,
} from './background';
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

initTheme(must<HTMLButtonElement>('#theme-toggle'));

const source = must<HTMLTextAreaElement>('#source');
const recipient = must<HTMLInputElement>('#recipient');
const seedInput = must<HTMLInputElement>('#seed');
const seedLabel = must<HTMLElement>('#seed-label');
const inBubble = must<HTMLElement>('#in-bubble');
const inHint = must<HTMLElement>('#in-hint');
const outBubble = must<HTMLElement>('#out-bubble');
const outHint = must<HTMLElement>('#out-hint');
const counter = must<HTMLElement>('#counter');
const sendButton = must<HTMLButtonElement>('#send');
const rerollButton = must<HTMLButtonElement>('#reroll');
const toast = must<HTMLElement>('#toast');
const situationsHost = must<HTMLElement>('#situations');
const templatesHost = must<HTMLElement>('#templates');
const pasteInput = must<HTMLTextAreaElement>('#incoming-input');
const pasteStatus = must<HTMLElement>('#paste-status');

sendButton.innerHTML = icon('send', 22);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

type Mode = 'spam' | 'korean';
const state: {
  mode: Mode;
  template: TemplateKind | null;
  situation: SituationId | null;
  roll: number;
  /** 상황을 고를 때 입력창에 자동으로 채운 문구. 사용자가 고치면 더는 자동으로 바꾸지 않는다. */
  autoLine: string;
  /** 사용자가 붙여넣은 받은 문자. 비어 있으면 상황 예시를 쓴다. */
  pasted: string;
} = {
  mode: 'spam',
  template: null,
  situation: null,
  roll: newRoll(),
  autoLine: '',
  pasted: '',
};

function newRoll(): number {
  return Math.floor(Math.random() * 1_000_000);
}

/** 시드 칸이 비어 있으면 굴린 값을 쓴다. 숫자 42와 문자열 "42"는 같은 시드다. */
function currentSeed(): string | number {
  const manual = seedInput.value.trim();
  return manual === '' ? state.roll : manual;
}

/** 입력창이 자동 채움 그대로인지(또는 비었는지). 그럴 때만 굴림이 입력창을 바꾼다. */
function inputIsAuto(): boolean {
  return source.value === '' || source.value === state.autoLine;
}

/** 상황이 선택돼 있고 입력창이 자동 채움 상태면 현재 시드에 맞는 답장 문구로 다시 채운다. */
function syncAutoLine(): void {
  if (!state.situation || !inputIsAuto()) return;
  state.autoLine = getReplyLine(state.situation, { seed: currentSeed() });
  source.value = state.autoLine;
  growTextarea(source);
}

/** 지금 보낼 최종 문자. 입력도 템플릿도 없으면 빈 문자열. */
function compute(): string {
  const seed = currentSeed();
  if (state.template) return getTemplate(state.template, { seed });
  const text = source.value;
  if (!text.trim()) return '';
  // 자동 채움 그대로면 CLI/Python의 `--situation`과 같은 결과가 나오도록 한 번에 처리한다.
  if (state.situation && text === state.autoLine) return getReply(state.situation, { mode: state.mode, seed });
  return state.mode === 'korean' ? toKorean(text, { seed }) : toSpam(text, { seed });
}

let toastTimer: number | undefined;
function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2600);
}

/** 같은 요소에 애니메이션 클래스를 다시 걸어 한 번 더 재생한다. */
function replay(element: HTMLElement, className: string): void {
  if (reducedMotion.matches) return;
  element.classList.remove(className);
  void element.offsetWidth; // 강제 리플로우로 애니메이션을 처음부터 다시 시작
  element.classList.add(className);
}

let current = '';
function render(): void {
  const previous = current;
  current = compute();

  const incomingText = state.pasted || (state.situation ? getSituation(state.situation).incoming : SITUATIONS[0].incoming);
  inBubble.textContent = incomingText;
  inHint.textContent = state.pasted
    ? state.situation
      ? `받은 문자 · ${getSituation(state.situation).label}`
      : '받은 문자'
    : state.situation
      ? `예시 수신 문자 · ${getSituation(state.situation).label}`
      : '예시 수신 문자';

  outBubble.textContent = current || '아래에 답장을 써 보세요';
  outBubble.classList.toggle('is-empty', current === '');
  if (current !== '' && current !== previous) replay(outBubble, 'pop');
  outHint.textContent = state.template
    ? `템플릿 · ${TEMPLATE_LABELS[state.template]}`
    : state.mode === 'korean'
      ? '한국인체 미리보기'
      : '스팸체 미리보기';
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
  situationsHost.querySelectorAll<HTMLButtonElement>('.chip').forEach((chip) => {
    chip.setAttribute('aria-pressed', String(chip.dataset.id === state.situation && !state.template));
  });
  templatesHost.querySelectorAll<HTMLButtonElement>('.chip').forEach((chip) => {
    chip.setAttribute('aria-pressed', String(chip.dataset.kind === state.template));
  });
}

/** 입력창을 내용 높이에 맞춰 늘린다. 문자 앱처럼 안에서 스크롤하지 않고 창 자체가 커진다. */
function growTextarea(element: HTMLTextAreaElement): void {
  element.style.height = 'auto';
  // border-box라서 scrollHeight에 테두리 두께를 더해야 줄이 잘리지 않는다.
  element.style.height = `${element.scrollHeight + element.offsetHeight - element.clientHeight}px`;
}

function selectSituation(id: SituationId | null, options: { fill: boolean }): void {
  state.situation = id;
  state.template = null;
  if (id && options.fill) {
    state.roll = newRoll();
    seedInput.value = '';
    // 자동 채움이 아닌 사용자 글은 덮어쓰지 않는다.
    syncAutoLine();
  }
  render();
}

// 상황 칩: 받은 문자의 맥락을 정하고, 그에 맞는 답장을 입력창에 채운다.
for (const situation of SITUATIONS) {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'chip';
  chip.dataset.id = situation.id;
  chip.textContent = situation.label;
  chip.addEventListener('click', () => {
    const next = state.situation === situation.id && !state.template ? null : situation.id;
    if (next === null) selectSituation(null, { fill: false });
    else selectSituation(next, { fill: true });
    replay(inBubble, 'pop');
  });
  situationsHost.append(chip);
}

// 스타일 칩: 미리 만든 완성형 템플릿.
for (const kind of TEMPLATE_KINDS) {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'chip chip-style';
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
  growTextarea(source);
  render();
});
// 화면 너비가 바뀌면 줄 바꿈이 달라지므로 높이를 다시 잰다.
window.addEventListener('resize', () => {
  growTextarea(source);
  growTextarea(pasteInput);
});
seedInput.addEventListener('input', () => {
  syncAutoLine();
  render();
});
document.querySelectorAll<HTMLInputElement>('input[name="mode"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    if (!radio.checked) return;
    state.mode = radio.value as Mode;
    state.template = null;
    render();
  });
});

rerollButton.addEventListener('click', () => {
  seedInput.value = '';
  state.roll = newRoll();
  syncAutoLine();
  render();
  replay(rerollButton, 'spin');
});

// 받은 문자를 붙여넣으면 상황을 찾아 그에 맞게 고른다 (브라우저 안에서만 처리).
let pasteTimer: number | undefined;
pasteInput.addEventListener('input', () => {
  growTextarea(pasteInput);
  window.clearTimeout(pasteTimer);
  pasteTimer = window.setTimeout(() => {
    state.pasted = pasteInput.value.trim();
    if (!state.pasted) {
      pasteStatus.textContent = '';
      render();
      return;
    }
    const found = matchSituation(state.pasted);
    if (found) {
      pasteStatus.textContent = `'${getSituation(found).label}' 상황으로 보여요.`;
      selectSituation(found, { fill: found !== state.situation });
    } else {
      pasteStatus.textContent = '딱 맞는 상황을 찾지 못했어요. 상황을 직접 고르거나 답장을 써 보세요.';
      render();
    }
    replay(inBubble, 'pop');
  }, 250);
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
  replay(sendButton, 'whoosh');
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

// 상황별 레퍼런스 카드: 누르면 작성기에서 그 상황으로 바로 써 볼 수 있다.
const totalReplies = SITUATIONS.reduce((sum, situation) => sum + situation.replies.length, 0);
must('#reference-lead').textContent = `흔한 사기 문자 ${SITUATIONS.length}가지 상황마다 어울리는 답장 ${totalReplies}개를 준비했어요. 카드를 누르면 작성기에서 바로 써 볼 수 있어요.`;
const refGrid = must<HTMLElement>('#ref-grid');
for (const situation of SITUATIONS) {
  const card = document.createElement('article');
  card.className = 'ref-card';
  const title = document.createElement('h3');
  title.textContent = situation.label;
  const description = document.createElement('p');
  description.className = 'ref-desc';
  description.textContent = situation.description;
  const quote = document.createElement('blockquote');
  quote.textContent = situation.incoming;
  const foot = document.createElement('div');
  foot.className = 'ref-foot';
  const count = document.createElement('span');
  count.textContent = `답장 ${situation.replies.length}종`;
  const use = document.createElement('button');
  use.type = 'button';
  use.className = 'ref-use';
  use.textContent = '써보기';
  use.setAttribute('aria-label', `${situation.label} 상황으로 써보기`);
  use.addEventListener('click', () => {
    state.pasted = '';
    pasteInput.value = '';
    pasteStatus.textContent = '';
    selectSituation(situation.id, { fill: true });
    replay(inBubble, 'pop');
    must('#composer').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  });
  foot.append(count, use);
  card.append(title, description, quote, foot);
  refGrid.append(card);
}

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

// "왜 만들었나": 숫자(카운트업), 막대 차트, 타임라인, 이야기, 약속, 신고 안내.
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** 0에서 목표값까지 세어 올린다. 움직임 줄이기 설정이면 바로 최종 값을 보여 준다. */
function countUp(target: HTMLElement, stat: Stat): void {
  if (reducedMotion.matches) {
    target.textContent = stat.format(stat.value);
    return;
  }
  const duration = 1200;
  const start = performance.now();
  const tick = (now: number): void => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - progress) ** 3;
    target.textContent = stat.format(progress === 1 ? stat.value : Math.round(stat.value * eased));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const counters = new Map<HTMLElement, Stat>();
const statGrid = must<HTMLElement>('#stat-grid');
STATS.forEach((stat, index) => {
  const card = el('article', 'stat appear');
  card.style.setProperty('--i', String(index));
  const value = el('p', 'stat-value', stat.format(stat.value));
  counters.set(card, stat);
  card.append(value, el('p', 'stat-label', stat.label), el('p', 'stat-note', stat.note), el('p', 'stat-source', `출처: ${stat.source}`));
  statGrid.append(card);
});

const lossChart = must<HTMLElement>('#loss-chart');
const maxLoss = Math.max(...LOSS_BARS.map((bar) => bar.eok));
const [firstBar, lastBar] = [LOSS_BARS[0]!, LOSS_BARS[LOSS_BARS.length - 1]!];
const lossSummary = `${firstBar.year}년 ${formatEok(firstBar.eok)}원에서 ${lastBar.year}년 ${formatEok(lastBar.eok)}원으로 ${growthPercent(firstBar.eok, lastBar.eok)}% 늘었습니다.`;
lossChart.classList.add('appear');
lossChart.setAttribute('role', 'img');
lossChart.setAttribute('aria-label', `연간 보이스피싱 피해액. ${lossSummary}`);
const chartHead = el('div', 'chart-head');
chartHead.append(el('h4', 'chart-title', '연간 피해액'), el('p', 'chart-delta', `+${growthPercent(firstBar.eok, lastBar.eok)}%`));
const chartBars = el('div', 'chart-bars');
for (const bar of LOSS_BARS) {
  const column = el('div', 'bar-col');
  const fill = el('div', 'bar');
  fill.style.setProperty('--h', `${(bar.eok / maxLoss) * 100}%`);
  fill.append(el('span', 'bar-value', `${formatEok(bar.eok)}원`));
  column.append(fill, el('span', 'bar-year', `${bar.year}년`));
  chartBars.append(column);
}
lossChart.append(chartHead, chartBars, el('p', 'chart-source', '출처: 금강일보 2025-07-15(2024년), 폴리스TV 2026-02-16 등(2025년). 두 해의 증가율은 이 두 수치로 계산했습니다.'));

const timeline = must<HTMLElement>('#timeline');
TIMELINE.forEach((item, index) => {
  const row = el('li', 't-item appear');
  row.style.setProperty('--i', String(index));
  const card = el('div', 't-card');
  const head = el('div', 't-head');
  head.append(el('h4', 't-title', item.title), el('span', 't-chip', item.chip));
  card.append(head, el('p', 't-body', item.body), el('p', 't-source', `출처: ${item.source}`));
  row.append(el('span', 't-year', item.year), card);
  timeline.append(row);
});

const story = must<HTMLElement>('#story');
STORY.forEach((chapter, index) => {
  const row = el('li', 's-item appear');
  row.style.setProperty('--i', String(index));
  row.append(el('span', 's-when', chapter.when), el('h4', 's-title', chapter.title), el('p', 's-body', chapter.body));
  story.append(row);
});

const promises = must<HTMLElement>('#promises');
for (const promise of PROMISES) {
  const card = el('article', 'promise');
  card.append(el('h4', 'promise-title', promise.title), el('p', 'promise-body', promise.body));
  promises.append(card);
}

const reportSteps = must<HTMLElement>('#report-steps');
for (const step of REPORT_STEPS) reportSteps.append(el('li', undefined, step));

const sourceList = must<HTMLElement>('#source-list');
for (const entry of [...STATS.map((s) => `${s.label}: ${s.source}`), ...TIMELINE.map((t) => `${t.year}년: ${t.source}`)]) {
  sourceList.append(el('li', undefined, entry));
}

// 스크롤 진입 애니메이션: 보이는 순간 한 번만 재생한다. 움직임 줄이기 설정이면 바로 보인다.
const revealTargets = document.querySelectorAll<HTMLElement>('.reveal, .appear');
if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  revealTargets.forEach((target) => target.classList.add('in'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target as HTMLElement;
        target.classList.add('in');
        const stat = counters.get(target);
        const value = target.querySelector<HTMLElement>('.stat-value');
        if (stat && value) countUp(value, stat);
        observer.unobserve(target);
      }
    },
    // 섹션이 화면보다 아주 길 수 있어, 비율이 아니라 "조금이라도 들어오면" 기준으로 한다.
    { threshold: 0.02, rootMargin: '0px 0px -8% 0px' },
  );
  revealTargets.forEach((target) => observer.observe(target));
}

growTextarea(source);
render();
