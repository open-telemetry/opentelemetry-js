/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContextAPI } from '../api/context';
import { createContextKey } from '../context/context';
import { Context } from '../context/types';
import { Baggage } from './types';

/**
 * Baggage key
 */
const BAGGAGE_KEY = createContextKey('OpenTelemetry Baggage Key');

/**
 * Retrieve the current baggage from the given context
 *
 * @param {Context} Context that manage all context values
 * @returns {Baggage} Extracted baggage from the context
 */
export function getBaggage(context: Context): Baggage | undefined {
  return (context.getValue(BAGGAGE_KEY) as Baggage) || undefined;
}

/**
 * Retrieve the current baggage from the active/current context
 *
 * @returns {Baggage} Extracted baggage from the context
 */
export function getActiveBaggage(): Baggage | undefined {
  return getBaggage(ContextAPI.getInstance().active());
}

/**
 * Store a baggage in the given context
 *
 * @param {Context} Context that manage all context values
 * @param {Baggage} baggage that will be set in the actual context
 */
export function setBaggage(context: Context, baggage: Baggage): Context {
  return context.setValue(BAGGAGE_KEY, baggage);
}

/**
 * Delete the baggage stored in the given context
 *
 * @param {Context} Context that manage all context values
 */
export function deleteBaggage(context: Context): Context {
  return context.deleteValue(BAGGAGE_KEY);
}
