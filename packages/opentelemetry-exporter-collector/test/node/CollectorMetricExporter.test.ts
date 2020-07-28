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
import { MetricRecord, HistogramAggregator } from '@opentelemetry/metrics';
import {
  mockCounter,
  mockObserver,
  mockHistogram,
  ensureExportedCounterIsCorrect,
  ensureExportedObserverIsCorrect,
  ensureMetadataIsCorrect,
  ensureResourceIsCorrect,
  ensureExportedHistogramIsCorrect,
  ensureExportedValueRecorderIsCorrect,
  mockValueRecorder,
} from '../helper';
import { ConsoleLogger, LogLevel } from '@opentelemetry/core';
import { CollectorProtocolNode } from '../../src';

const metricsServiceProtoPath =
  'opentelemetry/proto/collector/metrics/v1/metrics_service.proto';
const includeDirs = [path.resolve(__dirname, '../../src/platform/node/protos')];

const address = 'localhost:1501';

type TestParams = {
  useTLS?: boolean;
  metadata?: grpc.Metadata;
};

const metadata = new grpc.Metadata();
metadata.set('k', 'v');

const testCollectorMetricExporter = (params: TestParams) =>
  describe(`CollectorMetricExporter - node ${
    params.useTLS ? 'with' : 'without'
  } TLS, ${params.metadata ? 'with' : 'without'} metadata`, () => {
    let collectorExporter: CollectorMetricExporter;
    let server: grpc.Server;
    let exportedData:
      | collectorTypes.opentelemetryProto.metrics.v1.ResourceMetrics[]
      | undefined;
    let metrics: MetricRecord[];
    let reqMetadata: grpc.Metadata | undefined;

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
                request: collectorTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest;
                metadata: grpc.Metadata;
              }) => {
                try {
                  exportedData = data.request.resourceMetrics;
                  reqMetadata = data.metadata;
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
        serviceName: 'basic-service',
        metadata: params.metadata,
      });
      // Overwrites the start time to make tests consistent
      Object.defineProperty(collectorExporter, '_startTime', {
        value: 1592602232694000000,
      });
      metrics = [];
      metrics.push(Object.assign({}, mockCounter));
      metrics.push(Object.assign({}, mockObserver));
      metrics.push(Object.assign({}, mockHistogram));
      metrics.push(Object.assign({}, mockValueRecorder));

      metrics[0].aggregator.update(1);
      metrics[1].aggregator.update(10);
      metrics[2].aggregator.update(7);
      metrics[2].aggregator.update(14);
      metrics[3].aggregator.update(5);
      done();
    });

    afterEach(() => {
      // Aggregator is not deep-copied
      metrics[0].aggregator.update(-1);
      mockHistogram.aggregator = new HistogramAggregator([10, 20]);
      exportedData = undefined;
      reqMetadata = undefined;
    });

    describe('instance', () => {
      it('should warn about headers when using grpc', () => {
        const logger = new ConsoleLogger(LogLevel.DEBUG);
        const spyLoggerWarn = sinon.stub(logger, 'warn');
        collectorExporter = new CollectorMetricExporter({
          logger,
          serviceName: 'basic-service',
          url: address,
          headers: {
            foo: 'bar',
          },
        });
        const args = spyLoggerWarn.args[0];
        assert.strictEqual(args[0], 'Headers cannot be set when using grpc');
      });
      it('should warn about metadata when using json', () => {
        const metadata = new grpc.Metadata();
        metadata.set('k', 'v');
        const logger = new ConsoleLogger(LogLevel.DEBUG);
        const spyLoggerWarn = sinon.stub(logger, 'warn');
        collectorExporter = new CollectorMetricExporter({
          logger,
          serviceName: 'basic-service',
          url: address,
          metadata,
          protocolNode: CollectorProtocolNode.HTTP_JSON,
        });
        const args = spyLoggerWarn.args[0];
        assert.strictEqual(args[0], 'Metadata cannot be set when using http');
      });
    });

    describe('export', () => {
      it('should export metrics', done => {
        const responseSpy = sinon.spy();
        collectorExporter.export(metrics, responseSpy);
        setTimeout(() => {
          assert.ok(
            typeof exportedData !== 'undefined',
            'resource' + " doesn't exist"
          );
          let resource;
          if (exportedData) {
            resource = exportedData[0].resource;
            const counter =
              exportedData[0].instrumentationLibraryMetrics[0].metrics[0];
            const observer =
              exportedData[1].instrumentationLibraryMetrics[0].metrics[0];
            const histogram =
              exportedData[2].instrumentationLibraryMetrics[0].metrics[0];
            const recorder =
              exportedData[3].instrumentationLibraryMetrics[0].metrics[0];
            ensureExportedCounterIsCorrect(counter);
            ensureExportedObserverIsCorrect(observer);
            ensureExportedHistogramIsCorrect(histogram);
            ensureExportedValueRecorderIsCorrect(recorder);
            assert.ok(
              typeof resource !== 'undefined',
              "resource doesn't exist"
            );
            if (resource) {
              ensureResourceIsCorrect(resource, true);
            }
          }
          if (params.metadata && reqMetadata) {
            ensureMetadataIsCorrect(reqMetadata, params.metadata);
          }
          done();
        }, 500);
      });
    });
  });

describe('CollectorMetricExporter - node (getDefaultUrl)', () => {
  it('should default to localhost', done => {
    const collectorExporter = new CollectorMetricExporter({});
    setTimeout(() => {
      assert.strictEqual(collectorExporter['url'], 'localhost:55680');
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
testCollectorMetricExporter({ metadata });
