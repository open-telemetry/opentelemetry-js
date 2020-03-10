/*!
 * Copyright 2020, OpenTelemetry Authors
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

import { context } from '@opentelemetry/api';
import { NoopLogger } from '@opentelemetry/core';
import { NodeTracerProvider } from '@opentelemetry/node';
import { AsyncHooksScopeManager } from '@opentelemetry/scope-async-hooks';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import * as assert from 'assert';
import * as express from 'express';
import * as http from 'http';
import { AddressInfo } from 'net';
import { plugin } from '../src';
import {
  AttributeNames,
  ExpressLayerType,
  ExpressPluginConfig,
} from '../src/types';

const httpRequest = {
  get: (options: http.ClientRequestArgs | string) => {
    return new Promise((resolve, reject) => {
      return http.get(options, resp => {
        let data = '';
        resp.on('data', chunk => {
          data += chunk;
        });
        resp.on('end', () => {
          resolve(data);
        });
        resp.on('error', err => {
          reject(err);
        });
      });
    });
  },
};

describe('Express Plugin', () => {
  const logger = new NoopLogger();
  const provider = new NodeTracerProvider();
  const memoryExporter = new InMemorySpanExporter();
  const spanProcessor = new SimpleSpanProcessor(memoryExporter);
  provider.addSpanProcessor(spanProcessor);
  const tracer = provider.getTracer('default');
  let scopeManager: AsyncHooksScopeManager;

  before(() => {
    plugin.enable(express, provider, logger);
  });

  beforeEach(() => {
    scopeManager = new AsyncHooksScopeManager();
    context.setGlobalContextManager(scopeManager.enable());
  });

  afterEach(() => {
    memoryExporter.reset();
    scopeManager.disable();
  });

  describe('Instrumenting normal get operations', () => {
    it('should create a child span for middlewares', done => {
      const rootSpan = tracer.startSpan('rootSpan');
      const app = express();
      app.use(express.json());
      app.use(function customMiddleware(req, res, next) {
        for (let i = 0; i < 1000; i++) {
          continue;
        }
        return next();
      });
      const router = express.Router();
      app.use('/toto', router);
      router.get('/:id', (req, res, next) => {
        return res.status(200).end();
      });
      const server = http.createServer(app);
      server.listen(0, () => {
        const port = (server.address() as AddressInfo).port;
        assert.strictEqual(memoryExporter.getFinishedSpans().length, 0);
        tracer.withSpan(rootSpan, async () => {
          await httpRequest.get(`http://localhost:${port}/toto/tata`);
          rootSpan.end();
          assert(
            memoryExporter
              .getFinishedSpans()
              .find(span => span.name.includes('customMiddleware')) !==
              undefined
          );
          assert(
            memoryExporter
              .getFinishedSpans()
              .find(span => span.name.includes('query')) !== undefined
          );
          assert(
            memoryExporter
              .getFinishedSpans()
              .find(span => span.name.includes('jsonParser')) !== undefined
          );
          const requestHandlerSpan = memoryExporter
            .getFinishedSpans()
            .find(span => span.name.includes('request handler'));
          assert(requestHandlerSpan !== undefined);
          assert(
            requestHandlerSpan?.attributes[AttributeNames.COMPONENT] ===
              'express'
          );
          assert(
            requestHandlerSpan?.attributes[AttributeNames.HTTP_ROUTE] ===
              '/toto/:id'
          );
          assert(
            requestHandlerSpan?.attributes[AttributeNames.EXPRESS_TYPE] ===
              'request_handler'
          );
          let exportedRootSpan = memoryExporter
            .getFinishedSpans()
            .find(span => span.name === 'rootSpan');
          assert(exportedRootSpan !== undefined);
          server.close();
          return done();
        });
      });
    });
  });

  describe('Instrumenting with specific config', () => {
    it('should ignore specific middlewares based on config', done => {
      plugin.disable();
      const config: ExpressPluginConfig = {
        ignoreLayersType: [ExpressLayerType.MIDDLEWARE],
      };
      plugin.enable(express, provider, logger, config);
      const rootSpan = tracer.startSpan('rootSpan');
      const app = express();
      app.use(express.json());
      app.use(function customMiddleware(req, res, next) {
        for (let i = 0; i < 1000; i++) {
          continue;
        }
        return next();
      });
      const server = http.createServer(app);
      server.listen(0, () => {
        const port = (server.address() as AddressInfo).port;
        assert.strictEqual(memoryExporter.getFinishedSpans().length, 0);
        tracer.withSpan(rootSpan, async () => {
          await httpRequest.get(`http://localhost:${port}/toto/tata`);
          rootSpan.end();
          assert.deepEqual(
            memoryExporter
              .getFinishedSpans()
              .filter(
                span =>
                  span.attributes[AttributeNames.EXPRESS_TYPE] ===
                  ExpressLayerType.MIDDLEWARE
              ).length,
            0
          );
          let exportedRootSpan = memoryExporter
            .getFinishedSpans()
            .find(span => span.name === 'rootSpan');
          assert(exportedRootSpan !== undefined);
          server.close();
          return done();
        });
      });
    });
  });

  describe('Disabling plugin', () => {
    it('should not create new spans', done => {
      plugin.disable();
      const rootSpan = tracer.startSpan('rootSpan');
      const app = express();
      app.use(express.json());
      app.use(function customMiddleware(req, res, next) {
        for (let i = 0; i < 1000; i++) {
          continue;
        }
        return next();
      });
      const server = http.createServer(app);
      server.listen(0, () => {
        const port = (server.address() as AddressInfo).port;
        assert.strictEqual(memoryExporter.getFinishedSpans().length, 0);
        tracer.withSpan(rootSpan, async () => {
          await httpRequest.get(`http://localhost:${port}/toto/tata`);
          rootSpan.end();
          assert.deepEqual(memoryExporter.getFinishedSpans().length, 1);
          assert(memoryExporter.getFinishedSpans()[0] !== undefined);
          server.close();
          return done();
        });
      });
    });
  });
});
