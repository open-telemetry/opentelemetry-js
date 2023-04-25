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

import { diag, DiagLogger } from '@opentelemetry/api';
import * as core from '@opentelemetry/core';
import * as assert from 'assert';
import * as http from 'http';
import * as sinon from 'sinon';
import { OTLPLogsExporterOptions } from '../../src';

import { OTLPLogsExporter } from '../../src/platform/node';
import { collect, setUp, shutdown } from '../logsHelper';
import { MockedResponse } from './nodeHelpers';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { PassThrough, Stream } from 'stream';
import {
  OTLPExporterError,
  OTLPExporterNodeConfigBase,
} from '@opentelemetry/otlp-exporter-base';
import { IExportLogsServiceRequest } from '@opentelemetry/otlp-transformer';

let fakeRequest: PassThrough;

const address = 'localhost:1501';

describe('OTLPLogsExporter - node with json over http', () => {
  let collectorExporter: OTLPLogsExporter;
  let collectorExporterConfig: OTLPExporterNodeConfigBase &
    OTLPLogsExporterOptions;
  let stubRequest: sinon.SinonStub;
  let logs: ReadableLogRecord[];

  beforeEach(() => {
    setUp();
  });

  afterEach(async () => {
    fakeRequest = new Stream.PassThrough();
    await shutdown();
    sinon.restore();
  });

  describe('instance', () => {
    let warnStub: sinon.SinonStub;

    beforeEach(() => {
      // Need to stub/spy on the underlying logger as the "diag" instance is global
      warnStub = sinon.stub();
      const nop = () => {};
      const diagLogger: DiagLogger = {
        debug: nop,
        error: nop,
        info: nop,
        verbose: nop,
        warn: warnStub,
      };
      diag.setLogger(diagLogger);
    });

    afterEach(() => {
      diag.disable();
    });

    it('should warn about metadata when using json', () => {
      const metadata = 'foo';
      collectorExporter = new OTLPLogsExporter({
        url: address,
        metadata,
      } as any);
      const args = warnStub.args[0];
      assert.strictEqual(args[0], 'Metadata cannot be set when using http');
    });
  });

  describe('when configuring via environment', () => {
    const envSource = process.env;
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
      envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://foo.logs/';
      const collectorExporter = new OTLPLogsExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT
      );
      envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
      envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = '';
    });
    it('should add root path when signal url defined in env contains no path and no root path', () => {
      envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://foo.bar';
      const collectorExporter = new OTLPLogsExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        `${envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT}/`
      );
      envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = '';
    });
    it('should not add root path when signal url defined in env contains root path but no path', () => {
      envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://foo.bar/';
      const collectorExporter = new OTLPLogsExporter();
      assert.strictEqual(
        collectorExporter._otlpExporter.url,
        `${envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT}`
      );
      envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = '';
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
        `${envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT}`
      );
      envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = '';
    });
    it('should use headers defined via env', () => {
      envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar';
      const collectorExporter = new OTLPLogsExporter();
      assert.strictEqual(collectorExporter._otlpExporter.headers.foo, 'bar');
      envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
    });
    it('should override global headers config with signal headers defined via env', () => {
      envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar,bar=foo';
      envSource.OTEL_EXPORTER_OTLP_LOGS_HEADERS = 'foo=boo';
      const collectorExporter = new OTLPLogsExporter();
      assert.strictEqual(collectorExporter._otlpExporter.headers.foo, 'boo');
      assert.strictEqual(collectorExporter._otlpExporter.headers.bar, 'foo');
      envSource.OTEL_EXPORTER_OTLP_LOGS_HEADERS = '';
      envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
    });
  });

  describe('export', () => {
    beforeEach(async () => {
      stubRequest = sinon.stub(http, 'request').returns(fakeRequest as any);
      collectorExporterConfig = {
        headers: {
          foo: 'bar',
        },
        hostname: 'foo',
        url: 'http://foo.bar.com',
        keepAlive: true,
        httpAgentOptions: { keepAliveMsecs: 2000 },
      };

      collectorExporter = new OTLPLogsExporter(collectorExporterConfig);

      const { resourceMetrics, errors } = await collect();
      assert.strictEqual(errors.length, 0);
      logs = resourceMetrics;
    });

    it('should open the connection', done => {
      collectorExporter.export(logs, () => {});

      setTimeout(() => {
        const mockRes = new MockedResponse(200);
        const args = stubRequest.args[0];
        const callback = args[1];
        callback(mockRes);
        mockRes.send('success');
        const options = args[0];

        assert.strictEqual(options.hostname, 'foo.bar.com');
        assert.strictEqual(options.method, 'POST');
        assert.strictEqual(options.path, '/');
        done();
      });
    });

    it('should set custom headers', done => {
      collectorExporter.export(logs, () => {});

      setTimeout(() => {
        const mockRes = new MockedResponse(200);
        const args = stubRequest.args[0];
        const callback = args[1];
        callback(mockRes);
        mockRes.send('success');
        const options = args[0];
        assert.strictEqual(options.headers['foo'], 'bar');
        done();
      });
    });

    it('should have keep alive and keepAliveMsecs option set', done => {
      collectorExporter.export(logs, () => {});

      setTimeout(() => {
        const mockRes = new MockedResponse(200);
        const args = stubRequest.args[0];
        const callback = args[1];
        callback(mockRes);
        mockRes.send('success');
        const options = args[0];
        const agent = options.agent;
        assert.strictEqual(agent.keepAlive, true);
        assert.strictEqual(agent.options.keepAliveMsecs, 2000);
        done();
      });
    });

    it('should successfully send logs', done => {
      let buff = Buffer.from('');

      collectorExporter.export(logs, () => {});

      fakeRequest.on('end', () => {
        const responseBody = buff.toString();

        const json = JSON.parse(responseBody) as IExportLogsServiceRequest;
        // The order of the logs is not guaranteed.

        done();
      });

      fakeRequest.on('data', chunk => {
        buff = Buffer.concat([buff, chunk]);
      });

      const mockRes = new MockedResponse(200);
      const args = stubRequest.args[0];
      const callback = args[1];

      callback(mockRes);
      mockRes.send('success');
    });

    it('should log the successful message', done => {
      // Need to stub/spy on the underlying logger as the "diag" instance is global
      const stubLoggerError = sinon.stub(diag, 'error');

      const responseSpy = sinon.spy();
      collectorExporter.export(logs, responseSpy);

      setTimeout(() => {
        const mockRes = new MockedResponse(200);
        const args = stubRequest.args[0];
        const callback = args[1];
        callback(mockRes);
        mockRes.send('success');
        setTimeout(() => {
          assert.strictEqual(stubLoggerError.args.length, 0);
          assert.strictEqual(
            responseSpy.args[0][0].code,
            core.ExportResultCode.SUCCESS
          );
          done();
        });
      });
    });

    it('should log the error message', done => {
      const handler = core.loggingErrorHandler();
      core.setGlobalErrorHandler(handler);

      const responseSpy = sinon.spy();
      collectorExporter.export(logs, responseSpy);

      setTimeout(() => {
        const mockRes = new MockedResponse(400);
        const args = stubRequest.args[0];
        const callback = args[1];
        callback(mockRes);
        mockRes.send('failed');
        setTimeout(() => {
          const result = responseSpy.args[0][0] as core.ExportResult;
          assert.strictEqual(result.code, core.ExportResultCode.FAILED);
          const error = result.error as OTLPExporterError;
          assert.ok(error !== undefined);
          assert.strictEqual(error.code, 400);
          assert.strictEqual(error.data, 'failed');
          done();
        });
      });
    });
  });
  describe('OTLPLogsExporter - node (getDefaultUrl)', () => {
    it('should default to localhost', done => {
      const collectorExporter = new OTLPLogsExporter();
      setTimeout(() => {
        assert.strictEqual(
          collectorExporter._otlpExporter.url,
          'http://localhost:4317/v1/logs'
        );
        done();
      });
    });

    it('should keep the URL if included', done => {
      const url = 'http://foo.bar.com';
      const collectorExporter = new OTLPLogsExporter({
        url,
      });
      setTimeout(() => {
        assert.strictEqual(collectorExporter._otlpExporter.url, url);
        done();
      });
    });
  });
});
