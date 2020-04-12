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

import { context, SpanKind } from '@opentelemetry/api';
import { NoopLogger } from '@opentelemetry/core';
import { BasicTracerProvider } from '@opentelemetry/tracing';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import * as assert from 'assert';
import * as mongodb from 'mongodb';
import { MongoDBPlugin } from '../src/mongodb';
import { assertSpans, accessCollection } from './utils';

describe('Multiple enable on the plugin', () => {
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

  let contextManager: AsyncHooksContextManager;
  let client: mongodb.MongoClient;
  let collection: mongodb.Collection;
  const logger = new NoopLogger();
  const provider = new BasicTracerProvider();
  const memoryExporter = new InMemorySpanExporter();
  const spanProcessor = new SimpleSpanProcessor(memoryExporter);
  const plugin = new MongoDBPlugin('mongodb');
  provider.addSpanProcessor(spanProcessor);

  before(done => {
    // enable twice to simulate loading to different versions
    plugin.enable(mongodb, provider, logger);
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

  beforeEach(function mongoBeforeEach() {
    // Skipping all tests in beforeEach() is a workaround. Mocha does not work
    // properly when skipping tests in before() on nested describe() calls.
    // https://github.com/mochajs/mocha/issues/2819
    if (!shouldTest) {
      this.skip();
    }
    memoryExporter.reset();
    contextManager = new AsyncHooksContextManager().enable();
    context.setGlobalContextManager(contextManager);
  });

  afterEach(done => {
    collection.deleteOne({}, done);
    contextManager.disable();
  });

  after(() => {
    if (client) {
      client.close();
    }
  });

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
});
