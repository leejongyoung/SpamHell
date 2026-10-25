import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { TEMPLATE_KINDS, TEMPLATE_LABELS, getTemplate, toKorean, toSpam } from 'spamhell';
import { z } from 'zod';

const VERSION = '1.0.0';

/** 풍자 도구라는 원칙을 모든 도구 설명에 공통으로 붙인다. */
const PRINCIPLE =
  'Satirical counter-tool against voice phishing: returns text only. It does not send anything, ' +
  'and provides no bulk or batch generation.';

const seedSchema = z
  .union([z.string(), z.number()])
  .optional()
  .describe('Optional seed. The same seed and input always give the same output; omit for random output.');

const rateSchema = (name: string) =>
  z.number().min(0).max(1).optional().describe(`${name}: probability between 0 and 1 (spam mode only).`);

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

const text = (value: string): CallToolResult => ({ content: [{ type: 'text', text: value }] });

const failure = (error: unknown): CallToolResult => ({
  isError: true,
  content: [{ type: 'text', text: error instanceof Error ? error.message : String(error) }],
});

/** 실패를 던지지 않고 `isError` 결과로 돌려준다. */
function safely(fn: () => string): CallToolResult {
  try {
    return text(fn());
  } catch (error) {
    return failure(error);
  }
}

export function createServer(): McpServer {
  const server = new McpServer({ name: 'spamhell-mcp', version: VERSION });

  server.registerTool(
    'spamhell_transform',
    {
      title: 'Transform text into spam-style',
      description:
        `Transform a message into Korean spam-filter-evasion style (스팸체), or into spaced-out Korean (korean mode). ${PRINCIPLE} ` +
        'One message per call, 1 to 2000 characters.',
      inputSchema: {
        text: z.string().min(1).max(2000).describe('Text to transform (1 to 2000 characters).'),
        mode: z
          .enum(['spam', 'korean'])
          .default('spam')
          .describe("'spam' (default) or 'korean'."),
        seed: seedSchema,
        frame: z.boolean().optional().describe('Spam mode only: wrap the result in the decorative frame (default true).'),
        disassembleRate: rateSchema('disassembleRate'),
        dotRate: rateSchema('dotRate'),
        numberRate: rateSchema('numberRate'),
        noiseRate: rateSchema('noiseRate'),
      },
      annotations: READ_ONLY,
    },
    ({ text: input, mode, seed, ...rest }) =>
      safely(() => (mode === 'korean' ? toKorean(input, { seed }) : toSpam(input, { seed, ...rest }))),
  );

  server.registerTool(
    'spamhell_template',
    {
      title: 'Get a template message',
      description:
        `Return one ready-made message of the given kind. Templates never impersonate real institutions. ${PRINCIPLE}`,
      inputSchema: {
        kind: z.enum(TEMPLATE_KINDS).describe(`Template kind: ${TEMPLATE_KINDS.join(', ')}.`),
        seed: seedSchema,
      },
      annotations: READ_ONLY,
    },
    ({ kind, seed }) => safely(() => getTemplate(kind, { seed })),
  );

  server.registerTool(
    'spamhell_list_templates',
    {
      title: 'List template kinds',
      description: `List the available template kinds with their Korean labels. ${PRINCIPLE}`,
      inputSchema: {},
      annotations: READ_ONLY,
    },
    () => text(TEMPLATE_KINDS.map((kind) => `${kind}: ${TEMPLATE_LABELS[kind]}`).join('\n')),
  );

  return server;
}
