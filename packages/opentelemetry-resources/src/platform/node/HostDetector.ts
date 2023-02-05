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

import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Resource } from '../../Resource';
import { Detector, ResourceAttributes } from '../../types';
import { ResourceDetectionConfig } from '../../config';
import { arch, hostname } from 'os';
import { IResource } from '../../IResource';
import { normalizeArch } from './utils';

/**
 * HostDetector detects the resources related to the host current process is
 * running on. Currently only non-cloud-based attributes are included.
 */
class HostDetector implements Detector {
  detect(_config?: ResourceDetectionConfig): Promise<IResource> {
    const attributes: ResourceAttributes = {
      [SemanticResourceAttributes.HOST_NAME]: hostname(),
      [SemanticResourceAttributes.HOST_ARCH]: normalizeArch(arch()),
    };
    return Promise.resolve(new Resource(attributes));
  }
}

export const hostDetector = new HostDetector();
