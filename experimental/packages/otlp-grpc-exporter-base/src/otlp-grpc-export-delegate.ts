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

import {
  createOtlpNetworkExportDelegate,
  IOtlpExportDelegate,
} from '@opentelemetry/otlp-exporter-base';
import { ISerializer } from '@opentelemetry/otlp-transformer';
import { OtlpGrpcConfiguration } from './configuration/otlp-grpc-configuration';
import { createOtlpGrpcExporterTransport } from './grpc-exporter-transport';

export function createOtlpGrpcExportDelegate<Internal, Response>(
  options: OtlpGrpcConfiguration,
  serializer: ISerializer<Internal, Response>,
  grpcName: string,
  grpcPath: string
): IOtlpExportDelegate<Internal> {
  return createOtlpNetworkExportDelegate(
    options,
    serializer,
    createOtlpGrpcExporterTransport({
      address: options.url,
      compression: options.compression,
      credentials: options.credentials,
      metadata: options.metadata,
      grpcName,
      grpcPath,
    })
  );
}
