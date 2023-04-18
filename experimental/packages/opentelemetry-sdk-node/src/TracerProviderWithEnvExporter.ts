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
import { getEnv, getEnvWithoutDefaults } from '@opentelemetry/core';
import {
  ConsoleSpanExporter,
  SpanExporter,
  BatchSpanProcessor,
  SimpleSpanProcessor,
  SDKRegistrationConfig,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {
  NodeTracerConfig,
  NodeTracerProvider,
} from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter as OTLPProtoTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPTraceExporter as OTLPHttpTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPTraceExporter as OTLPGrpcTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

export class TracerProviderWithEnvExporters extends NodeTracerProvider {
  private _configuredExporters: SpanExporter[] = [];
  private _spanProcessors: SpanProcessor[] | undefined;
  private _hasSpanProcessors: boolean = false;

  static configureOtlp(): SpanExporter {
    const protocol = this.getOtlpProtocol();

    switch (protocol) {
      case 'grpc':
        return new OTLPGrpcTraceExporter();
      case 'http/json':
        return new OTLPHttpTraceExporter();
      case 'http/protobuf':
        return new OTLPProtoTraceExporter();
      default:
        diag.warn(
          `Unsupported OTLP traces protocol: ${protocol}. Using http/protobuf.`
        );
        return new OTLPProtoTraceExporter();
    }
  }

  static getOtlpProtocol(): string {
    const parsedEnvValues = getEnvWithoutDefaults();

    return (
      parsedEnvValues.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL ??
      parsedEnvValues.OTEL_EXPORTER_OTLP_PROTOCOL ??
      getEnv().OTEL_EXPORTER_OTLP_TRACES_PROTOCOL ??
      getEnv().OTEL_EXPORTER_OTLP_PROTOCOL
    );
  }

  private static configureJaeger() {
    // The JaegerExporter does not support being required in bundled
    // environments. By delaying the require statement to here, we only crash when
    // the exporter is actually used in such an environment.
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
      return new JaegerExporter();
    } catch (e) {
      throw new Error(
        `Could not instantiate JaegerExporter. This could be due to the JaegerExporter's lack of support for bundling. If possible, use @opentelemetry/exporter-trace-otlp-proto instead. Original Error: ${e}`
      );
    }
  }

  protected static override _registeredExporters = new Map<
    string,
    () => SpanExporter
  >([
    ['otlp', () => this.configureOtlp()],
    ['zipkin', () => new ZipkinExporter()],
    ['jaeger', () => this.configureJaeger()],
    ['console', () => new ConsoleSpanExporter()],
  ]);

  public constructor(config: NodeTracerConfig = {}) {
    super(config);
    let traceExportersList = this.filterBlanksAndNulls(
      Array.from(new Set(getEnv().OTEL_TRACES_EXPORTER.split(',')))
    );

    if (traceExportersList[0] === 'none') {
      diag.warn(
        'OTEL_TRACES_EXPORTER contains "none". SDK will not be initialized.'
      );
    } else if (traceExportersList.length === 0) {
      diag.warn('OTEL_TRACES_EXPORTER is empty. Using default otlp exporter.');

      traceExportersList = ['otlp'];
      this.createExportersFromList(traceExportersList);

      this._spanProcessors = this.configureSpanProcessors(
        this._configuredExporters
      );
      this._spanProcessors.forEach(processor => {
        this.addSpanProcessor(processor);
      });
    } else {
      if (
        traceExportersList.length > 1 &&
        traceExportersList.includes('none')
      ) {
        diag.warn(
          'OTEL_TRACES_EXPORTER contains "none" along with other exporters. Using default otlp exporter.'
        );
        traceExportersList = ['otlp'];
      }

      this.createExportersFromList(traceExportersList);

      if (this._configuredExporters.length > 0) {
        this._spanProcessors = this.configureSpanProcessors(
          this._configuredExporters
        );
        this._spanProcessors.forEach(processor => {
          this.addSpanProcessor(processor);
        });
      } else {
        diag.warn(
          'Unable to set up trace exporter(s) due to invalid exporter and/or protocol values.'
        );
      }
    }
  }

  override addSpanProcessor(spanProcessor: SpanProcessor) {
    super.addSpanProcessor(spanProcessor);
    this._hasSpanProcessors = true;
  }

  override register(config?: SDKRegistrationConfig) {
    if (this._hasSpanProcessors) {
      super.register(config);
    }
  }

  private createExportersFromList(exporterList: string[]) {
    exporterList.forEach(exporterName => {
      const exporter = this._getSpanExporter(exporterName);
      if (exporter) {
        this._configuredExporters.push(exporter);
      } else {
        diag.warn(`Unrecognized OTEL_TRACES_EXPORTER value: ${exporterName}.`);
      }
    });
  }

  private configureSpanProcessors(
    exporters: SpanExporter[]
  ): (BatchSpanProcessor | SimpleSpanProcessor)[] {
    return exporters.map(exporter => {
      if (exporter instanceof ConsoleSpanExporter) {
        return new SimpleSpanProcessor(exporter);
      } else {
        return new BatchSpanProcessor(exporter);
      }
    });
  }

  private filterBlanksAndNulls(list: string[]): string[] {
    return list.map(item => item.trim()).filter(s => s !== 'null' && s !== '');
  }
}
