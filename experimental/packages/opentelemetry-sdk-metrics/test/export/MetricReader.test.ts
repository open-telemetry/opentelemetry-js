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
import * as sinon from 'sinon';
import { MeterProvider } from '../../src/MeterProvider';
import { assertRejects } from '../test-utils';
import { emptyResourceMetrics, TestMetricProducer } from './TestMetricProducer';
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

  describe('setMetricProducer', () => {
    it('should initialize the metric reader', async () => {
      const reader = new TestMetricReader();

      reader.setMetricProducer(new TestMetricProducer());
      const result = await reader.collect();

      assert.deepStrictEqual(result, {
        resourceMetrics: emptyResourceMetrics,
        errors: [],
      });
      await reader.shutdown();
    });
  });

  describe('collect', () => {
    it('should throw on non-initialized instance', async () => {
      const reader = new TestMetricReader();

      await assertRejects(() => reader.collect(), /MetricReader is not bound to a MetricProducer/);
    });

    it('should return empty on shut-down instance', async () => {
      const reader = new TestMetricReader();

      reader.setMetricProducer(new TestMetricProducer());

      await reader.shutdown();
      assertRejects(reader.collect(), /MetricReader is shutdown/);
    });

    it('should call MetricProduce.collect with timeout', async () => {
      const reader = new TestMetricReader();
      const producer = new TestMetricProducer();
      reader.setMetricProducer(producer);

      const collectStub = sinon.stub(producer, 'collect');

      await reader.collect({ timeoutMillis: 20 });
      assert(collectStub.calledOnce);
      const args = collectStub.args[0];
      assert.deepStrictEqual(args, [{ timeoutMillis: 20 }]);

      await reader.shutdown();
    });
  });
});
