/*!
 * Copyright 2019, OpenTelemetry Authors
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

export type GrpcCarrier = Metadata;
export interface HttpCarrier {
  [key: string]: unknown;
}

interface Metadata {
  set(key: string, value: MetadataValue): void;
  add(key: string, value: MetadataValue): void;
  remove(key: string): void;
  get(key: string): MetadataValue[];
  getMap(): { [key: string]: MetadataValue };
  clone(): Metadata;
  setOptions(options: MetadataOptions): void;
}

interface MetadataOptions {
  idempotentRequest?: boolean;
  waitForReady?: boolean;
  cacheableRequest?: boolean;
  corked?: boolean;
}

type MetadataValue = string | Buffer;
