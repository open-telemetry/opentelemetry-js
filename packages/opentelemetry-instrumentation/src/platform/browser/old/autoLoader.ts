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

// This should be removed after plugins are gone

import * as api from '@opentelemetry/api';
import { NodePlugins, OldClassPlugin } from '../../../types_plugin_only';

/**
 * Loads provided web plugins
 * @param pluginsNode
 * @param pluginsWeb
 * @param logger
 * @param tracerProvider
 * @return returns function to disable all plugins
 */
export function loadOldPlugins(
  pluginsNode: NodePlugins,
  pluginsWeb: OldClassPlugin[],
  logger: api.Logger,
  tracerProvider: api.TracerProvider
): () => void {
  pluginsWeb.forEach(plugin => {
    plugin.enable([], tracerProvider, logger);
  });
  return () => {
    pluginsWeb.forEach(plugin => {
      plugin.disable();
    });
  };
}
