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
  ContextManager,
  TextMapPropagator,
} from '@opentelemetry/api';
import {
  InstrumentationOption,
  registerInstrumentations,
} from '@opentelemetry/instrumentation';
import {
  Detector,
  DetectorSync,
  detectResourcesSync,
  IResource,
  browserDetector,
  Resource,
  ResourceDetectionConfig,
} from '@opentelemetry/resources';
import {
  BatchSpanProcessor,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {
  WebTracerConfig,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { WebSDKConfiguration } from './types';
import { SessionIdSpanProcessor } from './SessionIdSpanProcessor';

/** This class represents everything needed to register a fully configured OpenTelemetry Web SDK */

export class WebSDK {
  private _tracerProviderConfig?: {
    tracerConfig: WebTracerConfig;
    spanProcessor: SpanProcessor;
    contextManager?: ContextManager;
    textMapPropagator?: TextMapPropagator;
  };
  private _instrumentations: InstrumentationOption[];

  private _resource: IResource;
  private _resourceDetectors: Array<Detector | DetectorSync>;

  private _autoDetectResources: boolean;

  private _tracerProvider?: WebTracerProvider;
  private _serviceName?: string;

  private _disabled?: boolean;

  /**
   * Create a new NodeJS SDK instance
   */
  public constructor(configuration: Partial<WebSDKConfiguration> = {}) {
    this._resource = configuration.resource ?? new Resource({});
    this._resourceDetectors = configuration.resourceDetectors ?? [
      browserDetector,
    ];

    this._serviceName = configuration.serviceName;

    this._autoDetectResources = configuration.autoDetectResources ?? true;

    if (configuration.spanProcessor || configuration.traceExporter) {
      const tracerProviderConfig: WebTracerConfig = {};

      if (configuration.sampler) {
        tracerProviderConfig.sampler = configuration.sampler;
      }
      if (configuration.spanLimits) {
        tracerProviderConfig.spanLimits = configuration.spanLimits;
      }
      if (configuration.idGenerator) {
        tracerProviderConfig.idGenerator = configuration.idGenerator;
      }

      const spanProcessor =
        configuration.spanProcessor ??
        new BatchSpanProcessor(configuration.traceExporter!);

      this._tracerProviderConfig = {
        tracerConfig: tracerProviderConfig,
        spanProcessor,
        contextManager: configuration.contextManager,
        textMapPropagator: configuration.textMapPropagator
      };
    }

    let instrumentations: InstrumentationOption[] = [];
    if (configuration.instrumentations) {
      instrumentations = configuration.instrumentations;
    }
    this._instrumentations = instrumentations;
  }

  /**
   * Call this method to construct SDK components and register them with the OpenTelemetry API.
   */
  public start(): void {
    if (this._disabled) {
      return;
    }

    registerInstrumentations({
      instrumentations: this._instrumentations,
    });

    if (this._autoDetectResources) {
      const internalConfig: ResourceDetectionConfig = {
        detectors: this._resourceDetectors,
      };
      this._resource = this._resource.merge(detectResourcesSync(internalConfig));
    }

    this._resource =
      this._serviceName === undefined
        ? this._resource
        : this._resource.merge(
            new Resource({
              [SemanticResourceAttributes.SERVICE_NAME]: this._serviceName,
            })
          );

    const tracerProvider = new WebTracerProvider({
      ...this._tracerProviderConfig?.tracerConfig,
      resource: this._resource,
    });

    this._tracerProvider = tracerProvider;

    if (this._tracerProviderConfig) {
      tracerProvider.addSpanProcessor(this._tracerProviderConfig.spanProcessor);
    }

    tracerProvider.register({
      contextManager: this._tracerProviderConfig?.contextManager,
      propagator: this._tracerProviderConfig?.textMapPropagator,
    });

    // add processor for adding the sessionId attribute
    tracerProvider.addSpanProcessor(new SessionIdSpanProcessor());
  }

  public shutdown(): Promise<void> {
    const promises: Promise<unknown>[] = [];
    if (this._tracerProvider) {
      promises.push(this._tracerProvider.shutdown());
    }

    return (
      Promise.all(promises)
        // return void instead of the array from Promise.all
        .then(() => {})
    );
  }
}
