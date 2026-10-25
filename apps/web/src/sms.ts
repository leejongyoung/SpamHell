export type SmsPlatform = 'apple' | 'other';

/** iOS, iPadOS(데스크톱 UA로 위장), macOS는 `sms:번호&body=`, 그 밖에는 `sms:번호?body=` 형식을 쓴다. */
export function detectSmsPlatform(env: { userAgent: string; platform: string; maxTouchPoints: number }): SmsPlatform {
  if (/iPhone|iPad|iPod/.test(env.userAgent)) return 'apple';
  if (env.platform === 'MacIntel') return 'apple';
  return 'other';
}

/** 전화번호에서 숫자와 맨 앞의 +만 남긴다. 비어 있으면 빈 문자열. */
export function normalizePhone(input: string): string {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, '');
  return trimmed.startsWith('+') ? `+${digits}` : digits;
}

/** 기본 문자 앱을 본문이 채워진 상태로 여는 `sms:` 링크. 전송은 사용자가 앱에서 직접 누른다. */
export function smsHref(options: { to: string; body: string; platform: SmsPlatform }): string {
  const to = normalizePhone(options.to);
  const separator = options.platform === 'apple' ? '&' : '?';
  return `sms:${to}${separator}body=${encodeURIComponent(options.body)}`;
}

/** 한글 등 비ASCII를 2바이트로 세는 EUC-KR 근사치. 국내 문자 길이 기준(SMS 90바이트)에 쓴다. */
export function smsBytes(text: string): number {
  let bytes = 0;
  for (const char of text) bytes += char.codePointAt(0)! <= 0x7f ? 1 : 2;
  return bytes;
}

export const SMS_LIMIT = 90;
export const LMS_LIMIT = 2000;

export type SmsKind = 'SMS' | 'LMS' | 'OVER';

export function smsKind(bytes: number): SmsKind {
  if (bytes <= SMS_LIMIT) return 'SMS';
  return bytes <= LMS_LIMIT ? 'LMS' : 'OVER';
}
