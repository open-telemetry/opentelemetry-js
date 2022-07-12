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

import { Attributes, AttributeValue } from '@opentelemetry/api';

export interface LogRecord {
   /**
   * Sets an attribute to the log record.
   *
   * Sets a single Attribute with the key and value passed as arguments.
   *
   * @param key the key for this attribute.
   * @param value the value for this attribute. Setting a value null or
   *              undefined is invalid and will result in undefined behavior.
   */
  setAttribute(key: string, value?: AttributeValue): this;

  /**
   * Sets attributes to the span.
   *
   * @param attributes the attributes that will be added.
   *                   null or undefined attribute values
   *                   are invalid and will result in undefined behavior.
   */

    /**
   * Sets attributes to the event.
   *
   * @param attributes the attributes that will be added.
   *                   null or undefined attribute values
   *                   are invalid and will result in undefined behavior.
   */
   setAttributes(attributes: Attributes): this;
}
