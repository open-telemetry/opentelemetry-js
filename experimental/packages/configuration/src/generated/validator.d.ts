/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable */
// AUTO-GENERATED — do not edit
// Pre-compiled ajv validator for the OpenTelemetry configuration schema
// Generated from opentelemetry-configuration.git 9c5c6c4a8d097d0198c2f66bdce799c1ee3a0bcf
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
