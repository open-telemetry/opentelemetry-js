/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getStringFromEnv } from '@opentelemetry/core';
import type { ConfigFactory } from './IConfigFactory';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { diag } from '@opentelemetry/api';
import { envVariableSubstitution } from './utils';
import { ConfigurationSchema } from './generated/types';
import type { Configuration } from './generated/types';

export class FileConfigFactory implements ConfigFactory {
  private _config: Configuration;

  constructor() {
    this._config = parseConfigFile();
  }

  getConfigModel(): Configuration {
    return this._config;
  }
}

export function hasValidConfigFile(): boolean {
  const configFile = getStringFromEnv('OTEL_CONFIG_FILE');
  if (configFile) {
    if (
      !(configFile.endsWith('.yaml') || configFile.endsWith('.yml')) ||
      !fs.existsSync(configFile)
    ) {
      diag.warn(
        `Config file ${configFile} set on OTEL_CONFIG_FILE is not valid`
      );
      return false;
    }
    return true;
  }
  return false;
}

export function parseConfigFile(): Configuration {
  const supportedFileVersions = ['1.0-rc.3'];
  const configFile = getStringFromEnv('OTEL_CONFIG_FILE') || '';
  const file = fs.readFileSync(configFile, 'utf8');

  // Apply env var substitution to all string values before schema parsing
  const rawParsed = yaml.parse(file) as Record<string, unknown>;
  const substituted = substituteEnvVars(rawParsed) as Record<string, unknown>;

  if (
    !substituted?.file_format ||
    !supportedFileVersions.includes(String(substituted.file_format))
  ) {
    diag.warn(
      `Unsupported File Format: ${substituted?.file_format}. It must be one of the following: ${supportedFileVersions}`
    );
    return {} as Configuration;
  }

  // Preprocess: convert null to [] for provider processors/readers so schema
  // validation passes, then warn application-level after parse
  const preprocessed = preprocessNullArrays(
    substituted
  ) as Record<string, unknown>;

  const result = ConfigurationSchema.safeParse(preprocessed);
  if (!result.success) {
    throw new Error(
      `Invalid OpenTelemetry config file: ${result.error.issues[0]?.message ?? result.error.message}`
    );
  }

  const data = result.data as Configuration;

  // Strip file_format from output — it's a meta-field, not a config value
  delete (data as Record<string, unknown>)['file_format'];

  applyConfigDefaults(data);

  // Warn for providers with empty processors/readers
  if (data.tracer_provider?.processors?.length === 0) {
    diag.warn('TracerProvider must have at least one processor configured');
  }
  const meterReaders = (data.meter_provider as Record<string, unknown> | undefined)?.['readers'];
  if (Array.isArray(meterReaders) && meterReaders.length === 0) {
    diag.warn('MeterProvider must have at least one reader configured');
  }
  if (data.logger_provider?.processors?.length === 0) {
    diag.warn('LoggerProvider must have at least one processor configured');
  }

  return data;
}

/**
 * Apply spec-defined defaults that are not encoded in the JSON schema.
 * Matches the pattern used by Java/Python SDKs: models are null/undefined
 * when absent; factory code applies defaults before returning.
 *
 * Note: AttributeNameValue.type is intentionally NOT defaulted here. The spec
 * says "if omitted, string is used", but this is a semantic default for the
 * SDK init code that reads resource attributes — not a config-parser concern.
 * The parsed model faithfully mirrors what was in the YAML.
 */
function applyConfigDefaults(data: Configuration): void {
  const d = data as Record<string, unknown>;
  if (d['disabled'] == null) d['disabled'] = false;
  if (d['log_level'] == null) d['log_level'] = 'info';
  if (d['attribute_limits'] == null) {
    d['attribute_limits'] = { attribute_count_limit: 128 };
  } else {
    const limits = d['attribute_limits'] as Record<string, unknown>;
    if (limits['attribute_count_limit'] == null) {
      limits['attribute_count_limit'] = 128;
    }
  }
}

function preprocessNullArrays(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return obj;
  const record = obj as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(record)) {
    if (
      (k === 'processors' || k === 'readers') &&
      v === null
    ) {
      result[k] = [];
    } else {
      result[k] = preprocessNullArrays(v);
    }
  }
  return result;
}

const ENV_VAR_PATTERN = /\$\{[^}]+\}/;

function substituteEnvVars(obj: unknown): unknown {
  if (typeof obj === 'string') {
    // Only coerce if the string contained env var substitution syntax,
    // so that plain YAML strings (e.g. quoted "1234") are not type-coerced.
    const hasSubstitution = ENV_VAR_PATTERN.test(obj);
    const substituted = envVariableSubstitution(obj) ?? obj;
    return hasSubstitution ? yamlCoerce(substituted) : substituted;
  }
  if (Array.isArray(obj)) {
    return obj.map(substituteEnvVars);
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, substituteEnvVars(v)])
    );
  }
  return obj;
}

/**
 * Re-coerce a string value to its YAML-equivalent primitive type.
 * Env var substitution always returns strings; this converts them back
 * to booleans/numbers/null where the schema expects those types.
 */
function yamlCoerce(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null' || value === '') return null;
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
  return value;
}
