/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Split module-level variable definition into separate files to allow
// tree-shaking on each api instance.
import { LogsAPI } from './api/logs';

/**
 * Entrypoint for logs API
 *
 * @since 1.10.0
 */
export const logs = LogsAPI.getInstance();
