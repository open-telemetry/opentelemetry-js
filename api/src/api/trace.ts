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
   * Set the current global tracer.
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
      this._proxyTracerProvider.setDelegate(provider);
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
