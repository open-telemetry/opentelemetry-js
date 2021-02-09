/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as api from '@opentelemetry/api';
import {
  CompositePropagator,
  ConsoleLogger,
  HttpTraceContext,
  HttpBaggage,
  getEnv,
} from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { SpanProcessor, Tracer } from '.';
import { DEFAULT_CONFIG } from './config';
import { MultiSpanProcessor } from './MultiSpanProcessor';
import { NoopSpanProcessor } from './NoopSpanProcessor';
import { SDKRegistrationConfig, TracerConfig } from './types';
import merge = require('lodash.merge');
import { TextMapPropagator } from '@opentelemetry/api';

/**
 * register core propagators on startup
 */
api.propagation.registerNamedPropagator(
  'tracecontext',
  () => new HttpTraceContext()
);
api.propagation.registerNamedPropagator('baggage', () => new HttpBaggage());

/**
 * This class represents a basic tracer provider which platform libraries can extend
 */
export class BasicTracerProvider implements api.TracerProvider {
  private readonly _config: TracerConfig;
  private readonly _registeredSpanProcessors: SpanProcessor[] = [];
  private readonly _tracers: Map<string, Tracer> = new Map();

  activeSpanProcessor: SpanProcessor = new NoopSpanProcessor();
  readonly logger: api.Logger;
  readonly resource: Resource;

  constructor(config: TracerConfig = {}) {
    const mergedConfig = merge({}, DEFAULT_CONFIG, config);
    this.logger =
      mergedConfig.logger ?? new ConsoleLogger(mergedConfig.logLevel);
    this.resource =
      mergedConfig.resource ?? Resource.createTelemetrySDKResource();
    this._config = Object.assign({}, mergedConfig, {
      logger: this.logger,
      resource: this.resource,
    });
  }

  getTracer(name: string, version?: string): Tracer {
    const key = `${name}@${version || ''}`;
    if (!this._tracers.has(key)) {
      this._tracers.set(key, new Tracer({ name, version }, this._config, this));
    }

    return this._tracers.get(key)!;
  }

  /**
   * Adds a new {@link SpanProcessor} to this tracer.
   * @param spanProcessor the new SpanProcessor to be added.
   */
  addSpanProcessor(spanProcessor: SpanProcessor): void {
    this._registeredSpanProcessors.push(spanProcessor);
    this.activeSpanProcessor = new MultiSpanProcessor(
      this._registeredSpanProcessors
    );
  }

  getActiveSpanProcessor(): SpanProcessor {
    return this.activeSpanProcessor;
  }

  /**
   * Register this TracerProvider for use with the OpenTelemetry API.
   * Undefined values may be replaced with defaults, and
   * null values will be skipped.
   *
   * @param config Configuration object for SDK registration
   */
  register(config: SDKRegistrationConfig = {}) {
    api.trace.setGlobalTracerProvider(this);
    if (config.propagator === undefined) {
      const propagators = this._getPropagatorsFromEnv();

      config.propagator = new CompositePropagator({
        propagators,
      });
    }

    if (config.contextManager) {
      api.context.setGlobalContextManager(config.contextManager);
    }

    if (config.propagator) {
      api.propagation.setGlobalPropagator(config.propagator);
    }
  }

  shutdown() {
    return this.activeSpanProcessor.shutdown();
  }

  _getPropagatorsFromEnv() {
    const result: TextMapPropagator[] = [];
    getEnv().OTEL_PROPAGATORS.forEach(propagatorName => {
      const propagator = api.propagation.getRegisteredPropagatorByName(
        propagatorName
      );
      if (propagator) {
        result.push(propagator);
      } else if (propagatorName === 'b3' || propagatorName === 'b3multi') {
        this.logger.warn(
          'B3 propagators unavailable, please add @opentelemetry/propagator-b3 to dependencies, and register using api.propagation.registerNamedPropagator().'
        );
      } else if (propagatorName === 'jaeger') {
        this.logger.warn(
          'Jaeger propagator unavailable, please add @opentelemetry/propagator-jaeger to dependencies, and register using api.propagation.registerNamedPropagator().'
        );
      } else {
        this.logger.warn(
          `Propagator with key "${propagatorName}" was requested, but wasn't registered.`
        );
      }
    });
    return result;
  }
}
