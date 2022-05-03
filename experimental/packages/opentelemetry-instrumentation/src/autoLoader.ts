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

import { trace } from '@opentelemetry/api';
import { metrics } from '@opentelemetry/api-metrics';
import {
  disableInstrumentations,
  enableInstrumentations,
  parseInstrumentationOptions,
} from './autoLoaderUtils';
import { AutoLoaderOptions } from './types_internal';

/**
 * It will register instrumentations and plugins
 * @param options
 * @return returns function to unload instrumentation and plugins that were
 *   registered
 */
export function registerInstrumentations(
  options: AutoLoaderOptions
): () => void {
  const { instrumentations } = parseInstrumentationOptions(
    options.instrumentations
  );
  const tracerProvider = options.tracerProvider || trace.getTracerProvider();
  const meterProvider = options.meterProvider || metrics.getMeterProvider();

  enableInstrumentations(instrumentations, tracerProvider, meterProvider);

  return () => {
    disableInstrumentations(instrumentations);
  };
}
