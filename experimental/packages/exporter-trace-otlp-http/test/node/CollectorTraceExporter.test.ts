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
import {
  CompressionAlgorithm,
  OTLPExporterError,
  OTLPExporterNodeConfigBase
} from '@opentelemetry/otlp-exporter-base';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import * as http from 'http';
import * as sinon from 'sinon';
import { PassThrough, Stream } from 'stream';
import * as zlib from 'zlib';
import {
  OTLPTraceExporter
} from '../../src/platform/node';
import {
  ensureExportTraceServiceRequestIsSet,
  ensureSpanIsCorrect,
  mockedReadableSpan
} from '../traceHelper';
import { nextTick } from 'process';
import { MockedResponse } from './nodeHelpers';
import { IExportTraceServiceRequest } from '@opentelemetry/otlp-transformer';

let fakeRequest: PassThrough;

const address = 'localhost:1501';

describe('OTLPTraceExporter - node with json over http', () => {
  let collectorExporter: OTLPTraceExporter;
  let collectorExporterConfig: OTLPExporterNodeConfigBase;
  let stubRequest: sinon.SinonStub;
  let spySetHeader: sinon.SinonSpy;
  let spans: ReadableSpan[];

  afterEach(() => {
    fakeRequest = new Stream.PassThrough();
    sinon.restore();
  });

  describe('instance', () => {
    it('should warn about metadata when using json', () => {
      const metadata = 'foo';
      // Need to stub/spy on the underlying logger as the "diag" instance is global
      const warnStub = sinon.stub();
      const nop = () => {
      };
      const diagLogger: DiagLogger = {
        debug: nop,
        error: nop,
        info: nop,
        verbose: nop,
        warn: warnStub
      };
      diag.setLogger(diagLogger);

      collectorExporter = new OTLPTraceExporter({
        metadata,
        url: address,
      } as any);
      const args = warnStub.args[0];
      assert.strictEqual(args[0], 'Metadata cannot be set when using http');
    });
  });

  describe('when configuring via environment', () => {
    const envSource = process.env;
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
      const collectorExporter = new OTLPTraceExporter();
      assert.strictEqual(collectorExporter.headers.foo, 'bar');
      envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
    });
    it('should override global headers config with signal headers defined via env', () => {
      envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar,bar=foo';
      envSource.OTEL_EXPORTER_OTLP_TRACES_HEADERS = 'foo=boo';
      const collectorExporter = new OTLPTraceExporter();
      assert.strictEqual(collectorExporter.headers.foo, 'boo');
      assert.strictEqual(collectorExporter.headers.bar, 'foo');
      envSource.OTEL_EXPORTER_OTLP_TRACES_HEADERS = '';
      envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
    });
    it('should use compression defined via env', () => {
      envSource.OTEL_EXPORTER_OTLP_COMPRESSION = 'gzip';
      const collectorExporter = new OTLPTraceExporter();
      assert.strictEqual(collectorExporter.compression, 'gzip');
      envSource.OTEL_EXPORTER_OTLP_COMPRESSION = '';
    });
    it('should override global compression config with signal compression defined via env', () => {
      envSource.OTEL_EXPORTER_OTLP_COMPRESSION = 'foo';
      envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION = 'gzip';
      const collectorExporter = new OTLPTraceExporter();
      assert.strictEqual(collectorExporter.compression, 'gzip');
      envSource.OTEL_EXPORTER_OTLP_COMPRESSION = '';
      envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION = '';
    });
  });

  describe('export', () => {
    beforeEach(() => {
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
      collectorExporter = new OTLPTraceExporter(collectorExporterConfig);
      spans = [];
      spans.push(Object.assign({}, mockedReadableSpan));
    });

    it('should open the connection', done => {
      collectorExporter.export(spans, () => { });

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
      collectorExporter.export(spans, () => { });

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

    it('should not have Content-Encoding header', done => {
      collectorExporter.export(spans, () => { });

      setTimeout(() => {
        const mockRes = new MockedResponse(200);
        const args = stubRequest.args[0];
        const callback = args[1];
        callback(mockRes);
        mockRes.send('success');

        const options = args[0];
        assert.strictEqual(options.headers['Content-Encoding'], undefined);
        done();
      });
    });

    it('should have keep alive and keepAliveMsecs option set', done => {
      collectorExporter.export(spans, () => { });

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

    it('different http export requests should use the same agent', done => {
      const clock = sinon.useFakeTimers();
      collectorExporter.export(spans, () => { });

      const mockRes = new MockedResponse(200);
      const args = stubRequest.args[0];
      const callback = args[1];

      callback(mockRes);
      mockRes.send('success');
      clock.restore();

      nextTick(() => {
        const clock = sinon.useFakeTimers();
        collectorExporter.export(spans, () => { });

        const mockRes2 = new MockedResponse(200);
        const args2 = stubRequest.args[1];
        const callback2 = args2[1];

        callback2(mockRes);
        mockRes2.send('success');

        const [firstExportAgent, secondExportAgent] = stubRequest.args.map(
          a => a[0].agent
        );

        assert.strictEqual(firstExportAgent, secondExportAgent);
        clock.restore();
        done();
      });
    });

    it('should successfully send the spans', done => {
      let buff = Buffer.from('');

      fakeRequest.on('end', () => {
        const responseBody = buff.toString();

        const json = JSON.parse(responseBody) as IExportTraceServiceRequest;
        const span1 = json.resourceSpans?.[0].scopeSpans?.[0].spans?.[0];
        assert.ok(typeof span1 !== 'undefined', "span doesn't exist");
        ensureSpanIsCorrect(span1);

        ensureExportTraceServiceRequestIsSet(json);

        done();
      });

      fakeRequest.on('data', chunk => {
        buff = Buffer.concat([buff, chunk]);
      });

      collectorExporter.export(spans, () => { });

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
      collectorExporter.export(spans, responseSpy);

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
      const responseSpy = sinon.spy();
      collectorExporter.export(spans, responseSpy);

      setTimeout(() => {
        const mockResError = new MockedResponse(400);
        const args = stubRequest.args[0];
        const callback = args[1];
        callback(mockResError);
        mockResError.send('failed');

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

  describe('export - with compression', () => {
    beforeEach(() => {
      stubRequest = sinon.stub(http, 'request').returns(fakeRequest as any);
      spySetHeader = sinon.spy();
      (fakeRequest as any).setHeader = spySetHeader;
      collectorExporterConfig = {
        headers: {
          foo: 'bar',
        },
        hostname: 'foo',
        url: 'http://foo.bar.com',
        keepAlive: true,
        compression: CompressionAlgorithm.GZIP,
        httpAgentOptions: { keepAliveMsecs: 2000 },
      };
      collectorExporter = new OTLPTraceExporter(collectorExporterConfig);
      spans = [];
      spans.push(Object.assign({}, mockedReadableSpan));
    });

    it('should successfully send the spans', done => {
      let buff = Buffer.from('');

      fakeRequest.on('end', () => {
        const responseBody = zlib.gunzipSync(buff).toString();

        const json = JSON.parse(responseBody) as IExportTraceServiceRequest;
        const span1 = json.resourceSpans?.[0].scopeSpans?.[0].spans?.[0];
        assert.ok(typeof span1 !== 'undefined', "span doesn't exist");
        ensureSpanIsCorrect(span1);

        ensureExportTraceServiceRequestIsSet(json);
        assert.ok(spySetHeader.calledWith('Content-Encoding', 'gzip'));
        done();
      });

      fakeRequest.on('data', chunk => {
        buff = Buffer.concat([buff, chunk]);
      });

      collectorExporter.export(spans,() => { });

      const mockRes = new MockedResponse(200);
      const args = stubRequest.args[0];
      const callback = args[1];

      callback(mockRes);
      mockRes.send('success');
    });
  });

  describe('OTLPTraceExporter - node (getDefaultUrl)', () => {
    it('should default to localhost', done => {
      const collectorExporter = new OTLPTraceExporter();
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
  describe('export - with timeout', () => {
    beforeEach(() => {
      fakeRequest = new Stream.PassThrough();
      stubRequest = sinon.stub(http, 'request').returns(fakeRequest as any);
      spySetHeader = sinon.spy();
      (fakeRequest as any).setHeader = spySetHeader;
      (fakeRequest as any).abort = sinon.spy();
      collectorExporterConfig = {
        headers: {
          foo: 'bar',
        },
        hostname: 'foo',
        url: 'http://foo.bar.com',
        keepAlive: true,
        httpAgentOptions: { keepAliveMsecs: 2000 },
        timeoutMillis: 100,
      };
      collectorExporter = new OTLPTraceExporter(collectorExporterConfig);
      spans = [];
      spans.push(Object.assign({}, mockedReadableSpan));
    });
    it('should log the timeout request error message', done => {
      const responseSpy = sinon.spy();
      collectorExporter.export(spans, responseSpy);

      setTimeout(() => {
        fakeRequest.emit('error', { code: 'ECONNRESET'});

        setTimeout(() => {
          const result = responseSpy.args[0][0] as core.ExportResult;
          assert.strictEqual(result.code, core.ExportResultCode.FAILED);
          const error = result.error as OTLPExporterError;
          assert.ok(error !== undefined);
          assert.strictEqual(error.message, 'Request Timeout');

          done();
        });
      }, 300);
    });
  });
});

describe('export - real http request destroyed before response received', () => {
  let collectorExporter: OTLPTraceExporter;
  let collectorExporterConfig: OTLPExporterNodeConfigBase;
  let spans: ReadableSpan[];

  const server = http.createServer((_, res) => {
    setTimeout(() => {
      res.statusCode = 200;
      res.end();
    }, 200);
  });
  before(done => {
    server.listen(8081, done);
  });
  after(done => {
    server.close(done);
  });
  it('should log the timeout request error message when timeout is 1', done => {
    collectorExporterConfig = {
      url: 'http://localhost:8081',
      timeoutMillis: 1,
    };
    collectorExporter = new OTLPTraceExporter(collectorExporterConfig);
    spans = [];
    spans.push(Object.assign({}, mockedReadableSpan));

    setTimeout(() => {
      collectorExporter.export(spans, result => {
        assert.strictEqual(result.code, core.ExportResultCode.FAILED);
        const error = result.error as OTLPExporterError;
        assert.ok(error !== undefined);
        assert.strictEqual(error.message, 'Request Timeout');
        done();
      });
    }, 0);
  });
  it('should log the timeout request error message when timeout is 100', done => {
    collectorExporterConfig = {
      url: 'http://localhost:8081',
      timeoutMillis: 100,
    };
    collectorExporter = new OTLPTraceExporter(collectorExporterConfig);
    spans = [];
    spans.push(Object.assign({}, mockedReadableSpan));

    setTimeout(() => {
      collectorExporter.export(spans, result => {
        assert.strictEqual(result.code, core.ExportResultCode.FAILED);
        const error = result.error as OTLPExporterError;
        assert.ok(error !== undefined);
        assert.strictEqual(error.message, 'Request Timeout');
        done();
      });
    }, 0);
  });
});

describe('export - real http request destroyed after response received', () => {
  let collectorExporter: OTLPTraceExporter;
  let collectorExporterConfig: OTLPExporterNodeConfigBase;
  let spans: ReadableSpan[];

  const server = http.createServer((_, res) => {
    res.write('writing something');
  });
  before(done => {
    server.listen(8081, done);
  });
  after(done => {
    server.close(done);
  });
  it('should log the timeout request error message', done => {
    collectorExporterConfig = {
      url: 'http://localhost:8081',
      timeoutMillis: 300,
    };
    collectorExporter = new OTLPTraceExporter(collectorExporterConfig);
    spans = [];
    spans.push(Object.assign({}, mockedReadableSpan));

    setTimeout(() => {
      collectorExporter.export(spans, result => {
        assert.strictEqual(result.code, core.ExportResultCode.FAILED);
        const error = result.error as OTLPExporterError;
        assert.ok(error !== undefined);
        assert.strictEqual(error.message, 'Request Timeout');
        done();
      });
    }, 0);
  });
});
