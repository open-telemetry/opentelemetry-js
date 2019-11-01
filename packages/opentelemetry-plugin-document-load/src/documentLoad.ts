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
import { PerformanceTimingNames as PTN } from './enums/PerformanceTimingNames';
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
    // Timeout is needed as load event doesn't have yet the performance metrics for loadEnd.
    // Support for event "loadend" is very limited and cannot be used
    window.setTimeout(() => {
      this._collectPerformance();
    });
  }

  /**
   * Helper function for starting an event
   * @param span
   * @param performanceName name of performance entry for time start
   * @param entries
   */
  private _addSpanEvent(
    span: Span,
    performanceName: string,
    entries: PerformanceEntries
  ): Span | undefined {
    if (
      hasKey(entries, performanceName) &&
      typeof entries[performanceName] === 'number'
    ) {
      span.addEvent(performanceName, undefined, entries[performanceName]);
      return span;
    }
    return undefined;
  }

  /**
   * Collects information about performance and creates appropriate spans
   */
  private _collectPerformance() {
    const entries = this._getEntries();

    const rootSpan = this._startSpan(
      AttributeNames.DOCUMENT_LOAD,
      PTN.FETCH_START,
      entries
    );
    if (!rootSpan) {
      return;
    }
    const fetchSpan = this._startSpan(
      AttributeNames.DOCUMENT_FETCH,
      PTN.FETCH_START,
      entries,
      {
        parent: rootSpan,
      }
    );
    if (fetchSpan) {
      this._addSpanEvent(fetchSpan, PTN.DOMAIN_LOOKUP_START, entries);
      this._addSpanEvent(fetchSpan, PTN.DOMAIN_LOOKUP_END, entries);
      this._addSpanEvent(fetchSpan, PTN.CONNECT_START, entries);
      this._addSpanEvent(fetchSpan, PTN.SECURE_CONNECTION_START, entries);
      this._addSpanEvent(fetchSpan, PTN.CONNECT_END, entries);
      this._addSpanEvent(fetchSpan, PTN.REQUEST_START, entries);
      this._addSpanEvent(fetchSpan, PTN.RESPONSE_START, entries);

      this._endSpan(fetchSpan, PTN.RESPONSE_END, entries);
    }

    this._addSpanEvent(rootSpan, PTN.UNLOAD_EVENT_START, entries);
    this._addSpanEvent(rootSpan, PTN.UNLOAD_EVENT_END, entries);
    this._addSpanEvent(rootSpan, PTN.DOM_INTERACTIVE, entries);
    this._addSpanEvent(rootSpan, PTN.DOM_CONTENT_LOADED_EVENT_START, entries);
    this._addSpanEvent(rootSpan, PTN.DOM_CONTENT_LOADED_EVENT_END, entries);
    this._addSpanEvent(rootSpan, PTN.DOM_COMPLETE, entries);
    this._addSpanEvent(rootSpan, PTN.LOAD_EVENT_START, entries);

    this._endSpan(rootSpan, PTN.LOAD_EVENT_END, entries);
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
    if (span) {
      if (hasKey(entries, performanceName)) {
        this._addSpanEvent(span, performanceName, entries);
        span.end(entries[performanceName]);
      } else {
        // just end span
        span.end();
      }
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
      const keys = Object.values(PTN);
      keys.forEach((key: string) => {
        if (hasKey(performanceNavigationTiming, key)) {
          const value = performanceNavigationTiming[key];
          if (typeof value === 'number' && value > 0) {
            entries[key] = value;
          }
        }
      });
    } else {
      // // fallback to previous version
      const perf: (typeof otperformance) & PerformanceLegacy = otperformance;
      const performanceTiming = perf.timing;
      if (performanceTiming) {
        const keys = Object.values(PTN);
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
      span.setAttribute(AttributeNames.COMPONENT, this.component);
      this._addSpanEvent(span, performanceName, entries);
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
