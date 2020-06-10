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
export interface EntryValue {
  /** `String` value of the `EntryValue`. */
  value: string;
  /**
   * ttl is an integer that represents number of hops an entry can
   * propagate.
   */
  ttl?: EntryTtl;
}

/**
 * EntryTtl is an integer that represents number of hops an entry can propagate.
 *
 * For now, ONLY special values (0 and -1) are supported.
 */
export enum EntryTtl {
  /**
   * NO_PROPAGATION is considered to have local context and is used within the
   * process it created.
   */
  NO_PROPAGATION = 0,

  /** UNLIMITED_PROPAGATION can propagate unlimited hops. */
  UNLIMITED_PROPAGATION = -1,
}
