/**
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

import { NoopLogger } from '@opentelemetry/core';
import { NodeTracer } from '@opentelemetry/node-tracer';
import { AsyncHooksScopeManager } from '@opentelemetry/scope-async-hooks';
import * as assert from 'assert';
import * as grpc from 'grpc';
import { GrpcPlugin, plugin } from '../src';
import { SendUnaryDataCallback } from '../src/grpc-types';
import { assertSpan, assertPropagation } from './utils/assertionUtils';
import { SpanKind } from '@opentelemetry/types';
import { SpanAuditProcessor } from './utils/SpanAuditProcessor';
import { ProxyTracer } from './utils/ProxyTracer';

const PROTO_PATH = __dirname + '/fixtures/grpc-test.proto';
const audit = new SpanAuditProcessor();

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
    // An error is emited every time
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
        result.map(element => {
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
    assert.deepStrictEqual('1.22.2', plugin.version);
  });

  it('moduleName should be grpc', () => {
    assert.deepStrictEqual('grpc', plugin.moduleName);
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

  const runTest = function(self: any, method: typeof methodList[0], checkSpans = true) {
    it(`should ${checkSpans ? 'do' : 'not'}: create a rootSpan for client and a childSpan for server - ${method.description}`, async function() {
      const args = [client, method.request];
      // tslint:disable-next-line:no-any
      await (method.method as any)
        .apply(self, args)
        .then((result: TestRequestResponse | TestRequestResponse[]) => {
          assert.ok(
            checkEqual(result)(method.result),
            'gRPC call returns correct values'
          );
          const spans = audit.processSpans();
          if (checkSpans) {
            const incomingSpan = spans[1];
            const outgoingSpan = spans[0];
            const validations = {};

            assert.strictEqual(spans.length, 2);
            assertSpan(incomingSpan, SpanKind.SERVER, validations);
            assertSpan(outgoingSpan, SpanKind.CLIENT, validations);
            assertPropagation(incomingSpan, outgoingSpan);
          } else {
            assert.strictEqual(spans.length, 0);
          }
        });
    });
  }

  describe('enable()', () => {
    const scopeManager = new AsyncHooksScopeManager();
    const logger = new NoopLogger();
    const realTracer = new NodeTracer({
      scopeManager,
      logger,
    });
    const tracer = new ProxyTracer(realTracer, audit);
    beforeEach(() => {
      audit.reset();
    });

    before(() => {
      plugin.enable(grpc, tracer);
      plugin.options = {
        // TODO
      };

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

    methodList.map(method => {
      describe(`Test automatic tracing for grpc remote method ${method.description}`, function() {
        runTest(this, method);
      });
    });
  });

  describe('disable()', () => {
    const scopeManager = new AsyncHooksScopeManager();
    const logger = new NoopLogger();
    const realTracer = new NodeTracer({
      scopeManager,
      logger,
    });
    const tracer = new ProxyTracer(realTracer, audit);
    beforeEach(() => {
      audit.reset();
    });

    before(() => {
      plugin.enable(grpc, tracer);
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
      describe(`Test automatic tracing for grpc remote method ${method.description}`, function() {
        runTest(this, method, false);
      });
    });
  });
});
