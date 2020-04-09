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

import * as protoLoader from '@grpc/proto-loader';
import * as grpc from 'grpc';
import * as path from 'path';
import {
  BasicTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';

import * as assert from 'assert';
import * as sinon from 'sinon';
import { CollectorExporter } from '../../src/CollectorExporter';
import * as collectorTypes from '../../src/types';

import {
  ensureResourceIsCorrect,
  ensureExportedSpanIsCorrect,
  mockedReadableSpan,
} from '../helper';

const traceServiceProtoPath =
  'opentelemetry/proto/collector/trace/v1/trace_service.proto';
const includeDirs = [path.resolve(__dirname, '../../src/platform/node/protos')];

const address = '127.0.0.1:1501';

describe('CollectorExporter - node', () => {
  let collectorExporter: CollectorExporter;
  let server: grpc.Server;
  let exportedData:
    | collectorTypes.opentelemetryProto.trace.v1.ResourceSpans
    | undefined;

  before(done => {
    server = new grpc.Server();
    protoLoader
      .load(traceServiceProtoPath, {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs,
      })
      .then((packageDefinition: protoLoader.PackageDefinition) => {
        const packageObject: any = grpc.loadPackageDefinition(
          packageDefinition
        );
        server.addService(
          packageObject.opentelemetry.proto.collector.trace.v1.TraceService
            .service,
          {
            Export: (data: {
              request: collectorTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest;
            }) => {
              try {
                exportedData = data.request.resourceSpans[0];
              } catch (e) {
                exportedData = undefined;
              }
            },
          }
        );
        server.bind(address, grpc.ServerCredentials.createInsecure());
        server.start();
        done();
      });
  });

  after(() => {
    server.forceShutdown();
  });

  beforeEach(done => {
    collectorExporter = new CollectorExporter({
      serviceName: 'basic-service',
      url: address,
    });

    const provider = new BasicTracerProvider();
    provider.addSpanProcessor(new SimpleSpanProcessor(collectorExporter));
    done();
  });

  afterEach(() => {
    exportedData = undefined;
  });

  describe('export', () => {
    it('should export spans', done => {
      const responseSpy = sinon.spy();
      const spans = [Object.assign({}, mockedReadableSpan)];
      collectorExporter.export(spans, responseSpy);
      setTimeout(() => {
        assert.ok(
          typeof exportedData !== 'undefined',
          'resource' + " doesn't exist"
        );
        let spans;
        let resource;
        if (exportedData) {
          spans = exportedData.instrumentationLibrarySpans[0].spans;
          resource = exportedData.resource;
          ensureExportedSpanIsCorrect(spans[0]);

          assert.ok(typeof resource !== 'undefined', "resource doesn't exist");
          if (resource) {
            ensureResourceIsCorrect(resource);
          }
        }
        done();
      }, 200);
    });
  });
});
