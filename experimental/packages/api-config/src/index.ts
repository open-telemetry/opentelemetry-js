/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export type { ConfigProperties } from './types/ConfigProperties';
export type { ConfigProvider } from './types/ConfigProvider';
export { createConfigProperties } from './ConfigPropertiesImpl';
export { NoopConfigProvider, NOOP_CONFIG_PROVIDER } from './NoopConfigProvider';

import { ConfigAPI } from './api/config';
export const config = ConfigAPI.getInstance();
