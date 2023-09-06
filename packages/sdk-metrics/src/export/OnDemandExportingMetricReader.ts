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

import * as api from "@opentelemetry/api";
import {
  ExportResultCode,
  globalErrorHandler,
  internal,
} from "@opentelemetry/core";
import { MetricReader } from "./MetricReader";
import { PushMetricExporter } from "./MetricExporter";
import { TimeoutError, callWithTimeout } from "../utils";

export type OnDemandExportingMetricReaderOptions = {
  /**
   * The backing exporter for the metric reader.
   */
  exporter: PushMetricExporter;

  /**
   * Milliseconds for the async observable callback to timeout.
   */
  exportTimeoutMillis?: number;
};

/**
 * {@link MetricReader} which collects metrics and waits for calls to
 * {@link forceFlush()} before exporting them.
 */
export class OnDemandExportingMetricReader extends MetricReader {
  private _exporter: PushMetricExporter;
  private readonly _exportTimeout: number;

  constructor({
    exporter,
    exportTimeoutMillis = 30000,
  }: OnDemandExportingMetricReaderOptions) {
    super({
      aggregationSelector: exporter.selectAggregation?.bind(exporter),
      aggregationTemporalitySelector:
        exporter.selectAggregationTemporality?.bind(exporter),
    });

    if (exportTimeoutMillis <= 0) {
      throw Error("exportTimeoutMillis must be greater than 0");
    }

    this._exporter = exporter;
    this._exportTimeout = exportTimeoutMillis;
  }

  private async _runOnce(): Promise<void> {
    try {
      await callWithTimeout(this._doRun(), this._exportTimeout);
    } catch (err) {
      if (err instanceof TimeoutError) {
        api.diag.error(
          "Export took longer than %s milliseconds and timed out.",
          this._exportTimeout,
        );
        return;
      }

      globalErrorHandler(err as api.Exception);
    }
  }

  private async _doRun(): Promise<void> {
    const { resourceMetrics, errors } = await this.collect({
      timeoutMillis: this._exportTimeout,
    });

    if (errors.length > 0) {
      api.diag.error(
        "OnDemandMetricReader: metrics collection errors",
        ...errors,
      );
    }

    const doExport = async () => {
      const result = await internal._export(this._exporter, resourceMetrics);
      if (result.code !== ExportResultCode.SUCCESS) {
        throw new Error(
          `OnDemandMetricReader: metrics export failed (error ${result.error})`,
        );
      }
    };

    // Avoid scheduling a promise to make the behavior more predictable and easier to test
    if (resourceMetrics.resource.asyncAttributesPending) {
      resourceMetrics.resource
        .waitForAsyncAttributes?.()
        .then(doExport, (err) =>
          api.diag.debug(
            "Error while resolving async portion of resource: ",
            err,
          ),
        );
    } else {
      await doExport();
    }
  }

  protected override onInitialized(): void {}

  protected async onForceFlush(): Promise<void> {
    await this._runOnce();
    await this._exporter.forceFlush();
  }

  protected async onShutdown(): Promise<void> {
    await this._exporter.shutdown();
  }
}
