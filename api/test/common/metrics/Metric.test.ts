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

import { Counter, UpDownCounter, Histogram } from '../../../src';

describe('Metric', function () {
  describe('Counter', function () {
    it('enable not to define any type', function () {
      const counter: Counter = {
        add(_value: number, _attribute: unknown) {},
      };
      counter.add(1, { 'some-attribute': 'value' });
    });

    it('enable to use with type', function () {
      type Attributes = {
        'some-attribute': string;
      };
      const counter: Counter<Attributes> = {
        add(_value: number, _attribute: Attributes) {},
      };
      counter.add(1, { 'some-attribute': 'value' });
    });

    it('disable wrong attributes by typing', function () {
      type Attributes = {
        'some-attribute': string;
      };
      const counter: Counter<Attributes> = {
        add(_value: number, _attribute: Attributes) {},
      };
      // @ts-expect-error Expecting the type of Attributes
      counter.add(1, { 'another-attribute': 'value' });
    });
  });

  describe('UpDownCounter', function () {
    it('enable not to define any type', function () {
      const counter: UpDownCounter = {
        add(_value: number, _attribute: unknown) {},
      };
      counter.add(1, { 'some-attribute': 'value' });
    });

    it('enable to use with type', function () {
      type Attributes = {
        'some-attribute': string;
      };
      const counter: UpDownCounter<Attributes> = {
        add(_value: number, _attribute: Attributes) {},
      };
      counter.add(1, { 'some-attribute': 'value' });
    });

    it('disable wrong attributes by typing', function () {
      type Attributes = {
        'some-attribute': string;
      };
      const counter: UpDownCounter<Attributes> = {
        add(_value: number, _attribute: Attributes) {},
      };
      // @ts-expect-error Expecting the type of Attributes
      counter.add(1, { 'another-attribute': 'value' });
    });
  });

  describe('Histogram', function () {
    it('enable not to define any type', function () {
      const counter: Histogram = {
        record(_value: number, _attribute: unknown) {},
      };
      counter.record(1, { 'some-attribute': 'value' });
    });

    it('enable to use with type', function () {
      type Attributes = {
        'some-attribute': string;
      };
      const counter: Histogram<Attributes> = {
        record(_value: number, _attribute: Attributes) {},
      };
      counter.record(1, { 'some-attribute': 'value' });
    });

    it('disable wrong attributes by typing', function () {
      type Attributes = {
        'some-attribute': string;
      };
      const counter: Histogram<Attributes> = {
        record(_value: number, _attribute: Attributes) {},
      };
      // @ts-expect-error Expecting the type of Attributes
      counter.record(1, { 'another-attribute': 'value' });
    });
  });
});
