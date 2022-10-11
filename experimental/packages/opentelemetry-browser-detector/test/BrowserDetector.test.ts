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
import { Resource } from '@opentelemetry/resources';
import { browserDetector } from '../src/BrowserDetector';
import { describeBrowser } from '../src/util';
import {
  assertResource,
  assertEmptyResource
} from '../src/util';

describeBrowser('browserDetector()', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return browser information', async () => {
    sinon.stub(globalThis, 'navigator').value({
      userAgent: 'dddd',
      language:'en-US',
      userAgentData:{
        platform:'platform',
        brands:['brand1'],
        mobile:false
      }
    });

    const resource: Resource = await browserDetector.detect();
    assertResource(resource, {
      platform: 'platform',
      brands: ['brand1'],
      mobile: false,
      language: 'en-US',
      user_agent: 'dddd'
    });
  });
  it('should return empty resources if user agent is missing', async () => {
    sinon.stub(globalThis, 'navigator').value({
      userAgent: '',
    });
    const resource: Resource = await browserDetector.detect();
    assertEmptyResource(resource);
  });
});
