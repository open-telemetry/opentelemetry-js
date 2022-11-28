/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { InstrumentationConfig } from '@opentelemetry/instrumentation';
import { Span } from '@opentelemetry/api';
import type * as grpcJsTypes from '@grpc/grpc-js';
import type * as grpcTypes from 'grpc';

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
  };
}

export type metadataCaptureType = {
  client: {
    captureRequestMetadata: (
      span: Span,
      metadata: grpcJsTypes.Metadata | grpcTypes.Metadata
    ) => void;
    captureResponseMetadata: (
      span: Span,
      metadata: grpcJsTypes.Metadata | grpcTypes.Metadata
    ) => void;
  };
};
