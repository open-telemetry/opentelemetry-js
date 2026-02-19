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

import { TracerProvider, Tracer as ApiTracer } from '@opentelemetry/api';
import { merge } from '@opentelemetry/core';
import { defaultResource, Resource } from '@opentelemetry/resources';
import { SpanProcessor } from './SpanProcessor';
import { Tracer } from './Tracer';
import { loadDefaultConfig } from './config';
import { MultiSpanProcessor } from './MultiSpanProcessor';
import { TracerConfig } from './types';
import { reconfigureLimits } from './utility';

export enum ForceFlushState {
  'resolved',
  'timeout',
  'error',
  'unresolved',
}

/**
 * This class represents a basic tracer provider which platform libraries can extend
 */
export class BasicTracerProvider implements TracerProvider {
  private readonly _config: TracerConfig;
  private readonly _tracers: Map<string, Tracer> = new Map();
  private readonly _resource: Resource;
  private readonly _activeSpanProcessor: MultiSpanProcessor;

  constructor(config: TracerConfig = {}) {
    const mergedConfig = merge(
      {},
      loadDefaultConfig(),
      reconfigureLimits(config)
    );
    this._resource = mergedConfig.resource ?? defaultResource();

    this._config = Object.assign({}, mergedConfig, {
      resource: this._resource,
    });

    const spanProcessors: SpanProcessor[] = [];

    if (config.spanProcessors?.length) {
      spanProcessors.push(...config.spanProcessors);
    }

    this._activeSpanProcessor = new MultiSpanProcessor(spanProcessors);
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

  /**
   * Creates a new TracerProvider with the same configuration but a new resource
   * that includes the provided entity merged into it.
   *
   * @param entity - The entity to merge into the resource
   * @returns A new TracerProvider with the merged entity
   */
  forEntity(entity: import('@opentelemetry/api').Entity): TracerProvider {
    const newResource = this._resource.addEntity(entity);
    return new BasicTracerProvider({
      ...this._config,
      resource: newResource,
    });
  }
}
