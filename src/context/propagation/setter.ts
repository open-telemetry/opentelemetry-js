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

export type SetterFunction<Carrier = any> = (
  carrier: Carrier,
  key: string,
  value: unknown
) => void;

/**
 * Default setter which sets value via direct property access
 *
 * @param carrier
 * @param key
 */
export function defaultSetter(carrier: any, key: string, value: unknown) {
  carrier[key] = value;
}
