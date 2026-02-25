/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { GrpcInstrumentation } from '../src';

const instrumentation = new GrpcInstrumentation();
instrumentation.enable();
instrumentation.disable();

import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import * as grpc from '@grpc/grpc-js';
import { GrpcTesterClient } from './proto/ts/fixtures/grpc-test.client';
import {
  InMemorySpanExporter,
  NodeTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import * as assert from 'assert';
import {
  context,
  ContextManager,
  propagation,
  SpanKind,
  trace,
} from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { startServer } from './helper';
import {
  assertExportedSpans,
  assertNoSpansExported,
  SpanAssertionFunction,
  TestFunction,
} from './protobuf-ts-utils';

const memoryExporter = new InMemorySpanExporter();
const PROTO_PATH = path.resolve(__dirname, './fixtures/grpc-test.proto');
const NO_ERROR = grpc.status.UNAUTHENTICATED + 1;

/**
 * Creates a client generated via protobuf-ts that is using the {@link grpc.Client} class
 * directly.
 */
function createClient() {
  return new GrpcTesterClient(
    new GrpcTransport({
      host: 'localhost:3333',
      channelCredentials: grpc.credentials.createInsecure(),
    })
  );
}

/**
 * Loads the server from proto and starts it on port 3333.
 */
async function loadAndStartServer() {
  const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  };

  // Reloading from proto is needed as only servers loaded after the
  // instrumentation is enabled will be instrumented.
  const packageDefinition = await protoLoader.load(PROTO_PATH, options);
  const proto = grpc.loadPackageDefinition(packageDefinition).pkg_test;
  return startServer(proto, 3333);
}

/**
 * Creates a list of test data that includes all possible cases of status codes
 * returned by the server, the input for the server to provoke the status codes,
 * and the expected result code that should be present on the span.
 */
function getStatusCodeTestData(): {
  // Name of the key used in the test (OK, UNAUTHENTICATED, DATA_LOSS, ...)
  key: string;
  // Input for the server implementation that will provoke the status code from 'key'
  input: number;
  // The result code that should be present on the created span
  expectedResultCode: number;
}[] {
  const codes = Object.keys(grpc.status)
    .filter(key => !isNaN(Number(grpc.status[key as any])))
    // Remove 'OK' as the test server has special behavior to provoke an 'OK' response
    .filter(key => key !== 'OK')
    // Create the test data
    .map(key => {
      return {
        key: key,
        input: Number(grpc.status[key as any]),
        expectedResultCode: Number(grpc.status[key as any]),
      };
    });

  // Push 'OK' with special input to provoke 'OK' response from test-server
  codes.push({
    key: 'OK',
    input: NO_ERROR,
    expectedResultCode: grpc.status.OK,
  });

  return codes;
}

/**
 * Creates tests that assert that no spans are created.
 * @param statusCodeTestWithRootSpan function that creates tests that include a root span
 * @param statusCodeTestNoRootSpan function that creates tests that do not include a root span
 */
function shouldNotCreateSpans(
  statusCodeTestWithRootSpan: TestFunction,
  statusCodeTestNoRootSpan: TestFunction
) {
  describe('with root span', () => {
    getStatusCodeTestData().forEach(({ key, input, expectedResultCode }) => {
      statusCodeTestWithRootSpan(
        input,
        key,
        expectedResultCode,
        assertNoSpansExported
      );
    });
  });

  describe('without root span', () => {
    getStatusCodeTestData().forEach(({ key, input, expectedResultCode }) => {
      statusCodeTestNoRootSpan(
        input,
        key,
        expectedResultCode,
        assertNoSpansExported
      );
    });
  });
}

describe('#grpc-protobuf', () => {
  let client: GrpcTesterClient;
  let server: grpc.Server;
  let contextManager: ContextManager;
  const provider = new NodeTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(memoryExporter)],
  });

  before(() => {
    propagation.setGlobalPropagator(new W3CTraceContextPropagator());
    instrumentation.setTracerProvider(provider);
  });

  beforeEach(() => {
    memoryExporter.reset();
    contextManager = new AsyncHooksContextManager().enable();
    context.setGlobalContextManager(contextManager);
  });

  describe('client', async () => {
    beforeEach(async () => {
      instrumentation.enable();
      client = createClient();

      server = await loadAndStartServer();
    });

    afterEach(done => {
      context.disable();
      server.tryShutdown(() => {
        instrumentation.disable();
        done();
      });
    });

    describe('makeUnaryRequest()', async () => {
      async function act(status: number) {
        return client.unaryMethod({
          num: status,
        });
      }

      function statusCodeTestNoRootSpan(
        input: number,
        key: string,
        expectedSpanStatus: number,
        assertSpans: SpanAssertionFunction
      ) {
        it('with status code: ' + key, async () => {
          // Act
          try {
            const request = await act(input);
            // Assert success results
            assert.strictEqual(request.response.num, input);
          } catch (e) {
            // Assert failure results
            assert.strictEqual(e.code, key);
          }
          // Assert span data
          assertSpans(
            memoryExporter,
            'pkg_test.GrpcTester',
            'UnaryMethod',
            expectedSpanStatus
          );
        });
      }

      function statusCodeTestWithRootSpan(
        input: number,
        key: string,
        expectedResultCode: number,
        assertSpans: SpanAssertionFunction
      ) {
        it('with status code: ' + key, async () => {
          // Arrange
          const span = provider
            .getTracer('default')
            .startSpan('TestSpan', { kind: SpanKind.PRODUCER });
          return context.with(
            trace.setSpan(context.active(), span),
            async () => {
              const rootSpan = trace.getSpan(context.active());
              assert.ok(rootSpan != null);
              assert.deepStrictEqual(rootSpan, span);

              // Act
              try {
                const request = await act(input);
                // Assert success results
                assert.strictEqual(request.response.num, input);
              } catch (e) {
                // Assert failure results
                assert.strictEqual(e.code, key);
              }

              // Assert
              assertSpans(
                memoryExporter,
                'pkg_test.GrpcTester',
                'UnaryMethod',
                expectedResultCode,
                rootSpan
              );
            }
          );
        });
      }

      describe('should create root client span and server child span', () => {
        getStatusCodeTestData().forEach(
          ({ key, input, expectedResultCode }) => {
            statusCodeTestNoRootSpan(
              input,
              key,
              expectedResultCode,
              assertExportedSpans
            );
          }
        );
      });

      describe('should create child client span when parent span exists', () => {
        getStatusCodeTestData().forEach(
          ({ key, input, expectedResultCode }) => {
            statusCodeTestWithRootSpan(
              input,
              key,
              expectedResultCode,
              assertExportedSpans
            );
          }
        );
      });

      describe('should not create any spans when disabled', () => {
        beforeEach(done => {
          instrumentation.disable();
          server.tryShutdown(() => {
            loadAndStartServer().then(loadedServer => {
              server = loadedServer;
              done();
            });
          });
        });

        afterEach(() => {
          instrumentation.enable();
        });

        shouldNotCreateSpans(
          statusCodeTestWithRootSpan,
          statusCodeTestNoRootSpan
        );
      });
    });

    describe('makeClientStreamRequest()', () => {
      async function act(input: number) {
        const call = client.clientStreamMethod({
          num: input,
        });

        await call.requests.send({ num: input });
        await call.requests.send({ num: input });
        await call.requests.complete();

        return await call.response;
      }

      async function statusCodeTestNoRootSpan(
        input: number,
        key: string,
        expectedSpanStatus: number,
        assertSpans: SpanAssertionFunction
      ) {
        it('with status code: ' + key, async () => {
          // Act
          try {
            const response = await act(input);
            // Assert success results
            assert.strictEqual(response.num, input * 2);
          } catch (e) {
            // Assert failure results
            assert.strictEqual(e.code, key);
          }

          assertSpans(
            memoryExporter,
            'pkg_test.GrpcTester',
            'ClientStreamMethod',
            expectedSpanStatus
          );
        });
      }

      async function statusCodeTestWithRootSpan(
        input: number,
        key: string,
        expectedSpanStatus: number,
        assertSpans: SpanAssertionFunction
      ) {
        it('with status code: ' + key, async () => {
          // Arrange
          const span = provider
            .getTracer('default')
            .startSpan('TestSpan', { kind: SpanKind.PRODUCER });
          return context.with(
            trace.setSpan(context.active(), span),
            async () => {
              const rootSpan = trace.getSpan(context.active());
              assert.ok(rootSpan != null);
              assert.deepStrictEqual(rootSpan, span);

              // Act
              try {
                const response = await act(input);
                // Assert success results
                assert.strictEqual(response.num, input * 2);
              } catch (e) {
                // Assert failure results
                assert.strictEqual(e.code, key);
              }

              // Assert
              assertSpans(
                memoryExporter,
                'pkg_test.GrpcTester',
                'ClientStreamMethod',
                expectedSpanStatus,
                rootSpan
              );
            }
          );
        });
      }

      describe('should create root client span and server child span', () => {
        getStatusCodeTestData().forEach(
          ({ key, input, expectedResultCode }) => {
            statusCodeTestNoRootSpan(
              input,
              key,
              expectedResultCode,
              assertExportedSpans
            );
          }
        );
      });

      describe('should create child client span when parent span exists', () => {
        getStatusCodeTestData().forEach(
          ({ key, input, expectedResultCode }) => {
            statusCodeTestWithRootSpan(
              input,
              key,
              expectedResultCode,
              assertExportedSpans
            );
          }
        );
      });

      describe('should not create any spans when disabled', () => {
        beforeEach(done => {
          instrumentation.disable();
          server.tryShutdown(() => {
            loadAndStartServer().then(loadedServer => {
              server = loadedServer;
              done();
            });
          });
        });

        afterEach(() => {
          instrumentation.enable();
        });

        shouldNotCreateSpans(
          statusCodeTestWithRootSpan,
          statusCodeTestNoRootSpan
        );
      });
    });

    describe('makeServerStreamRequest()', () => {
      function statusCodeTestNoRootSpan(
        input: number,
        key: string,
        expectedSpanStatus: number,
        assertSpans: SpanAssertionFunction
      ) {
        it('with status code: ' + key, done => {
          const serverStream = client.serverStreamMethod({
            num: input,
          });

          serverStream.responses.onMessage(message => {
            assert.strictEqual(message.num, input);
          });

          function completeCallback() {
            try {
              assertSpans(
                memoryExporter,
                'pkg_test.GrpcTester',
                'ServerStreamMethod',
                expectedSpanStatus
              );
            } catch (err) {
              // catch error and call done() to ensure an error message
              // is shown in the test results instead of a test timeout
              done(err);
              return;
            }
            done();
          }

          serverStream.responses.onError(completeCallback);
          serverStream.responses.onComplete(completeCallback);
        });
      }

      function statusCodeTestWithRootSpan(
        input: number,
        key: string,
        expectedSpanStatus: number,
        assertSpans: SpanAssertionFunction
      ) {
        it('with status code: ' + key, done => {
          // Arrange
          const span = provider
            .getTracer('default')
            .startSpan('TestSpan', { kind: SpanKind.PRODUCER });
          context.with(trace.setSpan(context.active(), span), async () => {
            const rootSpan = trace.getSpan(context.active());
            assert.ok(rootSpan != null);
            assert.deepStrictEqual(rootSpan, span);

            // Act
            const serverStream = client.serverStreamMethod({
              num: input,
            });

            serverStream.responses.onMessage(message => {
              assert.strictEqual(message.num, input);
            });

            function completeCallback() {
              try {
                // Assert
                assertSpans(
                  memoryExporter,
                  'pkg_test.GrpcTester',
                  'ServerStreamMethod',
                  expectedSpanStatus,
                  rootSpan
                );
              } catch (err) {
                // catch error and call done() to ensure an error message
                // is shown in the test results instead of a test timeout
                done(err);
                return;
              }
              done();
            }

            serverStream.responses.onError(completeCallback);
            serverStream.responses.onComplete(completeCallback);
          });
        });
      }

      describe('should create root client span and server child span', () => {
        getStatusCodeTestData().forEach(
          ({ key, input, expectedResultCode }) => {
            statusCodeTestNoRootSpan(
              input,
              key,
              expectedResultCode,
              assertExportedSpans
            );
          }
        );
      });

      describe('should create child client span when parent span exists', () => {
        getStatusCodeTestData().forEach(
          ({ key, input, expectedResultCode }) => {
            statusCodeTestWithRootSpan(
              input,
              key,
              expectedResultCode,
              assertExportedSpans
            );
          }
        );
      });

      describe('should not create any spans when disabled', () => {
        beforeEach(done => {
          instrumentation.disable();
          server.tryShutdown(() => {
            loadAndStartServer().then(loadedServer => {
              server = loadedServer;
              done();
            });
          });
        });

        afterEach(() => {
          instrumentation.enable();
        });

        shouldNotCreateSpans(
          statusCodeTestWithRootSpan,
          statusCodeTestNoRootSpan
        );
      });
    });

    describe('makeBidiStreamRequest()', () => {
      function statusCodeTestNoRootSpan(
        input: number,
        key: string,
        expectedSpanStatus: number,
        assertSpans: SpanAssertionFunction
      ) {
        it('with status code: ' + key, done => {
          const bidiStream = client.bidiStreamMethod();

          bidiStream.responses.onMessage(message => {
            assert.strictEqual(message.num, input);
          });

          function completeHandler() {
            try {
              assertSpans(
                memoryExporter,
                'pkg_test.GrpcTester',
                'BidiStreamMethod',
                expectedSpanStatus
              );
            } catch (err) {
              // catch error and call done() to ensure an error message
              // is shown in the test results instead of a test timeout
              done(err);
              return;
            }
            done();
          }

          bidiStream.responses.onError(completeHandler);
          bidiStream.responses.onComplete(completeHandler);

          bidiStream.requests.send({
            num: input,
          });
          bidiStream.requests.send({
            num: input,
          });
          bidiStream.requests.complete();
        });
      }

      function statusCodeTestWithRootSpan(
        input: number,
        key: string,
        expectedSpanStatus: number,
        assertSpans: SpanAssertionFunction
      ) {
        it('with status code: ' + key, done => {
          // Arrange
          const span = provider
            .getTracer('default')
            .startSpan('TestSpan', { kind: SpanKind.PRODUCER });
          context.with(trace.setSpan(context.active(), span), () => {
            const rootSpan = trace.getSpan(context.active());
            assert.ok(rootSpan != null);
            assert.deepStrictEqual(rootSpan, span);

            // Act
            const bidiStream = client.bidiStreamMethod();

            function completeHandler() {
              try {
                assertSpans(
                  memoryExporter,
                  'pkg_test.GrpcTester',
                  'BidiStreamMethod',
                  expectedSpanStatus,
                  rootSpan
                );
              } catch (err) {
                // catch error and call done() to ensure an error message
                // is shown in the test results instead of a test timeout
                done(err);
                return;
              }
              done();
            }

            bidiStream.responses.onMessage(message => {
              assert.strictEqual(message.num, input);
            });

            bidiStream.responses.onError(completeHandler);
            bidiStream.responses.onComplete(completeHandler);

            bidiStream.requests.send({
              num: input,
            });
            bidiStream.requests.send({
              num: input,
            });
            bidiStream.requests.complete();
          });
        });
      }

      describe('should create root client span and server child span', () => {
        getStatusCodeTestData().forEach(
          ({ key, input, expectedResultCode }) => {
            statusCodeTestNoRootSpan(
              input,
              key,
              expectedResultCode,
              assertExportedSpans
            );
          }
        );
      });

      describe('should create child client span when parent span exists', () => {
        getStatusCodeTestData().forEach(
          ({ key, input, expectedResultCode }) => {
            statusCodeTestWithRootSpan(
              input,
              key,
              expectedResultCode,
              assertExportedSpans
            );
          }
        );
      });

      describe('should not create any spans when disabled', () => {
        beforeEach(done => {
          instrumentation.disable();
          server.tryShutdown(() => {
            loadAndStartServer().then(loadedServer => {
              server = loadedServer;
              done();
            });
          });
        });

        afterEach(() => {
          instrumentation.enable();
        });

        shouldNotCreateSpans(
          statusCodeTestWithRootSpan,
          statusCodeTestNoRootSpan
        );
      });
    });
  });

  describe('should not produce telemetry when ignored via config', () => {
    beforeEach(async () => {
      instrumentation.disable();
      instrumentation.setConfig({
        ignoreGrpcMethods: [
          'UnaryMethod',
          new RegExp(/^camel.*Method$/),
          (str: string) => str === 'BidiStreamMethod',
        ],
      });
      instrumentation.enable();
      client = createClient();

      server = await loadAndStartServer();
    });

    it('when filtered by exact string', async () => {
      await client.unaryMethod({ num: NO_ERROR });
      assertNoSpansExported(
        memoryExporter,
        'pkg_test.GrpcTester',
        'UnaryMethod',
        grpc.status.OK
      );
    });

    it('when filtered by RegExp', async () => {
      await client.camelCaseMethod({ num: NO_ERROR });
      assertNoSpansExported(
        memoryExporter,
        'pkg_test.GrpcTester',
        'UnaryMethod',
        grpc.status.OK
      );
    });

    it('when filtered by predicate', done => {
      const stream = client.bidiStreamMethod({ num: NO_ERROR });
      stream.requests.send({
        num: NO_ERROR,
      });
      stream.requests.complete();

      stream.responses.onComplete(() => {
        assertNoSpansExported(
          memoryExporter,
          'pkg_test.GrpcTester',
          'UnaryMethod',
          grpc.status.OK
        );
        done();
      });
    });

    afterEach(done => {
      instrumentation.setConfig({});
      context.disable();
      server.tryShutdown(() => {
        instrumentation.disable();
        done();
      });
    });
  });

  describe('should capture metadata when set up in config', () => {
    beforeEach(async () => {
      instrumentation.setConfig({
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
      instrumentation.enable();
      client = createClient();

      server = await loadAndStartServer();
    });

    it('should capture client metadata', async () => {
      await client.unaryMethod(
        { num: NO_ERROR },
        {
          meta: {
            client_metadata_key: 'client_metadata_value',
          },
        }
      );
      const spans = memoryExporter.getFinishedSpans();
      assert.equal(
        spans[0].attributes['rpc.request.metadata.client_metadata_key'],
        'client_metadata_value'
      );
    });

    afterEach(done => {
      instrumentation.setConfig({});
      context.disable();
      server.tryShutdown(() => {
        instrumentation.disable();
        done();
      });
    });
  });
});
