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
import { OTLPTraceExporter } from '../../src';
import {
  ensureExportTraceServiceRequestIsSet,
  ensureProtoSpanIsCorrect,
  mockedReadableSpan,
  MockedResponse,
} from '../traceHelper';
import {
  CompressionAlgorithm,
  OTLPExporterNodeConfigBase,
  OTLPExporterError,
} from '@opentelemetry/otlp-exporter-base';
import { IExportTraceServiceRequest } from '@opentelemetry/otlp-transformer';
import { Root } from 'protobufjs';
import { VERSION } from '../../src/version';
import * as path from 'path';

const dir = path.resolve(__dirname, '../../../otlp-transformer/protos');
const root = new Root();
root.resolvePath = function (origin, target) {
  return `${dir}/${target}`;
};
const proto = root.loadSync([
  'opentelemetry/proto/common/v1/common.proto',
  'opentelemetry/proto/resource/v1/resource.proto',
  'opentelemetry/proto/trace/v1/trace.proto',
  'opentelemetry/proto/collector/trace/v1/trace_service.proto',
]);
const exportRequestServiceProto = proto?.lookupType(
  'ExportTraceServiceRequest'
);

let fakeRequest: PassThrough;

describe('OTLPTraceExporter - node with proto over http', () => {
  let collectorExporter: OTLPTraceExporter;
  let collectorExporterConfig: OTLPExporterNodeConfigBase;
  let spans: ReadableSpan[];

  afterEach(() => {
    fakeRequest = new Stream.PassThrough();
    Object.defineProperty(fakeRequest, 'setTimeout', {
      value: function (_timeout: number) {},
    });
    sinon.restore();
  });

  describe('default behavior for headers', () => {
    const exporter = new OTLPTraceExporter();
    it('should include user agent in header', () => {
      assert.strictEqual(
        exporter['_transport']['_transport']['_parameters']['headers'][
          'User-Agent'
        ],
        `OTel-OTLP-Exporter-JavaScript/${VERSION}`
      );
    });
  });

  describe('export', () => {
    beforeEach(() => {
      collectorExporterConfig = {
        headers: {
          foo: 'bar',
        },
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
      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        try {
          assert.strictEqual(options.hostname, 'foo.bar.com');
          assert.strictEqual(options.method, 'POST');
          assert.strictEqual(options.path, '/');
        } catch (e) {
          done(e);
        }

        queueMicrotask(() => {
          const mockRes = new MockedResponse(200);
          cb(mockRes);
          mockRes.send(Buffer.from('success'));
          done();
        });
        return fakeRequest as any;
      });

      collectorExporter.export(spans, () => {});
    });

    it('should set custom headers', done => {
      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        assert.strictEqual(options.headers['foo'], 'bar');

        queueMicrotask(() => {
          const mockRes = new MockedResponse(200);
          cb(mockRes);
          mockRes.send(Buffer.from('success'));
          done();
        });

        return fakeRequest as any;
      });

      collectorExporter.export(spans, () => {});
    });

    it('should have keep alive and keepAliveMsecs option set', done => {
      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        assert.strictEqual(options.agent.keepAlive, true);
        assert.strictEqual(options.agent.options.keepAliveMsecs, 2000);

        queueMicrotask(() => {
          const mockRes = new MockedResponse(200);
          cb(mockRes);
          mockRes.send(Buffer.from('success'));
          done();
        });

        return fakeRequest as any;
      });

      collectorExporter.export(spans, () => {});
    });

    it('should successfully send the spans', done => {
      const fakeRequest = new Stream.PassThrough();
      Object.defineProperty(fakeRequest, 'setTimeout', {
        value: function (_timeout: number) {},
      });
      sinon.stub(http, 'request').returns(fakeRequest as any);

      let buff = Buffer.from('');
      fakeRequest.on('finish', () => {
        const data = exportRequestServiceProto.decode(buff);
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
      collectorExporter.export(spans, () => {});
      clock.tick(200);
      clock.restore();
    });

    it('should log the successful message', done => {
      // Need to stub/spy on the underlying logger as the "diag" instance is global
      const spyLoggerError = sinon.stub(diag, 'error');

      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        queueMicrotask(() => {
          const mockRes = new MockedResponse(200);
          cb(mockRes);
          mockRes.send(Buffer.from('success'));
        });

        return fakeRequest as any;
      });

      collectorExporter.export(spans, result => {
        try {
          assert.strictEqual(result.code, ExportResultCode.SUCCESS);
          assert.strictEqual(spyLoggerError.args.length, 0);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('should log the error message', done => {
      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        queueMicrotask(() => {
          const mockRes = new MockedResponse(400);
          cb(mockRes);
          mockRes.send(Buffer.from('failure'));
        });

        return fakeRequest as any;
      });

      collectorExporter.export(spans, result => {
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        // @ts-expect-error verify error code
        assert.strictEqual(result.error.code, 400);
        done();
      });
    });
  });
  describe('export - with compression', () => {
    beforeEach(() => {
      collectorExporterConfig = {
        headers: {
          foo: 'bar',
        },
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
      Object.defineProperty(fakeRequest, 'setTimeout', {
        value: function (_timeout: number) {},
      });
      sinon.stub(http, 'request').returns(fakeRequest as any);
      const spySetHeader = sinon.spy();
      (fakeRequest as any).setHeader = spySetHeader;

      let buff = Buffer.from('');
      fakeRequest.on('finish', () => {
        const unzippedBuff = zlib.gunzipSync(buff);
        const data = exportRequestServiceProto.decode(unzippedBuff);
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
      collectorExporter.export(spans, () => {});
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
    }, 1000);
  });
  before(done => {
    server.listen(8080, done);
  });
  after(done => {
    server.close(done);
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
