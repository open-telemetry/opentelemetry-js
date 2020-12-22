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

const GLOBAL_OPENTELEMETRY_API_KEY = Symbol.for('io.opentelemetry.js.api');

const _global = _globalThis as OTelGlobal;
const acceptableRange = new semver.Range(`^${VERSION}`);

export function registerGlobal<Type extends keyof OTelGlobalAPI>(
  type: Type,
  instance: APIProviders[Type]
): void {
  _global[GLOBAL_OPENTELEMETRY_API_KEY] =
    _global[GLOBAL_OPENTELEMETRY_API_KEY] ?? {};

  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY]!;
  if (api[type]) {
    // already registered an API of this type
    return;
  }

  api[type] = {
    instance: instance as any,
    version: VERSION,
  };
}

export function getGlobal<Type extends keyof OTelGlobalAPI>(
  type: Type
): Signal<APIProviders[Type]> | undefined {
  return _global[GLOBAL_OPENTELEMETRY_API_KEY]?.[type] as any;
}

export function unregisterGlobal(type: keyof OTelGlobalAPI) {
  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];

  if (api) {
    delete api[type];
  }
}

export function isCompatible(version: string) {
  return semver.satisfies(version, acceptableRange);
}

type OTelGlobal = {
  [GLOBAL_OPENTELEMETRY_API_KEY]?: OTelGlobalAPI;
};

type OTelGlobalAPI = {
  [T in keyof APIProviders]?: Signal<APIProviders[T]>;
};

type Signal<T> = {
  instance: T;
  version: string;
};

type APIProviders = {
  trace: TracerProvider;
  metrics: MeterProvider;
  context: ContextManager;
  propagation: TextMapPropagator;
};
