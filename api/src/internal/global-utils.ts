/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MeterProvider } from '../metrics/MeterProvider';
import { ContextManager } from '../context/types';
import { DiagLogger } from '../diag/types';
import { TextMapPropagator } from '../propagation/TextMapPropagator';
import type { TracerProvider } from '../trace/tracer_provider';
import { VERSION } from '../version';
import { isCompatible } from './semver';

const major = VERSION.split('.')[0];
const GLOBAL_OPENTELEMETRY_API_KEY = Symbol.for(
  `opentelemetry.js.api.${major}`
);

const _global = globalThis as OTelGlobal;

export function registerGlobal<Type extends keyof OTelGlobalAPI>(
  type: Type,
  instance: OTelGlobalAPI[Type],
  diag: DiagLogger,
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
      `@opentelemetry/api: Registration of version v${api.version} for ${type} does not match previously registered API v${VERSION}`
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

export function unregisterGlobal(type: keyof OTelGlobalAPI, diag: DiagLogger) {
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
  metrics?: MeterProvider;
  propagation?: TextMapPropagator;
};
