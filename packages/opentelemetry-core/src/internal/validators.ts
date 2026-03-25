/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const VALID_KEY_CHAR_RANGE = '[_0-9a-z-*/]';
const VALID_KEY = `[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`;
const VALID_VENDOR_KEY = `[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`;
const VALID_KEY_REGEX = new RegExp(`^(?:${VALID_KEY}|${VALID_VENDOR_KEY})$`);
const VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
const INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;

/**
 * Key is opaque string up to 256 characters printable. It MUST begin with a
 * lowercase letter, and can only contain lowercase letters a-z, digits 0-9,
 * underscores _, dashes -, asterisks *, and forward slashes /.
 * For multi-tenant vendor scenarios, an at sign (@) can be used to prefix the
 * vendor name. Vendors SHOULD set the tenant ID at the beginning of the key.
 * see https://www.w3.org/TR/trace-context/#key
 */
export function validateKey(key: string): boolean {
  return VALID_KEY_REGEX.test(key);
}

/**
 * Value is opaque string up to 256 characters printable ASCII RFC0020
 * characters (i.e., the range 0x20 to 0x7E) except comma , and =.
 */
export function validateValue(value: string): boolean {
  return (
    VALID_VALUE_BASE_REGEX.test(value) &&
    !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value)
  );
}

const VALID_OTEL_KEYS = ['th', 'rv'];
const VALID_OTEL_VALUE_REGEX = /^[A-Za-z0-9._-]{0,255}$/;

/**
 * Specific keys used by OTel concerns MUST be defined as part of the Specification,
 * and hence it is forbidden to use any key that has not been defined in the Specification itself.
 *
 * ref: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/tracestate-handling.md#key
 */
export function isValidOtelKey(key: string): boolean {
  return VALID_OTEL_KEYS.includes(key);
}

/**
 * Value is opaque string without max lenght. Consitst of alphanumeric
 * chars [A-Za-z0-9] along with the chars ".", "_" and "-".
 */
export function isValidOtelValue(value: string): boolean {
  return VALID_OTEL_VALUE_REGEX.test(value);
}
