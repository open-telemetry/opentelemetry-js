/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { TraceFlags } from '@opentelemetry/types';
import * as assert from 'assert';
import { StackScopeManager } from '../src/StackScopeManager';
import { WebTracer, WebTracerConfig } from '../src/WebTracer';
import { Span } from '@opentelemetry/basic-tracer';
import {
  NEVER_SAMPLER,
  NoopLogger,
  NoRecordingSpan,
} from '@opentelemetry/core';

const sleep = (time: number) =>
  new Promise(resolve => {
    return setTimeout(resolve, time);
  });

describe('WebTracer', () => {
  let tracer: WebTracer;
  describe('constructor', () => {
    let defaultOptions: WebTracerConfig;
    beforeEach(() => {
      defaultOptions = {
        scopeManager: new StackScopeManager(),
      };
    });

    it('should construct an instance with required only options', () => {
      tracer = new WebTracer(Object.assign({}, defaultOptions));
      assert.ok(tracer instanceof WebTracer);
    });
  });

  describe('.startSpan()', () => {
    it('should start a span with name only', () => {
      tracer = new WebTracer({
        logger: new NoopLogger(),
      });
      const span = tracer.startSpan('my-span');
      assert.ok(span);
    });

    it('should start a span with name and options', () => {
      tracer = new WebTracer({
        logger: new NoopLogger(),
      });
      const span = tracer.startSpan('my-span', {});
      assert.ok(span);
    });

    it('should return a default span with no sampling', () => {
      tracer = new WebTracer({
        sampler: NEVER_SAMPLER,
        logger: new NoopLogger(),
      });
      const span = tracer.startSpan('my-span');
      assert.ok(span instanceof NoRecordingSpan);
      assert.strictEqual(span.context().traceFlags, TraceFlags.UNSAMPLED);
      assert.strictEqual(span.isRecordingEvents(), false);
    });

    // @todo: implement
    // it('should start a Span with always sampling');

    it('should set default attributes on span', () => {
      const defaultAttributes = {
        foo: 'bar',
      };
      tracer = new WebTracer({
        scopeManager: new StackScopeManager(),
        defaultAttributes,
      });

      const span = tracer.startSpan('my-span') as Span;
      assert.ok(span instanceof Span);
      assert.deepStrictEqual(span.attributes, defaultAttributes);
    });
  });

  describe('.getCurrentSpan()', () => {
    it('should return window with StackScopeManager when no span started', () => {
      tracer = new WebTracer({});
      assert.strictEqual(tracer.getCurrentSpan(), window);
    });
  });

  describe('.withSpan()', () => {
    it('should run scope with StackScopeManager', done => {
      tracer = new WebTracer({});
      const span = tracer.startSpan('my-span');
      tracer.withSpan(span, () => {
        assert.strictEqual(tracer.getCurrentSpan(), span);
        return done();
      });
      assert.deepStrictEqual(tracer.getCurrentSpan(), null);
    });

    it('should run scope with StackScopeManager and with multiple spans', () => {
      tracer = new WebTracer({});
      const span = tracer.startSpan('my-span');
      tracer.withSpan(span, () => {
        assert.deepStrictEqual(tracer.getCurrentSpan(), span);
        const span1 = tracer.startSpan('my-span1', { parent: span });
        tracer.withSpan(span1, () => {
          const span2 = tracer.startSpan('my-span2', { parent: span });
          tracer.withSpan(span2, () => {
            assert.deepStrictEqual(tracer.getCurrentSpan(), span2);
            assert.deepStrictEqual(
              span2.context().traceId,
              span.context().traceId
            );
          });
          assert.deepStrictEqual(tracer.getCurrentSpan(), span1);
          assert.deepStrictEqual(
            span1.context().traceId,
            span.context().traceId
          );
        });
      });
      assert.strictEqual(tracer.getCurrentSpan(), window);
    });

    // @TODO async doesn't work yet
    xit('should find correct scope with promises', done => {
      tracer = new WebTracer({});
      const span = tracer.startSpan('my-span');
      tracer.withSpan(span, async () => {
        for (let i = 0; i < 3; i++) {
          await sleep(5).then(() => {
            assert.deepStrictEqual(tracer.getCurrentSpan(), span);
          });
        }
        return done();
      });
      assert.deepStrictEqual(tracer.getCurrentSpan(), null);
    });
  });
});
