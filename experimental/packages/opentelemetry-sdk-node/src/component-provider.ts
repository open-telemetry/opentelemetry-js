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
 * The built component provider registry maps component *name* (the string name
 * in a declarative config .yaml file) to a provider implementation.
 * For example:
 *    {
 *      SpanExporter: {
 *        otlp_http => OtlpHttpSpanExporterComponentProvider,
 *        otlp_grpc => OtlpGrpcSpanExporterComponentProvider,
 *        console => ConsoleSpanExporterComponentProvider,
 *      }
 *      // ... and similarly for other component types.
 *    }
 */
export type ComponentProviderRegistry = {
  ExperimentalResourceDetection?: Record<
    string,
    (props: ConfigProperties) => ResourceDetector
  >;
  TextMapPropagator?: Record<
    string,
    (props: ConfigProperties) => TextMapPropagator
  >;
  SpanExporter?: Record<string, (props: ConfigProperties) => SpanExporter>;
  SpanProcessor?: Record<string, (props: ConfigProperties) => SpanProcessor>;
  Sampler?: Record<string, (props: ConfigProperties) => Sampler>;
  IdGenerator?: Record<string, (props: ConfigProperties) => IdGenerator>;
  // PullMetricExporter?: Record<string, (props: ConfigProperties) => PullMetricExporter>; // XXX see above
  PushMetricExporter?: Record<
    string,
    (props: ConfigProperties) => PushMetricExporter
  >;
  MetricProducer?: Record<string, (props: ConfigProperties) => MetricProducer>;
  LogRecordExporter?: Record<
    string,
    (props: ConfigProperties) => LogRecordExporter
  >;
  LogRecordProcessor?: Record<
    string,
    (props: ConfigProperties) => LogRecordProcessor
  >;
};

/**
 * Merge multiple `ComponentProviderRegistry`'s into one
 *
 * @throws {Error} if two attempt to provide for the same component type and
 *  name.
 */
export function buildComponentProviderRegistry(
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
