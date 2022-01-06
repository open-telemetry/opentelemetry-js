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
import { NOOP_METER } from '@opentelemetry/api-metrics-wip';
import { Meter } from '../src/Meter';
import { MeterProvider } from '../src/MeterProvider';
import { defaultResource } from './util';

describe('MeterProvider', () => {
  describe('constructor', () => {
    it('should construct without exceptions', () => {
      const meterProvider = new MeterProvider();
      assert(meterProvider instanceof MeterProvider);
    });

    it('construct with resource', () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });
      assert(meterProvider instanceof MeterProvider);
    });
  });

  describe('getMeter', () => {
    it('should get a meter', () => {
      const meterProvider = new MeterProvider();
      const meter = meterProvider.getMeter('meter1', '1.0.0');
      assert(meter instanceof Meter);
    });

    it('get a noop meter on shutdown', () => {
      const meterProvider = new MeterProvider();
      meterProvider.shutdown();
      const meter = meterProvider.getMeter('meter1', '1.0.0');
      assert.strictEqual(meter, NOOP_METER);
    });
  });
});
