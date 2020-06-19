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

import * as protoLoader from '@grpc/proto-loader';
import * as grpc from 'grpc';
import * as path from 'path';
import * as fs from 'fs';

import * as assert from 'assert';
import * as sinon from 'sinon';
import { CollectorMetricExporter } from '../../src/platform/node';
import * as collectorTypes from '../../src/types';
import { MeterProvider } from '@opentelemetry/metrics';
import { Labels } from '@opentelemetry/api';

const metricsServiceProtoPath =
  'opentelemetry/proto/collector/metrics/v1/metrics_service.proto';
const includeDirs = [path.resolve(__dirname, '../../src/platform/node/protos')];

const address = 'localhost:1501';

type TestParams = {
  useTLS: boolean;
};

const testCollectorMetricExporter = (params: TestParams) =>
  describe(`CollectorMetricExporter - node ${
    params.useTLS ? 'with TLS' : ''
  }`, () => {
    let collectorExporter: CollectorMetricExporter;
    let server: grpc.Server;
    let exportedData:
      | collectorTypes.opentelemetryProto.metrics.v1.ResourceMetrics
      | undefined;

    before(done => {
      server = new grpc.Server();
      protoLoader
        .load(metricsServiceProtoPath, {
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
            packageObject.opentelemetry.proto.collector.metrics.v1
              .MetricsService.service,
            {
              Export: (data: {
                request: collectorTypes.opentelemetryProto.metrics.v1.ExportMetricsServiceRequest;
              }) => {
                try {
                  exportedData = data.request.resourceMetrics[0];
                } catch (e) {
                  exportedData = undefined;
                }
              },
            }
          );
          const credentials = params.useTLS
            ? grpc.ServerCredentials.createSsl(
                fs.readFileSync('./test/certs/ca.crt'),
                [
                  {
                    cert_chain: fs.readFileSync('./test/certs/server.crt'),
                    private_key: fs.readFileSync('./test/certs/server.key'),
                  },
                ]
              )
            : grpc.ServerCredentials.createInsecure();
          server.bind(address, credentials);
          server.start();
          done();
        });
    });

    after(() => {
      server.forceShutdown();
    });

    beforeEach(done => {
      const credentials = params.useTLS
        ? grpc.credentials.createSsl(
            fs.readFileSync('./test/certs/ca.crt'),
            fs.readFileSync('./test/certs/client.key'),
            fs.readFileSync('./test/certs/client.crt')
          )
        : undefined;
      collectorExporter = new CollectorMetricExporter({
        url: address,
        credentials,
      });

      done();
    });

    afterEach(() => {
      exportedData = undefined;
    });

    describe('export', () => {
      it('should export metrics', done => {
        const responseSpy = sinon.spy();
        const meter = new MeterProvider().getMeter('test-meter');
        const labels: Labels = { ['keyb']: 'value2', ['keya']: 'value1' };
        const counter = meter.createCounter('name', {
          labelKeys: ['keya', 'keyb'],
        });
        counter.bind(labels).add(10);
        meter.collect();
        const records = meter.getBatcher().checkPointSet();
        collectorExporter.export(records, responseSpy);
        setTimeout(() => {
          assert.ok(
            typeof exportedData !== 'undefined',
            'resource' + " doesn't exist"
          );
          let resource;
          if (exportedData) {
            resource = exportedData.resource;
            // ensureExportedSpanIsCorrect(records[0]);

            assert.ok(
              typeof resource !== 'undefined',
              "resource doesn't exist"
            );
            if (resource) {
              //ensureResourceIsCorrect(resource);
              assert.notEqual(resource, {});
            }
          }
          done();
        }, 200);
      });
    });
  });

describe('CollectorMetricExporter - node (getDefaultUrl)', () => {
  it('should default to localhost', done => {
    const collectorExporter = new CollectorMetricExporter({});
    setTimeout(() => {
      assert.strictEqual(collectorExporter['url'], 'localhost:55678');
      done();
    });
  });
  it('should keep the URL if included', done => {
    const url = 'http://foo.bar.com';
    const collectorExporter = new CollectorMetricExporter({ url });
    setTimeout(() => {
      assert.strictEqual(collectorExporter['url'], url);
      done();
    });
  });
});

testCollectorMetricExporter({ useTLS: true });
testCollectorMetricExporter({ useTLS: false });
