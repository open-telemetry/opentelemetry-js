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

import { Plugins } from './instrumentation/PluginLoader';
import { TracerConfig } from '@opentelemetry/tracing';

/**
 * NodeTracerConfig provides an interface for configuring a Node Tracer.
 */
export interface NodeTracerConfig extends TracerConfig {
  /** Plugins options. */
  plugins?: Plugins;
}

/** List of all default supported plugins */
export const DEFAULT_INSTRUMENTATION_PLUGINS: Plugins = {
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
};
