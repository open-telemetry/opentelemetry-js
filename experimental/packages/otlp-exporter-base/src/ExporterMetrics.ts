/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  type Attributes,
  type Counter,
  type Histogram,
  type MeterProvider,
  type UpDownCounter,
  createNoopMeter,
} from '@opentelemetry/api';
import {
  hrTime,
  hrTimeDuration,
  hrTimeToMilliseconds,
} from '@opentelemetry/core';
import {
  ATTR_ERROR_TYPE,
  ATTR_OTEL_COMPONENT_NAME,
  ATTR_OTEL_COMPONENT_TYPE,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
} from './semconv';
import { VERSION } from './version';

const componentCounter = new Map<string, number>();

export interface ExporterMetricsOptions<Internal> {
  componentType: string;
  metricsHelper: IExporterMetricsHelper<Internal>;
  url: string | undefined;
  meterProvider: MeterProvider | undefined;
  errorAttributes: (error: unknown) => Attributes;
}

export interface IExporterMetricsHelper<Internal> {
  name: 'span' | 'metric_data_point' | 'log';
  countItems: (request: Internal) => number;
}

/**
 * Generates `otel.sdk.exporter.*` metrics.
 * https://opentelemetry.io/docs/specs/semconv/otel/sdk-metrics
 */
export class ExporterMetrics<Internal> {
  private readonly inflight: UpDownCounter;
  private readonly exported: Counter;
  private readonly duration: Histogram;
  private readonly standardAttrs: Attributes;
  private readonly errorAttributes: (error: unknown) => Attributes;

  private readonly helper: IExporterMetricsHelper<Internal>;

  constructor(options: ExporterMetricsOptions<Internal>) {
    const {
      componentType,
      metricsHelper,
      meterProvider,
      url,
      errorAttributes,
    } = options;
    this.errorAttributes = errorAttributes;
    const meter = meterProvider
      ? meterProvider.getMeter('@opentelemetry/otlp-exporter', VERSION)
      : createNoopMeter();

    const counter = componentCounter.get(componentType) ?? 0;
    componentCounter.set(componentType, counter + 1);

    this.standardAttrs = {
      [ATTR_OTEL_COMPONENT_TYPE]: componentType,
      [ATTR_OTEL_COMPONENT_NAME]: `${componentType}/${counter}`,
    };
    if (url) {
      if (url.includes('://')) {
        const parsedUrl = new URL(url);
        this.standardAttrs[ATTR_SERVER_ADDRESS] = parsedUrl.hostname;
        let port: number | undefined = undefined;
        if (parsedUrl.port) {
          port = Number(parsedUrl.port);
        } else if (parsedUrl.protocol === 'http:') {
          port = 80;
        } else if (parsedUrl.protocol === 'https:') {
          port = 443;
        }
        this.standardAttrs[ATTR_SERVER_PORT] = port;
      } else {
        const parts = url.split(':');
        this.standardAttrs[ATTR_SERVER_ADDRESS] = parts[0];
        if (parts[1]) {
          this.standardAttrs[ATTR_SERVER_PORT] = Number(parts[1]);
        }
      }
    }

    this.helper = metricsHelper;

    this.inflight = meter.createUpDownCounter(
      `otel.sdk.exporter.${this.helper.name}.inflight`,
      {
        unit: `{${this.helper.name}}`,
        description: `The number of ${this.helper.name}s which were passed to the exporter, but that have not been exported yet (neither successful, nor failed).`,
      }
    );
    this.exported = meter.createCounter(
      `otel.sdk.exporter.${this.helper.name}.exported`,
      {
        unit: `{${this.helper.name}}`,
        description: `The number of ${this.helper.name}s for which the export has finished, either successful or failed.`,
      }
    );
    this.duration = meter.createHistogram(
      'otel.sdk.exporter.operation.duration',
      {
        unit: 's',
        description: 'The duration of exporting a batch of telemetry records.',
        advice: {
          explicitBucketBoundaries: [],
        },
      }
    );
  }

  startExport(request: Internal): (error: unknown) => void {
    const numItems = this.helper.countItems(request);
    const startTime = hrTime();
    this.inflight.add(numItems, this.standardAttrs);
    return (error: unknown) => {
      const endTime = hrTime();
      this.inflight.add(-numItems, this.standardAttrs);
      const exportedAttrs = error
        ? {
            ...this.standardAttrs,
            [ATTR_ERROR_TYPE]:
              error instanceof Error ? error.name : 'export_failed',
          }
        : this.standardAttrs;
      this.exported.add(numItems, exportedAttrs);
      const durationAttrs = {
        ...exportedAttrs,
        ...this.errorAttributes(error),
      };
      const duration =
        hrTimeToMilliseconds(hrTimeDuration(startTime, endTime)) / 1000;
      this.duration.record(duration, durationAttrs);
    };
  }
}
