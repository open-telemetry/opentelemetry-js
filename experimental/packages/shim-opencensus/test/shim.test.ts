/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { installShim, uninstallShim } from '../src/shim';
import { ShimTracer } from '../src';
import { CoreTracer as OrigCoreTracer } from '@opencensus/core';
import { withTestTracerProvider } from './util';
import { trace } from '@opentelemetry/api';

describe('shim', () => {
  beforeEach(uninstallShim);
  afterEach(uninstallShim);
  afterEach(() => {
    trace.disable();
  });

  describe('installShim', () => {
    it('should patch the @opencensus/core CoreTracer to create instances of the ShimTracer', () => {
      installShim();
      const { CoreTracer } = require('@opencensus/core');
      assert.notStrictEqual(CoreTracer, OrigCoreTracer);
      assert.ok(new CoreTracer() instanceof ShimTracer);
    });

    it('should use the provided Tracer', async () => {
      const spans = await withTestTracerProvider(tracerProvider => {
        const tracer = tracerProvider.getTracer('test');
        installShim({ tracer });
        const CoreTracer: typeof OrigCoreTracer =
          require('@opencensus/core').CoreTracer;
        const coreTracer = new CoreTracer();
        coreTracer.startChildSpan().end();
      });
      assert.strictEqual(spans.length, 1);
    });

    it('should use the global OpenTelemetry TracerProvider if none provided', async () => {
      installShim();
      const spans = await withTestTracerProvider(tracerProvider => {
        trace.setGlobalTracerProvider(tracerProvider);
        const CoreTracer: typeof OrigCoreTracer =
          require('@opencensus/core').CoreTracer;
        const coreTracer = new CoreTracer();
        coreTracer.startChildSpan().end();
      });
      assert.strictEqual(spans.length, 1);
    });
  });

  describe('uninstallShim', () => {
    it('should restore the original CoreTracer', () => {
      installShim();
      uninstallShim();
      const { CoreTracer } = require('@opencensus/core');
      assert.strictEqual(CoreTracer, OrigCoreTracer);
    });
  });
});
