/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TracerProvider, MeterProvider } from '@opentelemetry/api';
import { config } from '@opentelemetry/api-config';
import type { Instrumentation } from './types';
import type { LoggerProvider } from '@opentelemetry/api-logs';

/**
 * Enable instrumentations
 * @param instrumentations
 * @param tracerProvider
 * @param meterProvider
 */
export function enableInstrumentations(
  instrumentations: Instrumentation[],
  tracerProvider?: TracerProvider,
  meterProvider?: MeterProvider,
  loggerProvider?: LoggerProvider
): void {
  const configProvider = config.getConfigProvider();
  for (let i = 0, j = instrumentations.length; i < j; i++) {
    const instrumentation = instrumentations[i];
    if (tracerProvider) {
      instrumentation.setTracerProvider(tracerProvider);
    }
    if (meterProvider) {
      instrumentation.setMeterProvider(meterProvider);
    }
    if (loggerProvider && instrumentation.setLoggerProvider) {
      instrumentation.setLoggerProvider(loggerProvider);
    }

    // Let the instrumentation apply its own declarative config if its base supports it.
    instrumentation.applyDeclarativeConfig?.();

    // `enabled` is owned by the registrar, not the instrumentation. Gate
    // registration here, so disable works for every instrumentation whether or
    // not it reads its own config.
    const enabled = configProvider
      .getInstrumentationConfig(instrumentation.instrumentationName)
      .getBoolean('enabled');
    if (enabled === false) {
      instrumentation.disable();
    } else if (!instrumentation.getConfig().enabled) {
      // instrumentations already enable during creation, so enable here only if
      // the user disabled that via the constructor; registering enables them.
      instrumentation.enable();
    }
  }
}

/**
 * Disable instrumentations
 * @param instrumentations
 */
export function disableInstrumentations(
  instrumentations: Instrumentation[]
): void {
  instrumentations.forEach(instrumentation => instrumentation.disable());
}
