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
