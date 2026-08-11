/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context, Attributes } from '@opentelemetry/api';
import { ExactPredicate, PatternPredicate, type Predicate } from './Predicate';

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

/**
 * Builds one {@link Predicate} per entry in `attributeNames`: a
 * {@link PatternPredicate} for entries containing `*`/`?` wildcards, or an
 * {@link ExactPredicate} otherwise, avoiding regular expression overhead for
 * plain literal names.
 */
function toPredicates(attributeNames: string[]): Predicate[] {
  return attributeNames.map(name =>
    PatternPredicate.hasWildcard(name)
      ? new PatternPredicate(name)
      : new ExactPredicate(name)
  );
}

function matchesAny(predicates: Predicate[], attributeName: string): boolean {
  return predicates.some(predicate => predicate.match(attributeName));
}

class AllowListProcessor implements IAttributesProcessor {
  private readonly _predicates: Predicate[];
  constructor(allowedAttributeNames: string[]) {
    this._predicates = toPredicates(allowedAttributeNames);
  }

  process(incoming: Attributes, _context?: Context): Attributes {
    const filteredAttributes: Attributes = {};
    for (const attributeName in incoming) {
      if (
        Object.prototype.hasOwnProperty.call(incoming, attributeName) &&
        matchesAny(this._predicates, attributeName)
      ) {
        filteredAttributes[attributeName] = incoming[attributeName];
      }
    }
    return filteredAttributes;
  }
}

class DenyListProcessor implements IAttributesProcessor {
  private readonly _predicates: Predicate[];
  constructor(deniedAttributeNames: string[]) {
    this._predicates = toPredicates(deniedAttributeNames);
  }

  process(incoming: Attributes, _context?: Context): Attributes {
    const filteredAttributes: Attributes = {};
    for (const attributeName in incoming) {
      if (
        Object.prototype.hasOwnProperty.call(incoming, attributeName) &&
        !matchesAny(this._predicates, attributeName)
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
 *
 * Entries may use `*` to match zero or more characters and `?` to match exactly
 * one character, following the wildcard semantics of the OpenTelemetry
 * `IncludeExclude` configuration type
 * (https://opentelemetry.io/docs/specs/otel-config/types/#type-includeexclude).
 * For example, `http.request.header.*` matches any attribute name starting
 * with `http.request.header.`.
 */
export function createAllowListAttributesProcessor(
  attributeAllowList: string[]
): IAttributesProcessor {
  return new AllowListProcessor(attributeAllowList);
}

/**
 * Create an {@link IAttributesProcessor} that drops attributes based on the names provided in the deny list.
 *
 * Entries may use `*` to match zero or more characters and `?` to match exactly
 * one character, following the wildcard semantics of the OpenTelemetry
 * `IncludeExclude` configuration type
 * (https://opentelemetry.io/docs/specs/otel-config/types/#type-includeexclude).
 * For example, `*.password` matches any attribute name ending in `.password`.
 */
export function createDenyListAttributesProcessor(
  attributeDenyList: string[]
): IAttributesProcessor {
  return new DenyListProcessor(attributeDenyList);
}

const NOOP = new NoopAttributesProcessor();
