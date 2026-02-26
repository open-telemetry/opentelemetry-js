/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BasicTracerProvider,
  SDKRegistrationConfig,
  TracerConfig,
} from '@opentelemetry/sdk-trace-base';
import { StackContextManager } from './StackContextManager';
import {
  trace,
  context,
  ContextManager,
  propagation,
  TextMapPropagator,
} from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';

function setupContextManager(
  contextManager: ContextManager | null | undefined
) {
  // null means 'do not register'
  if (contextManager === null) {
    return;
  }

  // undefined means 'register default'
  if (contextManager === undefined) {
    const defaultContextManager = new StackContextManager();
    defaultContextManager.enable();
    context.setGlobalContextManager(defaultContextManager);
    return;
  }

  contextManager.enable();
  context.setGlobalContextManager(contextManager);
}

function setupPropagator(propagator: TextMapPropagator | null | undefined) {
  // null means 'do not register'
  if (propagator === null) {
    return;
  }

  // undefined means 'register default'
  if (propagator === undefined) {
    propagation.setGlobalPropagator(
      new CompositePropagator({
        propagators: [
          new W3CTraceContextPropagator(),
          new W3CBaggagePropagator(),
        ],
      })
    );
    return;
  }

  propagation.setGlobalPropagator(propagator);
}

/**
 * WebTracerConfig provides an interface for configuring a Web Tracer.
 */
export type WebTracerConfig = TracerConfig;

/**
 * This class represents a web tracer with {@link StackContextManager}
 */
export class WebTracerProvider extends BasicTracerProvider {
  /**
   * Constructs a new Tracer instance.
   * @param config Web Tracer config
   */
  constructor(config: WebTracerConfig = {}) {
    super(config);
  }

  /**
   * Register this TracerProvider for use with the OpenTelemetry API.
   * Undefined values may be replaced with defaults, and
   * null values will be skipped.
   *
   * @param config Configuration object for SDK registration
   */
  register(config: SDKRegistrationConfig = {}): void {
    trace.setGlobalTracerProvider(this);
    setupPropagator(config.propagator);
    setupContextManager(config.contextManager);
  }
}
