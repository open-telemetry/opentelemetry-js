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

import { diag } from '@opentelemetry/api';
import { ExportResultCode } from '@opentelemetry/core';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { OTLPTraceExporter } from '../../src/platform/browser/index';
import { OTLPExporterConfigBase } from '../../src/types';
import * as otlpTypes from '../../src/types';

import {
  ensureSpanIsCorrect,
  ensureExportTraceServiceRequestIsSet,
  ensureWebResourceIsCorrect,
  ensureHeadersContain,
  mockedReadableSpan,
} from '../traceHelper';
import { resetSendWithBeacon } from '../../src/platform/browser/util';

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
    resetSendWithBeacon();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('export', () => {
    let server: any;
    beforeEach(() => {
      collectorExporterConfig = {
        hostname: 'foo',
        attributes: {},
        url: 'http://foo.bar.com',
      };
      server = sinon.fakeServer.create();
    });

    afterEach(() => {
      server.restore();
    });

    const testSpansSendUsingXhr = () => {
      const request = server.requests[0];
      assert.strictEqual(request.method, 'POST');
      assert.strictEqual(request.url, 'http://foo.bar.com');

      const body = request.requestBody;
      const json = JSON.parse(
        body
      ) as otlpTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest;
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

      ensureExportTraceServiceRequestIsSet(json);
    };

    describe('when "sendBeacon" is available and returns', () => {
      beforeEach(() => {
        collectorTraceExporter = new OTLPTraceExporter(collectorExporterConfig);
      });

      describe('"true"', () => {
        it('should successfully send the spans', done => {
          stubBeacon.returns(true);

          collectorTraceExporter.export(spans, () => {});

          setTimeout(async () => {
            const args = stubBeacon.args[0];
            const url = args[0];
            const blob: Blob = args[1];
            const body = await blob.text();
            const json = JSON.parse(
              body
            ) as otlpTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest;
            const span1 =
              json.resourceSpans[0].instrumentationLibrarySpans[0].spans[0];

            assert.ok(typeof span1 !== 'undefined', "span doesn't exist");
            if (span1) {
              ensureSpanIsCorrect(span1);
            }

            const resource = json.resourceSpans[0].resource;
            assert.ok(
              typeof resource !== 'undefined',
              "resource doesn't exist"
            );
            if (resource) {
              ensureWebResourceIsCorrect(resource);
            }

            assert.strictEqual(url, 'http://foo.bar.com');
            assert.strictEqual(stubBeacon.callCount, 1);

            assert.strictEqual(stubOpen.callCount, 0);

            ensureExportTraceServiceRequestIsSet(json);

            done();
          });
        });

        it('should log the successful message', done => {
          // Need to stub/spy on the underlying logger as the "diag" instance is global
          const spyLoggerDebug = sinon.stub(diag, 'debug');
          const spyLoggerError = sinon.stub(diag, 'error');
          stubBeacon.returns(true);

          collectorTraceExporter.export(spans, () => {});

          setTimeout(() => {
            const response: any = spyLoggerDebug.args[1][0];
            assert.strictEqual(response, 'sendBeacon - can send');
            assert.strictEqual(spyLoggerError.args.length, 0);

            done();
          });
        });
      });

      describe('"false"', () => {
        it('should log the info message', done => {
          const spyLoggerInfo = sinon.stub(diag, 'info');
          const spyLoggerError = sinon.stub(diag, 'error');
          stubBeacon.returns(false);

          collectorTraceExporter.export(spans, () => {});

          setTimeout(() => {
            const response: any = spyLoggerInfo.args[0][0];
            assert.strictEqual(
              response,
              'sendBeacon failed because the given payload was too big; try to lower your span processor limits'
            );
            assert.strictEqual(spyLoggerError.args.length, 0);

            done();
          });
        });

        it('should successfully send the spans using XMLHttpRequest as a fallback', done => {
          stubBeacon.returns(false);

          collectorTraceExporter.export(spans, () => {});

          setTimeout(() => {
            assert.strictEqual(stubBeacon.callCount, 1);
            testSpansSendUsingXhr();
            done();
          });
        });

        it('should NOT try to send a payload with size that previously failed', done => {
          stubBeacon.returns(false);

          collectorTraceExporter.export(spans, () => {});

          setTimeout(() => {
            assert.strictEqual(stubBeacon.callCount, 1);

            collectorTraceExporter.export(spans, () => {});

            setTimeout(() => {
              assert.strictEqual(stubBeacon.callCount, 1);
              done();
            });
          });
        });

        it('should NOT try to send a payload with size greater than previously failed', done => {
          stubBeacon.returns(false);

          collectorTraceExporter.export(spans, () => {});

          setTimeout(() => {
            assert.strictEqual(stubBeacon.callCount, 1);

            spans.push(Object.assign({}, mockedReadableSpan));
            collectorTraceExporter.export(spans, () => {});

            setTimeout(() => {
              assert.strictEqual(stubBeacon.callCount, 1);
              done();
            });
          });
        });

        it('should try to send a payload with size smaller than previously failed', done => {
          stubBeacon.returns(false);

          spans.push(Object.assign({}, mockedReadableSpan));
          collectorTraceExporter.export(spans, () => {});

          setTimeout(() => {
            assert.strictEqual(stubBeacon.callCount, 1);

            spans.pop();
            collectorTraceExporter.export(spans, () => {});

            setTimeout(() => {
              assert.strictEqual(stubBeacon.callCount, 2);
              done();
            });
          });
        });
      });
    });

    describe('when "sendBeacon" is NOT available', () => {
      beforeEach(() => {
        (window.navigator as any).sendBeacon = false;
        collectorTraceExporter = new OTLPTraceExporter(collectorExporterConfig);
      });

      it('should successfully send the spans using XMLHttpRequest', done => {
        collectorTraceExporter.export(spans, () => {});

        setTimeout(() => {
          assert.strictEqual(stubBeacon.callCount, 0);
          testSpansSendUsingXhr();
          done();
        });
      });

      it('should log the successful message', done => {
        // Need to stub/spy on the underlying logger as the "diag" instance is global
        const spyLoggerDebug = sinon.stub(diag, 'debug');
        const spyLoggerError = sinon.stub(diag, 'error');

        collectorTraceExporter.export(spans, () => {});

        setTimeout(() => {
          const request = server.requests[0];
          request.respond(200);

          const response: any = spyLoggerDebug.args[1][0];
          assert.strictEqual(response, 'xhr success');
          assert.strictEqual(spyLoggerError.args.length, 0);

          assert.strictEqual(stubBeacon.callCount, 0);
          done();
        });
      });

      it('should log the error message', done => {
        collectorTraceExporter.export(spans, result => {
          assert.deepStrictEqual(result.code, ExportResultCode.FAILED);
          assert.ok(result.error?.message.includes('Failed to export'));
          done();
        });

        setTimeout(() => {
          const request = server.requests[0];
          request.respond(400);
        });
      });

      it('should send custom headers', done => {
        collectorTraceExporter.export(spans, () => {});

        setTimeout(() => {
          const request = server.requests[0];
          request.respond(200);

          assert.strictEqual(stubBeacon.callCount, 0);
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
      beforeEach(() => {
        collectorTraceExporter = new OTLPTraceExporter(collectorExporterConfig);
      });
      it('should successfully send custom headers using XMLHTTPRequest', done => {
        collectorTraceExporter.export(spans, () => {});

        setTimeout(() => {
          const [{ requestHeaders }] = server.requests;

          ensureHeadersContain(requestHeaders, customHeaders);
          assert.strictEqual(stubBeacon.callCount, 0);
          assert.strictEqual(stubOpen.callCount, 0);

          done();
        });
      });
    });

    describe('when "sendBeacon" is NOT available', () => {
      beforeEach(() => {
        (window.navigator as any).sendBeacon = false;
        collectorTraceExporter = new OTLPTraceExporter(collectorExporterConfig);
      });

      it('should successfully send spans using XMLHttpRequest', done => {
        collectorTraceExporter.export(spans, () => {});

        setTimeout(() => {
          const [{ requestHeaders }] = server.requests;

          ensureHeadersContain(requestHeaders, customHeaders);
          assert.strictEqual(stubBeacon.callCount, 0);
          assert.strictEqual(stubOpen.callCount, 0);

          done();
        });
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
        'http://localhost:55681/v1/traces'
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
  it('should use url defined in env', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/v1/traces';
    const collectorExporter = new OTLPTraceExporter();
    assert.strictEqual(
      collectorExporter.url,
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT
    );
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
  });
  it('should use url defined in env and append version and signal when not present', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar';
    const collectorExporter = new OTLPTraceExporter();
    assert.strictEqual(
      collectorExporter.url,
      `${envSource.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`
    );
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
  });
  it('should override global exporter url with signal url defined in env', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar';
    envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = 'http://foo.traces';
    const collectorExporter = new OTLPTraceExporter();
    assert.strictEqual(
      collectorExporter.url,
      envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
    );
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
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
