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

import * as collectorTypes from '../../types';
import { CollectorExporterNodeBase } from './CollectorExporterNodeBase';
import { CollectorExporterConfigNode } from './types';
import { sendWithHttp } from './util';

export function initWithJson<ExportItem, ServiceRequest>(
  _collector: CollectorExporterNodeBase<ExportItem, ServiceRequest>,
  _config: CollectorExporterConfigNode
): void {
  // nothing to be done for json yet
}

export function sendWithJson<ExportItem, ServiceRequest>(
  collector: CollectorExporterNodeBase<ExportItem, ServiceRequest>,
  objects: ExportItem[],
  onSuccess: () => void,
  onError: (error: collectorTypes.CollectorExporterError) => void
): void {
  const serviceRequest = collector.convert(objects);

  sendWithHttp(
    collector,
    JSON.stringify(serviceRequest),
    'application/json',
    onSuccess,
    onError
  );
}
