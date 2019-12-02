/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { NoopLogger, NoopTracer } from '@opentelemetry/core';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import { SpanKind, Tracer } from '@opentelemetry/types';
import { NodeTracer } from '@opentelemetry/node';

import { assertSpan, assertPropagation } from './utils/assertionUtils';
import { GrpcPlugin, plugin } from '../src';
import { SendUnaryDataCallback } from '../src/types';

import * as assert from 'assert';
import * as semver from 'semver';
import * as grpc from 'grpc';
import * as sinon from 'sinon';

const PROTO_PATH = __dirname + '/fixtures/grpc-test.proto';
const memoryExporter = new InMemorySpanExporter();

type GrpcModule = typeof grpc;
const MAX_ERROR_STATUS = grpc.status.UNAUTHENTICATED;

interface TestRequestResponse {
  num: number;
}

type TestGrpcClient = grpc.Client & {
  // tslint:disable-next-line:no-any
  unaryMethod: any;
  // tslint:disable-next-line:no-any
  clientStreamMethod: any;
  // tslint:disable-next-line:no-any
  serverStreamMethod: any;
  // tslint:disable-next-line:no-any
  bidiStreamMethod: any;
};

// Compare two arrays using an equal function f
// tslint:disable-next-line:no-any
const arrayIsEqual = (f: any) => ([x, ...xs]: any) => ([y, ...ys]: any): any =>
  x === undefined && y === undefined
    ? true
    : Boolean(f(x)(y)) && arrayIsEqual(f)(xs)(ys);

// Return true if two requests has the same num value
const requestEqual = (x: TestRequestResponse) => (y: TestRequestResponse) =>
  x.num !== undefined && x.num === y.num;

// Check if its equal requests or array of requests
const checkEqual = (x: TestRequestResponse | TestRequestResponse[]) => (
  y: TestRequestResponse | TestRequestResponse[]
) =>
  x instanceof Array && y instanceof Array
    ? // tslint:disable-next-line:no-any
      arrayIsEqual(requestEqual)(x as any)(y as any)
    : !(x instanceof Array) && !(y instanceof Array)
    ? requestEqual(x)(y)
    : false;

const grpcClient = {
  unaryMethod: (
    client: TestGrpcClient,
    request: TestRequestResponse
  ): Promise<TestRequestResponse> => {
    return new Promise((resolve, reject) => {
      return client.unaryMethod(
        request,
        (err: grpc.ServiceError, response: TestRequestResponse) => {
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
    request: TestRequestResponse[]
  ): Promise<TestRequestResponse> => {
    return new Promise((resolve, reject) => {
      const writeStream = client.clientStreamMethod(
        (err: grpc.ServiceError, response: TestRequestResponse) => {
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
    request: TestRequestResponse
  ): Promise<TestRequestResponse[]> => {
    return new Promise((resolve, reject) => {
      const result: TestRequestResponse[] = [];
      const readStream = client.serverStreamMethod(request);

      readStream.on('data', (data: TestRequestResponse) => {
        result.push(data);
      });
      readStream.on('error', (err: grpc.ServiceError) => {
        reject(err);
      });
      readStream.on('end', () => {
        resolve(result);
      });
    });
  },

  bidiStreamMethod: (
    client: TestGrpcClient,
    request: TestRequestResponse[]
  ): Promise<TestRequestResponse[]> => {
    return new Promise((resolve, reject) => {
      const result: TestRequestResponse[] = [];
      const bidiStream = client.bidiStreamMethod([]);

      bidiStream.on('data', (data: TestRequestResponse) => {
        result.push(data);
      });

      request.forEach(element => {
        bidiStream.write(element);
      });

      bidiStream.on('error', (err: grpc.ServiceError) => {
        reject(err);
      });

      bidiStream.on('end', () => {
        resolve(result);
      });

      bidiStream.end();
    });
  },
};

let server: grpc.Server;
let client: grpc.Client;
const grpcPort = 12345;

const replicate = (request: TestRequestResponse) => {
  const result: TestRequestResponse[] = [];
  for (let i = 0; i < request.num; i++) {
    result.push(request);
  }
  return result;
};

// tslint:disable-next-line:no-any
function startServer(grpc: GrpcModule, proto: any) {
  const server = new grpc.Server();

  function getError(msg: string, code: number): grpc.ServiceError {
    const err: grpc.ServiceError = new Error(msg);
    err.name = msg;
    err.message = msg;
    err.code = code;
    return err;
  }

  server.addService(proto.GrpcTester.service, {
    // An error is emitted every time
    // request.num <= MAX_ERROR_STATUS = (status.UNAUTHENTICATED)
    // in those cases, erro.code = request.num

    // This method returns the request
    unaryMethod(
      // tslint:disable-next-line:no-any
      call: grpc.ServerUnaryCall<any>,
      callback: SendUnaryDataCallback
    ) {
      call.request.num <= MAX_ERROR_STATUS
        ? callback(getError('Unary Method Error', call.request.num))
        : callback(null, { num: call.request.num });
    },

    // This method sum the requests
    clientStreamMethod(
      // tslint:disable-next-line:no-any
      call: grpc.ServerReadableStream<any>,
      callback: SendUnaryDataCallback
    ) {
      let sum = 0;
      let hasError = false;
      let code = grpc.status.OK;
      call.on('data', (data: TestRequestResponse) => {
        sum += data.num;
        if (data.num <= MAX_ERROR_STATUS) {
          hasError = true;
          code = data.num;
        }
      });
      call.on('end', () => {
        hasError
          ? callback(getError('Client Stream Method Error', code))
          : callback(null, { num: sum });
      });
    },

    // This method returns an array that replicates the request, request.num of
    // times
    // tslint:disable-next-line:no-any
    serverStreamMethod: (call: grpc.ServerWriteableStream<any>) => {
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
    // tslint:disable-next-line:no-any
    bidiStreamMethod: (call: grpc.ServerDuplexStream<any, any>) => {
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
  server.bind('localhost:' + grpcPort, grpc.ServerCredentials.createInsecure());
  server.start();
  return server;
}

// tslint:disable-next-line:no-any
function createClient(grpc: GrpcModule, proto: any) {
  return new proto.GrpcTester(
    'localhost:' + grpcPort,
    grpc.credentials.createInsecure()
  );
}

describe('GrpcPlugin', () => {
  it('should return a plugin', () => {
    assert.ok(plugin instanceof GrpcPlugin);
  });

  it('should match version', () => {
    assert.ok(semver.satisfies(plugin.version, '^1.23.3'));
  });

  it('moduleName should be grpc', () => {
    assert.deepStrictEqual('grpc', plugin.moduleName);
  });

  describe('should patch client constructor makeClientConstructor() and makeGenericClientConstructor()', () => {
    const clientPatchStub = sinon.stub(
      plugin,
      '_getPatchedClientMethods' as never
    );
    after(() => {
      clientPatchStub.restore();
      plugin.disable();
    });

    it('should patch client constructor makeClientConstructor() and makeGenericClientConstructor()', () => {
      plugin.enable(grpc, new NoopTracer(), new NoopLogger());
      (plugin['_moduleExports'] as any).makeGenericClientConstructor({});
      assert.strictEqual(clientPatchStub.callCount, 1);
    });
  });

  const requestList: TestRequestResponse[] = [{ num: 100 }, { num: 50 }];
  const resultSum = {
    num: requestList.reduce((sum, x) => {
      return sum + x.num;
    }, 0),
  };
  const methodList = [
    {
      description: 'unary call',
      methodName: 'UnaryMethod',
      method: grpcClient.unaryMethod,
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

  const runTest = (
    method: typeof methodList[0],
    tracer: Tracer,
    checkSpans = true
  ) => {
    it(`should ${
      checkSpans ? 'do' : 'not'
    }: create a rootSpan for client and a childSpan for server - ${
      method.description
    }`, async () => {
      const args = [client, method.request];
      // tslint:disable-next-line:no-any
      await (method.method as any)
        .apply({}, args)
        .then((result: TestRequestResponse | TestRequestResponse[]) => {
          assert.ok(
            checkEqual(result)(method.result),
            'gRPC call returns correct values'
          );
          const spans = memoryExporter.getFinishedSpans();
          if (checkSpans) {
            const incomingSpan = spans[0];
            const outgoingSpan = spans[1];
            const validations = {
              name: `grpc.pkg_test.GrpcTester/${method.methodName}`,
              status: grpc.status.OK,
            };

            assert.strictEqual(spans.length, 2);
            assertSpan(incomingSpan, SpanKind.SERVER, validations);
            assertSpan(outgoingSpan, SpanKind.CLIENT, validations);
            assertPropagation(incomingSpan, outgoingSpan);
          } else {
            assert.strictEqual(spans.length, 0);
          }
        });
    });

    it(`should raise an error for client childSpan/server rootSpan - ${method.description} - status = OK`, () => {
      const expectEmpty = memoryExporter.getFinishedSpans();
      assert.strictEqual(expectEmpty.length, 0);

      const span = tracer.startSpan('TestSpan', { kind: SpanKind.PRODUCER });
      return tracer.withSpan(span, async () => {
        const rootSpan = tracer.getCurrentSpan();
        if (!rootSpan) {
          assert.ok(false);
          return; // return so typechecking passes for rootSpan.end()
        }
        assert.deepStrictEqual(rootSpan, span);

        const args = [client, method.request];
        // tslint:disable-next-line:no-any
        await (method.method as any)
          .apply({}, args)
          .then(() => {
            // Assert
            if (checkSpans) {
              const spans = memoryExporter.getFinishedSpans();
              assert.strictEqual(spans.length, 2);
              const serverSpan = spans[0];
              const clientSpan = spans[1];
              const validations = {
                name: `grpc.pkg_test.GrpcTester/${method.methodName}`,
                status: grpc.status.OK,
              };
              assertSpan(serverSpan, SpanKind.SERVER, validations);
              assertSpan(clientSpan, SpanKind.CLIENT, validations);
              assertPropagation(serverSpan, clientSpan);
              assert.strictEqual(
                rootSpan.context().traceId,
                serverSpan.spanContext.traceId
              );
              assert.strictEqual(
                rootSpan.context().spanId,
                clientSpan.parentSpanId
              );
            }
          })
          .catch((err: grpc.ServiceError) => {
            assert.ok(false, err);
          });
      });
    });
  };

  const insertError = (
    request: TestRequestResponse | TestRequestResponse[]
  ) => (code: number) =>
    request instanceof Array
      ? request.splice(0, 0, { num: code }) && request.slice(0, request.length)
      : { num: code };

  const runErrorTest = (
    method: typeof methodList[0],
    key: string,
    errorCode: number,
    tracer: Tracer
  ) => {
    it(`should raise an error for client/server rootSpans: method=${method.methodName}, status=${key}`, async () => {
      const expectEmpty = memoryExporter.getFinishedSpans();
      assert.strictEqual(expectEmpty.length, 0);

      const errRequest =
        method.request instanceof Array
          ? method.request.slice(0, method.request.length)
          : method.request;
      const args = [client, insertError(errRequest)(errorCode)];

      // tslint:disable-next-line:no-any
      await (method.method as any)
        .apply({}, args)
        .then(() => {
          assert.ok(false);
        })
        .catch((err: grpc.ServiceError) => {
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 2, 'Expect 2 ended spans');

          const validations = {
            name: `grpc.pkg_test.GrpcTester/${method.methodName}`,
            status: errorCode,
          };
          const serverRoot = spans[0];
          const clientRoot = spans[1];
          assertSpan(serverRoot, SpanKind.SERVER, validations);
          assertSpan(clientRoot, SpanKind.CLIENT, validations);
          assertPropagation(serverRoot, clientRoot);
        });
    });

    it(`should raise an error for client childSpan/server rootSpan - ${method.description} - status = ${key}`, () => {
      const expectEmpty = memoryExporter.getFinishedSpans();
      assert.strictEqual(expectEmpty.length, 0);

      const span = tracer.startSpan('TestSpan', { kind: SpanKind.PRODUCER });
      return tracer.withSpan(span, async () => {
        const rootSpan = tracer.getCurrentSpan();
        if (!rootSpan) {
          assert.ok(false);
          return; // return so typechecking passes for rootSpan.end()
        }
        assert.deepStrictEqual(rootSpan, span);

        const errRequest =
          method.request instanceof Array
            ? method.request.slice(0, method.request.length)
            : method.request;
        const args = [client, insertError(errRequest)(errorCode)];

        // tslint:disable-next-line:no-any
        await (method.method as any)
          .apply({}, args)
          .then(() => {
            assert.ok(false);
          })
          .catch((err: grpc.ServiceError) => {
            // Assert
            const spans = memoryExporter.getFinishedSpans();
            assert.strictEqual(spans.length, 2);
            const serverSpan = spans[0];
            const clientSpan = spans[1];
            const validations = {
              name: `grpc.pkg_test.GrpcTester/${method.methodName}`,
              status: errorCode,
            };
            assertSpan(serverSpan, SpanKind.SERVER, validations);
            assertSpan(clientSpan, SpanKind.CLIENT, validations);
            assertPropagation(serverSpan, clientSpan);
            assert.strictEqual(
              rootSpan.context().traceId,
              serverSpan.spanContext.traceId
            );
            assert.strictEqual(
              rootSpan.context().spanId,
              clientSpan.parentSpanId
            );
          });
      });
    });
  };

  describe('enable()', () => {
    const logger = new NoopLogger();
    const tracer = new NodeTracer({ logger });
    tracer.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
    beforeEach(() => {
      memoryExporter.reset();
    });

    before(() => {
      const config = {
        // TODO: add plugin options here once supported
      };
      plugin.enable(grpc, tracer, logger, config);

      const proto = grpc.load(PROTO_PATH).pkg_test;
      server = startServer(grpc, proto);
      client = createClient(grpc, proto);
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
        runTest(method, tracer);
      });
    });

    methodList.forEach(method => {
      describe(`Test error raising for grpc remote ${method.description}`, () => {
        Object.keys(grpc.status).forEach((statusKey: string) => {
          // tslint:disable-next-line:no-any
          const errorCode = Number(grpc.status[statusKey as any]);
          if (errorCode > grpc.status.OK) {
            runErrorTest(method, statusKey, errorCode, tracer);
          }
        });
      });
    });
  });

  describe('disable()', () => {
    const logger = new NoopLogger();
    const tracer = new NodeTracer({ logger });
    tracer.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
    beforeEach(() => {
      memoryExporter.reset();
    });

    before(() => {
      plugin.enable(grpc, tracer, logger);
      plugin.disable();

      const proto = grpc.load(PROTO_PATH).pkg_test;
      server = startServer(grpc, proto);
      client = createClient(grpc, proto);
    });

    after(done => {
      client.close();
      server.tryShutdown(() => {
        done();
      });
    });

    methodList.map(method => {
      describe(`Test automatic tracing for grpc remote method ${method.description}`, () => {
        runTest(method, tracer, false);
      });
    });
  });
});
