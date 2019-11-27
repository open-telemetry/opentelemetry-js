/**
 * Copyright 2019, OpenTelemetry Authors
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

import { Plugins } from './instrumentation/PluginLoader';
import { BasicTracerConfig } from '@opentelemetry/tracing';

/**
 * NodeTracerConfig provides an interface for configuring a Node Tracer.
 */
export interface NodeTracerConfig extends BasicTracerConfig {
  /** Plugins options. */
  plugins?: Plugins;
}

/** List of all default supported plugins */
export const DEFAULT_INSTRUMENTATION_PLUGINS: Plugins = {
  'mongodb-core': { enabled: true, path: '@opentelemetry/plugin-mongodb-core' },
  dns: { enabled: true, path: '@opentelemetry/plugin-dns' },
  grpc: { enabled: true, path: '@opentelemetry/plugin-grpc' },
  http: { enabled: true, path: '@opentelemetry/plugin-http' },
  https: { enabled: true, path: '@opentelemetry/plugin-https' },
  pg: { enabled: true, path: '@opentelemetry/plugin-pg' },
  redis: { enabled: true, path: '@opentelemetry/plugin-redis' },
};
