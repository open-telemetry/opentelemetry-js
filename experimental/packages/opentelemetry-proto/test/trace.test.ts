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
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { TraceState } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import { createExportTraceServiceRequest } from '../src/trace';

describe('Trace', () => {
    describe('createExportTraceServiceRequest', () => {
        let resource: Resource;
        let span: ReadableSpan;
        let expectedSpanJson: any;

        beforeEach(() => {
            resource = new Resource({
                'resource-attribute': 'resource attribute value',
            });
            span = {
                spanContext: () => ({
                    spanId: '0000000000000002',
                    traceFlags: 1,
                    traceId: '00000000000000000000000000000001',
                    isRemote: false,
                    traceState: new TraceState(''),
                }),
                parentSpanId: '0000000000000001',
                attributes: { 'string-attribute': 'some attribute value' },
                duration: [1, 300000000],
                endTime: [1640715558, 642725388],
                ended: true,
                events: [
                    {
                        name: 'some event',
                        time: [1640715558, 542725388],
                        attributes: {
                            'event-attribute': 'some string value'
                        }
                    }
                ],
                instrumentationLibrary: {
                    name: 'myLib',
                    version: '0.1.0',
                    schemaUrl: 'http://url.to.schema',
                },
                kind: SpanKind.CLIENT,
                links: [
                    {
                        context: {
                            spanId: '0000000000000003',
                            traceId: '00000000000000000000000000000002',
                            traceFlags: 1,
                            isRemote: false,
                            traceState: new TraceState('')
                        },
                        attributes: {
                            'link-attribute': 'string value'
                        }
                    }
                ],
                name: 'span-name',
                resource,
                startTime: [1640715557, 342725388],
                status: {
                    code: SpanStatusCode.OK,
                },
            };

            expectedSpanJson = {
                resourceSpans: [
                    {
                        resource: {
                            attributes: [
                                {
                                    key: 'resource-attribute',
                                    value: { stringValue: 'resource attribute value' },
                                },
                            ],
                            droppedAttributesCount: 0,
                        },
                        instrumentationLibrarySpans: [
                            {
                                instrumentationLibrary: { name: 'myLib', version: '0.1.0' },
                                spans: [
                                    {
                                        traceId: 'AAAAAAAAAAAAAAAAAAAAAQ==',
                                        spanId: 'AAAAAAAAAAI=',
                                        parentSpanId: 'AAAAAAAAAAE=',
                                        name: 'span-name',
                                        kind: 'SPAN_KIND_CLIENT',
                                        links: [
                                            {
                                                spanId: 'AAAAAAAAAAM=',
                                                traceId: 'AAAAAAAAAAAAAAAAAAAAAg==',
                                                attributes: [
                                                    {
                                                        key: 'link-attribute',
                                                        value: {
                                                            stringValue: 'string value'
                                                        }
                                                    }
                                                ]
                                            }
                                        ],
                                        startTimeUnixNano: '1640715557342725376',
                                        endTimeUnixNano: '1640715558642725376',
                                        events: [
                                            {
                                                attributes: [
                                                    {
                                                        key: 'event-attribute',
                                                        value: {
                                                            stringValue: 'some string value'
                                                        }
                                                    }
                                                ],
                                                name: 'some event',
                                                timeUnixNano: '1640715558542725376'
                                            }
                                        ],
                                        attributes: [
                                            {
                                                key: 'string-attribute',
                                                value: { stringValue: 'some attribute value' },
                                            },
                                        ],
                                        droppedAttributesCount: 0,
                                        droppedEventsCount: 0,
                                        droppedLinksCount: 0,
                                        status: {
                                            code: 'STATUS_CODE_OK',
                                        },
                                    },
                                ],
                                schemaUrl: 'http://url.to.schema',
                            },
                        ],
                    },
                ],
            };
        });

        it('returns null on an empty list', () => {
            assert.strictEqual(createExportTraceServiceRequest([]), null);
        });

        it('serializes a span', () => {
            const exportRequest = createExportTraceServiceRequest([span]);
            assert.ok(exportRequest);
            assert.deepStrictEqual(exportRequest.toJSON(), expectedSpanJson);
        });

        it('serializes a span without a parent', () => {
            (span as any).parentSpanId = undefined;
            const exportRequest = createExportTraceServiceRequest([span]);
            assert.ok(exportRequest);
            assert.strictEqual(exportRequest.toJSON().resourceSpans[0].instrumentationLibrarySpans[0].spans[0].parentSpanId, undefined);

        });

        describe('status code', () => {
            it('error', () => {
                span.status.code = SpanStatusCode.ERROR;
                span.status.message = 'error message';
                const exportRequest = createExportTraceServiceRequest([span]);
                assert.ok(exportRequest);
                const spanStatus = exportRequest.toJSON().resourceSpans[0].instrumentationLibrarySpans[0].spans[0].status;
                assert.strictEqual(spanStatus.code, 'STATUS_CODE_ERROR');
                assert.strictEqual(spanStatus.message, 'error message');
            });
    
            it('unset', () => {
                span.status.code = SpanStatusCode.UNSET;
                const exportRequest = createExportTraceServiceRequest([span]);
                assert.ok(exportRequest);
                assert.strictEqual(exportRequest.toJSON().resourceSpans[0].instrumentationLibrarySpans[0].spans[0].status.code, 'STATUS_CODE_UNSET');
            });
        });

        describe('span kind', () => {
            it('consumer', () => {
                (span as any).kind = SpanKind.CONSUMER;
                const exportRequest = createExportTraceServiceRequest([span]);
                assert.ok(exportRequest);
                assert.strictEqual(exportRequest.toJSON().resourceSpans[0].instrumentationLibrarySpans[0].spans[0].kind, 'SPAN_KIND_CONSUMER');
            });
            it('internal', () => {
                (span as any).kind = SpanKind.INTERNAL;
                const exportRequest = createExportTraceServiceRequest([span]);
                assert.ok(exportRequest);
                assert.strictEqual(exportRequest.toJSON().resourceSpans[0].instrumentationLibrarySpans[0].spans[0].kind, 'SPAN_KIND_INTERNAL');
            });
            it('producer', () => {
                (span as any).kind = SpanKind.PRODUCER;
                const exportRequest = createExportTraceServiceRequest([span]);
                assert.ok(exportRequest);
                assert.strictEqual(exportRequest.toJSON().resourceSpans[0].instrumentationLibrarySpans[0].spans[0].kind, 'SPAN_KIND_PRODUCER');
            });
            it('server', () => {
                (span as any).kind = SpanKind.SERVER;
                const exportRequest = createExportTraceServiceRequest([span]);
                assert.ok(exportRequest);
                assert.strictEqual(exportRequest.toJSON().resourceSpans[0].instrumentationLibrarySpans[0].spans[0].kind, 'SPAN_KIND_SERVER');
            });
            it('unspecified', () => {
                (span as any).kind = undefined;
                const exportRequest = createExportTraceServiceRequest([span]);
                assert.ok(exportRequest);
                assert.strictEqual(exportRequest.toJSON().resourceSpans[0].instrumentationLibrarySpans[0].spans[0].kind, 'SPAN_KIND_UNSPECIFIED');
            });
        });
    });
});
