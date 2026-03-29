/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getStringFromEnv } from '@opentelemetry/core';
import type { ConfigFactory } from './IConfigFactory';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { diag } from '@opentelemetry/api';
import Ajv from 'ajv/dist/2020';
import { envVariableSubstitution } from './utils';
import { opentelemetryConfigurationSchema } from './generated/schema';
import type { ConfigurationModel } from './generated/types';

const ajv = new Ajv({ strict: false });
const validateConfig = ajv.compile(opentelemetryConfigurationSchema);

export class FileConfigFactory implements ConfigFactory {
  private _config: ConfigurationModel;

  constructor() {
    this._config = parseConfigFile();
  }

  getConfigModel(): ConfigurationModel {
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

export function parseConfigFile(): ConfigurationModel {
  // Matches 1.0, 1.0-rc.N — any release candidate of the 1.0 line
  const supportedFileVersionPattern = /^1\.0(-rc\.\d+)?$/;
  const configFile = getStringFromEnv('OTEL_CONFIG_FILE') || '';
  const file = fs.readFileSync(configFile, 'utf8');

  // Apply env var substitution to all string values before schema parsing
  const rawParsed = yaml.parse(file) as Record<string, unknown>;
  const substituted = substituteEnvVars(rawParsed) as Record<string, unknown>;

  const fileFormat = substituted?.file_format;
  if (!fileFormat || !supportedFileVersionPattern.test(String(fileFormat))) {
    throw new Error(
      `Unsupported file_format: "${fileFormat}". Must match ${supportedFileVersionPattern}.`
    );
  }

  // Preprocess: convert null to [] for provider processors/readers so schema
  // validation passes, then warn application-level after parse
  const preprocessed = preprocessNullArrays(substituted) as Record<
    string,
    unknown
  >;

  const valid = validateConfig(preprocessed);
  if (!valid) {
    const firstError = validateConfig.errors?.[0];
    const detail = firstError
      ? `${firstError.instancePath} ${firstError.message}`
      : 'unknown error';
    throw new Error(`Invalid OpenTelemetry config file: ${detail.trim()}`);
  }

  const data = preprocessed as unknown as ConfigurationModel;

  // Strip file_format from output — it's a meta-field, not a config value
  delete (data as Record<string, unknown>)['file_format'];

  applyConfigDefaults(data);
  mergeAttributesList(data);
  applyOtlpHttpEncodingDefaults(data);

  // Warn for providers with empty processors/readers
  if (data.tracer_provider?.processors?.length === 0) {
    diag.warn('TracerProvider must have at least one processor configured');
  }
  if (data.meter_provider?.readers?.length === 0) {
    diag.warn('MeterProvider must have at least one reader configured');
  }
  if (data.logger_provider?.processors?.length === 0) {
    diag.warn('LoggerProvider must have at least one processor configured');
  }

  return data;
}

/**
 * Apply default encoding ('protobuf') to all otlp_http exporters in the config
 * where encoding was not explicitly specified. The spec defines protobuf as the
 * default encoding for OTLP HTTP exporters.
 */
function applyOtlpHttpEncodingDefaults(data: ConfigurationModel): void {
  const applyEncoding = (exporter: { encoding?: string | null } | null | undefined) => {
    if (exporter && exporter.encoding == null) {
      exporter.encoding = 'protobuf';
    }
  };

  for (const processor of data.tracer_provider?.processors ?? []) {
    applyEncoding(processor.batch?.exporter?.otlp_http);
    applyEncoding(processor.simple?.exporter?.otlp_http);
  }

  for (const reader of data.meter_provider?.readers ?? []) {
    applyEncoding(reader.periodic?.exporter?.otlp_http);
  }

  for (const processor of data.logger_provider?.processors ?? []) {
    applyEncoding(processor.batch?.exporter?.otlp_http);
    applyEncoding(processor.simple?.exporter?.otlp_http);
  }
}

/**
 * Merge resource.attributes_list (comma-separated key=value pairs) into
 * resource.attributes, with entries already in attributes taking precedence.
 */
function mergeAttributesList(data: ConfigurationModel): void {
  const resource = data.resource;
  const list = resource?.attributes_list;
  if (typeof list !== 'string' || !list.trim()) return;

  if (resource!.attributes == null) {
    resource!.attributes = [];
  }

  const existingKeys = new Set(
    resource!.attributes.map((a: { name: string }) => a.name)
  );

  for (const pair of list.split(',')) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx > 0) {
      const key = pair.slice(0, eqIdx).trim();
      const value = pair.slice(eqIdx + 1).trim();
      if (key && !existingKeys.has(key)) {
        resource!.attributes.push({ name: key, value, type: 'string' });
      }
    }
  }
}

/**
 * Apply spec-defined defaults that are not encoded in the JSON schema.
 *
 * Only attribute_count_limit is defaulted here. disabled and log_level are
 * intentionally left absent when not specified in the YAML — per the WYSIWYG
 * principle, the SDK layer should interpret missing values, not the parser.
 */
function applyConfigDefaults(data: ConfigurationModel): void {
  if (data.attribute_limits == null) {
    data.attribute_limits = { attribute_count_limit: 128 };
  } else if (data.attribute_limits.attribute_count_limit == null) {
    data.attribute_limits.attribute_count_limit = 128;
  }
}

function preprocessNullArrays(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return obj;
  const record = obj as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(record)) {
    if ((k === 'processors' || k === 'readers') && v === null) {
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
