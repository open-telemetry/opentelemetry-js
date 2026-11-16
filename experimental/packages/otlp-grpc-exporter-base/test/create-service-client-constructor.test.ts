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

function runFixture(name: string): string {
  return execFileSync(
    process.execPath,
    [
      '-r',
      'ts-node/register',
      '-r',
      otelConditionHook,
      path.join(__dirname, 'fixtures', name),
    ],
    { cwd: packageRoot, encoding: 'utf8' }
  ).trim();
}

describe('createServiceClientConstructor', function () {
  this.timeout(60000);

  it('does not load @grpc/grpc-js when the module is required', function () {
    assert.strictEqual(
      runFixture('require-service-client-constructor-module.ts'),
      '0'
    );
  });

  it('does not load @grpc/grpc-js when the package entry point is required', function () {
    assert.strictEqual(runFixture('require-package-entry-point.ts'), '0');
  });

  it('loads @grpc/grpc-js on first use and returns a client constructor', function () {
    assert.strictEqual(
      runFixture('create-service-client-constructor.ts'),
      '0 true function object'
    );
  });
});
