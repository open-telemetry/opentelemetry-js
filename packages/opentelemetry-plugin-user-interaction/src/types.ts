/*!
 * Copyright 2019, OpenTelemetry Authors
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

import * as types from '@opentelemetry/types';

/**
 * Async Zone task
 */
export type AsyncTask = Task & {
  eventName: string;
  target: HTMLElement;
  // Allows access to the private `_zone` property of a Zone.js Task.
  _zone: Zone;
};

/**
 *  Type for patching Zone RunTask function
 */
export type RunTaskFunction = (
  task: AsyncTask,
  applyThis?: any,
  applyArgs?: any
) => Zone;

/**
 * interface to store information in weak map per span
 */
export interface SpanData {
  hrTimeLastTimeout?: types.HrTime;
  taskCount: number;
}

/**
 * interface to be able to check Zone presence on window
 */
export interface WindowWithZone {
  Zone: ZoneTypeWithPrototype;
}

/**
 * interface to be able to use prototype in Zone
 */
interface ZonePrototype {
  prototype: any;
}

/**
 * type to be  able to use prototype on Zone
 */
export type ZoneTypeWithPrototype = ZonePrototype & Zone;
