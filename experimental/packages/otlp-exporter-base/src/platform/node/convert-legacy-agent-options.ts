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
import { OTLPExporterNodeConfigBase } from './types';
import type * as http from 'http';
import type * as https from 'https';

/**
 * Replicates old config behavior where there's two ways to set keepAlive.
 * This function sets keepAlive in AgentOptions if it is defined. In the future, we will remove
 * this duplicate to only allow setting keepAlive in AgentOptions.
 * @param config
 */
export function convertLegacyAgentOptions(
  config: OTLPExporterNodeConfigBase
): http.AgentOptions | https.AgentOptions {
  // populate keepAlive for use with new settings
  if (config?.keepAlive != null) {
    if (config.httpAgentOptions != null) {
      if (config.httpAgentOptions.keepAlive == null) {
        // specific setting is not set, populate with non-specific setting.
        config.httpAgentOptions.keepAlive = config.keepAlive;
      }
      // do nothing, use specific setting otherwise
    } else {
      // populate specific option if AgentOptions does not exist.
      config.httpAgentOptions = {
        keepAlive: config.keepAlive,
      };
    }
  }

  return config.httpAgentOptions ?? { keepAlive: true };
}
