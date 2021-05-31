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

import { diag } from '..';
import { ContextManager } from '../context/types';
import { DiagLogger } from '../diag';
import { _globalThis } from '../platform';
import { TextMapPropagator } from '../propagation/TextMapPropagator';
import type { TracerProvider } from '../trace/tracer_provider';
import { VERSION } from '../version';
import { isCompatible } from './semver';

const major = VERSION.split('.')[0];
const GLOBAL_OPENTELEMETRY_API_KEY = Symbol.for(
  `io.opentelemetry.js.api.${major}`
);

const _global = _globalThis as OTelGlobal;

export function registerGlobal<Type extends keyof OTelGlobalAPI>(
  type: Type,
  instance: OTelGlobalAPI[Type],
  allowOverride = false
): boolean {
  const api = (_global[GLOBAL_OPENTELEMETRY_API_KEY] = _global[
    GLOBAL_OPENTELEMETRY_API_KEY
  ] ?? {
    version: VERSION,
  });

  if (!allowOverride && api[type]) {
    // already registered an API of this type
    const err = new Error(
      `@opentelemetry/api: Attempted duplicate registration of API: ${type}`
    );
    diag.error(err.stack || err.message);
    return false;
  }

  if (api.version !== VERSION) {
    // All registered APIs must be of the same version exactly
    const err = new Error(
      '@opentelemetry/api: All API registration versions must match'
    );
    diag.error(err.stack || err.message);
    return false;
  }

  api[type] = instance;
  diag.debug(
    `@opentelemetry/api: Registered a global for ${type} v${VERSION}.`
  );

  return true;
}

export function getGlobal<Type extends keyof OTelGlobalAPI>(
  type: Type
): OTelGlobalAPI[Type] | undefined {
  const globalVersion = _global[GLOBAL_OPENTELEMETRY_API_KEY]?.version;
  if (!globalVersion || !isCompatible(globalVersion)) {
    return;
  }
  return _global[GLOBAL_OPENTELEMETRY_API_KEY]?.[type];
}

export function unregisterGlobal(type: keyof OTelGlobalAPI) {
  diag.debug(
    `@opentelemetry/api: Unregistering a global for ${type} v${VERSION}.`
  );
  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];

  if (api) {
    delete api[type];
  }
}

type OTelGlobal = {
  [GLOBAL_OPENTELEMETRY_API_KEY]?: OTelGlobalAPI;
};

type OTelGlobalAPI = {
  version: string;

  diag?: DiagLogger;
  trace?: TracerProvider;
  context?: ContextManager;
  propagation?: TextMapPropagator;
};
