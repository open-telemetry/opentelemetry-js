/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Simple check that BatchSpanProcessor successfully creates an instance
// of BatchSpanProcessor from the 'sdk-trace' package. Functionality testing
// is in the sdk-trace test suite.

import * as assert from 'assert';
import { BatchSpanProcessor } from '../../src/BatchSpanProcessor-shim';
import {
  BatchSpanProcessor as SdkTraceBatchSpanProcessor,
  InMemorySpanExporter,
} from '@opentelemetry/sdk-trace';

describe('BatchSpanProcessor shim', () => {
  it('should create instance of sdk-trace BatchSpanProcessor', () => {
    const processor = new BatchSpanProcessor(new InMemorySpanExporter(), {
      maxExportBatchSize: 1234,
    });

    assert.ok(processor instanceof BatchSpanProcessor);
    assert.ok(processor instanceof SdkTraceBatchSpanProcessor);
    assert.strictEqual(processor['_maxExportBatchSize'], 1234);
    processor.shutdown();
  });
});
