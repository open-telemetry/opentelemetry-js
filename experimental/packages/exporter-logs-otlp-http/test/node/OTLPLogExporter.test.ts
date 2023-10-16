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
import * as assert from 'assert';
import * as http from 'http';
import * as sinon from 'sinon';
import * as Config from '../../src/platform/config';

import { OTLPLogExporter } from '../../src/platform/node';
import { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import {
  ensureExportLogsServiceRequestIsSet,
  ensureExportedLogRecordIsCorrect,
  mockedReadableLogRecord,
} from '../logHelper';
import { PassThrough, Stream } from 'stream';
import { IExportLogsServiceRequest } from '@opentelemetry/otlp-transformer';
import { ExportResultCode } from '@opentelemetry/core';

let fakeRequest: PassThrough;

class MockedResponse extends Stream {
  constructor(
    private _code: number,
    private _msg?: string
  ) {
    super();
  }

  send(data: string) {
    this.emit('data', data);
    this.emit('end');
  }

  get statusCode() {
    return this._code;
  }

  get statusMessage() {
    return this._msg;
  }
}

describe('OTLPLogExporter', () => {
  let envSource: Record<string, any>;
  let collectorExporter: OTLPLogExporter;
  let collectorExporterConfig: OTLPExporterNodeConfigBase;
  let logs: ReadableLogRecord[];

  afterEach(() => {
    fakeRequest = new Stream.PassThrough();
    sinon.restore();
  });

  if (typeof process === 'undefined') {
    envSource = globalThis as unknown as Record<string, any>;
  } else {
    envSource = process.env as Record<string, any>;
  }

  describe('constructor', () => {
    it('should create an instance', () => {
      const exporter = new OTLPLogExporter();
      assert.ok(exporter instanceof OTLPLogExporter);
    });

    it('should use headers defined via env', () => {
      envSource.OTEL_EXPORTER_OTLP_LOGS_HEADERS = 'foo=bar';
      const exporter = new OTLPLogExporter();
      assert.strictEqual(exporter.headers.foo, 'bar');
      delete envSource.OTEL_EXPORTER_OTLP_LOGS_HEADERS;
    });

    it('should use timeout defined via env', () => {
      envSource.OTEL_EXPORTER_OTLP_LOGS_HEADERS = '';
      envSource.OTEL_EXPORTER_OTLP_LOGS_TIMEOUT = 30000;
      const exporter = new OTLPLogExporter();
      assert.strictEqual(exporter.timeoutMillis, 30000);
      delete envSource.OTEL_EXPORTER_OTLP_LOGS_HEADERS;
      delete envSource.OTEL_EXPORTER_OTLP_LOGS_TIMEOUT;
    });
  });

  describe('getDefaultUrl', () => {
    it('should call getDefaultUrl', () => {
      const getDefaultUrl = sinon.stub(Config, 'getDefaultUrl');
      const exporter = new OTLPLogExporter();
      exporter.getDefaultUrl({});
      // this callCount is 2, because new OTLPLogExporter also call it
      assert.strictEqual(getDefaultUrl.callCount, 2);
    });
  });

  describe('export', () => {
    beforeEach(() => {
      collectorExporterConfig = {
        headers: {
          foo: 'bar',
        },
        hostname: 'foo',
        url: 'http://foo.bar.com',
        keepAlive: true,
        httpAgentOptions: { keepAliveMsecs: 2000 },
      };
      collectorExporter = new OTLPLogExporter(collectorExporterConfig);
      logs = [];
      logs.push(Object.assign({}, mockedReadableLogRecord));
    });
    afterEach(() => {
      sinon.restore();
    });

    it('should open the connection', done => {
      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        assert.strictEqual(options.hostname, 'foo.bar.com');
        assert.strictEqual(options.method, 'POST');
        assert.strictEqual(options.path, '/');

        const mockRes = new MockedResponse(200);
        cb(mockRes);
        mockRes.send('success');
        done();
        return fakeRequest as any;
      });
      collectorExporter.export(logs, () => {});
    });

    it('should set custom headers', done => {
      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        assert.strictEqual(options.headers['foo'], 'bar');

        const mockRes = new MockedResponse(200);
        cb(mockRes);
        mockRes.send('success');
        done();
        return fakeRequest as any;
      });

      collectorExporter.export(logs, () => {});
    });

    it('should have keep alive and keepAliveMsecs option set', done => {
      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        assert.strictEqual(options.agent.keepAlive, true);
        assert.strictEqual(options.agent.options.keepAliveMsecs, 2000);

        const mockRes = new MockedResponse(200);
        cb(mockRes);
        mockRes.send('success');
        done();
        return fakeRequest as any;
      });

      collectorExporter.export(logs, () => {});
    });

    it('should successfully send the logs', done => {
      const fakeRequest = new Stream.PassThrough();
      sinon.stub(http, 'request').returns(fakeRequest as any);

      let buff = Buffer.from('');
      fakeRequest.on('end', () => {
        const responseBody = buff.toString();
        const json = JSON.parse(responseBody) as IExportLogsServiceRequest;
        const log1 = json.resourceLogs?.[0].scopeLogs?.[0].logRecords?.[0];
        assert.ok(typeof log1 !== 'undefined', "log doesn't exist");
        ensureExportedLogRecordIsCorrect(log1);

        ensureExportLogsServiceRequestIsSet(json);

        done();
      });

      fakeRequest.on('data', chunk => {
        buff = Buffer.concat([buff, chunk]);
      });

      const clock = sinon.useFakeTimers();
      collectorExporter.export(logs, () => {});
      clock.tick(200);
      clock.restore();
    });

    it('should log the successful message', done => {
      // Need to stub/spy on the underlying logger as the "diag" instance is global
      const spyLoggerError = sinon.stub(diag, 'error');

      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        const mockRes = new MockedResponse(200);
        cb(mockRes);
        mockRes.send('success');
        return fakeRequest as any;
      });

      collectorExporter.export(logs, result => {
        assert.strictEqual(result.code, ExportResultCode.SUCCESS);
        assert.strictEqual(spyLoggerError.args.length, 0);
        done();
      });
    });

    it('should log the error message', done => {
      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        const mockResError = new MockedResponse(400);
        cb(mockResError);
        mockResError.send('failed');

        return fakeRequest as any;
      });

      collectorExporter.export(logs, result => {
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        // @ts-expect-error verify error code
        assert.strictEqual(result.error.code, 400);
        done();
      });
    });
  });
});
