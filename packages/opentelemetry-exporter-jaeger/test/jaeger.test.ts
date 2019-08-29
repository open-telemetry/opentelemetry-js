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

import * as assert from 'assert';
import { JaegerExporter } from '../src';
import { NoopLogger } from '@opentelemetry/core';
import * as types from '@opentelemetry/types';
import { ThriftProcess, SenderCallback, UDPSender } from '../src/types';
import { ExportResult, ReadableSpan } from '@opentelemetry/basic-tracer';

describe('JaegerExporter', () => {
  describe('constructor', () => {
    it('should construct an exporter', () => {
      const exporter = new JaegerExporter({ serviceName: 'opentelemetry' });
      assert.ok(typeof exporter.export === 'function');
      assert.ok(typeof exporter.shutdown === 'function');
      const process: ThriftProcess = exporter['_sender']._process;
      assert.strictEqual(process.serviceName, 'opentelemetry');
      assert.strictEqual(process.tags.length, 0);
    });

    it('should construct an exporter with host, port, logger and tags', () => {
      const exporter = new JaegerExporter({
        serviceName: 'opentelemetry',
        host: 'localhost',
        port: 8080,
        logger: new NoopLogger(),
        tags: [{ key: 'opentelemetry-exporter-jaeger', value: '0.0.1' }],
      });
      assert.ok(typeof exporter.export === 'function');
      assert.ok(typeof exporter.shutdown === 'function');

      const process: ThriftProcess = exporter['_sender']._process;
      assert.strictEqual(process.serviceName, 'opentelemetry');
      assert.strictEqual(process.tags.length, 1);
      assert.strictEqual(process.tags[0].key, 'opentelemetry-exporter-jaeger');
      assert.strictEqual(process.tags[0].vType, 'STRING');
      assert.strictEqual(process.tags[0].vStr, '0.0.1');
    });
  });

  describe('export', () => {
    let exporter: JaegerExporter;
    beforeEach(() => {
      exporter = new JaegerExporter({
        serviceName: 'opentelemetry',
      });
      mockUDPSender(exporter);
    });

    afterEach(() => {
      exporter.shutdown();
    });

    it('should skip send with empty list', () => {
      exporter.export([], (result: ExportResult) => {
        assert.strictEqual(result, ExportResult.Success);
      });
    });

    it('should send spans to Jaeger backend and return with Success', () => {
      const spanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
      };
      const readableSpan: ReadableSpan = {
        name: 'my-span1',
        kind: types.SpanKind.CLIENT,
        spanContext,
        startTime: 1566156729709,
        endTime: 1566156729709 + 2000,
        status: {
          code: types.CanonicalCode.DATA_LOSS,
        },
        attributes: {},
        links: [],
        events: [],
      };

      exporter.export([readableSpan], (result: ExportResult) => {
        assert.strictEqual(result, ExportResult.Success);
      });
    });
  });
});

function mockUDPSender(exporter: JaegerExporter) {
  // Get the process of the current sender and pass to the mock sender. The
  // process is constructed and attached to the sender at exporter construction
  // time at initialization time, so there is no way to intercept the process.
  const process: ThriftProcess = exporter['_sender']._process;

  exporter['_sender'] = new MockedUDPSender();
  exporter['_sender'].setProcess(process);
}

class MockedUDPSender extends UDPSender {
  // tslint:disable-next-line:no-any
  queue: any = [];

  // Holds the initialized process information. Name matches the associated
  // UDPSender property.
  _process: ThriftProcess = {
    serviceName: 'opentelemetry',
    tags: [],
  };

  setProcess(process: ThriftProcess): void {
    this._process = process;
  }

  // tslint:disable-next-line:no-any
  append(span: any, callback?: SenderCallback): void {
    this.queue.push(span);
    if (callback) {
      callback(0);
    }
  }

  flush(callback?: SenderCallback): void {
    if (callback) {
      callback(this.queue.length);
      this.queue = [];
    }
  }

  close(): void {}
}
