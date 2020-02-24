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
import {
  Labels,
  NoopMeterProvider,
  NOOP_BOUND_COUNTER,
  NOOP_BOUND_MEASURE,
  NOOP_COUNTER_METRIC,
  NOOP_MEASURE_METRIC,
} from '../../src';

describe('NoopMeter', () => {
  it('should not crash', () => {
    const meter = new NoopMeterProvider().getMeter('test-noop');
    const counter = meter.createCounter('some-name');
    const labels = {} as Labels;
    const labelSet = meter.labels(labels);

    // ensure NoopMetric does not crash.
    counter.bind(labelSet).add(1);
    counter.unbind(labelSet);

    // ensure the correct noop const is returned
    assert.strictEqual(counter, NOOP_COUNTER_METRIC);
    assert.strictEqual(counter.bind(labelSet), NOOP_BOUND_COUNTER);
    counter.clear();

    const measure = meter.createMeasure('some-name');
    measure.bind(labelSet).record(1);

    // ensure the correct noop const is returned
    assert.strictEqual(measure, NOOP_MEASURE_METRIC);
    assert.strictEqual(measure.bind(labelSet), NOOP_BOUND_MEASURE);

    const options = {
      component: 'tests',
      description: 'the testing package',
    };

    const measureWithOptions = meter.createMeasure('some-name', options);
    assert.strictEqual(measureWithOptions, NOOP_MEASURE_METRIC);
    const counterWithOptions = meter.createCounter('some-name', options);
    assert.strictEqual(counterWithOptions, NOOP_COUNTER_METRIC);
  });
});
