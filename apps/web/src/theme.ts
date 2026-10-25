import { icon } from './icons';

type Theme = 'light' | 'dark';

const KEY = 'spamhell-theme';
const THEME_COLOR: Record<Theme, string> = { light: '#FFF3E3', dark: '#14101A' };

/** 저장된 선택이 있으면 그것, 없으면 시스템 설정. */
export function resolveTheme(saved: string | null, systemDark: boolean): Theme {
  if (saved === 'light' || saved === 'dark') return saved;
  return systemDark ? 'dark' : 'light';
}

function readSaved(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** 토글 버튼을 연결한다. 선택은 이 기기의 localStorage에만 저장한다(글과 번호는 저장하지 않는다). */
export function initTheme(button: HTMLButtonElement): void {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  let theme = resolveTheme(readSaved(), query.matches);

  const apply = (): void => {
    document.documentElement.dataset.theme = theme;
    meta?.setAttribute('content', THEME_COLOR[theme]);
    button.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon', 20);
    button.setAttribute('aria-label', theme === 'dark' ? '라이트 테마로 전환' : '다크 테마로 전환');
  };

  button.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    // 색이 한 번에 뒤집히지 않고 부드럽게 바뀌도록 잠깐만 전환을 켠다.
    document.documentElement.classList.add('theme-switching');
    window.setTimeout(() => document.documentElement.classList.remove('theme-switching'), 400);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // 저장이 막힌 환경(사생활 보호 모드 등)에서는 이번 방문에만 적용한다.
    }
    apply();
  });

  // 저장된 선택이 없으면 시스템 테마 변경을 따라간다.
  query.addEventListener('change', (event) => {
    if (readSaved() !== null) return;
    theme = event.matches ? 'dark' : 'light';
    apply();
  });

  apply();
}
