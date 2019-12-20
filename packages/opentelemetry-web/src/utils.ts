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

import { PerformanceEntries, PerformanceResourceTimingInfo } from './types';
import { PerformanceTimingNames as PTN } from './enums/PerformanceTimingNames';
import * as types from '@opentelemetry/types';
import { hrTimeToNanoseconds, timeInputToHrTime } from '@opentelemetry/core';

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
 * sort resources by startTime
 * @param filteredResources
 */
export function sortResources(filteredResources: PerformanceResourceTiming[]) {
  return filteredResources.slice().sort((a, b) => {
    const valueA = a[PTN.FETCH_START];
    const valueB = b[PTN.FETCH_START];
    if (valueA > valueB) {
      return 1;
    } else if (valueA < valueB) {
      return -1;
    }
    return 0;
  });
}

/**
 * Get closest performance resource ignoring the resources that have been
 * already used.
 * @param spanUrl
 * @param startTimeHR
 * @param endTimeHR
 * @param resources
 * @param ignoredResources
 */
export function getResource(
  spanUrl: string,
  startTimeHR: types.HrTime,
  endTimeHR: types.HrTime,
  resources: PerformanceResourceTiming[],
  ignoredResources: WeakSet<PerformanceResourceTiming> = new WeakSet<
    PerformanceResourceTiming
  >()
): PerformanceResourceTimingInfo {
  const filteredResources = filterResourcesForSpan(
    spanUrl,
    startTimeHR,
    endTimeHR,
    resources,
    ignoredResources
  );

  if (filteredResources.length === 0) {
    return {
      mainRequest: undefined,
    };
  }
  if (filteredResources.length === 1) {
    return {
      mainRequest: filteredResources[0],
    };
  }
  const sorted = sortResources(filteredResources.slice());

  const parsedSpanUrl = parseUrl(spanUrl);
  if (parsedSpanUrl.origin !== window.location.origin && sorted.length > 1) {
    let corsPreFlightRequest: PerformanceResourceTiming | undefined = sorted[0];
    let mainRequest: PerformanceResourceTiming = findMainRequest(
      sorted,
      corsPreFlightRequest[PTN.RESPONSE_END],
      endTimeHR
    );

    const responseEnd = corsPreFlightRequest[PTN.RESPONSE_END];
    const fetchStart = mainRequest[PTN.FETCH_START];

    // no corsPreFlightRequest
    if (fetchStart < responseEnd) {
      mainRequest = corsPreFlightRequest;
      corsPreFlightRequest = undefined;
    }

    return {
      corsPreFlightRequest,
      mainRequest,
    };
  } else {
    return {
      mainRequest: filteredResources[0],
    };
  }
}

/**
 * Will find the main request skipping the cors pre flight requests
 * @param resources
 * @param corsPreFlightRequestEndTime
 * @param spanEndTimeHR
 */
function findMainRequest(
  resources: PerformanceResourceTiming[],
  corsPreFlightRequestEndTime: number,
  spanEndTimeHR: types.HrTime
): PerformanceResourceTiming {
  const spanEndTime = hrTimeToNanoseconds(spanEndTimeHR);
  const minTime = hrTimeToNanoseconds(
    timeInputToHrTime(corsPreFlightRequestEndTime)
  );

  let mainRequest: PerformanceResourceTiming = resources[1];
  let bestGap;

  const length = resources.length;
  for (let i = 1; i < length; i++) {
    const resource = resources[i];
    const resourceStartTime = hrTimeToNanoseconds(
      timeInputToHrTime(resource[PTN.FETCH_START])
    );

    const resourceEndTime = hrTimeToNanoseconds(
      timeInputToHrTime(resource[PTN.RESPONSE_END])
    );

    const currentGap = spanEndTime - resourceEndTime;

    if (resourceStartTime >= minTime && (!bestGap || currentGap < bestGap)) {
      bestGap = currentGap;
      mainRequest = resource;
    }
  }
  return mainRequest;
}

/**
 * Filter all resources that has started and finished according to span start time and end time.
 *     It will return the closest resource to a start time
 * @param spanUrl
 * @param startTimeHR
 * @param endTimeHR
 * @param resources
 * @param ignoredResources
 */
function filterResourcesForSpan(
  spanUrl: string,
  startTimeHR: types.HrTime,
  endTimeHR: types.HrTime,
  resources: PerformanceResourceTiming[],
  ignoredResources: WeakSet<PerformanceResourceTiming>
) {
  const startTime = hrTimeToNanoseconds(startTimeHR);
  const endTime = hrTimeToNanoseconds(endTimeHR);
  let filteredResources = resources.filter(resource => {
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
      resourceEndTime <= endTime
    );
  });

  if (filteredResources.length > 0) {
    filteredResources = filteredResources.filter(resource => {
      return !ignoredResources.has(resource);
    });
  }

  return filteredResources;
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
