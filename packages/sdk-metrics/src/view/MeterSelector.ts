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
