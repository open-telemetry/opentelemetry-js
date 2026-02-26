/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Attributes,
  context,
  propagation,
  SpanKind,
  trace,
} from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { ContextManager } from '@opentelemetry/api';
import {
  InMemorySpanExporter,
  ReadableSpan,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import * as protoLoader from '@grpc/proto-loader';
import {
  status as GrpcStatus,
  ServerUnaryCall,
  requestCallback,
  ServerReadableStream,
  ServerDuplexStream,
  ServerWritableStream,
  Client,
  Metadata,
  ServiceError,
  Server,
  credentials,
  loadPackageDefinition,
  ServerCredentials,
} from '@grpc/grpc-js';
import { assertPropagation, assertSpan } from './utils/assertionUtils';
import { promisify } from 'util';
import type { GrpcInstrumentation } from '../src';
import { SemconvStability } from '@opentelemetry/instrumentation';
import * as path from 'path';

const PROTO_PATH = path.resolve(__dirname, './fixtures/grpc-test.proto');
const memoryExporter = new InMemorySpanExporter();

const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

interface TestRequestResponse {
  num: number;
}

type TestGrpcClient = Client & {
  unaryMethodWithMetadata: any;
  unaryMethod: any;
  UnaryMethod: any;
  camelCaseMethod: any;
  clientStreamMethod: any;
  serverStreamMethod: any;
  bidiStreamMethod: any;
};

interface TestGrpcCall {
  description: string;
  methodName: string;
  method: (...args: any[]) => unknown;
  request: TestRequestResponse | TestRequestResponse[];
  result: TestRequestResponse | TestRequestResponse[];
  metadata?: Metadata;
}

// Compare two arrays using an equal function f
const arrayIsEqual =
  (f: any) =>
  ([x, ...xs]: any) =>
  ([y, ...ys]: any): any =>
    x === undefined && y === undefined
      ? true
      : Boolean(f(x)(y)) && arrayIsEqual(f)(xs)(ys);

// Return true if two requests has the same num value
const requestEqual = (x: TestRequestResponse) => (y: TestRequestResponse) =>
  x.num !== undefined && x.num === y.num;

// Check if its equal requests or array of requests
const checkEqual =
  (x: TestRequestResponse | TestRequestResponse[]) =>
  (y: TestRequestResponse | TestRequestResponse[]) =>
    x instanceof Array && y instanceof Array
      ? arrayIsEqual(requestEqual)(x as any)(y as any)
      : !(x instanceof Array) && !(y instanceof Array)
        ? requestEqual(x)(y)
        : false;

const replicate = (request: TestRequestResponse) => {
  const result: TestRequestResponse[] = [];
  for (let i = 0; i < request.num; i++) {
    result.push(request);
  }
  return result;
};

export async function startServer(proto: any, port: number) {
  const MAX_ERROR_STATUS = GrpcStatus.UNAUTHENTICATED;
  const server = new Server();

  function getError(msg: string, code: number): ServiceError | null {
    const err: ServiceError = {
      ...new Error(msg),
      name: msg,
      message: msg,
      code,
      details: msg,
      metadata: new Metadata(),
    };
    return err;
  }

  server.addService(proto.GrpcTester.service, {
    // An error is emitted every time
    // request.num <= MAX_ERROR_STATUS = (status.UNAUTHENTICATED)
    // in those cases, error.code = request.num

    // This method returns the request
    // This method returns the request
    unaryMethodWithMetadata(
      call: ServerUnaryCall<any, any>,
      callback: requestCallback<any>
    ) {
      const serverMetadata: any = new Metadata();
      serverMetadata.add('server_metadata_key', 'server_metadata_value');

      call.sendMetadata(serverMetadata);

      if (call.request.num <= MAX_ERROR_STATUS) {
        callback(
          getError(
            'Unary Method with Metadata Error',
            call.request.num
          ) as ServiceError
        );
      } else {
        callback(null, { num: call.request.num });
      }
    },

    // This method returns the request
    unaryMethod(
      call: ServerUnaryCall<any, any>,
      callback: requestCallback<any>
    ) {
      if (call.request.num <= MAX_ERROR_STATUS) {
        callback(
          getError('Unary Method Error', call.request.num) as ServiceError
        );
      } else {
        callback(null, { num: call.request.num });
      }
    },

    // This method returns the request
    camelCaseMethod(
      call: ServerUnaryCall<any, any>,
      callback: requestCallback<any>
    ) {
      if (call.request.num <= MAX_ERROR_STATUS) {
        callback(
          getError('Unary Method Error', call.request.num) as ServiceError
        );
      } else {
        callback(null, { num: call.request.num });
      }
    },

    // This method sums the requests
    clientStreamMethod(
      call: ServerReadableStream<any, any>,
      callback: requestCallback<any>
    ) {
      let sum = 0;
      let hasError = false;
      let code = GrpcStatus.OK;
      call.on('data', (data: TestRequestResponse) => {
        sum += data.num;
        if (data.num <= MAX_ERROR_STATUS) {
          hasError = true;
          code = data.num;
        }
      });
      call.on('end', () => {
        if (hasError) {
          callback(getError('Client Stream Method Error', code) as any);
        } else {
          callback(null, { num: sum });
        }
      });
    },

    // This method returns an array that replicates the request, request.num of
    // times
    serverStreamMethod: (call: ServerWritableStream<any, any>) => {
      const result = replicate(call.request);

      if (call.request.num <= MAX_ERROR_STATUS) {
        call.emit(
          'error',
          getError('Server Stream Method Error', call.request.num)
        );
      } else {
        result.forEach(element => {
          call.write(element);
        });
      }
      call.end();
    },

    // This method returns the request
    bidiStreamMethod: (call: ServerDuplexStream<any, any>) => {
      call.on('data', (data: TestRequestResponse) => {
        if (data.num <= MAX_ERROR_STATUS) {
          call.emit('error', getError('Server Stream Method Error', data.num));
        } else {
          call.write(data);
        }
      });
      call.on('end', () => {
        call.end();
      });
    },
  });
  const bindAwait = promisify(server.bindAsync);
  await bindAwait.call(
    server,
    'localhost:' + port,
    ServerCredentials.createInsecure()
  );
  server.start();
  return server;
}

export const runTestsWithSemconvStabilityLevels = (
  plugin: GrpcInstrumentation,
  moduleName: string,
  grpcPort: number
) => {
  describe('GrpcInstrumentation with different semconvStability levels', () => {
    describe('OLD semantic conventions', () => {
      before(() => {
        plugin['_semconvStability'] = SemconvStability.OLD;
      });

      runTests(plugin, moduleName, grpcPort);
    });

    describe('STABLE semantic conventions', () => {
      before(() => {
        plugin['_semconvStability'] = SemconvStability.STABLE;
      });

      runTests(plugin, moduleName, grpcPort);
    });

    describe('DUPLICATE semantic conventions', () => {
      before(() => {
        plugin['_semconvStability'] = SemconvStability.DUPLICATE;
      });

      runTests(plugin, moduleName, grpcPort);
    });
  });
};

export const runTests = (
  plugin: GrpcInstrumentation,
  moduleName: string,
  grpcPort: number
) => {
  const grpcClient = {
    unaryMethodWithMetadata: (
      client: TestGrpcClient,
      request: TestRequestResponse,
      metadata: Metadata
    ): Promise<TestRequestResponse> => {
      return new Promise((resolve, reject) => {
        return client.unaryMethodWithMetadata(
          request,
          metadata,
          (err: ServiceError, response: TestRequestResponse) => {
            if (err) {
              reject(err);
            } else {
              resolve(response);
            }
          }
        );
      });
    },

    unaryMethod: (
      client: TestGrpcClient,
      request: TestRequestResponse,
      metadata = new Metadata()
    ): Promise<TestRequestResponse> => {
      return new Promise((resolve, reject) => {
        return client.unaryMethod(
          request,
          metadata,
          (err: ServiceError, response: TestRequestResponse) => {
            if (err) {
              reject(err);
            } else {
              resolve(response);
            }
          }
        );
      });
    },

    UnaryMethod: (
      client: TestGrpcClient,
      request: TestRequestResponse,
      metadata = new Metadata()
    ): Promise<TestRequestResponse> => {
      return new Promise((resolve, reject) => {
        return client.UnaryMethod(
          request,
          metadata,
          (err: ServiceError, response: TestRequestResponse) => {
            if (err) {
              reject(err);
            } else {
              resolve(response);
            }
          }
        );
      });
    },

    camelCaseMethod: (
      client: TestGrpcClient,
      request: TestRequestResponse,
      metadata = new Metadata()
    ): Promise<TestRequestResponse> => {
      return new Promise((resolve, reject) => {
        return client.camelCaseMethod(
          request,
          metadata,
          (err: ServiceError, response: TestRequestResponse) => {
            if (err) {
              reject(err);
            } else {
              resolve(response);
            }
          }
        );
      });
    },

    clientStreamMethod: (
      client: TestGrpcClient,
      request: TestRequestResponse[],
      metadata = new Metadata()
    ): Promise<TestRequestResponse> => {
      return new Promise((resolve, reject) => {
        const writeStream = client.clientStreamMethod(
          metadata,
          (err: ServiceError, response: TestRequestResponse) => {
            if (err) {
              reject(err);
            } else {
              resolve(response);
            }
          }
        );

        request.forEach(element => {
          writeStream.write(element);
        });
        writeStream.end();
      });
    },

    serverStreamMethod: (
      client: TestGrpcClient,
      request: TestRequestResponse,
      metadata = new Metadata()
    ): Promise<TestRequestResponse[]> => {
      return new Promise((resolve, reject) => {
        const result: TestRequestResponse[] = [];
        const readStream = client.serverStreamMethod(request, metadata);

        readStream.on('data', (data: TestRequestResponse) => {
          result.push(data);
        });
        readStream.on('error', (err: ServiceError) => {
          reject(err);
        });
        readStream.on('end', () => {
          resolve(result);
        });
      });
    },

    bidiStreamMethod: (
      client: TestGrpcClient,
      request: TestRequestResponse[],
      metadata = new Metadata()
    ): Promise<TestRequestResponse[]> => {
      return new Promise((resolve, reject) => {
        const result: TestRequestResponse[] = [];
        const bidiStream = client.bidiStreamMethod(metadata);

        bidiStream.on('data', (data: TestRequestResponse) => {
          result.push(data);
        });

        request.forEach(element => {
          bidiStream.write(element);
        });

        assert.strictEqual(bidiStream.listenerCount('error'), 0);
        bidiStream.on('error', (err: ServiceError) => {
          reject(err);
        });

        bidiStream.on('end', () => {
          resolve(result);
        });

        bidiStream.end();
      });
    },
  };

  let server: Server;
  let client: Client;

  function createClient(proto: any) {
    return new proto.GrpcTester(
      'localhost:' + grpcPort,
      credentials.createInsecure()
    );
  }

  return describe('GrpcPlugin', () => {
    let contextManager: ContextManager;

    before(() => {
      propagation.setGlobalPropagator(new W3CTraceContextPropagator());
    });

    beforeEach(() => {
      contextManager = new AsyncHooksContextManager().enable();
      context.setGlobalContextManager(contextManager);
    });

    afterEach(() => {
      context.disable();
    });

    it('moduleName should be grpc', () => {
      assert.deepStrictEqual(
        '@opentelemetry/instrumentation-grpc',
        plugin.instrumentationName
      );
    });

    const requestList: TestRequestResponse[] = [{ num: 100 }, { num: 50 }];
    const resultSum = {
      num: requestList.reduce((sum, x) => {
        return sum + x.num;
      }, 0),
    };
    const methodList: TestGrpcCall[] = [
      {
        description: 'unary call',
        methodName: 'UnaryMethod',
        method: grpcClient.unaryMethod,
        request: requestList[0],
        result: requestList[0],
      },
      {
        description: 'Unary call',
        methodName: 'UnaryMethod',
        method: grpcClient.UnaryMethod,
        request: requestList[0],
        result: requestList[0],
      },
      {
        description: 'camelCase unary call',
        methodName: 'camelCaseMethod',
        method: grpcClient.camelCaseMethod,
        request: requestList[0],
        result: requestList[0],
      },
      {
        description: 'clientStream call',
        methodName: 'ClientStreamMethod',
        method: grpcClient.clientStreamMethod,
        request: requestList,
        result: resultSum,
      },
      {
        description: 'serverStream call',
        methodName: 'ServerStreamMethod',
        method: grpcClient.serverStreamMethod,
        request: resultSum,
        result: replicate(resultSum),
      },
      {
        description: 'bidiStream call',
        methodName: 'BidiStreamMethod',
        method: grpcClient.bidiStreamMethod,
        request: requestList,
        result: requestList,
      },
    ];

    const validateSpans = (
      serverSpan: ReadableSpan,
      clientSpan: ReadableSpan,
      methodName: string,
      attributesValidation?: {
        serverAttributes?: Attributes;
        clientAttributes?: Attributes;
      }
    ) => {
      const validations = {
        name: `grpc.pkg_test.GrpcTester/${methodName}`,
        status: GrpcStatus.OK,
        host: 'localhost',
        port: grpcPort,
      };

      assertSpan(
        moduleName,
        serverSpan,
        SpanKind.SERVER,
        validations,
        plugin['_semconvStability']
      );
      assertSpan(
        moduleName,
        clientSpan,
        SpanKind.CLIENT,
        validations,
        plugin['_semconvStability']
      );

      assertPropagation(serverSpan, clientSpan);

      if (attributesValidation?.clientAttributes) {
        for (const key in attributesValidation.clientAttributes) {
          const expected = attributesValidation.clientAttributes[key] as string;
          const actual = clientSpan.attributes[key] as string;

          assert.equal(actual, expected);
        }
      }

      if (attributesValidation?.serverAttributes) {
        for (const key in attributesValidation.serverAttributes) {
          const expected = attributesValidation.serverAttributes[key];
          const actual = serverSpan.attributes[key];

          assert.equal(actual, expected);
        }
      }
    };

    const ClientServerValidationTest = (
      method: (typeof methodList)[0],
      provider: NodeTracerProvider,
      checkSpans = true,
      attributesValidation?: {
        serverAttributes?: Attributes;
        clientAttributes?: Attributes;
      }
    ) => {
      it(`should ${
        checkSpans ? 'do' : 'not'
      }: create a rootSpan for client and a childSpan for server - ${
        method.description
      }`, async () => {
        const args = [client, method.request, method.metadata];
        await (method.method as any)
          .apply({}, args)
          .then((result: TestRequestResponse | TestRequestResponse[]) => {
            assert.ok(
              checkEqual(result)(method.result),
              'gRPC call returns correct values'
            );

            const spans = memoryExporter.getFinishedSpans();
            if (checkSpans) {
              const spans = memoryExporter.getFinishedSpans();
              assert.strictEqual(spans.length, 2);

              const serverSpan = spans[0];
              const clientSpan = spans[1];

              validateSpans(
                serverSpan,
                clientSpan,
                method.methodName,
                attributesValidation
              );
            } else {
              assert.strictEqual(spans.length, 0);
            }
          });
      });
    };

    const ErrorValidationTest = (
      method: (typeof methodList)[0],
      provider: NodeTracerProvider,
      checkSpans = true,
      attributesValidation?: {
        serverAttributes?: Attributes;
        clientAttributes?: Attributes;
      }
    ) => {
      it(`should raise an error for client childSpan/server rootSpan - ${method.description} - status = OK`, () => {
        const expectEmpty = memoryExporter.getFinishedSpans();
        assert.strictEqual(expectEmpty.length, 0);

        const span = provider
          .getTracer('default')
          .startSpan('TestSpan', { kind: SpanKind.PRODUCER });
        return context.with(trace.setSpan(context.active(), span), async () => {
          const rootSpan = trace.getSpan(context.active());
          assert.ok(rootSpan != null);
          assert.deepStrictEqual(rootSpan, span);

          const args = [client, method.request, method.metadata];
          await (method.method as any)
            .apply({}, args)
            .then(() => {
              // Assert
              if (checkSpans) {
                const spans = memoryExporter.getFinishedSpans();
                assert.strictEqual(spans.length, 2);
                const serverSpan = spans[0];
                const clientSpan = spans[1];

                validateSpans(
                  serverSpan,
                  clientSpan,
                  method.methodName,
                  attributesValidation
                );

                assert.strictEqual(
                  rootSpan.spanContext().traceId,
                  serverSpan.spanContext().traceId
                );
                assert.strictEqual(
                  rootSpan.spanContext().spanId,
                  clientSpan.parentSpanContext?.spanId
                );
              }
            })
            .catch((err: ServiceError) => {
              assert.ok(false, err);
            });
        });
      });
    };

    const runTestWithAttributeValidation = (
      method: (typeof methodList)[0],
      provider: NodeTracerProvider,
      checkSpans = true,
      attributesValidation: {
        serverAttributes?: Attributes;
        clientAttributes?: Attributes;
      }
    ) => {
      ClientServerValidationTest(
        method,
        provider,
        checkSpans,
        attributesValidation
      );
      ErrorValidationTest(method, provider, checkSpans, attributesValidation);
    };

    const runTest = (
      method: (typeof methodList)[0],
      provider: NodeTracerProvider,
      checkSpans = true
    ) => {
      ClientServerValidationTest(method, provider, checkSpans);
      ErrorValidationTest(method, provider, checkSpans);
    };

    const insertError =
      (request: TestRequestResponse | TestRequestResponse[]) =>
      (code: number) =>
        request instanceof Array ? [{ num: code }, ...request] : { num: code };

    const runErrorTest = (
      method: (typeof methodList)[0],
      key: string,
      errorCode: number,
      provider: NodeTracerProvider
    ) => {
      it(`should raise an error for client/server rootSpans: method=${method.methodName}, status=${key}`, async () => {
        const expectEmpty = memoryExporter.getFinishedSpans();
        assert.strictEqual(expectEmpty.length, 0);

        const args = [client, insertError(method.request)(errorCode)];

        await (method.method as any)
          .apply({}, args)
          .then(() => {
            assert.ok(false);
          })
          .catch((err: ServiceError) => {
            const spans = memoryExporter.getFinishedSpans();
            assert.strictEqual(spans.length, 2, 'Expect 2 ended spans');

            const validations = {
              name: `grpc.pkg_test.GrpcTester/${method.methodName}`,
              status: errorCode,
              host: 'localhost',
              port: grpcPort,
            };
            const serverRoot = spans[0];
            const clientRoot = spans[1];
            assertSpan(
              moduleName,
              serverRoot,
              SpanKind.SERVER,
              validations,
              plugin['_semconvStability']
            );
            assertSpan(
              moduleName,
              clientRoot,
              SpanKind.CLIENT,
              validations,
              plugin['_semconvStability']
            );
            assertPropagation(serverRoot, clientRoot);
          });
      });

      it(`should raise an error for client childSpan/server rootSpan - ${method.description} - status = ${key}`, () => {
        const expectEmpty = memoryExporter.getFinishedSpans();
        assert.strictEqual(expectEmpty.length, 0);

        const span = provider
          .getTracer('default')
          .startSpan('TestSpan', { kind: SpanKind.PRODUCER });
        return context.with(trace.setSpan(context.active(), span), async () => {
          const rootSpan = trace.getSpan(context.active());
          assert.ok(rootSpan != null);
          assert.deepStrictEqual(rootSpan, span);

          const args = [client, insertError(method.request)(errorCode)];

          await (method.method as any)
            .apply({}, args)
            .then(() => {
              assert.ok(false);
            })
            .catch((err: ServiceError) => {
              // Assert
              const spans = memoryExporter.getFinishedSpans();
              assert.strictEqual(spans.length, 2);
              const serverSpan = spans[0];
              const clientSpan = spans[1];
              const validations = {
                name: `grpc.pkg_test.GrpcTester/${method.methodName}`,
                status: errorCode,
                host: 'localhost',
                port: grpcPort,
              };
              assertSpan(
                moduleName,
                serverSpan,
                SpanKind.SERVER,
                validations,
                plugin['_semconvStability']
              );
              assertSpan(
                moduleName,
                clientSpan,
                SpanKind.CLIENT,
                validations,
                plugin['_semconvStability']
              );
              assertPropagation(serverSpan, clientSpan);
              assert.strictEqual(
                rootSpan.spanContext().traceId,
                serverSpan.spanContext().traceId
              );
              assert.strictEqual(
                rootSpan.spanContext().spanId,
                clientSpan.parentSpanContext?.spanId
              );
            });
        });
      });
    };

    const runClientMethodTest = (method: (typeof methodList)[0]) => {
      it(`should assign original properties for grpc remote method ${method.methodName}`, async () => {
        const patchedClientMethod = (client as any)[method.methodName];
        const properties = Object.keys(patchedClientMethod);
        assert.ok(properties.length);
      });
    };

    describe('enable()', () => {
      const provider = new NodeTracerProvider({
        spanProcessors: [new SimpleSpanProcessor(memoryExporter)],
      });
      beforeEach(() => {
        memoryExporter.reset();
      });

      before(async () => {
        plugin.setTracerProvider(provider);
        plugin.enable();

        const packageDefinition = await protoLoader.load(PROTO_PATH, options);
        const proto = loadPackageDefinition(packageDefinition).pkg_test;

        server = await startServer(proto, grpcPort);
        client = createClient(proto);
      });

      after(done => {
        client.close();
        server.tryShutdown(() => {
          plugin.disable();
          done();
        });
      });

      methodList.forEach(method => {
        describe(`Test automatic tracing for grpc remote method ${method.description}`, () => {
          runTest(method, provider);
        });
      });

      methodList.forEach(method => {
        describe(`Test error raising for grpc remote ${method.description}`, () => {
          Object.keys(GrpcStatus).forEach((statusKey: string) => {
            const errorCode = Number(GrpcStatus[statusKey as any]);
            if (errorCode > GrpcStatus.OK) {
              runErrorTest(method, statusKey, errorCode, provider);
            }
          });
        });
      });
    });

    describe('disable()', () => {
      const provider = new NodeTracerProvider({
        spanProcessors: [new SimpleSpanProcessor(memoryExporter)],
      });
      beforeEach(() => {
        memoryExporter.reset();
      });

      before(async () => {
        plugin.disable();

        const packageDefinition = await protoLoader.load(PROTO_PATH, options);
        const proto = loadPackageDefinition(packageDefinition).pkg_test;

        server = await startServer(proto, grpcPort);
        client = createClient(proto);
      });

      after(done => {
        client.close();
        server.tryShutdown(() => {
          done();
        });
      });

      methodList.map(method => {
        describe(`Test automatic tracing for grpc remote method ${method.description}`, () => {
          runTest(method, provider, false);
        });
      });
    });

    describe('Test filtering requests using metadata', () => {
      const provider = new NodeTracerProvider({
        spanProcessors: [new SimpleSpanProcessor(memoryExporter)],
      });
      beforeEach(() => {
        memoryExporter.reset();
      });

      before(async () => {
        plugin.disable();
        plugin.setTracerProvider(provider);
        plugin.setConfig({});
        plugin.enable();

        const packageDefinition = await protoLoader.load(PROTO_PATH, options);
        const proto = loadPackageDefinition(packageDefinition).pkg_test;

        server = await startServer(proto, grpcPort);
        client = createClient(proto);
      });

      after(done => {
        client.close();
        server.tryShutdown(() => {
          plugin.disable();
          done();
        });
      });
    });

    describe('Test filtering requests using options', () => {
      const provider = new NodeTracerProvider({
        spanProcessors: [new SimpleSpanProcessor(memoryExporter)],
      });
      const checkSpans: { [key: string]: boolean } = {
        unaryMethod: false,
        UnaryMethod: false,
        camelCaseMethod: false,
        ClientStreamMethod: true,
        ServerStreamMethod: true,
        BidiStreamMethod: false,
      };
      beforeEach(() => {
        memoryExporter.reset();
      });

      before(async () => {
        const config = {
          ignoreGrpcMethods: [
            'UnaryMethod',
            new RegExp(/^camel.*Method$/),
            (str: string) => str === 'BidiStreamMethod',
          ],
        };
        plugin.disable();
        plugin.setConfig(config);
        plugin.setTracerProvider(provider);
        plugin.enable();

        const packageDefinition = await protoLoader.load(PROTO_PATH, options);
        const proto = loadPackageDefinition(packageDefinition).pkg_test;

        server = await startServer(proto, grpcPort);
        client = createClient(proto);
      });

      after(done => {
        client.close();
        server.tryShutdown(() => {
          plugin.disable();
          done();
        });
      });

      methodList.map(method => {
        describe(`Test should ${
          checkSpans[method.methodName] ? '' : 'not '
        }create spans for grpc remote method ${method.methodName}`, () => {
          runTest(method, provider, checkSpans[method.methodName]);
        });
      });
    });

    describe('Test assigning properties from original client method to patched client method', () => {
      before(async () => {
        plugin.disable();
        plugin.setConfig({});
        plugin.enable();

        const packageDefinition = await protoLoader.load(PROTO_PATH, options);
        const proto = loadPackageDefinition(packageDefinition).pkg_test;

        client = createClient(proto);
      });

      after(done => {
        client.close();
        server.tryShutdown(() => {
          plugin.disable();
          done();
        });
      });

      methodList.map(method => {
        runClientMethodTest(method);
      });
    });

    describe('Test capturing metadata', () => {
      const provider = new NodeTracerProvider({
        spanProcessors: [new SimpleSpanProcessor(memoryExporter)],
      });

      const clientMetadata = new Metadata();
      clientMetadata.add('client_metadata_key', 'client_metadata_value');

      const customMetadataMethod: TestGrpcCall = {
        description: 'unary call with metadata',
        methodName: 'unaryMethodWithMetadata',
        method: grpcClient.unaryMethodWithMetadata,
        request: requestList[0],
        result: requestList[0],
        metadata: clientMetadata,
      };

      beforeEach(() => {
        memoryExporter.reset();
      });

      before(async () => {
        plugin.disable();
        plugin.setConfig({
          metadataToSpanAttributes: {
            client: {
              requestMetadata: ['client_metadata_key'],
              responseMetadata: ['server_metadata_key'],
            },
            server: {
              requestMetadata: ['client_metadata_key'],
              responseMetadata: ['server_metadata_key'],
            },
          },
        });

        plugin.setTracerProvider(provider);
        plugin.enable();

        const packageDefinition = await protoLoader.load(PROTO_PATH, options);
        const proto = loadPackageDefinition(packageDefinition).pkg_test;

        server = await startServer(proto, grpcPort);
        client = createClient(proto);
      });

      after(done => {
        client.close();
        server.tryShutdown(() => {
          plugin.disable();
          done();
        });
      });

      describe('Capture request/response metadata in client and server spans', () => {
        const attributeValidation = {
          clientAttributes: {
            'rpc.request.metadata.client_metadata_key': 'client_metadata_value',
            'rpc.response.metadata.server_metadata_key':
              'server_metadata_value',
          },
          serverAttributes: {
            'rpc.request.metadata.client_metadata_key': 'client_metadata_value',
            'rpc.response.metadata.server_metadata_key':
              'server_metadata_value',
          },
        };

        runTestWithAttributeValidation(
          customMetadataMethod,
          provider,
          true,
          attributeValidation
        );
      });
    });
  });
};
