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

import {
  hrTimeToTimeStamp,
  VERSION as CORE_VERSION,
} from '@opentelemetry/core';
import { ReadableSpan } from '@opentelemetry/tracing';
import * as ot from '@opentelemetry/api';
import {
  AttributeMap,
  Attributes,
  AttributeValue,
  Link,
  LinkType,
  Span,
  TruncatableString,
} from './types';
import { VERSION } from './version';

const AGENT_LABEL_KEY = 'g.co/agent';
const AGENT_LABEL_VALUE = `opentelemetry-js [${CORE_VERSION}]; stackdriver-trace-exporter [${VERSION}]`;

export function getReadableSpanTransformer(
  projectId: string
): (span: ReadableSpan) => Span {
  return span => {
    const attributes = transformAttributes(span.attributes, {
      project_id: projectId,
      [AGENT_LABEL_KEY]: AGENT_LABEL_VALUE,
    });

    const out: Span = {
      attributes,
      displayName: stringToTruncatableString(span.name),
      links: {
        link: span.links.map(transformLink),
      },
      endTime: hrTimeToTimeStamp(span.endTime),
      startTime: hrTimeToTimeStamp(span.startTime),
      name: `projects/${projectId}/traces/${span.spanContext.traceId}/spans/${span.spanContext.spanId}`,
      spanId: span.spanContext.spanId,
      sameProcessAsParentSpan: !span.spanContext.isRemote,
      status: span.status,
      timeEvents: {
        timeEvent: span.events.map(e => ({
          time: hrTimeToTimeStamp(e.time),
          annotation: {
            attributes: transformAttributes(e.attributes),
            description: stringToTruncatableString(e.name),
          },
        })),
      },
    };

    if (span.parentSpanId) {
      out.parentSpanId = span.parentSpanId;
    }

    return out;
  };
}

function transformLink(link: ot.Link): Link {
  return {
    attributes: transformAttributes(link.attributes),
    spanId: link.spanContext.spanId,
    traceId: link.spanContext.traceId,
    type: LinkType.UNSPECIFIED,
  };
}

function transformAttributes(
  requestAttributes: ot.Attributes = {},
  serviceAttributes: ot.Attributes = {}
): Attributes {
  const attributes = Object.assign({}, requestAttributes, serviceAttributes);
  const attributeMap = transformAttributeValues(attributes);
  return {
    attributeMap: attributeMap,
    // @todo get dropped attribute count from sdk ReadableSpan
    droppedAttributesCount:
      Object.keys(attributes).length - Object.keys(attributeMap).length,
  };
}

function transformAttributeValues(attributes: ot.Attributes): AttributeMap {
  const out: AttributeMap = {};
  for (const [key, value] of Object.entries(attributes)) {
    switch (typeof value) {
      case 'number':
      case 'boolean':
      case 'string':
        out[key] = valueToAttributeValue(value);
        break;
    }
  }
  return out;
}

function stringToTruncatableString(value: string): TruncatableString {
  return { value };
}

function valueToAttributeValue(
  value: string | number | boolean
): AttributeValue {
  switch (typeof value) {
    case 'number':
      // TODO: Consider to change to doubleValue when available in V2 API.
      return { intValue: String(Math.round(value)) };
    case 'boolean':
      return { boolValue: value };
    case 'string':
      return { stringValue: stringToTruncatableString(value) };
  }
}
