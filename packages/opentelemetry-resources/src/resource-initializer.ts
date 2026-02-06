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
import { detectResources } from './detect-resources';
import { Resource } from './Resource';
import { ResourceDetector } from './types';
import { EventEmitter } from 'events';

export enum ResourceStatus {
  DETECTING,
  INITIALIZED,
}

export type ResourceInitializeCallback = (
  resource: Resource,
  status: ResourceStatus
) => void;

export class ResourceInitializer extends EventEmitter {
  private _status = ResourceStatus.DETECTING;
  private _resource: Resource;

  constructor(detectors: ResourceDetector[]) {
    super();
    this._resource = detectResources({ detectors });
    if (this._resource.asyncAttributesPending) {
      this._resource.waitForAsyncAttributes?.().then(
        () => {
          this._status = ResourceStatus.INITIALIZED;
          this._notify();
        },
        (err: unknown) => {
          diag.error('Error initializing resource', err);
        }
      );
    }
  }

  public get status(): ResourceStatus {
    return this._status;
  }

  // TODO should cb be called immediately if already initialized?
  public onResourceInitialize(callback: ResourceInitializeCallback): void {
    if (this._status === ResourceStatus.INITIALIZED) {
      callback(this._resource, this._status);
      return;
    }
    this.on('resourceInitialize', callback);
  }

  private _notify(): void {
    this.emit('resourceInitialize', this._resource, this._status);
  }
}
