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

// Surface<> sees public members only, yet subclasses build on the protected API.
// Never called: the classes exist for the type checker, not at runtime.
function protectedApi(
  NodeBase: typeof node.InstrumentationBase,
  BrowserBase: typeof browser.InstrumentationBase
) {
  abstract class NodeSubclass extends NodeBase {
    api() {
      return [
        this._config,
        this._diag,
        this._wrap,
        this._unwrap,
        this._massWrap,
        this._massUnwrap,
        this.meter,
        this.logger,
        this._updateMetricInstruments,
        this.tracer,
        this.init,
        this._runSpanCustomizationHook,
      ] as const;
    }
  }
  abstract class BrowserSubclass extends BrowserBase {
    api() {
      return [
        this._config,
        this._diag,
        this._wrap,
        this._unwrap,
        this._massWrap,
        this._massUnwrap,
        this.meter,
        this.logger,
        this._updateMetricInstruments,
        this.tracer,
        this.init,
        this._runSpanCustomizationHook,
      ] as const;
    }
  }
  return [NodeSubclass, BrowserSubclass] as const;
}
type Api<C> = C extends abstract new (...args: never[]) => {
  api(): infer R;
}
  ? R
  : never;
type Probes = ReturnType<typeof protectedApi>;

describe('platform barrels', () => {
  it('have the same public surface', () => {
    const same: Equal<Surface<typeof node>, Surface<typeof browser>> = true;
    assert.ok(same);
  });

  it('have the same protected InstrumentationBase API', () => {
    const same: Equal<Api<Probes[0]>, Api<Probes[1]>> = true;
    assert.ok(same);
  });
});
