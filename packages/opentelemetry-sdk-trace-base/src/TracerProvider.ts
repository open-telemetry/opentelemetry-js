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
import type { TracerProviderConfig } from './types';
import { ParentBasedSampler } from './sampler/ParentBasedSampler';
import { AlwaysOnSampler } from './sampler/AlwaysOnSampler';
import { RandomIdGenerator } from './platform';

export enum ForceFlushState {
  'resolved',
  'timeout',
  'error',
  'unresolved',
}

/**
 * This class represents a basic tracer provider which platform libraries can extend
 */
export class TracerProvider implements ApiTracerProvider {
  private readonly _config: Required<TracerProviderConfig>;
  private readonly _tracers: Map<string, Tracer> = new Map();
  private readonly _resource: Resource;
  private readonly _activeSpanProcessor: MultiSpanProcessor;

  constructor(config: TracerProviderConfig = {}) {
    this._config = {
      resource: config.resource ?? defaultResource(),
      sampler:
        config.sampler ??
        new ParentBasedSampler({
          root: new AlwaysOnSampler(),
        }),
      forceFlushTimeoutMillis: 3000,
      generalLimits: {
        attributeCountLimit: config.generalLimits?.attributeCountLimit ?? 128,
        attributeValueLengthLimit:
          config.generalLimits?.attributeValueLengthLimit ?? Infinity,
      },
      spanLimits: {
        // We will check and set default value later
        attributeCountLimit: config.spanLimits?.attributeCountLimit,
        attributeValueLengthLimit: config.spanLimits?.attributeValueLengthLimit,
        eventCountLimit: config.spanLimits?.eventCountLimit ?? 128,
        linkCountLimit: config.spanLimits?.linkCountLimit ?? 128,
        attributePerEventCountLimit:
          config.spanLimits?.attributePerEventCountLimit ?? 128,
        attributePerLinkCountLimit:
          config.spanLimits?.attributePerLinkCountLimit ?? 128,
      },
      idGenerator: config.idGenerator || new RandomIdGenerator(),
      spanProcessors: config.spanProcessors ?? [],
      meterProvider: config.meterProvider ?? {
        getMeter() {
          return createNoopMeter();
        },
      },
    };

    // Ensure Span limits
    if (!this._config.spanLimits.attributeValueLengthLimit) {
      this._config.spanLimits.attributeValueLengthLimit =
        config.generalLimits?.attributeValueLengthLimit ?? Infinity;
    }
    if (!this._config.spanLimits.attributeCountLimit) {
      this._config.spanLimits.attributeCountLimit =
        config.generalLimits?.attributeCountLimit ?? 128;
    }

    this._resource = this._config.resource;
    this._activeSpanProcessor = new MultiSpanProcessor(
      this._config.spanProcessors
    );
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
          this._config,
          this._resource,
          this._activeSpanProcessor
        )
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._tracers.get(key)!;
  }

  forceFlush(): Promise<void> {
    const timeout = this._config.forceFlushTimeoutMillis;
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
}
