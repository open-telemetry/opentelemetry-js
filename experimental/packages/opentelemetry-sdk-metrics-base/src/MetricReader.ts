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

import { MetricExporter } from '.';

// https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#metricreader

export class MetricReader {
    private _shutdown = false;

    constructor(private _exporter: MetricExporter) {}

    async shutdown(): Promise<void> {
        if (this._shutdown) {
            return;
        }

        this._shutdown = true;
        // errors thrown to caller
        await this._exporter.shutdown();
    }

    async forceFlush(): Promise<void> {
        if (this._shutdown) {
            return;
        }

        // errors thrown to caller
        await this._exporter.forceFlush();
    }
}
