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

import { NoopLogger } from '@opentelemetry/core';
import { NodeTracer } from '@opentelemetry/node-tracer';
import { AsyncHooksScopeManager } from '@opentelemetry/scope-async-hooks';
import { SpanKind, Span } from '@opentelemetry/types';
import * as assert from 'assert';
import * as http from 'http';
import * as nock from 'nock';
import { plugin } from '../src/http';
import { assertSpan } from './utils/assertSpan';
import { DummyPropagation } from './utils/DummyPropagation';
import { ProxyTracer } from './utils/ProxyTracer';
import { SpanAuditProcessor } from './utils/SpanAuditProcessor';
import * as url from 'url';
import axios, { AxiosResponse } from 'axios';
import * as superagent from 'superagent';
import * as got from 'got';
import * as request from 'request-promise-native';

const audit = new SpanAuditProcessor();

export const customAttributeFunction = (span: Span): void => {
  span.setAttribute('span kind', SpanKind.CLIENT);
};

describe('Packages', () => {
  describe('get', () => {
    const scopeManager = new AsyncHooksScopeManager();
    const httpTextFormat = new DummyPropagation();
    const logger = new NoopLogger();
    const realTracer = new NodeTracer({
      scopeManager,
      logger,
      httpTextFormat,
    });
    const tracer = new ProxyTracer(realTracer, audit);
    beforeEach(() => {
      audit.reset();
    });

    before(() => {
      plugin.enable(http, tracer);
    });

    after(() => {
      // back to normal
      nock.cleanAll();
      nock.enableNetConnect();
    });

    let resHeaders: http.IncomingHttpHeaders;
    [
      { name: 'axios', httpPackage: axios }, //keep first
      { name: 'superagent', httpPackage: superagent },
      { name: 'got', httpPackage: { get: async (url: string) => got(url) } },
      {
        name: 'request',
        httpPackage: { get: async (url: string) => request(url) },
      },
    ].forEach(({ name, httpPackage }) => {
      it(`should create a span for GET requests and add propagation headers by using ${name} package`, async () => {
        if (process.versions.node.startsWith('12') && name === 'got') {
          // got complains with nock and node version 12+
          // > RequestError: The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type function
          // so let's make a real call
          nock.cleanAll();
          nock.enableNetConnect();
        } else {
          nock.load(__dirname + '/fixtures/google.json');
        }

        const urlparsed = url.parse(
          `http://www.google.com/search?q=axios&oq=axios&aqs=chrome.0.69i59l2j0l3j69i60.811j0j7&sourceid=chrome&ie=UTF-8`
        );
        const result = await httpPackage.get(urlparsed.href!);
        if (!resHeaders) {
          const res = result as AxiosResponse<{}>;
          resHeaders = res.headers;
        }
        const spans = audit.processSpans();
        assert.strictEqual(spans.length, 1);
        assert.ok(spans[0].name.indexOf(`GET ${urlparsed.pathname}`) >= 0);

        const span = spans[0];
        const validations = {
          hostname: urlparsed.hostname!,
          httpStatusCode: 200,
          httpMethod: 'GET',
          pathname: urlparsed.pathname!,
          path: urlparsed.path,
          resHeaders,
        };
        assert.strictEqual(span.attributes['span kind'], SpanKind.CLIENT);
        assertSpan(span, SpanKind.CLIENT, validations);
      });
    });
  });
});
