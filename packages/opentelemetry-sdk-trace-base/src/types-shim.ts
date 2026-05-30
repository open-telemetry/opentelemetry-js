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
