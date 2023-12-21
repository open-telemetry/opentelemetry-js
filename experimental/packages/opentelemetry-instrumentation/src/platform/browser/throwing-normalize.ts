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

/**
 * Placeholder normalize function to replace the node variant in browser runtimes,
 * this should never be called and will throw if it is called.
 *
 * This is a workaround to fix https://github.com/open-telemetry/opentelemetry-js/issues/4373 until the instrumentation
 * package can be made node-only.
 *
 * @param _path unused input path
 * @internal
 */
export function normalize(_path: string): string {
  throw new Error('Not implemented');
}
