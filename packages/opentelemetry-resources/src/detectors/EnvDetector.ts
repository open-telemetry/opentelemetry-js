/*!
 * Copyright 2020, OpenTelemetry Authors
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

import { Resource, Labels } from '../Resource';

/**
 * EnvDetector can be used to detect the presence of and create a Resource
 * from the OTEL_RESOURCE_LABELS environment variable.
 */
export class EnvDetector {
  // Type, label keys, and label values should not exceed 256 characters.
  private static readonly MAX_LENGTH = 255;

  // OTEL_RESOURCE_LABELS is a comma-separated list of labels.
  private static readonly COMMA_SEPARATOR = ',';

  // OTEL_RESOURCE_LABELS contains key value pair separated by '='.
  private static readonly LABEL_KEY_VALUE_SPLITTER = '=';

  private static readonly ERROR_MESSAGE_INVALID_CHARS =
    'should be a ASCII string with a length greater than 0 and not exceed ' +
    EnvDetector.MAX_LENGTH +
    ' characters.';

  private static readonly ERROR_MESSAGE_INVALID_VALUE =
    'should be a ASCII string with a length not exceed ' +
    EnvDetector.MAX_LENGTH +
    ' characters.';

  /**
   * Returns a {@link Resource} populated with labels from the
   * OTEL_RESOURCE_LABELS environment variable. Note this is an async function
   * to conform to the Detector interface.
   */
  static async detect(): Promise<Resource> {
    try {
      const labelString = process.env.OTEL_RESOURCE_LABELS;
      if (!labelString) return Resource.empty();
      const labels = EnvDetector.parseResourceLabels(
        process.env.OTEL_RESOURCE_LABELS
      );
      return new Resource(labels);
    } catch {
      return Resource.empty();
    }
  }

  /**
   * Creates a label map from the OC_RESOURCE_LABELS environment variable.
   *
   * OC_RESOURCE_LABELS: A comma-separated list of labels describing the
   * source in more detail, e.g. “key1=val1,key2=val2”. Domain names and paths
   * are accepted as label keys. Values may be quoted or unquoted in general. If
   * a value contains whitespaces, =, or " characters, it must always be quoted.
   *
   * @param rawEnvLabels The resource labels as a comma-seperated list
   * of key/value pairs.
   * @returns The sanitized resource labels.
   */
  private static parseResourceLabels(rawEnvLabels?: string): Labels {
    if (!rawEnvLabels) return {};

    const labels: Labels = {};
    const rawLabels: string[] = rawEnvLabels.split(
      EnvDetector.COMMA_SEPARATOR,
      -1
    );
    for (const rawLabel of rawLabels) {
      const keyValuePair: string[] = rawLabel.split(
        EnvDetector.LABEL_KEY_VALUE_SPLITTER,
        -1
      );
      if (keyValuePair.length !== 2) {
        continue;
      }
      let [key, value] = keyValuePair;
      // Leading and trailing whitespaces are trimmed.
      key = key.trim();
      value = value
        .trim()
        .split('^"|"$')
        .join('');
      if (!EnvDetector.isValidAndNotEmpty(key)) {
        throw new Error(`Label key ${EnvDetector.ERROR_MESSAGE_INVALID_CHARS}`);
      }
      if (!EnvDetector.isValid(value)) {
        throw new Error(
          `Label value ${EnvDetector.ERROR_MESSAGE_INVALID_VALUE}`
        );
      }
      labels[key] = value;
    }
    return labels;
  }

  /**
   * Determines whether the given String is a valid printable ASCII string with
   * a length not exceed MAX_LENGTH characters.
   *
   * @param str The String to be validated.
   * @returns Whether the String is valid.
   */
  private static isValid(name: string): boolean {
    return (
      name.length <= EnvDetector.MAX_LENGTH &&
      EnvDetector.isPrintableString(name)
    );
  }

  private static isPrintableString(str: string): boolean {
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
   * a length greater than 0 and not exceed MAX_LENGTH characters.
   *
   * @param str The String to be validated.
   * @returns Whether the String is valid and not empty.
   */
  private static isValidAndNotEmpty(str: string): boolean {
    return str.length > 0 && EnvDetector.isValid(str);
  }
}
