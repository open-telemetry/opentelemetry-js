/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ConfigurationModel } from '@opentelemetry/configuration';
const config: ConfigurationModel = {
  tracer_provider: {
    processors: [{ my_custom_processor: {} }],
  },
};
