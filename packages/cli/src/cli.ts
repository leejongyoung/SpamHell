import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import {
  TEMPLATE_KINDS,
  TEMPLATE_LABELS,
  getTemplate,
  isTemplateKind,
  toKorean,
  toSpam,
} from 'spamhell';

export interface CliIo {
  /** 표준 입력 전체를 읽는다. TTY가 아닐 때만 호출된다. */
  readStdin: () => Promise<string>;
  stdinIsTTY: boolean;
}

export interface CliResult {
  code: number;
  stdout: string;
  stderr: string;
}

const HELP = `Usage: spamhell [options] [text...]

Transform text into spam-style (스팸체). Reads stdin when no text is given.

Options:
  -m, --mode <spam|korean>   Transformation mode (default: spam)
  -t, --template <kind>      Print a template instead: ${TEMPLATE_KINDS.join(', ')}
  -s, --seed <value>         Make the output reproducible
      --list-templates       List template kinds
  -h, --help                 Show this help
  -v, --version              Show version

Examples:
  spamhell "입금 확인 바랍니다"
  echo "지금 바로 입금하세요" | spamhell --mode korean --seed 7
  spamhell --template prize
`;

const MODES = ['spam', 'korean'] as const;

function version(): string {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
  return pkg.version;
}

function usageError(message: string): CliResult {
  return { code: 2, stdout: '', stderr: `spamhell: ${message}\nTry 'spamhell --help'.\n` };
}

export async function run(argv: string[], io: CliIo): Promise<CliResult> {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        mode: { type: 'string', short: 'm' },
        template: { type: 'string', short: 't' },
        seed: { type: 'string', short: 's' },
        'list-templates': { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'v' },
      },
    });
  } catch (error) {
    return usageError((error as Error).message);
  }
  const { values, positionals } = parsed;

  if (values.help) return { code: 0, stdout: HELP, stderr: '' };
  if (values.version) return { code: 0, stdout: `${version()}\n`, stderr: '' };
  if (values['list-templates']) {
    const lines = TEMPLATE_KINDS.map((kind) => `${kind}\t${TEMPLATE_LABELS[kind]}`);
    return { code: 0, stdout: `${lines.join('\n')}\n`, stderr: '' };
  }

  const mode = values.mode ?? 'spam';
  if (!(MODES as readonly string[]).includes(mode)) {
    return usageError(`invalid mode '${mode}' (expected ${MODES.join(' or ')})`);
  }
  const seed = values.seed;

  if (values.template !== undefined) {
    if (positionals.length > 0) return usageError('--template cannot be combined with input text');
    if (!isTemplateKind(values.template)) {
      return usageError(`unknown template '${values.template}' (expected ${TEMPLATE_KINDS.join(', ')})`);
    }
    return { code: 0, stdout: `${getTemplate(values.template, { seed })}\n`, stderr: '' };
  }

  let text: string;
  if (positionals.length > 0) {
    text = positionals.join(' ');
  } else if (!io.stdinIsTTY) {
    text = (await io.readStdin()).replace(/\r?\n$/, '');
  } else {
    return usageError('no input text (pass text as arguments or pipe it via stdin)');
  }
  if (text === '') return usageError('input text is empty');

  const output = mode === 'korean' ? toKorean(text, { seed }) : toSpam(text, { seed });
  return { code: 0, stdout: `${output}\n`, stderr: '' };
}
