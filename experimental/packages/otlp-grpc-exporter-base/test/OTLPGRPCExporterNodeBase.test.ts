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

import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import { OTLPGRPCExporterNodeBase } from '../src/OTLPGRPCExporterNodeBase';
import { OTLPGRPCExporterConfigNode } from '../src/types';
import { mockedReadableSpan } from './traceHelper';
import { ExportResponse, ExportResponseSuccess } from '../src/export-response';
import { IExporterTransport } from '../src/exporter-transport';
import { ISerializer } from '../src';
import sinon = require('sinon');

class MockCollectorExporter extends OTLPGRPCExporterNodeBase<
  ReadableSpan,
  ReadableSpan[],
  any
> {
  getDefaultUrl(config: OTLPGRPCExporterConfigNode): string {
    return '';
  }

  convert(spans: ReadableSpan[]): ReadableSpan[] {
    return spans;
  }

  getUrlFromConfig(config: OTLPGRPCExporterConfigNode): string {
    return '';
  }
}

const successfulResponse: ExportResponseSuccess = {
  status: 'success',
};

describe('OTLPGRPCExporterNodeBase', () => {
  let exporter: MockCollectorExporter;
  const concurrencyLimit = 5;

  beforeEach(done => {
    const transportStubs = {
      // make transport succeed
      send: sinon.stub().resolves(successfulResponse),
      shutdown: sinon.stub(),
    };
    const mockTransport = <IExporterTransport>transportStubs;
    const signalSpecificMetadata: Record<string, string> = {
      key: 'signal-specific-metadata',
    };

    const serializerStubs = {
      serializeRequest: sinon.stub().resolves(Buffer.from([1, 2, 3])),
      deserializeResponse: sinon
        .stub()
        .resolves({ responseKey: 'responseValue' }),
    };

    const serializer = <ISerializer<ReadableSpan[], any>>serializerStubs;

    exporter = new MockCollectorExporter(
      { concurrencyLimit },
      signalSpecificMetadata,
      'grpcName',
      'grpcPath',
      serializer
    );

    exporter['_transport'] = mockTransport;
    done();
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('export', () => {
    it('should export requests concurrently', async () => {
      const sendResolveFunctions: ((response: ExportResponse) => void)[] = [];
      const transportStubs = {
        send: sinon.stub().returns(
          new Promise(resolve => {
            sendResolveFunctions.push(resolve);
          })
        ),
        shutdown: sinon.stub(),
      };
      exporter['_transport'] = <IExporterTransport>transportStubs;

      const spans = [Object.assign({}, mockedReadableSpan)];
      const numToExport = concurrencyLimit;

      for (let i = 0; i < numToExport; ++i) {
        exporter.export(spans, () => {});
      }

      assert.strictEqual(exporter['_sendingPromises'].length, numToExport);
      const promisesAllDone = Promise.all(exporter['_sendingPromises']);
      // Mock that all requests finish sending
      sendResolveFunctions.forEach(resolve => resolve(successfulResponse));

      // All finished promises should be popped off
      await promisesAllDone;
      assert.strictEqual(exporter['_sendingPromises'].length, 0);
    });

    it('should drop new export requests when already sending at concurrencyLimit', async () => {
      const sendResolveFunctions: ((response: ExportResponse) => void)[] = [];
      const transportStubs = {
        send: sinon.stub().returns(
          new Promise(resolve => {
            sendResolveFunctions.push(resolve);
          })
        ),
        shutdown: sinon.stub(),
      };
      exporter['_transport'] = <IExporterTransport>transportStubs;

      const spans = [Object.assign({}, mockedReadableSpan)];
      const numToExport = concurrencyLimit + 5;

      for (let i = 0; i < numToExport; ++i) {
        exporter.export(spans, () => {});
      }

      assert.strictEqual(exporter['_sendingPromises'].length, concurrencyLimit);
      const promisesAllDone = Promise.all(exporter['_sendingPromises']);
      // Mock that all requests finish sending
      sendResolveFunctions.forEach(resolve => resolve(successfulResponse));

      // All finished promises should be popped off
      await promisesAllDone;
      assert.strictEqual(exporter['_sendingPromises'].length, 0);
    });

    it('should pop export request promises even if they failed', async () => {
      const sendRejectFunctions: ((error: Error) => void)[] = [];
      const transportStubs = {
        send: sinon.stub().returns(
          new Promise((_, reject) => {
            sendRejectFunctions.push(reject);
          })
        ),
        shutdown: sinon.stub(),
      };
      exporter['_transport'] = <IExporterTransport>transportStubs;

      const spans = [Object.assign({}, mockedReadableSpan)];

      exporter.export(spans, () => {});
      assert.strictEqual(exporter['_sendingPromises'].length, 1);
      const promisesAllDone = Promise.all(exporter['_sendingPromises']);
      // Mock that all requests fail sending
      sendRejectFunctions.forEach(reject => reject(new Error('export failed')));

      // All finished promises should be popped off
      await promisesAllDone;
      assert.strictEqual(exporter['_sendingPromises'].length, 0);
    });

    it('should pop export request promises even if resolve throws error', async () => {
      const transportStubs = {
        send: sinon.stub().returns(
          new Promise(_ => {
            throw new Error('this failed');
          })
        ),
        shutdown: sinon.stub(),
      };
      exporter['_transport'] = <IExporterTransport>transportStubs;

      const spans = [Object.assign({}, mockedReadableSpan)];
      exporter.export(spans, () => {});

      assert.strictEqual(exporter['_sendingPromises'].length, 1);

      const promisesAllDone = Promise.all(exporter['_sendingPromises'])
        // catch expected unhandled exception
        .catch(() => {});

      // All finished promises should be popped off
      await promisesAllDone;
      assert.strictEqual(exporter['_sendingPromises'].length, 0);
    });
  });

  describe('shutdown', function () {
    it('calls shutdown on transport', function () {
      const transportStubs = {
        send: sinon.stub(),
        shutdown: sinon.stub(),
      };
      exporter['_transport'] = <IExporterTransport>transportStubs;
      exporter.shutdown();
      sinon.assert.calledOnce(transportStubs.shutdown);
    });
  });
});
