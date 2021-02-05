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

import { baggageEntryMetadataSymbol } from './internal/symbol';

export interface BaggageEntry {
  /** `String` value of the `BaggageEntry`. */
  value: string;
  /**
   * Metadata is an optional string property defined by the W3C baggage specification.
   * It currently has no special meaning defined by the specification.
   */
  metadata?: BaggageEntryMetadata;
}

/**
 * Serializable Metadata defined by the W3C baggage specification.
 * It currently has no special meaning defined by the OpenTelemetry or W3C.
 */
export type BaggageEntryMetadata = { toString(): string } & {
  __TYPE__: typeof baggageEntryMetadataSymbol;
};
