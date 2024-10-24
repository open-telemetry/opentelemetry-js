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

/**
 * Merges two schema URLs. If both schema URLs are present and differ,
 * a warning is logged and the first schema URL is prioritized.
 *
 * @param schemaUrl1 - The first schema URL
 * @param schemaUrl2 - The second schema URL
 * @returns The prioritized schema URL
 */

export function mergeSchemaUrls(
  schemaUrl1: string,
  schemaUrl2: string
): string {
  if (schemaUrl1 !== schemaUrl2) {
    diag.warn('Schema URLs differ. Using the original schema URL.');
  }
  return schemaUrl1 || schemaUrl2;
}
