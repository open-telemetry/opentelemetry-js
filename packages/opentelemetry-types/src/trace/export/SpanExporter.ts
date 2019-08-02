/**
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

import { Span } from '../span';

/**
 * An interface that allows different tracing services to export recorded data
 * for sampled spans in their own format.
 */
export interface SpanExporter {
  /**
   * Called to export sampled {@link Span}s.
   * @param spans the list of sampled Spans to be exported.
   */
  export(spans: Span[]): void;

  /** Stops the exporter. */
  stop(): void;
}
