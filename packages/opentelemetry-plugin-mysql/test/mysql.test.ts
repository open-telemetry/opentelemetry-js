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
  ReadableSpan,
} from '@opentelemetry/tracing';
import * as assert from 'assert';
import * as mysql from 'mysql';
import { MysqlPlugin, plugin } from '../src';
import * as testUtils from './testUtils';
import { AttributeNames } from '../src/enums';
import { CanonicalCode } from '@opentelemetry/types';

const port = parseInt(process.env.MYSQL_PORT || '33306', 10);
const database = process.env.MYSQL_DATABASE || 'test_db';
const host = process.env.MYSQL_HOST || '127.0.0.1';
const user = process.env.MYSQL_USER || 'otel';
const password = process.env.MYSQL_PASSWORD || 'secret';

describe('mysql@2.x', () => {
  let connection: mysql.Connection;
  let pool: mysql.Pool;
  let poolCluster: mysql.PoolCluster;
  const tracer = new NodeTracer({ plugins: {} });
  const logger = new NoopLogger();
  const testMysql = process.env.RUN_MYSQL_TESTS; // For CI: assumes local mysql db is already available
  const testMysqlLocally = process.env.RUN_MYSQL_TESTS_LOCAL; // For local: spins up local mysql db via docker
  const shouldTest = testMysql || testMysqlLocally; // Skips these tests if false (default)
  const memoryExporter = new InMemorySpanExporter();

  before(function(done) {
    if (!shouldTest) {
      // this.skip() workaround
      // https://github.com/mochajs/mocha/issues/2683#issuecomment-375629901
      this.test!.parent!.pending = true;
      this.skip();
    }
    tracer.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
    if (testMysqlLocally) {
      testUtils.startDocker();
      // wait 15 seconds for docker container to start
      this.timeout(20000);
      setTimeout(done, 15000);
    } else {
      done();
    }
  });

  after(function() {
    if (testMysqlLocally) {
      this.timeout(5000);
      testUtils.cleanUpDocker();
    }
  });

  beforeEach(function() {
    plugin.enable(mysql, tracer, logger);
    connection = mysql.createConnection({
      port,
      user,
      host,
      password,
      database,
    });
    pool = mysql.createPool({
      port,
      user,
      host,
      password,
      database,
    });
    poolCluster = mysql.createPoolCluster();
    poolCluster.add('name', {
      port,
      user,
      host,
      password,
      database,
    });
  });

  afterEach(done => {
    memoryExporter.reset();
    plugin.disable();
    connection.end(() => {
      pool.end(() => {
        poolCluster.end(() => {
          done();
        });
      });
    });
  });

  it('should export a plugin', () => {
    assert(plugin instanceof MysqlPlugin);
  });

  it('should have correct moduleName', () => {
    assert.strictEqual(plugin.moduleName, 'mysql');
  });

  describe('#Connection', () => {
    it('should intercept connection.query(text: string)', done => {
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const statement = 'SELECT 1+1 as solution';
        const query = connection.query(statement);
        let rows = 0;

        query.on('result', row => {
          assert.strictEqual(row.solution, 2);
          rows += 1;
        });

        query.on('end', () => {
          assert.strictEqual(rows, 1);
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assertSpan(spans[0], statement);
          done();
        });
      });
    });

    it('should intercept connection.query(text: string, callback)', done => {
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const statement = 'SELECT 1+1 as solution';
        connection.query(statement, (err, res) => {
          assert.ifError(err);
          assert.ok(res);
          assert.strictEqual(res[0].solution, 2);
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assertSpan(spans[0], statement);
          done();
        });
      });
    });

    it('should intercept connection.query(text: options, callback)', done => {
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const statement = 'SELECT 1+? as solution';
        connection.query({ sql: statement, values: [1] }, (err, res) => {
          assert.ifError(err);
          assert.ok(res);
          assert.strictEqual(res[0].solution, 2);
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assertSpan(spans[0], statement, [1]);
          done();
        });
      });
    });

    it('should intercept connection.query(text: options, values: [], callback)', done => {
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const statement = 'SELECT 1+? as solution';
        // @ts-ignore this is documented https://github.com/mysqljs/mysql#performing-queries
        // but does not match the typings
        connection.query({ sql: statement }, [1], (err, res) => {
          assert.ifError(err);
          assert.ok(res);
          assert.strictEqual(res[0].solution, 2);
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assertSpan(spans[0], statement, [1]);
          done();
        });
      });
    });

    it('should intercept connection.query(text: string, values: [], callback)', done => {
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const statement = 'SELECT ? as solution';
        connection.query(statement, [1], (err, res) => {
          assert.ifError(err);
          assert.ok(res);
          assert.strictEqual(res[0].solution, 1);
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assertSpan(spans[0], statement, [1]);
          done();
        });
      });
    });

    it('should intercept connection.query(text: string, value: any, callback)', done => {
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const statement = 'SELECT ? as solution';
        connection.query(statement, 1, (err, res) => {
          assert.ifError(err);
          assert.ok(res);
          assert.strictEqual(res[0].solution, 1);
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assertSpan(spans[0], statement, [1]);
          done();
        });
      });
    });

    it('should attach error messages to spans', done => {
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const statement = 'SELECT ? as solution';
        connection.query(statement, (err, res) => {
          assert.ok(err);
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assertSpan(spans[0], statement, undefined, err!.message);
          done();
        });
      });
    });
  });

  describe('#Pool', () => {
    it('should intercept pool.query(text: string)', done => {
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const statement = 'SELECT 1+1 as solution';
        const query = pool.query(statement);
        let rows = 0;

        query.on('result', row => {
          assert.strictEqual(row.solution, 2);
          rows += 1;
        });

        query.on('end', () => {
          assert.strictEqual(rows, 1);
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assertSpan(spans[0], statement);
          done();
        });
      });
    });

    it('should intercept pool.getConnection().query(text: string)', done => {
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const statement = 'SELECT 1+1 as solution';
        pool.getConnection((err, conn) => {
          const query = conn.query(statement);
          let rows = 0;

          query.on('result', row => {
            assert.strictEqual(row.solution, 2);
            rows += 1;
          });

          query.on('end', () => {
            assert.strictEqual(rows, 1);
            const spans = memoryExporter.getFinishedSpans();
            assert.strictEqual(spans.length, 1);
            assertSpan(spans[0], statement);
            done();
          });
        });
      });
    });

    it('should intercept pool.query(text: string, callback)', done => {
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const statement = 'SELECT 1+1 as solution';
        pool.query(statement, (err, res) => {
          assert.ifError(err);
          assert.ok(res);
          assert.strictEqual(res[0].solution, 2);
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assertSpan(spans[0], statement);
          done();
        });
      });
    });

    it('should intercept pool.getConnection().query(text: string, callback)', done => {
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const statement = 'SELECT 1+1 as solution';
        pool.getConnection((err, conn) => {
          conn.query(statement, (err, res) => {
            assert.ifError(err);
            assert.ok(res);
            assert.strictEqual(res[0].solution, 2);
            const spans = memoryExporter.getFinishedSpans();
            assert.strictEqual(spans.length, 1);
            assertSpan(spans[0], statement);
            done();
          });
        });
      });
    });

    it('should intercept pool.query(text: options, callback)', done => {
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const statement = 'SELECT 1+? as solution';
        pool.query({ sql: statement, values: [1] }, (err, res) => {
          assert.ifError(err);
          assert.ok(res);
          assert.strictEqual(res[0].solution, 2);
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assertSpan(spans[0], statement, [1]);
          done();
        });
      });
    });

    it('should intercept pool.query(text: options, values: [], callback)', done => {
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const statement = 'SELECT 1+? as solution';
        // @ts-ignore this is documented https://github.com/mysqljs/mysql#performing-queries
        // but does not match the typings
        pool.query({ sql: statement }, [1], (err, res) => {
          assert.ifError(err);
          assert.ok(res);
          assert.strictEqual(res[0].solution, 2);
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assertSpan(spans[0], statement, [1]);
          done();
        });
      });
    });

    it('should intercept pool.query(text: string, values: [], callback)', done => {
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const statement = 'SELECT ? as solution';
        pool.query(statement, [1], (err, res) => {
          assert.ifError(err);
          assert.ok(res);
          assert.strictEqual(res[0].solution, 1);
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assertSpan(spans[0], statement, [1]);
          done();
        });
      });
    });

    it('should intercept pool.query(text: string, value: any, callback)', done => {
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const statement = 'SELECT ? as solution';
        pool.query(statement, 1, (err, res) => {
          assert.ifError(err);
          assert.ok(res);
          assert.strictEqual(res[0].solution, 1);
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assertSpan(spans[0], statement, [1]);
          done();
        });
      });
    });

    it('should attach error messages to spans', done => {
      const span = tracer.startSpan('test span');
      tracer.withSpan(span, () => {
        const statement = 'SELECT ? as solution';
        pool.query(statement, (err, res) => {
          assert.ok(err);
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assertSpan(spans[0], statement, undefined, err!.message);
          done();
        });
      });
    });
  });

  describe('#PoolCluster', () => {
    it('should intercept poolClusterConnection.query(text: string)', done => {
      poolCluster.getConnection((err, poolClusterConnection) => {
        assert.ifError(err);
        const span = tracer.startSpan('test span');
        tracer.withSpan(span, () => {
          const statement = 'SELECT 1+1 as solution';
          const query = poolClusterConnection.query(statement);
          let rows = 0;

          query.on('result', row => {
            assert.strictEqual(row.solution, 2);
            rows += 1;
          });

          query.on('end', () => {
            assert.strictEqual(rows, 1);
            const spans = memoryExporter.getFinishedSpans();
            assert.strictEqual(spans.length, 1);
            assertSpan(spans[0], statement);
            done();
          });
        });
      });
    });

    it('should intercept poolClusterConnection.query(text: string, callback)', done => {
      poolCluster.getConnection((err, poolClusterConnection) => {
        assert.ifError(err);
        const span = tracer.startSpan('test span');
        tracer.withSpan(span, () => {
          const statement = 'SELECT 1+1 as solution';
          poolClusterConnection.query(statement, (err, res) => {
            assert.ifError(err);
            assert.ok(res);
            assert.strictEqual(res[0].solution, 2);
            const spans = memoryExporter.getFinishedSpans();
            assert.strictEqual(spans.length, 1);
            assertSpan(spans[0], statement);
            done();
          });
        });
      });
    });

    it('should intercept poolClusterConnection.query(text: options, callback)', done => {
      poolCluster.getConnection((err, poolClusterConnection) => {
        assert.ifError(err);
        const span = tracer.startSpan('test span');
        tracer.withSpan(span, () => {
          const statement = 'SELECT 1+? as solution';
          poolClusterConnection.query(
            { sql: statement, values: [1] },
            (err, res) => {
              assert.ifError(err);
              assert.ok(res);
              assert.strictEqual(res[0].solution, 2);
              const spans = memoryExporter.getFinishedSpans();
              assert.strictEqual(spans.length, 1);
              assertSpan(spans[0], statement, [1]);
              done();
            }
          );
        });
      });
    });

    it('should intercept poolClusterConnection.query(text: options, values: [], callback)', done => {
      poolCluster.getConnection((err, poolClusterConnection) => {
        assert.ifError(err);
        const span = tracer.startSpan('test span');
        tracer.withSpan(span, () => {
          const statement = 'SELECT 1+? as solution';
          // @ts-ignore this is documented https://github.com/mysqljs/mysql#performing-queries
          // but does not match the typings
          poolClusterConnection.query({ sql: statement }, [1], (err, res) => {
            assert.ifError(err);
            assert.ok(res);
            assert.strictEqual(res[0].solution, 2);
            const spans = memoryExporter.getFinishedSpans();
            assert.strictEqual(spans.length, 1);
            assertSpan(spans[0], statement, [1]);
            done();
          });
        });
      });
    });

    it('should intercept poolClusterConnection.query(text: string, values: [], callback)', done => {
      poolCluster.getConnection((err, poolClusterConnection) => {
        assert.ifError(err);
        const span = tracer.startSpan('test span');
        tracer.withSpan(span, () => {
          const statement = 'SELECT ? as solution';
          poolClusterConnection.query(statement, [1], (err, res) => {
            assert.ifError(err);
            assert.ok(res);
            assert.strictEqual(res[0].solution, 1);
            const spans = memoryExporter.getFinishedSpans();
            assert.strictEqual(spans.length, 1);
            assertSpan(spans[0], statement, [1]);
            done();
          });
        });
      });
    });

    it('should intercept poolClusterConnection.query(text: string, value: any, callback)', done => {
      poolCluster.getConnection((err, poolClusterConnection) => {
        assert.ifError(err);
        const span = tracer.startSpan('test span');
        tracer.withSpan(span, () => {
          const statement = 'SELECT ? as solution';
          poolClusterConnection.query(statement, 1, (err, res) => {
            assert.ifError(err);
            assert.ok(res);
            assert.strictEqual(res[0].solution, 1);
            const spans = memoryExporter.getFinishedSpans();
            assert.strictEqual(spans.length, 1);
            assertSpan(spans[0], statement, [1]);
            done();
          });
        });
      });
    });

    it('should attach error messages to spans', done => {
      poolCluster.getConnection((err, poolClusterConnection) => {
        assert.ifError(err);
        const span = tracer.startSpan('test span');
        tracer.withSpan(span, () => {
          const statement = 'SELECT ? as solution';
          poolClusterConnection.query(statement, (err, res) => {
            assert.ok(err);
            const spans = memoryExporter.getFinishedSpans();
            assert.strictEqual(spans.length, 1);
            assertSpan(spans[0], statement, undefined, err!.message);
            done();
          });
        });
      });
    });

    it('should get connection by name', done => {
      poolCluster.getConnection('name', (err, poolClusterConnection) => {
        assert.ifError(err);
        const span = tracer.startSpan('test span');
        tracer.withSpan(span, () => {
          const statement = 'SELECT 1 as solution';
          poolClusterConnection.query(statement, (err, res) => {
            assert.ifError(err);
            const spans = memoryExporter.getFinishedSpans();
            assert.strictEqual(spans.length, 1);
            assertSpan(spans[0], statement);
            done();
          });
        });
      });
    });

    it('should get connection by name and selector', done => {
      poolCluster.getConnection(
        'name',
        'ORDER',
        (err, poolClusterConnection) => {
          assert.ifError(err);
          const statement = 'SELECT 1 as solution';
          poolClusterConnection.query(statement, (err, res) => {
            assert.ifError(err);
            const spans = memoryExporter.getFinishedSpans();
            assert.strictEqual(spans.length, 1);
            assertSpan(spans[0], statement);
            done();
          });
        }
      );
    });
  });
});

function assertSpan(
  span: ReadableSpan,
  statement: string,
  values?: any,
  errorMessage?: string
) {
  assert.equal(span.attributes[AttributeNames.COMPONENT], 'mysql');
  assert.equal(span.attributes[AttributeNames.DB_TYPE], 'sql');
  assert.equal(span.attributes[AttributeNames.DB_INSTANCE], database);
  assert.equal(span.attributes[AttributeNames.PEER_PORT], port);
  assert.equal(span.attributes[AttributeNames.PEER_HOSTNAME], host);
  assert.equal(span.attributes[AttributeNames.DB_USER], user);
  assert.strictEqual(span.attributes[AttributeNames.DB_STATEMENT], statement);
  if (values) {
    assert.deepStrictEqual(
      span.attributes[AttributeNames.MYSQL_VALUES],
      values
    );
  }
  if (errorMessage) {
    assert.equal(span.status.message, errorMessage);
    assert.equal(span.status.code, CanonicalCode.UNKNOWN);
  }
}
