// 24px 스트로크 아이콘. 외부 아이콘 폰트나 이미지 요청 없이 인라인 SVG로 그린다.
const PATHS = {
  send: '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
  dice: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.5" cy="8.5" r="1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1" fill="currentColor"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.500A2.500 2.500 0 0 1 7.500 4H15"/>',
  share: '<path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M5 12v6.500A2.500 2.500 0 0 0 7.500 21h9a2.500 2.500 0 0 0 2.500-2.500V12"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.800"/><path d="m21 16-5-5-8 8"/>',
  check: '<path d="m4 12.500 5 5L20 6.500"/>',
  terminal: '<path d="m5 7 5 5-5 5"/><path d="M13 18h6"/>',
  spark: '<path d="M12 3c.6 4.600 2.400 6.400 7 7-4.600.6-6.400 2.400-7 7-.6-4.600-2.400-6.400-7-7 4.600-.6 6.400-2.400 7-7z"/>',
  shield: '<path d="M12 3 5 6v5c0 4.500 3 8 7 10 4-2 7-5.500 7-10V6l-7-3z"/><path d="m9 12 2.200 2.200L15.500 10"/>',
  github: '<path d="M9 19c-4.300 1.400-4.300-2.500-6-3m12 5v-3.500c0-1 .1-1.400-.5-2 2.800-.3 5.500-1.400 5.500-6a4.600 4.600 0 0 0-1.300-3.200 4.200 4.200 0 0 0-.1-3.200s-1.100-.3-3.500 1.300a12.300 12.300 0 0 0-6.200 0C6.500 2.800 5.400 3.100 5.400 3.100a4.200 4.200 0 0 0-.1 3.200A4.600 4.600 0 0 0 4 9.500c0 4.600 2.700 5.700 5.500 6-.6.600-.6 1.200-.5 2V21"/>',
  phone: '<rect x="6.500" y="2.500" width="11" height="19" rx="3"/><path d="M11 18.500h2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.500v2M12 19.500v2M4.500 4.500l1.400 1.400M18.100 18.100l1.400 1.400M2.500 12h2M19.500 12h2M4.500 19.500l1.400-1.400M18.100 5.900l1.400-1.400"/>',
  moon: '<path d="M20.500 13.200A8.500 8.500 0 1 1 10.800 3.500a6.800 6.800 0 0 0 9.700 9.700z"/>',
} as const;

export type IconName = keyof typeof PATHS;

/** 인라인 SVG 문자열. 장식용이라 스크린 리더에는 숨긴다. */
export function icon(name: IconName, size = 20): string {
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${PATHS[name]}</svg>`;
}
