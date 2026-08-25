/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  Tracer,
  TracerProvider,
  Meter,
  MeterOptions,
  MeterProvider,
} from '@opentelemetry/api';
import * as assert from 'assert';
import * as sinon from 'sinon';
import type { Instrumentation } from '../../src';
import { InstrumentationBase, registerInstrumentations } from '../../src';
import type {
  Logger,
  LoggerOptions,
  LoggerProvider,
} from '@opentelemetry/api-logs';
import type {
  ConfigProperties,
  ConfigProvider,
} from '@opentelemetry/api-config';

class DummyTracerProvider implements TracerProvider {
  getTracer(name: string, version?: string): Tracer {
    throw new Error('not implemented');
  }
}

class DummyMeterProvider implements MeterProvider {
  getMeter(name: string, version?: string, options?: MeterOptions): Meter {
    throw new Error('not implemented');
  }
}

class DummyLoggerProvider implements LoggerProvider {
  getLogger(name: string, version?: string, options?: LoggerOptions): Logger {
    throw new Error('not implemented');
  }
}

class DummyConfigProvider implements ConfigProvider {
  getInstrumentationConfig(name?: string): ConfigProperties {
    throw new Error('not implemented');
  }
  getGeneralInstrumentationConfig(): ConfigProperties {
    throw new Error('not implemented');
  }
}

class FooInstrumentation extends InstrumentationBase {
  init() {
    return [];
  }
  override enable() {}
  override disable() {}
  setConfigProvider(_configProvider: ConfigProvider) {}
}

describe('autoLoader', function () {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let unload: Function | undefined;

  afterEach(() => {
    sinon.restore();
    if (typeof unload === 'function') {
      unload();
      unload = undefined;
    }
  });

  describe('registerInstrumentations', function () {
    describe('InstrumentationBase', function () {
      let instrumentation: Instrumentation;
      let enableSpy: sinon.SinonSpy;
      let setTracerProviderSpy: sinon.SinonSpy;
      let setMeterProviderSpy: sinon.SinonSpy;
      let setLoggerProviderSpy: sinon.SinonSpy;
      let setConfigProviderSpy: sinon.SinonSpy;
      const tracerProvider = new DummyTracerProvider();
      const meterProvider = new DummyMeterProvider();
      const loggerProvider = new DummyLoggerProvider();
      const configProvider = new DummyConfigProvider();
      beforeEach(() => {
        instrumentation = new FooInstrumentation('foo', '1', {});
        enableSpy = sinon.spy(instrumentation, 'enable');
        setTracerProviderSpy = sinon.stub(instrumentation, 'setTracerProvider');
        setMeterProviderSpy = sinon.stub(instrumentation, 'setMeterProvider');
        setLoggerProviderSpy = sinon.stub(instrumentation, 'setLoggerProvider');
        setConfigProviderSpy = sinon.stub(instrumentation, 'setConfigProvider');
        unload = registerInstrumentations({
          instrumentations: [instrumentation],
          tracerProvider,
          meterProvider,
          loggerProvider,
          configProvider,
        });
      });

      afterEach(() => {
        Object.keys(require.cache).forEach(key => delete require.cache[key]);
        if (typeof unload === 'function') {
          unload();
          unload = undefined;
        }
      });

      it('should enable disabled instrumentation', function () {
        if (typeof unload === 'function') {
          unload();
          unload = undefined;
        }
        instrumentation = new FooInstrumentation('foo', '1', {
          enabled: false,
        });
        enableSpy = sinon.spy(instrumentation, 'enable');
        setTracerProviderSpy = sinon.stub(instrumentation, 'setTracerProvider');
        setMeterProviderSpy = sinon.stub(instrumentation, 'setMeterProvider');
        setLoggerProviderSpy = sinon.stub(instrumentation, 'setLoggerProvider');
        unload = registerInstrumentations({
          instrumentations: [instrumentation],
          tracerProvider,
          meterProvider,
          loggerProvider,
        });
        assert.strictEqual(enableSpy.callCount, 1);
      });

      it('should NOT enable enabled instrumentation', function () {
        assert.strictEqual(enableSpy.callCount, 0);
      });

      it('should set TracerProvider', function () {
        assert.strictEqual(setTracerProviderSpy.callCount, 1);
        assert.ok(setTracerProviderSpy.lastCall.args[0] === tracerProvider);
        assert.strictEqual(setTracerProviderSpy.lastCall.args.length, 1);
      });

      it('should set MeterProvider', function () {
        assert.strictEqual(setMeterProviderSpy.callCount, 1);
        assert.ok(setMeterProviderSpy.lastCall.args[0] === meterProvider);
        assert.strictEqual(setMeterProviderSpy.lastCall.args.length, 1);
      });

      it('should set LoggerProvider', function () {
        assert.strictEqual(setLoggerProviderSpy.callCount, 1);
        assert.ok(setLoggerProviderSpy.lastCall.args[0] === loggerProvider);
        assert.strictEqual(setLoggerProviderSpy.lastCall.args.length, 1);
      });

      it('should set ConfigProvider (if setConfigProvider implemented)', function () {
        assert.strictEqual(setConfigProviderSpy.callCount, 1);
        assert.ok(setConfigProviderSpy.lastCall.args[0] === configProvider);
        assert.strictEqual(setConfigProviderSpy.lastCall.args.length, 1);
      });
    });
  });
});
