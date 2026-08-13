/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Attributes, ContextManager } from '@opentelemetry/api';
import type { TextMapPropagator } from '@opentelemetry/api';
import type { Instrumentation } from '@opentelemetry/instrumentation';
import type { Resource, ResourceDetector } from '@opentelemetry/resources';
import type { LogRecordLimits, LogRecordProcessor } from '@opentelemetry/sdk-logs';
import type { IMetricReader, ViewOptions } from '@opentelemetry/sdk-metrics';
import type {
  Sampler,
  SpanExporter,
  SpanLimits,
  SpanProcessor,
  IdGenerator,
} from '@opentelemetry/sdk-trace';

export interface NodeSDKConfiguration {
  autoDetectResources: boolean;
  contextManager: ContextManager;
  textMapPropagator: TextMapPropagator | null;
  /** @deprecated use logRecordProcessors instead*/
  logRecordProcessor: LogRecordProcessor;
  logRecordProcessors?: LogRecordProcessor[];
  /** @deprecated use metricReaders instead*/
  metricReader: IMetricReader;
  metricReaders?: IMetricReader[];
  views: ViewOptions[];
  instrumentations: (Instrumentation | Instrumentation[])[];
  /**
   * Custom resource to attach to telemetry.
   * It is recommended to merge with the default resource via:
   *
   *     resource: defaultResource().merge(
   *       resourceFromAttributes({ foo: 'bar' })
   *     )
   */
  resource: Resource;
  resourceDetectors: Array<ResourceDetector>;
  sampler: Sampler;
  serviceName?: string;
  /** @deprecated use spanProcessors instead*/
  spanProcessor?: SpanProcessor;
  spanProcessors?: SpanProcessor[];
  traceExporter: SpanExporter;
  spanLimits: SpanLimits;
  idGenerator: IdGenerator;
}

/**
 * Options for starting a Node SDK with `startNodeSdk*()`.
 *
 * 1. If starting from a declarative config file, then most params are *not*
 *    supported. For example, you may not pass in a custom SpanProcessor
 *    or metric View -- those must be defined in the YAML config file.
 *    See `StartSdkFromConfigOptions`.
 * 2. Otherwise, we say the SDK is being started "from env" (environment
 *    variables). All params are optional. Reasonable defaults will be
 *    used, using `OTEL_*` envvars, if defined, per the spec:
 *      https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/
 *    plus some Node.js-specific `OTEL_NODE_*` envvars.
 *    See `StartSdkFromEnvOptions`.
 *
 * Differences from `new NodeSDK(...)` options:
 * - added `logLevel`
 * - added `logRecordLimits`: to match `spanLimits`
 * - change `textMapPropagator` to `propagators`: Drop 'textMap' because
 *   `OTEL_PROPAGATORS` and the declarative config property both use just
 *   "propagator". Make this plural. The array will be wrapped in a composite
 *   propagator, as necessary.
 * - replaced `resource` with `baseResource` and `resourceAttributes`.
 *   `resource` is a footgun: https://github.com/open-telemetry/opentelemetry-js/pull/6988#discussion_r3754084464
 * - dropped contextManager: YAGNI, for now
 * - dropped idGenerator: YAGNI, for now
 * - dropped serviceName: Use one of the following. Granted this is a pain, but
 *   it *does* setup to properly set other suggested resource attrs such as
 *   `service.namespace` and `service.version`.
 *    - set `OTEL_SERVICE_NAME` and use the 'service' resource detector
 *    - `resource`, e.g.:
 *        `resource: defaultResource().merge(resourceFromAttributes({'service.name': 'my-svc'}))`
 * - dropped autoDetectResources: assumed to always be true
 * - dropped traceExporter: This overlaps with `spanProcessors`, which can lead
 *   to some confusion. Use one of:
 *    - set `OTEL_TRACES_EXPORTER`
 *    - use `spanProcessors`, e.g.:
 *      `spanProcessors: [new BatchSpanProcessor(myTraceExporter)],`
 *      Note: This option means `OTEL_BSP_` envvars are not read.
 *
 * XXX doc every option
 */

export interface StartSdkFromEnvOptions {
  /**
   * The SDK diagnostic log level.
   * If not provided, OTEL_LOG_LEVEL will be used, else default to "info".
   * Accepted values (case-insensitive) are: "all", "verbose", "debug",
   * "info", "warn", "error", "none".
   */
  logLevel?: string;

  // Resources
  resourceAttributes?: Attributes;
  // XXX empty list means no resource detectors, and don't check env
  resourceDetectors?: ResourceDetector[];
  // XXX warn against using this, except specific use case of no telemetry.sdk.*, warn on service.name
  baseResource?: Resource;

  // Propagation
  /**
   * Configure propagators.
   * https://opentelemetry.io/docs/concepts/context-propagation/#propagation
   *
   * If an array is provided, it must contain at least one entry.
   * Specify `null` to explicitly not register any propagators.
   */
  propagators?: TextMapPropagator[] | null;

  // Traces
  /**
   * Configure span processors.
   *
   * If an array is provided, it must contain at least one entry.
   * Specify `null` to explicitly disable tracing (no TracerProvider).
   */
  spanProcessors?: SpanProcessor[] | null;
  sampler?: Sampler;
  // XXX these are merged with limits from env, so one can provide any subset of limits and fallback to env for others
  spanLimits?: SpanLimits;

  // Metrics
  /**
   * Configure MetricReaders.
   *
   * If an array is provided, it must contain at least one entry.
   * Specify `null` to explicitly disable metrics (no MeterProvider).
   */
  metricReaders?: IMetricReader[] | null;
  views?: ViewOptions[];

  // Logs
  /**
   * Configure LogRecord processors.
   *
   * If an array is provided, it must contain at least one entry.
   * Specify `null` to explicitly disable logs (no LoggerProvider).
   */
  logRecordProcessors?: LogRecordProcessor[] | null;
  logRecordLimits?: LogRecordLimits;

  instrumentations?: (Instrumentation | Instrumentation[])[];
}

export interface StartSdkFromConfigOptions {
  configFile: string;
  instrumentations?: (Instrumentation | Instrumentation[])[];
}

export type StartSdkOptions =
  | StartSdkFromEnvOptions
  | Omit<StartSdkFromConfigOptions, 'configFile'>;
