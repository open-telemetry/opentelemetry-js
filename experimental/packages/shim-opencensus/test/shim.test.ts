/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
