/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// XXX maybe move these to the `configuration` package? Not sure.
//    Then a 3rd party ComponentProvider impl can just dep on `configuration`.
//    It shouldn't need to dep on `sdk-node`?
//    Though sdk-node is the only user of ComponentProvider's, so it wouldn't be evil to have that dep.
//    Pretend this was in sdk-lib, used by sdk-node and a new mythical sdk-bun.
//    It is whereever the "create"-step stuff for Decl Conf lives. Currently that's sdk-node.
//    configuration feels more "right", at least for now.

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
        `a ComponentProvider of componentType="${provider.componentType}" and name="${provider.name}" is already registered: ${providerFromName.get(provider.name)!.constructor.name}`
      );
    } else {
      providerFromName.set(provider.name, provider);
    }
  }
  return reg;
}
