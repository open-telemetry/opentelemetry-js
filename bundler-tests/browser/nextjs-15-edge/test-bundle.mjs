/**
 * Runs the Next.js 15 edge build and asserts it succeeds. The previous
 * version of this test inverted the assertion to track a known protobuf
 * Dynamic Code Evaluation failure; that failure is resolved now that
 * `@opentelemetry/otlp-transformer` ships a `browser` exports condition
 * that excludes the protobuf serializers, so a normal pass is correct.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const testDir = dirname(fileURLToPath(import.meta.url));

const result = spawnSync('npm', ['run', 'build'], {
  cwd: testDir,
  encoding: 'utf-8',
  shell: false,
});

if (result.status !== 0) {
  const output = (result.stdout ?? '') + (result.stderr ?? '');
  console.error('Next.js 15 edge build failed:\n', output);
  process.exit(1);
}

console.log('Next.js 15 edge build succeeded');
