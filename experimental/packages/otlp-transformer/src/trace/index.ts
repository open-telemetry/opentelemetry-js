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
import type { IResource } from '@opentelemetry/resources';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import type { OtlpEncodingOptions } from '../common/types';
import { toAttributes } from '../common/internal';
import { sdkSpanToOtlpSpan } from './internal';
import {
  IExportTraceServiceRequest,
  IResourceSpans,
  IScopeSpans,
  ISpan,
} from './types';
import { Encoder, getOtlpEncoder } from '../common';
import { InstrumentationLibrary } from '@opentelemetry/core';

export function createExportTraceServiceRequest(
  spans: ReadableSpan[],
  options?: OtlpEncodingOptions
): IExportTraceServiceRequest {
  const encoder = getOtlpEncoder(options);
  return {
    resourceSpans: spanRecordsToResourceSpans(spans, encoder),
  };
}

function createResourceMap(readableSpans: ReadableSpan[], encoder: Encoder) {
  const resourceMap: Map<
    IResource,
    Map<InstrumentationLibrary, ISpan[]>
  > = new Map();
  for (const record of readableSpans) {
    let ilmMap = resourceMap.get(record.resource);

    if (!ilmMap) {
      ilmMap = new Map();
      resourceMap.set(record.resource, ilmMap);
    }

    // TODO this is duplicated in basic tracer. Consolidate on a common helper in core
    let records = ilmMap.get(record.instrumentationLibrary);

    if (!records) {
      records = [];
      ilmMap.set(record.instrumentationLibrary, records);
    }

    records.push(sdkSpanToOtlpSpan(record, encoder));
  }

  return resourceMap;
}

function spanRecordsToResourceSpans(
  readableSpans: ReadableSpan[],
  encoder: Encoder
): IResourceSpans[] {
  const resourceMap = createResourceMap(readableSpans, encoder);
  const out: IResourceSpans[] = [];

  for (const resource of resourceMap.keys()) {
    const ilmMap = resourceMap.get(resource);
    if (!ilmMap) {
      continue;
    }

    const scopeResourceSpans: IScopeSpans[] = [];
    for (const ilm of ilmMap.keys()) {
      const scopeSpans = ilmMap.get(ilm);
      if (scopeSpans && scopeSpans.length > 0) {
        scopeResourceSpans.push({
          scope: {
            name: ilm.name,
            version: ilm.version,
          },
          spans: scopeSpans,
          schemaUrl: ilm.schemaUrl,
        });
      }
    }

    const transformedSpans: IResourceSpans = {
      resource: {
        attributes: toAttributes(resource.attributes),
        droppedAttributesCount: 0,
      },
      scopeSpans: scopeResourceSpans,
      schemaUrl: undefined,
    };

    out.push(transformedSpans);
  }

  return out;
}
