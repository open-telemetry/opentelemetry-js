/**
 * Runs the Next.js 15 edge build and asserts the known protobuf Dynamic Code
 * Evaluation error. This exit(0) is intentional: the test passes while the bug
 * exists and will break when it is fixed, signalling that this file should be
 * removed and test:bundle should revert to just `npm run build`.
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

const output = (result.stdout ?? '') + (result.stderr ?? '');
const buildFailed = result.status !== 0;
const hasExpectedError =
  /Dynamic Code Evaluation/.test(output) && /protobuf/i.test(output);

if (!buildFailed) {
  console.error(
    'Build succeeded — expected protobuf Dynamic Code Evaluation error.\n' +
      'The underlying bug may be fixed. Update this test.'
  );
  process.exit(1);
}

if (!hasExpectedError) {
  console.error('Build failed for an unexpected reason:\n', output);
  process.exit(1);
}

console.log('Known protobuf Dynamic Code Evaluation build failure confirmed');
