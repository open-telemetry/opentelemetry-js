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

import { PerformanceEntries } from './types';
import { PerformanceTimingNames as PTN } from './enums/PerformanceTimingNames';
import * as types from '@opentelemetry/types';
import * as tracing from '@opentelemetry/tracing';
import {
  hrTime,
  hrTimeToNanoseconds,
  timeInputToHrTime,
  urlMatches,
} from '@opentelemetry/core';

/**
 * Helper function to be able to use enum as typed key in type and in interface when using forEach
 * @param obj
 * @param key
 */
export function hasKey<O>(obj: O, key: keyof any): key is keyof O {
  return key in obj;
}

/**
 * Helper function for starting an event on span based on {@link PerformanceEntries}
 * @param span
 * @param performanceName name of performance entry for time start
 * @param entries
 */
export function addSpanNetworkEvent(
  span: types.Span,
  performanceName: string,
  entries: PerformanceEntries
): types.Span | undefined {
  if (
    hasKey(entries, performanceName) &&
    typeof entries[performanceName] === 'number'
  ) {
    // some metrics are available but have value 0 which means they are invalid
    // for example "secureConnectionStart" is 0 which makes the events to be wrongly interpreted
    if (entries[performanceName] === 0) {
      return undefined;
    }
    span.addEvent(performanceName, entries[performanceName]);
    return span;
  }
  return undefined;
}

/**
 * Get closes performance resource ignoring the resources that has been already used.
 * @param span
 * @param resources
 * @param ignoredResources
 */
export function getResource(
  span: tracing.Span,
  resources: PerformanceResourceTiming[],
  ignoredResources?: PerformanceResourceTiming[]
): PerformanceResourceTiming | undefined {
  const filteredResources = filterResourcesForSpan(
    span,
    resources,
    ignoredResources
  );

  if (filteredResources.length === 0) {
    return undefined;
  }
  if (filteredResources.length === 1) {
    return filteredResources[0];
  }
  const sorted = filteredResources.slice().sort((a, b) => {
    const valueA = a[PTN.FETCH_START];
    const valueB = b[PTN.FETCH_START];
    if (valueA > valueB) {
      return 1;
    } else if (valueA < valueB) {
      return -1;
    }
    return 0;
  });
  return sorted[0];
}

/**
 * Filter all resources that has started and finished according to span start time and end time.
 *     It will return the closest resource to a start time
 * @param span
 * @param resources
 * @param ignoredResources
 */
function filterResourcesForSpan(
  span: tracing.Span,
  resources: PerformanceResourceTiming[],
  ignoredResources?: PerformanceResourceTiming[]
) {
  const startTime = hrTimeToNanoseconds(span.startTime);
  const nowTime = hrTimeToNanoseconds(hrTime());

  const spanUrl = span.name;
  let filteredResource = resources.filter(resource => {
    const resourceStartTime = hrTimeToNanoseconds(
      timeInputToHrTime(resource[PTN.FETCH_START])
    );
    const resourceEndTime = hrTimeToNanoseconds(
      timeInputToHrTime(resource[PTN.RESPONSE_END])
    );

    return (
      resource.initiatorType.toLowerCase() === 'xmlhttprequest' &&
      resource.name === spanUrl &&
      resourceStartTime >= startTime &&
      resourceEndTime <= nowTime
    );
  });

  if (filteredResource.length > 0) {
    filteredResource = filteredResource.filter(resource => {
      if (!ignoredResources) {
        return true;
      }
      for (let i = ignoredResources.length - 1; i >= 0; i--) {
        if (ignoredResources[i] === resource) {
          return false;
        }
      }
      return true;
    });
  }

  return filteredResource;
}

/**
 * Parses url using anchor element
 * @param url
 */
export function parseUrl(url: string): HTMLAnchorElement {
  const a = document.createElement('a');
  a.href = url;
  return a;
}

/**
 * Check if both url might have the same origin or
 *     if {@param urlToMatch} is part of {@param url}
 * @param url
 * @param urlToMatch
 */
export function sameOriginOrUrlMatches(
  url: string,
  urlToMatch: string | RegExp
): boolean {
  const urlA = parseUrl(url);
  if (typeof urlToMatch === 'string') {
    const urlToMatchA = parseUrl(urlToMatch);
    if (urlA.origin === urlToMatchA.origin) {
      return true;
    }
  }
  return urlMatches(url, urlToMatch);
}
