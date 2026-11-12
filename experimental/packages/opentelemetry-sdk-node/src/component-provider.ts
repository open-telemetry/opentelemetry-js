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

// These `*ComponentProvider` aliases are defined to make
// `type ComponentProviderRegistry` more readable;
export type ExperimentalResourceDetectorComponentProvider = (
  reg: ComponentProviderRegistry,
  props: ConfigProperties
) => ResourceDetector;
export type TextMapPropagatorComponentProvider = (
  reg: ComponentProviderRegistry,
  props: ConfigProperties
) => TextMapPropagator;
export type SpanExporterComponentProvider = (
  reg: ComponentProviderRegistry,
  props: ConfigProperties
) => SpanExporter;
export type SpanProcessorComponentProvider = (
  reg: ComponentProviderRegistry,
  props: ConfigProperties
) => SpanProcessor;
export type SamplerComponentProvider = (
  reg: ComponentProviderRegistry,
  props: ConfigProperties
) => Sampler;
export type IdGeneratorComponentProvider = (
  reg: ComponentProviderRegistry,
  props: ConfigProperties
) => IdGenerator;
// TODO(7309): Support `PullMetricExporter` component providers.
export type PushMetricExporterComponentProvider = (
  reg: ComponentProviderRegistry,
  props: ConfigProperties
) => PushMetricExporter;
export type MetricProducerComponentProvider = (
  reg: ComponentProviderRegistry,
  props: ConfigProperties
) => MetricProducer;
export type LogRecordExporterComponentProvider = (
  reg: ComponentProviderRegistry,
  props: ConfigProperties
) => LogRecordExporter;
export type LogRecordProcessorComponentProvider = (
  reg: ComponentProviderRegistry,
  props: ConfigProperties
) => LogRecordProcessor;

/**
 * The built component provider registry maps component *name* (the string name
 * in a declarative config .yaml file) to a provider implementation.
 *
 * Supported component types (the keys) are the config types in this table:
 * https://opentelemetry.io/docs/specs/otel/configuration/sdk/#supported-sdk-plugin-components
 * (with the exception of ResourceDetection).
 */
export type ComponentProviderRegistry = {
  /**
   * @experimental The resource detector component provider interface is not stable.
   */
  ExperimentalResourceDetector?: Record<
    string,
    ExperimentalResourceDetectorComponentProvider
  >;

  TextMapPropagator?: Record<string, TextMapPropagatorComponentProvider>;
  SpanExporter?: Record<string, SpanExporterComponentProvider>;
  SpanProcessor?: Record<string, SpanProcessorComponentProvider>;
  Sampler?: Record<string, SamplerComponentProvider>;
  IdGenerator?: Record<string, IdGeneratorComponentProvider>;

  // TODO(7309): Support `PullMetricExporter` component providers.
  // PullMetricExporter?: Record<string, PullMetricExporterComponentProvider>;
  PushMetricExporter?: Record<string, PushMetricExporterComponentProvider>;
  MetricProducer?: Record<string, MetricProducerComponentProvider>;

  LogRecordExporter?: Record<string, LogRecordExporterComponentProvider>;
  LogRecordProcessor?: Record<string, LogRecordProcessorComponentProvider>;
};

/**
 * Merge multiple `ComponentProviderRegistry`'s into one.
 *
 * @throws {Error} if two attempt to provide for the same component type and
 *  name.
 */
export function mergeComponentProviderRegistries(
  regs: ComponentProviderRegistry[]
): ComponentProviderRegistry {
  const mergedReg: ComponentProviderRegistry = {};
  for (const reg of regs) {
    const componentTypes: (keyof ComponentProviderRegistry)[] = [
      'ExperimentalResourceDetector',
      'TextMapPropagator',
      'SpanExporter',
      'SpanProcessor',
      'Sampler',
      'IdGenerator',
      // TODO(7309): 'PullMetricExporter',
      'PushMetricExporter',
      'MetricProducer',
      'LogRecordExporter',
      'LogRecordProcessor',
    ];
    for (const componentType of componentTypes) {
      const providerFromName = reg[componentType];
      if (providerFromName !== undefined) {
        for (const name of Object.keys(providerFromName)) {
          if (mergedReg[componentType]?.[name]) {
            throw new Error(
              `a ComponentProvider of type "${componentType}" and name="${name}" is already registered: ${mergedReg[componentType]?.[name]}`
            );
          } else {
            mergedReg[componentType] ??= {};
            // The `!` is used because tsc doesn't infer existence from `??= {}` above.
            mergedReg[componentType]![name] = providerFromName[name];
          }
        }
      }
    }
  }
  return mergedReg;
}
