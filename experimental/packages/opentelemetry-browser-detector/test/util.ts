/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Suite } from 'mocha';
import * as assert from 'assert';
import type { DetectedResource } from '@opentelemetry/resources';
import { ATTR_USER_AGENT_ORIGINAL } from '@opentelemetry/semantic-conventions';
import {
  ATTR_BROWSER_BRANDS,
  ATTR_BROWSER_LANGUAGE,
  ATTR_BROWSER_MOBILE,
  ATTR_BROWSER_PLATFORM,
} from '../src/semconv';

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
      resource.attributes?.[ATTR_BROWSER_PLATFORM],
      validations.platform
    );
  }
  if (validations.brands) {
    assert.ok(Array.isArray(resource.attributes?.[ATTR_BROWSER_BRANDS]));
    assert.deepStrictEqual(
      resource.attributes?.[ATTR_BROWSER_BRANDS] as string[],
      validations.brands
    );
  }
  if (validations.mobile) {
    assert.strictEqual(
      resource.attributes?.[ATTR_BROWSER_MOBILE],
      validations.mobile
    );
  }
  if (validations.language) {
    assert.strictEqual(
      resource.attributes?.[ATTR_BROWSER_LANGUAGE],
      validations.language
    );
  }
  if (validations.user_agent) {
    assert.strictEqual(
      resource.attributes?.[ATTR_USER_AGENT_ORIGINAL],
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
