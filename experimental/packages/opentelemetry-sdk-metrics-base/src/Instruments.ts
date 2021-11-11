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
import { Measurement } from './Measurement';
import { Meter } from './Meter';

export enum InstrumentType {
    COUNTER = 'COUNTER',
    HISTOGRAM = 'HISTOGRAM',
    UP_DOWN_COUNTER = 'UP_DOWN_COUNTER',
    OBSERVABLE_COUNTER = 'OBSERVABLE_COUNTER',
    OBSERVABLE_GAUGE = 'OBSERVABLE_GAUGE',
    OBSERVABLE_UP_DOWN_COUNTER = 'OBSERVABLE_UP_DOWN_COUNTER',
}

export class Instrument {
    constructor(private _meter: Meter, private _name: string, private _version?: string) { }

    getName(): string {
        return this._name;
    }

    /**
     * This only exists to stop typescript complaining about unused variable and may be removed. 
     */
    getVersion(): string | undefined {
        return this._version;
    }

    aggregate(measurement: Measurement) {
        this._meter.aggregate(this, measurement);
    }
}

export class UpDownCounter extends Instrument implements metrics.Counter {
    add(value: number, attributes?: api.SpanAttributes, ctx?: api.Context): void {
        if (typeof value != 'number') {
            api.diag.warn(`invalid type value provided to counter ${this.getName()}: ${typeof value}`);
            return;
        }

        attributes = attributes ?? {};
        ctx = ctx ?? api.context.active();

        this.aggregate({
            value,
            attributes,
            context: ctx,
        });
    }
}

export class Counter extends UpDownCounter implements metrics.Counter {
    override add(value: number, attributes?: api.SpanAttributes, ctx?: api.Context): void {
        if (value < 0) {
            api.diag.warn(`negative value provided to counter ${this.getName()}: ${value}`);
            return;
        }

        return super.add(value, attributes, ctx);
    }
}

export class Histogram extends Instrument implements metrics.Histogram {
    record(_measurement: number, _labels?: metrics.Attributes, _context?: api.Context): void {
        throw new Error('Method not implemented.');
    }
}
