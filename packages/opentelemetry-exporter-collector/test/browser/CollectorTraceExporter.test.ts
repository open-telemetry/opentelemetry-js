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
import { CollectorTraceExporter } from '../../src/platform/browser/index';
import * as collectorTypes from '../../src/types';
import { CollectorExporterConfigBrowser } from '../../src/platform/browser/types';

import {
  ensureSpanIsCorrect,
  ensureExportTraceServiceRequestIsSet,
  ensureWebResourceIsCorrect,
  ensureHeadersContain,
  mockedReadableSpan,
} from '../helper';
const sendBeacon = navigator.sendBeacon;

describe('CollectorTraceExporter - web', () => {
  let collectorTraceExporter: CollectorTraceExporter;
  let collectorExporterConfig: CollectorExporterConfigBrowser;
  let spyOpen: sinon.SinonSpy;
  let spySend: sinon.SinonSpy;
  let spyBeacon: sinon.SinonSpy;
  let spans: ReadableSpan[];

  beforeEach(() => {
    spyOpen = sinon.stub(XMLHttpRequest.prototype, 'open');
    spySend = sinon.stub(XMLHttpRequest.prototype, 'send');
    spyBeacon = sinon.stub(navigator, 'sendBeacon');
    spans = [];
    spans.push(Object.assign({}, mockedReadableSpan));
  });

  afterEach(() => {
    navigator.sendBeacon = sendBeacon;
    spyOpen.restore();
    spySend.restore();
    spyBeacon.restore();
  });

  describe('export', () => {
    beforeEach(() => {
      collectorExporterConfig = {
        hostname: 'foo',
        logger: new NoopLogger(),
        serviceName: 'bar',
        attributes: {},
        url: 'http://foo.bar.com',
      };
    });

    describe('when "sendBeacon" is available', () => {
      beforeEach(() => {
        collectorTraceExporter = new CollectorTraceExporter(
          collectorExporterConfig
        );
      });

      it('should successfully send the spans using sendBeacon', done => {
        collectorTraceExporter.export(spans, () => {});

        setTimeout(() => {
          const args = spyBeacon.args[0];
          const url = args[0];
          const body = args[1];
          const json = JSON.parse(
            body
          ) as collectorTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest;
          const span1 =
            json.resourceSpans[0].instrumentationLibrarySpans[0].spans[0];

          assert.ok(typeof span1 !== 'undefined', "span doesn't exist");
          if (span1) {
            ensureSpanIsCorrect(span1);
          }

          const resource = json.resourceSpans[0].resource;
          assert.ok(typeof resource !== 'undefined', "resource doesn't exist");
          if (resource) {
            ensureWebResourceIsCorrect(resource);
          }

          assert.strictEqual(url, 'http://foo.bar.com');
          assert.strictEqual(spyBeacon.callCount, 1);

          assert.strictEqual(spyOpen.callCount, 0);

          ensureExportTraceServiceRequestIsSet(json);

          done();
        });
      });

      it('should log the successful message', done => {
        const spyLoggerDebug = sinon.stub(
          collectorTraceExporter.logger,
          'debug'
        );
        const spyLoggerError = sinon.stub(
          collectorTraceExporter.logger,
          'error'
        );
        spyBeacon.restore();
        spyBeacon = sinon.stub(window.navigator, 'sendBeacon').returns(true);

        collectorTraceExporter.export(spans, () => {});

        setTimeout(() => {
          const response: any = spyLoggerDebug.args[1][0];
          assert.strictEqual(response, 'sendBeacon - can send');
          assert.strictEqual(spyLoggerError.args.length, 0);

          done();
        });
      });

      it('should log the error message', done => {
        const spyLoggerDebug = sinon.stub(
          collectorTraceExporter.logger,
          'debug'
        );
        const spyLoggerError = sinon.stub(
          collectorTraceExporter.logger,
          'error'
        );
        spyBeacon.restore();
        spyBeacon = sinon.stub(window.navigator, 'sendBeacon').returns(false);

        collectorTraceExporter.export(spans, () => {});

        setTimeout(() => {
          const response: any = spyLoggerError.args[0][0];
          assert.strictEqual(response, 'sendBeacon - cannot send');
          assert.strictEqual(spyLoggerDebug.args.length, 1);

          done();
        });
      });
    });

    describe('when "sendBeacon" is NOT available', () => {
      let server: any;
      beforeEach(() => {
        (window.navigator as any).sendBeacon = false;
        collectorTraceExporter = new CollectorTraceExporter(
          collectorExporterConfig
        );
        server = sinon.fakeServer.create();
      });
      afterEach(() => {
        server.restore();
      });

      it('should successfully send the spans using XMLHttpRequest', done => {
        collectorTraceExporter.export(spans, () => {});

        setTimeout(() => {
          const request = server.requests[0];
          assert.strictEqual(request.method, 'POST');
          assert.strictEqual(request.url, 'http://foo.bar.com');

          const body = request.requestBody;
          const json = JSON.parse(
            body
          ) as collectorTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest;
          const span1 =
            json.resourceSpans[0].instrumentationLibrarySpans[0].spans[0];

          assert.ok(typeof span1 !== 'undefined', "span doesn't exist");
          if (span1) {
            ensureSpanIsCorrect(span1);
          }

          const resource = json.resourceSpans[0].resource;
          assert.ok(typeof resource !== 'undefined', "resource doesn't exist");
          if (resource) {
            ensureWebResourceIsCorrect(resource);
          }

          assert.strictEqual(spyBeacon.callCount, 0);

          ensureExportTraceServiceRequestIsSet(json);

          done();
        });
      });

      it('should log the successful message', done => {
        const spyLoggerDebug = sinon.stub(
          collectorTraceExporter.logger,
          'debug'
        );
        const spyLoggerError = sinon.stub(
          collectorTraceExporter.logger,
          'error'
        );

        collectorTraceExporter.export(spans, () => {});

        setTimeout(() => {
          const request = server.requests[0];
          request.respond(200);

          const response: any = spyLoggerDebug.args[1][0];
          assert.strictEqual(response, 'xhr success');
          assert.strictEqual(spyLoggerError.args.length, 0);

          assert.strictEqual(spyBeacon.callCount, 0);
          done();
        });
      });

      it('should log the error message', done => {
        const spyLoggerError = sinon.stub(
          collectorTraceExporter.logger,
          'error'
        );

        collectorTraceExporter.export(spans, () => {});

        setTimeout(() => {
          const request = server.requests[0];
          request.respond(400);

          const response1: any = spyLoggerError.args[0][0];
          const response2: any = spyLoggerError.args[1][0];
          assert.strictEqual(response1, 'body');
          assert.strictEqual(response2, 'xhr error');

          assert.strictEqual(spyBeacon.callCount, 0);
          done();
        });
      });

      it('should send custom headers', done => {
        collectorTraceExporter.export(spans, () => {});

        setTimeout(() => {
          const request = server.requests[0];
          request.respond(200);

          assert.strictEqual(spyBeacon.callCount, 0);
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
      collectorExporterConfig = {
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
        collectorTraceExporter = new CollectorTraceExporter(
          collectorExporterConfig
        );
      });
      it('should successfully send custom headers using XMLHTTPRequest', done => {
        collectorTraceExporter.export(spans, () => {});

        setTimeout(() => {
          const [{ requestHeaders }] = server.requests;

          ensureHeadersContain(requestHeaders, customHeaders);
          assert.strictEqual(spyBeacon.callCount, 0);
          assert.strictEqual(spyOpen.callCount, 0);

          done();
        });
      });
    });

    describe('when "sendBeacon" is NOT available', () => {
      beforeEach(() => {
        (window.navigator as any).sendBeacon = false;
        collectorTraceExporter = new CollectorTraceExporter(
          collectorExporterConfig
        );
      });

      it('should successfully send spans using XMLHttpRequest', done => {
        collectorTraceExporter.export(spans, () => {});

        setTimeout(() => {
          const [{ requestHeaders }] = server.requests;

          ensureHeadersContain(requestHeaders, customHeaders);
          assert.strictEqual(spyBeacon.callCount, 0);
          assert.strictEqual(spyOpen.callCount, 0);

          done();
        });
      });
    });
  });
});

describe('CollectorTraceExporter - browser (getDefaultUrl)', () => {
  it('should default to v1/trace', done => {
    const collectorExporter = new CollectorTraceExporter({});
    setTimeout(() => {
      assert.strictEqual(
        collectorExporter['url'],
        'http://localhost:55681/v1/trace'
      );
      done();
    });
  });
  it('should keep the URL if included', done => {
    const url = 'http://foo.bar.com';
    const collectorExporter = new CollectorTraceExporter({ url });
    setTimeout(() => {
      assert.strictEqual(collectorExporter['url'], url);
      done();
    });
  });
});
