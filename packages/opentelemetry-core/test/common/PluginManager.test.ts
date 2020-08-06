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

import {
  trace,
  metrics,
  NoopMeterProvider,
  NoopTracerProvider,
} from '@opentelemetry/api';
import * as assert from 'assert';
import { PluginManager } from '../../src';

describe('PluginManager', () => {
  beforeEach(() => {
    trace.disable();
    metrics.disable();
  });

  it('global meter/tracer provider should return Noop meter/tracer by default', () => {
    const pluginManager = new PluginManager();
    assert.ok(pluginManager['meterProvider'] instanceof NoopMeterProvider);
    assert.ok(pluginManager['tracerProvider'] instanceof NoopTracerProvider);
  });

  it('should use global meter/tracer provider by default', () => {
    const dummyTracerProvider = new NoopTracerProvider();
    const dummyMeterProvider = new NoopMeterProvider();
    trace.setGlobalTracerProvider(dummyTracerProvider);
    metrics.setGlobalMeterProvider(dummyMeterProvider);
    const pluginManager = new PluginManager({});
    assert.ok(pluginManager['tracerProvider'] === dummyTracerProvider);
    assert.ok(pluginManager['meterProvider'] === dummyMeterProvider);
  });

  it('should use passed meter/tracer provider when other meter/tracer providers are registered', () => {
    const unregisteredTracerProvider = new NoopTracerProvider();
    const unregisteredMeterProvider = new NoopMeterProvider();
    const registeredTracerProvider = new NoopTracerProvider();
    const registeredMeterProvider = new NoopMeterProvider();
    trace.setGlobalTracerProvider(registeredTracerProvider);
    metrics.setGlobalMeterProvider(registeredMeterProvider);
    const pluginManager = new PluginManager({
      tracerProvider: unregisteredTracerProvider,
      meterProvider: unregisteredMeterProvider,
    });
    assert.ok(pluginManager['tracerProvider'] === unregisteredTracerProvider);
    assert.ok(pluginManager['meterProvider'] === unregisteredMeterProvider);
  });
});
