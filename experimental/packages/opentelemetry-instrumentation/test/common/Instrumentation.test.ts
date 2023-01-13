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
import {
  Instrumentation,
  InstrumentationBase,
  InstrumentationConfig,
} from '../../src';

import { MeterProvider } from '@opentelemetry/sdk-metrics';

interface TestInstrumentationConfig extends InstrumentationConfig {
  isActive?: boolean;
}

class TestInstrumentation extends InstrumentationBase {
  constructor(config: TestInstrumentationConfig & InstrumentationConfig = {}) {
    super('test', '1.0.0', Object.assign({}, config));
  }
  override enable() {}
  override disable() {}
  init() {}
}

describe('BaseInstrumentation', () => {
  let instrumentation: Instrumentation;
  beforeEach(() => {
    instrumentation = new TestInstrumentation();
  });

  it('should create an instance', () => {
    assert.ok(instrumentation instanceof InstrumentationBase);
  });

  it('should have a name', () => {
    assert.deepStrictEqual(instrumentation.instrumentationName, 'test');
  });

  it('should have a version', () => {
    assert.deepStrictEqual(instrumentation.instrumentationVersion, '1.0.0');
  });

  describe('constructor', () => {
    it('should enable instrumentation by default', () => {
      let enableCalled = false;
      let updateMetricInstrumentsCalled = false;
      class TestInstrumentation2 extends TestInstrumentation {
        override enable() {
          enableCalled = true;
        }
        override _updateMetricInstruments() {
          updateMetricInstrumentsCalled = true;
        }
      }
      instrumentation = new TestInstrumentation2();
      assert.strictEqual(enableCalled, true);
      assert.strictEqual(updateMetricInstrumentsCalled, true);
    });
  });

  describe('setMeterProvider', () => {
    let otelTestingMeterProvider: MeterProvider;
    beforeEach(() => {
      otelTestingMeterProvider = new MeterProvider();
    });
    it('should call _updateMetricInstruments', () => {
      let called = true;
      class TestInstrumentation2 extends TestInstrumentation {
        override _updateMetricInstruments() {
          called = true;
        }
      }
      instrumentation = new TestInstrumentation2();
      instrumentation.setMeterProvider(otelTestingMeterProvider);
      assert.strictEqual(called, true);
    });
  });

  describe('getConfig', () => {
    it('should return instrumentation config', () => {
      const instrumentation: Instrumentation = new TestInstrumentation({
        isActive: false,
      });
      const configuration =
        instrumentation.getConfig() as TestInstrumentationConfig;
      assert.notStrictEqual(configuration, null);
      assert.strictEqual(configuration.isActive, false);
    });
  });

  describe('setConfig', () => {
    it('should set a new config for instrumentation', () => {
      const instrumentation: Instrumentation = new TestInstrumentation();
      const config: TestInstrumentationConfig = {
        isActive: true,
      };
      instrumentation.setConfig(config);
      const configuration =
        instrumentation.getConfig() as TestInstrumentationConfig;
      assert.strictEqual(configuration.isActive, true);
    });
  });
});
