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

import * as core from '@opentelemetry/core';
import { ReadableSpan } from '@opentelemetry/tracing';
import * as http from 'http';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { CollectorProtocolNode } from '../../src/enums';
import { CollectorTraceExporter } from '../../src/platform/node';
import { CollectorExporterConfigNode } from '../../src/platform/node/types';
import { getExportTraceServiceRequestProto } from '../../src/platform/node/utilWithJsonProto';
import * as collectorTypes from '../../src/types';

import {
  ensureExportTraceServiceRequestIsSet,
  ensureProtoSpanIsCorrect,
  mockedReadableSpan,
} from '../helper';

const fakeRequest = {
  end: function () {},
  on: function () {},
  write: function () {},
};

const mockRes = {
  statusCode: 200,
};

const mockResError = {
  statusCode: 400,
};

describe('CollectorExporter - node with proto over http', () => {
  let collectorExporter: CollectorTraceExporter;
  let collectorExporterConfig: CollectorExporterConfigNode;
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
        protocolNode: CollectorProtocolNode.HTTP_PROTO,
        hostname: 'foo',
        logger: new core.NoopLogger(),
        serviceName: 'bar',
        attributes: {},
        url: 'http://foo.bar.com',
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
      });
    });

    it('should set custom headers', done => {
      collectorExporter.export(spans, () => {});

      setTimeout(() => {
        const args = spyRequest.args[0];
        const options = args[0];
        assert.strictEqual(options.headers['foo'], 'bar');
        done();
      });
    });

    it('should successfully send the spans', done => {
      collectorExporter.export(spans, () => {});

      setTimeout(() => {
        const writeArgs = spyWrite.args[0];
        const ExportTraceServiceRequestProto = getExportTraceServiceRequestProto();
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
      });
    });

    it('should log the successful message', done => {
      const spyLoggerDebug = sinon.stub(collectorExporter.logger, 'debug');
      const spyLoggerError = sinon.stub(collectorExporter.logger, 'error');

      const responseSpy = sinon.spy();
      collectorExporter.export(spans, responseSpy);

      setTimeout(() => {
        const args = spyRequest.args[0];
        const callback = args[1];
        callback(mockRes);
        setTimeout(() => {
          const response: any = spyLoggerDebug.args[1][0];
          assert.strictEqual(response, 'statusCode: 200');
          assert.strictEqual(spyLoggerError.args.length, 0);
          assert.strictEqual(responseSpy.args[0][0], 0);
          done();
        });
      });
    });

    it('should log the error message', done => {
      const spyLoggerError = sinon.stub(collectorExporter.logger, 'error');

      const responseSpy = sinon.spy();
      collectorExporter.export(spans, responseSpy);

      setTimeout(() => {
        const args = spyRequest.args[0];
        const callback = args[1];
        callback(mockResError);
        setTimeout(() => {
          const response: any = spyLoggerError.args[0][0];
          assert.strictEqual(response, 'statusCode: 400');

          assert.strictEqual(responseSpy.args[0][0], 1);
          done();
        });
      });
    });
  });
  describe('CollectorTraceExporter - node (getDefaultUrl)', () => {
    it('should default to localhost', done => {
      const collectorExporter = new CollectorTraceExporter({
        protocolNode: CollectorProtocolNode.HTTP_PROTO,
      });
      setTimeout(() => {
        assert.strictEqual(
          collectorExporter['url'],
          'http://localhost:55681/v1/trace'
        );
        done();
      });
    });

    it('should keep the URL if included', done => {
      const url = 'http://foo.bar.com';
      const collectorExporter = new CollectorTraceExporter({ url });
      setTimeout(() => {
        assert.strictEqual(collectorExporter['url'], url);
        done();
      });
    });
  });
});
