/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
