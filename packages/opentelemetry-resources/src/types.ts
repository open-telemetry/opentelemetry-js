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

import { AttributeValue } from '@opentelemetry/api';
import { ResourceDetectionConfig } from './config';

/**
 * Interface for a Resource Detector.
 * A resource detector returns a set of detected resource attributes.
 * A detected resource attribute may be an {@link AttributeValue} or a Promise of an AttributeValue.
 */
export interface ResourceDetector {
  /**
   * Detect resource attributes.
   *
   * @returns a {@link DetectedResource} object containing detected resource attributes
   */
  detect(config?: ResourceDetectionConfig): DetectedResource;
}

export type DetectedResource = {
  /**
   * Detected resource attributes.
   */
  attributes?: DetectedResourceAttributes;
};

/**
 * An object representing detected resource attributes.
 * Value may be {@link AttributeValue}s, a promise to an {@link AttributeValue}, or undefined.
 */
type DetectedResourceAttributeValue = MaybePromise<AttributeValue | undefined>;

/**
 * An object representing detected resource attributes.
 * Values may be {@link AttributeValue}s or a promise to an {@link AttributeValue}.
 */
export type DetectedResourceAttributes = Record<
  string,
  DetectedResourceAttributeValue
>;

export type MaybePromise<T> = T | Promise<T>;

export type RawResourceAttribute = [
  string,
  MaybePromise<AttributeValue | undefined>,
];
