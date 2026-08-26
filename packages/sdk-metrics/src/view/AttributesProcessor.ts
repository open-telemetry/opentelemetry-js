/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context, Attributes } from '@opentelemetry/api';

/**
 * The {@link AttributesProcessor} is responsible for customizing which
 * attribute(s) are to be reported as metrics dimension(s) and adding
 * additional dimension(s) from the {@link Context}.
 */
export interface IAttributesProcessor {
  /**
   * Process the metric instrument attributes.
   *
   * @param incoming The metric instrument attributes.
   * @param context The active context when the instrument is synchronous.
   * `undefined` otherwise.
   */
  process: (incoming: Attributes, context?: Context) => Attributes;
}

class NoopAttributesProcessor implements IAttributesProcessor {
  process(incoming: Attributes, _context?: Context) {
    return incoming;
  }
}

class MultiAttributesProcessor implements IAttributesProcessor {
  private readonly _processors: IAttributesProcessor[];
  constructor(processors: IAttributesProcessor[]) {
    this._processors = processors;
  }
  process(incoming: Attributes, context?: Context): Attributes {
    let filteredAttributes = incoming;
    for (const processor of this._processors) {
      filteredAttributes = processor.process(filteredAttributes, context);
    }
    return filteredAttributes;
  }
}

class AllowListProcessor implements IAttributesProcessor {
  private readonly _allowedAttributeNames: Set<string>;
  constructor(allowedAttributeNames: string[]) {
    this._allowedAttributeNames = new Set(allowedAttributeNames);
  }

  process(incoming: Attributes, _context?: Context): Attributes {
    const filteredAttributes: Attributes = {};
    for (const attributeName in incoming) {
      if (
        Object.prototype.hasOwnProperty.call(incoming, attributeName) &&
        this._allowedAttributeNames.has(attributeName)
      ) {
        filteredAttributes[attributeName] = incoming[attributeName];
      }
    }
    return filteredAttributes;
  }
}

class DenyListProcessor implements IAttributesProcessor {
  private readonly _deniedAttributeNames: Set<string>;
  constructor(deniedAttributeNames: string[]) {
    this._deniedAttributeNames = new Set(deniedAttributeNames);
  }

  process(incoming: Attributes, _context?: Context): Attributes {
    const filteredAttributes: Attributes = {};
    for (const attributeName in incoming) {
      if (
        Object.prototype.hasOwnProperty.call(incoming, attributeName) &&
        !this._deniedAttributeNames.has(attributeName)
      ) {
        filteredAttributes[attributeName] = incoming[attributeName];
      }
    }
    return filteredAttributes;
  }
}

/**
 * @internal
 *
 * Create an {@link IAttributesProcessor} that acts as a simple pass-through for attributes.
 */
export function createNoopAttributesProcessor(): IAttributesProcessor {
  return NOOP;
}

/**
 * @internal
 *
 * Create an {@link IAttributesProcessor} that applies all processors from the provided list in order.
 *
 * @param processors Processors to apply in order.
 */
export function createMultiAttributesProcessor(
  processors: IAttributesProcessor[]
): IAttributesProcessor {
  return new MultiAttributesProcessor(processors);
}

/**
 * Create an {@link IAttributesProcessor} that filters by allowed attribute names and drops any names that are not in the
 * allow list.
 */
export function createAllowListAttributesProcessor(
  attributeAllowList: string[]
): IAttributesProcessor {
  return new AllowListProcessor(attributeAllowList);
}

/**
 * Create an {@link IAttributesProcessor} that drops attributes based on the names provided in the deny list
 */
export function createDenyListAttributesProcessor(
  attributeDenyList: string[]
): IAttributesProcessor {
  return new DenyListProcessor(attributeDenyList);
}

const NOOP = new NoopAttributesProcessor();
