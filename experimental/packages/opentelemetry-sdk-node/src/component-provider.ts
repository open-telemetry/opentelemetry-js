/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TextMapPropagator } from '@opentelemetry/api';
import type { ResourceDetector } from '@opentelemetry/resources';
import type {
  LogRecordExporter,
  LogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import type {
  MetricProducer,
  PushMetricExporter,
} from '@opentelemetry/sdk-metrics';
import type {
  IdGenerator,
  Sampler,
  SpanExporter,
  SpanProcessor,
} from '@opentelemetry/sdk-trace';

/**
 * Schemaless configuration properties passed to a component provider.
 */
export type ConfigProperties = Record<string, unknown>;
// ^XXX this type will come from api-config, or could just be copied here if we want to avoid a dep on it

export interface ExperimentalResourceDetectionComponentProvider<
  TConfig = ConfigProperties,
> {
  readonly name: string;
  createComponent(properties: TConfig): ResourceDetector;
}

export interface TextMapPropagatorComponentProvider<
  TConfig = ConfigProperties,
> {
  readonly name: string;
  createComponent(properties: TConfig): TextMapPropagator;
}

export interface SpanExporterComponentProvider<TConfig = ConfigProperties> {
  readonly name: string;
  createComponent(properties: TConfig): SpanExporter;
}

export interface SpanProcessorComponentProvider<TConfig = ConfigProperties> {
  readonly name: string;
  createComponent(properties: TConfig): SpanProcessor;
}

export interface SamplerComponentProvider<TConfig = ConfigProperties> {
  readonly name: string;
  createComponent(properties: TConfig): Sampler;
}

export interface IdGeneratorComponentProvider<TConfig = ConfigProperties> {
  readonly name: string;
  createComponent(properties: TConfig): IdGenerator;
}

// XXX I get lost in `MetricReader`, `PeriodicMetricReader`, `PullMetricReader`
//     and `PullMetricExporter`.
//     See comment on `createPullMetricReaderFromConfig()`.
//     I need help.
//
// export interface PullMetricExporterComponentProvider<
//   TConfig = ConfigProperties,
// > {
//   readonly name: string;
//   createComponent(properties: TConfig): PullMetricExporter;
// }

export interface PushMetricExporterComponentProvider<
  TConfig = ConfigProperties,
> {
  readonly name: string;
  createComponent(properties: TConfig): PushMetricExporter;
}

export interface MetricProducerComponentProvider<TConfig = ConfigProperties> {
  readonly name: string;
  createComponent(properties: TConfig): MetricProducer;
}

export interface LogRecordExporterComponentProvider<
  TConfig = ConfigProperties,
> {
  readonly name: string;
  createComponent(properties: TConfig): LogRecordExporter;
}

export interface LogRecordProcessorComponentProvider<
  TConfig = ConfigProperties,
> {
  readonly name: string;
  createComponent(properties: TConfig): LogRecordProcessor;
}

/**
 * A data structure to hold a number of ComponentProviders (separated by
 * component type). One or more of these are used to build a
 * ComponentProviderRegistry (that is used for `createFromConfig()`).
 */
export type ComponentProvidersFromType = {
  // Keys are one of the "Declarative config type" values from
  // https://opentelemetry.io/docs/specs/otel/configuration/sdk/#supported-sdk-plugin-components
  ExperimentalResourceDetection?: ExperimentalResourceDetectionComponentProvider[];
  TextMapPropagator?: TextMapPropagatorComponentProvider[];
  SpanExporter?: SpanExporterComponentProvider[];
  SpanProcessor?: SpanProcessorComponentProvider[];
  Sampler?: SamplerComponentProvider[];
  IdGenerator?: IdGeneratorComponentProvider[];
  // XXX see above
  // PullMetricExporter?: PullMetricExporterComponentProvider[];
  PushMetricExporter?: PushMetricExporterComponentProvider[];
  MetricProducer?: MetricProducerComponentProvider[];
  LogRecordExporter?: LogRecordExporterComponentProvider[];
  LogRecordProcessor?: LogRecordProcessorComponentProvider[];
};

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
