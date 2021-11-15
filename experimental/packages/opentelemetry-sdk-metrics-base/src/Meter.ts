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

import * as metrics from '@opentelemetry/api-metrics';
import { InstrumentationLibrary } from '@opentelemetry/core';
import { Counter, Histogram, UpDownCounter } from './Instruments';
import { Measurement } from './Measurement';
import { MeterProvider } from './MeterProvider';

// https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/api.md#meter

export class Meter implements metrics.Meter {
    // instrumentation library required by spec to be on meter
    // spec requires provider config changes to apply to previously created meters, achieved by holding a reference to the provider
    constructor(private _provider: MeterProvider, private _instrumentationLibrary: InstrumentationLibrary, private _schemaUrl?: string) { }

    /** this exists just to prevent ts errors from unused variables and may be removed */
    getSchemaUrl(): string | undefined {
        return this._schemaUrl;
    }

    /** this exists just to prevent ts errors from unused variables and may be removed */
    getInstrumentationLibrary(): InstrumentationLibrary {
        return this._instrumentationLibrary;
    }

    createHistogram(_name: string, _options?: metrics.MetricOptions): Histogram {
        return new Histogram(this, _name);
    }
    
    createCounter(_name: string, _options?: metrics.MetricOptions): metrics.Counter {
        return new Counter(this, _name);
    }

    createUpDownCounter(_name: string, _options?: metrics.MetricOptions): metrics.UpDownCounter {
        return new UpDownCounter(this, _name);
    }

    createObservableGauge(_name: string, _options?: metrics.MetricOptions, _callback?: (observableResult: metrics.ObservableResult) => void): metrics.ObservableBase {
        throw new Error('Method not implemented.');
    }
    createObservableCounter(_name: string, _options?: metrics.MetricOptions, _callback?: (observableResult: metrics.ObservableResult) => void): metrics.ObservableBase {
        throw new Error('Method not implemented.');
    }
    createObservableUpDownCounter(_name: string, _options?: metrics.MetricOptions, _callback?: (observableResult: metrics.ObservableResult) => void): metrics.ObservableBase {
        throw new Error('Method not implemented.');
    }

    public aggregate(metric: unknown, measurement: Measurement) {
        this._provider.aggregate(this, metric, measurement);
    }
}
