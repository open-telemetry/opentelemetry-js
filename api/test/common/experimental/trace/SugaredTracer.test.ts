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
import { wrapTracer } from '../../../../src';
import * as assert from 'assert';
import { NoopTracerProvider } from '../../../../src/trace/NoopTracerProvider';
import { NoopTracer } from '../../../../src/trace/NoopTracer';
import { Span } from '../../../../src';
import { Context, context, SpanOptions } from '../../../../src';

describe('SugaredTracer', () => {
  class TestTracer extends NoopTracer {
    public calls: IArguments[] = [];

    override startActiveSpan<F extends (span: Span) => ReturnType<F>>(
      name: string,
      fn: F
    ): ReturnType<F> {
      this.calls.push(arguments);
      return super.startActiveSpan(name, fn);
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

  describe('wrapTracer()', () => {
    it('still provides standard tracer functions', () => {
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

  describe('withActiveSpan()', () => {
    it('proxies value', () => {
      const result = sugaredTracer.withActiveSpan('test', span => {
        return 'result';
      });

      assert.strictEqual(result, 'result', 'Unexpected result');
    });

    it('returns promise if wrapped function returns promise', async () => {
      const result = sugaredTracer.withActiveSpan('test', span => {
        return Promise.resolve('result');
      });

      assert.ok(typeof result.then == 'function');
      assert.strictEqual(await result, 'result', 'Unexpected result');
    });

    it('returns void', () => {
      const result = sugaredTracer.withActiveSpan('test', (span: Span) => {
        return;
      });

      assert.strictEqual(result, undefined);
    });
  });
});
