/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import type * as node from '../src/platform/node';
import type * as browser from '../src/platform/browser';

// Published types always come from the node barrel, so the browser barrel
// must expose the same public surface or browser consumers get wrong types.
type Surface<M> = {
  [K in keyof M]: M[K] extends abstract new (...args: infer A) => infer I
    ? [A, Pick<I, keyof I>, Omit<M[K], 'prototype'>]
    : M[K];
};
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

describe('platform barrels', () => {
  it('have the same public surface', () => {
    const same: Equal<Surface<typeof node>, Surface<typeof browser>> = true;
    assert.ok(same);
  });
});
