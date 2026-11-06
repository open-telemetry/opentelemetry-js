/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// XXX move this to `configuration` package

/**
 * Schemaless configuration properties passed to a component provider.
 */
export type ConfigProperties = Record<string, unknown>;
// ^XXX this type will come from api-config, or could just be copied here if we want to avoid a dep on it

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
        `a ComponentProvider of componentType="${provider.componentType}" and name="${provider.name}" is already registered: ${providerFromName.get(provider.name)!.constructor.name}`
      );
    } else {
      providerFromName.set(provider.name, provider);
    }
  }
  return reg;
}
