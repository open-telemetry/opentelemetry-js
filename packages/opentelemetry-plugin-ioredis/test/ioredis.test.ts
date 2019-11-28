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
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import { NodeTracer } from '@opentelemetry/node';
import { plugin, IORedisPlugin } from '../src';
import * as ioredisTypes from 'ioredis';
import { NoopLogger } from '@opentelemetry/core';
import * as dockerUtils from './testUtils';
import * as assertionUtils from './assertionUtils';
import { SpanKind, Status, CanonicalCode } from '@opentelemetry/types';
import { AttributeNames } from '../src/enums';

const memoryExporter = new InMemorySpanExporter();

const CONFIG = {
  host: process.env.OPENTELEMETRY_REDIS_HOST || 'localhost',
  port: process.env.OPENTELEMETRY_REDIS_PORT || 63790,
};

const URL = `redis://${CONFIG.host}:${CONFIG.port}`;

const DEFAULT_ATTRIBUTES = {
  [AttributeNames.COMPONENT]: IORedisPlugin.COMPONENT,
  [AttributeNames.DB_TYPE]: IORedisPlugin.DB_TYPE,
  [AttributeNames.PEER_HOSTNAME]: CONFIG.host,
  [AttributeNames.PEER_PORT]: CONFIG.port,
  [AttributeNames.PEER_ADDRESS]: URL,
};

const okStatus: Status = {
  code: CanonicalCode.OK,
};

describe('ioredis', () => {
  const tracer = new NodeTracer();
  let ioredis: typeof ioredisTypes;
  const shouldTestLocal = process.env.RUN_REDIS_TESTS_LOCAL;
  const shouldTest = process.env.RUN_REDIS_TESTS || shouldTestLocal;

  before(function() {
    // needs to be "function" to have MochaContext "this" scope
    if (!shouldTest) {
      // this.skip() workaround
      // https://github.com/mochajs/mocha/issues/2683#issuecomment-375629901
      this.test!.parent!.pending = true;
      this.skip();
    }

    if (shouldTestLocal) {
      dockerUtils.startDocker();
    }

    ioredis = require('ioredis');
    tracer.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
    plugin.enable(ioredis, tracer, new NoopLogger());
  });

  after(() => {
    if (shouldTestLocal) {
      dockerUtils.cleanUpDocker();
    }
  });

  it('should have correct module name', () => {
    assert.strictEqual(plugin.moduleName, IORedisPlugin.COMPONENT);
  });

  describe('#createClient()', () => {
    it('should propagate the current span to event handlers', done => {
      const span = tracer.startSpan('test span');
      let client: ioredisTypes.Redis;
      const readyHandler = () => {
        assert.strictEqual(tracer.getCurrentSpan(), span);
        client.quit(done);
      };
      const errorHandler = (err: Error) => {
        assert.ifError(err);
        client.quit(done);
      };

      tracer.withSpan(span, () => {
        client = new ioredis(URL);
        client.on('ready', readyHandler);
        client.on('error', errorHandler);
      });
    });
  });

  describe('#send_internal_message()', () => {
    let client: ioredisTypes.Redis;

    const IOREDIS_CALLBACK_OPERATIONS: Array<{
      description: string;
      command: string;
      method: (cb: ioredisTypes.CallbackFunction<unknown>) => unknown;
    }> = [
      {
        description: 'insert',
        command: 'hset',
        method: (cb: ioredisTypes.CallbackFunction<number>) =>
          client.hset('hash', 'testField', 'testValue', cb),
      },
      {
        description: 'get',
        command: 'get',
        method: (cb: ioredisTypes.CallbackFunction<string | null>) =>
          client.get('test', cb),
      },
    ];

    before(done => {
      client = new ioredis(URL);
      client.on('error', err => {
        done(err);
      });
      client.on('ready', done);
    });

    beforeEach(async () => {
      await client.set('test', 'data');
      memoryExporter.reset();
    });

    after(done => {
      client.quit(done);
    });

    afterEach(async () => {
      client.del('hash');
      memoryExporter.reset();
    });

    describe('Instrumenting query operations', () => {
      it('should create a child span for hset promise', done => {
        const attributes = {
          ...DEFAULT_ATTRIBUTES,
          [AttributeNames.DB_STATEMENT]: 'hset hash random random',
        };
        const span = tracer.startSpan('test span');
        tracer.withSpan(span, async () => {
          try {
            await client.hset('hash', 'random', 'random');
            assert.strictEqual(memoryExporter.getFinishedSpans().length, 1);
            span.end();
            const endedSpans = memoryExporter.getFinishedSpans();
            assert.strictEqual(endedSpans.length, 2);
            assert.strictEqual(endedSpans[0].name, `hset`);
            assertionUtils.assertSpan(
              endedSpans[0],
              SpanKind.CLIENT,
              attributes,
              [],
              okStatus
            );
            assertionUtils.assertPropagation(endedSpans[0], span);
            done();
          } catch (error) {
            assert.ifError(error);
            done();
          }
        });
      });

      it('should create a child span for get promise', done => {
        const attributes = {
          ...DEFAULT_ATTRIBUTES,
          [AttributeNames.DB_STATEMENT]: 'get test',
        };
        const span = tracer.startSpan('test span');
        tracer.withSpan(span, async () => {
          try {
            const value = await client.get('test');
            assert.strictEqual(value, 'data');
            assert.strictEqual(memoryExporter.getFinishedSpans().length, 1);
            span.end();
            const endedSpans = memoryExporter.getFinishedSpans();
            assert.strictEqual(endedSpans.length, 2);
            assert.strictEqual(endedSpans[0].name, `get`);
            assertionUtils.assertSpan(
              endedSpans[0],
              SpanKind.CLIENT,
              attributes,
              [],
              okStatus
            );
            assertionUtils.assertPropagation(endedSpans[0], span);
            done();
          } catch (error) {
            assert.ifError(error);
            done();
          }
        });
      });

      it('should create a child span for del', done => {
        const attributes = {
          ...DEFAULT_ATTRIBUTES,
          [AttributeNames.DB_STATEMENT]: 'del test',
        };
        const span = tracer.startSpan('test span');
        tracer.withSpan(span, async () => {
          try {
            const result = await client.del('test');
            assert.strictEqual(result, 1);
            assert.strictEqual(memoryExporter.getFinishedSpans().length, 1);
            span.end();
            const endedSpans = memoryExporter.getFinishedSpans();
            assert.strictEqual(endedSpans.length, 2);
            assert.strictEqual(endedSpans[0].name, 'del');
            assertionUtils.assertSpan(
              endedSpans[0],
              SpanKind.CLIENT,
              attributes,
              [],
              okStatus
            );
            assertionUtils.assertPropagation(endedSpans[0], span);
            done();
          } catch (error) {
            assert.ifError(error);
            done();
          }
        });
      });

      IOREDIS_CALLBACK_OPERATIONS.forEach(operation => {
        it(`should create a child span for ${operation.description}`, done => {
          const attributes = {
            ...DEFAULT_ATTRIBUTES,
            [AttributeNames.DB_STATEMENT]: operation.command,
          };
          const span = tracer.startSpan('test span');
          tracer.withSpan(span, () => {
            operation.method((err, _result) => {
              assert.ifError(err);
              assert.strictEqual(memoryExporter.getFinishedSpans().length, 1);
              span.end();
              const endedSpans = memoryExporter.getFinishedSpans();
              assert.strictEqual(endedSpans.length, 2);
              assert.strictEqual(
                endedSpans[0].name,
                `redis-${operation.command}`
              );
              assertionUtils.assertSpan(
                endedSpans[0],
                SpanKind.CLIENT,
                attributes,
                [],
                okStatus
              );
              assertionUtils.assertPropagation(endedSpans[0], span);
              done();
            });
          });
        });
      });
    });

    describe('Removing instrumentation', () => {
      before(() => {
        plugin.disable();
      });

      IOREDIS_CALLBACK_OPERATIONS.forEach(operation => {
        it(`should not create a child span for ${operation.description}`, done => {
          const span = tracer.startSpan('test span');
          tracer.withSpan(span, () => {
            operation.method((err, _) => {
              assert.ifError(err);
              assert.strictEqual(memoryExporter.getFinishedSpans().length, 0);
              span.end();
              const endedSpans = memoryExporter.getFinishedSpans();
              assert.strictEqual(endedSpans.length, 1);
              assert.strictEqual(endedSpans[0], span);
              done();
            });
          });
        });
      });
    });
  });
});
