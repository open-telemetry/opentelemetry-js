/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @since 1.0.0
 */
export interface Context {
  /**
   * Get a value from the context.
   *
   * @param key key which identifies a context value
   */
  getValue(key: symbol): unknown;

  /**
   * Create a new context which inherits from this context and has
   * the given key set to the given value.
   *
   * @param key context key for which to set the value
   * @param value value to set for the given key
   */
  setValue(key: symbol, value: unknown): Context;

  /**
   * Return a new context which inherits from this context but does
   * not contain a value for the given key.
   *
   * @param key context key for which to clear a value
   */
  deleteValue(key: symbol): Context;
}

/**
 * A scope token returned by {@link ContextManager.attach} that restores the previous
 * {@link Context} when disposed. Call `token.dispose()` directly or use the
 * `using` keyword (TypeScript 5.2+).
 *
 * @since 1.10.0
 * @experimental This API is experimental and may change in minor releases without prior notice.
 */
export interface Token {
  dispose(): void;
  [Symbol.dispose](): void;
}

/**
 * @since 1.0.0
 */
export interface ContextManager {
  /**
   * Get the current active context
   */
  active(): Context;

  /**
   * Run the fn callback with object set as the current active context
   * @param context Any object to set as the current active context
   * @param fn A callback to be immediately run within a specific context
   * @param thisArg optional receiver to be used for calling fn
   * @param args optional arguments forwarded to fn
   */
  with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(
    context: Context,
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: A
  ): ReturnType<F>;

  /**
   * Bind an object as the current context (or a specific one)
   * @param [context] Optionally specify the context which you want to assign
   * @param target Any object to which a context need to be set
   */
  bind<T>(context: Context, target: T): T;

  /**
   * Enable context management
   */
  enable(): this;

  /**
   * Disable context management
   */
  disable(): this;

  /**
   * Imperatively sets `context` as active, returning a {@link Token} whose
   * {@link Token.dispose} method restores the previous context.
   *
   * This is a delicate, low-level API - prefer {@link with}/{@link bind}, which
   * restore context automatically. `attach` exists only to bridge callback
   * boundaries that `with` cannot wrap. The caller is responsible for disposing
   * the token (via `token.dispose()` or `using`) when
   * the operation is complete. Support is optional and best-effort; when omitted,
   * {@link ContextAPI.attach} logs a warning and returns a no-op token.
   *
   * @param context The Context to attach
   * @returns A Token whose dispose() restores the previous Context
   * @since 1.10.0
   * @experimental This API is experimental and may change in minor releases without prior notice.
   */
  attach?(context: Context): Token;
}
