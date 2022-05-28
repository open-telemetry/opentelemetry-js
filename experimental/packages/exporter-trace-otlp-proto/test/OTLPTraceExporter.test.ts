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
import * as http from 'http';
import * as sinon from 'sinon';
import { Stream, PassThrough } from 'stream';
import * as zlib from 'zlib';
import { OTLPTraceExporter } from '../src';
import {
  ensureExportTraceServiceRequestIsSet,
  ensureProtoSpanIsCorrect,
  mockedReadableSpan,
  MockedResponse,
} from './traceHelper';
import { CompressionAlgorithm, OTLPExporterNodeConfigBase, OTLPExporterError } from '@opentelemetry/otlp-exporter-base';
import { getExportRequestProto } from '@opentelemetry/otlp-proto-exporter-base';
import { IExportTraceServiceRequest } from '@opentelemetry/otlp-transformer';

let fakeRequest: PassThrough;

describe('OTLPTraceExporter - node with proto over http', () => {
  let collectorExporter: OTLPTraceExporter;
  let collectorExporterConfig: OTLPExporterNodeConfigBase;
  let spans: ReadableSpan[];

  afterEach(() => {
    fakeRequest = new Stream.PassThrough();
    sinon.restore();
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
      collectorExporter = new OTLPTraceExporter(collectorExporterConfig);
      spans = [];
      spans.push(Object.assign({}, mockedReadableSpan));
    });
    afterEach(() => {
      sinon.restore();
    });

    it('should open the connection', done => {
      collectorExporter.export(spans, () => { });

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
    });

    it('should set custom headers', done => {
      collectorExporter.export(spans, () => { });

      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        assert.strictEqual(options.headers['foo'], 'bar');

        const mockRes = new MockedResponse(200);
        cb(mockRes);
        mockRes.send('success');
        done();
        return fakeRequest as any;
      });
    });

    it('should have keep alive and keepAliveMsecs option set', done => {
      collectorExporter.export(spans, () => { });

      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        assert.strictEqual(options.agent.keepAlive, true);
        assert.strictEqual(options.agent.options.keepAliveMsecs, 2000);

        const mockRes = new MockedResponse(200);
        cb(mockRes);
        mockRes.send('success');
        done();
        return fakeRequest as any;
      });
    });

    it('should successfully send the spans', done => {
      const fakeRequest = new Stream.PassThrough();
      sinon.stub(http, 'request').returns(fakeRequest as any);

      let buff = Buffer.from('');
      fakeRequest.on('end', () => {
        const ExportTraceServiceRequestProto = getExportRequestProto();
        const data = ExportTraceServiceRequestProto?.decode(buff);
        const json = data?.toJSON() as IExportTraceServiceRequest;
        const span1 = json.resourceSpans?.[0].scopeSpans?.[0].spans?.[0];
        assert.ok(typeof span1 !== 'undefined', "span doesn't exist");
        ensureProtoSpanIsCorrect(span1);

        ensureExportTraceServiceRequestIsSet(json);

        done();
      });

      fakeRequest.on('data', chunk => {
        buff = Buffer.concat([buff, chunk]);
      });

      const clock = sinon.useFakeTimers();
      collectorExporter.export(spans, () => { });
      clock.tick(200);
      clock.restore();
    });

    it('should log the successful message', done => {
      // Need to stub/spy on the underlying logger as the "diag" instance is global
      const spyLoggerError = sinon.stub(diag, 'error');

      collectorExporter.export(spans, result => {
        assert.strictEqual(result.code, ExportResultCode.SUCCESS);
        assert.strictEqual(spyLoggerError.args.length, 0);
        done();
      });

      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        const mockRes = new MockedResponse(200);
        cb(mockRes);
        mockRes.send('success');
        return fakeRequest as any;
      });
    });

    it('should log the error message', done => {
      collectorExporter.export(spans, result => {
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        // @ts-expect-error verify error code
        assert.strictEqual(result.error.code, 400);
        done();
      });

      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        const mockResError = new MockedResponse(400);
        cb(mockResError);
        mockResError.send('failed');

        return fakeRequest as any;
      });
    });
  });
  describe('export - with compression', () => {
    beforeEach(() => {
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
    afterEach(() => {
      sinon.restore();
    });

    it('should successfully send the spans', done => {
      const fakeRequest = new Stream.PassThrough();
      sinon.stub(http, 'request').returns(fakeRequest as any);
      const spySetHeader = sinon.spy();
      (fakeRequest as any).setHeader = spySetHeader;

      let buff = Buffer.from('');
      fakeRequest.on('end', () => {
        const unzippedBuff = zlib.gunzipSync(buff);
        const ExportTraceServiceRequestProto = getExportRequestProto();
        const data = ExportTraceServiceRequestProto?.decode(unzippedBuff);
        const json = data?.toJSON() as IExportTraceServiceRequest;
        const span1 = json.resourceSpans?.[0].scopeSpans?.[0].spans?.[0];
        assert.ok(typeof span1 !== 'undefined', "span doesn't exist");
        ensureProtoSpanIsCorrect(span1);

        ensureExportTraceServiceRequestIsSet(json);
        assert.ok(spySetHeader.calledWith('Content-Encoding', 'gzip'));

        done();
      });

      fakeRequest.on('data', chunk => {
        buff = Buffer.concat([buff, chunk]);
      });

      const clock = sinon.useFakeTimers();
      collectorExporter.export(spans, () => { });
      clock.tick(200);
      clock.restore();
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
    server.listen(8080, done);
  });
  after(done => {
    server.close(done);
  });
  it('should log the timeout request error message when timeout is 1', done => {
    collectorExporterConfig = {
      url: 'http://localhost:8080',
      timeoutMillis: 1,
    };
    collectorExporter = new OTLPTraceExporter(collectorExporterConfig);
    spans = [];
    spans.push(Object.assign({}, mockedReadableSpan));

    collectorExporter.export(spans, result => {
      assert.strictEqual(result.code, ExportResultCode.FAILED);
      const error = result.error as OTLPExporterError;
      assert.ok(error !== undefined);
      assert.strictEqual(error.message, 'Request Timeout');
      done();
    });
  });
  it('should log the timeout request error message when timeout is 100', done => {
    collectorExporterConfig = {
      url: 'http://localhost:8080',
      timeoutMillis: 100,
    };
    collectorExporter = new OTLPTraceExporter(collectorExporterConfig);
    spans = [];
    spans.push(Object.assign({}, mockedReadableSpan));

    collectorExporter.export(spans, result => {
      assert.strictEqual(result.code, ExportResultCode.FAILED);
      const error = result.error as OTLPExporterError;
      assert.ok(error !== undefined);
      assert.strictEqual(error.message, 'Request Timeout');
      done();
    });
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
    server.listen(8080, done);
  });
  after(done => {
    server.close(done);
  });
  it('should log the timeout request error message', done => {
    collectorExporterConfig = {
      url: 'http://localhost:8080',
      timeoutMillis: 300,
    };
    collectorExporter = new OTLPTraceExporter(collectorExporterConfig);
    spans = [];
    spans.push(Object.assign({}, mockedReadableSpan));

    collectorExporter.export(spans, result => {
      assert.strictEqual(result.code, ExportResultCode.FAILED);
      const error = result.error as OTLPExporterError;
      assert.ok(error !== undefined);
      assert.strictEqual(error.message, 'Request Timeout');
      done();
    });
  });
});
