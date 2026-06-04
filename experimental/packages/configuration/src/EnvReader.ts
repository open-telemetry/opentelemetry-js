/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag } from '@opentelemetry/api';
import { getStringFromEnv } from '@opentelemetry/core';
import { ENV_DEFS } from './EnvDefinition';

/** Base definition shared by all env var types. */
interface EnvVarBase<T> {
  key: string;
  description: string;
  defaultValue?: T;
}

export interface StringEnvVar extends EnvVarBase<string> {
  type: 'string';
  allowedValues?: readonly string[];
}

export interface BooleanEnvVar extends EnvVarBase<boolean> {
  type: 'boolean';
  defaultValue: boolean;
}

export type EnvVarDefinition = StringEnvVar | BooleanEnvVar;

type ResolvedType<D extends EnvVarDefinition> = D extends StringEnvVar
  ? string | undefined
  : D extends BooleanEnvVar
    ? boolean
    : never;

function readStringEnv(def: StringEnvVar): string | undefined {
  const value = getStringFromEnv(def.key);
  if (value == null) {
    return def.defaultValue;
  }
  if (def.allowedValues && !def.allowedValues.includes(value)) {
    diag.warn(
      `Invalid value "${value}" for ${def.description} (env: ${def.key}). ` +
        `Expected one of: ${def.allowedValues.join(', ')}. ` +
        (def.defaultValue != null
          ? `Falling back to "${def.defaultValue}".`
          : 'Value will be ignored.')
    );
    return def.defaultValue;
  }
  return value;
}

function readBooleanEnv(def: BooleanEnvVar): boolean {
  const raw = getStringFromEnv(def.key)?.trim().toLowerCase();
  // Handle the case where the env var is not set (no warning).
  if (raw == null || raw === '') {
    return def.defaultValue;
  }
  if (raw === 'true') {
    return true;
  }
  if (raw === 'false') {
    return false;
  }
  // If set to an unrecognized value, warn and fall back to the default.
  diag.warn(
    `Invalid value "${raw}" for ${def.description} (env: ${def.key}). ` +
      `Expected 'true' or 'false'. Falling back to "${def.defaultValue}".`
  );
  return def.defaultValue;
}

export function readEnvVar<D extends EnvVarDefinition>(
  def: D
): ResolvedType<D> {
  switch (def.type) {
    case 'string':
      return readStringEnv(def) as ResolvedType<D>;
    case 'boolean':
      return readBooleanEnv(def) as ResolvedType<D>;
  }
}

export type EnvValues = {
  [K in keyof typeof ENV_DEFS]: ResolvedType<(typeof ENV_DEFS)[K]>;
};

export function readAllEnvVars(): EnvValues {
  const result = {} as Record<string, unknown>;
  for (const [name, def] of Object.entries(ENV_DEFS)) {
    result[name] = readEnvVar(def);
  }
  return result as EnvValues;
}
