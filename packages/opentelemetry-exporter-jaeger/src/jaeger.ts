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

import { diag } from '@opentelemetry/api';
import {
  BindOnceFuture,
  ExportResult,
  ExportResultCode,
  getEnv,
} from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { Socket } from 'dgram';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerTransformer } from './transform';
import * as jaegerTypes from './types';

/**
 * Format and sends span information to Jaeger Exporter.
 *
 * @deprecated Jaeger supports the OpenTelemetry protocol natively
 * (see https://www.jaegertracing.io/docs/1.41/apis/#opentelemetry-protocol-stable).
 * This exporter will not be required by the OpenTelemetry specification starting July 2023, and
 * will not receive any security fixes past March 2024.
 *
 * Please migrate to any of the following packages:
 * - `@opentelemetry/exporter-trace-otlp-proto`
 * - `@opentelemetry/exporter-trace-otlp-grpc`
 * - `@opentelemetry/exporter-trace-otlp-http`
 */
export class JaegerExporter implements SpanExporter {
  private readonly _onShutdownFlushTimeout: number;
  private readonly _localConfig: jaegerTypes.ExporterConfig;
  private readonly _transformer: JaegerTransformer;
  private _shutdownOnce: BindOnceFuture<void>;
  private readonly _httpSender: any;
  private readonly _udpSender: any;

  private _sender?: any;

  constructor(config?: jaegerTypes.ExporterConfig) {
    const localConfig = Object.assign({}, config);

    // https://github.com/jaegertracing/jaeger-client-node#environment-variables
    // By default, the client sends traces via UDP to the agent at localhost:6832. Use OTEL_EXPORTER_JAEGER_AGENT_HOST and
    // JAEGER_AGENT_PORT to send UDP traces to a different host:port. If OTEL_EXPORTER_JAEGER_ENDPOINT is set, the client sends traces
    // to the endpoint via HTTP, making the OTEL_EXPORTER_JAEGER_AGENT_HOST and JAEGER_AGENT_PORT unused. If OTEL_EXPORTER_JAEGER_ENDPOINT is secured,
    // HTTP basic authentication can be performed by setting the OTEL_EXPORTER_JAEGER_USER and OTEL_EXPORTER_JAEGER_PASSWORD environment variables.

    const env = getEnv();
    localConfig.endpoint =
      localConfig.endpoint || env.OTEL_EXPORTER_JAEGER_ENDPOINT;
    localConfig.username =
      localConfig.username || env.OTEL_EXPORTER_JAEGER_USER;
    localConfig.password =
      localConfig.password || env.OTEL_EXPORTER_JAEGER_PASSWORD;
    localConfig.host = localConfig.host || env.OTEL_EXPORTER_JAEGER_AGENT_HOST;
    localConfig.port = localConfig.port || env.OTEL_EXPORTER_JAEGER_AGENT_PORT;

    this._localConfig = localConfig;

    this._shutdownOnce = new BindOnceFuture(this._shutdown, this);

    // Transformer lazy requires jaeger-client so that it throws on runtime when used with esbuild.
    this._transformer = new JaegerTransformer();

    // Below requires are needed as jaeger-client does not expose udp_sender, and http_sender modules
    /* eslint-disable @typescript-eslint/no-var-requires */
    this._udpSender =
      require('jaeger-client/dist/src/reporters/udp_sender').default;
    this._httpSender =
      require('jaeger-client/dist/src/reporters/http_sender').default;
    /* eslint-enable @typescript-eslint/no-var-requires */
    this._onShutdownFlushTimeout =
      typeof localConfig.flushTimeout === 'number'
        ? localConfig.flushTimeout
        : 2000;
  }

  /** Exports a list of spans to Jaeger. */
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    if (this._shutdownOnce.isCalled) {
      return;
    }
    if (spans.length === 0) {
      return resultCallback({ code: ExportResultCode.SUCCESS });
    }
    diag.debug('Jaeger exporter export');
    this._sendSpans(spans, resultCallback).catch(error => {
      return resultCallback({ code: ExportResultCode.FAILED, error });
    });
  }

  /** Shutdown exporter. */
  shutdown(): Promise<void> {
    return this._shutdownOnce.call();
  }

  private _shutdown(): Promise<void> {
    return Promise.race([
      new Promise<void>((_resolve, reject) => {
        setTimeout(
          () => reject(new Error('Flush timeout')),
          this._onShutdownFlushTimeout
        );
      }),
      this._flush(),
    ]).finally(() => {
      this._sender?.close();
    });
  }

  /** Transform spans and sends to Jaeger service. */
  private async _sendSpans(
    spans: ReadableSpan[],
    done?: (result: ExportResult) => void
  ) {
    const thriftSpan = spans.map(span => this._transformer.spanToThrift(span));
    for (const span of thriftSpan) {
      try {
        await this._append(span);
      } catch (error) {
        // TODO right now we break out on first error, is that desirable?
        if (done) return done({ code: ExportResultCode.FAILED, error });
      }
    }
    diag.debug(`successful append for : ${thriftSpan.length}`);

    // Flush all spans on each export. No-op if span buffer is empty
    await this._flush();

    if (done) return process.nextTick(done, { code: ExportResultCode.SUCCESS });
  }

  private async _append(span: jaegerTypes.ThriftSpan): Promise<number> {
    return new Promise((resolve, reject) => {
      this._getSender(span).append(span, (count: number, err?: string) => {
        if (err) {
          return reject(new Error(err));
        }
        resolve(count);
      });
    });
  }

  private _getSender(span: jaegerTypes.ThriftSpan): any {
    if (this._sender) {
      return this._sender;
    }

    const sender = this._localConfig.endpoint
      ? new this._httpSender(this._localConfig)
      : new this._udpSender(this._localConfig);

    if (sender._client instanceof Socket) {
      // unref socket to prevent it from keeping the process running
      sender._client.unref();
    }

    const serviceNameTag = span.tags.find(
      t => t.key === SemanticResourceAttributes.SERVICE_NAME
    );
    const serviceName = serviceNameTag?.vStr || 'unknown_service';

    sender.setProcess({
      serviceName,
      tags: this._transformer.getThriftTag(this._localConfig.tags || []),
    });

    this._sender = sender;
    return sender;
  }

  private async _flush(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      if (!this._sender) {
        return resolve();
      }

      this._sender.flush((_count: number, err?: string) => {
        if (err) {
          return reject(new Error(err));
        }
        diag.debug(`successful flush for ${_count} spans`);
        resolve();
      });
    });
  }
}
