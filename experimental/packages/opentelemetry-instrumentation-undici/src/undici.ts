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
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import {
  Attributes,
  context,
  Meter,
  propagation,
  Span,
  SpanKind,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';

import { VERSION } from './version';

import { ListenerRecord } from './internal-types';
import { UndiciInstrumentationConfig } from './types';

// Get the content-length from undici response headers.
// `headers` is an Array of buffers: [k, v, k, v, ...].
// If the header is not present, or has an invalid value, this returns null.
function contentLengthFromResponseHeaders(headers: Buffer[]) {
  const name = 'content-length';
  for (let i = 0; i < headers.length; i += 2) {
    const k = headers[i];
    if (k.length === name.length && k.toString().toLowerCase() === name) {
      const v = Number(headers[i + 1]);
      if (!Number.isNaN(Number(v))) {
        return v;
      }
      return undefined;
    }
  }
  return undefined;
}

// A combination of https://github.com/elastic/apm-agent-nodejs and
// https://github.com/gadget-inc/opentelemetry-instrumentations/blob/main/packages/opentelemetry-instrumentation-undici/src/index.ts
export class UndiciInstrumentation extends InstrumentationBase {
  // Keep ref to avoid https://github.com/nodejs/node/issues/42170 bug and for
  // unsubscribing.
  private _channelSubs!: Array<ListenerRecord>;

  private _spanFromReq = new WeakMap<any, Span>();

  private _requestHook: UndiciInstrumentationConfig['onRequest'];

  // @ts-expect-error -- we are no reading its value in this
  override meter: Meter;

  constructor(config?: UndiciInstrumentationConfig) {
    super('@opentelemetry/instrumentation-undici', VERSION, config);
    // Force load fetch API (since it's lazy loaded in Node 18)
    fetch('').catch(() => {});
    this.setConfig(config);
  }

  // No need to instrument files/modules
  protected override init() {
    return undefined;
  }

  override disable(): void {
    this._channelSubs.forEach((sub) => sub.channel.unsubscribe(sub.onMessage));
    this._channelSubs.length = 0;
  }

  override enable(): void {
    if (this._config.enabled) {
      return;
    }
    // This methos is called by the `InstrumentationAbstract` constructor before
    // ours is called. So we need to ensure the property is initalized
    this._channelSubs = this._channelSubs || [];
    this.subscribeToChannel('undici:request:create', this.onRequest.bind(this));
    this.subscribeToChannel('undici:request:headers', this.onHeaders.bind(this));
    this.subscribeToChannel('undici:request:trailers', this.onDone.bind(this));
    this.subscribeToChannel('undici:request:error', this.onError.bind(this));
  }

  override setConfig(config?: UndiciInstrumentationConfig): void {
    super.setConfig(config);
    if (typeof config?.onRequest === 'function') {
      this._requestHook = config.onRequest;
    }
  }

  private subscribeToChannel(diagnosticChannel: string, onMessage: ListenerRecord['onMessage']) {
    const channel = diagch.channel(diagnosticChannel);
    channel.subscribe(onMessage);
    this._channelSubs.push({
      name: diagnosticChannel,
      channel,
      onMessage,
    });
  }

  private onRequest({ request }: any): void {
    // We do not handle instrumenting HTTP CONNECT. See limitation notes above.
    if (request.method === 'CONNECT') {
      return;
    }

    const span = this.tracer.startSpan(`HTTP ${request.method}`, {
      kind: SpanKind.CLIENT,
      attributes: {
        [SemanticAttributes.HTTP_URL]: String(request.origin),
        [SemanticAttributes.HTTP_METHOD]: request.method,
        [SemanticAttributes.HTTP_TARGET]: request.path,
        'http.client': 'fetch',
      },
    });
    const requestContext = trace.setSpan(context.active(), span);
    const addedHeaders: Record<string, string> = {};
    propagation.inject(requestContext, addedHeaders);

    if (this._requestHook) {
      this._requestHook({ request, span, additionalHeaders: addedHeaders });
    }

    console.log('request', request)
    request.headers += Object.entries(addedHeaders)
      .map(([k, v]) => `${k}: ${v}\r\n`)
      .join('');
    console.log('headers', request.headers)
    this._spanFromReq.set(request, span);
  }

  private onHeaders({ request, response }: any): void {
    const span = this._spanFromReq.get(request);

    if (span !== undefined) {
      // We are currently *not* capturing response headers, even though the
      // intake API does allow it, because none of the other `setHttpContext`
      // uses currently do.

      const cLen = contentLengthFromResponseHeaders(response.headers);
      const attrs: Attributes = {
        [SemanticAttributes.HTTP_STATUS_CODE]: response.statusCode,
      };
      if (cLen) {
        attrs[SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH] = cLen;
      }
      span.setAttributes(attrs);
      span.setStatus({
        code: response.statusCode >= 400 ? SpanStatusCode.ERROR : SpanStatusCode.OK,
        message: String(response.statusCode),
      });
    }
  }

  private onDone({ request }: any): void {
    const span = this._spanFromReq.get(request);
    if (span !== undefined) {
      span.end();
      this._spanFromReq.delete(request);
    }
  }

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