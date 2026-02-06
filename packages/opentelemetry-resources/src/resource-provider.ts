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

import { EventEmitter } from 'stream';
import { Resource } from './Resource';
import {
  resourceFromAttributes,
  resourceFromDetectedResource,
} from './resource-impl';
import { ResourceDetector } from './types';
import { hostname } from 'os';

/**
 * Interface for resource providers.
 */
export interface ResourceProvider extends EventEmitter {
  /**
   * Returns a Resource describing the entity for which telemetry is collected.
   */
  getResource(): Resource;

  on(event: 'changed', listener: (resource: Resource) => void): this;
  on(event: string | symbol, listener: (...args: unknown[]) => void): this;

  addListener(event: 'changed', listener: (resource: Resource) => void): this;
  addListener(
    event: string | symbol,
    listener: (...args: unknown[]) => void
  ): this;
}

/**
 * Example implementation of a ResourceProvider with entity and resource detectors.
 */
export class DefaultResourceProvider
  extends EventEmitter
  implements ResourceProvider
{
  private detectors: ResourceDetector[];

  constructor(detectors: ResourceDetector[] = []) {
    super();
    this.detectors = detectors;
  }

  getResource(): Resource {
    let resource = resourceFromAttributes({
      'service.name': 'default-service',
      'host.name': hostname(),
    });

    for (const detector of this.detectors) {
      try {
        const detected = detector.detect();
        resource = resource.merge(resourceFromDetectedResource(detected));
      } catch {
        // ignore detector errors
      }
    }

    return resource;
  }
}

const res = new DefaultResourceProvider() as ResourceProvider;
res.on('changed', resource => {
  console.log('Resource changed:', resource);
});
