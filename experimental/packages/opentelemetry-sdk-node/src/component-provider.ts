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

// XXX Is it easier to read `ComponentProviderRegistry` if we pull these out.
export type SpanExporterComponentProvider = (
  reg: ComponentProviderRegistry,
  props: ConfigProperties
) => SpanExporter;

/**
 * The built component provider registry maps component *name* (the string name
 * in a declarative config .yaml file) to a provider implementation.
 */
export type ComponentProviderRegistry = {
  ExperimentalResourceDetection?: Record<
    string,
    (
      reg: ComponentProviderRegistry,
      props: ConfigProperties
    ) => ResourceDetector
  >;
  TextMapPropagator?: Record<
    string,
    (
      reg: ComponentProviderRegistry,
      props: ConfigProperties
    ) => TextMapPropagator
  >;
  SpanExporter?: Record<string, SpanExporterComponentProvider>;
  SpanProcessor?: Record<
    string,
    (reg: ComponentProviderRegistry, props: ConfigProperties) => SpanProcessor
  >;
  Sampler?: Record<
    string,
    (reg: ComponentProviderRegistry, props: ConfigProperties) => Sampler
  >;
  IdGenerator?: Record<
    string,
    (reg: ComponentProviderRegistry, props: ConfigProperties) => IdGenerator
  >;
  // XXX I get lost in `MetricReader`, `PeriodicMetricReader`, `PullMetricReader`
  //     and `PullMetricExporter`.
  //     See comment on `createPullMetricReaderFromConfig()`.
  //     I need help.
  // PullMetricExporter?: Record<string, (reg: ComponentProviderRegistry, props: ConfigProperties) => PullMetricExporter>;
  PushMetricExporter?: Record<
    string,
    (
      reg: ComponentProviderRegistry,
      props: ConfigProperties
    ) => PushMetricExporter
  >;
  MetricProducer?: Record<
    string,
    (reg: ComponentProviderRegistry, props: ConfigProperties) => MetricProducer
  >;
  LogRecordExporter?: Record<
    string,
    (
      reg: ComponentProviderRegistry,
      props: ConfigProperties
    ) => LogRecordExporter
  >;
  LogRecordProcessor?: Record<
    string,
    (
      reg: ComponentProviderRegistry,
      props: ConfigProperties
    ) => LogRecordProcessor
  >;
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
      'ExperimentalResourceDetection',
      'TextMapPropagator',
      'SpanExporter',
      'SpanProcessor',
      'Sampler',
      'IdGenerator',
      // 'PullMetricExporter', // XXX see above
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
