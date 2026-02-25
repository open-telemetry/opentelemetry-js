/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExactPredicate, Predicate } from './Predicate';

export interface MeterSelectorCriteria {
  name?: string;
  version?: string;
  schemaUrl?: string;
}

export class MeterSelector {
  private _nameFilter: Predicate;
  private _versionFilter: Predicate;
  private _schemaUrlFilter: Predicate;

  constructor(criteria?: MeterSelectorCriteria) {
    this._nameFilter = new ExactPredicate(criteria?.name);
    this._versionFilter = new ExactPredicate(criteria?.version);
    this._schemaUrlFilter = new ExactPredicate(criteria?.schemaUrl);
  }

  getNameFilter() {
    return this._nameFilter;
  }

  /**
   * TODO: semver filter? no spec yet.
   */
  getVersionFilter() {
    return this._versionFilter;
  }

  getSchemaUrlFilter() {
    return this._schemaUrlFilter;
  }
}
