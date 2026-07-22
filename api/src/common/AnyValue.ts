/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AnyValue can be:
 * - a string, number, boolean value
 * - a byte array (Uint8Array)
 * - array of any value
 * - map from string to any value
 * - null (an empty value)
 *
 * https://opentelemetry.io/docs/specs/otel/common/#anyvalue
 *
 * XXX TODO: explain intent and implications of using `unknown` here
 *  - Implementors unpacking this of AnyValue, e.g. attributes
 *    for a lot of the OTel API, need to defensively switch on
 *    all types. No type narrowing and then *assuming* remaining
 *    types.
 *  - Users can pass whatever garbage, but SDK implementations
 *    may/will drop attribute values not of the above types.
 *  - Using unknown and these rules allows supporting more
 *    anyvalue types later, say `BigInt`, if wanted.
 *
 * @since XXX
 */
export type AnyValue = unknown;
