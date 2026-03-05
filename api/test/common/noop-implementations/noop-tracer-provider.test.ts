/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { NoopTracer } from '../../../src/trace/NoopTracer';
import { NoopTracerProvider } from '../../../src/trace/NoopTracerProvider';

describe('NoopTracerProvider', function () {
  it('should not crash', function () {
    const tracerProvider = new NoopTracerProvider();

    assert.ok(tracerProvider.getTracer('tracer-name') instanceof NoopTracer);
    assert.ok(
      tracerProvider.getTracer('tracer-name', 'v1') instanceof NoopTracer
    );
    assert.ok(
      tracerProvider.getTracer('tracer-name', 'v1', {
        schemaUrl: 'https://opentelemetry.io/schemas/1.7.0',
      }) instanceof NoopTracer
    );
  });
});
