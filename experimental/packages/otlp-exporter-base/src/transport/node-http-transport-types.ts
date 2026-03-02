/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpAgentFactory } from '../configuration/otlp-node-http-configuration';
import { HttpRequestParameters } from './http-transport-types';

export interface NodeHttpRequestParameters extends HttpRequestParameters {
  agentFactory: HttpAgentFactory;
}
