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
import { processDetector, Resource } from '../../../src';
import {
  assertEmptyResource,
} from '../../util/resource-assertions';
import { describeBrowser } from '../../util';

describeBrowser('processDetector() on web browser', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return empty resource', async () => {
    const resource: Resource = await processDetector.detect();
    assertEmptyResource(resource);
  });
});
