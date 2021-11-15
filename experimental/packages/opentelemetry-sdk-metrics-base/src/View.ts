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

import { InstrumentType } from './Instruments';

// https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#view

/**
 * A metric view selects a stream of metrics from a MeterProvider and applies
 * a configuration to that stream. If no configuration is provided, the default
 * configuration is used.
 */
export class View {
    private _selector: Partial<ViewMetricSelector>;

    /**
     * Construct a metric view
     * 
     * @param options a required object which describes the view selector and configuration
     */
    constructor(options: ViewOptions) {
        if (typeof options.selector == null) {
            throw new Error('Missing required view selector')
        }

        if (
            options.selector.instrumentType == null &&
            options.selector.instrumentName == null &&
            options.selector.meterName == null &&
            options.selector.meterVersion == null &&
            options.selector.meterSchemaUrl == null
        ) {
            // It is recommended by the SDK specification to fail fast when invalid options are provided
            throw new Error('Cannot create a view which selects no options');
        }

        this._selector = options.selector;
    }

    /**
     * Given a metric selector, determine if all of this view's metric selectors match.
     * 
     * @param selector selector to match
     * @returns boolean
     */
    public match(selector: ViewMetricSelector) {
        return this._matchSelectorProperty('instrumentType', selector.instrumentType) &&
            this._matchInstrumentName(selector.instrumentName) &&
            this._matchSelectorProperty('meterName', selector.meterName) &&
            this._matchSelectorProperty('meterVersion', selector.meterVersion) &&
            this._matchSelectorProperty('meterSchemaUrl', selector.meterSchemaUrl);
    }

    /**
     * Match instrument name against the configured selector metric name, which may include wildcards
     */
    private _matchInstrumentName(name: string) {
        if (this._selector.instrumentName == null) {
            return true;
        }

        // TODO wildcard support
        return this._selector.instrumentName === name;
    }

    private _matchSelectorProperty<Prop extends keyof ViewMetricSelector>(property: Prop, metricProperty: ViewMetricSelector[Prop]): boolean {
        if (this._selector[property] == null) {
            return true;
        }

        if (this._selector[property] === metricProperty) {
            return true;
        }

        return false;
    }
}

export type ViewMetricSelector = {
    instrumentType: InstrumentType;
    instrumentName: string;
    meterName: string;
    meterVersion?: string;
    meterSchemaUrl?: string;
}

export type ViewOptions = {
    name?: string;
    selector: Partial<ViewMetricSelector>;
    streamConfig?: ViewStreamConfig;
}

export type ViewStreamConfig = {
    description: string;
    attributeKeys?: string[];

    // TODO use these types when they are defined
    aggregation?: unknown;
    exemplarReservoir?: unknown;
}
