/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SpanExporter } from '@opentelemetry/sdk-trace';

/**
 * Schemaless configuration properties passed to a component provider.
 */
export type ConfigProperties = Record<string, unknown>;
// ^XXX this type will come from api-config, or could just be copied here if we want to avoid a dep on it

// XXX rm
// // One of the "Declarative config type" values from
// // https://opentelemetry.io/docs/specs/otel/configuration/sdk/#supported-sdk-plugin-components
// export type ComponentType =
//   | 'ExperimentalResourceDetection'
//   | 'TextMapPropagator'
//   | 'SpanExporter'
//   | 'SpanProcessor'
//   | 'Sampler'
//   | 'IdGenerator'
//   | 'PullMetricExporter'
//   | 'PushMetricExporter'
//   | 'MetricProducer'
//   | 'LogRecordExporter'
//   | 'LogRecordProcessor';

// XXX rm
// export interface ComponentProvider<
//   TConfig = ConfigProperties,
//   TComponent = unknown,
// > {
//   readonly componentType: ComponentType; // e.g. 'SpanExporter'
//   readonly name: string;
//   createComponent(properties: TConfig): TComponent;
// }

// export type ComponentProviderRegistry = Map<
//   ComponentType,
//   Map<string, ComponentProvider>
// >;

export interface SpanExporterComponentProvider<TConfig = ConfigProperties> {
  readonly name: string;
  createComponent(properties: TConfig): SpanExporter;
}

/**
 * A data structure to hold a number of ComponentProviders (separated by
 * component type). One or more of these are used to build a
 * ComponentProviderRegistry (that is used for `createFromConfig()`).
 */
export type ComponentProvidersFromType = {
  // Keys are one of the "Declarative config type" values from
  // https://opentelemetry.io/docs/specs/otel/configuration/sdk/#supported-sdk-plugin-components
  // XXX
  // | 'ExperimentalResourceDetection'
  // | 'TextMapPropagator'
  // | 'SpanExporter'
  SpanExporter?: SpanExporterComponentProvider[];
  // | 'SpanProcessor'
  // | 'Sampler'
  // | 'IdGenerator'
  // | 'PullMetricExporter'
  // | 'PushMetricExporter'
  // | 'MetricProducer'
  // | 'LogRecordExporter'
  // | 'LogRecordProcessor';
};

// export type ComponentProviderRegistry = Map<
//   string,
//   Map<string, ComponentProvider>
// >;
export type ComponentProviderRegistry = Map<
  keyof ComponentProvidersFromType,
  Map<string, SpanExporterComponentProvider>
>;

export function buildComponentProviderRegistry(
  collections: ComponentProvidersFromType[]
): ComponentProviderRegistry {
  const reg: ComponentProviderRegistry = new Map();
  for (const collection of collections) {
    for (const [k, providers] of Object.entries(collection)) {
      const componentType = k as keyof ComponentProvidersFromType;
      let providerFromName = reg.get(componentType);
      if (!providerFromName) {
        providerFromName = new Map();
        reg.set(componentType, providerFromName);
      }
      for (const provider of providers) {
        if (providerFromName.has(provider.name)) {
          throw new Error(
            `a ComponentProvider of type "${componentType}" and name="${provider.name}" is already registered: ${providerFromName.get(provider.name)!.constructor.name}`
          );
        } else {
          providerFromName.set(provider.name, provider);
        }
      }
    }
  }
  return reg;
}
