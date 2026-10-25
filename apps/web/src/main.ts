import { TEMPLATE_KINDS, TEMPLATE_LABELS, getTemplate, toKorean, toSpam } from 'spamhell';
import './style.css';

function must<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

const source = must<HTMLTextAreaElement>('#text-source');
const result = must<HTMLTextAreaElement>('#text-transformed');
const preview = must<HTMLElement>('#preview-text-target');
const saveButton = must<HTMLButtonElement>('#btn-save-image');
const copyButton = must<HTMLButtonElement>('#btn-copy');
const toast = must<HTMLElement>('#toast');

const PREVIEW_PLACEHOLDER = '변환된 메시지 미리보기';
let toastTimer: number | undefined;

function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2200);
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
  button.addEventListener('click', () => setResult(getTemplate(kind)));
  templateList.append(button);
}

document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!source.value.trim()) {
      showToast('메시지를 먼저 입력해주세요.');
      source.focus();
      return;
    }
    setResult(button.dataset.mode === 'korean' ? toKorean(source.value) : toSpam(source.value));
  });
});

must('#btn-reset').addEventListener('click', () => {
  source.value = '';
  setResult('');
});

copyButton.addEventListener('click', async () => {
  if (!result.value) {
    showToast('복사할 결과가 없습니다.');
    return;
  }
  try {
    await navigator.clipboard.writeText(result.value);
    showToast('복사했습니다.');
  } catch {
    result.select();
    showToast('자동 복사에 실패했습니다. 선택된 텍스트를 직접 복사해주세요.');
  }
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
