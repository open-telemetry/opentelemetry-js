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

import { createBoundedQueueExportPromiseHandler } from './bounded-queue-export-promise-handler';
import { OtlpSharedConfiguration } from './configuration/shared-configuration';
import { ISerializer } from '@opentelemetry/otlp-transformer';
import { IExporterTransport } from './exporter-transport';
import {
  createOtlpExportDelegate,
  IOtlpExportDelegate,
} from './otlp-export-delegate';

export function createOtlpNetworkExportDelegate<Internal, Response>(
  options: OtlpSharedConfiguration,
  serializer: ISerializer<Internal, Response>,
  transport: IExporterTransport
): IOtlpExportDelegate<Internal> {
  return createOtlpExportDelegate(
    {
      transport: transport,
      serializer,
      promiseHandler: createBoundedQueueExportPromiseHandler(options),
    },
    { timeout: options.timeoutMillis }
  );
}
