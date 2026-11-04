/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// This is a meta-package, and these exist in to re-export *all* items from
// the individual packages as individual _namespaces_, so wildcard exports are
// appropriate here. Otherwise, it'd be a pain to enumerate and keep things
// in-sync with all the upstream packages.

export { NodeSDK } from './sdk';
export type { LoggerProviderConfig, MeterProviderConfig } from './sdk';
export type { NodeSDKConfiguration } from './types';
export { startNodeSdk, startNodeSDK } from './start';
