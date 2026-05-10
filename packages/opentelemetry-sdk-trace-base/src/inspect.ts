/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Well-known symbol used by Node.js `util.inspect` (and `console.*`) to
 * render an object via a custom representation. Defined as a global Symbol
 * so it works without importing from `node:util`, keeping this module safe
 * for browser builds (where the symbol is simply never looked up).
 */
export const inspectCustom = Symbol.for('nodejs.util.inspect.custom');

export type InspectFn = (value: unknown, options: unknown) => string;

export interface InspectStylizeOptions {
  depth?: number | null;
  stylize?: (text: string, styleType: string) => string;
}

/**
 * Build a class-tagged inspect representation. Returns a stub like
 * `[ClassName]` once the recursion budget is exhausted, otherwise returns
 * `ClassName <inspected payload>` so nested fields keep proper coloring,
 * indentation, and depth handling. In environments that don't supply an
 * `inspect` callback (e.g. browsers), falls back to returning the raw
 * payload object.
 */
export function formatInspect(
  className: string,
  payload: object,
  depth: number,
  options: InspectStylizeOptions | undefined,
  inspect: InspectFn | undefined
): unknown {
  if (typeof depth === 'number' && depth < 0) {
    const tag = `[${className}]`;
    return options?.stylize ? options.stylize(tag, 'special') : tag;
  }
  if (typeof inspect !== 'function' || !options) {
    return payload;
  }
  const childOptions = {
    ...options,
    depth: options.depth == null ? options.depth : options.depth - 1,
  };
  return `${className} ${inspect(payload, childOptions)}`;
}
