/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  getGlobal,
  registerGlobal,
  unregisterGlobal,
} from '../internal/global-utils';
import { ProxyTracerProvider } from '../trace/ProxyTracerProvider';
import {
  isSpanContextValid,
  wrapSpanContext,
} from '../trace/spancontext-utils';
import { Tracer } from '../trace/tracer';
import { TracerProvider } from '../trace/tracer_provider';
import { TracerProviderFactory } from '../trace/TracerProviderFactory';
import {
  deleteSpan,
  getActiveSpan,
  getSpan,
  getSpanContext,
  setSpan,
  setSpanContext,
} from '../trace/context-utils';
import { DiagAPI } from './diag';

const API_NAME = 'trace';

/**
 * Singleton object which represents the entry point to the OpenTelemetry Tracing API
 *
 * @since 1.0.0
 */
export class TraceAPI {
  private static _instance?: TraceAPI;

  private _proxyTracerProvider = new ProxyTracerProvider();
  private _tracerProviderFactory?: TracerProviderFactory;

  /** Empty private constructor prevents end users from constructing a new instance of the API */
  private constructor() {}

  /** Get the singleton instance of the Trace API */
  public static getInstance(): TraceAPI {
    if (!this._instance) {
      this._instance = new TraceAPI();
    }

    return this._instance;
  }

  /**
   * Register a vendor {@link TracerProviderFactory}.
   *
   * The factory is called during {@link setGlobalTracerProvider} with the
   * provider the application supplies, and its return value becomes the
   * actual global delegate. This allows APM vendors to wrap, augment, or
   * replace the TracerProvider without monkey-patching.
   *
   * Only one factory may be registered. Subsequent calls return `false`
   * and are no-ops (consistent with `setGlobalTracerProvider` semantics).
   * Call {@link disable} to clear the factory and allow re-registration.
   *
   * The factory must be registered **before** `setGlobalTracerProvider` is
   * called; registering a factory after the provider is already set has no
   * retroactive effect.
   *
   * @returns true if the factory was successfully registered, else false
   * @since 1.10.0
   */
  public setTracerProviderFactory(factory: TracerProviderFactory): boolean {
    if (this._tracerProviderFactory) {
      DiagAPI.instance().error(
        '@opentelemetry/api: Attempted duplicate registration of TracerProviderFactory'
      );
      return false;
    }
    this._tracerProviderFactory = factory;
    DiagAPI.instance().debug(
      '@opentelemetry/api: Registered a TracerProviderFactory.'
    );
    return true;
  }

  /**
   * Set the current global tracer.
   *
   * If a {@link TracerProviderFactory} has been registered via
   * {@link setTracerProviderFactory}, the provider is passed through the
   * factory before being installed as the delegate.
   *
   * @returns true if the tracer provider was successfully registered, else false
   */
  public setGlobalTracerProvider(provider: TracerProvider): boolean {
    const success = registerGlobal(
      API_NAME,
      this._proxyTracerProvider,
      DiagAPI.instance()
    );
    if (success) {
      const delegate = this._tracerProviderFactory
        ? this._tracerProviderFactory.createTracerProvider(provider)
        : provider;
      this._proxyTracerProvider.setDelegate(delegate);
    }
    return success;
  }

  /**
   * Returns the global tracer provider.
   */
  public getTracerProvider(): TracerProvider {
    return getGlobal(API_NAME) || this._proxyTracerProvider;
  }

  /**
   * Returns a tracer from the global tracer provider.
   */
  public getTracer(name: string, version?: string): Tracer {
    return this.getTracerProvider().getTracer(name, version);
  }

  /** Remove the global tracer provider */
  public disable() {
    unregisterGlobal(API_NAME, DiagAPI.instance());
    this._proxyTracerProvider = new ProxyTracerProvider();
    this._tracerProviderFactory = undefined;
  }

  public wrapSpanContext = wrapSpanContext;

  public isSpanContextValid = isSpanContextValid;

  public deleteSpan = deleteSpan;

  public getSpan = getSpan;

  public getActiveSpan = getActiveSpan;

  public getSpanContext = getSpanContext;

  public setSpan = setSpan;

  public setSpanContext = setSpanContext;
}
