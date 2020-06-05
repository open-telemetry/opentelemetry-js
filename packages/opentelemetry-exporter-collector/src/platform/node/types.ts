/*!
 * Copyright 2020, OpenTelemetry Authors
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

import * as grpc from 'grpc';
import { ReadableSpan } from '@opentelemetry/tracing';
import { CollectorExporterError } from '../../types';

/**
 * Queue item to be used to save temporary spans in case the GRPC service
 * hasn't been fully initialised yet
 */
export interface GRPCQueueItem {
  spans: ReadableSpan[];
  onSuccess: () => void;
  onError: (error: CollectorExporterError) => void;
}

/**
 * Trace Service Client for sending spans
 */
export interface TraceServiceClient extends grpc.Client {
  export: (request: any, callback: Function) => {};
}
