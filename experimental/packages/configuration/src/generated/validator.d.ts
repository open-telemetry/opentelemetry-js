/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable */
// AUTO-GENERATED — do not edit
// Pre-compiled ajv validator for the OpenTelemetry configuration schema
// Generated from opentelemetry-configuration.git v1.0.0
// Run `npm run generate:config` to regenerate

/** Minimal subset of ajv ErrorObject used by FileConfigFactory */
interface ValidatorError {
  instancePath: string;
  message?: string;
  [k: string]: unknown;
}

declare function validateConfig(data: unknown): boolean;
declare namespace validateConfig {
  let errors: ValidatorError[] | null | undefined;
}

export = validateConfig;
