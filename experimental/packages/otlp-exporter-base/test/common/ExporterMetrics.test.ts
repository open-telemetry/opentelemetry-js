/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createNoopMeter } from '@opentelemetry/api';
import * as sinon from 'sinon';
import { ExporterMetrics } from '../../src/ExporterMetrics';

describe('ExporterMetrics', function () {
  afterEach(function () {
    sinon.restore();
  });

  const signals = [
    { name: 'span', unit: '{span}', displayName: 'spans' },
    { name: 'log', unit: '{log_record}', displayName: 'log records' },
    {
      name: 'metric_data_point',
      unit: '{data_point}',
      displayName: 'metric data points',
    },
  ] as const;

  for (const signal of signals) {
    it(`uses semantic convention descriptors for ${signal.name} instruments`, function () {
      const meter = createNoopMeter();
      const inflight = sinon.spy(meter, 'createUpDownCounter');
      const exported = sinon.spy(meter, 'createCounter');

      new ExporterMetrics({
        componentType: `descriptor_test_exporter_${signal.name}`,
        metricsHelper: { name: signal.name, countItems: () => 0 },
        meterProvider: { getMeter: () => meter },
        url: undefined,
        responseAttributesFromError: () => ({}),
      });

      sinon.assert.calledOnceWithExactly(
        inflight,
        `otel.sdk.exporter.${signal.name}.inflight`,
        {
          unit: signal.unit,
          description: `The number of ${signal.displayName} which were passed to the exporter, but that have not been exported yet (neither successful, nor failed).`,
        }
      );
      sinon.assert.calledOnceWithExactly(
        exported,
        `otel.sdk.exporter.${signal.name}.exported`,
        {
          unit: signal.unit,
          description: `The number of ${signal.displayName} for which the export has finished, either successful or failed.`,
        }
      );
    });
  }
});
