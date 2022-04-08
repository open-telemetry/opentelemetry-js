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

import * as assert from 'assert';
import { MeterProvider } from '../../src/MeterProvider';
import { TestMetricReader } from './TestMetricReader';


describe('MetricReader', () => {
  describe('setMetricProducer', () => {
    it('The SDK MUST NOT allow a MetricReader instance to be registered on more than one MeterProvider instance', () => {
      const reader = new TestMetricReader();
      const meterProvider1 = new MeterProvider();
      const meterProvider2 = new MeterProvider();

      meterProvider1.addMetricReader(reader);
      assert.throws(() => meterProvider1.addMetricReader(reader), /MetricReader can not be bound to a MeterProvider again/);
      assert.throws(() => meterProvider2.addMetricReader(reader), /MetricReader can not be bound to a MeterProvider again/);
    });
  });
});
