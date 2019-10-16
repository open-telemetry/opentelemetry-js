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

import { BasePlugin, otperformance } from '@opentelemetry/core';
import { PluginConfig, Span, SpanOptions } from '@opentelemetry/types';
import { AttributeNames } from './enums/AttributeNames';
import { PerformanceTimingNames } from './enums/PerformanceTimingNames';
import { PerformanceEntries, PerformanceLegacy } from './types';
import { hasKey } from './utils';

/**
 * This class represents a document load plugin
 */
export class DocumentLoad extends BasePlugin<unknown> {
  readonly component: string = 'document-load';
  readonly version: string = '1';
  moduleName = this.component;
  protected _config!: PluginConfig;

  /**
   *
   * @param config
   */
  constructor(config: PluginConfig = {}) {
    super();
    this._onDocumentLoaded = this._onDocumentLoaded.bind(this);
    this._config = config;
  }

  /**
   * callback to be executed when page is loaded
   */
  private _onDocumentLoaded() {
    this._collectPerformance();
  }

  /**
   * Collects information about performance and creates appropriate spans
   */
  private _collectPerformance() {
    const entries = this._getEntries();

    const rootSpan = this._startSpan(
      AttributeNames.DOCUMENT_LOAD,
      PerformanceTimingNames.FETCH_START,
      entries
    );

    this._startAndFinishSpan(
      AttributeNames.DOMAIN_LOOKUP,
      PerformanceTimingNames.DOMAIN_LOOKUP_START,
      PerformanceTimingNames.DOMAIN_LOOKUP_END,
      entries,
      {
        parent: rootSpan,
      }
    );

    // Opening Connection
    const connectSpan = this._startSpan(
      AttributeNames.CONNECT,
      PerformanceTimingNames.CONNECT_START,
      entries,
      {
        parent: rootSpan,
      }
    );

    // TLS negotiation
    if (hasKey(entries, PerformanceTimingNames.SECURE_CONNECTION_START)) {
      const value = entries[PerformanceTimingNames.SECURE_CONNECTION_START];
      if (typeof value === 'number' && value > 0) {
        this._startAndFinishSpan(
          AttributeNames.CONNECT_SECURE,
          PerformanceTimingNames.SECURE_CONNECTION_START,
          PerformanceTimingNames.CONNECT_END,
          entries,
          {
            parent: connectSpan,
          }
        );
      }
    }
    // Connection negotiation ends
    this._endSpan(connectSpan, PerformanceTimingNames.CONNECT_END, entries);

    // Cache seek plus response time
    this._startAndFinishSpan(
      AttributeNames.CACHE_SEEK,
      PerformanceTimingNames.FETCH_START,
      PerformanceTimingNames.RESPONSE_END,
      entries,
      {
        parent: rootSpan,
      }
    );

    // TTFB - time to first byte
    this._startAndFinishSpan(
      AttributeNames.TTFB,
      PerformanceTimingNames.REQUEST_START,
      PerformanceTimingNames.RESPONSE_START,
      entries,
      {
        parent: rootSpan,
      }
    );

    // Response time only (download)
    this._startAndFinishSpan(
      AttributeNames.RESPONSE_TIME,
      PerformanceTimingNames.RESPONSE_START,
      PerformanceTimingNames.RESPONSE_END,
      entries,
      {
        parent: rootSpan,
      }
    );

    this._endSpan(rootSpan, PerformanceTimingNames.LOAD_EVENT_START, entries);
  }

  /**
   * Helper function for ending span
   * @param span
   * @param performanceName name of performance entry for time end
   * @param entries
   */
  private _endSpan(
    span: Span | undefined,
    performanceName: string,
    entries: PerformanceEntries
  ) {
    // span can be undefined when entries are missing the certain performance - the span will not be created
    if (typeof span !== 'undefined' && hasKey(entries, performanceName)) {
      span.addEvent(performanceName);
      span.end(entries[performanceName]);
    }
  }

  /**
   * gets performance entries of navigation
   */
  private _getEntries() {
    const entries: PerformanceEntries = {};
    const performanceNavigationTiming = (otperformance.getEntriesByType(
      'navigation'
    )[0] as unknown) as PerformanceEntries;

    if (performanceNavigationTiming) {
      const keys = Object.values(PerformanceTimingNames);
      const startTime = otperformance.timeOrigin;
      keys.forEach((key: string) => {
        if (hasKey(performanceNavigationTiming, key)) {
          const value = performanceNavigationTiming[key];
          if (typeof value === 'number' && value > 0) {
            entries[key] = value + startTime;
          }
        }
      });
    } else {
      // // fallback to previous version
      const perf: (typeof otperformance) & PerformanceLegacy = otperformance;
      const performanceTiming = perf.timing;
      if (performanceTiming) {
        const keys = Object.values(PerformanceTimingNames);
        keys.forEach((key: string) => {
          if (hasKey(performanceTiming, key)) {
            const value = performanceTiming[key];
            if (typeof value === 'number' && value > 0) {
              entries[key] = value;
            }
          }
        });
      }
    }
    return entries;
  }

  /**
   * Helper function for starting and finishing a span
   * @param spanName name of span
   * @param performanceNameStart name of performance entry for time start
   * @param performanceNameEnd name of performance entry for time end
   * @param entries
   * @param spanOptions
   */
  private _startAndFinishSpan(
    spanName: string,
    performanceNameStart: string,
    performanceNameEnd: string,
    entries: PerformanceEntries,
    spanOptions: SpanOptions = {}
  ): Span | undefined {
    // span can be undefined when entries are missing the certain performance - the span will not be created
    const span = this._startSpan(
      spanName,
      performanceNameStart,
      entries,
      spanOptions
    );
    this._endSpan(span, performanceNameEnd, entries);
    return span;
  }

  /**
   * Helper function for starting a span
   * @param spanName name of span
   * @param performanceName name of performance entry for time start
   * @param entries
   * @param spanOptions
   */
  private _startSpan(
    spanName: string,
    performanceName: string,
    entries: PerformanceEntries,
    spanOptions: SpanOptions = {}
  ): Span | undefined {
    if (
      hasKey(entries, performanceName) &&
      typeof entries[performanceName] === 'number'
    ) {
      const span = this._tracer.startSpan(
        spanName,
        Object.assign(
          {},
          {
            startTime: entries[performanceName],
          },
          spanOptions
        )
      );
      span.addEvent(performanceName);
      return span;
    }
    return undefined;
  }

  /**
   * executes callback {_onDocumentLoaded} when the page is loaded
   */
  private _waitForPageLoad() {
    if (window.document.readyState === 'complete') {
      this._onDocumentLoaded();
    } else {
      window.addEventListener('load', this._onDocumentLoaded);
    }
  }

  /**
   * implements patch function
   */
  protected patch() {
    this._waitForPageLoad();
    return this._moduleExports;
  }

  /**
   * implements unpatch function
   */
  protected unpatch() {
    window.removeEventListener('load', this._onDocumentLoaded);
  }
}
