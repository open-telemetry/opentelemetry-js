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

import * as protoLoader from '@grpc/proto-loader';
import { diag } from '@opentelemetry/api';
import {
  BasicTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

import * as assert from 'assert';
import * as fs from 'fs';
import * as grpc from '@grpc/grpc-js';
import * as path from 'path';
import * as sinon from 'sinon';
import { OTLPTraceExporter } from '../src';

import {
  ensureExportedSpanIsCorrect,
  ensureMetadataIsCorrect,
  ensureResourceIsCorrect,
  mockedReadableSpan,
} from './traceHelper';
import * as core from '@opentelemetry/core';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import { GrpcCompressionAlgorithm } from '@opentelemetry/otlp-grpc-exporter-base';
import { IExportTraceServiceRequest, IResourceSpans } from '@opentelemetry/otlp-transformer';

const traceServiceProtoPath =
  'opentelemetry/proto/collector/trace/v1/trace_service.proto';
const includeDirs = [path.resolve(__dirname, '../../otlp-grpc-exporter-base/protos')];

const address = 'localhost:1501';

type TestParams = {
  useTLS?: boolean;
  metadata?: grpc.Metadata;
};

const metadata = new grpc.Metadata();
metadata.set('k', 'v');

const testCollectorExporter = (params: TestParams) =>
  describe(`OTLPTraceExporter - node ${
    params.useTLS ? 'with' : 'without'
  } TLS, ${params.metadata ? 'with' : 'without'} metadata`, () => {
    let collectorExporter: OTLPTraceExporter;
    let server: grpc.Server;
    let exportedData:
      | IResourceSpans
      | undefined;
    let reqMetadata: grpc.Metadata | undefined;

    before(done => {
      server = new grpc.Server();
      protoLoader
        .load(traceServiceProtoPath, {
          keepCase: false,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
          includeDirs,
        })
        .then((packageDefinition: protoLoader.PackageDefinition) => {
          const packageObject: any = grpc.loadPackageDefinition(
            packageDefinition
          );
          server.addService(
            packageObject.opentelemetry.proto.collector.trace.v1.TraceService
              .service,
            {
              Export: (data: {
                request: IExportTraceServiceRequest;
                metadata: grpc.Metadata;
              }) => {
                if (data.request.resourceSpans != null) {
                  exportedData = data.request.resourceSpans[0];
                }
                reqMetadata = data.metadata;
              },
            }
          );
          const credentials = params.useTLS
            ? grpc.ServerCredentials.createSsl(
              fs.readFileSync('./test/certs/ca.crt'),
              [
                {
                  cert_chain: fs.readFileSync('./test/certs/server.crt'),
                  private_key: fs.readFileSync('./test/certs/server.key'),
                },
              ]
            )
            : grpc.ServerCredentials.createInsecure();
          server.bindAsync(address, credentials, () => {
            server.start();
            done();
          });
        });
    });

    after(() => {
      server.forceShutdown();
    });

    beforeEach(done => {
      const credentials = params.useTLS
        ? grpc.credentials.createSsl(
          fs.readFileSync('./test/certs/ca.crt'),
          fs.readFileSync('./test/certs/client.key'),
          fs.readFileSync('./test/certs/client.crt')
        )
        : grpc.credentials.createInsecure();
      collectorExporter = new OTLPTraceExporter({
        url: 'https://' + address,
        credentials,
        metadata: params.metadata,
      });

      const provider = new BasicTracerProvider();
      provider.addSpanProcessor(new SimpleSpanProcessor(collectorExporter));
      done();
    });

    afterEach(() => {
      exportedData = undefined;
      reqMetadata = undefined;
      sinon.restore();
    });

    describe('instance', () => {
      it('should warn about headers when using grpc', () => {
        // Need to stub/spy on the underlying logger as the 'diag' instance is global
        const spyLoggerWarn = sinon.stub(diag, 'warn');
        collectorExporter = new OTLPTraceExporter({
          url: `http://${address}`,
          headers: {
            foo: 'bar',
          },
        });
        const args = spyLoggerWarn.args[0];
        assert.strictEqual(args[0], 'Headers cannot be set when using grpc');
      });
      it('should warn about path in url', () => {
        const spyLoggerWarn = sinon.stub(diag, 'warn');
        collectorExporter = new OTLPTraceExporter({
          url: `http://${address}/v1/trace`,
        });
        const args = spyLoggerWarn.args[0];
        assert.strictEqual(
          args[0],
          'URL path should not be set when using grpc, the path part of the URL will be ignored.'
        );
      });
    });

    describe('export', () => {
      it('should export spans', done => {
        const responseSpy = sinon.spy();
        const spans = [Object.assign({}, mockedReadableSpan)];
        collectorExporter.export(spans, responseSpy);
        setTimeout(() => {
          assert.ok(
            typeof exportedData !== 'undefined',
            'resource' + " doesn't exist"
          );

          const spans = exportedData.scopeSpans[0].spans;
          const resource = exportedData.resource;

          assert.ok(
            typeof spans !== 'undefined',
            'spans do not exist'
          );

          ensureExportedSpanIsCorrect(spans[0]);

          assert.ok(
            typeof resource !== 'undefined',
            "resource doesn't exist"
          );

          ensureResourceIsCorrect(resource);

          ensureMetadataIsCorrect(reqMetadata, params?.metadata);

          done();
        }, 500);
      });
      it('should log deadline exceeded error', done => {
        const credentials = params.useTLS
          ? grpc.credentials.createSsl(
            fs.readFileSync('./test/certs/ca.crt'),
            fs.readFileSync('./test/certs/client.key'),
            fs.readFileSync('./test/certs/client.crt')
          )
          : grpc.credentials.createInsecure();

        const collectorExporterWithTimeout = new OTLPTraceExporter({
          url: 'grpcs://' + address,
          credentials,
          metadata: params.metadata,
          timeoutMillis: 100,
        });

        const responseSpy = sinon.spy();
        const spans = [Object.assign({}, mockedReadableSpan)];
        collectorExporterWithTimeout.export(spans, responseSpy);

        setTimeout(() => {
          const result = responseSpy.args[0][0] as core.ExportResult;
          assert.strictEqual(result.code, core.ExportResultCode.FAILED);
          assert.strictEqual(responseSpy.args[0][0].error.details, 'Deadline exceeded');
          done();
        }, 300);
      });
    });
    describe('export - with gzip compression', () => {
      beforeEach(() => {
        const credentials = params.useTLS
          ? grpc.credentials.createSsl(
            fs.readFileSync('./test/certs/ca.crt'),
            fs.readFileSync('./test/certs/client.key'),
            fs.readFileSync('./test/certs/client.crt')
          )
          : grpc.credentials.createInsecure();
        collectorExporter = new OTLPTraceExporter({
          url: 'https://' + address,
          credentials,
          metadata: params.metadata,
          compression: CompressionAlgorithm.GZIP,
        });

        const provider = new BasicTracerProvider();
        provider.addSpanProcessor(new SimpleSpanProcessor(collectorExporter));
      });
      it('should successfully send the spans', done => {
        const responseSpy = sinon.spy();
        const spans = [Object.assign({}, mockedReadableSpan)];
        collectorExporter.export(spans, responseSpy);
        setTimeout(() => {
          assert.ok(
            typeof exportedData !== 'undefined',
            'resource' + " doesn't exist"
          );
          const spans = exportedData.scopeSpans[0].spans;
          const resource = exportedData.resource;

          assert.ok(
            typeof spans !== 'undefined',
            'spans do not exist'
          );
          ensureExportedSpanIsCorrect(spans[0]);

          assert.ok(
            typeof resource !== 'undefined',
            "resource doesn't exist"
          );
          ensureResourceIsCorrect(resource);

          ensureMetadataIsCorrect(reqMetadata, params.metadata);

          done();
        }, 500);
      });
    });
    describe('Trace Exporter with compression', () => {
      const envSource = process.env;
      it('should return gzip compression algorithm on exporter', () => {
        const credentials = params.useTLS
          ? grpc.credentials.createSsl(
            fs.readFileSync('./test/certs/ca.crt'),
            fs.readFileSync('./test/certs/client.key'),
            fs.readFileSync('./test/certs/client.crt')
          )
          : grpc.credentials.createInsecure();

        envSource.OTEL_EXPORTER_OTLP_COMPRESSION = 'gzip';
        collectorExporter = new OTLPTraceExporter({
          url: 'https://' + address,
          credentials,
          metadata: params.metadata,
        });
        assert.strictEqual(collectorExporter.compression, GrpcCompressionAlgorithm.GZIP);
        delete envSource.OTEL_EXPORTER_OTLP_COMPRESSION;
      });
    });
  });

describe('OTLPTraceExporter - node (getDefaultUrl)', () => {
  it('should default to localhost', done => {
    const collectorExporter = new OTLPTraceExporter({});
    setTimeout(() => {
      assert.strictEqual(collectorExporter['url'], 'localhost:4317');
      done();
    });
  });
  it('should keep the URL if included', done => {
    const url = 'http://foo.bar.com';
    const collectorExporter = new OTLPTraceExporter({ url });
    setTimeout(() => {
      assert.strictEqual(collectorExporter['url'], 'foo.bar.com');
      done();
    });
  });
});

describe('when configuring via environment', () => {
  const envSource = process.env;
  it('should use url defined in env', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar';
    const collectorExporter = new OTLPTraceExporter();
    assert.strictEqual(
      collectorExporter.url,
      'foo.bar'
    );
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
  });
  it('should override global exporter url with signal url defined in env', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar';
    envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = 'http://foo.traces';
    const collectorExporter = new OTLPTraceExporter();
    assert.strictEqual(
      collectorExporter.url,
      'foo.traces'
    );
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    envSource.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '';
  });
  it('should use headers defined via env', () => {
    envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar';
    const collectorExporter = new OTLPTraceExporter();
    assert.deepStrictEqual(collectorExporter.metadata?.get('foo'), ['bar']);
    envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
  });
  it('should override global headers config with signal headers defined via env', () => {
    const metadata = new grpc.Metadata();
    metadata.set('foo', 'bar');
    metadata.set('goo', 'lol');
    envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=jar,bar=foo';
    envSource.OTEL_EXPORTER_OTLP_TRACES_HEADERS = 'foo=boo';
    const collectorExporter = new OTLPTraceExporter({ metadata });
    assert.deepStrictEqual(collectorExporter.metadata?.get('foo'), ['boo']);
    assert.deepStrictEqual(collectorExporter.metadata?.get('bar'), ['foo']);
    assert.deepStrictEqual(collectorExporter.metadata?.get('goo'), ['lol']);
    envSource.OTEL_EXPORTER_OTLP_TRACES_HEADERS = '';
    envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
  });
});

testCollectorExporter({ useTLS: true });
testCollectorExporter({ useTLS: false });
testCollectorExporter({ metadata });
