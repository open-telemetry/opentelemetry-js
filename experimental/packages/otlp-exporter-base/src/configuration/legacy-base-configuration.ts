/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { HeadersFactory } from './otlp-http-configuration';

export interface OTLPExporterConfigBase {
  /**
   * Custom headers that will be attached to the HTTP request that's sent to the endpoint.
   *
   * @remarks
   * Prefer using a plain object over a factory function wherever possible.
   * If using a factory function (`HeadersFactory`), **do not import `http` or `https` at the top of the file**.
   * Instead, use dynamic `import()` or `require()` to load the module. This lets
   * `@opentelemetry/instrumentation-http` instrument the module first.
   *
   * Functions passed to the exporter MUST NOT throw errors.
   *
   * @example <caption> Using headers options directly: </caption>
   * headers: {
   *  Authorization: "Api-Token my-secret-token",
   * }
   *
   * @example <caption> Using a custom factory function </caption>
   * headers: async () => {
   *   // ... do whatever you need to obtain the headers, ensuring you `await import('your-library')` to avoid breaking instrumentations ...
   *   return {
   *     Authorization: `Bearer ${token}`,
   *   };
   * };
   */
  headers?: Record<string, string> | HeadersFactory;
  /**
   * Collector endpoint URL for the exporter.
   *
   * @remarks
   * Defaults to the signal-specific endpoint, such as
   * `http://localhost:4318/v1/traces`, `http://localhost:4318/v1/metrics`,
   * or `http://localhost:4318/v1/logs`.
   */
  url?: string;
  /**
   * Maximum number of in-flight export requests.
   *
   * @defaultValue 30
   */
  concurrencyLimit?: number;
  /**
   * Maximum time, in milliseconds, the OTLP exporter will wait for each batch export.
   *
   * @defaultValue 10000
   */
  timeoutMillis?: number;
}
