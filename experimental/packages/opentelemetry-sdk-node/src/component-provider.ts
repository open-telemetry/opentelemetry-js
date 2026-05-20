/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SpanExporter } from '@opentelemetry/sdk-trace-base';
import type { LogRecordExporter } from '@opentelemetry/sdk-logs';
import type { PushMetricExporter } from '@opentelemetry/sdk-metrics';

/**
 * Schemaless configuration properties passed to a component provider.
 */
export type ConfigProperties = Record<string, unknown>;

/**
 * A provider responsible for creating a {@link SpanExporter} from configuration.
 *
 * @typeParam TConfig - The configuration properties type. Built-in providers
 *   use typed config model interfaces for full type safety. Custom providers
 *   default to the schemaless {@link ConfigProperties}.
 */
export interface SpanExporterComponentProvider<TConfig = ConfigProperties> {
  /** Configuration key that this provider handles (e.g. `'otlp_http'`). */
  readonly name: string;
  /** Create the exporter from the given configuration properties. */
  createComponent(properties: TConfig): SpanExporter;
}

/**
 * A provider responsible for creating a {@link LogRecordExporter} from configuration.
 *
 * @typeParam TConfig - The configuration properties type. Built-in providers
 *   use typed config model interfaces for full type safety. Custom providers
 *   default to the schemaless {@link ConfigProperties}.
 */
export interface LogRecordExporterComponentProvider<
  TConfig = ConfigProperties,
> {
  /** Configuration key that this provider handles (e.g. `'otlp_http'`). */
  readonly name: string;
  /** Create the exporter from the given configuration properties. */
  createComponent(properties: TConfig): LogRecordExporter;
}

/**
 * A provider responsible for creating a {@link PushMetricExporter} from configuration.
 *
 * @typeParam TConfig - The configuration properties type. Built-in providers
 *   use typed config model interfaces for full type safety. Custom providers
 *   default to the schemaless {@link ConfigProperties}.
 */
export interface PushMetricExporterComponentProvider<
  TConfig = ConfigProperties,
> {
  /** Configuration key that this provider handles (e.g. `'otlp_http'`). */
  readonly name: string;
  /** Create the exporter from the given configuration properties. */
  createComponent(properties: TConfig): PushMetricExporter;
}

/**
 * A map of component providers by kind, used to initialize a {@link ComponentProviderRegistry}.
 */
export interface ComponentProviderMap {
  spanExporters?: SpanExporterComponentProvider[];
  logRecordExporters?: LogRecordExporterComponentProvider[];
  pushMetricExporters?: PushMetricExporterComponentProvider[];
}

/**
 * Registry for component providers, keyed by name, with separate typed maps
 * per component kind. Providers are registered once at construction time.
 *
 * @internal implementation detail, not intended for public consumption.
 */
export class ComponentProviderRegistry {
  private readonly _spanExporters: ReadonlyMap<
    string,
    SpanExporterComponentProvider
  >;
  private readonly _logRecordExporters: ReadonlyMap<
    string,
    LogRecordExporterComponentProvider
  >;
  private readonly _pushMetricExporters: ReadonlyMap<
    string,
    PushMetricExporterComponentProvider
  >;

  constructor(providers: ComponentProviderMap) {
    this._spanExporters = buildProviderMap(
      providers.spanExporters ?? [],
      'SpanExporterComponentProvider'
    );
    this._logRecordExporters = buildProviderMap(
      providers.logRecordExporters ?? [],
      'LogRecordExporterComponentProvider'
    );
    this._pushMetricExporters = buildProviderMap(
      providers.pushMetricExporters ?? [],
      'PushMetricExporterComponentProvider'
    );
  }

  /** Get a registered {@link SpanExporterComponentProvider} by name. */
  getSpanExporterProvider(
    name: string
  ): SpanExporterComponentProvider | undefined {
    return this._spanExporters.get(name);
  }

  /** Get a registered {@link LogRecordExporterComponentProvider} by name. */
  getLogRecordExporterProvider(
    name: string
  ): LogRecordExporterComponentProvider | undefined {
    return this._logRecordExporters.get(name);
  }

  /** Get a registered {@link PushMetricExporterComponentProvider} by name. */
  getPushMetricExporterProvider(
    name: string
  ): PushMetricExporterComponentProvider | undefined {
    return this._pushMetricExporters.get(name);
  }
}

function buildProviderMap<T extends { name: string }>(
  providers: T[],
  kind: string
): ReadonlyMap<string, T> {
  const map = new Map<string, T>();
  for (const provider of providers) {
    if (map.has(provider.name)) {
      throw new Error(`${kind} already registered for name="${provider.name}"`);
    }
    map.set(provider.name, provider);
  }
  return map;
}
