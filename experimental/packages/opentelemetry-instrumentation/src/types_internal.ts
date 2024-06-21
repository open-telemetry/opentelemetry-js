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

import { TracerProvider, MeterProvider } from '@opentelemetry/api';
import { Instrumentation } from './types';
import { LoggerProvider } from '@opentelemetry/api-logs';

export interface AutoLoaderResult {
  instrumentations: Instrumentation[];
}

export interface AutoLoaderOptions {
  instrumentations?: (Instrumentation | Instrumentation[])[];
  tracerProvider?: TracerProvider;
  meterProvider?: MeterProvider;
  loggerProvider?: LoggerProvider;
}

/**
 * A subset of types for Node.js `diagnostics_channel`.
 * `diagnostics_channel.subscribe` was added in Node.js v18.7.0, v16.17.0.
 * The current `@types/node` dependency is for an earlier version (v14) of
 * Node.js
 */
type DiagChChannelListener = (message: unknown, name: string | symbol) => void;
export type DiagChSubscribe = (name: string | symbol, onMessage: DiagChChannelListener) => void;

/**
 * The shape of a `otel:bundle:load` diagnostics_channel message.
 */
export type OTelBundleLoadMessage = {
  name: string;
  version: string;
  exports: any;
};
