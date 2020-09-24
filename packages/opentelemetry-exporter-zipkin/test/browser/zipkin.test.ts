/*
 * Copyright The OpenTelemetry Authors
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
import { ReadableSpan } from '@opentelemetry/tracing';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { ZipkinExporter } from '../../src';
import * as zipkinTypes from '../../src/types';
import {
  ensureHeadersContain,
  ensureSpanIsCorrect,
  mockedReadableSpan,
} from '../helper';

const sendBeacon = navigator.sendBeacon;

describe('Zipkin Exporter - web', () => {
  let zipkinExporter: ZipkinExporter;
  let zipkinConfig: zipkinTypes.ExporterConfig = {};
  let spySend: sinon.SinonSpy;
  let spyBeacon: sinon.SinonSpy;
  let spans: ReadableSpan[];
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    spySend = sandbox.stub(XMLHttpRequest.prototype, 'send');
    spyBeacon = sandbox.stub(navigator, 'sendBeacon');
    spans = [];
    spans.push(Object.assign({}, mockedReadableSpan));
  });

  afterEach(() => {
    sandbox.restore();
    navigator.sendBeacon = sendBeacon;
  });

  describe('export', () => {
    describe('when "sendBeacon" is available', () => {
      beforeEach(() => {
        zipkinExporter = new ZipkinExporter(zipkinConfig);
      });

      it('should successfully send the spans using sendBeacon', done => {
        zipkinExporter.export(spans, () => {});

        setTimeout(() => {
          const args = spyBeacon.args[0];
          const body = args[1];
          const json = JSON.parse(body) as any;
          ensureSpanIsCorrect(json[0]);
          assert.strictEqual(spyBeacon.callCount, 1);
          assert.strictEqual(spySend.callCount, 0);

          done();
        });
      });
    });

    describe('when "sendBeacon" is NOT available', () => {
      let server: any;
      beforeEach(() => {
        (window.navigator as any).sendBeacon = false;
        zipkinExporter = new ZipkinExporter(zipkinConfig);
        server = sinon.fakeServer.create();
      });
      afterEach(() => {
        server.restore();
      });

      it('should successfully send the spans using XMLHttpRequest', done => {
        zipkinExporter.export(spans, () => {});

        setTimeout(() => {
          const request = server.requests[0];
          const body = request.requestBody;
          const json = JSON.parse(body) as any;
          ensureSpanIsCorrect(json[0]);

          done();
        });
      });
    });
  });

  describe('export with custom headers', () => {
    let server: any;
    const customHeaders = {
      foo: 'bar',
      bar: 'baz',
    };

    beforeEach(() => {
      zipkinConfig = {
        logger: new NoopLogger(),
        headers: customHeaders,
      };
      server = sinon.fakeServer.create();
    });

    afterEach(() => {
      server.restore();
    });

    describe('when "sendBeacon" is available', () => {
      beforeEach(() => {
        zipkinExporter = new ZipkinExporter(zipkinConfig);
      });
      it('should successfully send custom headers using XMLHTTPRequest', done => {
        zipkinExporter.export(spans, () => {});

        setTimeout(() => {
          const [{ requestHeaders }] = server.requests;

          ensureHeadersContain(requestHeaders, customHeaders);
          assert.strictEqual(spyBeacon.callCount, 0);

          done();
        });
      });
    });

    describe('when "sendBeacon" is NOT available', () => {
      beforeEach(() => {
        (window.navigator as any).sendBeacon = false;
        zipkinExporter = new ZipkinExporter(zipkinConfig);
      });

      it('should successfully send custom headers using XMLHTTPRequest', done => {
        zipkinExporter.export(spans, () => {});

        setTimeout(() => {
          const [{ requestHeaders }] = server.requests;

          ensureHeadersContain(requestHeaders, customHeaders);
          assert.strictEqual(spyBeacon.callCount, 0);

          done();
        });
      });
    });
  });
});
