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

/**
 * IdGenerator provides an interface for generating Trace Id and Span Id
 *
 * The prototype IdGenerator generates random 16-byte trace ID and 8-byte span ID
 */

export interface IdGenerator {
  /** Generate Trace ID which is default to be 16 bytes */
  GenerateTraceId(): string;
  /** Generate Span ID which is default to be 8 bytes */
  GenerateSpanId(): string;
}
