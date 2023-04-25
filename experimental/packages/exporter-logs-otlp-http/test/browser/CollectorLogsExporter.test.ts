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

import { diag, DiagLogger, DiagLogLevel } from '@opentelemetry/api';
import { ExportResultCode } from '@opentelemetry/core';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { OTLPLogsExporter } from '../../src/platform/browser';
import { ensureHeadersContain, setUp, shutdown } from '../logsHelper';
import { OTLPLogsExporterOptions } from '../../src';
import { OTLPExporterConfigBase } from '@opentelemetry/otlp-exporter-base';
import { IExportLogsServiceRequest } from '@opentelemetry/otlp-transformer';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';

describe('OTLPLogsExporter - web', () => {
  let collectorExporter: OTLPLogsExporter;
  let stubOpen: sinon.SinonStub;
  let stubBeacon: sinon.SinonStub;
  let logs: ReadableLogRecord[];
  let debugStub: sinon.SinonStub;
  let errorStub: sinon.SinonStub;

  beforeEach(async () => {
    setUp();
    stubOpen = sinon.stub(XMLHttpRequest.prototype, 'open');
    sinon.stub(XMLHttpRequest.prototype, 'send');
    stubBeacon = sinon.stub(navigator, 'sendBeacon');

    // Need to stub/spy on the underlying logger as the "diag" instance is global
    debugStub = sinon.stub();
    errorStub = sinon.stub();
    const nop = () => {};
    const diagLogger: DiagLogger = {
      debug: debugStub,
      error: errorStub,
      info: nop,
      verbose: nop,
      warn: nop,
    };
    diag.setLogger(diagLogger, DiagLogLevel.DEBUG);
  });

  afterEach(async () => {
    await shutdown();
    sinon.restore();
    diag.disable();
  });

  describe('export', () => {
    describe('when "sendBeacon" is available', () => {
      beforeEach(() => {
        collectorExporter = new OTLPLogsExporter({
          url: 'http://foo.bar.com',
        });
      });

      it('should successfully send logs using sendBeacon', done => {
        collectorExporter.export(logs, () => {});

        setTimeout(async () => {
          const args = stubBeacon.args[0];
          const url = args[0];
          const blob: Blob = args[1];
          const body = await blob.text();
          const json = JSON.parse(body) as IExportLogsServiceRequest;

          // The order of the logs is not guaranteed.

          done();
        });
      });

      it('should log the successful message', done => {
        stubBeacon.returns(true);

        collectorExporter.export(logs, () => {});

        setTimeout(() => {
          const response: any = debugStub.args[2][0];
          assert.strictEqual(response, 'sendBeacon - can send');
          assert.strictEqual(errorStub.args.length, 0);

          done();
        });
      });

      it('should log the error message', done => {
        stubBeacon.returns(false);

        collectorExporter.export(logs, result => {
          assert.deepStrictEqual(result.code, ExportResultCode.FAILED);
          assert.ok(result.error?.message.includes('cannot send'));
          done();
        });
      });
    });

    describe('when "sendBeacon" is NOT available', () => {
      let server: any;
      beforeEach(() => {
        (window.navigator as any).sendBeacon = false;
        collectorExporter = new OTLPLogsExporter({
          url: 'http://foo.bar.com',
        });
        // Overwrites the start time to make tests consistent
        Object.defineProperty(collectorExporter, '_startTime', {
          value: 1592602232694000000,
        });
        server = sinon.fakeServer.create();
      });
      afterEach(() => {
        server.restore();
      });

      it('should successfully send the logs using XMLHttpRequest', done => {
        collectorExporter.export(logs, () => {});

        setTimeout(() => {
          const request = server.requests[0];
          assert.strictEqual(request.method, 'POST');
          assert.strictEqual(request.url, 'http://foo.bar.com');

          const body = request.requestBody;

          done();
        });
      });

      it('should log the successful message', done => {
        collectorExporter.export(logs, () => {});

        setTimeout(() => {
          const request = server.requests[0];
          request.respond(200);

          const response: any = debugStub.args[2][0];
          assert.strictEqual(response, 'xhr success');
          assert.strictEqual(errorStub.args.length, 0);

          assert.strictEqual(stubBeacon.callCount, 0);
          done();
        });
      });

      it('should log the error message', done => {
        collectorExporter.export(logs, result => {
          assert.deepStrictEqual(result.code, ExportResultCode.FAILED);
          assert.ok(result.error?.message.includes('Failed to export'));
          assert.strictEqual(stubBeacon.callCount, 0);
          done();
        });

        setTimeout(() => {
          const request = server.requests[0];
          request.respond(400);
        });
      });
      it('should send custom headers', done => {
        collectorExporter.export(logs, () => {});

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
    let collectorExporterConfig:
      | (OTLPExporterConfigBase & OTLPLogsExporterOptions)
      | undefined;

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
        collectorExporter = new OTLPLogsExporter(collectorExporterConfig);
      });
      it('should successfully send custom headers using XMLHTTPRequest', done => {
        collectorExporter.export(logs, () => {});

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
        collectorExporter = new OTLPLogsExporter(collectorExporterConfig);
      });

      it('should successfully send logs using XMLHttpRequest', done => {
        collectorExporter.export(logs, () => {});

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

describe('when configuring via environment', () => {
  const envSource = window as any;
  it('should use url defined in env that ends with root path and append version and signal path', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/';
    const collectorExporter = new OTLPLogsExporter();
    assert.strictEqual(
      collectorExporter._otlpExporter.url,
      `${envSource.OTEL_EXPORTER_OTLP_ENDPOINT}v1/logs`
    );
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
  });
  it('should use url defined in env without checking if path is already present', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/v1/logs';
    const collectorExporter = new OTLPLogsExporter();
    assert.strictEqual(
      collectorExporter._otlpExporter.url,
      `${envSource.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`
    );
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
  });
  it('should use url defined in env and append version and signal', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar';
    const collectorExporter = new OTLPLogsExporter();
    assert.strictEqual(
      collectorExporter._otlpExporter.url,
      `${envSource.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`
    );
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
  });
  it('should override global exporter url with signal url defined in env', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/';
    envSource.httpOTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://foo.logs/';
    const collectorExporter = new OTLPLogsExporter();
    assert.strictEqual(
      collectorExporter._otlpExporter.url,
      envSource.httpOTEL_EXPORTER_OTLP_LOGS_ENDPOINT
    );
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    envSource.httpOTEL_EXPORTER_OTLP_LOGS_ENDPOINT = '';
  });
  it('should add root path when signal url defined in env contains no path and no root path', () => {
    envSource.httpOTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://foo.bar';
    const collectorExporter = new OTLPLogsExporter();
    assert.strictEqual(
      collectorExporter._otlpExporter.url,
      `${envSource.httpOTEL_EXPORTER_OTLP_LOGS_ENDPOINT}/`
    );
    envSource.httpOTEL_EXPORTER_OTLP_LOGS_ENDPOINT = '';
  });
  it('should not add root path when signal url defined in env contains root path but no path', () => {
    envSource.httpOTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://foo.bar/';
    const collectorExporter = new OTLPLogsExporter();
    assert.strictEqual(
      collectorExporter._otlpExporter.url,
      `${envSource.httpOTEL_EXPORTER_OTLP_LOGS_ENDPOINT}`
    );
    envSource.httpOTEL_EXPORTER_OTLP_LOGS_ENDPOINT = '';
  });
  it('should not add root path when signal url defined in env contains path', () => {
    envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://foo.bar/v1/logs';
    const collectorExporter = new OTLPLogsExporter();
    assert.strictEqual(
      collectorExporter._otlpExporter.url,
      `${envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT}`
    );
    envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = '';
  });
  it('should not add root path when signal url defined in env contains path and ends in /', () => {
    envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://foo.bar/v1/logs/';
    const collectorExporter = new OTLPLogsExporter();
    assert.strictEqual(
      collectorExporter._otlpExporter.url,
      `${envSource.httpOTEL_EXPORTER_OTLP_LOGS_ENDPOINT}`
    );
    envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = '';
  });
  it('should use headers defined via env', () => {
    envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar';
    const collectorExporter = new OTLPLogsExporter({
      headers: {},
    });
    assert.strictEqual(
      collectorExporter['_otlpExporter']['_headers'].foo,
      'bar'
    );
    envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
  });
  it('should override global headers config with signal headers defined via env', () => {
    envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar,bar=foo';
    envSource.OTEL_EXPORTER_OTLP_LOGS_HEADERS = 'foo=boo';
    const collectorExporter = new OTLPLogsExporter({
      headers: {},
    });
    assert.strictEqual(
      collectorExporter['_otlpExporter']['_headers'].foo,
      'boo'
    );
    assert.strictEqual(
      collectorExporter['_otlpExporter']['_headers'].bar,
      'foo'
    );
    envSource.OTEL_EXPORTER_OTLP_LOGS_HEADERS = '';
    envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
  });
});
