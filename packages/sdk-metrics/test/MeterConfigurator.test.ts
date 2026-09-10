/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import type { InstrumentationScope } from '@opentelemetry/core';
import { createMeterConfigurator } from '../src/MeterConfigurator';
import { MeterProvider } from '../src/MeterProvider';
import { InMemoryMetricExporter } from '../src/export/InMemoryMetricExporter';
import { PeriodicExportingMetricReader } from '../src/export/PeriodicExportingMetricReader';
import { AggregationTemporality } from '../src/export/AggregationTemporality';

function scope(name: string): InstrumentationScope {
  return { name, version: '', schemaUrl: undefined };
}

describe('createMeterConfigurator', () => {
  it('returns config for exact name match', () => {
    const configurator = createMeterConfigurator([
      { name: 'my-meter', config: { disabled: true } },
    ]);
    assert.deepStrictEqual(configurator(scope('my-meter')), {
      disabled: true,
    });
  });

  it('returns config for wildcard pattern match', () => {
    const configurator = createMeterConfigurator([
      { name: 'noisy-lib-*', config: { disabled: true } },
    ]);
    assert.deepStrictEqual(configurator(scope('noisy-lib-foo')), {
      disabled: true,
    });
  });

  it('returns first matching condition when multiple match', () => {
    const configurator = createMeterConfigurator([
      { name: 'noisy-lib-*', config: { disabled: true } },
      { name: '*', config: { disabled: false } },
    ]);
    assert.deepStrictEqual(configurator(scope('noisy-lib-foo')), {
      disabled: true,
    });
  });

  it('returns null when nothing matches', () => {
    const configurator = createMeterConfigurator([
      { name: 'some-other-meter', config: { disabled: true } },
    ]);
    assert.strictEqual(configurator(scope('my-meter')), null);
  });
});

describe('MeterProvider with meterConfigurator', () => {
  it('disables instruments for meters matching a disabled pattern', async () => {
    const exporter = new InMemoryMetricExporter(
      AggregationTemporality.CUMULATIVE
    );
    const reader = new PeriodicExportingMetricReader({
      exporter,
      exportIntervalMillis: 100000,
      exportTimeoutMillis: 100000,
    });

    const meterProvider = new MeterProvider({
      readers: [reader],
      meterConfigurator: createMeterConfigurator([
        { name: 'disabled-meter', config: { disabled: true } },
      ]),
    });

    const disabledCounter = meterProvider
      .getMeter('disabled-meter')
      .createCounter('disabled.counter');
    const enabledCounter = meterProvider
      .getMeter('enabled-meter')
      .createCounter('enabled.counter');

    disabledCounter.add(1);
    enabledCounter.add(1);

    const { resourceMetrics, errors } = await reader.collect();
    assert.strictEqual(errors.length, 0);

    const metricNames = resourceMetrics.scopeMetrics
      .flatMap(sm => sm.metrics)
      .map(m => m.descriptor.name);

    assert.ok(metricNames.includes('enabled.counter'));
    assert.ok(!metricNames.includes('disabled.counter'));

    await meterProvider.shutdown();
  });
});