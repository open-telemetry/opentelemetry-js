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

import { Logger, MeterProvider, TracerProvider } from '@opentelemetry/api';
import { Instrumentation } from './types';
import { AutoLoaderResult, InstrumentationOption } from './types_internal';

import {
  NodePlugins,
  NodePluginsTracerConfiguration,
  OldClassPlugin,
} from './types_plugin_only';

/**
 * Parses the options and returns instrumentations, node plugins and
 *   web plugins
 * @param options
 */
export function parseInstrumentationOptions(
  options: InstrumentationOption[] = []
): AutoLoaderResult {
  let instrumentations: Instrumentation[] = [];
  let pluginsNode: NodePlugins = {};
  let pluginsWeb: OldClassPlugin[] = [];
  for (let i = 0, j = options.length; i < j; i++) {
    const option = options[i] as any;
    if (Array.isArray(option)) {
      const results = parseInstrumentationOptions(option);
      instrumentations = instrumentations.concat(results.instrumentations);
      pluginsWeb = pluginsWeb.concat(results.pluginsWeb);
      pluginsNode = Object.assign({}, pluginsNode, results.pluginsNode);
    } else if ((option as NodePluginsTracerConfiguration).plugins) {
      pluginsNode = Object.assign(
        {},
        pluginsNode,
        (option as NodePluginsTracerConfiguration).plugins
      );
    } else if (typeof option === 'function') {
      instrumentations.push(new option());
    } else if ((option as Instrumentation).instrumentationName) {
      instrumentations.push(option);
    } else if ((option as OldClassPlugin).moduleName) {
      pluginsWeb.push(option as OldClassPlugin);
    }
  }

  return { instrumentations, pluginsNode, pluginsWeb };
}

/**
 * Enable instrumentations
 * @param instrumentations
 * @param logger
 * @param tracerProvider
 * @param meterProvider
 */
export function enableInstrumentations(
  instrumentations: Instrumentation[],
  logger: Logger,
  tracerProvider?: TracerProvider,
  meterProvider?: MeterProvider
) {
  for (let i = 0, j = instrumentations.length; i < j; i++) {
    const instrumentation = instrumentations[i];
    if (tracerProvider) {
      instrumentation.setTracerProvider(tracerProvider);
    }
    if (meterProvider) {
      instrumentation.setMeterProvider(meterProvider);
    }
    instrumentation.enable();
  }
}

/**
 * Disable instrumentations
 * @param instrumentations
 */
export function disableInstrumentations(instrumentations: Instrumentation[]) {
  instrumentations.forEach(instrumentation => instrumentation.disable());
}
