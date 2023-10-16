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
import { diag, DiagLogger } from '@opentelemetry/api';
import * as assert from 'assert';
import * as fs from 'fs';
import * as grpc from '@grpc/grpc-js';
import * as path from 'path';
import * as sinon from 'sinon';
import { OTLPMetricExporter } from '../src';
import {
  collect,
  ensureExportedCounterIsCorrect,
  ensureExportedHistogramIsCorrect,
  ensureExportedObservableGaugeIsCorrect,
  ensureMetadataIsCorrect,
  ensureResourceIsCorrect,
  mockCounter,
  mockHistogram,
  mockObservableGauge,
  setUp,
  shutdown,
} from './metricsHelper';
import { ResourceMetrics } from '@opentelemetry/sdk-metrics';
import {
  IExportMetricsServiceRequest,
  IResourceMetrics,
} from '@opentelemetry/otlp-transformer';
import { VERSION } from '../src/version';
import { AggregationTemporalityPreference } from '@opentelemetry/exporter-metrics-otlp-http';

const metricsServiceProtoPath =
  'opentelemetry/proto/collector/metrics/v1/metrics_service.proto';
const includeDirs = [
  path.resolve(__dirname, '../../otlp-grpc-exporter-base/protos'),
];

const httpAddr = 'https://localhost:1502';
const udsAddr = 'unix:///tmp/otlp-metrics.sock';

type TestParams = {
  address?: string;
  useTLS?: boolean;
  metadata?: grpc.Metadata;
};

const metadata = new grpc.Metadata();
metadata.set('k', 'v');

const testOTLPMetricExporter = (params: TestParams) => {
  const { address = httpAddr, useTLS, metadata } = params;
  return describe(`OTLPMetricExporter - node ${
    useTLS ? 'with' : 'without'
  } TLS, ${metadata ? 'with' : 'without'} metadata, target ${address}`, () => {
    let collectorExporter: OTLPMetricExporter;
    let server: grpc.Server;
    let exportedData: IResourceMetrics[] | undefined;
    let metrics: ResourceMetrics;
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
          const packageObject: any =
            grpc.loadPackageDefinition(packageDefinition);
          server.addService(
            packageObject.opentelemetry.proto.collector.metrics.v1
              .MetricsService.service,
            {
              Export: (data: {
                request: IExportMetricsServiceRequest;
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
          const credentials = useTLS
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
          const serverAddr = new URL(address);
          server.bindAsync(
            serverAddr.protocol === 'https:' ? serverAddr.host : address,
            credentials,
            () => {
              server.start();
              done();
            }
          );
        });
    });

    after(() => {
      server.forceShutdown();
    });

    beforeEach(async () => {
      const credentials = useTLS
        ? grpc.credentials.createSsl(
            fs.readFileSync('./test/certs/ca.crt'),
            fs.readFileSync('./test/certs/client.key'),
            fs.readFileSync('./test/certs/client.crt')
          )
        : grpc.credentials.createInsecure();
      collectorExporter = new OTLPMetricExporter({
        url: address,
        credentials,
        metadata: metadata,
        temporalityPreference: AggregationTemporalityPreference.CUMULATIVE,
      });

      setUp();

      const counter = mockCounter();
      mockObservableGauge(observableResult => {
        observableResult.observe(3, {});
        observableResult.observe(6, {});
      });
      const histogram = mockHistogram();

      counter.add(1);
      histogram.record(7);
      histogram.record(14);

      const { resourceMetrics, errors } = await collect();
      assert.strictEqual(errors.length, 0);
      metrics = resourceMetrics;
    });

    afterEach(async () => {
      await shutdown();
      exportedData = undefined;
      reqMetadata = undefined;
      sinon.restore();
    });

    describe('instance', () => {
      let warnStub: sinon.SinonStub;

      beforeEach(() => {
        // Need to stub/spy on the underlying logger as the "diag" instance is global
        warnStub = sinon.stub();
        const nop = () => {};
        const diagLogger: DiagLogger = {
          debug: nop,
          error: nop,
          info: nop,
          verbose: nop,
          warn: warnStub,
        };
        diag.setLogger(diagLogger);
      });

      afterEach(() => {
        diag.disable();
      });

      it('should warn about headers', () => {
        collectorExporter = new OTLPMetricExporter({
          url: address,
          headers: {
            foo: 'bar',
          },
          temporalityPreference: AggregationTemporalityPreference.CUMULATIVE,
        });
        const args = warnStub.args[0];
        assert.strictEqual(args[0], 'Headers cannot be set when using grpc');
      });
      it('should warn about path in url', () => {
        if (new URL(address).protocol === 'unix:') {
          // Skip this test for UDS
          return;
        }
        collectorExporter = new OTLPMetricExporter({
          url: `${address}/v1/metrics`,
          temporalityPreference: AggregationTemporalityPreference.CUMULATIVE,
        });
        const args = warnStub.args[0];
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
            'resource does not exist'
          );

          assert.ok(exportedData, 'exportedData does not exist');

          // The order of the metrics is not guaranteed.
          const counterIndex =
            exportedData[0].scopeMetrics[0].metrics.findIndex(
              it => it.name === 'int-counter'
            );
          const observableIndex =
            exportedData[0].scopeMetrics[0].metrics.findIndex(
              it => it.name === 'double-observable-gauge'
            );
          const histogramIndex =
            exportedData[0].scopeMetrics[0].metrics.findIndex(
              it => it.name === 'int-histogram'
            );

          const resource = exportedData[0].resource;
          const counter = exportedData[0].scopeMetrics[0].metrics[counterIndex];
          const observableGauge =
            exportedData[0].scopeMetrics[0].metrics[observableIndex];
          const histogram =
            exportedData[0].scopeMetrics[0].metrics[histogramIndex];
          ensureExportedCounterIsCorrect(
            counter,
            metrics.scopeMetrics[0].metrics[counterIndex].dataPoints[0].endTime,
            metrics.scopeMetrics[0].metrics[counterIndex].dataPoints[0]
              .startTime
          );
          ensureExportedObservableGaugeIsCorrect(
            observableGauge,
            metrics.scopeMetrics[0].metrics[observableIndex].dataPoints[0]
              .endTime,
            metrics.scopeMetrics[0].metrics[observableIndex].dataPoints[0]
              .startTime
          );
          ensureExportedHistogramIsCorrect(
            histogram,
            metrics.scopeMetrics[0].metrics[histogramIndex].dataPoints[0]
              .endTime,
            metrics.scopeMetrics[0].metrics[histogramIndex].dataPoints[0]
              .startTime,
            [0, 100],
            ['0', '2', '0']
          );
          assert.ok(typeof resource !== 'undefined', "resource doesn't exist");
          ensureResourceIsCorrect(resource);

          ensureMetadataIsCorrect(reqMetadata, metadata);

          done();
        }, 500);
      });
    });
  });
};

describe('OTLPMetricExporter - node (getDefaultUrl)', () => {
  it('should default to localhost', done => {
    const collectorExporter = new OTLPMetricExporter();
    setTimeout(() => {
      assert.strictEqual(collectorExporter._otlpExporter.url, 'localhost:4317');
      done();
    });
  });
  it('should keep the URL if included', done => {
    const url = 'http://foo.bar.com';
    const collectorExporter = new OTLPMetricExporter({
      url,
      temporalityPreference: AggregationTemporalityPreference.CUMULATIVE,
    });
    setTimeout(() => {
      assert.strictEqual(collectorExporter._otlpExporter.url, 'foo.bar.com');
      done();
    });
  });
});

describe('when configuring via environment', () => {
  const envSource = process.env;
  it('should use url defined in env', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar';
    const collectorExporter = new OTLPMetricExporter();
    assert.strictEqual(collectorExporter._otlpExporter.url, 'foo.bar');
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
  });
  it('should override global exporter url with signal url defined in env', () => {
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar';
    envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://foo.metrics';
    const collectorExporter = new OTLPMetricExporter();
    assert.strictEqual(collectorExporter._otlpExporter.url, 'foo.metrics');
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    envSource.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = '';
  });
  it('should use headers defined via env', () => {
    envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=bar';
    const collectorExporter = new OTLPMetricExporter();
    assert.deepStrictEqual(
      collectorExporter._otlpExporter.metadata?.get('foo'),
      ['bar']
    );
    envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
  });
  it('should include user agent in header', () => {
    const collectorExporter = new OTLPMetricExporter();
    assert.deepStrictEqual(
      collectorExporter._otlpExporter.metadata?.get('User-Agent'),
      [`OTel-OTLP-Exporter-JavaScript/${VERSION}`]
    );
  });
  it('should override global headers config with signal headers defined via env', () => {
    const metadata = new grpc.Metadata();
    metadata.set('foo', 'bar');
    metadata.set('goo', 'lol');
    envSource.OTEL_EXPORTER_OTLP_HEADERS = 'foo=jar,bar=foo';
    envSource.OTEL_EXPORTER_OTLP_METRICS_HEADERS = 'foo=boo';
    const collectorExporter = new OTLPMetricExporter({
      metadata,
      temporalityPreference: AggregationTemporalityPreference.CUMULATIVE,
    });
    assert.deepStrictEqual(
      collectorExporter._otlpExporter.metadata?.get('foo'),
      ['boo']
    );
    assert.deepStrictEqual(
      collectorExporter._otlpExporter.metadata?.get('bar'),
      ['foo']
    );
    assert.deepStrictEqual(
      collectorExporter._otlpExporter.metadata?.get('goo'),
      ['lol']
    );
    envSource.OTEL_EXPORTER_OTLP_METRICS_HEADERS = '';
    envSource.OTEL_EXPORTER_OTLP_HEADERS = '';
  });
});

testOTLPMetricExporter({ useTLS: true });
testOTLPMetricExporter({ useTLS: false });
testOTLPMetricExporter({ metadata });
// skip UDS tests on windows
process.platform !== 'win32' && testOTLPMetricExporter({ address: udsAddr });
