/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Typed, null-safe accessor over a parsed declarative config block.
 *
 * Each getter returns the typed value, or `undefined` when the key is missing or
 * has the wrong type. A type mismatch is logged via `diag.warn`; a missing key
 * is silent. Getters never throw.
 *
 * The typed getters plus {@link getPropertyKeys} are the spec's stable
 * `ConfigProperties` surface. {@link unreadKeys} and {@link warnUnreadKeys} are
 * additions that let a reader report keys it did not recognize.
 */
export interface ConfigProperties {
  getBoolean(key: string): boolean | undefined;
  getString(key: string): string | undefined;
  getNumber(key: string): number | undefined;
  getStringArray(key: string): string[] | undefined;
  /**
   * Returns a nested accessor for an object-valued key. Repeated calls for the
   * same key return the same accessor, so reads and unread-key tracking
   * accumulate across calls.
   */
  getStructured(key: string): ConfigProperties | undefined;
  /**
   * Returns an accessor per element for a key whose value is a sequence of
   * mappings, or `undefined` when the key is missing or is not such a sequence.
   */
  getStructuredList(key: string): ConfigProperties[] | undefined;
  /**
   * Returns every key present in the block, including keys whose value is
   * `null`. Lets a caller tell a key set to `null` from one that is absent.
   */
  getPropertyKeys(): string[];
  /**
   * Returns keys that no getter has read, such as typos or unsupported options.
   * Recurses into structured children that were read via {@link getStructured},
   * reporting their unread keys with a dotted path (e.g. `http.client.foo`). A
   * key whose nested block was never read is reported on its own.
   */
  unreadKeys(): string[];
  /**
   * Warn about the keys returned by {@link unreadKeys}. Convenience for callers
   * that want the default warning rather than their own message.
   */
  warnUnreadKeys(): void;
}
