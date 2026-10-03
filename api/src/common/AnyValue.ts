/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AnyValue can be:
 * - a string, number, boolean value
 * - a byte array (Uint8Array)
 * - array of any value
 * - map from string to any value (a plain Object)
 * - null (an empty value)
 *
 * https://opentelemetry.io/docs/specs/otel/common/#anyvalue
 *
 * Notable JavaScript types that are excluded:
 * - `undefined` - Excluding this means the common practice in instrumentations,
 *   using `undefined` to mean "no value for this optional attribute", can
 *   remain supported.
 * - `BigInt`
 * - TypedArrays other than `Uint8Array`
 * - subclasses of Object, e.g. Date, Error
 *
 * The TypeScript type `unknown` is used for `AnyValue`. This has some
 * implications:
 * - Callers of `@opentelemetry/api` APIs using `AnyValue` can pass in
 *   whatever type. This was always the case for (untyped) JavaScript usage.
 * - SDK implementations of `@opentelemetry/api` need to document if/when they
 *   support a subset of AnyValue types.
 * - Using `unknown` allows future changes to support more types (e.g. BigInt).
 *
 * @since 1.10.0
 */
export type AnyValue = unknown;
