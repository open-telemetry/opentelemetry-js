/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Simple check that SimpleSpanProcessor successfully creates an instance
// of SimpleSpanProcessor from the 'sdk-trace' package. Functionality testing
// is in the sdk-trace test suite.

import * as assert from 'assert';
import { SimpleSpanProcessor } from '../../src/SimpleSpanProcessor-shim';
import {
  SimpleSpanProcessor as SdkTraceSimpleSpanProcessor,
  InMemorySpanExporter,
} from '@opentelemetry/sdk-trace';

describe('SimpleSpanProcessor shim', () => {
  it('should create instance of sdk-trace SimpleSpanProcessor', () => {
    const processor = new SimpleSpanProcessor(new InMemorySpanExporter());

    assert.ok(processor instanceof SimpleSpanProcessor);
    assert.ok(processor instanceof SdkTraceSimpleSpanProcessor);
    processor.shutdown();
  });
});
