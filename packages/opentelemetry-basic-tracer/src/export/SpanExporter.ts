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

import { Span } from '../Span';
import { ExportResult } from './ExportResult';

/**
 * An interface that allows different tracing services to export recorded data
 * for sampled spans in their own format.
 *
 * To export data this MUST be register to the Tracer SDK using a optional
 * config.
 */
export interface SpanExporter {
  /**
   * Called to export sampled {@link Span}s.
   * @param spans the list of sampled Spans to be exported.
   */
  // @todo: change to ReadableSpan when available (pull/150)
  export(spans: Span[], resultCallback: (result: ExportResult) => void): void;

  /** Stops the exporter. */
  shutdown(): void;
}
