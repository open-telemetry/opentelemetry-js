/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MeterProvider } from '../metrics/MeterProvider';
import type { ContextManager } from '../context/types';
import type { DiagLogger } from '../diag/types';
import type { TextMapPropagator } from '../propagation/TextMapPropagator';
import type { TracerProvider } from '../trace/tracer_provider';
import { VERSION } from '../version';
import { isCompatible } from './semver';

const major = VERSION.split('.')[0];
const GLOBAL_OPENTELEMETRY_API_KEY = Symbol.for(
  `opentelemetry.js.api.${major}`
);

declare const self: unknown;
declare const window: unknown;
declare const global: unknown;

const _global = (
  typeof globalThis === 'object'
    ? globalThis
    : typeof self === 'object'
      ? self
      : typeof window === 'object'
        ? window
        : typeof global === 'object'
          ? global
          : {}
) as OTelGlobal;

function _makeGlobalApi(): OTelGlobalAPI {
  // The version property is sealed (non-writable, non-configurable) so it stays
  // constant for the api object's lifetime. getGlobal caches its compatibility
  // check per api-object identity and relies on that invariant.
  return Object.defineProperty({} as OTelGlobalAPI, 'version', {
    value: VERSION,
    enumerable: true,
    writable: false,
    configurable: false,
  });
}

export function registerGlobal<Type extends keyof OTelGlobalAPI>(
  type: Type,
  instance: OTelGlobalAPI[Type],
  diag: DiagLogger,
  allowOverride = false
): boolean {
  const api = (_global[GLOBAL_OPENTELEMETRY_API_KEY] =
    _global[GLOBAL_OPENTELEMETRY_API_KEY] ?? _makeGlobalApi());

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

// The api object whose compatibility has already been verified. Its version is
// sealed at registerGlobal, so a full compatibility check is only needed when
// the object identity changes, letting the steady-state hot path skip it.
let _compatibleGlobalApi: OTelGlobalAPI | undefined;

export function getGlobal<Type extends keyof OTelGlobalAPI>(
  type: Type
): OTelGlobalAPI[Type] | undefined {
  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
  if (api == null) {
    return;
  }
  if (api !== _compatibleGlobalApi) {
    // A new api object has been registered since the last time we checked, so
    // verify its compatibility again.
    if (!api.version || !isCompatible(api.version)) {
      return;
    }
    _compatibleGlobalApi = api;
  }
  return api[type];
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
