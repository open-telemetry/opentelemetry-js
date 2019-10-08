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

import { SpanExporter } from './SpanExporter';
import { ReadableSpan } from './ReadableSpan';
import { ExportResult } from '@opentelemetry/sdk-base';
import { hrTimeToMilliseconds } from '@opentelemetry/core';

/**
 * This is implementation of {@link SpanExporter} that prints spans to the
 * console. This class can be used for diagnostic purposes.
 */
export class ConsoleSpanExporter implements SpanExporter {
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    for (const span of spans) {
      console.log(
        `{name=${span.name}, traceId=${span.spanContext.traceId}, spanId=${
          span.spanContext.spanId
        }, kind=${span.kind}, parent=${
          span.parentSpanId
        }, duration=${hrTimeToMilliseconds(span.duration)}}}`
      );
    }
    return resultCallback(ExportResult.SUCCESS);
  }

  shutdown(): void {}
}
