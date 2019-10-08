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
import * as types from '@opentelemetry/types';
import { TracerFactoryDelegate } from '../../src/trace/TracerFactoryDelegate';
import { NoopTracerFactory, NoopTracer } from '../../src';

describe('TracerFactoryDelegate', () => {
  const functions = ['getTracer'];

  describe('constructor', () => {
    it('should not crash with default constructor', () => {
      functions.forEach(fn => {
        const tracerFactory = new TracerFactoryDelegate();
        try {
          ((tracerFactory as unknown) as { [fn: string]: Function })[fn](); // Try to run the function
          assert.ok(true, fn);
        } catch (err) {
          if (err.message !== 'Method not implemented.') {
            assert.ok(true, fn);
          }
        }
      });
    });

    it('should allow fallback tracer factory to be set', () => {
      const dummyTracerFactory = new DummyTracerFactory();
      const tracerFactoryDelegate = new TracerFactoryDelegate(
        dummyTracerFactory
      );

      tracerFactoryDelegate.getTracer('dummy');
      assert.deepStrictEqual(dummyTracerFactory.spyCounter, 1);
    });

    it('should use user provided tracer factory if provided', () => {
      const dummyTracerFactory = new DummyTracerFactory();
      const tracerFactoryDelegate = new TracerFactoryDelegate(
        dummyTracerFactory
      );

      tracerFactoryDelegate.getTracer('foo', '1.0.0');
      assert.deepStrictEqual(dummyTracerFactory.spyCounter, 1);
    });
  });

  describe('.start/.stop()', () => {
    it('should use the fallback tracer factory when stop is called', () => {
      const dummyTracerFactoryUser = new DummyTracerFactory();
      const dummyTracerFactoryFallback = new DummyTracerFactory();
      const tracerFactoryDelegate = new TracerFactoryDelegate(
        dummyTracerFactoryUser,
        dummyTracerFactoryFallback
      );

      tracerFactoryDelegate.stop();
      tracerFactoryDelegate.getTracer('fallback');
      assert.deepStrictEqual(dummyTracerFactoryUser.spyCounter, 0);
      assert.deepStrictEqual(dummyTracerFactoryFallback.spyCounter, 1);
    });

    it('should use the user tracer factory when start is called', () => {
      const dummyTracerFactoryUser = new DummyTracerFactory();
      const dummyTracerFactoryFallback = new DummyTracerFactory();
      const tracerFactoryDelegate = new TracerFactoryDelegate(
        dummyTracerFactoryUser,
        dummyTracerFactoryFallback
      );

      tracerFactoryDelegate.stop();
      tracerFactoryDelegate.getTracer('fallback');
      assert.deepStrictEqual(dummyTracerFactoryUser.spyCounter, 0);
      assert.deepStrictEqual(dummyTracerFactoryFallback.spyCounter, 1);

      tracerFactoryDelegate.start();
      tracerFactoryDelegate.getTracer('user');
      assert.deepStrictEqual(dummyTracerFactoryUser.spyCounter, 1);
      assert.deepStrictEqual(
        dummyTracerFactoryFallback.spyCounter,
        1,
        'Only user tracer factory counter is incremented'
      );
    });
  });

  class DummyTracerFactory extends NoopTracerFactory {
    spyCounter = 0;

    getTracer(name?: string, version?: string): types.Tracer {
      this.spyCounter = this.spyCounter + 1;
      return new NoopTracer();
    }
  }
});
