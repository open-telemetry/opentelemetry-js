/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { TracerProvider } from './tracer_provider';

/**
 * A vendor hook invoked during {@link TraceAPI.setGlobalTracerProvider}.
 *
 * APM vendors can register a factory via
 * {@link TraceAPI.setTracerProviderFactory} to wrap, augment, or replace the
 * TracerProvider that the application passes to `setGlobalTracerProvider`.
 *
 * The factory receives the original provider and must return the provider that
 * will actually be installed as the global delegate. Returning the original
 * provider unchanged is valid.
 *
 * Only one factory may be registered at a time; the first registration wins
 * (consistent with `setGlobalTracerProvider` semantics). Call
 * {@link TraceAPI.disable} to clear the factory and allow re-registration.
 *
 * @example
 * ```typescript
 * import { trace, TracerProviderFactory, TracerProvider } from '@opentelemetry/api';
 *
 * const factory: TracerProviderFactory = {
 *   createTracerProvider(original: TracerProvider): TracerProvider {
 *     // Wrap, replace, or return the original provider
 *     return new VendorTracerProvider(original);
 *   },
 * };
 *
 * trace.setTracerProviderFactory(factory);
 * ```
 *
 * @since 1.10.0
 */
export interface TracerProviderFactory {
  /**
   * Called during `setGlobalTracerProvider` to transform the provider.
   *
   * @param provider - The TracerProvider the application is registering.
   * @returns The TracerProvider to install as the global delegate.
   */
  createTracerProvider(provider: TracerProvider): TracerProvider;
}
