/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { BasicTracerProvider } from '../../src/BasicTracerProvider-shim';
import { TracerProvider } from '@opentelemetry/sdk-trace';

describe('BasicTracerProvider shim', () => {
  it('should create instance of sdk-trace TracerProvider', () => {
    const provider = new BasicTracerProvider();

    assert.ok(provider instanceof BasicTracerProvider);
    assert.ok(provider instanceof TracerProvider);
    provider.shutdown();
  });

  it('generalLimits values should making it through as spanLimits values', () => {
    const provider = new BasicTracerProvider({
      generalLimits: {
        attributeValueLengthLimit: 1234,
        attributeCountLimit: 42,
      },
    });

    const spanLimits = (provider as any)._tracerOptions.spanLimits;
    assert.strictEqual(spanLimits.attributeValueLengthLimit, 1234);
    assert.strictEqual(spanLimits.attributeCountLimit, 42);
  });

  it('spanLimits constructor options should win over generalLimits', () => {
    const provider = new BasicTracerProvider({
      generalLimits: {
        attributeValueLengthLimit: 1234,
        attributeCountLimit: 42,
      },
      spanLimits: {
        attributeValueLengthLimit: 5678,
        attributeCountLimit: 84,
      },
    });

    const spanLimits = (provider as any)._tracerOptions.spanLimits;
    assert.strictEqual(spanLimits.attributeValueLengthLimit, 5678);
    assert.strictEqual(spanLimits.attributeCountLimit, 84);
  });
});
