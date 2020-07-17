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

import { ReadableSpan } from '@opentelemetry/tracing';
import * as collectorTypes from '../../types';
import { CollectorTraceExporter } from './CollectorTraceExporter';
import { toCollectorExportTraceServiceRequest } from '../../transform';
import { CollectorExporterConfigNode } from './types';
import { sendDataUsingHttp } from './util';

export const DEFAULT_COLLECTOR_URL_JSON = 'http://localhost:55681/v1/trace';

export function onInitWithJson(
  _collector: CollectorTraceExporter,
  _config: CollectorExporterConfigNode
): void {
  // nothing to be done for json yet
}

/**
 * Send spans using json over http
 * @param collector
 * @param spans
 * @param onSuccess
 * @param onError
 */
export function sendSpansUsingJson(
  collector: CollectorTraceExporter,
  spans: ReadableSpan[],
  onSuccess: () => void,
  onError: (error: collectorTypes.CollectorExporterError) => void
): void {
  const exportTraceServiceRequest = toCollectorExportTraceServiceRequest(
    spans,
    collector
  );

  const body = JSON.stringify(exportTraceServiceRequest);

  return sendDataUsingHttp(
    collector,
    body,
    'application/json',
    onSuccess,
    onError
  );
}
