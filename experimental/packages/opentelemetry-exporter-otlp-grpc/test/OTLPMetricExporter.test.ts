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
import {
  Counter,
  ObservableGauge,
  Histogram,
} from '@opentelemetry/api-metrics';
import { diag } from '@opentelemetry/api';
import { otlpTypes } from '@opentelemetry/exporter-otlp-http';
import * as metrics from '@opentelemetry/sdk-metrics-base';
import * as assert from 'assert';
import * as fs from 'fs';
import * as grpc from '@grpc/grpc-js';
import * as path from 'path';
import * as sinon from 'sinon';
import { OTLPMetricExporter } from '../src';
import {
  ensureExportedCounterIsCorrect,
  ensureExportedObservableGaugeIsCorrect,
  ensureExportedHistogramIsCorrect,
  ensureMetadataIsCorrect,
  ensureResourceIsCorrect,
  mockCounter,
  mockObservableGauge,
  mockHistogram,
} from './helper';

const metricsServiceProtoPath =
  'opentelemetry/proto/collector/metrics/v1/metrics_service.proto';
const includeDirs = [path.resolve(__dirname, '../protos')];

const address = 'localhost:1501';

type TestParams = {
  useTLS?: boolean;
  metadata?: grpc.Metadata;
};

const metadata = new grpc.Metadata();
metadata.set('k', 'v');

const testOTLPMetricExporter = (params: TestParams) =>
  describe(`OTLPMetricExporter - node ${
    params.useTLS ? 'with' : 'without'
  } TLS, ${params.metadata ? 'with' : 'without'} metadata`, () => {
    let collectorExporter: OTLPMetricExporter;
    let server: grpc.Server;
    let exportedData:
      | otlpTypes.opentelemetryProto.metrics.v1.ResourceMetrics[]
      | undefined;
    let metrics: metrics.MetricRecord[];
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
                request: otlpTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest;
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
          server.bindAsync(address, credentials, () => {
            server.start();
            done();
          });
        });
    });

    after(() => {
      server.forceShutdown();
    });

    beforeEach(async () => {
      const credentials = params.useTLS
        ? grpc.credentials.createSsl(
            fs.readFileSync('./test/certs/ca.crt'),
            fs.readFileSync('./test/certs/client.key'),
            fs.readFileSync('./test/certs/client.crt')
          )
        : undefined;
      collectorExporter = new OTLPMetricExporter({
        url: 'grpcs://' + address,
        credentials,
        metadata: params.metadata,
      });
      // Overwrites the start time to make tests consistent
      Object.defineProperty(collectorExporter, '_startTime', {
        value: 1592602232694000000,
      });
      metrics = [];
      const counter: metrics.Metric<metrics.BoundCounter> &
        Counter = mockCounter();
      const observableGauge: metrics.Metric<metrics.BoundObservable> &
        ObservableGauge = mockObservableGauge(observableResult => {
        observableResult.observe(3, {});
        observableResult.observe(6, {});
      });
      const histogram: metrics.Metric<metrics.BoundHistogram> &
        Histogram = mockHistogram();

      counter.add(1);
      histogram.record(7);
      histogram.record(14);

      metrics.push((await counter.getMetricRecord())[0]);
      metrics.push((await observableGauge.getMetricRecord())[0]);
      metrics.push((await histogram.getMetricRecord())[0]);
    });

    afterEach(() => {
      exportedData = undefined;
      reqMetadata = undefined;
      sinon.restore();
    });

    describe('instance', () => {
      it('should warn about headers', () => {
        // Need to stub/spy on the underlying logger as the 'diag' instance is global
        const spyLoggerWarn = sinon.stub(diag, 'warn');
        collectorExporter = new OTLPMetricExporter({
          url: `http://${address}`,
          headers: {
            foo: 'bar',
          },
        });
        const args = spyLoggerWarn.args[0];
        assert.strictEqual(args[0], 'Headers cannot be set when using grpc');
      });
      it('should warn about path in url', () => {
        const spyLoggerWarn = sinon.stub(diag, 'warn');
        collectorExporter = new OTLPMetricExporter({
          url: `http://${address}/v1/metrics`
        });
        const args = spyLoggerWarn.args[0];
        assert.strictEqual(
          args[0],
          'URL path should not be set when using grpc, the path part of the URL will be ignored.'
        );
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
            const observableGauge =
              exportedData[0].instrumentationLibraryMetrics[0].metrics[1];
            const histogram =
              exportedData[0].instrumentationLibraryMetrics[0].metrics[2];
            ensureExportedCounterIsCorrect(
              counter,
              counter.intSum?.dataPoints[0].timeUnixNano
            );
            ensureExportedObservableGaugeIsCorrect(
              observableGauge,
              observableGauge.doubleGauge?.dataPoints[0].timeUnixNano
            );
            ensureExportedHistogramIsCorrect(
              histogram,
              histogram.intHistogram?.dataPoints[0].timeUnixNano,
              [0, 100],
              ['0', '2', '0']
            );
            assert.ok(
              typeof resource !== 'undefined',
              "resource doesn't exist"
            );
            if (resource) {
              ensureResourceIsCorrect(resource);
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

describe('OTLPMetricExporter - node (getDefaultUrl)', () => {
  it('should default to localhost', done => {
    const collectorExporter = new OTLPMetricExporter({});
    setTimeout(() => {
      assert.strictEqual(collectorExporter['url'], 'localhost:4317');
      done();
    });
  });
  it('should keep the URL if included', done => {
    const url = 'http://foo.bar.com';
    const collectorExporter = new OTLPMetricExporter({ url });
    setTimeout(() => {
      assert.strictEqual(collectorExporter['url'], 'foo.bar.com');
      done();
    });
  });
});

describe('when configuring via environment', () => {
  const envSource = process.env;
  it('should use url defined in env', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar';
    const collectorExporter = new OTLPMetricExporter();
    assert.strictEqual(
      collectorExporter.url,
      'foo.bar'
    );
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
  });
  it('should override global exporter url with signal url defined in env', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar';
    envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://foo.metrics';
    const collectorExporter = new OTLPMetricExporter();
    assert.strictEqual(
      collectorExporter.url,
      'foo.metrics'
    );
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = '';
  });
  it('should use headers defined via env', () => {
    envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar';
    const collectorExporter = new OTLPMetricExporter();
    assert.deepStrictEqual(collectorExporter.metadata?.get('foo'), ['bar']);
    envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
  });
  it('should override global headers config with signal headers defined via env', () => {
    const metadata = new grpc.Metadata();
    metadata.set('foo', 'bar');
    metadata.set('goo', 'lol');
    envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=jar,bar=foo';
    envSource.OTEL_EXPORTER_OTLP_METRICS_HEADERS = 'foo=boo';
    const collectorExporter = new OTLPMetricExporter({ metadata });
    assert.deepStrictEqual(collectorExporter.metadata?.get('foo'), ['boo']);
    assert.deepStrictEqual(collectorExporter.metadata?.get('bar'), ['foo']);
    assert.deepStrictEqual(collectorExporter.metadata?.get('goo'), ['lol']);
    envSource.OTEL_EXPORTER_OTLP_METRICS_HEADERS = '';
    envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
  });
});

testOTLPMetricExporter({ useTLS: true });
testOTLPMetricExporter({ useTLS: false });
testOTLPMetricExporter({ metadata });
