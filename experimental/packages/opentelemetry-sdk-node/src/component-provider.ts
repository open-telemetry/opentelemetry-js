/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ConsoleExporterConfigModel } from '@opentelemetry/configuration';
import {
  ConsoleSpanExporter,
  type SpanExporter,
} from '@opentelemetry/sdk-trace';

/**
 * Schemaless configuration properties passed to a component provider.
 */
export type ConfigProperties = Record<string, unknown>;

// One of the "Declarative config type" values from
// https://opentelemetry.io/docs/specs/otel/configuration/sdk/#supported-sdk-plugin-components
export type ComponentType =
  | 'ExperimentalResourceDetection'
  | 'TextMapPropagator'
  | 'SpanExporter'
  | 'SpanProcessor'
  | 'Sampler'
  | 'IdGenerator'
  | 'PullMetricExporter'
  | 'PushMetricExporter'
  | 'MetricProducer'
  | 'LogRecordExporter'
  | 'LogRecordProcessor';

export interface ComponentProvider<
  TConfig = ConfigProperties,
  TComponent = unknown,
> {
  readonly componentType: ComponentType; // e.g. 'SpanExporter'
  readonly name: string;
  createComponent(properties: TConfig): TComponent;
}

export type ComponentProviderRegistry = Map<
  ComponentType,
  Map<string, ComponentProvider>
>;

export function buildComponentProviderRegistry(
  providers: ComponentProvider[]
): ComponentProviderRegistry {
  const reg: ComponentProviderRegistry = new Map();
  for (const provider of providers) {
    const providerFromName = reg.get(provider.componentType);
    if (!providerFromName) {
      reg.set(provider.componentType, new Map([[provider.name, provider]]));
    } else if (providerFromName.has(provider.name)) {
      throw new Error(
        `a "${provider.componentType}" ComponentProvider is already registered for name="${provider.name}": ${providerFromName.get(provider.name)!.constructor.name}`
      );
    } else {
      providerFromName.set(provider.name, provider);
    }
  }
  return reg;
}
