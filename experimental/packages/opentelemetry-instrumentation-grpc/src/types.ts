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

/**
 * Tracks whether this instrumentation emits old experimental,
 * new stable, or both semantic conventions.
 *
 * Enum values chosen such that the enum may be used as a bitmask.
 */
export const enum SemconvStability {
  /** Emit only stable semantic conventions */
  STABLE = 0x1,
  /** Emit only old semantic convetions */
  OLD = 0x2,
  /** Emit both stable and old semantic convetions */
  DUPLICATE = 0x1 | 0x2,
}
