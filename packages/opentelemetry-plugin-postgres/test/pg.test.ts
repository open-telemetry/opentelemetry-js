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

import { NoopLogger } from '@opentelemetry/core';
import { NodeTracer } from '@opentelemetry/node';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import { SpanKind, Attributes, TimedEvent, Span } from '@opentelemetry/types';
import { plugin, PostgresPlugin } from '../src';
import { AttributeNames } from '../src/enums';
import * as assert from 'assert';
import * as pg from 'pg';
import * as semver from 'semver';
import * as assertionUtils from './assertionUtils';
import * as testUtils from './testUtils';

const memoryExporter = new InMemorySpanExporter();

const CONFIG = {
  user: 'postgres',
  password: 'test',
  database: 'postgres',
  host: '127.0.0.1',
  port: 54320,
};

const runCallbackTest = (
  span: Span,
  attributes: Attributes,
  events: TimedEvent[],
  spansLength = 1,
  spansIndex = 0
) => {
  const spans = memoryExporter.getFinishedSpans();
  assert.strictEqual(spans.length, spansLength);
  const pgSpan = spans[spansIndex];
  assertionUtils.assertSpan(pgSpan, SpanKind.CLIENT, attributes, events);
  assertionUtils.assertPropagation(pgSpan, span);
};

describe('pg@7.x', () => {
  let client: pg.Client;
  const tracer = new NodeTracer();
  const logger = new NoopLogger();
  const testPostgres = process.env.TEST_POSTGRES; // For CI: assumes local postgres db is already available
  const testPostgresLocally = process.env.TEST_POSTGRES_LOCAL; // For local: spins up local postgres db via docker
  const shouldTest = true || testPostgres || testPostgresLocally; // Skips these tests if false (default)

  before(function(ready) {
    if (!shouldTest) {
      // this.skip() workaround
      // https://github.com/mochajs/mocha/issues/2683#issuecomment-375629901
      this.test!.parent!.pending = true;
      this.skip();
    }
    tracer.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
    if (testPostgresLocally) {
      testUtils.startDocker();
    }
    client = new pg.Client(CONFIG);

    function connect() {
      client.connect(err => {
        if (err) {
          setTimeout(connect, 500);
          return;
        }
        ready();
      });
    }
    connect();
  });
  after(done => {
    if (testPostgresLocally) {
      testUtils.cleanUpDocker();
    }
    client.end(done);
  });

  beforeEach(function() {
    plugin.enable(pg, tracer, logger);
  });

  afterEach(() => {
    memoryExporter.reset();
    plugin.disable();
  });

  it('should return a plugin', () => {
    assert.ok(plugin instanceof PostgresPlugin);
  });

  it('should match version', () => {
    assert.ok(semver.satisfies(plugin.version, '^7.12.1'));
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
    assert.doesNotThrow(
      () => (client as any).query({ foo: 'bar' }, undefined, () => null),
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

    it('it should intercept client.query(text, callback)', done => {
      const attributes = {
        [AttributeNames.COMPONENT]: PostgresPlugin.COMPONENT,
        [AttributeNames.PEER_HOST]: CONFIG.host,
        [AttributeNames.PEER_PORT]: CONFIG.port,
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
        [AttributeNames.COMPONENT]: PostgresPlugin.COMPONENT,
        [AttributeNames.PEER_HOST]: CONFIG.host,
        [AttributeNames.PEER_PORT]: CONFIG.port,
        [AttributeNames.DB_STATEMENT]: query,
        [AttributeNames.PG_VALUES]: values,
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
        [AttributeNames.COMPONENT]: PostgresPlugin.COMPONENT,
        [AttributeNames.PEER_HOST]: CONFIG.host,
        [AttributeNames.PEER_PORT]: CONFIG.port,
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
        [AttributeNames.COMPONENT]: PostgresPlugin.COMPONENT,
        [AttributeNames.PEER_HOST]: CONFIG.host,
        [AttributeNames.PEER_PORT]: CONFIG.port,
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
        [AttributeNames.COMPONENT]: PostgresPlugin.COMPONENT,
        [AttributeNames.PEER_HOST]: CONFIG.host,
        [AttributeNames.PEER_PORT]: CONFIG.port,
        [AttributeNames.DB_STATEMENT]: query,
        [AttributeNames.PG_VALUES]: values,
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
        [AttributeNames.COMPONENT]: PostgresPlugin.COMPONENT,
        [AttributeNames.PEER_HOST]: CONFIG.host,
        [AttributeNames.PEER_PORT]: CONFIG.port,
        [AttributeNames.DB_STATEMENT]: query,
        [AttributeNames.PG_VALUES]: values,
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

    it('should intercept client.query(text)', async () => {
      const query = 'SELECT NOW()';
      const attributes = {
        [AttributeNames.COMPONENT]: PostgresPlugin.COMPONENT,
        [AttributeNames.PEER_HOST]: CONFIG.host,
        [AttributeNames.PEER_PORT]: CONFIG.port,
        [AttributeNames.DB_STATEMENT]: query,
      };
      const events: TimedEvent[] = [];
      const span = tracer.startSpan('test span');
      await tracer.withSpan(span, async () => {
        const resPromise = await client.query(query);
        try {
          assert.ok(resPromise);
          runCallbackTest(span, attributes, events);
        } catch (e) {
          assert.ok(false, e.message);
        }
      });
    });

    it('should handle the same callback being given to multiple client.query()s', done => {
      let events = 0;

      const queryHandler = (err: Error, res: pg.QueryResult) => {
        if (err) {
          throw err;
        }
        events += 1;
      };

      const config = {
        text: 'SELECT NOW()',
        callback: queryHandler,
      };

      client.query(config.text, config.callback); // 1
      client.query(config); // 2
      client.query(config.text, queryHandler); // 3
      client.query(config.text); // Not using queryHandler
      client.query(config); // 4
      client.query(config.text, (err, res) => {
        assert.strictEqual(events, 4);
        done();
      });
    });

    it('should preserve correct context even when using the same callback in client.query()', done => {
      const spans = [tracer.startSpan('span 1'), tracer.startSpan('span 2')];
      const currentSpans: (Span | null)[] = [];
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
  });
});
