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

import * as api from '@opentelemetry/api';
import * as metrics from '@opentelemetry/api-metrics';
import { Resource } from '@opentelemetry/resources';
import { Measurement } from './Measurement';
import { Meter } from './Meter';
import { MetricExporter } from './MetricExporter';
import { MetricReader } from './MetricReader';
import { View } from './View';

// https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#meterprovider

export type MeterProviderOptions = {
    resource?: Resource;
}

export class MeterProvider {
    private _resource: Resource;
    private _shutdown = false;
    private _metricReaders: MetricReader[] = [];
    private _metricExporters: MetricExporter[] = [];
    private _views: View[] = [];

    constructor(options: MeterProviderOptions) {
        this._resource = options.resource ?? Resource.empty();
    }

    /**
     * **Unstable**
     * 
     * This method is only here to prevent typescript from complaining and may be removed.
     */
    getResource() {
        return this._resource;
    }

    getMeter(name: string, version = '', options: metrics.MeterOptions = {}): metrics.Meter {
        // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#meter-creation
        if (this._shutdown) {
            api.diag.warn('A shutdown MeterProvider cannot provide a Meter')
            return metrics.NOOP_METER;
        }

        // Spec leaves it unspecified if creating a meter with duplicate
        // name/version returns the same meter. We create a new one here
        // for simplicity. This may change in the future.
        // TODO: consider returning the same meter if the same name/version is used
        return new Meter(this, { name, version }, options.schemaUrl);
    }

    addMetricReader(metricReader: MetricReader) {
        this._metricReaders.push(metricReader);
    }

    addView(view: View) {
        // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#view
        this._views.push(view);
    }

    /**
     * Flush all buffered data and shut down the MeterProvider and all exporters and metric readers.
     * Returns a promise which is resolved when all flushes are complete.
     * 
     * TODO: return errors to caller somehow?
     */
    async shutdown(): Promise<void> {
        // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#shutdown

        if (this._shutdown) {
            api.diag.warn('shutdown may only be called once per MeterProvider');
            return;
        }

        // TODO add a timeout - spec leaves it up the the SDK if this is configurable
        this._shutdown = true;

        // Shut down all exporters and readers.
        // Log all Errors.
        for (const exporter of this._metricExporters) {
            try {
                await exporter.shutdown();
            } catch (e) {
                if (e instanceof Error) {
                    api.diag.error(`Error shutting down: ${e.message}`)
                }
            }
        }
    }

    /**
     * Notifies all exporters and metric readers to flush any buffered data.
     * Returns a promise which is resolved when all flushes are complete.
     * 
     * TODO: return errors to caller somehow?
     */
    async forceFlush(): Promise<void> {
        // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#forceflush

        // TODO add a timeout - spec leaves it up the the SDK if this is configurable

        // do not flush after shutdown
        if (this._shutdown) {
            api.diag.warn('invalid attempt to force flush after shutdown')
            return;
        }

        for (const exporter of [...this._metricExporters, ...this._metricReaders]) {
            try {
                await exporter.forceFlush();
            } catch (e) {
                if (e instanceof Error) {
                    api.diag.error(`Error flushing: ${e.message}`)
                }
            }
        }
    }

    public aggregate(_meter: Meter, _metric: unknown, _measurement: Measurement) {
        // TODO actually aggregate

        /**
         * if there are no views:
         *   apply the default configuration
         * else:
         *   for each view:
         *     if view matches:
         *       apply view configuration
         *   if no view matched:
         *     if user has not disabled default fallback:
         *       apply default configuration
         */
    }
}
