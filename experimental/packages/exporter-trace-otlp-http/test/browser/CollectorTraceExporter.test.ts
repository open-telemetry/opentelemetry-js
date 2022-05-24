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
import { OTLPExporterConfigBase, OTLPExporterError } from '@opentelemetry/otlp-exporter-base';
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
    let onInitSpy: any;

    beforeEach(() => {
      onInitSpy = sinon.stub(OTLPTraceExporter.prototype, 'onInit');
      collectorExporterConfig = {
        hostname: 'foo',
        url: 'http://foo.bar.com',
      };
      collectorTraceExporter = new OTLPTraceExporter(collectorExporterConfig);
    });

    it('should create an instance', () => {
      assert.ok(typeof collectorTraceExporter !== 'undefined');
    });

    it('should call onInit', () => {
      assert.strictEqual(onInitSpy.callCount, 1);
    });

    describe('when config contains certain params', () => {
      it('should set hostname', () => {
        assert.strictEqual(collectorTraceExporter.hostname, 'foo');
      });

      it('should set url', () => {
        assert.strictEqual(collectorTraceExporter.url, 'http://foo.bar.com');
      });
    });
  });

  describe('export', () => {
    beforeEach(() => {
      collectorExporterConfig = {
        hostname: 'foo',
        url: 'http://foo.bar.com',
      };
    });

    describe('when "sendBeacon" is available', () => {
      beforeEach(() => {
        collectorTraceExporter = new OTLPTraceExporter(
          collectorExporterConfig
        );
      });

      it('should successfully send the spans using sendBeacon', done => {
        collectorTraceExporter.export(spans, () => {
        });

        setTimeout(async () => {
          try {
            const args = stubBeacon.args[0];
            const url = args[0];
            const blob: Blob = args[1];
            const body = await blob.text();
            const json = JSON.parse(
              body
            ) as IExportTraceServiceRequest;
            const span1 =
              json.resourceSpans?.[0].scopeSpans?.[0].spans?.[0];

            assert.ok(typeof span1 !== 'undefined', "span doesn't exist");
            ensureSpanIsCorrect(span1);

            const resource = json.resourceSpans?.[0].resource;
            assert.ok(typeof resource !== 'undefined', "resource doesn't exist");
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
        const nop = () => {
        };
        const diagLogger: DiagLogger = {
          debug: spyLoggerDebug,
          error: spyLoggerError,
          info: nop,
          verbose: nop,
          warn: nop
        };

        diag.setLogger(diagLogger, DiagLogLevel.ALL);

        stubBeacon.returns(true);

        collectorTraceExporter.export(spans, () => {
        });

        setTimeout(() => {
          const response: any = spyLoggerDebug.args[2][0];
          assert.strictEqual(response, 'sendBeacon - can send');
          assert.strictEqual(spyLoggerError.args.length, 0);

          done();
        });
      });

      it('should log the error message', done => {
        stubBeacon.returns(false);

        collectorTraceExporter.export(spans, result => {
          assert.deepStrictEqual(result.code, ExportResultCode.FAILED);
          assert.ok(result.error?.message.includes('cannot send'));
          done();
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
        collectorTraceExporter = new OTLPTraceExporter(
          collectorExporterConfig
        );
        server = sinon.fakeServer.create();
      });
      afterEach(() => {
        server.restore();
      });

      it('should successfully send the spans using XMLHttpRequest', done => {
        collectorTraceExporter.export(spans, () => {
        });

        queueMicrotask(() => {
          const request = server.requests[0];
          assert.strictEqual(request.method, 'POST');
          assert.strictEqual(request.url, 'http://foo.bar.com');

          const body = request.requestBody;
          const json = JSON.parse(
            body
          ) as IExportTraceServiceRequest;
          const span1 =
            json.resourceSpans?.[0].scopeSpans?.[0].spans?.[0];

          assert.ok(typeof span1 !== 'undefined', "span doesn't exist");
          ensureSpanIsCorrect(span1);

          const resource = json.resourceSpans?.[0].resource;
          assert.ok(typeof resource !== 'undefined', "resource doesn't exist");
          ensureWebResourceIsCorrect(resource);

          assert.strictEqual(stubBeacon.callCount, 0);
          ensureExportTraceServiceRequestIsSet(json);

          clock.restore();
          done();
        });
      });

      it('should log the successful message', done => {
        const spyLoggerDebug = sinon.stub();
        const spyLoggerError = sinon.stub();
        const nop = () => {
        };
        const diagLogger: DiagLogger = {
          debug: spyLoggerDebug,
          error: spyLoggerError,
          info: nop,
          verbose: nop,
          warn: nop
        };

        diag.setLogger(diagLogger, DiagLogLevel.ALL);

        collectorTraceExporter.export(spans, () => {
        });

        queueMicrotask(() => {
          const request = server.requests[0];
          request.respond(200);
          const response: any = spyLoggerDebug.args[2][0];
          assert.strictEqual(response, 'xhr success');
          assert.strictEqual(spyLoggerError.args.length, 0);
          assert.strictEqual(stubBeacon.callCount, 0);

          clock.restore();
          done();
        });
      });

      it('should log the error message', done => {
        collectorTraceExporter.export(spans, result => {
          assert.deepStrictEqual(result.code, ExportResultCode.FAILED);
          assert.ok(result.error?.message.includes('Failed to export'));
          done();
        });

        queueMicrotask(() => {
          const request = server.requests[0];
          request.respond(400);
          clock.restore();
          done();
        });
      });

      it('should send custom headers', done => {
        collectorTraceExporter.export(spans, () => {
        });

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


  describe('export - common', () => {
    let spySend: any;
    beforeEach(() => {
      spySend = sinon.stub(OTLPTraceExporter.prototype, 'send');
      collectorTraceExporter = new OTLPTraceExporter(collectorExporterConfig);
    });

    it('should export spans as otlpTypes.Spans', done => {
      const spans: ReadableSpan[] = [];
      spans.push(Object.assign({}, mockedReadableSpan));

      collectorTraceExporter.export(spans, () => {
      });
      setTimeout(() => {
        const span1 = spySend.args[0][0][0] as ReadableSpan;
        assert.deepStrictEqual(spans[0], span1);
        done();
      });
      assert.strictEqual(spySend.callCount, 1);
    });

    describe('when exporter is shutdown', () => {
      it(
        'should not export anything but return callback with code' +
        ' "FailedNotRetryable"',
        async () => {
          const spans: ReadableSpan[] = [];
          spans.push(Object.assign({}, mockedReadableSpan));
          await collectorTraceExporter.shutdown();
          spySend.resetHistory();

          const callbackSpy = sinon.spy();
          collectorTraceExporter.export(spans, callbackSpy);
          const returnCode = callbackSpy.args[0][0];

          assert.strictEqual(
            returnCode.code,
            ExportResultCode.FAILED,
            'return value is wrong'
          );
          assert.strictEqual(spySend.callCount, 0, 'should not call send');
        }
      );
    });
    describe('when an error occurs', () => {
      it('should return failed export result', done => {
        const spans: ReadableSpan[] = [];
        spans.push(Object.assign({}, mockedReadableSpan));
        spySend.throws({
          code: 100,
          details: 'Test error',
          metadata: {},
          message: 'Non-retryable',
          stack: 'Stack',
        });
        const callbackSpy = sinon.spy();
        collectorTraceExporter.export(spans, callbackSpy);
        setTimeout(() => {
          const returnCode = callbackSpy.args[0][0];
          assert.strictEqual(
            returnCode.code,
            ExportResultCode.FAILED,
            'return value is wrong'
          );
          assert.strictEqual(
            returnCode.error.message,
            'Non-retryable',
            'return error message is wrong'
          );
          assert.strictEqual(spySend.callCount, 1, 'should call send');
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

        collectorTraceExporter = new OTLPTraceExporter(
          collectorExporterConfig
        );
      });
      it('should successfully send custom headers using XMLHTTPRequest', done => {
        collectorTraceExporter.export(spans, () => {
        });

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
        collectorTraceExporter = new OTLPTraceExporter(
          collectorExporterConfig
        );
      });

      it('should successfully send spans using XMLHttpRequest', done => {
        collectorTraceExporter.export(spans, () => {
        });

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
        clock.tick(10000);
        clock.restore();

        setTimeout(() => {
          const result = responseSpy.args[0][0] as core.ExportResult;
          assert.strictEqual(result.code, core.ExportResultCode.FAILED);
          const error = result.error as OTLPExporterError;
          assert.ok(error !== undefined);
          assert.strictEqual(error.message, 'Request Timeout');

          done();
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

      const failures = callbackSpy.args.filter(([result]) => result.code === ExportResultCode.FAILED);

      setTimeout(() => {
        // Expect 4 failures
        assert.strictEqual(failures.length, 4);
        failures.forEach(([result]) => {
          assert.strictEqual(result.code, ExportResultCode.FAILED);
          assert.strictEqual(
            result.error!.message,
            'Concurrent export limit reached'
          );
        });
        done();
      });
    });
  });
});

describe('OTLPTraceExporter - browser (getDefaultUrl)', () => {
  it('should default to v1/trace', done => {
    const collectorExporter = new OTLPTraceExporter({});
    setTimeout(() => {
      assert.strictEqual(
        collectorExporter['url'],
        'http://localhost:4318/v1/traces'
      );
      done();
    });
  });
  it('should keep the URL if included', done => {
    const url = 'http://foo.bar.com';
    const collectorExporter = new OTLPTraceExporter({ url });
    setTimeout(() => {
      assert.strictEqual(collectorExporter['url'], url);
      done();
    });
  });
});

describe('when configuring via environment', () => {
  const envSource = window as any;
  it('should use url defined in env that ends with root path and append version and signal path', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/';
    const collectorExporter = new OTLPTraceExporter();
    assert.strictEqual(
      collectorExporter.url,
      `${envSource.OTEL_EXPORTER_OTLP_ENDPOINT}v1/traces`
    );
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
  });
  it('should use url defined in env without checking if path is already present', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/v1/traces';
    const collectorExporter = new OTLPTraceExporter();
    assert.strictEqual(
      collectorExporter.url,
      `${envSource.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`
    );
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
  });
  it('should use url defined in env and append version and signal', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar';
    const collectorExporter = new OTLPTraceExporter();
    assert.strictEqual(
      collectorExporter.url,
      `${envSource.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`
    );
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
  });
  it('should override global exporter url with signal url defined in env', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/';
    envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = 'http://foo.traces/';
    const collectorExporter = new OTLPTraceExporter();
    assert.strictEqual(
      collectorExporter.url,
      envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
    );
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '';
  });
  it('should add root path when signal url defined in env contains no path and no root path', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = 'http://foo.bar';
    const collectorExporter = new OTLPTraceExporter();
    assert.strictEqual(
      collectorExporter.url,
      `${envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT}/`
    );
    envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '';
  });
  it('should not add root path when signal url defined in env contains root path but no path', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = 'http://foo.bar/';
    const collectorExporter = new OTLPTraceExporter();
    assert.strictEqual(
      collectorExporter.url,
      `${envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT}`
    );
    envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '';
  });
  it('should not add root path when signal url defined in env contains path', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = 'http://foo.bar/v1/traces';
    const collectorExporter = new OTLPTraceExporter();
    assert.strictEqual(
      collectorExporter.url,
      `${envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT}`
    );
    envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '';
  });
  it('should not add root path when signal url defined in env contains path and ends in /', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = 'http://foo.bar/v1/traces/';
    const collectorExporter = new OTLPTraceExporter();
    assert.strictEqual(
      collectorExporter.url,
      `${envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT}`
    );
    envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '';
  });
  it('should use headers defined via env', () => {
    envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar';
    const collectorExporter = new OTLPTraceExporter({ headers: {} });
    // @ts-expect-error access internal property for testing
    assert.strictEqual(collectorExporter._headers.foo, 'bar');
    envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
  });
  it('should override global headers config with signal headers defined via env', () => {
    envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar,bar=foo';
    envSource.OTEL_EXPORTER_OTLP_TRACES_HEADERS = 'foo=boo';
    const collectorExporter = new OTLPTraceExporter({ headers: {} });
    // @ts-expect-error access internal property for testing
    assert.strictEqual(collectorExporter._headers.foo, 'boo');
    // @ts-expect-error access internal property for testing
    assert.strictEqual(collectorExporter._headers.bar, 'foo');
    envSource.OTEL_EXPORTER_OTLP_TRACES_HEADERS = '';
    envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
  });
});
