/*!
 * Copyright 2019, OpenTelemetry Authors
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

/**
 * An enumeration that represents global trace flags. These flags are
 * propagated to all child {@link Span}. These determine features such as
 * whether a Span should be traced. It is implemented as a bitmask.
 */
export enum TraceFlags {
  /** Bit to represent whether trace is unsampled in trace flags. */
  UNSAMPLED = 0x0,
  /** Bit to represent whether trace is sampled in trace flags. */
  SAMPLED = 0x1,
}
