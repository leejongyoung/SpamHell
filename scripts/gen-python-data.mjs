// TS 코어의 템플릿·상황 데이터를 Python 모듈(_data.py)로 내보낸다. 데이터는 TS가 기준이고 Python은 생성물이다.
//   npm run build -w spamhell && node scripts/gen-python-data.mjs
// CI는 이 스크립트를 다시 실행해 결과가 커밋된 파일과 같은지 확인한다 (--check).
import { readFileSync, writeFileSync } from 'node:fs';
import { TEMPLATE_KINDS, TEMPLATE_LABELS } from '../packages/core/dist/templates.js';
import { TEMPLATES } from '../packages/core/dist/templates.js';
import { SITUATIONS, SITUATION_KEYWORDS } from '../packages/core/dist/situations.js';

const target = new URL('../packages/python/src/spamhell/_data.py', import.meta.url);

const str = (text) => JSON.stringify(text); // 한글은 그대로, 줄바꿈은 \n 이스케이프 (유효한 Python 문자열)
const block = (text) => {
  // 읽기 쉬운 여러 줄 문자열. 안전하지 않은 경우만 이스케이프 형식으로 돌아간다.
  if (text.includes('\\') || text.includes('"""') || text.endsWith('"')) return str(text);
  return `"""${text}"""`;
};

let out = `# 이 파일은 scripts/gen-python-data.mjs가 만든다. 직접 고치지 말고 packages/core/src를 고친 뒤 다시 생성한다.
from __future__ import annotations

from typing import Dict, Tuple

TEMPLATE_KINDS: Tuple[str, ...] = (${TEMPLATE_KINDS.map(str).join(', ')})

TEMPLATE_LABELS: Dict[str, str] = {
${TEMPLATE_KINDS.map((kind) => `    ${str(kind)}: ${str(TEMPLATE_LABELS[kind])},`).join('\n')}
}

TEMPLATES: Dict[str, Tuple[str, ...]] = {
`;
for (const kind of TEMPLATE_KINDS) {
  out += `    ${str(kind)}: (\n`;
  for (const text of TEMPLATES[kind]) out += `        ${block(text)},\n`;
  out += '    ),\n';
}
out += `}

# (id, label, description, incoming, replies)
SITUATIONS: Tuple[Tuple[str, str, str, str, Tuple[str, ...]], ...] = (
`;
for (const s of SITUATIONS) {
  out += `    (\n        ${str(s.id)},\n        ${str(s.label)},\n        ${str(s.description)},\n        ${str(s.incoming)},\n        (\n`;
  for (const reply of s.replies) out += `            ${str(reply)},\n`;
  out += '        ),\n    ),\n';
}
out += ')\n\nSITUATION_KEYWORDS: Dict[str, Tuple[str, ...]] = {\n';
for (const s of SITUATIONS) {
  out += `    ${str(s.id)}: (${SITUATION_KEYWORDS[s.id].map(str).join(', ')}${SITUATION_KEYWORDS[s.id].length === 1 ? ',' : ''}),\n`;
}
out += '}\n';

if (process.argv.includes('--check')) {
  const current = readFileSync(target, 'utf8');
  if (current !== out) {
    console.error('packages/python/src/spamhell/_data.py is out of date. Run: node scripts/gen-python-data.mjs');
    process.exit(1);
  }
  console.log('_data.py is up to date');
} else {
  writeFileSync(target, out);
  console.log(`wrote ${target.pathname}`);
}
