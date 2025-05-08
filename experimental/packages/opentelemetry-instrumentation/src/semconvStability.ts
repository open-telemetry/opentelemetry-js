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

/**
 * This file holds utilities for semconv stability migration, as described at:
 * - https://opentelemetry.io/docs/specs/semconv/non-normative/http-migration/
 * - https://opentelemetry.io/docs/specs/semconv/non-normative/db-migration/
 *
 * The intent is that these exports will be *removed* in the next breaking
 * release after the semconv migration of relevant packages from
 * opentelemetry-js.git and opentelemetry-js-contrib.git is complete.
 *
 * Usage:
 *
 *  import {SemconvStability, httpSemconvStabilityFromStr} from '@opentelemetry/instrumentation';
 *
 *  export class FooInstrumentation extends InstrumentationBase<MyInstrumentationConfig> {
 *    private _semconvStability: SemconvStability;
 *    constructor(config: FooInstrumentationConfig = {}) {
 *      super('@opentelemetry/instrumentation-foo', VERSION, config);
 *
 *      // When supporting the OTEL_SEMCONV_STABILITY_OPT_IN envvar
 *      this._semconvStability = httpSemconvStabilityFromStr(
 *        process.env.OTEL_SEMCONV_STABILITY_OPT_IN
 *      );
 *
 *      // or when supporting a `semconvStabilityOptIn` config option (e.g. for
 *      // the web where there are no envvars).
 *      this._semconvStability = httpSemconvStabilityFromStr(
 *        config?.semconvStabilityOptIn
 *      );
 *    }
 *  }
 *
 *  // Then, to apply semconv, use the following or similar:
 *  if (this._semconvStability & SemconvStability.OLD) {
 *    // ...
 *  }
 *  if (this._semconvStability & SemconvStability.STABLE) {
 *    // ...
 *  }
 *
 */

export const enum SemconvStability {
  /** Emit only stable semantic conventions. */
  STABLE = 0x1,
  /** Emit only old semantic conventions. */
  OLD = 0x2,
  /** Emit both stable and old semantic conventions. */
  DUPLICATE = 0x1 | 0x2,
}

function _semconvStabilityFromStr(marker: string, str: string | undefined) {
  let semconvStability = SemconvStability.OLD;

  // The same parsing of `str` as `getStringListFromEnv` from the core pkg.
  const entries = str
    ?.split(',')
    .map(v => v.trim())
    .filter(s => s !== '');
  for (const entry of entries ?? []) {
    if (entry.toLowerCase() === marker + '/dup') {
      // DUPLICATE takes highest precedence.
      semconvStability = SemconvStability.DUPLICATE;
      break;
    } else if (entry.toLowerCase() === marker) {
      semconvStability = SemconvStability.STABLE;
    }
  }

  return semconvStability;
}

/**
 * Determine appropriate 'http' semconv stability per
 * https://opentelemetry.io/docs/specs/semconv/non-normative/http-migration/
 *
 * Note: This method will be removed after OTel JS HTTP semconv migration is
 * complete (https://github.com/open-telemetry/opentelemetry-js/issues/5646).
 */
export function httpSemconvStabilityFromStr(str: string | undefined) {
  return _semconvStabilityFromStr('http', str);
}

/**
 * Determine appropriate 'database' semconv stability per
 * https://opentelemetry.io/docs/specs/semconv/non-normative/db-migration/
 *
 * Note: This method will be removed after OTel JS DB semconv migration is
 * complete (https://github.com/open-telemetry/opentelemetry-js/issues/5658).
 */
export function databaseSemconvStabilityFromStr(str: string | undefined) {
  return _semconvStabilityFromStr('database', str);
}
