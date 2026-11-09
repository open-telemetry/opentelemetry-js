/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import { execFileSync } from 'child_process';
import * as path from 'path';

const packageRoot = path.resolve(__dirname, '..');
const otelConditionHook = path.resolve(
  packageRoot,
  '../../../scripts/mocha-otel-condition.cjs'
);

function run(script: string): string {
  return execFileSync(
    process.execPath,
    [
      '-r',
      'ts-node/register',
      '-r',
      otelConditionHook,
      '-e',
      `const loaded = () => Object.keys(require.cache).filter((k) => /[\\\\/]@grpc[\\\\/]grpc-js[\\\\/]/.test(k)).length;\n${script}`,
    ],
    { cwd: packageRoot, encoding: 'utf8' }
  ).trim();
}

describe('createServiceClientConstructor', function () {
  this.timeout(60000);

  it('does not load @grpc/grpc-js when the module is required', function () {
    const output = run(`
      require('./src/create-service-client-constructor');
      console.log(loaded());
    `);

    assert.strictEqual(output, '0');
  });

  it('does not load @grpc/grpc-js when the package entry point is required', function () {
    const output = run(`
      require('./src');
      console.log(loaded());
    `);

    assert.strictEqual(output, '0');
  });

  it('loads @grpc/grpc-js on first use and returns a client constructor', function () {
    const output = run(`
      const { createServiceClientConstructor } = require('./src/create-service-client-constructor');
      const before = loaded();
      const Client = createServiceClientConstructor('/test/Export', 'TestService');
      console.log(before, loaded() > 0, typeof Client, typeof Client.service.export);
    `);

    assert.strictEqual(output, '0 true function object');
  });
});
