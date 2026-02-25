/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExactPredicate, PatternPredicate, Predicate } from './Predicate';
import { InstrumentType } from '../export/MetricData';

export interface InstrumentSelectorCriteria {
  name?: string;
  type?: InstrumentType;
  unit?: string;
}

export class InstrumentSelector {
  private _nameFilter: Predicate;
  private _type?: InstrumentType;
  private _unitFilter: Predicate;

  constructor(criteria?: InstrumentSelectorCriteria) {
    this._nameFilter = new PatternPredicate(criteria?.name ?? '*');
    this._type = criteria?.type;
    this._unitFilter = new ExactPredicate(criteria?.unit);
  }

  getType() {
    return this._type;
  }

  getNameFilter() {
    return this._nameFilter;
  }

  getUnitFilter() {
    return this._unitFilter;
  }
}
