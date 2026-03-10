/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ChannelCredentials, Metadata } from '@grpc/grpc-js';
import type { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';

/**
 * OTLP Exporter Config for Node
 */
export interface OTLPGRPCExporterConfigNode {
  url?: string;
  concurrencyLimit?: number;
  timeoutMillis?: number;
  credentials?: ChannelCredentials;
  metadata?: Metadata;
  compression?: CompressionAlgorithm;
  userAgent?: string;
}
