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
import { Suite } from 'mocha';
import * as assert from 'assert';
import { BROWSER_ATTRIBUTES } from '../src/types';
import { DetectedResource } from '@opentelemetry/resources';

const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined';

export function describeBrowser(title: string, fn: (this: Suite) => void) {
  title = `Browser: ${title}`;
  if (isBrowser) {
    return describe(title, fn);
  }
  return describe.skip(title, fn);
}

export function describeNode(title: string, fn: (this: Suite) => void) {
  title = `Node.js: ${title}`;
  if (isBrowser) {
    return describe.skip(title, fn);
  }
  return describe(title, fn);
}

export const assertResource = (
  resource: DetectedResource,
  validations: {
    platform?: string;
    brands?: string[];
    mobile?: boolean;
    language?: string;
    user_agent?: string;
  }
) => {
  if (validations.platform) {
    assert.strictEqual(
      resource.attributes?.[BROWSER_ATTRIBUTES.PLATFORM],
      validations.platform
    );
  }
  if (validations.brands) {
    assert.ok(Array.isArray(resource.attributes?.[BROWSER_ATTRIBUTES.BRANDS]));
    assert.deepStrictEqual(
      resource.attributes?.[BROWSER_ATTRIBUTES.BRANDS] as string[],
      validations.brands
    );
  }
  if (validations.mobile) {
    assert.strictEqual(
      resource.attributes?.[BROWSER_ATTRIBUTES.MOBILE],
      validations.mobile
    );
  }
  if (validations.language) {
    assert.strictEqual(
      resource.attributes?.[BROWSER_ATTRIBUTES.LANGUAGE],
      validations.language
    );
  }
  if (validations.user_agent) {
    assert.strictEqual(
      resource.attributes?.[BROWSER_ATTRIBUTES.USER_AGENT],
      validations.user_agent
    );
  }
};

/**
 * Test utility method to validate an empty resource
 *
 * @param resource the Resource to validate
 */
export const assertEmptyResource = (resource: DetectedResource) => {
  assert.strictEqual(Object.keys(resource.attributes ?? {}).length, 0);
};
