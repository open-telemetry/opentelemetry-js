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
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { ResourceDetectionConfig } from '../config';
import { DetectedResource, ResourceDetector } from '../types';
import { getStringFromEnv } from '@opentelemetry/core';

/**
 * EnvDetector can be used to detect the presence of and create a Resource
 * from the OTEL_RESOURCE_ATTRIBUTES environment variable.
 */
class EnvDetector implements ResourceDetector {
  // Type, attribute keys, and attribute values should not exceed 256 characters.
  private readonly _MAX_LENGTH = 255;

  // OTEL_RESOURCE_ATTRIBUTES is a comma-separated list of attributes.
  private readonly _COMMA_SEPARATOR = ',';

  // OTEL_RESOURCE_ATTRIBUTES contains key value pair separated by '='.
  private readonly _LABEL_KEY_VALUE_SPLITTER = '=';

  /**
   * Returns a {@link Resource} populated with attributes from the
   * OTEL_RESOURCE_ATTRIBUTES environment variable. Note this is an async
   * function to conform to the Detector interface.
   *
   * @param config The resource detection config
   */
  detect(_config?: ResourceDetectionConfig): DetectedResource {
    const attributes: Attributes = {};

    const rawAttributes = getStringFromEnv('OTEL_RESOURCE_ATTRIBUTES');
    const serviceName = getStringFromEnv('OTEL_SERVICE_NAME');

    if (rawAttributes) {
      try {
        const parsedAttributes = this._parseResourceAttributes(rawAttributes);
        Object.assign(attributes, parsedAttributes);
      } catch (e) {
        diag.debug(`EnvDetector failed: ${e instanceof Error ? e.message : e}`);
      }
    }

    if (serviceName) {
      attributes[ATTR_SERVICE_NAME] = serviceName;
    }

    return { attributes };
  }

  /**
   * Creates an attribute map from the OTEL_RESOURCE_ATTRIBUTES environment
   * variable.
   *
   * OTEL_RESOURCE_ATTRIBUTES: A comma-separated list of attributes in the
   * format "key1=value1,key2=value2". The ',' and '=' characters in keys
   * and values MUST be percent-encoded. Other characters MAY be percent-encoded.
   *
   * Per the spec, on any error (e.g., decoding failure), the entire environment
   * variable value is discarded.
   *
   * @param rawEnvAttributes The resource attributes as a comma-separated list
   * of key/value pairs.
   * @returns The parsed resource attributes.
   * @throws Error if parsing fails (caller handles by discarding all attributes)
   */
  private _parseResourceAttributes(rawEnvAttributes?: string): Attributes {
    if (!rawEnvAttributes) return {};

    const attributes: Attributes = {};
    const rawAttributes: string[] = rawEnvAttributes.split(
      this._COMMA_SEPARATOR
    );

    for (const rawAttribute of rawAttributes) {
      const keyValuePair: string[] = rawAttribute.split(
        this._LABEL_KEY_VALUE_SPLITTER
      );

      // Per spec: ',' and '=' MUST be percent-encoded in keys and values.
      // If we get != 2 parts, there's an unencoded '=' which is an error.
      if (keyValuePair.length !== 2) {
        throw new Error(
          `Invalid format for OTEL_RESOURCE_ATTRIBUTES: "${rawAttribute}". ` +
            `Expected format: key=value. The ',' and '=' characters must be percent-encoded in keys and values.`
        );
      }

      const [rawKey, rawValue] = keyValuePair;
      const key = rawKey.trim();
      const value = rawValue.trim();

      if (key.length === 0) {
        throw new Error(
          `Invalid OTEL_RESOURCE_ATTRIBUTES: empty attribute key in "${rawAttribute}".`
        );
      }

      let decodedKey: string;
      let decodedValue: string;
      try {
        decodedKey = decodeURIComponent(key);
        decodedValue = decodeURIComponent(value);
      } catch (e) {
        throw new Error(
          `Failed to percent-decode OTEL_RESOURCE_ATTRIBUTES entry "${rawAttribute}": ${e instanceof Error ? e.message : e}`
        );
      }

      if (decodedKey.length > this._MAX_LENGTH) {
        throw new Error(
          `Attribute key exceeds the maximum length of ${this._MAX_LENGTH} characters: "${decodedKey}".`
        );
      }

      if (decodedValue.length > this._MAX_LENGTH) {
        throw new Error(
          `Attribute value exceeds the maximum length of ${this._MAX_LENGTH} characters for key "${decodedKey}".`
        );
      }

      attributes[decodedKey] = decodedValue;
    }

    return attributes;
  }
}

export const envDetector = new EnvDetector();
