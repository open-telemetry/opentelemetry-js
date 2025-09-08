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
import { wrapTracer } from '../../../../src/experimental';
import * as assert from 'assert';
import { NoopTracerProvider } from '../../../../src/trace/NoopTracerProvider';
import { NoopTracer } from '../../../../src/trace/NoopTracer';
import { Span } from '../../../../src';
import { Context, context, SpanOptions } from '../../../../src';

describe('SugaredTracer', function () {
  class TestTracer extends NoopTracer {
    public calls: IArguments[] = [];

    override startActiveSpan<F extends (span: Span) => ReturnType<F>>(
      name: string,
      arg2?: SpanOptions,
      arg3?: Context,
      arg4?: F
    ): ReturnType<F> | undefined {
      this.calls.push(arguments);
      return super.startActiveSpan(name, arg2, arg3, arg4 as F);
    }

    override startSpan(
      name: string,
      options?: SpanOptions,
      _context: Context = context.active()
    ): Span {
      this.calls.push(arguments);
      return super.startSpan(name, options, _context);
    }
  }

  class TestTracerProvider extends NoopTracerProvider {
    override getTracer() {
      return new TestTracer();
    }
  }

  const tracer = new TestTracerProvider().getTracer();
  const sugaredTracer = wrapTracer(tracer);

  afterEach(() => {
    tracer.calls = [];
  });

  describe('wrapTracer()', function () {
    it('still provides standard tracer functions', function () {
      assert.ok(
        typeof sugaredTracer.startSpan === 'function',
        'startSpan is missing'
      );
      assert.ok(
        typeof sugaredTracer.startActiveSpan === 'function',
        'startActiveSpan is missing'
      );
    });
  });

  describe('withActiveSpan()', function () {
    it('proxies value with minimal args', function () {
      const result = sugaredTracer.withActiveSpan('test', span => {
        return 'result';
      });

      assert.strictEqual(result, 'result', 'Unexpected result');

      assert.strictEqual(tracer.calls.length, 2); // ensure that startActiveSpan and startSpan is called
    });

    it('proxies value with context', function () {
      const result = sugaredTracer.withActiveSpan(
        'test',
        { onException: e => e },
        span => {
          return 'result';
        }
      );

      assert.strictEqual(result, 'result', 'Unexpected result');

      assert.strictEqual(tracer.calls.length, 2); // ensure that startActiveSpan and startSpan is called
    });

    it('proxies value with context', function () {
      const result = sugaredTracer.withActiveSpan(
        'test',
        { onException: e => e },
        context.active(),
        span => {
          return 'result';
        }
      );

      assert.strictEqual(result, 'result', 'Unexpected result');

      assert.strictEqual(tracer.calls.length, 2); // ensure that startActiveSpan and startSpan is called
    });

    it('returns promise if wrapped function returns promise', async function () {
      const result = sugaredTracer.withActiveSpan('test', span => {
        return Promise.resolve('result');
      });

      assert.ok(typeof result.then == 'function');
      assert.strictEqual(await result, 'result', 'Unexpected result');
    });

    it('returns void', function () {
      const result = sugaredTracer.withActiveSpan('test', (span: Span) => {
        return;
      });

      assert.strictEqual(result, undefined);
    });
  });

  describe('withSpan()', function () {
    it('proxies value', function () {
      const result = sugaredTracer.withSpan('test', span => {
        return 'result';
      });

      assert.strictEqual(result, 'result', 'Unexpected result');
    });

    it('returns promise if wrapped function returns promise', async function () {
      const result = sugaredTracer.withSpan('test', span => {
        return Promise.resolve('result');
      });

      assert.ok(typeof result.then == 'function');
      assert.strictEqual(await result, 'result', 'Unexpected result');
    });

    it('returns void', function () {
      const result = sugaredTracer.withSpan('test', (span: Span) => {
        return;
      });

      assert.strictEqual(result, undefined);
    });
  });
});
