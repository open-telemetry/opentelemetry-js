/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  TracerProvider as ApiTracerProvider,
  Tracer as ApiTracer,
} from '@opentelemetry/api';
import { createNoopMeter } from '@opentelemetry/api';
import type { Resource } from '@opentelemetry/resources';
import { defaultResource } from '@opentelemetry/resources';
import type { SpanProcessor } from './SpanProcessor';
import { Tracer } from './Tracer';
import { MultiSpanProcessor } from './MultiSpanProcessor';
import type {
  ForceFlushOptions,
  TracerProviderOptions,
  TracerOptions,
} from './types';
import { ParentBasedSampler } from './sampler/ParentBasedSampler';
import { AlwaysOnSampler } from './sampler/AlwaysOnSampler';
import { RandomIdGenerator } from './platform';
import type { InspectFn, InspectStylizeOptions } from './inspect';
import {
  formatInspect,
  inspectCustom,
  settledResourceAttributes,
} from './inspect';

enum ForceFlushState {
  'resolved',
  'timeout',
  'error',
  'unresolved',
}

/**
 * This class represents a basic tracer provider which platform libraries can extend
 */
export class TracerProvider implements ApiTracerProvider {
  private readonly _resource: Resource;
  private readonly _activeSpanProcessor: MultiSpanProcessor;
  private readonly _forceFlushTimeoutMillis: number;
  private readonly _tracerOptions: TracerOptions;
  private readonly _tracers: Map<string, Tracer> = new Map();

  constructor(options: TracerProviderOptions = {}) {
    this._forceFlushTimeoutMillis = options.forceFlushTimeoutMillis ?? 30000;
    this._resource = options.resource ?? defaultResource();
    const spanProcessors = options.spanProcessors ?? [];
    this._activeSpanProcessor = new MultiSpanProcessor(spanProcessors);

    this._tracerOptions = {
      resource: this._resource,
      sampler:
        options.sampler ??
        new ParentBasedSampler({
          root: new AlwaysOnSampler(),
        }),
      spanLimits: {
        attributeCountLimit: options.spanLimits?.attributeCountLimit ?? 128,
        attributeValueLengthLimit:
          options.spanLimits?.attributeValueLengthLimit ?? Infinity,
        eventCountLimit: options.spanLimits?.eventCountLimit ?? 128,
        linkCountLimit: options.spanLimits?.linkCountLimit ?? 128,
        attributePerEventCountLimit:
          options.spanLimits?.attributePerEventCountLimit ?? 128,
        attributePerLinkCountLimit:
          options.spanLimits?.attributePerLinkCountLimit ?? 128,
      },
      idGenerator: options.idGenerator || new RandomIdGenerator(),
      spanProcessor: this._activeSpanProcessor,
      meterProvider: options.meterProvider ?? {
        getMeter() {
          return createNoopMeter();
        },
      },
    };
  }

  getTracer(
    name: string,
    version?: string,
    options?: { schemaUrl?: string }
  ): ApiTracer {
    const key = `${name}@${version || ''}:${options?.schemaUrl || ''}`;
    if (!this._tracers.has(key)) {
      this._tracers.set(
        key,
        new Tracer(
          { name, version, schemaUrl: options?.schemaUrl },
          this._tracerOptions
        )
      );
    }

    return this._tracers.get(key)!;
  }

  forceFlush(options?: ForceFlushOptions): Promise<void> {
    const timeout = options?.timeoutMillis ?? this._forceFlushTimeoutMillis;
    const promises = this._activeSpanProcessor['_spanProcessors'].map(
      (spanProcessor: SpanProcessor) => {
        return new Promise(resolve => {
          let state: ForceFlushState;
          const timeoutInterval = setTimeout(() => {
            resolve(
              new Error(
                `Span processor did not completed within timeout period of ${timeout} ms`
              )
            );
            state = ForceFlushState.timeout;
          }, timeout);

          spanProcessor
            .forceFlush()
            .then(() => {
              clearTimeout(timeoutInterval);
              if (state !== ForceFlushState.timeout) {
                state = ForceFlushState.resolved;
                resolve(state);
              }
            })
            .catch(error => {
              clearTimeout(timeoutInterval);
              state = ForceFlushState.error;
              resolve(error);
            });
        });
      }
    );

    return new Promise<void>((resolve, reject) => {
      Promise.all(promises)
        .then(results => {
          const errors = results.filter(
            result => result !== ForceFlushState.resolved
          );
          if (errors.length > 0) {
            reject(errors);
          } else {
            resolve();
          }
        })
        .catch(error => reject([error]));
    });
  }

  shutdown(): Promise<void> {
    return this._activeSpanProcessor.shutdown();
  }

  [inspectCustom](
    depth: number,
    options: InspectStylizeOptions | undefined,
    inspect: InspectFn | undefined
  ): unknown {
    const processors = this._activeSpanProcessor[
      '_spanProcessors'
    ] as SpanProcessor[];
    const payload = {
      resource: { attributes: settledResourceAttributes(this._resource) },
      tracers: Array.from(this._tracers.keys()),
      spanProcessors: processors.map(
        p => p.constructor?.name ?? 'SpanProcessor'
      ),
    };
    return formatInspect('TracerProvider', payload, depth, options, inspect);
  }
}
