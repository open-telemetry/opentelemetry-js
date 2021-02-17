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

import { TracerProvider } from '@opentelemetry/api';
import { NodePlugins, OldClassPlugin } from '../../../types_plugin_only';
import { PluginLoader } from './PluginLoader';

/** List of all default supported plugins */
export const DEFAULT_INSTRUMENTATION_PLUGINS: NodePlugins = {
  mongodb: { enabled: true, path: '@opentelemetry/plugin-mongodb' },
  grpc: { enabled: true, path: '@opentelemetry/plugin-grpc' },
  '@grpc/grpc-js': { enabled: true, path: '@opentelemetry/plugin-grpc-js' },
  http: { enabled: true, path: '@opentelemetry/plugin-http' },
  https: { enabled: true, path: '@opentelemetry/plugin-https' },
  mysql: { enabled: true, path: '@opentelemetry/plugin-mysql' },
  pg: { enabled: true, path: '@opentelemetry/plugin-pg' },
  redis: { enabled: true, path: '@opentelemetry/plugin-redis' },
  ioredis: { enabled: true, path: '@opentelemetry/plugin-ioredis' },
  'pg-pool': { enabled: true, path: '@opentelemetry/plugin-pg-pool' },
  express: { enabled: true, path: '@opentelemetry/plugin-express' },
  '@hapi/hapi': { enabled: true, path: '@opentelemetry/hapi-instrumentation' },
  koa: { enabled: true, path: '@opentelemetry/koa-instrumentation' },
  dns: { enabled: true, path: '@opentelemetry/plugin-dns' },
};

/**
 * Loads provided node plugins
 * @param pluginsNode
 * @param pluginsWeb
 * @param tracerProvider
 * @return returns function to disable all plugins
 */
export function loadOldPlugins(
  pluginsNode: NodePlugins,
  pluginsWeb: OldClassPlugin[],
  tracerProvider: TracerProvider
): () => void {
  const allPlugins = mergePlugins(DEFAULT_INSTRUMENTATION_PLUGINS, pluginsNode);
  const pluginLoader = new PluginLoader(tracerProvider);
  pluginLoader.load(allPlugins);
  return () => {
    pluginLoader.unload();
  };
}

function mergePlugins(
  defaultPlugins: NodePlugins,
  userSuppliedPlugins: NodePlugins
): NodePlugins {
  const mergedUserSuppliedPlugins: NodePlugins = {};

  for (const pluginName in userSuppliedPlugins) {
    mergedUserSuppliedPlugins[pluginName] = {
      // Any user-supplied non-default plugin should be enabled by default
      ...(DEFAULT_INSTRUMENTATION_PLUGINS[pluginName] || { enabled: true }),
      ...userSuppliedPlugins[pluginName],
    };
  }

  const mergedPlugins: NodePlugins = {
    ...defaultPlugins,
    ...mergedUserSuppliedPlugins,
  };

  return mergedPlugins;
}
