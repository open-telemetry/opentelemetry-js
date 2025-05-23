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

import { Observable, diag } from '@opentelemetry/api';
import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  CounterInstrument,
  GaugeInstrument,
  HistogramInstrument,
  ObservableCounterInstrument,
  ObservableGaugeInstrument,
  ObservableUpDownCounterInstrument,
  UpDownCounterInstrument,
} from '../src/Instruments';
import { Meter } from '../src/Meter';
import { MeterProviderSharedState } from '../src/state/MeterProviderSharedState';
import { MeterSharedState } from '../src/state/MeterSharedState';
import {
  defaultInstrumentationScope,
  testResource,
  invalidNames,
  validNames,
} from './util';

describe('Meter', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('createCounter', () => {
    testWithNames('counter', name => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(testResource),
        defaultInstrumentationScope
      );
      const meter = new Meter(meterSharedState);
      const counter = meter.createCounter(name);
      assert.ok(counter instanceof CounterInstrument);
    });
  });

  describe('createUpDownCounter', () => {
    testWithNames('UpDownCounter', name => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(testResource),
        defaultInstrumentationScope
      );
      const meter = new Meter(meterSharedState);
      const upDownCounter = meter.createUpDownCounter(name);
      assert.ok(upDownCounter instanceof UpDownCounterInstrument);
    });
  });

  describe('createHistogram', () => {
    testWithNames('Histogram', name => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(testResource),
        defaultInstrumentationScope
      );
      const meter = new Meter(meterSharedState);
      const histogram = meter.createHistogram(name);
      assert.ok(histogram instanceof HistogramInstrument);
    });
  });

  describe('createObservableGauge', () => {
    testWithNames('ObservableGauge', name => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(testResource),
        defaultInstrumentationScope
      );
      const meter = new Meter(meterSharedState);
      const observableGauge = meter.createObservableGauge(name);
      assert.ok(observableGauge instanceof ObservableGaugeInstrument);
    });
  });

  describe('createGauge', () => {
    testWithNames('Gauge', name => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(testResource),
        defaultInstrumentationScope
      );
      const meter = new Meter(meterSharedState);
      const Gauge = meter.createGauge(name);
      assert.ok(Gauge instanceof GaugeInstrument);
    });
  });

  describe('createObservableCounter', () => {
    testWithNames('ObservableCounter', name => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(testResource),
        defaultInstrumentationScope
      );
      const meter = new Meter(meterSharedState);
      const observableCounter = meter.createObservableCounter(name);
      assert.ok(observableCounter instanceof ObservableCounterInstrument);
    });
  });

  describe('createObservableUpDownCounter', () => {
    testWithNames('ObservableUpDownCounter', name => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(testResource),
        defaultInstrumentationScope
      );
      const meter = new Meter(meterSharedState);
      const observableUpDownCounter = meter.createObservableUpDownCounter(name);
      assert.ok(
        observableUpDownCounter instanceof ObservableUpDownCounterInstrument
      );
    });
  });

  describe('addBatchObservableCallback', () => {
    it('should register callback without exception', () => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(testResource),
        defaultInstrumentationScope
      );
      const meter = new Meter(meterSharedState);
      const observableGauge = meter.createObservableGauge('test-gauge');
      const observableCounter = meter.createObservableCounter('test-counter');
      const observableUpDownCounter = meter.createObservableUpDownCounter(
        'test-up-down-counter'
      );

      meter.addBatchObservableCallback(() => {}, [
        observableGauge,
        observableCounter,
        observableUpDownCounter,
      ]);
    });

    it('should be tolerant with unknown observables', () => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(testResource),
        defaultInstrumentationScope
      );
      const meter = new Meter(meterSharedState);

      const observables = [{}, 1, 'foo', Symbol()] as unknown as Observable[];
      meter.addBatchObservableCallback(() => {}, observables);
    });
  });

  describe('removeBatchObservableCallback', () => {
    it('should remove callback without exception', () => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(testResource),
        defaultInstrumentationScope
      );
      const meter = new Meter(meterSharedState);
      const observableGauge = meter.createObservableGauge('test-gauge');
      const observableCounter = meter.createObservableCounter('test-counter');
      const observableUpDownCounter = meter.createObservableUpDownCounter(
        'test-up-down-counter'
      );

      const callback = () => {};
      meter.addBatchObservableCallback(callback, [
        observableGauge,
        observableCounter,
        observableUpDownCounter,
      ]);
      meter.removeBatchObservableCallback(callback, [
        observableGauge,
        observableCounter,
        observableUpDownCounter,
      ]);

      // Remove a not registered callback.
      meter.removeBatchObservableCallback(() => {}, []);
    });
  });
});

function testWithNames(type: string, tester: (name: string) => void) {
  for (const invalidName of invalidNames) {
    it(`should warn with invalid name ${invalidName} for ${type}`, () => {
      const warnStub = sinon.spy(diag, 'warn');
      tester(invalidName);
      assert.strictEqual(warnStub.callCount, 1);
      assert.ok(warnStub.calledWithMatch('Invalid metric name'));
    });
  }

  for (const validName of validNames) {
    it(`should not warn with valid name ${validName} for ${type}`, () => {
      const warnStub = sinon.spy(diag, 'warn');
      tester(validName);
      assert.strictEqual(warnStub.callCount, 0);
    });
  }
}
