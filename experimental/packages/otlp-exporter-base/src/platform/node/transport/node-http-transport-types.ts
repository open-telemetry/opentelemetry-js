/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { HttpAgentFactory } from '../configuration/otlp-node-http-configuration';
import type { HttpRequestParameters } from '../../../transport/http-transport-types';

export interface NodeHttpRequestParameters extends HttpRequestParameters {
  agentFactory: HttpAgentFactory;
}
