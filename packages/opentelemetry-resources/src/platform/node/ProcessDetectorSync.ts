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
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
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
      [SemanticResourceAttributes.PROCESS_PID]: process.pid,
      [SemanticResourceAttributes.PROCESS_EXECUTABLE_NAME]: process.title,
      [SemanticResourceAttributes.PROCESS_EXECUTABLE_PATH]: process.execPath,
      [SemanticResourceAttributes.PROCESS_COMMAND_ARGS]: [
        process.argv[0],
        ...process.execArgv,
        ...process.argv.slice(1),
      ],
      [SemanticResourceAttributes.PROCESS_RUNTIME_VERSION]:
        process.versions.node,
      [SemanticResourceAttributes.PROCESS_RUNTIME_NAME]: 'nodejs',
      [SemanticResourceAttributes.PROCESS_RUNTIME_DESCRIPTION]: 'Node.js',
    };

    if (process.argv.length > 1) {
      attributes[SemanticResourceAttributes.PROCESS_COMMAND] = process.argv[1];
    }

    try {
      const userInfo = os.userInfo();
      attributes[SemanticResourceAttributes.PROCESS_OWNER] = userInfo.username;
    } catch (e) {
      diag.debug(`error obtaining process owner: ${e}`);
    }

    return new Resource(attributes);
  }
}

export const processDetectorSync = new ProcessDetectorSync();
