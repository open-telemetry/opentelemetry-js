/**
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * An Entry is used to label anything that is associated with a specific
 * operation, such as an HTTP request.
 */
export interface Entry {
  /** The entry key */
  readonly key: string;
  /** The entry value */
  readonly value: string;
  /** The metadata for the entry */
  readonly metadata: EntryMetadata;
}

/**
 * EntryMetadata contains properties associated with an entry. For now only the
 * property EntryTTL is defined. In future, additional properties may be added
 * to address specific situations.
 *
 * Anytime a sender serializes an entry, sends it over the wire and receiver
 * deserializes the entry then the entry is considered to have travelled one
 * hop. There could be one or more proxy(ies) between sender and receiver.
 * Proxies are treated as transparent entities and they do not create
 * additional hops.
 */
export interface EntryMetadata {
  /**
   * For now, only special values of EntryTtl are supported. In future,
   * additional properties may be added to address specific situations.
   */
  readonly entryTtl: EntryTtl;
}

/**
 * EntryTtl is an integer that represents number of hops an entry can propagate.
 *
 * For now, ONLY special values (0 and -1) are supported.
 */
export enum EntryTtl {
  /**
   * NO_PROPAGATION is considered to have local scope and is used within the
   * process it created.
   */
  NO_PROPAGATION = 0,

  /** UNLIMITED_PROPAGATION can propagate unlimited hops. */
  UNLIMITED_PROPAGATION = -1,
}
