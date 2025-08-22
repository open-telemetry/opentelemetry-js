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

import { context, ContextManager, trace } from '@opentelemetry/api';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { ATTR_TELEMETRY_SDK_LANGUAGE } from '@opentelemetry/semantic-conventions';
import { Span } from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import { WebTracerConfig } from '../src';
import { WebTracerProvider } from '../src/WebTracerProvider';

describe('WebTracerProvider', function () {
  describe('constructor', function () {
    let defaultOptions: WebTracerConfig;
    let contextManager: ContextManager;

    beforeEach(() => {
      defaultOptions = {};
      contextManager = new ZoneContextManager().enable();
      context.setGlobalContextManager(contextManager);
    });

    afterEach(() => {
      contextManager.disable();
      context.disable();
    });

    it('should construct an instance with required only options', function () {
      const tracer = new WebTracerProvider(
        Object.assign({}, defaultOptions)
      ).getTracer('default');
      assert.ok(tracer);
    });

    it('should work without default context manager', function () {
      assert.doesNotThrow(() => {
        new WebTracerProvider({});
      });
    });

    describe('when contextManager is "ZoneContextManager"', function () {
      it('should correctly return the contexts for 2 parallel actions', done => {
        const webTracerWithZone = new WebTracerProvider().getTracer('default');

        const rootSpan = webTracerWithZone.startSpan('rootSpan');

        context.with(trace.setSpan(context.active(), rootSpan), () => {
          assert.ok(
            trace.getSpan(context.active()) === rootSpan,
            'Current span is rootSpan'
          );
          const concurrentSpan1 =
            webTracerWithZone.startSpan('concurrentSpan1');
          const concurrentSpan2 =
            webTracerWithZone.startSpan('concurrentSpan2');

          context.with(trace.setSpan(context.active(), concurrentSpan1), () => {
            setTimeout(() => {
              assert.ok(
                trace.getSpan(context.active()) === concurrentSpan1,
                'Current span is concurrentSpan1'
              );
            }, 10);
          });

          context.with(trace.setSpan(context.active(), concurrentSpan2), () => {
            setTimeout(() => {
              assert.ok(
                trace.getSpan(context.active()) === concurrentSpan2,
                'Current span is concurrentSpan2'
              );
              done();
            }, 20);
          });
        });
      });
    });

    describe('.startSpan()', function () {
      it('should assign resource to span', function () {
        const provider = new WebTracerProvider();
        const span = provider.getTracer('default').startSpan('my-span') as Span;
        assert.ok(span);
        assert.ok(span.resource);
        assert.equal(
          span.resource.attributes[ATTR_TELEMETRY_SDK_LANGUAGE],
          'webjs'
        );
      });
    });
  });
});
