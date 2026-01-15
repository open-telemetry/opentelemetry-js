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

import { diag, metrics, trace } from '@opentelemetry/api';
import { logs } from '@opentelemetry/api-logs';

import * as shimmer from '../../shimmer';
import type {
  Instrumentation,
  InstrumentationConfig,
  InstrumentationDelegate,
} from '../../types';

const _kOtDiag = Symbol('otel_instrumentation_diag');
const _kOtEnabled = Symbol('otel_instrumentation_enabled');
const _kOtModules = Symbol('otel_instrumentation_modules');
const _kOtHooks = Symbol('otel_instrumentation_hooks');

/**
 * sets a value in the target object for the given symbol
 */
/* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
function set(target: any, key: symbol, val: unknown) {
  target[key] = val;
}

/**
 * gets the value stored for the symbol.
 */
/* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
function get<T>(target: any, key: symbol): T {
  return target[key] as T;
}

export function createInstrumentation<T extends InstrumentationConfig>(
  delegate: InstrumentationDelegate<T>,
  config: T
): Instrumentation<T> {
  const delegateConfig = { enabled: true, ...config };
  const diagLogger = diag.createComponentLogger({ namespace: delegate.name });
  delegate.setConfig(delegateConfig);
  delegate.setDiag(diagLogger);
  delegate.setTracer?.(trace.getTracer(delegate.name, delegate.version));
  delegate.setMeter?.(metrics.getMeter(delegate.name, delegate.version));
  delegate.setLogger?.(logs.getLogger(delegate.name, delegate.version));

  // Keep the diagLogger
  set(delegate, _kOtDiag, diagLogger);
  set(delegate, _kOtHooks, []);
  // Set the modules
  // TODO: for now we're not doing auto patch/unpatch bu I think it could be done
  let modules = delegate.init?.(shimmer);
  if (modules && !Array.isArray(modules)) {
    modules = [modules];
  }
  set(delegate, _kOtModules, modules || []);
  // And enable
  if (delegateConfig.enabled) {
    enableInstrumentation(delegate);
  }

  return {
    _delegate: delegate, // For testing purposes
    instrumentationName: delegate.name,
    instrumentationVersion: delegate.version,
    setConfig(cfg) {
      delegate.setConfig(cfg);
    },
    getConfig() {
      return delegate.getConfig();
    },
    enable() {
      enableInstrumentation(delegate);
      delegate.enable?.();
    },
    disable() {
      disableInstrumentation(delegate);
      delegate.disable?.();
    },
    setTracerProvider(traceProv) {
      delegate.setTracer?.(
        traceProv.getTracer(delegate.name, delegate.version)
      );
    },
    setMeterProvider(meterProv) {
      delegate.setMeter?.(meterProv.getMeter(delegate.name, delegate.version));
    },
    setLoggerProvider(loggerProv) {
      delegate.setLogger?.(
        loggerProv.getLogger(delegate.name, delegate.version)
      );
    },
  } as Instrumentation<T>;
}

/**
 * Registers IITM and RITM hooks the 1st time is called and
 * applies the patches on any subsequent call if not enabled.
 */
function enableInstrumentation(delegate: InstrumentationDelegate) {
  const enabled = get<boolean>(delegate, _kOtEnabled);
  if (enabled) {
    return;
  }

  set(delegate, _kOtEnabled, true);
  // TODO: if there was a browser version of `init` we
  // could have the patch & unpatch logic here
}

/**
 * Unpatches the modules if the instrumentation is enabled.
 */
function disableInstrumentation(delegate: InstrumentationDelegate) {
  const enabled = get<boolean>(delegate, _kOtEnabled);
  if (!enabled) {
    return;
  }

  set(delegate, _kOtEnabled, false);
  // TODO: if there was a browser version of `init` we
  // could have the patch & unpatch logic here
}
