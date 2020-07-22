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
import { PushController, MeterProvider } from '../../../src';
import { TestExporter } from '../../helper';

describe('PushController', () => {
  describe('constructor', () => {
    it('should construct an instance', () => {
      const controller = new PushController();
      assert.ok(controller instanceof PushController);
    });
  });

  describe('shutdown', () => {
    it('should shutdown non-registered PushController without errors', () => {
      const controller = new PushController();
      controller.shutdown();
    });

    it('should shutdown registered PushController without errors', () => {
      const controller = new PushController();
      const meterProvider = new MeterProvider();
      meterProvider.addController(controller);
      controller.shutdown();
    });
  });

  describe('collect', () => {
    let clock: sinon.SinonFakeTimers;
    beforeEach(() => {
      clock = sinon.useFakeTimers();
    });
    afterEach(() => {
      clock.restore();
    });
    it('should collect on tick', async () => {
      const meterProvider = new MeterProvider();
      const exporter = new TestExporter();
      const controller = new PushController({ interval: 1000, exporter });
      meterProvider.addController(controller);

      clock.tick(1000);
      await exporter.onNextExport();

      controller.shutdown();
    });
  });

  describe('shutdown', () => {
    it('should shutdown with the exporter', () => {
      const exporter = new TestExporter();
      const controller = new PushController({ interval: 1000, exporter });

      const spy = sinon.spy(exporter, 'shutdown');
      controller.shutdown();
      assert(spy.called);
    });

    it('should throw on registering with metric collector if already shutdown', () => {
      const meterProvider = new MeterProvider();
      const exporter = new TestExporter();
      const controller = new PushController({ interval: 1000, exporter });
      controller.shutdown();

      assert.throws(
        () => {
          meterProvider.addController(controller);
        },
        {
          message:
            'A shutdown PushController been registered with new MetricController.',
        }
      );
    });
  });
});
