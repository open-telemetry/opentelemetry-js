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
  B3Format,
  BasePlugin,
  isUrlIgnored,
  isWrapped,
  otperformance,
  urlMatches,
} from '@opentelemetry/core';
import * as tracing from '@opentelemetry/tracing';
import * as types from '@opentelemetry/types';
import {
  addSpanNetworkEvent,
  getResource,
  parseUrl,
  PerformanceTimingNames as PTN,
} from '@opentelemetry/web';
import * as shimmer from 'shimmer';
import { AttributeNames } from './enums/AttributeNames';
import { EventNames } from './enums/EventNames';
import {
  OpenFunction,
  PropagateTraceHeaderUrls,
  SendBody,
  SendFunction,
  XMLHttpRequestWrapped,
} from './types';

/**
 * XMLHttpRequest config
 */
export interface XMLHttpRequestPluginConfig extends types.PluginConfig {
  // urls which should include trace headers when origin doesn't match
  propagateTraceHeaderUrls?: PropagateTraceHeaderUrls;
}

/**
 * This class represents a XMLHttpRequest plugin for auto instrumentation
 */
export class XMLHttpRequestPlugin extends BasePlugin<XMLHttpRequest> {
  readonly component: string = 'xml-http-request';
  readonly version: string = '0.3.0';
  moduleName = this.component;

  protected _config!: XMLHttpRequestPluginConfig;

  private _tasksCount = 0;
  private _callbackToRemoveEvents: { [key: string]: Function } = {};
  private _spans: { [key: string]: tracing.Span } = {};
  // resources created between send and end - possible candidates for
  // cors preflight requests
  private _resourcesCreatedInTheMiddle: {
    [key: string]: {
      observer: PerformanceObserver;
      entries: PerformanceResourceTiming[];
    };
  } = {};
  private _usedResources: { [key: string]: PerformanceResourceTiming[] } = {};

  constructor(config: XMLHttpRequestPluginConfig = {}) {
    super();
    this._config = config as XMLHttpRequestPluginConfig;
  }

  /**
   * Adds custom headers to XMLHttpRequest
   * @param xhr
   * @param span
   * @private
   */
  private _addHeaders(xhr: XMLHttpRequest, span: types.Span) {
    let propagateTraceHeaderUrls = this._config.propagateTraceHeaderUrls || [];
    if (
      typeof propagateTraceHeaderUrls === 'string' ||
      propagateTraceHeaderUrls instanceof RegExp
    ) {
      propagateTraceHeaderUrls = [propagateTraceHeaderUrls];
    }

    const url = (span as tracing.Span).name;
    const spanUrl = parseUrl(url);
    let addHeaderOnDifferentOrigin = false;

    if (spanUrl.origin !== window.location.origin) {
      for (const propagateTraceHeaderUrl of propagateTraceHeaderUrls) {
        if (urlMatches(url, propagateTraceHeaderUrl)) {
          addHeaderOnDifferentOrigin = true;
          break;
        }
      }
      if (!addHeaderOnDifferentOrigin) {
        this._logger.warn('Cannot set headers on different origin');
        return;
      }
    }

    const b3Format = new B3Format();
    const carrier: { [key: string]: unknown } = {};
    b3Format.inject(span.context(), 'B3Format', carrier);

    Object.keys(carrier).forEach(key => {
      xhr.setRequestHeader(key, String(carrier[key]));
    });
  }

  private _addChildSpan(
    span: tracing.Span,
    corsPreFlightRequest: PerformanceResourceTiming
  ): void {
    const childSpan = this._tracer.startSpan('CORS Preflight', {
      startTime: corsPreFlightRequest[PTN.FETCH_START],
      parent: span,
    }) as tracing.Span;
    this._addSpanNetworkEvents(childSpan, corsPreFlightRequest);
    childSpan.end(corsPreFlightRequest[PTN.RESPONSE_END]);
  }

  /**
   * Adds Network events to the span
   * @param span
   * @param resource
   * @private
   */
  private _addSpanNetworkEvents(
    span: tracing.Span,
    resource: PerformanceResourceTiming
  ) {
    addSpanNetworkEvent(span, PTN.FETCH_START, resource);
    addSpanNetworkEvent(span, PTN.DOMAIN_LOOKUP_START, resource);
    addSpanNetworkEvent(span, PTN.DOMAIN_LOOKUP_END, resource);
    addSpanNetworkEvent(span, PTN.CONNECT_START, resource);
    addSpanNetworkEvent(span, PTN.SECURE_CONNECTION_START, resource);
    addSpanNetworkEvent(span, PTN.CONNECT_END, resource);
    addSpanNetworkEvent(span, PTN.REQUEST_START, resource);
    addSpanNetworkEvent(span, PTN.RESPONSE_START, resource);
    addSpanNetworkEvent(span, PTN.RESPONSE_END, resource);
  }

  /**
   * will collect information about all resources created
   * between "send" and "end"
   * @param spanId
   * @param spanName
   * @private
   */
  private _addPossibleCorsPreflightResourceObserver(
    spanId: string,
    spanName: string
  ) {
    this._resourcesCreatedInTheMiddle[spanId] = {
      observer: new PerformanceObserver(list => {
        const entries = list.getEntries() as PerformanceResourceTiming[];
        entries.forEach(entry => {
          if (
            entry.initiatorType === 'xmlhttprequest' &&
            entry.name === spanName
          ) {
            this._resourcesCreatedInTheMiddle[spanId].entries.push(entry);
          }
        });
      }),
      entries: [],
    };
    this._resourcesCreatedInTheMiddle[spanId].observer.observe({
      entryTypes: ['resource'],
    });
  }

  /**
   * clear resources assigned with certain span
   * @private
   */
  private _clearResources() {
    if (this._tasksCount === 0) {
      ((otperformance as unknown) as Performance).clearResourceTimings();
      this._callbackToRemoveEvents = {};
      this._resourcesCreatedInTheMiddle = {};
      this._spans = {};
      this._usedResources = {};
    }
  }

  /**
   * Finds appropriate resource and add network events to the span
   * @param span
   */
  private _findResourceAndAddNetworkEvents(
    span: tracing.Span,
    maybeCors: PerformanceResourceTiming[] = []
  ) {
    const resources: PerformanceResourceTiming[] = otperformance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];

    const resource = getResource(
      span,
      EventNames.METHOD_SEND,
      resources,
      this._usedResources[span.name],
      maybeCors
    );

    if (resource.mainRequest) {
      const mainRequest = resource.mainRequest;
      this._markResourceAsUsed(mainRequest);

      const corsPreFlightRequest = resource.corsPreFlightRequest;
      if (corsPreFlightRequest) {
        this._addChildSpan(span, corsPreFlightRequest);
        this._markResourceAsUsed(mainRequest);
      }
      this._addSpanNetworkEvents(span, mainRequest);
    }
  }

  /**
   * Removes the previous information about span.
   * This might happened when the same xhr is used again.
   * @param xhr
   * @private
   */
  private _cleanPreviousSpanInformation(xhr: XMLHttpRequestWrapped) {
    const existingSpanId = xhr.__OT_SPAN_ID;
    if (existingSpanId) {
      const callbackToRemoveEvents = this._callbackToRemoveEvents[
        existingSpanId
      ];
      if (callbackToRemoveEvents) {
        callbackToRemoveEvents();
      }
    }
  }

  /**
   * Creates a new span when method "open" is called
   * @param xhr
   * @param url
   * @param method
   * @private
   */
  private _createSpan(
    xhr: XMLHttpRequestWrapped,
    url: string,
    method: string
  ): tracing.Span | undefined {
    if (isUrlIgnored(url, this._config.ignoreUrls)) {
      this._logger.debug('ignoring span as url matches ignored url');
      return;
    }

    const currentSpan = this._tracer.startSpan(url, {
      parent: this._tracer.getCurrentSpan(),
      attributes: {
        [AttributeNames.COMPONENT]: this.component,
        [AttributeNames.HTTP_METHOD]: method,
        [AttributeNames.HTTP_URL]: url,
      },
    }) as tracing.Span;

    currentSpan.addEvent(EventNames.METHOD_OPEN);

    const spanId = currentSpan.context().spanId;
    this._spans[spanId] = currentSpan;

    this._cleanPreviousSpanInformation(xhr);
    xhr.__OT_SPAN_ID = spanId;

    return currentSpan;
  }

  /**
   * Marks certain [resource]{@link PerformanceResourceTiming} when information
   * from this is used to add events to span.
   * This is done to avoid reusing the same resource again for next span
   * @param resource
   * @private
   */
  private _markResourceAsUsed(resource: PerformanceResourceTiming) {
    const name = resource.name;
    if (!this._usedResources[name]) {
      this._usedResources[name] = [];
    }
    this._usedResources[name].push(resource);
  }

  /**
   * Patches the method open
   * @private
   */
  protected _patchOpen() {
    return (original: OpenFunction): OpenFunction => {
      const plugin = this;
      return function patchOpen(
        this: XMLHttpRequest,
        method: string,
        url: string,
        async?: boolean,
        user?: string | null,
        pass?: string | null
      ) {
        plugin._createSpan(this as XMLHttpRequestWrapped, url, method);

        return original.call(this, method, url, true, user, pass);
      };
    };
  }

  /**
   * Patches the method send
   * @private
   */
  protected _patchSend() {
    const plugin = this;

    function endSpan(xhr: XMLHttpRequestWrapped, eventName: string) {
      const spanId = xhr.__OT_SPAN_ID;
      const callbackToRemoveEvents = spanId
        ? plugin._callbackToRemoveEvents[spanId]
        : undefined;

      let resourcesCreatedInTheMiddle = spanId
        ? plugin._resourcesCreatedInTheMiddle[spanId]
        : undefined;
      let entries;
      if (resourcesCreatedInTheMiddle) {
        entries = resourcesCreatedInTheMiddle.entries.slice();
      }
      if (typeof callbackToRemoveEvents === 'function') {
        callbackToRemoveEvents();
      }
      const currentSpan = spanId ? plugin._spans[spanId] : undefined;
      if (currentSpan && spanId) {
        plugin._findResourceAndAddNetworkEvents(currentSpan, entries);
        currentSpan.addEvent(eventName);

        const url = currentSpan.attributes[AttributeNames.HTTP_URL];
        if (typeof url === 'string') {
          const parsedUrl = parseUrl(url);

          currentSpan.setAttribute(AttributeNames.HTTP_STATUS_CODE, xhr.status);
          currentSpan.setAttribute(
            AttributeNames.HTTP_STATUS_TEXT,
            xhr.statusText
          );
          currentSpan.setAttribute(AttributeNames.HTTP_HOST, parsedUrl.host);
          currentSpan.setAttribute(
            AttributeNames.HTTP_SCHEME,
            parsedUrl.protocol.replace(':', '')
          );

          // @TODO do we want to collect this or it will be collected earlier once only or
          //    maybe when parent span is not available ?
          currentSpan.setAttribute(
            AttributeNames.HTTP_USER_AGENT,
            navigator.userAgent
          );
        }

        currentSpan.end();
      }
      plugin._tasksCount--;
      plugin._clearResources();
    }

    function onError(this: XMLHttpRequestWrapped) {
      endSpan(this, EventNames.EVENT_ERROR);
    }

    function onTimeout(this: XMLHttpRequestWrapped) {
      endSpan(this, EventNames.EVENT_TIMEOUT);
    }

    function onLoad(this: XMLHttpRequestWrapped) {
      if (this.status < 299) {
        endSpan(this, EventNames.EVENT_LOAD);
      } else {
        endSpan(this, EventNames.EVENT_ERROR);
      }
    }

    function unregister(xhr: XMLHttpRequestWrapped, spanId: string) {
      xhr.removeEventListener('load', onLoad);
      xhr.removeEventListener('error', onError);
      xhr.removeEventListener('timeout', onTimeout);
      delete plugin._callbackToRemoveEvents[spanId];
      delete xhr.__OT_SPAN_ID;
    }

    return (original: SendFunction): SendFunction => {
      return function patchSend(
        this: XMLHttpRequest,
        body?: SendBody
      ): SendFunction {
        const spanId = (this as XMLHttpRequestWrapped).__OT_SPAN_ID;
        const currentSpan: types.Span | undefined = spanId
          ? plugin._spans[spanId]
          : undefined;

        if (currentSpan && spanId) {
          plugin._tasksCount++;
          currentSpan.addEvent(EventNames.METHOD_SEND);
          const spanName = (currentSpan as tracing.Span).name;

          this.addEventListener('load', onLoad);
          this.addEventListener('error', onError);
          this.addEventListener('timeout', onTimeout);

          plugin._callbackToRemoveEvents[spanId] = () => {
            unregister(this as XMLHttpRequestWrapped, spanId);
            plugin._resourcesCreatedInTheMiddle[spanId].observer.disconnect();
            delete plugin._resourcesCreatedInTheMiddle[spanId];
          };
          plugin._addHeaders(this, currentSpan);

          plugin._addPossibleCorsPreflightResourceObserver(spanId, spanName);
        }
        return original.call(this, body);
      };
    };
  }

  /**
   * implements patch function
   */
  protected patch() {
    this._logger.debug('applying patch to', this.moduleName, this.version);

    if (isWrapped(XMLHttpRequest.prototype.open)) {
      shimmer.unwrap(XMLHttpRequest.prototype, 'open');
      this._logger.debug('removing previous patch from method open');
    }

    if (isWrapped(XMLHttpRequest.prototype.send)) {
      shimmer.unwrap(XMLHttpRequest.prototype, 'send');
      this._logger.debug('removing previous patch from method send');
    }

    shimmer.wrap(XMLHttpRequest.prototype, 'open', this._patchOpen());
    shimmer.wrap(XMLHttpRequest.prototype, 'send', this._patchSend());

    return this._moduleExports;
  }

  /**
   * implements unpatch function
   */
  protected unpatch() {
    this._logger.debug('removing patch from', this.moduleName, this.version);

    shimmer.unwrap(XMLHttpRequest.prototype, 'open');
    shimmer.unwrap(XMLHttpRequest.prototype, 'send');

    Object.keys(this._callbackToRemoveEvents).forEach(key =>
      this._callbackToRemoveEvents[key]()
    );
  }
}
