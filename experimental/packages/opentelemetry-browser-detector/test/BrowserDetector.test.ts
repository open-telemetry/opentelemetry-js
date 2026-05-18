/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as sinon from 'sinon';
import { browserDetector } from '../src/BrowserDetector';
import {
  assertEmptyResource,
  assertResource,
  describeBrowser,
  describeNode,
} from './util';

describeBrowser('browserDetector()', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return browser information with userAgentData', async () => {
    sinon.stub(globalThis, 'navigator').value({
      userAgent: 'dddd',
      language: 'en-US',
      userAgentData: {
        platform: 'platform',
        brands: [
          {
            brand: 'Chromium',
            version: '106',
          },
          {
            brand: 'Google Chrome',
            version: '106',
          },
          {
            brand: 'Not;A=Brand',
            version: '99',
          },
        ],
        mobile: false,
      },
    });

    const resource = browserDetector.detect();
    assertResource(resource, {
      platform: 'platform',
      brands: ['Chromium 106', 'Google Chrome 106', 'Not;A=Brand 99'],
      mobile: false,
      language: 'en-US',
    });
  });

  it('should return browser information with userAgent', async () => {
    sinon.stub(globalThis, 'navigator').value({
      userAgent: 'dddd',
      language: 'en-US',
      userAgentData: undefined,
    });

    const resource = browserDetector.detect();
    assertResource(resource, {
      language: 'en-US',
      user_agent: 'dddd',
    });
  });

  it('should return empty resource if userAgent is missing', async () => {
    sinon.stub(globalThis, 'navigator').value({
      userAgent: '',
    });
    const resource = browserDetector.detect();
    assertEmptyResource(resource);
  });
});

describeNode('browserDetector()', () => {
  it('should return empty resource even if navigator is present', () => {
    // Cannot use sinon.stub for non-existent properties (Node.js <=20)
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        userAgent: 'dddd',
        language: 'en-US',
        userAgentData: undefined,
      },
      configurable: true,
    });

    const resource = browserDetector.detect();
    assertEmptyResource(resource);
  });
});
