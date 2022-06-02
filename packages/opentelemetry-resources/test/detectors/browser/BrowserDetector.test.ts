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
import { Resource } from '../../../src';
import { browserDetector } from '../../../src/detectors/BrowserDetector';
import { describeBrowser } from '../../util';
import {
  assertResource,
  assertEmptyResource,
} from '../../util/resource-assertions';

describeBrowser('browserDetector()', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return browser information', async () => {
    sinon.stub(globalThis, 'navigator').value({
      userAgent: 'dddd',
    });

    const resource: Resource = await browserDetector.detect();
    assertResource(resource, {
      version: 'dddd',
      runtimeDescription: 'Web Browser',
      runtimeName: 'browser',
    });
  });
  it('should return empty resources if version is missing', async () => {
    sinon.stub(globalThis, 'navigator').value({
      userAgent: '',
    });
    const resource: Resource = await browserDetector.detect();
    assertEmptyResource(resource);
  });
});
