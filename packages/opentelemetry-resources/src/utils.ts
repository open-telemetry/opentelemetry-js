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

import { Attributes } from '@opentelemetry/api';

export const isPromiseLike = <R>(val: any): val is PromiseLike<R> => {
  return (
    val !== null && typeof val === 'object' && typeof val.then === 'function'
  );
};

export const getAsyncAttributesIfNotResolved = (
  asyncAttributesHaveResolved: boolean,
  asyncAttributesPromise?: Promise<Attributes>
): Promise<Attributes> | undefined => {
  if (!asyncAttributesHaveResolved) {
    return asyncAttributesPromise;
  }
  return undefined;
};
