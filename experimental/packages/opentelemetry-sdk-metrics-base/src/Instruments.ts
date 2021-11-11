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
import { Attributes } from '@opentelemetry/api-metrics';
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

    aggregate(value: number, attributes: Attributes = {}, ctx: api.Context = api.context.active()) {
        this._meter.aggregate(this, {
            value,
            attributes,
            context: ctx,
        });
    }
}

export class UpDownCounter extends Instrument implements metrics.Counter {
    add(value: number, attributes?: Attributes, ctx?: api.Context): void {
        this.aggregate(value, attributes, ctx);
    }
}

export class Counter extends Instrument implements metrics.Counter {
    add(value: number, attributes?: Attributes, ctx?: api.Context): void {
        if (value < 0) {
            api.diag.warn(`negative value provided to counter ${this.getName()}: ${value}`);
            return;
        }

        this.aggregate(value, attributes, ctx);
    }
}

export class Histogram extends Instrument implements metrics.Histogram {
    record(value: number, attributes?: Attributes, ctx?: api.Context): void {
        this.aggregate(value, attributes, ctx);
    }
}
