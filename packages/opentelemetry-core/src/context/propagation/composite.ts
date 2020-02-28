/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { Carrier, Context, HttpTextFormat } from '@opentelemetry/api';

/** Combines multiple propagators into a single propagator. */
export class CompositePropagator implements HttpTextFormat {
    private _propagators: HttpTextFormat[];
    constructor(...propagators: HttpTextFormat[]) {
        this._propagators = propagators;
    }

    inject(context: Context, carrier: Carrier) {
        for (const propagator of this._propagators) {
            try {
                propagator.inject(context, carrier);
            } catch { }
        }
    }

    extract(context: Context, carrier: Carrier): Context {
        return this._propagators.reduce(
            (ctx, propagator) => {
                try {
                    return propagator.extract(ctx, carrier)
                } catch { }
                return ctx;
            },
            context
        );
    }
}
