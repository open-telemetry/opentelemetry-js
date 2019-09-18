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

import * as assert from 'assert';
import {
  ALWAYS_SAMPLER,
  BinaryTraceContext,
  HttpTraceContext,
  NEVER_SAMPLER,
  NoopLogger,
  NoRecordingSpan,
} from '@opentelemetry/core';
import { NodeTracer } from '../src/NodeTracer';
import { TraceFlags } from '@opentelemetry/types';
import { Span } from '@opentelemetry/basic-tracer';

const sleep = (time: number) =>
  new Promise(resolve => {
    return setTimeout(resolve, time);
  });

describe('NodeTracer', () => {
  describe('constructor', () => {
    it('should construct an instance with required only options', () => {
      const tracer = new NodeTracer({});
      assert.ok(tracer instanceof NodeTracer);
    });

    it('should construct an instance with binary format', () => {
      const tracer = new NodeTracer({
        binaryFormat: new BinaryTraceContext(),
      });
      assert.ok(tracer instanceof NodeTracer);
    });

    it('should construct an instance with http text format', () => {
      const tracer = new NodeTracer({
        httpTextFormat: new HttpTraceContext(),
      });
      assert.ok(tracer instanceof NodeTracer);
    });

    it('should construct an instance with logger', () => {
      const tracer = new NodeTracer({
        logger: new NoopLogger(),
      });
      assert.ok(tracer instanceof NodeTracer);
    });

    it('should construct an instance with sampler', () => {
      const tracer = new NodeTracer({
        sampler: ALWAYS_SAMPLER,
      });
      assert.ok(tracer instanceof NodeTracer);
    });

    it('should construct an instance with default attributes', () => {
      const tracer = new NodeTracer({
        defaultAttributes: {
          region: 'eu-west',
          asg: 'my-asg',
        },
      });
      assert.ok(tracer instanceof NodeTracer);
    });
  });

  describe('.startSpan()', () => {
    it('should start a span with name only', () => {
      const tracer = new NodeTracer({
        logger: new NoopLogger(),
      });
      const span = tracer.startSpan('my-span');
      assert.ok(span);
    });

    it('should start a span with name and options', () => {
      const tracer = new NodeTracer({
        logger: new NoopLogger(),
      });
      const span = tracer.startSpan('my-span', {});
      assert.ok(span);
    });

    it('should return a default span with no sampling', () => {
      const tracer = new NodeTracer({
        sampler: NEVER_SAMPLER,
        logger: new NoopLogger(),
      });
      const span = tracer.startSpan('my-span');
      assert.ok(span instanceof NoRecordingSpan);
      assert.strictEqual(span.context().traceFlags, TraceFlags.UNSAMPLED);
      assert.strictEqual(span.isRecordingEvents(), false);
    });

    // @todo: implement
    it('should start a Span with always sampling');

    it('should set default attributes on span', () => {
      const defaultAttributes = {
        foo: 'bar',
      };
      const tracer = new NodeTracer({
        defaultAttributes,
      });

      const span = tracer.startSpan('my-span') as Span;
      assert.ok(span instanceof Span);
      assert.deepStrictEqual(span.attributes, defaultAttributes);
    });
  });

  describe('.getCurrentSpan()', () => {
    it('should return null with AsyncHooksScopeManager when no span started', () => {
      const tracer = new NodeTracer({});
      assert.deepStrictEqual(tracer.getCurrentSpan(), null);
    });
  });

  describe('.withSpan()', () => {
    it('should run scope with AsyncHooksScopeManager scope manager', done => {
      const tracer = new NodeTracer({});
      const span = tracer.startSpan('my-span');
      tracer.withSpan(span, () => {
        assert.deepStrictEqual(tracer.getCurrentSpan(), span);
        return done();
      });
      assert.deepStrictEqual(tracer.getCurrentSpan(), null);
    });

    it('should run scope with AsyncHooksScopeManager scope manager with multiple spans', done => {
      const tracer = new NodeTracer({});
      const span = tracer.startSpan('my-span');
      tracer.withSpan(span, () => {
        assert.deepStrictEqual(tracer.getCurrentSpan(), span);

        const span1 = tracer.startSpan('my-span1', { parent: span });
        tracer.withSpan(span1, () => {
          assert.deepStrictEqual(tracer.getCurrentSpan(), span1);
          assert.deepStrictEqual(
            span1.context().traceId,
            span.context().traceId
          );
          return done();
        });
      });
      // when span ended.
      // @todo: below check is not running.
      assert.deepStrictEqual(tracer.getCurrentSpan(), null);
    });

    it('should find correct scope with promises', done => {
      const tracer = new NodeTracer({});
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

  describe('.bind()', () => {
    it('should bind scope with AsyncHooksScopeManager scope manager', done => {
      const tracer = new NodeTracer({});
      const span = tracer.startSpan('my-span');
      const fn = () => {
        assert.deepStrictEqual(tracer.getCurrentSpan(), span);
        return done();
      };
      const patchedFn = tracer.bind(fn, span);
      return patchedFn();
    });
  });

  describe('.recordSpanData()', () => {
    // @todo: implement
    it('should call exporters with span data');
  });

  describe('.getBinaryFormat()', () => {
    it('should get default binary formatter', () => {
      const tracer = new NodeTracer({});
      assert.ok(tracer.getBinaryFormat() instanceof BinaryTraceContext);
    });
  });

  describe('.getHttpTextFormat()', () => {
    it('should get default HTTP text formatter', () => {
      const tracer = new NodeTracer({});
      assert.ok(tracer.getHttpTextFormat() instanceof HttpTraceContext);
    });
  });
});
