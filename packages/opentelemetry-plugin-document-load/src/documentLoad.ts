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

import {
  BasePlugin,
  otperformance,
  parseTraceParent,
  TRACE_PARENT_HEADER,
} from '@opentelemetry/core';
import { PluginConfig, Span, SpanOptions } from '@opentelemetry/types';
import { AttributeNames } from './enums/AttributeNames';
import {
  addSpanNetworkEvent,
  hasKey,
  PerformanceEntries,
  PerformanceLegacy,
  PerformanceTimingNames as PTN,
} from '@opentelemetry/web';

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
   * Adds spans for all resources
   * @param rootSpan
   */
  private _addResourcesSpans(rootSpan: Span): void {
    const resources: PerformanceResourceTiming[] = otperformance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];
    if (resources) {
      resources.forEach(resource => {
        this._initResourceSpan(resource, {
          parent: rootSpan,
        });
      });
    }
  }

  /**
   * Adds span network events
   * @param span
   * @param entries entries that contains performance information about resource
   */
  private _addSpanNetworkEvents(span: Span, entries: PerformanceEntries) {
    addSpanNetworkEvent(span, PTN.DOMAIN_LOOKUP_START, entries);
    addSpanNetworkEvent(span, PTN.DOMAIN_LOOKUP_END, entries);
    addSpanNetworkEvent(span, PTN.CONNECT_START, entries);
    addSpanNetworkEvent(span, PTN.SECURE_CONNECTION_START, entries);
    addSpanNetworkEvent(span, PTN.CONNECT_END, entries);
    addSpanNetworkEvent(span, PTN.REQUEST_START, entries);
    addSpanNetworkEvent(span, PTN.RESPONSE_START, entries);
  }

  /**
   * Collects information about performance and creates appropriate spans
   */
  private _collectPerformance() {
    const metaElement = [...document.getElementsByTagName('meta')].find(
      e => e.getAttribute('name') === TRACE_PARENT_HEADER
    );

    const entries = this._getEntries();

    const rootSpan = this._startSpan(
      AttributeNames.DOCUMENT_LOAD,
      PTN.FETCH_START,
      entries,
      { parent: parseTraceParent((metaElement && metaElement.content) || '') }
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
      this._addSpanNetworkEvents(fetchSpan, entries);
      this._endSpan(fetchSpan, PTN.RESPONSE_END, entries);
    }

    this._addResourcesSpans(rootSpan);

    addSpanNetworkEvent(rootSpan, PTN.UNLOAD_EVENT_START, entries);
    addSpanNetworkEvent(rootSpan, PTN.UNLOAD_EVENT_END, entries);
    addSpanNetworkEvent(rootSpan, PTN.DOM_INTERACTIVE, entries);
    addSpanNetworkEvent(rootSpan, PTN.DOM_CONTENT_LOADED_EVENT_START, entries);
    addSpanNetworkEvent(rootSpan, PTN.DOM_CONTENT_LOADED_EVENT_END, entries);
    addSpanNetworkEvent(rootSpan, PTN.DOM_COMPLETE, entries);
    addSpanNetworkEvent(rootSpan, PTN.LOAD_EVENT_START, entries);

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
        addSpanNetworkEvent(span, performanceName, entries);
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
      const perf: typeof otperformance & PerformanceLegacy = otperformance;
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
   * Creates and ends a span with network information about resource added as timed events
   * @param resource
   * @param spanOptions
   */
  private _initResourceSpan(
    resource: PerformanceResourceTiming,
    spanOptions: SpanOptions = {}
  ) {
    const span = this._startSpan(
      resource.name,
      PTN.FETCH_START,
      resource,
      spanOptions
    );
    if (span) {
      this._addSpanNetworkEvents(span, resource);
      this._endSpan(span, PTN.RESPONSE_END, resource);
    }
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
      addSpanNetworkEvent(span, performanceName, entries);
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
