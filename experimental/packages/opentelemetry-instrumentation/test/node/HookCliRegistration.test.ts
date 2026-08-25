/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { spawnSync } from 'child_process';
import * as path from 'path';
import { pathToFileURL } from 'url';

const hookPath = path.join(__dirname, '..', '..', 'hook.mjs');
const registerHookPath = path.join(__dirname, 'register-otel-hook.mjs');
const probePath = path.join(__dirname, 'fixtures', 'esm-hook-cli-probe.mjs');

function runProbe(nodeArgs: string[]): {
  status: number | null;
  stdout: string;
  stderr: string;
} {
  const env = { ...process.env };
  delete env.NODE_OPTIONS;

  const result = spawnSync(process.execPath, [...nodeArgs, probePath], {
    encoding: 'utf8',
    env,
    timeout: 10000,
  });

  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

function probeResult(stdout: string): string | undefined {
  const match = stdout.match(/^PROBE_RESULT=(.*)$/m);
  return match?.[1];
}

describe('ESM hook CLI registration', function () {
  this.timeout(10000);

  it('should patch ESM exports with --experimental-loader', function () {
    const result = runProbe([`--experimental-loader=${hookPath}`]);
    assert.strictEqual(
      result.status,
      0,
      `unexpected exit: ${result.stderr}\n${result.stdout}`
    );
    assert.strictEqual(probeResult(result.stdout), 'patched');
  });

  it('should not patch ESM exports when --import loads hook.mjs directly', function () {
    const result = runProbe([`--import=${pathToFileURL(hookPath).href}`]);
    assert.strictEqual(
      result.status,
      0,
      `unexpected exit: ${result.stderr}\n${result.stdout}`
    );
    assert.strictEqual(probeResult(result.stdout), 'original');
  });

  it('should patch ESM exports when --import registers hook.mjs via module.register()', function () {
    const result = runProbe([
      `--import=${pathToFileURL(registerHookPath).href}`,
    ]);
    assert.strictEqual(
      result.status,
      0,
      `unexpected exit: ${result.stderr}\n${result.stdout}`
    );
    assert.strictEqual(probeResult(result.stdout), 'patched');
  });
});
