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

import { Observable } from '@opentelemetry/api-metrics';
import * as assert from 'assert';
import {
  CounterInstrument,
  HistogramInstrument,
  ObservableCounterInstrument,
  ObservableGaugeInstrument,
  ObservableUpDownCounterInstrument,
  UpDownCounterInstrument,
} from '../src/Instruments';
import { Meter } from '../src/Meter';
import { MeterProviderSharedState } from '../src/state/MeterProviderSharedState';
import { MeterSharedState } from '../src/state/MeterSharedState';
import { defaultInstrumentationScope, defaultResource } from './util';

describe('Meter', () => {
  describe('createCounter', () => {
    it('should create counter', () => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(defaultResource),
        defaultInstrumentationScope);
      const meter = new Meter(meterSharedState);
      const counter = meter.createCounter('foobar');
      assert(counter instanceof CounterInstrument);
    });
  });

  describe('createUpDownCounter', () => {
    it('should create up down counter', () => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(defaultResource),
        defaultInstrumentationScope);
      const meter = new Meter(meterSharedState);
      const upDownCounter = meter.createUpDownCounter('foobar');
      assert(upDownCounter instanceof UpDownCounterInstrument);
    });
  });

  describe('createHistogram', () => {
    it('should create histogram', () => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(defaultResource),
        defaultInstrumentationScope);
      const meter = new Meter(meterSharedState);
      const histogram = meter.createHistogram('foobar');
      assert(histogram instanceof HistogramInstrument);
    });
  });

  describe('createObservableGauge', () => {
    it('should create observable gauge', () => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(defaultResource),
        defaultInstrumentationScope);
      const meter = new Meter(meterSharedState);
      const observableGauge = meter.createObservableGauge('foobar');
      assert(observableGauge instanceof ObservableGaugeInstrument);
    });
  });

  describe('createObservableCounter', () => {
    it('should create observable counter', () => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(defaultResource),
        defaultInstrumentationScope);
      const meter = new Meter(meterSharedState);
      const observableCounter = meter.createObservableCounter('foobar');
      assert(observableCounter instanceof ObservableCounterInstrument);
    });
  });

  describe('createObservableUpDownCounter', () => {
    it('should create observable up-down-counter', () => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(defaultResource),
        defaultInstrumentationScope);
      const meter = new Meter(meterSharedState);
      const observableUpDownCounter = meter.createObservableUpDownCounter('foobar');
      assert(observableUpDownCounter instanceof ObservableUpDownCounterInstrument);
    });
  });

  describe('addBatchObservableCallback', () => {
    it('should register callback without exception', () => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(defaultResource),
        defaultInstrumentationScope);
      const meter = new Meter(meterSharedState);
      const observableGauge = meter.createObservableGauge('test-gauge');
      const observableCounter = meter.createObservableCounter('test-counter');
      const observableUpDownCounter = meter.createObservableUpDownCounter('test-up-down-counter');

      meter.addBatchObservableCallback(() => {}, [ observableGauge, observableCounter, observableUpDownCounter ]);
    });

    it('should be tolerant with unknown observables', () => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(defaultResource),
        defaultInstrumentationScope);
      const meter = new Meter(meterSharedState);

      const observables = [
        {},
        1,
        'foo',
        Symbol(),
      ] as unknown as Observable[];
      meter.addBatchObservableCallback(() => {}, observables);
    });
  });

  describe('removeBatchObservableCallback', () => {
    it('should remove callback without exception', () => {
      const meterSharedState = new MeterSharedState(
        new MeterProviderSharedState(defaultResource),
        defaultInstrumentationScope);
      const meter = new Meter(meterSharedState);
      const observableGauge = meter.createObservableGauge('test-gauge');
      const observableCounter = meter.createObservableCounter('test-counter');
      const observableUpDownCounter = meter.createObservableUpDownCounter('test-up-down-counter');

      const callback = () => {};
      meter.addBatchObservableCallback(callback, [ observableGauge, observableCounter, observableUpDownCounter ]);
      meter.removeBatchObservableCallback(callback, [ observableGauge, observableCounter, observableUpDownCounter ]);

      // Remove a not registered callback.
      meter.removeBatchObservableCallback(() => {}, []);
    });
  });
});
