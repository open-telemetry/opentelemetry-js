/**
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
import * as http from 'http';
import * as nock from 'nock';

import { HttpPlugin, plugin } from '../src/http';
import { SpanContext, HttpTextFormat } from '@opentelemetry/types';
import { AsyncHooksScopeManager } from '@opentelemetry/scope-async-hooks';
import { NodeTracer } from '@opentelemetry/node-tracer';
import { NoopLogger } from '@opentelemetry/core';
import { AddressInfo } from 'net';

class DummyPropagation implements HttpTextFormat {
  extract(format: string, carrier: unknown): SpanContext {
    return { traceId: 'dummy-trace-id', spanId: 'dummy-span-id' };
  }

  inject(
    spanContext: SpanContext,
    format: string,
    headers: http.IncomingHttpHeaders
  ): void {
    headers['x-dummy-trace-id'] = spanContext.traceId || 'undefined';
    headers['x-dummy-span-id'] = spanContext.spanId || 'undefined';
  }
}

describe('HttpPlugin', () => {
  let server: http.Server;
  let serverPort = 0;

  describe('enable()', () => {
    const scopeManager = new AsyncHooksScopeManager();
    const httpTextFormat = new DummyPropagation();
    const logger = new NoopLogger();
    const tracer = new NodeTracer({
      scopeManager,
      logger,
      httpTextFormat,
    });
    before(() => {
      plugin.enable(
        http,
        tracer
        // {
        //   ignoreIncomingPaths: [
        //     '/ignored/string',
        //     /^\/ignored\/regexp/,
        //     (url: string) => url === '/ignored/function',
        //   ],
        //   ignoreOutgoingUrls: [
        //     `${urlHost}/ignored/string`,
        //     /^http:\/\/fake\.service\.io\/ignored\/regexp$/,
        //     (url: string) => url === `${urlHost}/ignored/function`,
        //   ],
        //   applyCustomAttributesOnSpan: customAttributeFunction,
        // },
      );
      server = http.createServer((request, response) => {
        response.end('Test Server Response');
      });

      server.listen(serverPort);
      server.once('listening', () => {
        serverPort = (server.address() as AddressInfo).port;
      });
      nock.disableNetConnect();
    });

    beforeEach(() => {
      nock.cleanAll();
    });

    after(() => {
      server.close();
    });

    it('should return a plugin', () => {
      assert.ok(plugin instanceof HttpPlugin);
    });
  });
});
