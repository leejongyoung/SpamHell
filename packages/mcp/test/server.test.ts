import { afterEach, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { TEMPLATE_KINDS, TEMPLATE_LABELS, getTemplate, toKorean, toSpam } from 'spamhell';
import { createServer } from '../src/server.js';

const closers: Array<() => Promise<void>> = [];

async function connect(): Promise<Client> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createServer();
  const client = new Client({ name: 'test-client', version: '0.0.0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  closers.push(() => client.close(), () => server.close());
  return client;
}

afterEach(async () => {
  while (closers.length) await closers.pop()!();
});

async function call(client: Client, name: string, args: Record<string, unknown>) {
  const result = await client.callTool({ name, arguments: args });
  const content = result.content as Array<{ type: string; text: string }>;
  return { isError: result.isError === true, text: content[0]?.text ?? '', count: content.length };
}

describe('spamhell-mcp', () => {
  it('lists the three tools as read-only and idempotent', async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'spamhell_list_templates',
      'spamhell_template',
      'spamhell_transform',
    ]);
    for (const tool of tools) {
      expect(tool.description).toBeTruthy();
      expect(tool.annotations).toMatchObject({ readOnlyHint: true, idempotentHint: true, destructiveHint: false });
    }
  });

  it('spamhell_transform equals the core output for a given seed', async () => {
    const client = await connect();
    const result = await call(client, 'spamhell_transform', { text: '입금 확인 바랍니다', seed: 42 });
    expect(result).toMatchObject({ isError: false, count: 1 });
    expect(result.text).toBe(toSpam('입금 확인 바랍니다', { seed: 42 }));
  });

  it('is reproducible and accepts string seeds and rate options', async () => {
    const client = await connect();
    const args = { text: '지금 바로 입금하세요', seed: 'abc', frame: false, dotRate: 0.5, noiseRate: 0 };
    const a = await call(client, 'spamhell_transform', args);
    const b = await call(client, 'spamhell_transform', args);
    expect(a.text).toBe(b.text);
    expect(a.text).toBe(toSpam('지금 바로 입금하세요', { seed: 'abc', frame: false, dotRate: 0.5, noiseRate: 0 }));
  });

  it('supports the korean mode', async () => {
    const client = await connect();
    const result = await call(client, 'spamhell_transform', { text: '지금 바로 입금', mode: 'korean', seed: 5 });
    expect(result.isError).toBe(false);
    expect(result.text).toBe(toKorean('지금 바로 입금', { seed: 5 }));
  });

  it('spamhell_template equals the core output for a given seed', async () => {
    const client = await connect();
    for (const kind of TEMPLATE_KINDS) {
      const result = await call(client, 'spamhell_template', { kind, seed: 7 });
      expect(result.isError).toBe(false);
      expect(result.text).toBe(getTemplate(kind, { seed: 7 }));
    }
  });

  it('spamhell_list_templates lists every kind with its Korean label', async () => {
    const client = await connect();
    const result = await call(client, 'spamhell_list_templates', {});
    expect(result.isError).toBe(false);
    expect(result.text.split('\n')).toEqual(TEMPLATE_KINDS.map((kind) => `${kind}: ${TEMPLATE_LABELS[kind]}`));
  });

  it('reports invalid input as isError instead of throwing', async () => {
    const client = await connect();
    const cases: Array<[string, Record<string, unknown>]> = [
      ['spamhell_transform', { text: '' }],
      ['spamhell_transform', { text: 'x'.repeat(2001) }],
      ['spamhell_transform', { text: '입금', dotRate: 1.5 }],
      ['spamhell_transform', { text: '입금', mode: 'other' }],
      ['spamhell_template', { kind: 'unknown' }],
    ];
    for (const [name, args] of cases) {
      const result = await call(client, name, args);
      expect(result.isError, `${name} ${JSON.stringify(args).slice(0, 40)}`).toBe(true);
      expect(result.text).not.toBe('');
    }
  });
});
