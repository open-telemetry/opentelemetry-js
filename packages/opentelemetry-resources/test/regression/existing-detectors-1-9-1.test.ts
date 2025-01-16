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
import * as assert from 'assert';
import { ResourceDetectionConfig } from '../../src';
import { DetectedResource, ResourceDetector } from '../../src/types';

// DO NOT MODIFY THIS DETECTOR: Previous detectors used Resource as IResource did not yet exist.
// If compilation fails at this point then the changes made are breaking.
class RegressionTestResourceDetector_1_9_1 implements ResourceDetector {
  detect(_config?: ResourceDetectionConfig): DetectedResource {
    return {};
  }
}

describe('Regression Test @opentelemetry/resources@1.9.1', () => {
  it('constructor', () => {
    assert.ok(new RegressionTestResourceDetector_1_9_1());
  });
});
