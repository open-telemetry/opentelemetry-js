/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { GrpcExporterTransportParameters } from '../src/grpc-exporter-transport';
import {
  createEmptyMetadata,
  createInsecureCredentials,
  createOtlpGrpcExporterTransport,
  createSslCredentials,
  GrpcExporterTransport,
} from '../src/grpc-exporter-transport';
import { VERSION } from '../src/version';
import * as assert from 'assert';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as sinon from 'sinon';
import type { Metadata, ServiceError } from '@grpc/grpc-js';
import {
  Server,
  ServerCredentials,
  ServerInterceptingCall,
  status,
} from '@grpc/grpc-js';
import { types } from 'util';
import type {
  ExportResponseFailure,
  ExportResponseSuccess,
} from '@opentelemetry/otlp-exporter-base';
import type { ISerializer } from '@opentelemetry/otlp-transformer';
import type { Histogram } from '@opentelemetry/sdk-metrics';
import { MeterProvider, MetricReader } from '@opentelemetry/sdk-metrics';
import { createOtlpGrpcExportDelegate } from '../src';
import { ExportResultCode } from '@opentelemetry/core';

const testServiceDefinition = {
  export: {
    path: '/test/Export',
    requestStream: false,
    responseStream: false,
    requestSerialize: (arg: Buffer) => {
      return arg;
    },
    requestDeserialize: (arg: Buffer) => {
      return arg;
    },
    responseSerialize: (arg: Buffer) => {
      return arg;
    },
    responseDeserialize: (arg: Buffer) => {
      return arg;
    },
  },
};

const simpleClientConfig: GrpcExporterTransportParameters = {
  metadata: () => {
    const metadata = createEmptyMetadata();
    metadata.set('foo', 'bar');
    return metadata;
  },
  grpcPath: '/test/Export',
  grpcName: 'name',
  credentials: createInsecureCredentials,
  compression: 'none',
  address: 'localhost:1234',
};

const timeoutMillis = 10_000;

interface ExportedData {
  request: Buffer;
  metadata: Metadata;
}

interface ServerTestContext {
  requests: ExportedData[];
  metadata: Metadata[];
  serverResponseProvider: () => { error: Error | null; buffer?: Buffer };
}

interface FakeInternalRepresentation {
  foo: string;
}

interface FakeSignalResponse {
  partialSuccess?: { foo: string };
}

type FakeSerializer = ISerializer<
  FakeInternalRepresentation,
  FakeSignalResponse
>;

const internalRepresentation: FakeInternalRepresentation = {
  foo: 'internal',
};

/**
 * Starts a customizable server that saves all responses to context.responses
 * Returns data as defined in context.ServerResponseProvider
 *
 * @return shutdown handle, needs to be called to ensure that mocha exits
 * @param context context for storing responses and to define server behavior.
 */
function startServer(context: ServerTestContext): Promise<() => void> {
  const server = new Server({
    interceptors: [
      (descriptor, call) => {
        return new ServerInterceptingCall(call, {
          start: next => {
            next({
              onReceiveMetadata: (metadata, mdNext) => {
                context.metadata.push(metadata);
                mdNext(metadata);
              },
            });
          },
        });
      },
    ],
  });
  server.addService(testServiceDefinition, {
    export: (data: ExportedData, callback: any) => {
      context.requests.push(data);
      const response = context.serverResponseProvider();
      callback(response.error, response.buffer);
    },
  });

  return new Promise<() => void>((resolve, reject) => {
    server.bindAsync(
      'localhost:1234',
      ServerCredentials.createInsecure(),
      (error, port) => {
        server.start();
        if (error != null) {
          reject(error);
        }
        resolve(() => {
          server.forceShutdown();
        });
      }
    );
  });
}

/**
 * Starts a customizable server that saves all responses to context.responses
 * Returns data as defined in context.ServerResponseProvider
 *
 * @return shutdown handle, needs to be called to ensure that mocha exits
 * @param context context for storing responses and to define server behavior.
 */
function startUdsServer(context: ServerTestContext): Promise<() => void> {
  const server = new Server();
  server.addService(testServiceDefinition, {
    export: (data: ExportedData, callback: any) => {
      context.requests.push(data);
      const response = context.serverResponseProvider();
      callback(response.error, response.buffer);
    },
  });

  return new Promise<() => void>((resolve, reject) => {
    server.bindAsync(
      'unix:///tmp/otlp-test.sock',
      ServerCredentials.createInsecure(),
      (error, port) => {
        server.start();
        if (error != null) {
          reject(error);
        }
        resolve(() => {
          server.forceShutdown();
        });
      }
    );
  });
}

describe('GrpcExporterTransport', function () {
  describe('utilities', function () {
    describe('createEmptyMetadata', function () {
      it('returns new empty Metadata', function () {
        const metadata = createEmptyMetadata();
        assert.strictEqual(Object.keys(metadata.getMap()).length, 0);
      });
    });

    describe('createInsecureCredentials', function () {
      it('creates insecure grpc credentials', function () {
        const credentials = createInsecureCredentials();
        assert.ok(!credentials._isSecure());
      });
    });

    describe('createSslCredentials', function () {
      if (crypto.X509Certificate) {
        it('test certs are valid', () => {
          const certPaths = ['./test/certs/ca.crt', './test/certs/server.crt'];
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

      it('creates SSL grpc credentials', function () {
        const credentials = createSslCredentials(
          Buffer.from(fs.readFileSync('./test/certs/ca.crt')),
          Buffer.from(fs.readFileSync('./test/certs/client.key')),
          Buffer.from(fs.readFileSync('./test/certs/client.crt'))
        );
        assert.ok(credentials._isSecure());
      });
    });
  });
  describe('shutdown', function () {
    let shutdownHandle: () => void | undefined;
    const serverTestContext: ServerTestContext = {
      requests: [],
      metadata: [],
      serverResponseProvider: () => {
        return { error: null, buffer: Buffer.from([]) };
      },
    };

    beforeEach(async function () {
      shutdownHandle = await startServer(serverTestContext);
    });

    afterEach(function () {
      shutdownHandle();

      // clear context
      serverTestContext.requests = [];
      serverTestContext.metadata = [];
      serverTestContext.serverResponseProvider = () => {
        return { error: null, buffer: Buffer.from([]) };
      };

      sinon.restore();
    });

    it('before send() does not error', function () {
      const transport = createOtlpGrpcExporterTransport(simpleClientConfig);
      transport.shutdown();

      // no assertions, just checking that it does not throw any errors.
    });

    it('calls _client.close() if client is defined', async function () {
      const transport = new GrpcExporterTransport(simpleClientConfig);
      // send something so that client is defined
      await transport.send(Buffer.from([1, 2, 3]), timeoutMillis);
      assert.ok(transport['_client'], '_client is not defined after send()');
      const closeSpy = sinon.spy(transport['_client'], 'close');

      // act
      transport.shutdown();

      // assert
      sinon.assert.calledOnce(closeSpy);
    });
  });
  describe('send', function () {
    describe('http2', function () {
      let shutdownHandle: () => void | undefined;
      const serverTestContext: ServerTestContext = {
        requests: [],
        metadata: [],
        serverResponseProvider: () => {
          return { error: null, buffer: Buffer.from([]) };
        },
      };

      beforeEach(async function () {
        shutdownHandle = await startServer(serverTestContext);
      });

      afterEach(function () {
        shutdownHandle();

        // clear context
        serverTestContext.requests = [];
        serverTestContext.metadata = [];
        serverTestContext.serverResponseProvider = () => {
          return { error: null, buffer: Buffer.from([]) };
        };
      });

      function getUserAgent(serverTestContext: ServerTestContext) {
        return serverTestContext.metadata[0].get('user-agent')[0] as string;
      }

      it('sends default user-agent in metadata', async function () {
        const transport = createOtlpGrpcExporterTransport(simpleClientConfig);

        (await transport.send(
          Buffer.from([1, 2, 3]),
          timeoutMillis
        )) as ExportResponseSuccess;

        const userAgents = getUserAgent(serverTestContext).split(' ');
        assert.strictEqual(serverTestContext.requests.length, 1);
        assert.deepEqual(
          serverTestContext.requests[0].request,
          Buffer.from([1, 2, 3])
        );
        assert.strictEqual(
          userAgents[0],
          `OTel-OTLP-Exporter-JavaScript/${VERSION}`
        );
        assert.match(userAgents[1], /^grpc-node-js\/\d+\.\d+\.\d+$/);
      });

      it('prepends provided user-agent to the default one in metadata', async function () {
        const transport = createOtlpGrpcExporterTransport({
          ...simpleClientConfig,
          userAgent: 'Custom-User-Agent/1.2.3',
        });

        (await transport.send(
          Buffer.from([1, 2, 3]),
          timeoutMillis
        )) as ExportResponseSuccess;

        const userAgents = getUserAgent(serverTestContext).split(' ');
        assert.strictEqual(serverTestContext.requests.length, 1);
        assert.deepEqual(
          serverTestContext.requests[0].request,
          Buffer.from([1, 2, 3])
        );
        assert.strictEqual(userAgents[0], 'Custom-User-Agent/1.2.3');
        assert.strictEqual(
          userAgents[1],
          `OTel-OTLP-Exporter-JavaScript/${VERSION}`
        );
        assert.match(userAgents[2], /^grpc-node-js\/\d+\.\d+\.\d+$/);
      });

      it('sends data', async function () {
        const transport = createOtlpGrpcExporterTransport(simpleClientConfig);

        const result = (await transport.send(
          Buffer.from([1, 2, 3]),
          timeoutMillis
        )) as ExportResponseSuccess;

        assert.strictEqual(result.status, 'success');
        assert.deepEqual(result.data, Buffer.from([]));
        assert.strictEqual(serverTestContext.requests.length, 1);
        assert.deepEqual(
          serverTestContext.requests[0].request,
          Buffer.from([1, 2, 3])
        );
        assert.deepEqual(
          serverTestContext.requests[0].metadata.get('foo'),
          simpleClientConfig.metadata().get('foo')
        );
      });

      it('forwards response', async function () {
        const expectedResponseData = Buffer.from([1, 2, 3]);
        serverTestContext.serverResponseProvider = () => {
          return {
            buffer: expectedResponseData,
            error: null,
          };
        };
        const transport = createOtlpGrpcExporterTransport(simpleClientConfig);

        const result = (await transport.send(
          Buffer.from([]),
          timeoutMillis
        )) as ExportResponseSuccess;

        assert.strictEqual(result.status, 'success');
        assert.deepEqual(result.data, expectedResponseData);
      });

      it('forwards handled server error as failure', async function () {
        serverTestContext.serverResponseProvider = () => {
          return {
            buffer: Buffer.from([]),
            error: new Error('handled server error'),
          };
        };
        const transport = createOtlpGrpcExporterTransport(simpleClientConfig);

        const result = (await transport.send(
          Buffer.from([]),
          timeoutMillis
        )) as ExportResponseFailure;

        assert.strictEqual(result.status, 'failure');
        assert.ok(types.isNativeError(result.error));
      });

      it('forwards unhandled server error as failure', async function () {
        serverTestContext.serverResponseProvider = () => {
          throw new Error('unhandled server error');
        };
        const transport = createOtlpGrpcExporterTransport(simpleClientConfig);

        const result = (await transport.send(
          Buffer.from([]),
          timeoutMillis
        )) as ExportResponseFailure;
        assert.strictEqual(result.status, 'failure');
        assert.ok(types.isNativeError(result.error));
      });

      it('forwards metadataProvider error as failure', async function () {
        const expectedError = new Error('metadata provider error');
        const config = Object.assign({}, simpleClientConfig);
        config.metadata = () => {
          throw expectedError;
        };

        const transport = createOtlpGrpcExporterTransport(config);

        const result = (await transport.send(
          Buffer.from([]),
          timeoutMillis
        )) as ExportResponseFailure;
        assert.strictEqual(result.status, 'failure');
        assert.strictEqual(result.error, expectedError);
      });

      it('forwards metadataProvider returns null value as failure', async function () {
        const expectedError = new Error('metadata was null');
        const config = Object.assign({}, simpleClientConfig);
        config.metadata = () => {
          return null as unknown as Metadata;
        };

        const transport = createOtlpGrpcExporterTransport(config);

        const result = (await transport.send(
          Buffer.from([]),
          timeoutMillis
        )) as ExportResponseFailure;
        assert.strictEqual(result.status, 'failure');
        assert.deepEqual(result.error, expectedError);
      });

      it('forwards credential error as failure', async function () {
        const expectedError = new Error('credential provider error');
        const config = Object.assign({}, simpleClientConfig);
        config.credentials = () => {
          throw expectedError;
        };

        const transport = createOtlpGrpcExporterTransport(config);

        const result = (await transport.send(
          Buffer.from([]),
          timeoutMillis
        )) as ExportResponseFailure;
        assert.strictEqual(result.status, 'failure');
        assert.strictEqual(result.error, expectedError);
      });

      it('delegate records metrics for success', async () => {
        const metricReader = new TestMetricReader();
        const meterProvider = new MeterProvider({
          readers: [metricReader],
        });
        const serializerStubs = {
          // simulate that the serializer returns something to send
          serializeRequest: sinon.stub().returns(Buffer.from([1, 2, 3])),
          // simulate that it returns a full success (empty response)
          deserializeResponse: sinon.stub().returns({}),
        };
        const mockSerializer = <FakeSerializer>serializerStubs;

        const delegate = createOtlpGrpcExportDelegate(
          {
            url: simpleClientConfig.address,
            metadata: simpleClientConfig.metadata,
            credentials: simpleClientConfig.credentials,
            compression: simpleClientConfig.compression,
            concurrencyLimit: 10,
            timeoutMillis,
          },
          mockSerializer,
          'test_grpc_exporter',
          { name: 'log', countItems: () => 10 },
          meterProvider,
          simpleClientConfig.grpcName,
          simpleClientConfig.grpcPath
        );

        await new Promise<void>(resolve =>
          delegate.export(internalRepresentation, result => {
            assert.strictEqual(result.code, ExportResultCode.SUCCESS);
            assert.strictEqual(result.error, undefined);
            resolve();
          })
        );

        const { resourceMetrics } = await metricReader.collect();
        const metrics = resourceMetrics.scopeMetrics[0].metrics;
        const duration = metrics.find(
          metric =>
            metric.descriptor.name === 'otel.sdk.exporter.operation.duration'
        );
        assert.ok(duration);
        const histogram = duration.dataPoints[0].value as Histogram;
        assert.strictEqual(histogram.count, 1);
        assert.strictEqual(histogram.count, 1);
        assert.deepStrictEqual(duration.dataPoints[0].attributes, {
          'otel.component.type': 'test_grpc_exporter',
          'otel.component.name': 'test_grpc_exporter/0',
          'server.address': 'localhost',
          'server.port': 1234,
        });
      });

      it('delegate records metrics for gRPC error', async () => {
        const error: ServiceError = {
          name: 'ServiceError',
          message: 'service failed',
          code: status.DATA_LOSS,
          details: 'failed',
          metadata: simpleClientConfig.metadata(),
        };
        serverTestContext.serverResponseProvider = () => ({
          error,
        });
        const metricReader = new TestMetricReader();
        const meterProvider = new MeterProvider({
          readers: [metricReader],
        });
        const serializerStubs = {
          // simulate that the serializer returns something to send
          serializeRequest: sinon.stub().returns(Buffer.from([1, 2, 3])),
          // simulate that it returns a full success (empty response)
          deserializeResponse: sinon.stub().returns({}),
        };
        const mockSerializer = <FakeSerializer>serializerStubs;

        const delegate = createOtlpGrpcExportDelegate(
          {
            url: simpleClientConfig.address,
            metadata: simpleClientConfig.metadata,
            credentials: simpleClientConfig.credentials,
            compression: simpleClientConfig.compression,
            concurrencyLimit: 10,
            timeoutMillis,
          },
          mockSerializer,
          'test_grpc_exporter',
          { name: 'log', countItems: () => 10 },
          meterProvider,
          simpleClientConfig.grpcName,
          simpleClientConfig.grpcPath
        );

        await new Promise<void>(resolve =>
          delegate.export(internalRepresentation, result => {
            assert.strictEqual(result.code, ExportResultCode.FAILED);
            resolve();
          })
        );

        const { resourceMetrics } = await metricReader.collect();
        const metrics = resourceMetrics.scopeMetrics[0].metrics;
        const duration = metrics.find(
          metric =>
            metric.descriptor.name === 'otel.sdk.exporter.operation.duration'
        );
        assert.ok(duration);
        const histogram = duration.dataPoints[0].value as Histogram;
        assert.strictEqual(histogram.count, 1);
        assert.strictEqual(histogram.count, 1);
        assert.deepStrictEqual(duration.dataPoints[0].attributes, {
          'otel.component.type': 'test_grpc_exporter',
          'otel.component.name': 'test_grpc_exporter/1',
          'server.address': 'localhost',
          'server.port': 1234,
          'rpc.response.status_code': 'DATA_LOSS',
          'error.type': 'Error',
        });
      });
    });
    describe('uds', function () {
      let shutdownHandle: (() => void) | undefined;
      const serverTestContext: ServerTestContext = {
        requests: [],
        metadata: [],
        serverResponseProvider: () => {
          return { error: null, buffer: Buffer.from([]) };
        },
      };

      beforeEach(async function () {
        // skip uds tests on windows
        if (process.platform === 'win32') {
          this.skip();
        }
        shutdownHandle = await startUdsServer(serverTestContext);
      });

      afterEach(function () {
        shutdownHandle?.();

        // clear context
        serverTestContext.requests = [];
        serverTestContext.metadata = [];
        serverTestContext.serverResponseProvider = () => {
          return { error: null, buffer: Buffer.from([]) };
        };
      });

      it('sends data', async function () {
        const transport = createOtlpGrpcExporterTransport({
          ...simpleClientConfig,
          address: 'unix:///tmp/otlp-test.sock',
        });

        const result = (await transport.send(
          Buffer.from([1, 2, 3]),
          timeoutMillis
        )) as ExportResponseSuccess;

        assert.strictEqual(result.status, 'success');
        assert.deepEqual(result.data, Buffer.from([]));
        assert.strictEqual(serverTestContext.requests.length, 1);
        assert.deepEqual(
          serverTestContext.requests[0].request,
          Buffer.from([1, 2, 3])
        );
        assert.deepEqual(
          serverTestContext.requests[0].metadata.get('foo'),
          simpleClientConfig.metadata().get('foo')
        );
      });
    });
  });
});

export class TestMetricReader extends MetricReader {
  protected override onShutdown(): Promise<void> {
    return Promise.resolve();
  }
  protected override onForceFlush(): Promise<void> {
    return Promise.resolve();
  }
}
