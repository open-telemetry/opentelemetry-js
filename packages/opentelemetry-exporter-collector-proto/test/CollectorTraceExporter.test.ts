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

import { diag } from '@opentelemetry/api';
import { ExportResultCode } from '@opentelemetry/core';
import {
  CollectorExporterNodeConfigBase,
  collectorTypes,
} from '@opentelemetry/exporter-collector';
import { ReadableSpan } from '@opentelemetry/tracing';
import * as assert from 'assert';
import * as http from 'http';
import * as sinon from 'sinon';
import { CollectorTraceExporter } from '../src';
import { getExportRequestProto } from '../src/util';
import {
  ensureExportTraceServiceRequestIsSet,
  ensureProtoSpanIsCorrect,
  mockedReadableSpan,
  MockedResponse,
} from './helper';

const fakeRequest = {
  end: function () {},
  on: function () {},
  write: function () {},
};

describe('CollectorTraceExporter - node with proto over http', () => {
  let collectorExporter: CollectorTraceExporter;
  let collectorExporterConfig: CollectorExporterNodeConfigBase;
  let spans: ReadableSpan[];

  describe('export', () => {
    beforeEach(() => {
      // Set no logger so that sinon doesn't complain about TypeError: Attempted to wrap xxxx which is already wrapped
      diag.setLogger();
      collectorExporterConfig = {
        headers: {
          foo: 'bar',
        },
        hostname: 'foo',
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
      sinon.restore();
    });

    it('should open the connection', done => {
      collectorExporter.export(spans, () => {});

      sinon.stub(http, 'request').callsFake((options: any) => {
        assert.strictEqual(options.hostname, 'foo.bar.com');
        assert.strictEqual(options.method, 'POST');
        assert.strictEqual(options.path, '/');
        done();
        return fakeRequest as any;
      });
    });

    it('should set custom headers', done => {
      collectorExporter.export(spans, () => {});

      sinon.stub(http, 'request').callsFake((options: any) => {
        assert.strictEqual(options.headers['foo'], 'bar');
        done();
        return fakeRequest as any;
      });
    });

    it('should have keep alive and keepAliveMsecs option set', done => {
      collectorExporter.export(spans, () => {});

      sinon.stub(http, 'request').callsFake((options: any) => {
        assert.strictEqual(options.agent.keepAlive, true);
        assert.strictEqual(options.agent.options.keepAliveMsecs, 2000);
        done();
        return fakeRequest as any;
      });
    });

    it('should successfully send the spans', done => {
      collectorExporter.export(spans, () => {});

      sinon.stub(http, 'request').returns({
        end: () => {},
        on: () => {},
        write: (...args: any[]) => {
          const ExportTraceServiceRequestProto = getExportRequestProto();
          const data = ExportTraceServiceRequestProto?.decode(args[0]);
          const json = data?.toJSON() as collectorTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest;
          const span1 =
            json.resourceSpans[0].instrumentationLibrarySpans[0].spans[0];
          assert.ok(typeof span1 !== 'undefined', "span doesn't exist");
          if (span1) {
            ensureProtoSpanIsCorrect(span1);
          }

          ensureExportTraceServiceRequestIsSet(json);

          done();
        },
      } as any);
    });

    it('should log the successful message', done => {
      // Need to stub/spy on the underlying logger as the "diag" instance is global
      const spyLoggerError = sinon.stub(diag.getLogger(), 'error');

      collectorExporter.export(spans, result => {
        assert.strictEqual(result.code, ExportResultCode.SUCCESS);
        assert.strictEqual(spyLoggerError.args.length, 0);
        done();
      });

      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        const mockRes = new MockedResponse(200);
        cb(mockRes);
        mockRes.send('success');
        return fakeRequest as any;
      });
    });

    it('should log the error message', done => {
      collectorExporter.export(spans, result => {
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        // @ts-expect-error verify error code
        assert.strictEqual(result.error.code, 400);
        done();
      });

      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        const mockResError = new MockedResponse(400);
        cb(mockResError);
        mockResError.send('failed');

        return fakeRequest as any;
      });
    });
  });
});
