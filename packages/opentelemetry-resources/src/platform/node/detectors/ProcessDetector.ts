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
  Detector,
  Resource,
  PROCESS_RESOURCE,
  ResourceDetectionConfig,
} from '../../../';
import { ResourceAttributes } from '../../../types';

/**
 * ProcessDetector will be used to detect the resources related current process running
 * and being instrumented from the NodeJS Process module.
 */
class ProcessDetector implements Detector {
  async detect(config?: ResourceDetectionConfig): Promise<Resource> {
    const processResource: ResourceAttributes = {
      [PROCESS_RESOURCE.PID]: process.pid,
      [PROCESS_RESOURCE.NAME]: process.title || '',
      [PROCESS_RESOURCE.COMMAND]: process.argv[1] || '',
      [PROCESS_RESOURCE.COMMAND_LINE]: process.argv.join(' ') || '',
    };
    return this._getResourceAttributes(processResource, config);
  }
  /**
   * Validates process resource attribute map from process varaibls
   *
   * @param processResource The unsantized resource attributes from process as key/value pairs.
   * @param config: Config
   * @returns The sanitized resource attributes.
   */
  private _getResourceAttributes(
    processResource: ResourceAttributes,
    _config?: ResourceDetectionConfig
  ) {
    if (
      processResource[PROCESS_RESOURCE.NAME] === '' ||
      processResource[PROCESS_RESOURCE.PATH] === '' ||
      processResource[PROCESS_RESOURCE.COMMAND] === '' ||
      processResource[PROCESS_RESOURCE.COMMAND_LINE] === ''
    ) {
      diag.debug(
        'ProcessDetector failed: Unable to find required process resources. '
      );
      return Resource.empty();
    } else {
      return new Resource({
        ...processResource,
      });
    }
  }
}

export const processDetector = new ProcessDetector();
