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

import { Attributes, diag } from '@opentelemetry/api';
import {
  SEMRESATTRS_PROCESS_COMMAND,
  SEMRESATTRS_PROCESS_COMMAND_ARGS,
  SEMRESATTRS_PROCESS_EXECUTABLE_NAME,
  SEMRESATTRS_PROCESS_EXECUTABLE_PATH,
  SEMRESATTRS_PROCESS_OWNER,
  SEMRESATTRS_PROCESS_PID,
  SEMRESATTRS_PROCESS_RUNTIME_DESCRIPTION,
  ATTR_PROCESS_RUNTIME_NAME,
  SEMRESATTRS_PROCESS_RUNTIME_VERSION,
} from '@opentelemetry/semantic-conventions';
import * as os from 'os';
import { ResourceDetectionConfig } from '../../../config';
import { DetectedResource, ResourceDetector } from '../../../types';

/**
 * ProcessDetector will be used to detect the resources related current process running
 * and being instrumented from the NodeJS Process module.
 */
class ProcessDetector implements ResourceDetector {
  detect(_config?: ResourceDetectionConfig): DetectedResource {
    const attributes: Attributes = {
      [SEMRESATTRS_PROCESS_PID]: process.pid,
      [SEMRESATTRS_PROCESS_EXECUTABLE_NAME]: process.title,
      [SEMRESATTRS_PROCESS_EXECUTABLE_PATH]: process.execPath,
      [SEMRESATTRS_PROCESS_COMMAND_ARGS]: [
        process.argv[0],
        ...process.execArgv,
        ...process.argv.slice(1),
      ],
      [SEMRESATTRS_PROCESS_RUNTIME_VERSION]: process.versions.node,
      [ATTR_PROCESS_RUNTIME_NAME]: 'nodejs',
      [SEMRESATTRS_PROCESS_RUNTIME_DESCRIPTION]: 'Node.js',
    };

    if (process.argv.length > 1) {
      attributes[SEMRESATTRS_PROCESS_COMMAND] = process.argv[1];
    }

    try {
      const userInfo = os.userInfo();
      attributes[SEMRESATTRS_PROCESS_OWNER] = userInfo.username;
    } catch (e) {
      diag.debug(`error obtaining process owner: ${e}`);
    }

    return { attributes };
  }
}

export const processDetector = new ProcessDetector();
