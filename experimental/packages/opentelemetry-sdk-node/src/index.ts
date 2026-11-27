/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export { NodeSDK } from './sdk';
export type { LoggerProviderConfig, MeterProviderConfig } from './sdk';
export type { NodeSDKConfiguration } from './types';

export { startNodeSdk } from './start';
export type { StartSdkOptions } from './types';
export type { ComponentProviderRegistry } from './component-provider';

/** Deprecated exports */
export { startNodeSDK } from './start';
