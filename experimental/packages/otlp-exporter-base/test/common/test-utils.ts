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
import { diag } from '@opentelemetry/api';

export function registerMockDiagLogger() {
  // arrange
  const stubs = {
    verbose: sinon.stub(),
    debug: sinon.stub(),
    info: sinon.stub(),
    warn: sinon.stub(),
    error: sinon.stub(),
  };
  diag.setLogger(stubs);
  stubs.warn.resetHistory(); // reset history setLogger will warn if another has already been set

  return stubs;
}
