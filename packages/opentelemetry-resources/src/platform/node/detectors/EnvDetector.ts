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

import { getEnv } from '@opentelemetry/core';
import {
  Detector,
  Resource,
  ResourceDetectionConfigWithLogger,
  ResourceAttributes,
} from '../../../';

/**
 * EnvDetector can be used to detect the presence of and create a Resource
 * from the OTEL_RESOURCE_ATTRIBUTES environment variable.
 */
class EnvDetector implements Detector {
  // Type, attribute keys, and attribute values should not exceed 256 characters.
  private readonly _MAX_LENGTH = 255;

  // OTEL_RESOURCE_ATTRIBUTES is a comma-separated list of attributes.
  private readonly _COMMA_SEPARATOR = ',';

  // OTEL_RESOURCE_ATTRIBUTES contains key value pair separated by '='.
  private readonly _LABEL_KEY_VALUE_SPLITTER = '=';

  private readonly _ERROR_MESSAGE_INVALID_CHARS =
    'should be a ASCII string with a length greater than 0 and not exceed ' +
    this._MAX_LENGTH +
    ' characters.';

  private readonly _ERROR_MESSAGE_INVALID_VALUE =
    'should be a ASCII string with a length not exceed ' +
    this._MAX_LENGTH +
    ' characters.';

  /**
   * Returns a {@link Resource} populated with attributes from the
   * OTEL_RESOURCE_ATTRIBUTES environment variable. Note this is an async
   * function to conform to the Detector interface.
   *
   * @param config The resource detection config with a required logger
   */
  async detect(config: ResourceDetectionConfigWithLogger): Promise<Resource> {
    try {
      const rawAttributes = getEnv().OTEL_RESOURCE_ATTRIBUTES;
      if (!rawAttributes) {
        config.logger.debug(
          'EnvDetector failed: Environment variable "OTEL_RESOURCE_ATTRIBUTES" is missing.'
        );
        return Resource.empty();
      }
      const attributes = this._parseResourceAttributes(rawAttributes);
      return new Resource(attributes);
    } catch (e) {
      config.logger.debug(`EnvDetector failed: ${e.message}`);
      return Resource.empty();
    }
  }

  /**
   * Creates an attribute map from the OTEL_RESOURCE_ATTRIBUTES environment
   * variable.
   *
   * OTEL_RESOURCE_ATTRIBUTES: A comma-separated list of attributes describing
   * the source in more detail, e.g. “key1=val1,key2=val2”. Domain names and
   * paths are accepted as attribute keys. Values may be quoted or unquoted in
   * general. If a value contains whitespaces, =, or " characters, it must
   * always be quoted.
   *
   * @param rawEnvAttributes The resource attributes as a comma-seperated list
   * of key/value pairs.
   * @returns The sanitized resource attributes.
   */
  private _parseResourceAttributes(
    rawEnvAttributes?: string
  ): ResourceAttributes {
    if (!rawEnvAttributes) return {};

    const attributes: ResourceAttributes = {};
    const rawAttributes: string[] = rawEnvAttributes.split(
      this._COMMA_SEPARATOR,
      -1
    );
    for (const rawAttribute of rawAttributes) {
      const keyValuePair: string[] = rawAttribute.split(
        this._LABEL_KEY_VALUE_SPLITTER,
        -1
      );
      if (keyValuePair.length !== 2) {
        continue;
      }
      let [key, value] = keyValuePair;
      // Leading and trailing whitespaces are trimmed.
      key = key.trim();
      value = value.trim().split('^"|"$').join('');
      if (!this._isValidAndNotEmpty(key)) {
        throw new Error(`Attribute key ${this._ERROR_MESSAGE_INVALID_CHARS}`);
      }
      if (!this._isValid(value)) {
        throw new Error(`Attribute value ${this._ERROR_MESSAGE_INVALID_VALUE}`);
      }
      attributes[key] = value;
    }
    return attributes;
  }

  /**
   * Determines whether the given String is a valid printable ASCII string with
   * a length not exceed _MAX_LENGTH characters.
   *
   * @param str The String to be validated.
   * @returns Whether the String is valid.
   */
  private _isValid(name: string): boolean {
    return name.length <= this._MAX_LENGTH && this._isPrintableString(name);
  }

  private _isPrintableString(str: string): boolean {
    for (let i = 0; i < str.length; i++) {
      const ch: string = str.charAt(i);
      if (ch <= ' ' || ch >= '~') {
        return false;
      }
    }
    return true;
  }

  /**
   * Determines whether the given String is a valid printable ASCII string with
   * a length greater than 0 and not exceed _MAX_LENGTH characters.
   *
   * @param str The String to be validated.
   * @returns Whether the String is valid and not empty.
   */
  private _isValidAndNotEmpty(str: string): boolean {
    return str.length > 0 && this._isValid(str);
  }
}

export const envDetector = new EnvDetector();
