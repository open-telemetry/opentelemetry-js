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

import * as core from '@opentelemetry/core';
import { diag, DiagLogger, DiagLogLevel } from '@opentelemetry/api';
import { ExportResultCode } from '@opentelemetry/core';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { OTLPTraceExporter } from '../../src/platform/browser/index';
import {
  ensureSpanIsCorrect,
  ensureExportTraceServiceRequestIsSet,
  ensureWebResourceIsCorrect,
  ensureHeadersContain,
  mockedReadableSpan,
} from '../traceHelper';
import {
  OTLPExporterConfigBase,
  OTLPExporterError,
} from '@opentelemetry/otlp-exporter-base';
import { IExportTraceServiceRequest } from '@opentelemetry/otlp-transformer';

describe('OTLPTraceExporter - web', () => {
  let collectorTraceExporter: OTLPTraceExporter;
  let collectorExporterConfig: OTLPExporterConfigBase;
  let stubOpen: sinon.SinonStub;
  let stubBeacon: sinon.SinonStub;
  let spans: ReadableSpan[];

  beforeEach(() => {
    stubOpen = sinon.stub(XMLHttpRequest.prototype, 'open');
    sinon.stub(XMLHttpRequest.prototype, 'send');
    stubBeacon = sinon.stub(navigator, 'sendBeacon');
    spans = [];
    spans.push(Object.assign({}, mockedReadableSpan));
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    beforeEach(() => {
      collectorExporterConfig = {
        url: 'http://foo.bar.com',
      };
      collectorTraceExporter = new OTLPTraceExporter(collectorExporterConfig);
    });

    it('should create an instance', () => {
      assert.ok(typeof collectorTraceExporter !== 'undefined');
    });
  });

  describe('export', () => {
    beforeEach(() => {
      collectorExporterConfig = {
        url: 'http://foo.bar.com',
      };
    });

    describe('when "sendBeacon" is available', () => {
      beforeEach(() => {
        collectorTraceExporter = new OTLPTraceExporter(collectorExporterConfig);
      });

      it('should successfully send the spans using sendBeacon', done => {
        collectorTraceExporter.export(spans, () => {});

        setTimeout(async () => {
          try {
            const args = stubBeacon.args[0];
            const url = args[0];
            const blob: Blob = args[1];
            const body = await blob.text();
            const json = JSON.parse(body) as IExportTraceServiceRequest;
            const span1 = json.resourceSpans?.[0].scopeSpans?.[0].spans?.[0];

            assert.ok(typeof span1 !== 'undefined', "span doesn't exist");
            ensureSpanIsCorrect(span1);

            const resource = json.resourceSpans?.[0].resource;
            assert.ok(
              typeof resource !== 'undefined',
              "resource doesn't exist"
            );
            ensureWebResourceIsCorrect(resource);

            assert.strictEqual(url, 'http://foo.bar.com');
            assert.strictEqual(stubBeacon.callCount, 1);

            assert.strictEqual(stubOpen.callCount, 0);

            ensureExportTraceServiceRequestIsSet(json);
            done();
          } catch (err) {
            done(err);
          }
        });
      });

      it('should log the successful message', done => {
        const spyLoggerDebug = sinon.stub();
        const spyLoggerError = sinon.stub();
        const nop = () => {};
        const diagLogger: DiagLogger = {
          debug: spyLoggerDebug,
          error: spyLoggerError,
          info: nop,
          verbose: nop,
          warn: nop,
        };

        diag.setLogger(diagLogger, DiagLogLevel.ALL);

        stubBeacon.returns(true);

        collectorTraceExporter.export(spans, () => {});

        queueMicrotask(() => {
          try {
            sinon.assert.calledWith(spyLoggerDebug, 'SendBeacon success');
            sinon.assert.notCalled(spyLoggerError);

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it('should log the error message', done => {
        stubBeacon.returns(false);

        collectorTraceExporter.export(spans, result => {
          try {
            assert.deepStrictEqual(result.code, ExportResultCode.FAILED);
            assert.ok(
              result.error,
              'Expected Error, but no Error was present on the result'
            );
            assert.match(result.error?.message, /SendBeacon failed/);
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });

    describe('when "sendBeacon" is NOT available', () => {
      let server: any;
      let clock: sinon.SinonFakeTimers;
      beforeEach(() => {
        // fakeTimers is used to replace the next setTimeout which is
        // located in sendWithXhr function called by the export method
        clock = sinon.useFakeTimers();

        (window.navigator as any).sendBeacon = false;
        server = sinon.fakeServer.create();
        collectorTraceExporter = new OTLPTraceExporter(collectorExporterConfig);
      });
      afterEach(() => {
        server.restore();
      });

      it('should successfully send the spans using XMLHttpRequest', done => {
        collectorTraceExporter.export(spans, () => {});

        queueMicrotask(async () => {
          try {
            const request = server.requests[0];
            assert.strictEqual(request.method, 'POST');
            assert.strictEqual(request.url, 'http://foo.bar.com');

            const body = request.requestBody as Blob;
            const decoder = new TextDecoder();
            const json = JSON.parse(
              decoder.decode(await body.arrayBuffer())
            ) as IExportTraceServiceRequest;
            const span1 = json.resourceSpans?.[0].scopeSpans?.[0].spans?.[0];

            assert.ok(typeof span1 !== 'undefined', "span doesn't exist");
            ensureSpanIsCorrect(span1);

            const resource = json.resourceSpans?.[0].resource;
            assert.ok(
              typeof resource !== 'undefined',
              "resource doesn't exist"
            );
            ensureWebResourceIsCorrect(resource);

            assert.strictEqual(stubBeacon.callCount, 0);
            ensureExportTraceServiceRequestIsSet(json);

            clock.restore();
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it('should log the successful message', done => {
        const spyLoggerDebug = sinon.stub();
        const spyLoggerError = sinon.stub();
        const nop = () => {};
        const diagLogger: DiagLogger = {
          debug: spyLoggerDebug,
          error: spyLoggerError,
          info: nop,
          verbose: nop,
          warn: nop,
        };

        diag.setLogger(diagLogger, DiagLogLevel.ALL);

        collectorTraceExporter.export(spans, () => {});

        queueMicrotask(() => {
          const request = server.requests[0];
          request.respond(200);
          try {
            const response: any = spyLoggerDebug.args[2][0];
            assert.strictEqual(response, 'XHR success');
            assert.strictEqual(spyLoggerError.args.length, 0);
            assert.strictEqual(stubBeacon.callCount, 0);
            clock.restore();
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it('should log the error message', done => {
        collectorTraceExporter.export(spans, result => {
          try {
            assert.deepStrictEqual(result.code, ExportResultCode.FAILED);
            assert.deepStrictEqual(
              result.error?.message,
              'XHR request failed with non-retryable status'
            );
          } catch (e) {
            done(e);
          }
          done();
        });

        queueMicrotask(() => {
          const request = server.requests[0];
          request.respond(400);
        });
      });

      it('should send custom headers', done => {
        collectorTraceExporter.export(spans, () => {});

        queueMicrotask(() => {
          const request = server.requests[0];
          request.respond(200);

          assert.strictEqual(stubBeacon.callCount, 0);
          clock.restore();
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
        headers: customHeaders,
      };
      server = sinon.fakeServer.create();
    });

    afterEach(() => {
      server.restore();
    });

    describe('when "sendBeacon" is available', () => {
      let clock: sinon.SinonFakeTimers;
      beforeEach(() => {
        // fakeTimers is used to replace the next setTimeout which is
        // located in sendWithXhr function called by the export method
        clock = sinon.useFakeTimers();

        collectorTraceExporter = new OTLPTraceExporter(collectorExporterConfig);
      });
      it('should successfully send custom headers using XMLHTTPRequest', done => {
        collectorTraceExporter.export(spans, () => {});

        queueMicrotask(() => {
          const [{ requestHeaders }] = server.requests;

          ensureHeadersContain(requestHeaders, customHeaders);
          assert.strictEqual(stubBeacon.callCount, 0);
          assert.strictEqual(stubOpen.callCount, 0);

          clock.restore();
          done();
        });
      });
    });

    describe('when "sendBeacon" is NOT available', () => {
      let clock: sinon.SinonFakeTimers;
      beforeEach(() => {
        // fakeTimers is used to replace the next setTimeout which is
        // located in sendWithXhr function called by the export method
        clock = sinon.useFakeTimers();

        (window.navigator as any).sendBeacon = false;
        collectorTraceExporter = new OTLPTraceExporter(collectorExporterConfig);
      });

      it('should successfully send spans using XMLHttpRequest', done => {
        collectorTraceExporter.export(spans, () => {});

        queueMicrotask(() => {
          const [{ requestHeaders }] = server.requests;

          ensureHeadersContain(requestHeaders, customHeaders);
          assert.strictEqual(stubBeacon.callCount, 0);
          assert.strictEqual(stubOpen.callCount, 0);

          clock.restore();
          done();
        });
      });
      it('should log the timeout request error message', done => {
        const responseSpy = sinon.spy();
        collectorTraceExporter.export(spans, responseSpy);
        clock.tick(20000);
        clock.restore();

        setTimeout(() => {
          try {
            const result = responseSpy.args[0][0] as core.ExportResult;
            assert.strictEqual(result.code, core.ExportResultCode.FAILED);
            const error = result.error as OTLPExporterError;
            assert.ok(error !== undefined);
            assert.strictEqual(error.message, 'XHR request timed out');
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });
  });

  describe('export - concurrency limit', () => {
    it('should error if too many concurrent exports are queued', done => {
      const collectorExporterWithConcurrencyLimit = new OTLPTraceExporter({
        ...collectorExporterConfig,
        concurrencyLimit: 3,
      });
      const spans: ReadableSpan[] = [{ ...mockedReadableSpan }];
      const callbackSpy = sinon.spy();
      for (let i = 0; i < 7; i++) {
        collectorExporterWithConcurrencyLimit.export(spans, callbackSpy);
      }

      const failures = callbackSpy.args.filter(
        ([result]) => result.code === ExportResultCode.FAILED
      );

      setTimeout(() => {
        // Expect 4 failures
        try {
          assert.strictEqual(failures.length, 4);
          failures.forEach(([result]) => {
            assert.strictEqual(result.code, ExportResultCode.FAILED);
            assert.strictEqual(
              result.error!.message,
              'Concurrent export limit reached'
            );
          });
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});

describe('export with retry - real http request destroyed', () => {
  let server: any;
  let collectorTraceExporter: OTLPTraceExporter;
  let collectorExporterConfig: OTLPExporterConfigBase;
  let spans: ReadableSpan[];

  beforeEach(() => {
    server = sinon.fakeServer.create({
      autoRespond: true,
    });
    collectorExporterConfig = {
      timeoutMillis: 1500,
    };
  });

  afterEach(() => {
    server.restore();
  });

  describe('when "sendBeacon" is NOT available', () => {
    beforeEach(() => {
      (window.navigator as any).sendBeacon = false;
      collectorTraceExporter = new OTLPTraceExporter(collectorExporterConfig);
    });
    it('should log the retryable request error message when retrying with exponential backoff with jitter', done => {
      spans = [];
      spans.push(Object.assign({}, mockedReadableSpan));

      let calls = 0;
      server.respondWith(
        'http://localhost:4318/v1/traces',
        function (xhr: any) {
          calls++;
          xhr.respond(503);
        }
      );

      collectorTraceExporter.export(spans, result => {
        try {
          assert.strictEqual(result.code, core.ExportResultCode.FAILED);
          const error = result.error as OTLPExporterError;
          assert.ok(error !== undefined);
          assert.strictEqual(
            error.message,
            'Export failed with retryable status'
          );
          assert.strictEqual(calls, 2);
          done();
        } catch (e) {
          done(e);
        }
      });
    }).timeout(3000);

    it('should log the timeout request error message when retry-after header is set to 3 seconds', done => {
      spans = [];
      spans.push(Object.assign({}, mockedReadableSpan));

      let calls = 0;
      server.respondWith(
        'http://localhost:4318/v1/traces',
        function (xhr: any) {
          calls++;
          xhr.respond(503, { 'Retry-After': 0.1 });
        }
      );

      collectorTraceExporter.export(spans, result => {
        try {
          assert.strictEqual(result.code, core.ExportResultCode.FAILED);
          const error = result.error as OTLPExporterError;
          assert.ok(error !== undefined);
          assert.strictEqual(
            error.message,
            'Export failed with retryable status'
          );
          assert.strictEqual(calls, 6);
          done();
        } catch (e) {
          done(e);
        }
      });
    }).timeout(3000);
    it('should log the timeout request error message when retry-after header is a date', done => {
      spans = [];
      spans.push(Object.assign({}, mockedReadableSpan));

      let retry = 0;
      server.respondWith(
        'http://localhost:4318/v1/traces',
        function (xhr: any) {
          retry++;
          const d = new Date();
          d.setSeconds(d.getSeconds() + 0.1);
          xhr.respond(503, { 'Retry-After': d });
        }
      );

      collectorTraceExporter.export(spans, result => {
        try {
          assert.strictEqual(result.code, core.ExportResultCode.FAILED);
          const error = result.error as OTLPExporterError;
          assert.ok(error !== undefined);
          assert.strictEqual(
            error.message,
            'Export failed with retryable status'
          );
          assert.strictEqual(retry, 6);
          done();
        } catch (e) {
          done(e);
        }
      });
    }).timeout(3000);
    it('should log the timeout request error message when retry-after header is a date with long delay', done => {
      spans = [];
      spans.push(Object.assign({}, mockedReadableSpan));

      let retry = 0;
      server.respondWith(
        'http://localhost:4318/v1/traces',
        function (xhr: any) {
          retry++;
          const d = new Date();
          d.setSeconds(d.getSeconds() + 120);
          xhr.respond(503, { 'Retry-After': d });
        }
      );

      collectorTraceExporter.export(spans, result => {
        try {
          assert.strictEqual(result.code, core.ExportResultCode.FAILED);
          const error = result.error as OTLPExporterError;
          assert.ok(error !== undefined);
          assert.strictEqual(
            error.message,
            'Export failed with retryable status'
          );
          assert.strictEqual(retry, 1);
          done();
        } catch (e) {
          done(e);
        }
      });
    }).timeout(3000);
  });
});
