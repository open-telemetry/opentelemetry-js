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

import * as sinon from 'sinon';
import * as perf_hooks from 'perf_hooks';

export const mockedHrTimeMs = 1586347902211;

export function mockHrTime() {
  // We cannot stub core.now or core.timeOrigin since a property of
  // ModuleNamespace can not be reconfigured.ß
  sinon.stub(perf_hooks.performance, 'timeOrigin').value(0);
  sinon.stub(perf_hooks.performance, 'now').returns(mockedHrTimeMs);
}
