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

import {
  Attributes,
  CanonicalCode,
  context,
  Span,
  SpanKind,
  Status,
  TimedEvent,
} from '@opentelemetry/api';
import { NoopLogger } from '@opentelemetry/core';
import { NodeTracerProvider } from '@opentelemetry/node';
import { AsyncHooksScopeManager } from '@opentelemetry/scope-async-hooks';
import * as testUtils from '@opentelemetry/test-utils';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import * as assert from 'assert';
import * as pg from 'pg';
import { plugin, PostgresPlugin } from '../src';
import { AttributeNames } from '../src/enums';

const memoryExporter = new InMemorySpanExporter();

const CONFIG = {
  user: process.env.POSTGRES_USER || 'postgres',
  database: process.env.POSTGRES_DB || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT
    ? parseInt(process.env.POSTGRES_PORT, 10)
    : 54320,
};

const DEFAULT_ATTRIBUTES = {
  [AttributeNames.COMPONENT]: PostgresPlugin.COMPONENT,
  [AttributeNames.DB_INSTANCE]: CONFIG.database,
  [AttributeNames.DB_TYPE]: PostgresPlugin.DB_TYPE,
  [AttributeNames.PEER_HOSTNAME]: CONFIG.host,
  [AttributeNames.PEER_ADDRESS]: `jdbc:postgresql://${CONFIG.host}:${CONFIG.port}/${CONFIG.database}`,
  [AttributeNames.PEER_PORT]: CONFIG.port,
  [AttributeNames.DB_USER]: CONFIG.user,
};

const okStatus: Status = {
  code: CanonicalCode.OK,
};
const unknownStatus: Status = {
  code: CanonicalCode.UNKNOWN,
};

const runCallbackTest = (
  span: Span | null,
  attributes: Attributes,
  events: TimedEvent[],
  status: Status = okStatus,
  spansLength = 1,
  spansIndex = 0
) => {
  const spans = memoryExporter.getFinishedSpans();
  assert.strictEqual(spans.length, spansLength);
  const pgSpan = spans[spansIndex];
  testUtils.assertSpan(pgSpan, SpanKind.CLIENT, attributes, events, status);
  if (span) {
    testUtils.assertPropagation(pgSpan, span);
  }
};

describe('pg@7.x', () => {
  let client: pg.Client;
  let scopeManager: AsyncHooksScopeManager;
  const provider = new NodeTracerProvider();
  const tracer = provider.getTracer('external');
  const logger = new NoopLogger();
  const testPostgres = process.env.RUN_POSTGRES_TESTS; // For CI: assumes local postgres db is already available
  const testPostgresLocally = process.env.RUN_POSTGRES_TESTS_LOCAL; // For local: spins up local postgres db via docker
  const shouldTest = testPostgres || testPostgresLocally; // Skips these tests if false (default)

  before(async function() {
    if (!shouldTest) {
      // this.skip() workaround
      // https://github.com/mochajs/mocha/issues/2683#issuecomment-375629901
      this.test!.parent!.pending = true;
      this.skip();
    }
    provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
    if (testPostgresLocally) {
      testUtils.startDocker('postgres');
    }

    client = new pg.Client(CONFIG);
    try {
      await client.connect();
    } catch (e) {
      throw e;
    }
  });

  after(async () => {
    if (testPostgresLocally) {
      testUtils.cleanUpDocker('postgres');
    }
    await client.end();
  });

  beforeEach(function() {
    plugin.enable(pg, provider, logger);
    scopeManager = new AsyncHooksScopeManager().enable();
    context.initGlobalContextManager(scopeManager);
  });

  afterEach(() => {
    memoryExporter.reset();
    plugin.disable();
    scopeManager.disable();
  });

  it('should return a plugin', () => {
    assert.ok(plugin instanceof PostgresPlugin);
  });

  it('should have correct moduleName', () => {
    assert.strictEqual(plugin.moduleName, 'pg');
  });

  it('should maintain pg module error throwing behavior with bad arguments', () => {
    const assertPgError = (e: Error) => {
      const src = e.stack!.split('\n').map(line => line.trim())[1];
      return /node_modules[/\\]pg/.test(src);
    };

    assert.throws(
      () => {
        (client as any).query();
      },
      assertPgError,
      'pg should throw when no args provided'
    );
    runCallbackTest(null, DEFAULT_ATTRIBUTES, [], unknownStatus);
    memoryExporter.reset();

    assert.doesNotThrow(
      () =>
        (client as any).query({ foo: 'bar' }, undefined, () => {
          runCallbackTest(
            null,
            {
              ...DEFAULT_ATTRIBUTES,
            },
            [],
            unknownStatus
          );
        }),
      'pg should not throw when invalid config args are provided'
    );
  });

  describe('#client.query(...)', () => {
    it('should not return a promise if callback is provided', done => {
      const res = client.query('SELECT NOW()', (err, res) => {
        assert.strictEqual(err, null);
        done();
      });
      assert.strictEqual(res, undefined, 'No promise is returned');
    });

    it('should return a promise if callback is provided', done => {
      const resPromise = client.query('SELECT NOW()');
      resPromise
        .then(res => {
          assert.ok(res);
          done();
        })
        .catch((err: Error) => {
          assert.ok(false, err.message);
        });
    });

    it('should intercept client.query(text, callback)', done => {
      const attributes = {
        ...DEFAULT_ATTRIBUTES,
        [AttributeNames.DB_STATEMENT]: 'SELECT NOW()',
      };
      const events: TimedEvent[] = [];
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const res = client.query('SELECT NOW()', (err, res) => {
          assert.strictEqual(err, null);
          assert.ok(res);
          runCallbackTest(span, attributes, events);
          done();
        });
        assert.strictEqual(res, undefined, 'No promise is returned');
      });
    });

    it('should intercept client.query(text, values, callback)', done => {
      const query = 'SELECT $1::text';
      const values = ['0'];
      const attributes = {
        ...DEFAULT_ATTRIBUTES,
        [AttributeNames.DB_STATEMENT]: query,
        [AttributeNames.PG_VALUES]: '[0]',
      };
      const events: TimedEvent[] = [];
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const resNoPromise = client.query(query, values, (err, res) => {
          assert.strictEqual(err, null);
          assert.ok(res);
          runCallbackTest(span, attributes, events);
          done();
        });
        assert.strictEqual(resNoPromise, undefined, 'No promise is returned');
      });
    });

    it('should intercept client.query({text, callback})', done => {
      const query = 'SELECT NOW()';
      const attributes = {
        ...DEFAULT_ATTRIBUTES,
        [AttributeNames.DB_STATEMENT]: query,
      };
      const events: TimedEvent[] = [];
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const resNoPromise = client.query({
          text: query,
          callback: (err: Error, res: pg.QueryResult) => {
            assert.strictEqual(err, null);
            assert.ok(res);
            runCallbackTest(span, attributes, events);
            done();
          },
        } as pg.QueryConfig);
        assert.strictEqual(resNoPromise, undefined, 'No promise is returned');
      });
    });

    it('should intercept client.query({text}, callback)', done => {
      const query = 'SELECT NOW()';
      const attributes = {
        ...DEFAULT_ATTRIBUTES,
        [AttributeNames.DB_STATEMENT]: query,
      };
      const events: TimedEvent[] = [];
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const resNoPromise = client.query({ text: query }, (err, res) => {
          assert.strictEqual(err, null);
          assert.ok(res);
          runCallbackTest(span, attributes, events);
          done();
        });
        assert.strictEqual(resNoPromise, undefined, 'No promise is returned');
      });
    });

    it('should intercept client.query(text, values)', async () => {
      const query = 'SELECT $1::text';
      const values = ['0'];
      const attributes = {
        ...DEFAULT_ATTRIBUTES,
        [AttributeNames.DB_STATEMENT]: query,
        [AttributeNames.PG_VALUES]: '[0]',
      };
      const events: TimedEvent[] = [];
      const span = tracer.startSpan('test span');
      await tracer.withSpan(span, async () => {
        const resPromise = await client.query(query, values);
        try {
          assert.ok(resPromise);
          runCallbackTest(span, attributes, events);
        } catch (e) {
          assert.ok(false, e.message);
        }
      });
    });

    it('should intercept client.query({text, values})', async () => {
      const query = 'SELECT $1::text';
      const values = ['0'];
      const attributes = {
        ...DEFAULT_ATTRIBUTES,
        [AttributeNames.DB_STATEMENT]: query,
        [AttributeNames.PG_VALUES]: '[0]',
      };
      const events: TimedEvent[] = [];
      const span = tracer.startSpan('test span');
      await tracer.withSpan(span, async () => {
        const resPromise = await client.query({
          text: query,
          values: values,
        });
        try {
          assert.ok(resPromise);
          runCallbackTest(span, attributes, events);
        } catch (e) {
          assert.ok(false, e.message);
        }
      });
    });

    it('should intercept client.query(plan)', async () => {
      const name = 'fetch-text';
      const query = 'SELECT $1::text';
      const values = ['0'];
      const attributes = {
        ...DEFAULT_ATTRIBUTES,
        [AttributeNames.PG_PLAN]: name,
        [AttributeNames.DB_STATEMENT]: query,
        [AttributeNames.PG_VALUES]: '[0]',
      };
      const events: TimedEvent[] = [];
      const span = tracer.startSpan('test span');

      await tracer.withSpan(span, async () => {
        try {
          const resPromise = await client.query({
            name: name,
            text: query,
            values: values,
          });
          assert.strictEqual(resPromise.command, 'SELECT');
          runCallbackTest(span, attributes, events);
        } catch (e) {
          assert.ok(false, e.message);
        }
      });
    });

    it('should intercept client.query(text)', async () => {
      const query = 'SELECT NOW()';
      const attributes = {
        ...DEFAULT_ATTRIBUTES,
        [AttributeNames.DB_STATEMENT]: query,
      };
      const events: TimedEvent[] = [];
      const span = tracer.startSpan('test span');
      await tracer.withSpan(span, async () => {
        try {
          const resPromise = await client.query(query);
          assert.ok(resPromise);
          runCallbackTest(span, attributes, events);
        } catch (e) {
          assert.ok(false, e.message);
        }
      });
    });

    it('should handle the same callback being given to multiple client.query()s', done => {
      let events = 0;
      const parent = tracer.startSpan('parent');

      const queryHandler = (err?: Error, res?: pg.QueryResult) => {
        const span = tracer.getCurrentSpan();
        assert.deepStrictEqual(span!.context(), parent.context());
        if (err) {
          throw err;
        }
        events += 1;
        if (events === 7) {
          done();
        }
      };

      const config = {
        text: 'SELECT NOW()',
        callback: queryHandler,
      };

      tracer.withSpan(parent, () => {
        client.query(config.text, config.callback); // 1
        client.query(config); // 2
        client.query(config.text, queryHandler); // 3
        client.query(config.text, queryHandler); // 4
        client
          .query(config.text)
          .then(result => queryHandler(undefined, result))
          .catch(err => queryHandler(err)); // 5
        client.query(config); // 6
        client.query(config); // 7
      });
    });

    it('should preserve correct context even when using the same callback in client.query()', done => {
      const spans = [tracer.startSpan('span 1'), tracer.startSpan('span 2')];
      const currentSpans: (Span | undefined)[] = [];
      const queryHandler = () => {
        currentSpans.push(tracer.getCurrentSpan());
        if (currentSpans.length === 2) {
          assert.deepStrictEqual(currentSpans, spans);
          done();
        }
      };

      tracer.withSpan(spans[0], () => {
        client.query('SELECT NOW()', queryHandler);
      });
      tracer.withSpan(spans[1], () => {
        client.query('SELECT NOW()', queryHandler);
      });
    });

    it('should preserve correct context even when using the same promise resolver in client.query()', done => {
      const spans = [tracer.startSpan('span 1'), tracer.startSpan('span 2')];
      const currentSpans: (Span | undefined)[] = [];
      const queryHandler = () => {
        currentSpans.push(tracer.getCurrentSpan());
        if (currentSpans.length === 2) {
          assert.deepStrictEqual(currentSpans, spans);
          done();
        }
      };

      tracer.withSpan(spans[0], () => {
        client.query('SELECT NOW()').then(queryHandler);
      });
      tracer.withSpan(spans[1], () => {
        client.query('SELECT NOW()').then(queryHandler);
      });
    });
  });
});
