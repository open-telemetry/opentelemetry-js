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
import { InstrumentationBase } from './platform';
import {
  AutoLoaderResult,
  Instrumentation,
  InstrumentationOption,
} from './types';

import {
  NodePlugins,
  NodePluginsTracerConfiguration,
  OldClassPlugin,
} from './types_plugin_only';

export function parseInstrumentationOptions(
  options: InstrumentationOption[]
): AutoLoaderResult {
  let instrumentations: Instrumentation[] = [];
  let pluginsNode: NodePlugins = {};
  const pluginsWeb: OldClassPlugin[] = [];
  for (let i = 0, j = options.length; i < j; i++) {
    const option = options[i];
    const OptionClass = option as any;

    if (OptionClass.prototype instanceof InstrumentationBase) {
      instrumentations.push(new OptionClass());
    } else if (option instanceof InstrumentationBase) {
      instrumentations.push(option);
    } else if (Array.isArray(option)) {
      instrumentations = instrumentations.concat(
        parseInstrumentationOptions(option).instrumentations
      );
    } else if ((option as NodePluginsTracerConfiguration).plugins) {
      pluginsNode = Object.assign(
        {},
        pluginsNode,
        (option as NodePluginsTracerConfiguration).plugins
      );
    } else {
      pluginsWeb.push(option as OldClassPlugin);
    }
  }

  return { instrumentations, pluginsNode, pluginsWeb };
}

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
