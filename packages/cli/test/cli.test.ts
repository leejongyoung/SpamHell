import { describe, expect, it } from 'vitest';
import { TEMPLATE_KINDS, getTemplate, toKorean, toSpam } from 'spamhell';
import { run, type CliIo } from '../src/cli.js';

const TTY: CliIo = {
  stdinIsTTY: true,
  readStdin: async () => {
    throw new Error('stdin must not be read from a TTY');
  },
};

const piped = (data: string): CliIo => ({ stdinIsTTY: false, readStdin: async () => data });

describe('spamhell cli', () => {
  it('transforms positional text, joining words with spaces', async () => {
    const result = await run(['--seed', '3', '입금', '확인'], TTY);
    expect(result).toEqual({ code: 0, stdout: `${toSpam('입금 확인', { seed: '3' })}\n`, stderr: '' });
  });

  it('reads stdin when no text is given and strips one trailing newline', async () => {
    const result = await run(['-s', '3'], piped('입금 확인\n'));
    expect(result.stdout).toBe(`${toSpam('입금 확인', { seed: '3' })}\n`);
  });

  it('prefers positional text over stdin', async () => {
    const io: CliIo = {
      stdinIsTTY: false,
      readStdin: async () => {
        throw new Error('stdin must not be consumed');
      },
    };
    const result = await run(['-s', '1', 'abc'], io);
    expect(result.code).toBe(0);
  });

  it('supports the korean mode', async () => {
    const result = await run(['--mode', 'korean', '--seed', '5', '지금 바로 입금'], TTY);
    expect(result.stdout).toBe(`${toKorean('지금 바로 입금', { seed: '5' })}\n`);
  });

  it('prints a template, reproducibly with a seed', async () => {
    const result = await run(['--template', 'horror', '--seed', '2'], TTY);
    expect(result.stdout).toBe(`${getTemplate('horror', { seed: '2' })}\n`);
  });

  it('lists templates as tab-separated kind and label', async () => {
    const result = await run(['--list-templates'], TTY);
    const kinds = result.stdout.trimEnd().split('\n').map((line) => line.split('\t')[0]);
    expect(kinds).toEqual([...TEMPLATE_KINDS]);
  });

  it.each([
    [['--mode', 'loud', 'x'], /invalid mode/],
    [['--template', 'nope'], /unknown template/],
    [['--template', 'prize', 'text'], /cannot be combined/],
    [['--bogus'], /bogus/],
  ])('rejects bad usage %j with exit code 2 and nothing on stdout', async (args, message) => {
    const result = await run(args, TTY);
    expect(result.code).toBe(2);
    expect(result.stdout).toBe('');
    expect(result.stderr).toMatch(message);
  });

  it('fails when there is no input on a TTY', async () => {
    const result = await run([], TTY);
    expect(result.code).toBe(2);
    expect(result.stderr).toMatch(/no input text/);
  });

  it('fails on empty piped input', async () => {
    const result = await run([], piped('\n'));
    expect(result.code).toBe(2);
    expect(result.stderr).toMatch(/empty/);
  });

  it('prints help and a semver version', async () => {
    expect((await run(['--help'], TTY)).stdout).toMatch(/^Usage: spamhell/);
    expect((await run(['--version'], TTY)).stdout).toMatch(/^\d+\.\d+\.\d+\n$/);
  });
});
