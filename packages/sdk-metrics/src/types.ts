/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export type CommonReaderOptions = {
  timeoutMillis?: number;
};

export type CollectionOptions = CommonReaderOptions;

export type ShutdownOptions = CommonReaderOptions;

export type ForceFlushOptions = CommonReaderOptions;
