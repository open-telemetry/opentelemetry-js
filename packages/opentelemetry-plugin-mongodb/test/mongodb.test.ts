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

import { CanonicalCode, context, SpanKind } from '@opentelemetry/api';
import { NoopLogger } from '@opentelemetry/core';
import { NodeTracerProvider } from '@opentelemetry/node';
import { AsyncHooksScopeManager } from '@opentelemetry/scope-async-hooks';
import {
  InMemorySpanExporter,
  ReadableSpan,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import * as assert from 'assert';
import * as mongodb from 'mongodb';
import { plugin } from '../src';
import { AttributeNames } from '../src/types';

interface MongoDBAccess {
  client: mongodb.MongoClient;
  collection: mongodb.Collection;
}

/**
 * Access the mongodb collection.
 * @param url The mongodb URL to access.
 * @param dbName The mongodb database name.
 * @param collectionName The mongodb collection name.
 */
function accessCollection(
  url: string,
  dbName: string,
  collectionName: string
): Promise<MongoDBAccess> {
  return new Promise((resolve, reject) => {
    mongodb.MongoClient.connect(url, function connectedClient(err, client) {
      if (err) {
        reject(err);
        return;
      }
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      resolve({ client, collection });
    });
  });
}

/**
 * Asserts root spans attributes.
 * @param spans Readable spans that we need to assert.
 * @param expectedName The expected name of the first root span.
 * @param expectedKind The expected kind of the first root span.
 */
function assertSpans(
  spans: ReadableSpan[],
  expectedName: string,
  expectedKind: SpanKind,
  log = false
) {
  if (log) {
    console.log(spans);
  }
  assert.strictEqual(spans.length, 2);
  spans.forEach(span => {
    assert(span.endTime instanceof Array);
    assert(span.endTime.length === 2);
  });
  const [mongoSpan] = spans;
  assert.strictEqual(mongoSpan.name, expectedName);
  assert.strictEqual(mongoSpan.kind, expectedKind);
  assert.strictEqual(mongoSpan.attributes[AttributeNames.COMPONENT], 'mongodb');
  assert.strictEqual(
    mongoSpan.attributes[AttributeNames.PEER_HOSTNAME],
    process.env.MONGODB_HOST || 'localhost'
  );
  assert.strictEqual(mongoSpan.status.code, CanonicalCode.OK);
}

describe('MongoDBPlugin', () => {
  // For these tests, mongo must be running. Add RUN_MONGODB_TESTS to run
  // these tests.
  const RUN_MONGODB_TESTS = process.env.RUN_MONGODB_TESTS as string;
  let shouldTest = true;
  if (!RUN_MONGODB_TESTS) {
    console.log('Skipping test-mongodb. Run MongoDB to test');
    shouldTest = false;
  }

  const URL = `mongodb://${process.env.MONGODB_HOST || 'localhost'}:${process
    .env.MONGODB_PORT || '27017'}`;
  const DB_NAME = process.env.MONGODB_DB || 'opentelemetry-tests';
  const COLLECTION_NAME = 'test';

  let scopeManager: AsyncHooksScopeManager;
  let client: mongodb.MongoClient;
  let collection: mongodb.Collection;
  const logger = new NoopLogger();
  const provider = new NodeTracerProvider();
  const memoryExporter = new InMemorySpanExporter();
  const spanProcessor = new SimpleSpanProcessor(memoryExporter);
  provider.addSpanProcessor(spanProcessor);

  before(done => {
    plugin.enable(mongodb, provider, logger);
    accessCollection(URL, DB_NAME, COLLECTION_NAME)
      .then(result => {
        client = result.client;
        collection = result.collection;
        done();
      })
      .catch((err: Error) => {
        console.log(
          'Skipping test-mongodb. Could not connect. Run MongoDB to test'
        );
        shouldTest = false;
        done();
      });
  });

  beforeEach(function mongoBeforeEach(done) {
    // Skipping all tests in beforeEach() is a workaround. Mocha does not work
    // properly when skipping tests in before() on nested describe() calls.
    // https://github.com/mochajs/mocha/issues/2819
    if (!shouldTest) {
      this.skip();
    }
    memoryExporter.reset();
    // Non traced insertion of basic data to perform tests
    const insertData = [{ a: 1 }, { a: 2 }, { a: 3 }];
    collection.insertMany(insertData, (err, result) => {
      done();
    });
    scopeManager = new AsyncHooksScopeManager().enable();
    context.initGlobalContextManager(scopeManager);
  });

  afterEach(done => {
    collection.deleteOne({}, done);
    scopeManager.disable();
  });

  after(() => {
    if (client) {
      client.close();
    }
  });

  /** Should intercept query */
  describe('Instrumenting query operations', () => {
    it('should create a child span for insert', done => {
      const insertData = [{ a: 1 }, { a: 2 }, { a: 3 }];

      const span = provider.getTracer('default').startSpan(`insertRootSpan`);
      provider.getTracer('default').withSpan(span, () => {
        collection.insertMany(insertData, (err, result) => {
          span.end();
          assert.ifError(err);
          assertSpans(
            memoryExporter.getFinishedSpans(),
            `mongodb.insert`,
            SpanKind.CLIENT
          );
          done();
        });
      });
    });

    it('should create a child span for update', done => {
      const span = provider.getTracer('default').startSpan('updateRootSpan');
      provider.getTracer('default').withSpan(span, () => {
        collection.updateOne({ a: 2 }, { $set: { b: 1 } }, (err, result) => {
          span.end();
          assert.ifError(err);
          assertSpans(
            memoryExporter.getFinishedSpans(),
            `mongodb.update`,
            SpanKind.CLIENT
          );
          done();
        });
      });
    });

    it('should create a child span for remove', done => {
      const span = provider.getTracer('default').startSpan('removeRootSpan');
      provider.getTracer('default').withSpan(span, () => {
        collection.deleteOne({ a: 3 }, (err, result) => {
          span.end();
          assert.ifError(err);
          assertSpans(
            memoryExporter.getFinishedSpans(),
            `mongodb.remove`,
            SpanKind.CLIENT
          );
          done();
        });
      });
    });
  });

  /** Should intercept cursor */
  describe('Instrumenting cursor operations', () => {
    it('should create a child span for find', done => {
      const span = provider.getTracer('default').startSpan('findRootSpan');
      provider.getTracer('default').withSpan(span, () => {
        collection.find({}).toArray((err, result) => {
          span.end();
          assert.ifError(err);
          assertSpans(
            memoryExporter.getFinishedSpans(),
            `mongodb.query`,
            SpanKind.CLIENT
          );
          done();
        });
      });
    });
  });

  /** Should intercept command */
  describe('Instrumenting command operations', () => {
    it('should create a child span for create index', done => {
      const span = provider.getTracer('default').startSpan('indexRootSpan');
      provider.getTracer('default').withSpan(span, () => {
        collection.createIndex({ a: 1 }, (err, result) => {
          span.end();
          assert.ifError(err);
          assertSpans(
            memoryExporter.getFinishedSpans(),
            `mongodb.createIndexes`,
            SpanKind.CLIENT
          );
          done();
        });
      });
    });
  });

  /** Should intercept command */
  describe('Removing Instrumentation', () => {
    it('should unpatch plugin', () => {
      assert.doesNotThrow(() => {
        plugin.unpatch();
      });
    });

    it('should not create a child span for query', done => {
      const insertData = [{ a: 1 }, { a: 2 }, { a: 3 }];

      const span = provider.getTracer('default').startSpan('insertRootSpan');
      collection.insertMany(insertData, (err, result) => {
        span.end();
        assert.ifError(err);
        assert.strictEqual(memoryExporter.getFinishedSpans().length, 1);
        done();
      });
    });

    it('should not create a child span for cursor', done => {
      const span = provider.getTracer('default').startSpan('findRootSpan');
      collection.find({}).toArray((err, result) => {
        span.end();
        assert.ifError(err);
        assert.strictEqual(memoryExporter.getFinishedSpans().length, 1);
        done();
      });
    });

    it('should not create a child span for command', done => {
      const span = provider.getTracer('default').startSpan('indexRootSpan');
      collection.createIndex({ a: 1 }, (err, result) => {
        span.end();
        assert.ifError(err);
        assert.strictEqual(memoryExporter.getFinishedSpans().length, 1);
        done();
      });
    });
  });
});
