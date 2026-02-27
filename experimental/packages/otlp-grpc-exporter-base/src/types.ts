/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  ChannelCredentials,
  ChannelOptions,
  Metadata,
} from '@grpc/grpc-js';

import {
  CompressionAlgorithm,
  OTLPExporterConfigBase,
} from '@opentelemetry/otlp-exporter-base';

/**
 * OTLP Exporter Config for Node
 */
export interface OTLPGRPCExporterConfigNode extends OTLPExporterConfigBase {
  credentials?: ChannelCredentials;
  metadata?: Metadata;
  compression?: CompressionAlgorithm;
  userAgent?: string;
  channelOptions?: ChannelOptions;
}
