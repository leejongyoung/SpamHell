#!/usr/bin/env node
import { run } from './cli.js';

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf8');
}

const result = await run(process.argv.slice(2), {
  readStdin,
  stdinIsTTY: Boolean(process.stdin.isTTY),
});
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exitCode = result.code;
