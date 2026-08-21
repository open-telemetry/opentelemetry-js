/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Attributes, ContextManager } from '@opentelemetry/api';
import type { TextMapPropagator } from '@opentelemetry/api';
import type { Instrumentation } from '@opentelemetry/instrumentation';
import type { Resource, ResourceDetector } from '@opentelemetry/resources';
import type {
  LogRecordLimits,
  LogRecordProcessor,
} from '@opentelemetry/sdk-logs';
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
 * Options for starting a Node SDK with `startNodeSdk()`.
 *
 * 1. If starting from a declarative config file, then most params are *not*
 *    supported. For example, you may not pass in a custom SpanProcessor
 *    or metric View -- those must be defined in the YAML config file.
 *    See `StartSdkFromConfigOptions`.
 * 2. Otherwise, we say the SDK is being started "from env" (environment
 *    variables). All params are optional. Reasonable defaults will be
 *    used, using `OTEL_*` envvars per the spec:
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
 * - replaced `resource` with `resourceAttributes` and `baseResource`.
 *   `resource` is a footgun: https://github.com/open-telemetry/opentelemetry-js/pull/6988#discussion_r3754084464
 * - dropped contextManager: YAGNI, for now
 * - dropped idGenerator: YAGNI, for now
 * - dropped serviceName: Use `resourceAttributes`, e.g.:
 *        resourceAttributes: {
 *          'service.name': 'my-svc',
 *          'service.version': '1.2.3',
 *        }
 * - dropped autoDetectResources: To disable resource detection, pass in
 *   `resourceDetectors: []`.
 * - dropped traceExporter: This overlaps with `spanProcessors`, which can lead
 *   to some confusion. Use one of:
 *    - set `OTEL_TRACES_EXPORTER`
 *    - use `spanProcessors`, e.g.:
 *      `spanProcessors: [new BatchSpanProcessor(myTraceExporter)],`
 *      Note: This option means `OTEL_BSP_` envvars are not read.
 */

export interface StartSdkFromConfigOptions {
  configFile: string;
  instrumentations?: (Instrumentation | Instrumentation[])[];
}

export interface StartSdkFromEnvOptions {
  /**
   * The SDK diagnostic log level.
   * If not provided, OTEL_LOG_LEVEL will be used, else default to "info".
   * Accepted values (case-insensitive) are: "all", "verbose", "debug",
   * "info", "warn", "error", "none".
   */
  logLevel?: string;

  // Propagation
  /**
   * Configure propagators.
   * https://opentelemetry.io/docs/concepts/context-propagation/#propagation
   *
   * If an array is provided, it must contain at least one entry.
   * Pass an empty array to have no propagators.
   * If not provided, then `OTEL_PROPAGATORS` is used.
   */
  propagators?: TextMapPropagator[];

  // Resources
  /**
   * A set of attributes to include in the Resource. These are a higher
   * priority than attributes from other sources (detectors,
   * `OTEL_RESOURCE_ATTRIBUTES`).
   */
  resourceAttributes?: Attributes;
  /**
   * An array of resource detectors to use.
   * Pass an empty array to have no detectors.
   * If not specified `OTEL_NODE_RESOURCE_DETECTORS` will be used.
   * Default set: 'service'
   * Available detectors:
   * - 'service': sets `service.name` from `OTEL_SERVICE_NAME`, sets `service.instance.id`
   * - 'host': provides `host.*` and `os.*` attributes
   * - 'process': provides `process.*` attributes
   *
   * Differences with `new NodeSDK()`:
   * - The default set of detectors is different and detector names have changed.
   * - The `OTEL_RESOURCE_ATTRIBUTES` envvar is now *always* read. This is no
   *   longer tied to the set of detectors.
   */
  resourceDetectors?: ResourceDetector[] | null;
  /**
   * Set the base resource (i.e., the lowest priority attributes) to use for
   * Resource gathering. For example, to disable all default attributes
   * use `emptyResource()` from the `@opentelemetry/resources` package.
   *
   * WARNING: This option should rarely be used.  Most users want to use
   * `resourceAttributes` instead.  Overriding the base resource can result in
   * telemetry not including the default attributes defined by the spec. These
   * can be important for telemetry analysis.
   * https://opentelemetry.io/docs/specs/semconv/resource/#semantic-attributes-with-sdk-provided-default-value
   */
  baseResource?: Resource;

  // Traces
  /**
   * Configure span processors.
   * Pass an empty array to disable tracing (no TracerProvider).
   * If not provided, then `OTEL_TRACES_EXPORTER` is used.
   */
  spanProcessors?: SpanProcessor[];
  /**
   * Provide a tracing Sampler.
   * See the following for some available samplers:
   * - https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/sdk-trace#built-in-samplers
   * - https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/sampler-composite
   * If not provided `OTEL_TRACES_SAMPLER*` envvars are used.
   */
  sampler?: Sampler;
  /**
   * Provide all or a subset of available span limits. The given object is
   * merged with limit values read from the environment:
   * https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#attribute-limits
   */
  spanLimits?: SpanLimits;

  // Metrics
  /**
   * Configure MetricReaders.
   * Pass an empty array to disable metrics (no MeterProvider).
   * If not provided, then `OTEL_METRICS_EXPORTER` is used.
   */
  metricReaders?: IMetricReader[];
  views?: ViewOptions[];

  // Logs
  /**
   * Configure LogRecord processors.
   * Pass an empty array to disable logging (no LoggerProvider).
   * If not provided, then `OTEL_LOGS_EXPORTER` is used.
   */
  logRecordProcessors?: LogRecordProcessor[];
  /**
   * Provide all or a subset of available LogRecord limits. The given object is
   * merged with limit values read from the environment:
   * https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#attribute-limits
   */
  logRecordLimits?: LogRecordLimits;

  instrumentations?: (Instrumentation | Instrumentation[])[];
}

export type StartSdkOptions =
  | StartSdkFromEnvOptions
  | Omit<StartSdkFromConfigOptions, 'configFile'>;
