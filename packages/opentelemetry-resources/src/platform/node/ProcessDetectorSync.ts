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

import { diag } from '@opentelemetry/api';
import {
  PROCESS_COMMAND_ARGS,
  PROCESS_COMMAND,
  PROCESS_EXECUTABLE_NAME,
  PROCESS_EXECUTABLE_PATH,
  PROCESS_OWNER,
  PROCESS_PID,
  PROCESS_RUNTIME_DESCRIPTION,
  PROCESS_RUNTIME_NAME,
  PROCESS_RUNTIME_VERSION,
} from '@opentelemetry/semantic-conventions';
import { Resource } from '../../Resource';
import { DetectorSync, ResourceAttributes } from '../../types';
import { ResourceDetectionConfig } from '../../config';
import { IResource } from '../../IResource';
import * as os from 'os';

/**
 * ProcessDetectorSync will be used to detect the resources related current process running
 * and being instrumented from the NodeJS Process module.
 */
class ProcessDetectorSync implements DetectorSync {
  detect(_config?: ResourceDetectionConfig): IResource {
    const attributes: ResourceAttributes = {
      [PROCESS_PID]: process.pid,
      [PROCESS_EXECUTABLE_NAME]: process.title,
      [PROCESS_EXECUTABLE_PATH]: process.execPath,
      [PROCESS_COMMAND_ARGS]: [
        process.argv[0],
        ...process.execArgv,
        ...process.argv.slice(1),
      ],
      [PROCESS_RUNTIME_VERSION]:
        process.versions.node,
      [PROCESS_RUNTIME_NAME]: 'nodejs',
      [PROCESS_RUNTIME_DESCRIPTION]: 'Node.js',
    };

    if (process.argv.length > 1) {
      attributes[PROCESS_COMMAND] = process.argv[1];
    }

    try {
      const userInfo = os.userInfo();
      attributes[PROCESS_OWNER] = userInfo.username;
    } catch (e) {
      diag.debug(`error obtaining process owner: ${e}`);
    }

    return new Resource(attributes);
  }
}

export const processDetectorSync = new ProcessDetectorSync();
