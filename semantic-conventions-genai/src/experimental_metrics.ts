/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

//------------------------------------------------------------------------------------------------------------------------
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv-genai/templates/registry/ts-experimental/metrics.ts.j2
//------------------------------------------------------------------------------------------------------------------------

/**
 * GenAI operation duration.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const METRIC_GEN_AI_CLIENT_OPERATION_DURATION = 'gen_ai.client.operation.duration' as const;

/**
 * Time per output chunk, recorded for each chunk received after the first one, measured as the time elapsed from the end of the previous chunk to the end of the current chunk.
 *
 * @note This metrics **SHOULD** be reported for streaming calls and **SHOULD NOT** be reported otherwise.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const METRIC_GEN_AI_CLIENT_OPERATION_TIME_PER_OUTPUT_CHUNK = 'gen_ai.client.operation.time_per_output_chunk' as const;

/**
 * Time to receive the first chunk, measured from when the client issues the generation request to when the first chunk is received in the response stream.
 *
 * @note This metrics **SHOULD** be reported for streaming calls and **SHOULD NOT** be reported otherwise.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const METRIC_GEN_AI_CLIENT_OPERATION_TIME_TO_FIRST_CHUNK = 'gen_ai.client.operation.time_to_first_chunk' as const;

/**
 * Number of input and output tokens used.
 *
 * @note This metric **SHOULD** be reported when an operation involves the usage  of tokens and the count is readily available.
 * For example, if GenAI system returns usage information in the streaming response,  it **SHOULD** be used. Or if GenAI system returns each token independently,  instrumentation **SHOULD** count number of output tokens and record the result.
 * If instrumentation cannot efficiently obtain number of input and/or output tokens, it **MAY** allow users to enable offline token counting. Otherwise it **MUST NOT** report usage metric.
 * When systems report both used tokens and billable tokens, instrumentation **MUST** report billable tokens.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const METRIC_GEN_AI_CLIENT_TOKEN_USAGE = 'gen_ai.client.token.usage' as const;

/**
 * The duration of a single tool execution.
 *
 * @note Instrumentation that can reliably bound a single tool call **SHOULD**
 * record this metric for every tool execution they can observe.
 *
 * When this metric is reported alongside a `gen_ai.execute_tool` span,
 * the metric value **SHOULD** be the same as the span duration.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const METRIC_GEN_AI_EXECUTE_TOOL_DURATION = 'gen_ai.execute_tool.duration' as const;

/**
 * The end-to-end duration of a single in-process agent invocation, from the moment the invocation starts until the agent emits the last chunk of its final response or terminates with an error.
 *
 * @note Intended for instrumentations of agent frameworks (for example, ADK,
 * LangChain agents, CrewAI agents) that can reliably bound a single
 * agent invocation.
 *
 * If instrumentation can only measure a single provider-facing client
 * operation (for example, one model API call),
 * `gen_ai.client.operation.duration` **SHOULD** be used instead. If
 * instrumentation can reliably bound a higher-level workflow that
 * coordinates multiple agents, `gen_ai.invoke_workflow.duration` **SHOULD** be
 * used for that workflow. Instrumentation **MAY** emit several of these
 * metrics for the same request path when more than one boundary is
 * available.
 *
 * When this metric is reported alongside a `gen_ai.invoke_agent.internal`
 * span, the metric value **SHOULD** be the same as the span duration.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const METRIC_GEN_AI_INVOKE_AGENT_DURATION = 'gen_ai.invoke_agent.duration' as const;

/**
 * The number of inference (model) calls a GenAI agent makes during a single invocation.
 *
 * @note The distribution is scoped to a single agent invocation and **SHOULD** include
 * only the inference calls the agent itself issued including failed ones;
 * calls made by sub-agents or transferred-to agents are recorded against
 * those agents' own invocations so that each inference call is counted
 * exactly once across the call tree.
 *
 * This metric **SHOULD** be emitted together with the
 * `gen_ai.invoke_agent.internal` span for the same invocation.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const METRIC_GEN_AI_INVOKE_AGENT_INFERENCE_CALLS = 'gen_ai.invoke_agent.inference_calls' as const;

/**
 * The number of tool calls a GenAI agent makes during a single invocation.
 *
 * @note The distribution is scoped to a single agent invocation and **SHOULD** include
 * only the tool calls the agent itself triggers including failed ones;
 * calls made by sub-agents or transferred-to agents are recorded against
 * those agents' own invocations so that each tool call is counted exactly
 * once across the call tree.
 *
 * Only client-side tool calls (tools executed by the agent or framework)
 * are counted. Tools executed server-side by the model provider (for
 * example, provider built-in web search or code execution) are not
 * counted here.
 *
 * This metric **SHOULD** be emitted together with the
 * `gen_ai.invoke_agent.internal` span for the same invocation.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const METRIC_GEN_AI_INVOKE_AGENT_TOOL_CALLS = 'gen_ai.invoke_agent.tool_calls' as const;

/**
 * Records duration of GenAI workflow.
 *
 * @note Represents the end-to-end duration of a workflow execution, measured from the point where application code initiates the workflow to the point where the workflow completes, independent of workflow complexity.
 * A workflow is a coordinated process composed of multiple agents or other operations involving generative AI.
 * If instrumentation measures only a single provider-facing client operation (for example, one model API call), `gen_ai.client.operation.duration` **SHOULD** be used instead. Instrumentation **MAY** emit both metrics for the same request path when both boundaries are available.
 * When this metric is reported alongside a `gen_ai.invoke_workflow.internal` span, the metric value **SHOULD** be the same as the span duration.
 * Individual systems may include additional system-specific attributes. Refer to system-specific documentation, if available.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const METRIC_GEN_AI_INVOKE_WORKFLOW_DURATION = 'gen_ai.invoke_workflow.duration' as const;

/**
 * Generative AI server request duration such as time-to-last byte or last output token.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const METRIC_GEN_AI_SERVER_REQUEST_DURATION = 'gen_ai.server.request.duration' as const;

/**
 * Time per output token generated after the first token for successful responses.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const METRIC_GEN_AI_SERVER_TIME_PER_OUTPUT_TOKEN = 'gen_ai.server.time_per_output_token' as const;

/**
 * Time to generate first token for successful responses.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const METRIC_GEN_AI_SERVER_TIME_TO_FIRST_TOKEN = 'gen_ai.server.time_to_first_token' as const;

/**
 * The duration of the MCP request or notification as observed on the sender from the time it was sent until the response or ack is received.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const METRIC_MCP_CLIENT_OPERATION_DURATION = 'mcp.client.operation.duration' as const;

/**
 * The duration of the MCP session as observed on the MCP client.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const METRIC_MCP_CLIENT_SESSION_DURATION = 'mcp.client.session.duration' as const;

/**
 * MCP request or notification duration as observed on the receiver from the time it was received until the result or ack is sent.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const METRIC_MCP_SERVER_OPERATION_DURATION = 'mcp.server.operation.duration' as const;

/**
 * The duration of the MCP session as observed on the MCP server.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const METRIC_MCP_SERVER_SESSION_DURATION = 'mcp.server.session.duration' as const;

