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
import { NodeTracerRegistry } from '@opentelemetry/node';
import { plugin, IORedisPlugin } from '../src';
import * as ioredisTypes from 'ioredis';
import { NoopLogger } from '@opentelemetry/core';
import * as testUtils from '@opentelemetry/test-utils';
import { SpanKind, Status, CanonicalCode } from '@opentelemetry/types';
import { AttributeNames } from '../src/enums';

const memoryExporter = new InMemorySpanExporter();

const CONFIG = {
  host: process.env.OPENTELEMETRY_REDIS_HOST || 'localhost',
  port: parseInt(process.env.OPENTELEMETRY_REDIS_PORT || '63790', 10),
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
  const registry = new NodeTracerRegistry();
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
      testUtils.startDocker('redis');
    }

    ioredis = require('ioredis');
    registry.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
    plugin.enable(ioredis, registry, new NoopLogger());
  });

  after(() => {
    if (shouldTestLocal) {
      testUtils.cleanUpDocker('redis');
    }
  });

  it('should have correct module name', () => {
    assert.strictEqual(plugin.moduleName, IORedisPlugin.COMPONENT);
  });

  describe('#createClient()', () => {
    it('should propagate the current span to event handlers', done => {
      const span = registry.getTracer('ioredis-test').startSpan('test span');
      let client: ioredisTypes.Redis;
      const attributes = {
        ...DEFAULT_ATTRIBUTES,
        [AttributeNames.DB_STATEMENT]: 'connect',
      };
      const readyHandler = () => {
        const endedSpans = memoryExporter.getFinishedSpans();

        assert.strictEqual(
          registry.getTracer('ioredis-test').getCurrentSpan(),
          span
        );
        assert.strictEqual(endedSpans.length, 2);
        assert.strictEqual(endedSpans[0].name, `connect`);
        assert.strictEqual(endedSpans[1].name, `info`);
        testUtils.assertPropagation(endedSpans[0], span);

        testUtils.assertSpan(
          endedSpans[0],
          SpanKind.CLIENT,
          attributes,
          [],
          okStatus
        );
        span.end();
        assert.strictEqual(endedSpans.length, 3);
        assert.strictEqual(endedSpans[2].name, `test span`);

        client.quit(done);
        assert.strictEqual(endedSpans.length, 4);
        assert.strictEqual(endedSpans[3].name, `quit`);
      };
      const errorHandler = (err: Error) => {
        assert.ifError(err);
        client.quit(done);
      };

      registry.getTracer('ioredis-test').withSpan(span, () => {
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
      name: string;
      args: Array<string>;
      method: (cb: ioredisTypes.CallbackFunction<unknown>) => unknown;
    }> = [
      {
        description: 'insert',
        name: 'hset',
        args: ['hash', 'testField', 'testValue'],
        method: (cb: ioredisTypes.CallbackFunction<number>) =>
          client.hset('hash', 'testField', 'testValue', cb),
      },
      {
        description: 'get',
        name: 'get',
        args: ['test'],
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
      IOREDIS_CALLBACK_OPERATIONS.forEach(command => {
        it(`should create a child span for cb style ${command.description}`, done => {
          const attributes = {
            ...DEFAULT_ATTRIBUTES,
            [AttributeNames.DB_STATEMENT]: `${command.name} ${command.args.join(
              ' '
            )}`,
          };
          const span = registry
            .getTracer('ioredis-test')
            .startSpan('test span');
          registry.getTracer('ioredis-test').withSpan(span, () => {
            command.method((err, _result) => {
              assert.ifError(err);
              assert.strictEqual(memoryExporter.getFinishedSpans().length, 1);
              span.end();
              const endedSpans = memoryExporter.getFinishedSpans();
              assert.strictEqual(endedSpans.length, 2);
              assert.strictEqual(endedSpans[0].name, command.name);
              testUtils.assertSpan(
                endedSpans[0],
                SpanKind.CLIENT,
                attributes,
                [],
                okStatus
              );
              testUtils.assertPropagation(endedSpans[0], span);
              done();
            });
          });
        });
      });

      it('should create a child span for hset promise', async () => {
        const attributes = {
          ...DEFAULT_ATTRIBUTES,
          [AttributeNames.DB_STATEMENT]: 'hset hash random random',
        };
        const span = registry.getTracer('ioredis-test').startSpan('test span');
        await registry.getTracer('ioredis-test').withSpan(span, async () => {
          try {
            await client.hset('hash', 'random', 'random');
            assert.strictEqual(memoryExporter.getFinishedSpans().length, 1);
            span.end();
            const endedSpans = memoryExporter.getFinishedSpans();
            assert.strictEqual(endedSpans.length, 2);
            assert.strictEqual(endedSpans[0].name, `hset`);
            testUtils.assertSpan(
              endedSpans[0],
              SpanKind.CLIENT,
              attributes,
              [],
              okStatus
            );
            testUtils.assertPropagation(endedSpans[0], span);
          } catch (error) {
            assert.ifError(error);
          }
        });
      });

      it('should create a child span for streamify scanning', done => {
        const attributes = {
          ...DEFAULT_ATTRIBUTES,
          [AttributeNames.DB_STATEMENT]: 'scan 0',
        };
        const span = registry.getTracer('ioredis-test').startSpan('test span');
        registry.getTracer('ioredis-test').withSpan(span, () => {
          const stream = client.scanStream();
          stream
            .on('data', resultKeys => {
              // `resultKeys` is an array of strings representing key names.
              // Note that resultKeys may contain 0 keys, and that it will sometimes
              // contain duplicates due to SCAN's implementation in Redis.
              for (var i = 0; i < resultKeys.length; i++) {
                console.log(resultKeys[i]);
              }
            })
            .on('end', () => {
              console.log('all keys have been visited');
              assert.strictEqual(memoryExporter.getFinishedSpans().length, 1);
              span.end();
              const endedSpans = memoryExporter.getFinishedSpans();
              assert.strictEqual(endedSpans.length, 2);
              assert.strictEqual(endedSpans[0].name, `scan`);
              testUtils.assertSpan(
                endedSpans[0],
                SpanKind.CLIENT,
                attributes,
                [],
                okStatus
              );
              testUtils.assertPropagation(endedSpans[0], span);
              done();
            })
            .on('error', err => {
              done(err);
            });
        });
      });

      it('should create a child span for pubsub', async () => {
        const span = registry.getTracer('ioredis-test').startSpan('test span');
        await registry.getTracer('ioredis-test').withSpan(span, async () => {
          try {
            const pub = new ioredis(URL);
            const sub = new ioredis(URL);
            await sub.subscribe('news', 'music');
            await pub.publish('news', 'Hello world!');
            await pub.publish('music', 'Hello again!');
            await sub.unsubscribe('news', 'music');
            await sub.quit();
            await pub.quit();
            const endedSpans = memoryExporter.getFinishedSpans();
            assert.strictEqual(endedSpans.length, 11);
            span.end();
            assert.strictEqual(endedSpans.length, 12);
            const spanNames = [
              'connect',
              'connect',
              'subscribe',
              'info',
              'info',
              'subscribe',
              'publish',
              'publish',
              'unsubscribe',
              'quit',
              'quit',
              'test span',
            ];
            let i = 0;
            while (i < 12) {
              assert.strictEqual(endedSpans[i].name, spanNames[i]);
              i++;
            }

            const attributes = {
              ...DEFAULT_ATTRIBUTES,
              [AttributeNames.DB_STATEMENT]: 'subscribe news music',
            };
            testUtils.assertSpan(
              endedSpans[5],
              SpanKind.CLIENT,
              attributes,
              [],
              okStatus
            );
            testUtils.assertPropagation(endedSpans[0], span);
          } catch (error) {
            assert.ifError(error);
          }
        });
      });

      it(`should create a child span for lua`, done => {
        const attributes = {
          ...DEFAULT_ATTRIBUTES,
          [AttributeNames.DB_STATEMENT]: 'eval return {KEYS[1],ARGV[1]} 1 test',
        };

        const span = registry.getTracer('ioredis-test').startSpan('test span');
        registry.getTracer('ioredis-test').withSpan(span, () => {
          // This will define a command echo:
          client.defineCommand('echo', {
            numberOfKeys: 1,
            lua: 'return {KEYS[1],ARGV[1]}',
          });
          // Now `echo` can be used just like any other ordinary command,
          // and ioredis will try to use `EVALSHA` internally when possible for better performance.
          client.echo('test', (err, result) => {
            assert.ifError(err);

            assert.strictEqual(memoryExporter.getFinishedSpans().length, 2);
            span.end();
            const endedSpans = memoryExporter.getFinishedSpans();
            assert.strictEqual(endedSpans.length, 3);
            assert.strictEqual(endedSpans[2].name, 'test span');
            assert.strictEqual(endedSpans[1].name, 'eval');
            assert.strictEqual(endedSpans[0].name, 'evalsha');
            testUtils.assertSpan(
              endedSpans[1],
              SpanKind.CLIENT,
              attributes,
              [],
              okStatus
            );
            testUtils.assertPropagation(endedSpans[0], span);
            done();
          });
        });
      });

      it(`should create a child span for multi/transaction`, done => {
        const attributes = {
          ...DEFAULT_ATTRIBUTES,
          [AttributeNames.DB_STATEMENT]: 'multi',
        };

        const span = registry.getTracer('ioredis-test').startSpan('test span');
        registry.getTracer('ioredis-test').withSpan(span, () => {
          client
            .multi()
            .set('foo', 'bar')
            .get('foo')
            .exec((err, _results) => {
              assert.ifError(err);

              assert.strictEqual(memoryExporter.getFinishedSpans().length, 4);
              span.end();
              const endedSpans = memoryExporter.getFinishedSpans();
              assert.strictEqual(endedSpans.length, 5);
              assert.strictEqual(endedSpans[0].name, 'multi');
              assert.strictEqual(endedSpans[1].name, 'set');
              assert.strictEqual(endedSpans[2].name, 'get');
              assert.strictEqual(endedSpans[3].name, 'exec');
              testUtils.assertSpan(
                endedSpans[0],
                SpanKind.CLIENT,
                attributes,
                [],
                okStatus
              );
              testUtils.assertPropagation(endedSpans[0], span);
              done();
            });
        });
      });

      it(`should create a child span for pipeline`, done => {
        const attributes = {
          ...DEFAULT_ATTRIBUTES,
          [AttributeNames.DB_STATEMENT]: 'set foo bar',
        };

        const span = registry.getTracer('ioredis-test').startSpan('test span');
        registry.getTracer('ioredis-test').withSpan(span, () => {
          const pipeline = client.pipeline();
          pipeline.set('foo', 'bar');
          pipeline.del('cc');
          pipeline.exec((err, results) => {
            assert.ifError(err);

            assert.strictEqual(memoryExporter.getFinishedSpans().length, 2);
            span.end();
            const endedSpans = memoryExporter.getFinishedSpans();
            assert.strictEqual(endedSpans.length, 3);
            assert.strictEqual(endedSpans[0].name, 'set');
            assert.strictEqual(endedSpans[1].name, 'del');
            assert.strictEqual(endedSpans[2].name, 'test span');
            testUtils.assertSpan(
              endedSpans[0],
              SpanKind.CLIENT,
              attributes,
              [],
              okStatus
            );
            testUtils.assertPropagation(endedSpans[0], span);
            done();
          });
        });
      });

      it('should create a child span for get promise', async () => {
        const attributes = {
          ...DEFAULT_ATTRIBUTES,
          [AttributeNames.DB_STATEMENT]: 'get test',
        };
        const span = registry.getTracer('ioredis-test').startSpan('test span');
        await registry.getTracer('ioredis-test').withSpan(span, async () => {
          try {
            const value = await client.get('test');
            assert.strictEqual(value, 'data');
            assert.strictEqual(memoryExporter.getFinishedSpans().length, 1);
            span.end();
            const endedSpans = memoryExporter.getFinishedSpans();
            assert.strictEqual(endedSpans.length, 2);
            assert.strictEqual(endedSpans[0].name, `get`);
            testUtils.assertSpan(
              endedSpans[0],
              SpanKind.CLIENT,
              attributes,
              [],
              okStatus
            );
            testUtils.assertPropagation(endedSpans[0], span);
          } catch (error) {
            assert.ifError(error);
          }
        });
      });

      it('should create a child span for del', async () => {
        const attributes = {
          ...DEFAULT_ATTRIBUTES,
          [AttributeNames.DB_STATEMENT]: 'del test',
        };
        const span = registry.getTracer('ioredis-test').startSpan('test span');
        await registry.getTracer('ioredis-test').withSpan(span, async () => {
          try {
            const result = await client.del('test');
            assert.strictEqual(result, 1);
            assert.strictEqual(memoryExporter.getFinishedSpans().length, 1);
            span.end();
            const endedSpans = memoryExporter.getFinishedSpans();
            assert.strictEqual(endedSpans.length, 2);
            assert.strictEqual(endedSpans[0].name, 'del');
            testUtils.assertSpan(
              endedSpans[0],
              SpanKind.CLIENT,
              attributes,
              [],
              okStatus
            );
            testUtils.assertPropagation(endedSpans[0], span);
          } catch (error) {
            assert.ifError(error);
          }
        });
      });
    });

    describe('Removing instrumentation', () => {
      before(() => {
        plugin.disable();
      });

      IOREDIS_CALLBACK_OPERATIONS.forEach(operation => {
        it(`should not create a child span for cb style ${operation.description}`, done => {
          const span = registry
            .getTracer('ioredis-test')
            .startSpan('test span');
          registry.getTracer('ioredis-test').withSpan(span, () => {
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

      it('should not create a child span for hset promise upon error', async () => {
        const span = registry.getTracer('ioredis-test').startSpan('test span');
        await registry.getTracer('ioredis-test').withSpan(span, async () => {
          try {
            await client.hset('hash', 'random', 'random');
            assert.strictEqual(memoryExporter.getFinishedSpans().length, 0);
            span.end();
            const endedSpans = memoryExporter.getFinishedSpans();
            assert.strictEqual(endedSpans.length, 1);
            assert.strictEqual(endedSpans[0].name, `test span`);
          } catch (error) {
            assert.ifError(error);
          }
        });
      });
    });
  });
});
