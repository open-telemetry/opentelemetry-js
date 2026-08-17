/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

//-----------------------------------------------------------------------------------------------------------------------
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv-genai/templates/registry/ts-experimental/events.ts.j2
//-----------------------------------------------------------------------------------------------------------------------

/**
 * Describes the details of a GenAI completion request including chat history and parameters.
 *
 * @note This event could be used to store input and output details independently from traces.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const EVENT_GEN_AI_CLIENT_INFERENCE_OPERATION_DETAILS = 'gen_ai.client.inference.operation.details' as const;

/**
 * This event represents an exception that occurred during a Generative AI client operation, such as API errors, rate limiting, model errors, timeouts, or other errors that prevent the operation from completing successfully.
 *
 * @note This event **SHOULD** be recorded when an exception occurs during Generative AI client operations.
 * Instrumentations **SHOULD** set the severity to WARN (severity number 13) when recording this event.
 * Instrumentations **MAY** provide a configuration option to populate exception events with the attributes captured on the corresponding Generative AI client span.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const EVENT_GEN_AI_CLIENT_OPERATION_EXCEPTION = 'gen_ai.client.operation.exception' as const;

/**
 * This event captures the result of evaluating GenAI output for quality, accuracy, or other characteristics. This event **SHOULD** be parented to GenAI operation span being evaluated when possible or set `gen_ai.response.id` when span id is not available.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const EVENT_GEN_AI_EVALUATION_RESULT = 'gen_ai.evaluation.result' as const;

