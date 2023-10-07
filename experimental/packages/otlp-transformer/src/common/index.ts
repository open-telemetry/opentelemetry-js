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

import type { IFixed64 } from './types';
import { HrTime } from '@opentelemetry/api';
import { UnsignedLong } from './unsigned_long';

export * from './unsigned_long';

const NANOSECONDS = UnsignedLong.fromU32(1_000_000_000);

export function hrTimeToFixed64Nanos(hrTime: HrTime): IFixed64 {
  return UnsignedLong.fromU32(hrTime[0])
    .multiply(NANOSECONDS)
    .add(UnsignedLong.fromU32(hrTime[1]));
}
