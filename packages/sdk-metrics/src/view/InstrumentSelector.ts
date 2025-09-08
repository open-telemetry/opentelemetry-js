/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
