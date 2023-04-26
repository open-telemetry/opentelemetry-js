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

import * as assert from 'assert';
import * as fs from 'fs';
import * as grpc from '@grpc/grpc-js';
import * as path from 'path';
import * as sinon from 'sinon';
import { OTLPLogsExporter } from '../src';

import {
  ensureExportedLogRecordIsCorrect,
  ensureMetadataIsCorrect,
  ensureResourceIsCorrect,
  mockedReadableLogRecord,
} from './logsHelper';
import * as core from '@opentelemetry/core';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import { GrpcCompressionAlgorithm } from '@opentelemetry/otlp-grpc-exporter-base';
import {
  IExportLogsServiceRequest,
  IResourceLogs,
} from '@opentelemetry/otlp-transformer';

const logsServiceProtoPath =
  'opentelemetry/proto/collector/logs/v1/logs_service.proto';
const includeDirs = [
  path.resolve(__dirname, '../../otlp-grpc-exporter-base/protos'),
];

const address = 'localhost:1501';

type TestParams = {
  useTLS?: boolean;
  metadata?: grpc.Metadata;
};

const metadata = new grpc.Metadata();
metadata.set('k', 'v');

const testCollectorExporter = (params: TestParams) =>
  describe(`OTLPLogsExporter - node ${
    params.useTLS ? 'with' : 'without'
  } TLS, ${params.metadata ? 'with' : 'without'} metadata`, () => {
    let collectorExporter: OTLPLogsExporter;
    let server: grpc.Server;
    let exportedData: IResourceLogs | undefined;
    let reqMetadata: grpc.Metadata | undefined;

    before(done => {
      server = new grpc.Server();
      protoLoader
        .load(logsServiceProtoPath, {
          keepCase: false,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
          includeDirs,
        })
        .then((packageDefinition: protoLoader.PackageDefinition) => {
          const packageObject: any =
            grpc.loadPackageDefinition(packageDefinition);
          server.addService(
            packageObject.opentelemetry.proto.collector.logs.v1.LogsService
              .service,
            {
              Export: (data: {
                request: IExportLogsServiceRequest;
                metadata: grpc.Metadata;
              }) => {
                if (data.request.resourceLogs != null) {
                  exportedData = data.request.resourceLogs[0];
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
      collectorExporter = new OTLPLogsExporter({
        url: 'https://' + address,
        credentials,
        metadata: params.metadata,
      });
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
        collectorExporter = new OTLPLogsExporter({
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
        collectorExporter = new OTLPLogsExporter({
          url: `http://${address}/v1/logs`,
        });
        const args = spyLoggerWarn.args[0];
        assert.strictEqual(
          args[0],
          'URL path should not be set when using grpc, the path part of the URL will be ignored.'
        );
      });
    });

    describe('export', () => {
      it('should export log records', done => {
        const responseSpy = sinon.spy();
        const logRecords = [Object.assign({}, mockedReadableLogRecord)];
        collectorExporter.export(logRecords, responseSpy);
        setTimeout(() => {
          assert.ok(
            typeof exportedData !== 'undefined',
            'resource' + " doesn't exist"
          );

          const logs = exportedData.scopeLogs[0].logRecords;
          const resource = exportedData.resource;

          assert.ok(typeof logs !== 'undefined', 'log records do not exist');

          ensureExportedLogRecordIsCorrect(logs[0]);

          assert.ok(typeof resource !== 'undefined', "resource doesn't exist");

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

        const collectorExporterWithTimeout = new OTLPLogsExporter({
          url: 'grpcs://' + address,
          credentials,
          metadata: params.metadata,
          timeoutMillis: 100,
        });

        const responseSpy = sinon.spy();
        const logRecords = [Object.assign({}, mockedReadableLogRecord)];
        collectorExporterWithTimeout.export(logRecords, responseSpy);

        setTimeout(() => {
          const result = responseSpy.args[0][0] as core.ExportResult;
          assert.strictEqual(result.code, core.ExportResultCode.FAILED);
          assert.strictEqual(
            responseSpy.args[0][0].error.details,
            'Deadline exceeded'
          );
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
        collectorExporter = new OTLPLogsExporter({
          url: 'https://' + address,
          credentials,
          metadata: params.metadata,
          compression: CompressionAlgorithm.GZIP,
        });
      });
      it('should successfully send the spans', done => {
        const responseSpy = sinon.spy();
        const logRecords = [Object.assign({}, mockedReadableLogRecord)];
        collectorExporter.export(logRecords, responseSpy);
        setTimeout(() => {
          assert.ok(
            typeof exportedData !== 'undefined',
            'resource' + " doesn't exist"
          );
          const logs = exportedData.scopeLogs[0].logRecords;
          const resource = exportedData.resource;

          assert.ok(typeof logs !== 'undefined', 'spans do not exist');
          ensureExportedLogRecordIsCorrect(logs[0]);

          assert.ok(typeof resource !== 'undefined', "resource doesn't exist");
          ensureResourceIsCorrect(resource);

          ensureMetadataIsCorrect(reqMetadata, params.metadata);

          done();
        }, 500);
      });
    });
    describe('Logs Exporter with compression', () => {
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
        collectorExporter = new OTLPLogsExporter({
          url: 'https://' + address,
          credentials,
          metadata: params.metadata,
        });
        assert.strictEqual(
          collectorExporter.compression,
          GrpcCompressionAlgorithm.GZIP
        );
        delete envSource.OTEL_EXPORTER_OTLP_COMPRESSION;
      });
    });
  });

describe('OTLPLogsExporter - node (getDefaultUrl)', () => {
  it('should default to localhost', done => {
    const collectorExporter = new OTLPLogsExporter({});
    setTimeout(() => {
      assert.strictEqual(collectorExporter['url'], 'localhost:4317');
      done();
    });
  });
  it('should keep the URL if included', done => {
    const url = 'http://foo.bar.com';
    const collectorExporter = new OTLPLogsExporter({ url });
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
    const collectorExporter = new OTLPLogsExporter();
    assert.strictEqual(collectorExporter.url, 'foo.bar');
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
  });
  it('should override global exporter url with signal url defined in env', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar';
    envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://foo.logs';
    const collectorExporter = new OTLPLogsExporter();
    assert.strictEqual(collectorExporter.url, 'foo.logs');
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = '';
  });
  it('should use headers defined via env', () => {
    envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar';
    const collectorExporter = new OTLPLogsExporter();
    assert.deepStrictEqual(collectorExporter.metadata?.get('foo'), ['bar']);
    envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
  });
  it('should override global headers config with signal headers defined via env', () => {
    const metadata = new grpc.Metadata();
    metadata.set('foo', 'bar');
    metadata.set('goo', 'lol');
    envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=jar,bar=foo';
    envSource.OTEL_EXPORTER_OTLP_LOGS_HEADERS = 'foo=boo';
    const collectorExporter = new OTLPLogsExporter({ metadata });
    assert.deepStrictEqual(collectorExporter.metadata?.get('foo'), ['boo']);
    assert.deepStrictEqual(collectorExporter.metadata?.get('bar'), ['foo']);
    assert.deepStrictEqual(collectorExporter.metadata?.get('goo'), ['lol']);
    envSource.OTEL_EXPORTER_OTLP_LOGS_HEADERS = '';
    envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
  });
});

testCollectorExporter({ useTLS: true });
testCollectorExporter({ useTLS: false });
testCollectorExporter({ metadata });
