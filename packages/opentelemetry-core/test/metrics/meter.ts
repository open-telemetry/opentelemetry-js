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

import * as assert from 'assert';
import { DistributedContext, SpanContext } from '@opentelemetry/types';
import {
  NoopMeter,
  NOOP_GAUGE_HANDLE,
  NOOP_GAUGE_METRIC,
  NOOP_COUNTER_HANDLE,
  NOOP_COUNTER_METRIC,
  NOOP_MEASURE_HANDLE,
  NOOP_MEASURE_METRIC,
} from '../../src/metrics/NoopMeter';

describe('NoopTracer', () => {
  it('should not crash', () => {
    const meter = new NoopMeter();
    const counter = meter.createCounter('some-name');
    // ensure NoopMetric does not crash.
    counter.setCallback(() => {
      assert.fail('callback occurred');
    });
    counter.getHandle().add(1);
    counter.getHandle(['val1', 'val2']).add(1);
    counter.getDefaultHandle().add(1);
    counter.removeHandle();
    counter.removeHandle(['val1', 'val2']);

    // ensure the correct noop const is returned
    assert.strictEqual(counter, NOOP_COUNTER_METRIC);
    assert.strictEqual(
      counter.getHandle(['val1', 'val2']),
      NOOP_COUNTER_HANDLE
    );
    assert.strictEqual(counter.getDefaultHandle(), NOOP_COUNTER_HANDLE);
    counter.clear();

    const measure = meter.createMeasure('some-name');
    measure.getDefaultHandle().record(1);
    measure.getDefaultHandle().record(1, {});
    measure.getDefaultHandle().record(1, {}, {});

    // ensure the correct noop const is returned
    assert.strictEqual(measure, NOOP_MEASURE_METRIC);
    assert.strictEqual(measure.getDefaultHandle(), NOOP_MEASURE_HANDLE);
    assert.strictEqual(
      measure.getHandle(['val1', 'val2']),
      NOOP_MEASURE_HANDLE
    );

    const gauge = meter.createGauge('some-name');
    gauge.getDefaultHandle().set(1);

    // ensure the correct noop const is returned
    assert.strictEqual(gauge, NOOP_GAUGE_METRIC);
    assert.strictEqual(gauge.getDefaultHandle(), NOOP_GAUGE_HANDLE);
    assert.strictEqual(gauge.getHandle(['val1', 'val2']), NOOP_GAUGE_HANDLE);
  });
});
