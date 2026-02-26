/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
