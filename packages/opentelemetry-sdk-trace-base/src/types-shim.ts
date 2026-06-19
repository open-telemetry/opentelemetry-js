/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ContextManager, TextMapPropagator } from '@opentelemetry/api';
import type { TracerProviderOptions } from '@opentelemetry/sdk-trace';

/**
 * TracerConfig provides an interface for configuring a BasicTracerProvider.
 */
export interface TracerConfig extends TracerProviderOptions {
  /** General Limits */
  generalLimits?: GeneralLimits;
}

/** Global configuration limits of trace service */
export interface GeneralLimits {
  /** attributeValueLengthLimit is maximum allowed attribute value size */
  attributeValueLengthLimit?: number;
  /** attributeCountLimit is number of attributes per trace */
  attributeCountLimit?: number;
}

/**
 * Configuration options for registering the API with the SDK.
 * Undefined values may be substituted for defaults, and null
 * values will not be registered.
 */
export interface SDKRegistrationConfig {
  /** Propagator to register as the global propagator */
  propagator?: TextMapPropagator | null;

  /** Context manager to register as the global context manager */
  contextManager?: ContextManager | null;
}

/** Interface configuration for a buffer. */
export interface BufferConfig {
  /** The maximum batch size of every export. It must be smaller or equal to
   * maxQueueSize. The default value is 512. */
  maxExportBatchSize?: number;

  /** The delay interval in milliseconds between two consecutive exports.
   *  The default value is 5000ms. */
  scheduledDelayMillis?: number;

  /** How long the export can run before it is cancelled.
   * The default value is 30000ms */
  exportTimeoutMillis?: number;

  /** The maximum queue size. After the size is reached spans are dropped.
   * The default value is 2048. */
  maxQueueSize?: number;
}

/** Interface configuration for BatchSpanProcessor on browser */
export interface BatchSpanProcessorBrowserConfig extends BufferConfig {
  /** Disable flush when a user navigates to a new page, closes the tab or the browser, or,
   * on mobile, switches to a different app. Auto flush is enabled by default. */
  disableAutoFlushOnDocumentHide?: boolean;
}
