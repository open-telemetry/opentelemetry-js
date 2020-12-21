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

import { ContextManager } from '@opentelemetry/context-base';
import * as semver from 'semver';
import { TextMapPropagator } from '../context/propagation/TextMapPropagator';
import { MeterProvider } from '../metrics/MeterProvider';
import { _globalThis } from '../platform';
import { TracerProvider } from '../trace/tracer_provider';
import { VERSION } from '../version';

const _global = _globalThis as OTelGlobal;
const acceptableRange = new semver.Range(`^${VERSION}`);
const GLOBAL_OPENTELEMETRY_API_KEY = Symbol.for('io.opentelemetry.js.api');

export function registerGlobal(type: 'trace', instance: TracerProvider): void;
export function registerGlobal(type: 'metrics', instance: MeterProvider): void;
export function registerGlobal(type: 'context', instance: ContextManager): void;
export function registerGlobal(
  type: 'propagation',
  instance: TextMapPropagator
): void;
export function registerGlobal(type: keyof OTelGlobalApi, instance: any) {
  _global[GLOBAL_OPENTELEMETRY_API_KEY] =
    _global[GLOBAL_OPENTELEMETRY_API_KEY] ?? {};

  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY]!;
  if (api[type]) {
    // already registered an API of this type
    return;
  }

  api[type] = {
    instance,
    version: VERSION,
  };
}

export function getGlobal(type: 'trace'): Signal<TracerProvider> | undefined;
export function getGlobal(type: 'metrics'): Signal<MeterProvider> | undefined;
export function getGlobal(type: 'context'): Signal<ContextManager> | undefined;
export function getGlobal(
  type: 'propagation'
): Signal<TextMapPropagator> | undefined;
export function getGlobal(type: keyof OTelGlobalApi) {
  return _global[GLOBAL_OPENTELEMETRY_API_KEY]?.[type];
}

export function unregisterGlobal(type: keyof OTelGlobalApi) {
  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];

  if (api) {
    delete api[type];
  }
}

export function isCompatible(version: string) {
  return semver.satisfies(version, acceptableRange);
}

type OTelGlobal = Partial<{
  [GLOBAL_OPENTELEMETRY_API_KEY]: OTelGlobalApi;
}>;

type OTelGlobalApi = Partial<{
  trace: Signal<TracerProvider>;
  metrics: Signal<MeterProvider>;
  context: Signal<ContextManager>;
  propagation: Signal<TextMapPropagator>;
}>;

type Signal<T> = {
  instance: T;
  version: string;
};
