/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { InstrumentationConfig } from '@opentelemetry/instrumentation';

export type IgnoreMatcher = string | RegExp | ((str: string) => boolean);

export interface GrpcInstrumentationConfig extends InstrumentationConfig {
  /* Omits tracing on any gRPC methods that match any of
   * the IgnoreMatchers in the ignoreGrpcMethods list
   */
  ignoreGrpcMethods?: IgnoreMatcher[];
  /** Map the following gRPC metadata to span attributes. */
  metadataToSpanAttributes?: {
    client?: {
      responseMetadata?: string[];
      requestMetadata?: string[];
    };
    server?: {
      responseMetadata?: string[];
      requestMetadata?: string[];
    };
  };
}
