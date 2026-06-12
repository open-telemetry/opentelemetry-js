/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// This is a meta-package, and these exist in to re-export *all* items from
// the individual packages as individual _namespaces_, so wildcard exports are
// appropriate here. Otherwise, it'd be a pain to enumerate and keep things
// in-sync with all the upstream packages.

/* eslint-disable no-restricted-syntax */
export * as api from '@opentelemetry/api';
export * as contextBase from '@opentelemetry/api';
export * as core from '@opentelemetry/core';
export * as logs from '@opentelemetry/sdk-logs';
export * as metrics from '@opentelemetry/sdk-metrics';
export * as node from '@opentelemetry/sdk-trace-node';
export * as resources from '@opentelemetry/resources';
export * as tracing from '@opentelemetry/sdk-trace-base';
/* eslint-enable no-restricted-syntax */

export { NodeSDK } from './sdk';
export type { LoggerProviderConfig, MeterProviderConfig } from './sdk';
export type { NodeSDKConfiguration } from './types';
export { startNodeSDK } from './start';
