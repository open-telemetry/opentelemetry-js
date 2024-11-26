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

import { Resource } from './Resource';
import { ResourceDetectionConfig } from './config';
import { diag } from '@opentelemetry/api';
import { IResource } from './IResource';

/**
 * Runs all resource detectors synchronously, merging their results. In case of attribute collision later resources will take precedence.
 *
 * @param config Configuration for resource detection
 */
export const detectResourcesSync = (
  config: ResourceDetectionConfig = {}
): IResource => {
  const detectors = config.detectors ?? [];
  const resources = detectors.map(d => d.detect());
  
  Promise.all(resources.map(r => r.attributes)).then((attribsArr) => {
    for (const attribs of attribsArr) {
      if (Object.keys(attribs).length > 0) {
        diag.verbose(JSON.stringify(attribs, null, 4));
      }
    }
  });
  return resources.reduce((acc, res) => acc.merge(res), Resource.empty());
}
