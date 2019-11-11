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
import * as sinon from 'sinon';
import { ConsoleMetricExporter, Meter, GaugeMetric } from '../../src';

describe('ConsoleMetricExporter', () => {
  let consoleExporter: ConsoleMetricExporter;
  let previousConsoleLog: any;

  beforeEach(() => {
    previousConsoleLog = console.log;
    console.log = () => {};
    consoleExporter = new ConsoleMetricExporter();
  });

  afterEach(() => {
    console.log = previousConsoleLog;
  });

  describe('.export()', () => {
    it('should export information about metrics', () => {
      const spyConsole = sinon.spy(console, 'log');

      const meter = new Meter();
      meter.addExporter(consoleExporter);
      const gauge = meter.createGauge('gauge', {
        description: 'a test description',
        labelKeys: ['key1', 'key2'],
      }) as GaugeMetric;
      const handle = gauge.getHandle(
        meter.labels({ key1: 'labelValue1', key2: 'labelValue2' })
      );
      handle.set(10);
      const [descriptor, timeseries] = spyConsole.args;
      assert.deepStrictEqual(descriptor, [
        { description: 'a test description', name: 'gauge' },
      ]);
      assert.deepStrictEqual(timeseries, [
        {
          labels: { key1: 'labelValue1', key2: 'labelValue2' },
          value: 10,
        },
      ]);
    });
  });
});
