/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {
  _clearDefaultServiceNameCache,
  defaultServiceName,
} from '../src/default-service-name';
import { describeNode } from './util';

describe('defaultServiceName', () => {
  const originalProcess = globalThis.process;

  beforeEach(() => _clearDefaultServiceNameCache());
  afterEach(() => {
    globalThis.process = originalProcess;
  });

  it('returns unknown_service prefix', () => {
    const serviceName = defaultServiceName();
    assert.ok(serviceName.startsWith('unknown_service'));
  });

  it('returns consistent value on multiple calls', () => {
    const serviceName1 = defaultServiceName();
    const serviceName2 = defaultServiceName();
    assert.strictEqual(serviceName1, serviceName2);
  });

  describeNode('defaultServiceName', () => {
    it('includes process.argv0 in Node.js', () => {
      const serviceName = defaultServiceName();
      assert.match(serviceName, /^unknown_service:.+/);
    });

    it('returns plain unknown_service when process is not an object', () => {
      // @ts-expect-error redefining process for testing
      globalThis.process = undefined;
      const serviceName = defaultServiceName();
      assert.strictEqual(serviceName, 'unknown_service');
    });

    it('returns plain unknown_service when process is stubbed but empty (edge runtimes)', () => {
      // @ts-expect-error redefining process for testing
      globalThis.process = {};
      const serviceName = defaultServiceName();
      assert.strictEqual(serviceName, 'unknown_service');
    });
  });
});
