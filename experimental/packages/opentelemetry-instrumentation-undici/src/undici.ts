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
import * as diagch from 'diagnostics_channel';
import { URL } from 'url';

import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { InstrumentationBase, safeExecuteInTheMiddle } from '@opentelemetry/instrumentation';
import {
  Attributes,
  context,
  diag,
  propagation,
  Span,
  SpanKind,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';

import { VERSION } from './version';

import { HeadersMessage, ListenerRecord, RequestMessage } from './internal-types';
import { UndiciInstrumentationConfig, UndiciRequest } from './types';


// A combination of https://github.com/elastic/apm-agent-nodejs and
// https://github.com/gadget-inc/opentelemetry-instrumentations/blob/main/packages/opentelemetry-instrumentation-undici/src/index.ts
export class UndiciInstrumentation extends InstrumentationBase {
  // Keep ref to avoid https://github.com/nodejs/node/issues/42170 bug and for
  // unsubscribing.
  private _channelSubs!: Array<ListenerRecord>;

  private _spanFromReq = new WeakMap<UndiciRequest, Span>();

  constructor(config?: UndiciInstrumentationConfig) {
    super('@opentelemetry/instrumentation-undici', VERSION, config);
    // Force load fetch API (since it's lazy loaded in Node 18)
    // `fetch` Added in: v17.5.0, v16.15.0 (with flag) and we suport lower verisons
    // https://nodejs.org/api/globals.html#fetch
    try {
      fetch('').catch(() => {});
    } catch (err) {
      // TODO: nicer message
      diag.info(`fetch API not available`);
    }
    
    this.setConfig(config);
  }

  // No need to instrument files/modules
  protected override init() {
    return undefined;
  }

  override disable(): void {
    if (!this._config.enabled) {
      return;
    }

    this._channelSubs.forEach(sub => sub.channel.unsubscribe(sub.onMessage));
    this._channelSubs.length = 0;
    this._config.enabled = false;
  }

  override enable(): void {
    if (this._config.enabled) {
      return;
    }
    this._config.enabled = true;

    // This method is called by the `InstrumentationAbstract` constructor before
    // ours is called. So we need to ensure the property is initalized
    this._channelSubs = this._channelSubs || [];
    this.subscribeToChannel('undici:request:create', this.onRequestCreated.bind(this));
    this.subscribeToChannel('undici:client:sendHeaders',this.onRequestHeaders.bind(this));
    this.subscribeToChannel('undici:request:headers',this.onResponseHeaders.bind(this));
    this.subscribeToChannel('undici:request:trailers', this.onDone.bind(this));
    this.subscribeToChannel('undici:request:error', this.onError.bind(this));
  }

  override setConfig(config?: UndiciInstrumentationConfig): void {
    super.setConfig(config);
    
    if (config?.enabled) {
      this.enable();
    } else {
      this.disable();
    }
  }
  
  private _getConfig(): UndiciInstrumentationConfig {
    return this._config as UndiciInstrumentationConfig;
  }

  private subscribeToChannel(
    diagnosticChannel: string,
    onMessage: ListenerRecord['onMessage']
  ) {
    const channel = diagch.channel(diagnosticChannel);
    channel.subscribe(onMessage);
    this._channelSubs.push({
      name: diagnosticChannel,
      channel,
      onMessage,
    });
  }

  // This is the 1st message we receive for each request (fired after request creation). Here we will
  // create the span and populate some atttributes, then link the span to the request for further
  // span processing
  private onRequestCreated({ request }: RequestMessage): void {
    console.log('onRequestCreated')
    // Ignore if:
    // - instrumentation is disabled
    // - ignored by config
    // - method is 'CONNECT' (TODO: check for limitations)
    const config = this._getConfig();
    const shouldIgnoreReq = safeExecuteInTheMiddle(
      () => !config.enabled || request.method === 'CONNECT' || config.ignoreRequestHook?.(request),
      (e) => e && this._diag.error('caught ignoreRequestHook error: ', e),
      true,
    );

    if (shouldIgnoreReq) {
      return;
    }

    const requestUrl = new URL(request.origin);
    const spanAttributes = {
      [SemanticAttributes.HTTP_URL]: request.origin,
      [SemanticAttributes.HTTP_METHOD]: request.method,
      [SemanticAttributes.HTTP_TARGET]: request.path || '/',
      [SemanticAttributes.NET_PEER_NAME]: requestUrl.hostname,
    };

    const rawHeaders = request.headers.split('\r\n');
    const reqHeaders = new Map(rawHeaders.map(h => {
      const sepIndex = h.indexOf(':');
      const name = h.substring(0, sepIndex).toLowerCase();
      const val = h.substring(sepIndex + 1).trim();
      return [name, val];
    }));

    let hostAttribute = reqHeaders.get('host');
    if (!hostAttribute) {
      const protocolPorts: Record<string, string> = { https: '443', http: '80' };
      const defaultPort = protocolPorts[requestUrl.protocol] || '';
      const port = requestUrl.port || defaultPort;

      hostAttribute = requestUrl.hostname;
      if (port) {
        hostAttribute += `:${port}`;
      }
    }
    spanAttributes[SemanticAttributes.HTTP_HOST] = hostAttribute;

    const userAgent = reqHeaders.get('user-agent');
    if (userAgent) {
      spanAttributes[SemanticAttributes.HTTP_USER_AGENT] = userAgent;
    }

    // Put headers as attributes based on config
    if (config.headersToSpanAttributes?.requestHeaders) {
      config.headersToSpanAttributes.requestHeaders.forEach((name) => {
        const headerName = name.toLowerCase();
        const headerValue = reqHeaders.get(headerName);

        if (headerValue) {
          const normalizedName = headerName.replace(/-/g, '_');
          spanAttributes[`http.request.header.${normalizedName}`] = headerValue;
        }
      });
    }

    const span = this.tracer.startSpan(`HTTP ${request.method}`, {
      kind: SpanKind.CLIENT,
      attributes: spanAttributes,
    });

    // Context propagation
    const requestContext = trace.setSpan(context.active(), span);
    const addedHeaders: Record<string, string> = {};
    propagation.inject(requestContext, addedHeaders);

    // Execute the request hook if defined
    safeExecuteInTheMiddle(
      () => config.requestHook?.(span, request),
      (e) => e && this._diag.error('caught requestHook error: ', e),
      true,
    );

    request.headers += Object.entries(addedHeaders)
      .map(([k, v]) => `${k}: ${v}\r\n`)
      .join('');
    this._spanFromReq.set(request, span);
  }

  // This is the 2nd message we recevie for each request. It is fired when connection with
  // the remote is stablished and about to send the first byte. Here do have info about the
  // remote addres an port so we can poupulate some `net.*` attributes into the span
  private onRequestHeaders({ request, socket }: any): void {
    console.log('onRequestHeaders')
    const span = this._spanFromReq.get(request as UndiciRequest);

    if (span) {
      const { remoteAddress, remotePort } = socket;

      // TODO: this may be affected by HTTP semconv breaking changes
      span.setAttributes({
        [SemanticAttributes.NET_PEER_IP]: remoteAddress,
        [SemanticAttributes.NET_PEER_PORT]: remotePort,
      });
    }
  }

  // This is the 3rd message we get for each request and it's fired when the server
  // headers are received, body may not be accessible yet (TODO: check this).
  // From the response headers we can set the status and content length
  private onResponseHeaders({ request, response }: HeadersMessage): void {
    console.log('onResponseHeaders')
    const span = this._spanFromReq.get(request);

    if (span !== undefined) {
      // We are currently *not* capturing response headers, even though the
      // intake API does allow it, because none of the other `setHttpContext`
      // uses currently do
      const attrs: Attributes = {
        [SemanticAttributes.HTTP_STATUS_CODE]: response.statusCode,
      };

      // Get headers with names lowercased but values intact
      const resHeaders = new Map<string, string>();
      for (let idx = 0; idx < response.headers.length; idx = idx + 2) {
        resHeaders.set(
          response.headers[idx].toString().toLowerCase(),
          response.headers[idx + 1].toString(),
        );
      }

      // Put response headers as attributes based on config
      const config = this._getConfig();
      if (config.headersToSpanAttributes?.responseHeaders) {
        config.headersToSpanAttributes.responseHeaders.forEach((name) => {
          const headerName = name.toLowerCase();
          const headerValue = resHeaders.get(headerName);

          if (headerValue) {
            const normalizedName = headerName.replace(/-/g, '_');
            attrs[`http.response.header.${normalizedName}`] = headerValue;
          }
        });
      }

      const contentLength = Number(resHeaders.get('content-length'));
      if (!isNaN(contentLength)) {
        attrs[SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH] = contentLength;
      }

      span.setAttributes(attrs);
      span.setStatus({
        code: response.statusCode >= 400 ? SpanStatusCode.ERROR : SpanStatusCode.UNSET,
      });
    }
  }


  // This is the last event we receive if the request went without any errors (TODO: check this)
  private onDone({ request }: any): void {
    console.log('onDone')
    const span = this._spanFromReq.get(request);
    if (span !== undefined) {
      span.end();
      this._spanFromReq.delete(request);
    }
  }

  // TODO: check this
  // This messge si triggered if there is any error in the request
  // TODO: in `undici@6.3.0` when request aborted the error type changes from
  // a custom error (`RequestAbortedError`) to a built-in `DOMException` so
  // - `code` is from DOMEXception (ABORT_ERR: 20)
  // - `message` changes
  // - stacktrace is smaller and contains node internal frames
  private onError({ request, error }: any): void {
    const span = this._spanFromReq.get(request);
    if (span !== undefined) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.end();
    }
  }
}
