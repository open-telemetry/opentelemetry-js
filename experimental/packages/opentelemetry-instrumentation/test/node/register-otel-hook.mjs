/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { register } from 'node:module';

register('../../hook.mjs', import.meta.url);
