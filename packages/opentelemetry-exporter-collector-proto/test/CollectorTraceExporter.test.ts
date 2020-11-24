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
  collectorTypes,
  CollectorExporterNodeConfigBase,
} from '@opentelemetry/exporter-collector';

import * as core from '@opentelemetry/core';
import { ReadableSpan } from '@opentelemetry/tracing';
import * as http from 'http';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { CollectorTraceExporter } from '../src';
import { getExportRequestProto } from '../src/util';

import {
  ensureExportTraceServiceRequestIsSet,
  ensureProtoSpanIsCorrect,
  mockedReadableSpan,
  MockedResponse,
} from './helper';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';

const fakeRequest = {
  end: function () {},
  on: function () {},
  write: function () {},
};

// send is lazy loading file so need to wait a bit
const waitTimeMS = 20;

describe('CollectorTraceExporter - node with proto over http', () => {
  let collectorExporter: CollectorTraceExporter;
  let collectorExporterConfig: CollectorExporterNodeConfigBase;
  let spyRequest: sinon.SinonSpy;
  let spyWrite: sinon.SinonSpy;
  let spans: ReadableSpan[];
  describe('export', () => {
    beforeEach(() => {
      spyRequest = sinon.stub(http, 'request').returns(fakeRequest as any);
      spyWrite = sinon.stub(fakeRequest, 'write');
      collectorExporterConfig = {
        headers: {
          foo: 'bar',
        },
        hostname: 'foo',
        logger: new core.NoopLogger(),
        serviceName: 'bar',
        attributes: {},
        url: 'http://foo.bar.com',
        keepAlive: true,
        httpAgentOptions: { keepAliveMsecs: 2000 },
      };
      collectorExporter = new CollectorTraceExporter(collectorExporterConfig);
      spans = [];
      spans.push(Object.assign({}, mockedReadableSpan));
    });
    afterEach(() => {
      spyRequest.restore();
      spyWrite.restore();
    });

    it('should open the connection', done => {
      collectorExporter.export(spans, () => {});

      setTimeout(() => {
        const args = spyRequest.args[0];
        const options = args[0];

        assert.strictEqual(options.hostname, 'foo.bar.com');
        assert.strictEqual(options.method, 'POST');
        assert.strictEqual(options.path, '/');
        done();
      }, waitTimeMS);
    });

    it('should set custom headers', done => {
      collectorExporter.export(spans, () => {});

      setTimeout(() => {
        const args = spyRequest.args[0];
        const options = args[0];
        assert.strictEqual(options.headers['foo'], 'bar');
        done();
      }, waitTimeMS);
    });

    it('should have keep alive and keepAliveMsecs option set', done => {
      collectorExporter.export(spans, () => {});

      setTimeout(() => {
        const args = spyRequest.args[0];
        const options = args[0];
        const agent = options.agent;
        assert.strictEqual(agent.keepAlive, true);
        assert.strictEqual(agent.options.keepAliveMsecs, 2000);
        done();
      });
    });

    it('should successfully send the spans', done => {
      collectorExporter.export(spans, () => {});

      setTimeout(() => {
        const writeArgs = spyWrite.args[0];
        const ExportTraceServiceRequestProto = getExportRequestProto();
        const data = ExportTraceServiceRequestProto?.decode(writeArgs[0]);
        const json = data?.toJSON() as collectorTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest;
        const span1 =
          json.resourceSpans[0].instrumentationLibrarySpans[0].spans[0];
        assert.ok(typeof span1 !== 'undefined', "span doesn't exist");
        if (span1) {
          ensureProtoSpanIsCorrect(span1);
        }

        ensureExportTraceServiceRequestIsSet(json);

        done();
      }, waitTimeMS);
    });

    it('should log the successful message', done => {
      const spyLoggerError = sinon.stub(collectorExporter.logger, 'error');

      const responseSpy = sinon.spy();
      collectorExporter.export(spans, responseSpy);

      setTimeout(() => {
        const mockRes = new MockedResponse(200);
        const args = spyRequest.args[0];
        const callback = args[1];
        callback(mockRes);
        mockRes.send('success');
        setTimeout(() => {
          const result = responseSpy.args[0][0] as ExportResult;
          assert.strictEqual(result.code, ExportResultCode.SUCCESS);
          assert.strictEqual(spyLoggerError.args.length, 0);
          done();
        });
      }, waitTimeMS);
    });

    it('should log the error message', done => {
      const responseSpy = sinon.spy();
      collectorExporter.export(spans, responseSpy);

      setTimeout(() => {
        const mockResError = new MockedResponse(400);
        const args = spyRequest.args[0];
        const callback = args[1];
        callback(mockResError);
        mockResError.send('failed');
        setTimeout(() => {
          const result = responseSpy.args[0][0] as ExportResult;
          assert.strictEqual(result.code, ExportResultCode.FAILED);
          // @ts-expect-error
          assert.strictEqual(result.error.code, 400);
          done();
        });
      }, waitTimeMS);
    });
  });
});
