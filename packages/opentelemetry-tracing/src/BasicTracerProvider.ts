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

import {
  TracerProvider,
  trace,
  context,
  propagation,
  TextMapPropagator,
  diag,
} from '@opentelemetry/api';
import {
  CompositePropagator,
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
const merge = require('lodash.merge');

export type PROPAGATOR_FACTORY = () => TextMapPropagator;

/**
 * This class represents a basic tracer provider which platform libraries can extend
 */
export class BasicTracerProvider implements TracerProvider {
  protected static readonly _registeredPropagators = new Map<
    string,
    PROPAGATOR_FACTORY
  >([
    ['tracecontext', () => new HttpTraceContext()],
    ['baggage', () => new HttpBaggage()],
  ]);

  private readonly _config: TracerConfig;
  private readonly _registeredSpanProcessors: SpanProcessor[] = [];
  private readonly _tracers: Map<string, Tracer> = new Map();

  activeSpanProcessor: SpanProcessor = new NoopSpanProcessor();
  readonly resource: Resource;

  constructor(config: TracerConfig = {}) {
    const mergedConfig = merge({}, DEFAULT_CONFIG, config);
    this.resource =
      mergedConfig.resource ?? Resource.createTelemetrySDKResource();
    this._config = Object.assign({}, mergedConfig, {
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
    trace.setGlobalTracerProvider(this);
    if (config.propagator === undefined) {
      config.propagator = this._buildPropagatorFromEnv();
    }

    if (config.contextManager) {
      context.setGlobalContextManager(config.contextManager);
    }

    if (config.propagator) {
      propagation.setGlobalPropagator(config.propagator);
    }
  }

  shutdown() {
    return this.activeSpanProcessor.shutdown();
  }

  protected _getPropagator(name: string): TextMapPropagator | undefined {
    return BasicTracerProvider._registeredPropagators.get(name)?.();
  }

  protected _buildPropagatorFromEnv(): TextMapPropagator | undefined {
    // per spec, propagators from env must be deduplicated
    const uniquePropagatorNames = Array.from(
      new Set(getEnv().OTEL_PROPAGATORS)
    );

    const propagators = uniquePropagatorNames.map(name => {
      const propagator = this._getPropagator(name);
      if (!propagator) {
        diag.warn(
          `Propagator "${name}" requested through environment variable is unavailable.`
        );
      }

      return propagator;
    });
    const validPropagators = propagators.reduce<TextMapPropagator[]>(
      (list, item) => {
        if (item) {
          list.push(item);
        }
        return list;
      },
      []
    );

    if (validPropagators.length === 0) {
      return;
    } else if (uniquePropagatorNames.length === 1) {
      return validPropagators[0];
    } else {
      return new CompositePropagator({
        propagators: validPropagators,
      });
    }
  }
}
