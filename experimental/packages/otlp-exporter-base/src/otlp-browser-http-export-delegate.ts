/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { OtlpHttpConfiguration } from './configuration/otlp-http-configuration';
import type { ISerializer } from '@opentelemetry/otlp-transformer';
import type { IOtlpExportDelegate } from './otlp-export-delegate';
import { createRetryingTransport } from './retrying-transport';
import { createOtlpNetworkExportDelegate } from './otlp-network-export-delegate';
import { createFetchTransport } from './transport/fetch-transport';

export function createOtlpFetchExportDelegate<Internal, Response>(
  options: OtlpHttpConfiguration,
  serializer: ISerializer<Internal, Response>
): IOtlpExportDelegate<Internal> {
  return createOtlpNetworkExportDelegate(
    options,
    serializer,
    createRetryingTransport({
      transport: createFetchTransport(options),
    })
  );
}

/**
 * @deprecated Use {@link createOtlpFetchExportDelegate} instead. Modern browsers use `fetch` with `keepAlive: true` when `sendBeacon` is used. Use a `fetch` polyfill that mimics this behavior to keep using `sendBeacon`.
 */
export function createOtlpSendBeaconExportDelegate<Internal, Response>(
  options: OtlpHttpConfiguration,
  serializer: ISerializer<Internal, Response>
): IOtlpExportDelegate<Internal> {
  return createOtlpFetchExportDelegate(options, serializer);
}
