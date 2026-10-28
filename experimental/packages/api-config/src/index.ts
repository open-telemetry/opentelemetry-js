/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export type { ConfigProvider, ConfigProperties } from './types/ConfigProvider';

import { ConfigAPI } from './api/config';
export const config = ConfigAPI.getInstance();
