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
import {
  createEmptyMetadata,
  createInsecureCredentials,
  createSslCredentials,
  GrpcExporterTransport,
  GrpcExporterTransportParameters,
} from '../src/grpc-exporter-transport';
import * as assert from 'assert';
import * as fs from 'fs';
import sinon = require('sinon');
import { Metadata, Server, ServerCredentials } from '@grpc/grpc-js';
import { types } from 'util';
import {
  ExportResponseFailure,
  ExportResponseSuccess,
} from '../src/export-response';

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
  timeoutMillis: 100,
  grpcPath: '/test/Export',
  grpcName: 'name',
  credentials: createInsecureCredentials,
  compression: 'none',
  address: 'localhost:1234',
};

interface ExportedData {
  request: Buffer;
  metadata: Metadata;
}

interface ServerTestContext {
  requests: ExportedData[];
  serverResponseProvider: () => { error: Error | null; buffer?: Buffer };
}

/**
 * Starts a customizable server that saves all responses to context.responses
 * Returns data as defined in context.ServerResponseProvider
 *
 * @return shutdown handle, needs to be called to ensure that mocha exits
 * @param context context for storing responses and to define server behavior.
 */
function startServer(context: ServerTestContext): Promise<() => void> {
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
      serverTestContext.serverResponseProvider = () => {
        return { error: null, buffer: Buffer.from([]) };
      };

      sinon.restore();
    });

    it('before send() does not error', function () {
      const transport = new GrpcExporterTransport(simpleClientConfig);
      transport.shutdown();

      // no assertions, just checking that it does not throw any errors.
    });

    it('calls _client.close() if client is defined', async function () {
      const transport = new GrpcExporterTransport(simpleClientConfig);
      // send something so that client is defined
      await transport.send(Buffer.from([1, 2, 3]));
      assert.ok(transport['_client'], '_client is not defined after send()');
      const closeSpy = sinon.spy(transport['_client'], 'close');

      // act
      transport.shutdown();

      // assert
      sinon.assert.calledOnce(closeSpy);
    });
  });
  describe('send', function () {
    let shutdownHandle: () => void | undefined;
    const serverTestContext: ServerTestContext = {
      requests: [],
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
      serverTestContext.serverResponseProvider = () => {
        return { error: null, buffer: Buffer.from([]) };
      };
    });

    it('sends data', async function () {
      const transport = new GrpcExporterTransport(simpleClientConfig);

      const result = (await transport.send(
        Buffer.from([1, 2, 3])
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
      const transport = new GrpcExporterTransport(simpleClientConfig);

      const result = (await transport.send(
        Buffer.from([])
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
      const transport = new GrpcExporterTransport(simpleClientConfig);

      const result = (await transport.send(
        Buffer.from([])
      )) as ExportResponseFailure;

      assert.strictEqual(result.status, 'failure');
      assert.ok(types.isNativeError(result.error));
    });

    it('forwards unhandled server error as failure', async function () {
      serverTestContext.serverResponseProvider = () => {
        throw new Error('unhandled server error');
      };
      const transport = new GrpcExporterTransport(simpleClientConfig);

      const result = (await transport.send(
        Buffer.from([])
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

      const transport = new GrpcExporterTransport(config);

      const result = (await transport.send(
        Buffer.from([])
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

      const transport = new GrpcExporterTransport(config);

      const result = (await transport.send(
        Buffer.from([])
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

      const transport = new GrpcExporterTransport(config);

      const result = (await transport.send(
        Buffer.from([])
      )) as ExportResponseFailure;
      assert.strictEqual(result.status, 'failure');
      assert.strictEqual(result.error, expectedError);
    });
  });
});
