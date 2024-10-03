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
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as grpc from '@grpc/grpc-js';
import * as path from 'path';
import * as sinon from 'sinon';
import { OTLPLogExporter } from '../src';

import {
  ensureExportedLogRecordIsCorrect,
  ensureMetadataIsCorrect,
  ensureResourceIsCorrect,
  mockedReadableLogRecord,
} from './logsHelper';
import * as core from '@opentelemetry/core';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import {
  IExportLogsServiceRequest,
  IResourceLogs,
} from '@opentelemetry/otlp-transformer';

const logsServiceProtoPath =
  'opentelemetry/proto/collector/logs/v1/logs_service.proto';
const includeDirs = [path.resolve(__dirname, '../../otlp-transformer/protos')];

const httpAddr = 'https://localhost:1503';
const udsAddr = 'unix:///tmp/otlp-logs.sock';

type TestParams = {
  address?: string;
  useTLS?: boolean;
  metadata?: grpc.Metadata;
};

const metadata = new grpc.Metadata();
metadata.set('k', 'v');

const testCollectorExporter = (params: TestParams) => {
  const { address = httpAddr, useTLS, metadata } = params;
  return describe(`OTLPLogExporter - node ${useTLS ? 'with' : 'without'} TLS, ${
    metadata ? 'with' : 'without'
  } metadata, target ${address}`, () => {
    let collectorExporter: OTLPLogExporter;
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
          const credentials = useTLS
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
          const serverAddr = new URL(address);
          server.bindAsync(
            serverAddr.protocol === 'https:' ? serverAddr.host : address,
            credentials,
            err => {
              if (err) {
                done(err);
              } else {
                server.start();
                done();
              }
            }
          );
        })
        .catch(done);
    });

    after(() => {
      server.forceShutdown();
    });

    beforeEach(done => {
      const credentials = useTLS
        ? grpc.credentials.createSsl(
            fs.readFileSync('./test/certs/ca.crt'),
            fs.readFileSync('./test/certs/client.key'),
            fs.readFileSync('./test/certs/client.crt')
          )
        : grpc.credentials.createInsecure();
      collectorExporter = new OTLPLogExporter({
        url: address,
        credentials,
        metadata: metadata,
      });
      done();
    });

    afterEach(() => {
      exportedData = undefined;
      reqMetadata = undefined;
      sinon.restore();
    });

    if (useTLS && crypto.X509Certificate) {
      it('test certs are valid', () => {
        const certPaths = [
          './test/certs/ca.crt',
          './test/certs/client.crt',
          './test/certs/server.crt',
        ];
        certPaths.forEach(certPath => {
          const cert = new crypto.X509Certificate(fs.readFileSync(certPath));
          const now = new Date();
          assert.ok(
            new Date(cert.validTo) > now,
            `TLS cert "${certPath}" is still valid: cert.validTo="${cert.validTo}" (if this fails use 'npm run maint:regenerate-test-certs')`
          );
        });
      });
    }

    describe('instance', () => {
      it('should warn about headers when using grpc', () => {
        // Need to stub/spy on the underlying logger as the 'diag' instance is global
        const spyLoggerWarn = sinon.stub(diag, 'warn');
        collectorExporter = new OTLPLogExporter({
          url: address,
          headers: {
            foo: 'bar',
          },
        });
        const args = spyLoggerWarn.args[0];
        assert.strictEqual(args[0], 'Headers cannot be set when using grpc');
      });
      it('should warn about path in url', () => {
        if (new URL(address).protocol === 'unix:') {
          // Skip this test for UDS
          return;
        }
        const spyLoggerWarn = sinon.stub(diag, 'warn');
        collectorExporter = new OTLPLogExporter({
          url: `${address}/v1/logs`,
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
        const credentials = useTLS
          ? grpc.credentials.createSsl(
              fs.readFileSync('./test/certs/ca.crt'),
              fs.readFileSync('./test/certs/client.key'),
              fs.readFileSync('./test/certs/client.crt')
            )
          : grpc.credentials.createInsecure();

        const collectorExporterWithTimeout = new OTLPLogExporter({
          url: address,
          credentials,
          metadata: metadata,
          timeoutMillis: 100,
        });

        const responseSpy = sinon.spy();
        const logRecords = [Object.assign({}, mockedReadableLogRecord)];
        collectorExporterWithTimeout.export(logRecords, responseSpy);

        setTimeout(() => {
          const result = responseSpy.args[0][0] as core.ExportResult;
          assert.strictEqual(result.code, core.ExportResultCode.FAILED);
          assert.match(
            responseSpy.args[0][0].error.details,
            /Deadline exceeded.*/
          );
          done();
        }, 300);
      });
    });
    describe('export - with gzip compression', () => {
      beforeEach(() => {
        const credentials = useTLS
          ? grpc.credentials.createSsl(
              fs.readFileSync('./test/certs/ca.crt'),
              fs.readFileSync('./test/certs/client.key'),
              fs.readFileSync('./test/certs/client.crt')
            )
          : grpc.credentials.createInsecure();
        collectorExporter = new OTLPLogExporter({
          url: address,
          credentials,
          metadata: metadata,
          compression: CompressionAlgorithm.GZIP,
        });
      });
      it('should successfully send the log records', done => {
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

          ensureMetadataIsCorrect(reqMetadata, metadata);

          done();
        }, 500);
      });
    });
  });
};

testCollectorExporter({ useTLS: true });
testCollectorExporter({ useTLS: false });
testCollectorExporter({ metadata });
// skip UDS tests on windows
process.platform !== 'win32' && testCollectorExporter({ address: udsAddr });
