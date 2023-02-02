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

import { ResourceDetectionConfig } from './config';
import { SpanAttributes } from '@opentelemetry/api';
import { IResource } from './IResource';

/**
 * Interface for Resource attributes.
 * General `Attributes` interface is added in api v1.1.0.
 * To backward support older api (1.0.x), the deprecated `SpanAttributes` is used here.
 */
export type ResourceAttributes = SpanAttributes;

/**
 * @deprecated please use {@link DetectorSync}
 */
export interface Detector {
  detect(config?: ResourceDetectionConfig): Promise<IResource>;
}

/**
 * Interface for a synchronous Resource Detector. In order to detect attributes asynchronously, a detector
 * can pass a Promise as the second parameter to the Resource constructor.
 */
export interface DetectorSync {
  detect(config?: ResourceDetectionConfig): IResource;
}
