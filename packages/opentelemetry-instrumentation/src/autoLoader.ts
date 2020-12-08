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

import * as api from '@opentelemetry/api';
import {
  enableInstrumentations,
  parseInstrumentationOptions,
} from './autoLoaderUtils';
import { loadOldPlugins } from './platform';
import { AutoLoaderOptions } from './types';

export function registerInstrumentations(options: AutoLoaderOptions) {
  const {
    instrumentations,
    pluginsNode,
    pluginsWeb,
  } = parseInstrumentationOptions(options.instrumentations);
  const tracerWithLogger = (options.tracerProvider as unknown) as {
    logger: api.Logger;
  };
  const tracerProvider =
    options.tracerProvider || api.trace.getTracerProvider();
  const meterProvider = options.meterProvider || api.metrics.getMeterProvider();
  const logger =
    options.logger || tracerWithLogger?.logger || new api.NoopLogger();

  enableInstrumentations(
    instrumentations,
    logger,
    tracerProvider,
    meterProvider
  );

  loadOldPlugins(pluginsNode, pluginsWeb, logger, tracerProvider);
}
