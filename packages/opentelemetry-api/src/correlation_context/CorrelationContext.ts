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

import { EntryValue } from './EntryValue';

/**
 * CorrelationContext represents collection of entries. Each key of
 * CorrelationContext is associated with exactly one value. CorrelationContext
 * is serializable, to facilitate propagating it not only inside the process
 * but also across process boundaries. CorrelationContext is used to annotate
 * telemetry with the name:value pair Entry. Those values can be used to add
 * dimension to the metric or additional contest properties to logs and traces.
 */
export interface CorrelationContext {
  [entryKey: string]: EntryValue;
}
