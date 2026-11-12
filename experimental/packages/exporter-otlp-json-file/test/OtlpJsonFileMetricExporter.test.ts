/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { Writable } from 'stream';
import { ValueType } from '@opentelemetry/api';
import { ExportResultCode } from '@opentelemetry/core';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  AggregationTemporality,
  AggregationType,
  DataPointType,
  InstrumentType,
  MeterProvider,
  PeriodicExportingMetricReader,
  type ResourceMetrics,
} from '@opentelemetry/sdk-metrics';
import { JsonMetricsSerializer } from '@opentelemetry/otlp-transformer';
import { OtlpJsonFileMetricExporter } from '../src/OtlpJsonFileMetricExporter';
import { AggregationTemporalityPreference } from '../src/types';

class MemoryWritable extends Writable {
  public content = '';
  public lines: string[] = [];

  override _write(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    const text = chunk.toString('utf-8');
    this.content += text;
    const parts = text.split('\n');
    for (const part of parts) {
      if (part.trim().length > 0) {
        this.lines.push(part);
      }
    }
    callback();
  }
}

describe('OtlpJsonFileMetricExporter', () => {
  describe('temporality preference', () => {
    it('uses Cumulative preference by default', () => {
      const exporter = new OtlpJsonFileMetricExporter();
      assert.strictEqual(
        exporter.selectAggregationTemporality(InstrumentType.COUNTER),
        AggregationTemporality.CUMULATIVE
      );
      assert.strictEqual(
        exporter.selectAggregationTemporality(InstrumentType.HISTOGRAM),
        AggregationTemporality.CUMULATIVE
      );
    });

    it('uses Delta preference when configured', () => {
      const exporter = new OtlpJsonFileMetricExporter({
        temporalityPreference: AggregationTemporalityPreference.DELTA,
      });
      assert.strictEqual(
        exporter.selectAggregationTemporality(InstrumentType.COUNTER),
        AggregationTemporality.DELTA
      );
      assert.strictEqual(
        exporter.selectAggregationTemporality(InstrumentType.UP_DOWN_COUNTER),
        AggregationTemporality.CUMULATIVE
      );
    });

    it('uses LowMemory preference when configured', () => {
      const exporter = new OtlpJsonFileMetricExporter({
        temporalityPreference: AggregationTemporalityPreference.LOWMEMORY,
      });
      assert.strictEqual(
        exporter.selectAggregationTemporality(InstrumentType.COUNTER),
        AggregationTemporality.DELTA
      );
      assert.strictEqual(
        exporter.selectAggregationTemporality(InstrumentType.HISTOGRAM),
        AggregationTemporality.DELTA
      );
      assert.strictEqual(
        exporter.selectAggregationTemporality(InstrumentType.UP_DOWN_COUNTER),
        AggregationTemporality.CUMULATIVE
      );
      assert.strictEqual(
        exporter.selectAggregationTemporality(InstrumentType.GAUGE),
        AggregationTemporality.CUMULATIVE
      );
      assert.strictEqual(
        exporter.selectAggregationTemporality(InstrumentType.OBSERVABLE_GAUGE),
        AggregationTemporality.CUMULATIVE
      );
      assert.strictEqual(
        exporter.selectAggregationTemporality(
          InstrumentType.OBSERVABLE_COUNTER
        ),
        AggregationTemporality.CUMULATIVE
      );
    });

    it('accepts direct AggregationTemporality enum value', () => {
      const exporter = new OtlpJsonFileMetricExporter({
        temporalityPreference: AggregationTemporality.DELTA,
      });
      assert.strictEqual(
        exporter.selectAggregationTemporality(InstrumentType.COUNTER),
        AggregationTemporality.DELTA
      );
      assert.strictEqual(
        exporter.selectAggregationTemporality(InstrumentType.UP_DOWN_COUNTER),
        AggregationTemporality.CUMULATIVE
      );
    });

    it('respects custom aggregation preference', () => {
      const exporter = new OtlpJsonFileMetricExporter({
        aggregationPreference: _instrumentType => ({
          type: AggregationType.DEFAULT,
        }),
      });
      assert.deepStrictEqual(
        exporter.selectAggregation(InstrumentType.COUNTER),
        {
          type: AggregationType.DEFAULT,
        }
      );
    });
  });

  describe('export', () => {
    it('exports metrics as valid OTLP JSON Lines to custom stream', async () => {
      const memoryStream = new MemoryWritable();
      const exporter = new OtlpJsonFileMetricExporter({ out: memoryStream });

      const reader = new PeriodicExportingMetricReader({
        exporter,
        exportIntervalMillis: 600000,
      });

      const provider = new MeterProvider({
        resource: resourceFromAttributes({
          'service.name': 'metric-test-service',
        }),
        readers: [reader],
      });

      const meter = provider.getMeter('test-meter', '1.0.0');
      const counter = meter.createCounter('orders_total', {
        description: 'Total number of orders',
        unit: '1',
        valueType: ValueType.INT,
      });
      counter.add(5, { 'customer.tier': 'gold' });

      // Trigger collection and export via shutdown
      await reader.shutdown();

      assert.strictEqual(memoryStream.lines.length, 1);
      assert.ok(memoryStream.content.endsWith('\n'));

      const json = JSON.parse(memoryStream.lines[0]);
      assert.ok(json.resourceMetrics, 'Must contain resourceMetrics');
      assert.strictEqual(json.resourceMetrics.length, 1);

      const rm = json.resourceMetrics[0];
      const serviceNameAttr = rm.resource.attributes.find(
        (a: any) => a.key === 'service.name'
      );
      assert.strictEqual(
        serviceNameAttr?.value?.stringValue,
        'metric-test-service'
      );

      assert.strictEqual(rm.scopeMetrics.length, 1);
      const sm = rm.scopeMetrics[0];
      assert.strictEqual(sm.scope?.name, 'test-meter');
      assert.strictEqual(sm.scope?.version, '1.0.0');

      const metric = sm.metrics?.find((m: any) => m.name === 'orders_total');
      assert.ok(metric, 'Metric orders_total must be present');
      assert.strictEqual(metric.description, 'Total number of orders');
      assert.strictEqual(metric.unit, '1');
      assert.ok(metric.sum?.dataPoints);
      assert.strictEqual(metric.sum.dataPoints.length, 1);
      assert.strictEqual(metric.sum.dataPoints[0].asInt, 5);

      await exporter.shutdown();
    });

    it('handles empty metrics batch gracefully without writing', done => {
      const memoryStream = new MemoryWritable();
      const exporter = new OtlpJsonFileMetricExporter({ out: memoryStream });

      const emptyMetrics: ResourceMetrics = {
        resource: resourceFromAttributes({}),
        scopeMetrics: [],
      };

      exporter.export(emptyMetrics, result => {
        assert.strictEqual(result.code, ExportResultCode.SUCCESS);
        assert.strictEqual(memoryStream.content, '');
        assert.strictEqual(memoryStream.lines.length, 0);
        done();
      });
    });

    it('writes to process.stdout by default', done => {
      const stdoutWriteStub = sinon
        .stub(process.stdout, 'write')
        .callsFake((chunk: any, cb?: any) => {
          if (typeof cb === 'function') {
            cb();
          }
          return true;
        });

      const exporter = new OtlpJsonFileMetricExporter();
      const metrics: ResourceMetrics = {
        resource: resourceFromAttributes({ env: 'prod' }),
        scopeMetrics: [
          {
            scope: { name: 'stdout-meter' },
            metrics: [
              {
                descriptor: {
                  name: 'cpu_usage',
                  description: 'CPU Usage',
                  unit: '%',
                  valueType: 1,
                },
                aggregationTemporality: AggregationTemporality.CUMULATIVE,
                dataPointType: DataPointType.GAUGE,
                dataPoints: [
                  {
                    startTime: [1000, 0],
                    endTime: [2000, 0],
                    attributes: {},
                    value: 42,
                  },
                ],
              },
            ],
          },
        ],
      };

      exporter.export(metrics, result => {
        stdoutWriteStub.restore();
        assert.strictEqual(result.code, ExportResultCode.SUCCESS);
        assert.strictEqual(stdoutWriteStub.calledOnce, true);

        const written = stdoutWriteStub.firstCall.args[0] as Buffer;
        const text = written.toString('utf-8');
        assert.ok(text.endsWith('\n'));
        const parsed = JSON.parse(text);
        assert.ok(parsed.resourceMetrics);
        done();
      });
    });

    it('delegates shutdown and forceFlush to internal writer', async () => {
      const memoryStream = new MemoryWritable();
      const exporter = new OtlpJsonFileMetricExporter({ out: memoryStream });

      await exporter.forceFlush();
      await exporter.shutdown();

      await new Promise<void>(resolve => {
        const metrics: ResourceMetrics = {
          resource: resourceFromAttributes({}),
          scopeMetrics: [
            {
              scope: { name: 'scope' },
              metrics: [],
            },
          ],
        };

        exporter.export(metrics, result => {
          assert.strictEqual(result.code, ExportResultCode.FAILED);
          assert.strictEqual(
            result.error?.message,
            'Exporter has been shutdown'
          );
          resolve();
        });
      });
    });

    it('returns FAILED when JsonMetricsSerializer throws an error', done => {
      const memoryStream = new MemoryWritable();
      const exporter = new OtlpJsonFileMetricExporter({ out: memoryStream });
      const serializeStub = sinon
        .stub(JsonMetricsSerializer, 'serializeRequest')
        .throws(new Error('Metric serialization failed'));

      const metrics: ResourceMetrics = {
        resource: resourceFromAttributes({}),
        scopeMetrics: [
          {
            scope: { name: 'scope' },
            metrics: [],
          },
        ],
      };

      exporter.export(metrics, result => {
        serializeStub.restore();
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        assert.strictEqual(
          result.error?.message,
          'Metric serialization failed'
        );
        done();
      });
    });

    it('returns FAILED when JsonMetricsSerializer returns empty result', done => {
      const memoryStream = new MemoryWritable();
      const exporter = new OtlpJsonFileMetricExporter({ out: memoryStream });
      const serializeStub = sinon
        .stub(JsonMetricsSerializer, 'serializeRequest')
        .returns(undefined as any);

      const metrics: ResourceMetrics = {
        resource: resourceFromAttributes({}),
        scopeMetrics: [
          {
            scope: { name: 'scope' },
            metrics: [],
          },
        ],
      };

      exporter.export(metrics, result => {
        serializeStub.restore();
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        assert.strictEqual(result.error?.message, 'Nothing to send');
        done();
      });
    });
  });
});
