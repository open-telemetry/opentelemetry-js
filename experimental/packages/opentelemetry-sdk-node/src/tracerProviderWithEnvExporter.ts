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
import { ConsoleSpanExporter, SpanExporter, BatchSpanProcessor, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerConfig, NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter as OTLPProtoTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPTraceExporter as OTLPHttpTraceExporter} from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPTraceExporter as OTLPGrpcTraceExporter} from '@opentelemetry/exporter-trace-otlp-grpc';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

export class tracerProviderWithEnvExporters extends NodeTracerProvider {
  static DATA_TYPE_TRACES = 'traces';
  public _configuredExporters: SpanExporter[] = [];
  public _spanProcessors: (BatchSpanProcessor | SimpleSpanProcessor)[] | undefined;

  static configureOtlp(): SpanExporter {
    const protocol = this.getOtlpProtocol(this.DATA_TYPE_TRACES);

    switch (protocol) {
      case 'grpc':
        return new OTLPGrpcTraceExporter;
      case 'http/json':
        return new OTLPHttpTraceExporter;
      case 'http/protobuf':
        return new OTLPProtoTraceExporter;
      default:
        // is this what we want the default to be?
        // this is causing test on line 477 and 490 to fail because an exporter is still set up
        diag.warn(`Unsupported OTLP traces protocol: ${protocol}. Using http/protobuf.`);
        return new OTLPProtoTraceExporter;
    }
  }

  static getOtlpProtocol(dataType: string): string | null {
    const parsedEnvValues = getEnvWithoutDefaults();

    switch (dataType) {
      case 'traces':
        return parsedEnvValues.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL ??
          parsedEnvValues.OTEL_EXPORTER_OTLP_PROTOCOL ??
          getEnv().OTEL_EXPORTER_OTLP_TRACES_PROTOCOL ??
          getEnv().OTEL_EXPORTER_OTLP_PROTOCOL;
      default:
        diag.warn(`Data type not recognized: ${dataType}`);
        return null;
    }
  }

  protected static override _registeredExporters = new Map<
    string,
    () => SpanExporter
      >([
        ['otlp', () => this.configureOtlp()],
        ['zipkin', () => new ZipkinExporter],
        ['jaeger', () => new JaegerExporter],
        ['console', () => new ConsoleSpanExporter]
      ]);

  public constructor(config: NodeTracerConfig = {}) {
    super(config);
    let traceExportersList = this.retrieveListOfTraceExporters();

    if (traceExportersList.length === 0 || traceExportersList[0] === 'none') {
      diag.warn('OTEL_TRACES_EXPORTER contains "none" or is empty. SDK will not be initialized.');
    } else {
      if (traceExportersList.length > 1 && traceExportersList.includes('none')) {
        diag.warn('OTEL_TRACES_EXPORTER contains "none" along with other exporters. Using default otlp exporter.');
        traceExportersList = ['otlp'];
      }

      traceExportersList.forEach(exporterName => {
        const exporter = this._getSpanExporter(exporterName);
        if (exporter) {
          this._configuredExporters.push(exporter);
        } else {
          diag.warn(`Unrecognized OTEL_TRACES_EXPORTER value: ${exporterName}.`);
        }
      });

      if (this._configuredExporters.length > 0) {
        this._spanProcessors = this.configureSpanProcessors(this._configuredExporters);
      } else {
        diag.warn('Unable to set up trace exporter(s) due to invalid exporter and/or protocol values.');
      }
    }
  }

  public configureSpanProcessors(exporters: SpanExporter[]): (BatchSpanProcessor | SimpleSpanProcessor)[] {
    return exporters.map(exporter => {
      if (exporter instanceof ConsoleSpanExporter) {
        return new SimpleSpanProcessor(exporter);
      } else {
        return new BatchSpanProcessor(exporter);
      }
    });
  }

  public retrieveListOfTraceExporters(): string[] {
    const traceList = getEnv().OTEL_TRACES_EXPORTER.split(',');
    const uniqueTraceExporters =  Array.from(new Set(traceList));

    return this.filterBlanksAndNulls(uniqueTraceExporters);
  }

  private filterBlanksAndNulls(list: string[]): string[] {
    return list.map(item => item.trim())
      .filter(s => s !== 'null' && s !== '');
  }
}
