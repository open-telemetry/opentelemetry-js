/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

//---------------------------------------------------------------------------------------------------------------------------
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv-genai/templates/registry/ts-experimental/attributes.ts.j2
//---------------------------------------------------------------------------------------------------------------------------

/**
 * The unique identifier of the AWS Bedrock Guardrail. A [guardrail](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html) helps safeguard and prevent unwanted behavior from model responses or user messages.
 *
 * @example sgi5gkybzqak
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_AWS_BEDROCK_GUARDRAIL_ID = 'aws.bedrock.guardrail.id' as const;

/**
 * The unique identifier of the AWS Bedrock Knowledge base. A [knowledge base](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html) is a bank of information that can be queried by models to generate more relevant responses and augment prompts.
 *
 * @example XFWUPB9PAW
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_AWS_BEDROCK_KNOWLEDGE_BASE_ID = 'aws.bedrock.knowledge_base.id' as const;

/**
 * Free-form description of the GenAI agent provided by the application.
 *
 * @example Helps with math problems
 * @example Generates fiction stories
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_AGENT_DESCRIPTION = 'gen_ai.agent.description' as const;

/**
 * The unique and stable identifier of the GenAI hosted agent resource.
 *
 * @example asst_5j66UpCpwteGg4YSxUnt7lPY
 * @example arn:aws:bedrock:us-east-1:123:agent/42
 * @example urn:agent:projects-123:projects:123:locations:us-east1:aiplatform:reasoningEngines:456
 *
 * @note For hosted agents, this **SHOULD** be the provider-assigned stable identifier of the agent resource such as [AWS Bedrock agent ARN](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent_Agent.html) or [GCP Agent Registry identifier](https://docs.cloud.google.com/agent-registry/concepts#agent-identifier).
 * It's NOT **RECOMMENDED** to record in-memory agent instance ids on this attribute due to their transient nature.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_AGENT_ID = 'gen_ai.agent.id' as const;

/**
 * Human-readable name of the GenAI agent provided by the application.
 *
 * @example Math Tutor
 * @example Fiction Writer
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_AGENT_NAME = 'gen_ai.agent.name' as const;

/**
 * The version of the GenAI agent.
 *
 * @example 1.0.0
 * @example 2025-05-01
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_AGENT_VERSION = 'gen_ai.agent.version' as const;

/**
 * Indicates whether the effective conversation context used for this operation is a compacted view of a prior conversation.
 *
 * @example true
 *
 * @note This attribute is a positive indicator of context compaction. Instrumentations
 * **SHOULD** set it to `true` only when they can reliably determine that context
 * compaction was applied. Instrumentations **SHOULD NOT** set it to `false`; they
 * **SHOULD** leave it unset otherwise.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_CONVERSATION_COMPACTED = 'gen_ai.conversation.compacted' as const;

/**
 * The unique identifier for a conversation (session, thread), used to store and correlate messages within this conversation.
 *
 * @example conv_5j66UpCpwteGg4YSxUnt7lPY
 *
 * @note Instrumentations **SHOULD** populate conversation id when they have an identifier
 * for the conversation readily available for a given operation, for example:
 *
 *   - when the client framework being instrumented manages conversation history
 *     (see [LlamaIndex chat store](https://docs.llamaindex.ai/en/stable/module_guides/storing/chat_stores/),
 *     [LangChain `session_id`](https://reference.langchain.com/python/langchain-core/runnables/history/RunnableWithMessageHistory),
 *     and [Google ADK sessions](https://adk.dev/sessions/session))
 *   - when instrumenting GenAI client libraries that maintain a conversation on the backend
 *     (see [AWS Bedrock agent sessions](https://docs.aws.amazon.com/bedrock/latest/userguide/agents-session-state.html),
 *     [OpenAI Assistant threads](https://platform.openai.com/docs/api-reference/threads))
 *
 * When no identifier for the conversation is available, instrumentations **SHOULD NOT**
 * populate conversation id. For example, a new UUID, a trace identifier, or a hash
 * of request content **SHOULD NOT** be used as a fallback value.
 *
 * Application developers that manage conversation history **MAY** add conversation id to GenAI and other
 * spans or logs using custom span or log record processors or hooks provided by instrumentation
 * libraries.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_CONVERSATION_ID = 'gen_ai.conversation.id' as const;

/**
 * The data source identifier.
 *
 * @example H7STPQYOND
 *
 * @note Data sources are used by AI agents and RAG applications to store grounding data. A data source may be an external database, object store, document collection, website, or any other storage system used by the GenAI agent or application. The `gen_ai.data_source.id` **SHOULD** match the identifier used by the GenAI system rather than a name specific to the external storage, such as a database or object store. Semantic conventions referencing `gen_ai.data_source.id` **MAY** also leverage additional attributes, such as `db.*`, to further identify and describe the data source.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_DATA_SOURCE_ID = 'gen_ai.data_source.id' as const;

/**
 * The number of dimensions the resulting output embeddings should have.
 *
 * @example 512
 * @example 1024
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_EMBEDDINGS_DIMENSION_COUNT = 'gen_ai.embeddings.dimension.count' as const;

/**
 * A free-form explanation for the assigned score provided by the evaluator.
 *
 * @example The response is factually accurate but lacks sufficient detail to fully address the question.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_EVALUATION_EXPLANATION = 'gen_ai.evaluation.explanation' as const;

/**
 * The name of the evaluation metric used for the GenAI response.
 *
 * @example Relevance
 * @example IntentResolution
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_EVALUATION_NAME = 'gen_ai.evaluation.name' as const;

/**
 * Human readable label for evaluation.
 *
 * @example relevant
 * @example not_relevant
 * @example correct
 * @example incorrect
 * @example pass
 * @example fail
 *
 * @note This attribute provides a human-readable interpretation of the evaluation score produced by an evaluator. For example, a score value of 1 could mean "relevant" in one evaluation system and "not relevant" in another, depending on the scoring range and evaluator. The label **SHOULD** have low cardinality. Possible values depend on the evaluation metric and evaluator used; implementations **SHOULD** document the possible values.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_EVALUATION_SCORE_LABEL = 'gen_ai.evaluation.score.label' as const;

/**
 * The evaluation score returned by the evaluator.
 *
 * @example 4.0
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_EVALUATION_SCORE_VALUE = 'gen_ai.evaluation.score.value' as const;

/**
 * The chat history provided to the model as an input.
 *
 * @example [
 * {
 * "role": "user",
 * "parts": [
 * {
 * "type": "text",
 * "content": "Weather in Paris?"
 * }
 * ]
 * },
 * {
 * "role": "assistant",
 * "parts": [
 * {
 * "type": "tool_call",
 * "id": "call_VSPygqKTWdrhaFErNvMV18Yl",
 * "name": "get_weather",
 * "arguments": {
 * "location": "Paris"
 * }
 * }
 * ]
 * },
 * {
 * "role": "tool",
 * "parts": [
 * {
 * "type": "tool_call_response",
 * "id": "call_VSPygqKTWdrhaFErNvMV18Yl",
 * "response": "rainy, 57°F"
 * }
 * ]
 * }
 * ]
 *
 * @note Messages **MUST** be provided in the order they were sent to the model.
 * Instrumentations **MAY** provide a way for users to filter or truncate
 * input messages.
 *
 * > [!Warning]
 * > This attribute is likely to contain sensitive information including user/PII data.
 *
 * See [Recording content on attributes](/docs/gen-ai/gen-ai-spans.md#recording-content-on-attributes)
 * section for more details.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_INPUT_MESSAGES = 'gen_ai.input.messages' as const;

/**
 * The search query used to retrieve memories.
 *
 * @example user dietary preferences
 * @example past flight bookings
 *
 * @note Instrumentations **SHOULD NOT** capture this attribute by default. Capture **SHOULD** be gated
 * by an explicit user opt-in, for example `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT`.
 *
 * > [!Warning]
 * > This attribute may contain sensitive information.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_MEMORY_QUERY_TEXT = 'gen_ai.memory.query.text' as const;

/**
 * The number of memory records relevant to the operation.
 *
 * @example 3
 *
 * @note For `search_memory` operations, this is the number of memory records returned by the operation. For `create_memory` operations, this is the number of memory records the operation attempted to create. For `update_memory` operations, this is the number of memory records the operation attempted to modify. For `upsert_memory` operations, this is the number of memory records the operation attempted to create or update. For `delete_memory` operations, this is the number of memory records the operation attempted to delete.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_MEMORY_RECORD_COUNT = 'gen_ai.memory.record.count' as const;

/**
 * The unique identifier of the memory record.
 *
 * @example mem_5j66UpCpwteGg4YSxUnt7lPY
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_MEMORY_RECORD_ID = 'gen_ai.memory.record.id' as const;

/**
 * The memory records stored or retrieved in a memory operation.
 *
 * @example [
 * {
 * "content": "User prefers dark mode",
 * "id": "mem_123",
 * "score": 0.95
 * },
 * {
 * "content": {
 * "preference": "vegetarian meals",
 * "confidence": 0.9
 * },
 * "metadata": {
 * "source": "profile"
 * }
 * }
 * ]
 *
 * @note Instrumentations **SHOULD NOT** capture this attribute by default. Capture **SHOULD** be gated
 * by an explicit user opt-in, for example `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT`.
 *
 * > [!Warning]
 * > This attribute may contain sensitive information including user/PII data.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_MEMORY_RECORDS = 'gen_ai.memory.records' as const;

/**
 * The unique identifier of the memory store.
 *
 * @example ms_abc123
 * @example user-preferences-store
 *
 * @note Semantic conventions for individual components **SHOULD** document what `gen_ai.memory.store.id` maps to within the implementation.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_MEMORY_STORE_ID = 'gen_ai.memory.store.id' as const;

/**
 * The name of the operation being performed.
 *
 * @note If one of the predefined values applies, but specific system uses a different name it's **RECOMMENDED** to document it in the semantic conventions for specific GenAI system and use system-specific name in the instrumentation. If a different name is not documented, instrumentation libraries **SHOULD** use applicable predefined value.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_OPERATION_NAME = 'gen_ai.operation.name' as const;

/**
 * Enum value "chat" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Chat completion operation such as [OpenAI Chat API](https://platform.openai.com/docs/api-reference/chat)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_CHAT = "chat" as const;

/**
 * Enum value "create_agent" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Create GenAI agent
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_CREATE_AGENT = "create_agent" as const;

/**
 * Enum value "create_memory" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Create new memory records
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_CREATE_MEMORY = "create_memory" as const;

/**
 * Enum value "create_memory_store" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Create or initialize a memory store
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_CREATE_MEMORY_STORE = "create_memory_store" as const;

/**
 * Enum value "delete_memory" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Delete memory records
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_DELETE_MEMORY = "delete_memory" as const;

/**
 * Enum value "delete_memory_store" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Delete or deprovision a memory store
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_DELETE_MEMORY_STORE = "delete_memory_store" as const;

/**
 * Enum value "embeddings" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Embeddings operation such as [OpenAI Create embeddings API](https://platform.openai.com/docs/api-reference/embeddings/create)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_EMBEDDINGS = "embeddings" as const;

/**
 * Enum value "execute_tool" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Execute a tool
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_EXECUTE_TOOL = "execute_tool" as const;

/**
 * Enum value "fetch_response" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Fetch a previously generated model response by its identifier, without performing inference, such as [OpenAI Get a model response](https://platform.openai.com/docs/api-reference/responses/get)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_FETCH_RESPONSE = "fetch_response" as const;

/**
 * Enum value "generate_content" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Multimodal content generation operation such as [Gemini Generate Content](https://ai.google.dev/api/generate-content)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_GENERATE_CONTENT = "generate_content" as const;

/**
 * Enum value "invoke_agent" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Invoke GenAI agent
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_INVOKE_AGENT = "invoke_agent" as const;

/**
 * Enum value "invoke_workflow" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Invoke GenAI workflow
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_INVOKE_WORKFLOW = "invoke_workflow" as const;

/**
 * Enum value "plan" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Agent planning or task decomposition phase
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_PLAN = "plan" as const;

/**
 * Enum value "retrieval" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Retrieval operation such as [OpenAI Search Vector Store API](https://platform.openai.com/docs/api-reference/vector-stores/search)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_RETRIEVAL = "retrieval" as const;

/**
 * Enum value "search_memory" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Search/query memories from a memory store
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_SEARCH_MEMORY = "search_memory" as const;

/**
 * Enum value "text_completion" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Text completions operation such as [OpenAI Completions API (Legacy)](https://platform.openai.com/docs/api-reference/completions)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_TEXT_COMPLETION = "text_completion" as const;

/**
 * Enum value "update_memory" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Update existing memory records
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_UPDATE_MEMORY = "update_memory" as const;

/**
 * Enum value "upsert_memory" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
 *
 * Create or update memory records without the caller choosing which
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OPERATION_NAME_VALUE_UPSERT_MEMORY = "upsert_memory" as const;

/**
 * Messages returned by the model where each message represents a specific model response (choice, candidate).
 *
 * @example [
 * {
 * "role": "assistant",
 * "parts": [
 * {
 * "type": "text",
 * "content": "The weather in Paris is currently rainy with a temperature of 57°F."
 * }
 * ],
 * "finish_reason": "stop"
 * }
 * ]
 *
 * @note Each message represents a single output choice/candidate generated by
 * the model. Each message corresponds to exactly one generation
 * (choice/candidate) and vice versa - one choice cannot be split across
 * multiple messages or one message cannot contain parts from multiple choices.
 *
 * Instrumentations **MAY** provide a way for users to filter or truncate
 * output messages.
 *
 * > [!Warning]
 * > This attribute is likely to contain sensitive information including user/PII data.
 *
 * See [Recording content on attributes](/docs/gen-ai/gen-ai-spans.md#recording-content-on-attributes)
 * section for more details.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_OUTPUT_MESSAGES = 'gen_ai.output.messages' as const;

/**
 * Represents the content type requested by the client.
 *
 * @note This attribute **SHOULD** be used when the client requests output of a specific type. The model may return zero or more outputs of this type.
 * This attribute specifies the output modality and not the actual output format. For example, if an image is requested, the actual output could be a URL pointing to an image file.
 * Additional output format details may be recorded in the future in the `gen_ai.output.{type}.*` attributes.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_OUTPUT_TYPE = 'gen_ai.output.type' as const;

/**
 * Enum value "image" for attribute {@link ATTR_GEN_AI_OUTPUT_TYPE}.
 *
 * Image
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OUTPUT_TYPE_VALUE_IMAGE = "image" as const;

/**
 * Enum value "json" for attribute {@link ATTR_GEN_AI_OUTPUT_TYPE}.
 *
 * JSON object with known or unknown schema
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OUTPUT_TYPE_VALUE_JSON = "json" as const;

/**
 * Enum value "speech" for attribute {@link ATTR_GEN_AI_OUTPUT_TYPE}.
 *
 * Speech
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OUTPUT_TYPE_VALUE_SPEECH = "speech" as const;

/**
 * Enum value "text" for attribute {@link ATTR_GEN_AI_OUTPUT_TYPE}.
 *
 * Plain text
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_OUTPUT_TYPE_VALUE_TEXT = "text" as const;

/**
 * The name of the prompt that uniquely identifies it.
 *
 * @example analyze-code
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_PROMPT_NAME = 'gen_ai.prompt.name' as const;

/**
 * The variables supplied to the prompt template, the `<key>` being the variable name, the value being the variable value.
 *
 * @example Alice
 * @example French
 *
 * @note Prompt templates are parameterized with variables that are filled in
 * at runtime. This attribute records the variable values passed to the
 * template. The attribute name defines the variable name, and the
 * attribute value is the variable value serialized as a string.
 *
 * Examples:
 *
 *   - A variable `user_name` with value `Alice` **SHOULD** be recorded as
 *     the `gen_ai.prompt.variable.user_name` attribute with value `"Alice"`.
 *   - A variable `language` with value `French` **SHOULD** be recorded as
 *     the `gen_ai.prompt.variable.language` attribute with value `"French"`.
 *
 * > [!Warning]
 * > This attribute may contain sensitive information.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_PROMPT_VARIABLE = (key: string) => `gen_ai.prompt.variable.${key}`;

/**
 * The version of the prompt template used.
 *
 * @example 1.0.0
 * @example 2025-05-01
 * @example prod
 * @example v2
 *
 * @note The version string can follow any versioning scheme chosen by the
 * application (e.g., SemVer, date-based, or platform-specific tags).
 * When a prompt management system is in use, this **SHOULD** match the
 * version identifier used by that system.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_PROMPT_VERSION = 'gen_ai.prompt.version' as const;

/**
 * The Generative AI provider as identified by the client or server instrumentation.
 *
 * @note Semantic conventions for individual GenAI operations **SHOULD** clarify which
 * kinds of providers (e.g. inference, embeddings, retrieval, memory, hosted
 * agent providers) apply when it is not clear from context.
 *
 * The attribute **SHOULD** be set based on the instrumentation's best knowledge
 * and may differ from the actual upstream provider. For example, a client SDK
 * may be configured against a proxy or hosting platform that transparently
 * relays requests to a different provider.
 *
 * The `gen_ai.provider.name` attribute acts as a discriminator that
 * identifies the GenAI telemetry format flavor specific to that provider
 * within GenAI semantic conventions.
 * It **SHOULD** be set consistently with provider-specific attributes and signals.
 * For example, GenAI spans, metrics, and events related to AWS Bedrock
 * should have the `gen_ai.provider.name` set to `aws.bedrock` and include
 * applicable `aws.bedrock.*` attributes and are not expected to include
 * `openai.*` attributes.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_PROVIDER_NAME = 'gen_ai.provider.name' as const;

/**
 * Enum value "anthropic" for attribute {@link ATTR_GEN_AI_PROVIDER_NAME}.
 *
 * [Anthropic](https://www.anthropic.com/)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_PROVIDER_NAME_VALUE_ANTHROPIC = "anthropic" as const;

/**
 * Enum value "aws.bedrock" for attribute {@link ATTR_GEN_AI_PROVIDER_NAME}.
 *
 * [AWS Bedrock](https://aws.amazon.com/bedrock)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_PROVIDER_NAME_VALUE_AWS_BEDROCK = "aws.bedrock" as const;

/**
 * Enum value "azure.ai.inference" for attribute {@link ATTR_GEN_AI_PROVIDER_NAME}.
 *
 * Azure AI Inference
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_PROVIDER_NAME_VALUE_AZURE_AI_INFERENCE = "azure.ai.inference" as const;

/**
 * Enum value "azure.ai.openai" for attribute {@link ATTR_GEN_AI_PROVIDER_NAME}.
 *
 * [Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_PROVIDER_NAME_VALUE_AZURE_AI_OPENAI = "azure.ai.openai" as const;

/**
 * Enum value "cohere" for attribute {@link ATTR_GEN_AI_PROVIDER_NAME}.
 *
 * [Cohere](https://cohere.com/)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_PROVIDER_NAME_VALUE_COHERE = "cohere" as const;

/**
 * Enum value "deepseek" for attribute {@link ATTR_GEN_AI_PROVIDER_NAME}.
 *
 * [DeepSeek](https://www.deepseek.com/)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_PROVIDER_NAME_VALUE_DEEPSEEK = "deepseek" as const;

/**
 * Enum value "gcp.gemini" for attribute {@link ATTR_GEN_AI_PROVIDER_NAME}.
 *
 * [Gemini](https://cloud.google.com/products/gemini)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_PROVIDER_NAME_VALUE_GCP_GEMINI = "gcp.gemini" as const;

/**
 * Enum value "gcp.gen_ai" for attribute {@link ATTR_GEN_AI_PROVIDER_NAME}.
 *
 * Any Google generative AI endpoint
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_PROVIDER_NAME_VALUE_GCP_GEN_AI = "gcp.gen_ai" as const;

/**
 * Enum value "gcp.vertex_ai" for attribute {@link ATTR_GEN_AI_PROVIDER_NAME}.
 *
 * [Vertex AI](https://cloud.google.com/vertex-ai)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_PROVIDER_NAME_VALUE_GCP_VERTEX_AI = "gcp.vertex_ai" as const;

/**
 * Enum value "groq" for attribute {@link ATTR_GEN_AI_PROVIDER_NAME}.
 *
 * [Groq](https://groq.com/)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_PROVIDER_NAME_VALUE_GROQ = "groq" as const;

/**
 * Enum value "ibm.watsonx.ai" for attribute {@link ATTR_GEN_AI_PROVIDER_NAME}.
 *
 * [IBM Watsonx AI](https://www.ibm.com/products/watsonx-ai)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_PROVIDER_NAME_VALUE_IBM_WATSONX_AI = "ibm.watsonx.ai" as const;

/**
 * Enum value "mistral_ai" for attribute {@link ATTR_GEN_AI_PROVIDER_NAME}.
 *
 * [Mistral AI](https://mistral.ai/)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_PROVIDER_NAME_VALUE_MISTRAL_AI = "mistral_ai" as const;

/**
 * Enum value "moonshot_ai" for attribute {@link ATTR_GEN_AI_PROVIDER_NAME}.
 *
 * [Moonshot AI](https://www.moonshot.ai/)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_PROVIDER_NAME_VALUE_MOONSHOT_AI = "moonshot_ai" as const;

/**
 * Enum value "openai" for attribute {@link ATTR_GEN_AI_PROVIDER_NAME}.
 *
 * [OpenAI](https://openai.com/)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_PROVIDER_NAME_VALUE_OPENAI = "openai" as const;

/**
 * Enum value "perplexity" for attribute {@link ATTR_GEN_AI_PROVIDER_NAME}.
 *
 * [Perplexity](https://www.perplexity.ai/)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_PROVIDER_NAME_VALUE_PERPLEXITY = "perplexity" as const;

/**
 * Enum value "x_ai" for attribute {@link ATTR_GEN_AI_PROVIDER_NAME}.
 *
 * [xAI](https://x.ai/)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_PROVIDER_NAME_VALUE_X_AI = "x_ai" as const;

/**
 * The target number of candidate completions to return.
 *
 * @example 3
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_REQUEST_CHOICE_COUNT = 'gen_ai.request.choice.count' as const;

/**
 * The encoding formats requested in an embeddings operation, if specified.
 *
 * @example ["base64"]
 * @example ["float", "binary"]
 *
 * @note In some GenAI systems the encoding formats are called embedding types. Also, some GenAI systems only accept a single format per request.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_REQUEST_ENCODING_FORMATS = 'gen_ai.request.encoding_formats' as const;

/**
 * The frequency penalty setting for the GenAI request.
 *
 * @example 0.1
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_REQUEST_FREQUENCY_PENALTY = 'gen_ai.request.frequency_penalty' as const;

/**
 * The maximum number of tokens the model generates for a request.
 *
 * @example 100
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_REQUEST_MAX_TOKENS = 'gen_ai.request.max_tokens' as const;

/**
 * The name of the GenAI model a request is being made to.
 *
 * @example "gpt-4"
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_REQUEST_MODEL = 'gen_ai.request.model' as const;

/**
 * The presence penalty setting for the GenAI request.
 *
 * @example 0.1
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_REQUEST_PRESENCE_PENALTY = 'gen_ai.request.presence_penalty' as const;

/**
 * The unique identifier of a previous response or interaction used to provide context for the current operation.
 *
 * @example resp_0123456789aBCdef
 * @example interaction-123
 *
 * @note Instrumentations **SHOULD** populate this attribute when the request references a previous response or interaction identifier to continue a conversation or pass prior context.
 * For example, `previous_response_id` in [OpenAI Responses API](https://developers.openai.com/api/docs/guides/conversation-state#passing-context-from-the-previous-response)
 * or `previous_interaction_id` in [Google GenAI Interactions API](https://ai.google.dev/gemini-api/docs/interactions-overview).
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_REQUEST_PREVIOUS_RESPONSE_ID = 'gen_ai.request.previous_response.id' as const;

/**
 * The reasoning or thinking effort level requested for a GenAI model.
 *
 * @example low
 * @example medium
 * @example high
 *
 * @note The value **SHOULD** be the exact string value sent to the provider.
 * Semantic conventions for individual providers **SHOULD** document which input parameter maps to this attribute.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_REQUEST_REASONING_LEVEL = 'gen_ai.request.reasoning.level' as const;

/**
 * Requests with same seed value more likely to return same result.
 *
 * @example 100
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_REQUEST_SEED = 'gen_ai.request.seed' as const;

/**
 * List of sequences that the model will use to stop generating further tokens.
 *
 * @example ["forest", "lived"]
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_REQUEST_STOP_SEQUENCES = 'gen_ai.request.stop_sequences' as const;

/**
 * Indicates whether the GenAI request was made in streaming mode.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_REQUEST_STREAM = 'gen_ai.request.stream' as const;

/**
 * The cursor identifying the last streamed event already received, used to resume a streamed response from that position.
 *
 * @example 42
 * @example event-abc123
 *
 * @note Instrumentations **SHOULD** populate this attribute when a request resumes a streamed response from a prior position, for example when fetching a stored response with streaming enabled.
 * For example, `starting_after` in the [OpenAI Responses API](https://developers.openai.com/api/docs/guides/background#streaming-a-background-response)
 * or `last_event_id` in the [Google GenAI Interactions API](https://ai.google.dev/api/interactions-api).
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_REQUEST_STREAM_CURSOR = 'gen_ai.request.stream_cursor' as const;

/**
 * The temperature setting for the GenAI request.
 *
 * @example 0.0
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_REQUEST_TEMPERATURE = 'gen_ai.request.temperature' as const;

/**
 * The top-K sampling setting for the GenAI request: restricts token generation at each step to the K most likely next tokens.
 *
 * @example 40
 *
 * @note This is a decoding/sampling parameter (e.g., Anthropic `top_k`, Cohere `k`, Google `topK`), not an output-shaping parameter. In particular, OpenAI's `top_logprobs` controls how many per-token log-probabilities are returned in the response and does not change generation; it **MUST NOT** be reported as `gen_ai.request.top_k`.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_REQUEST_TOP_K = 'gen_ai.request.top_k' as const;

/**
 * The top_p sampling setting for the GenAI request.
 *
 * @example 1.0
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_REQUEST_TOP_P = 'gen_ai.request.top_p' as const;

/**
 * Array of reasons the model stopped generating tokens, corresponding to each generation received.
 *
 * @example ["stop"]
 * @example ["stop", "length"]
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_RESPONSE_FINISH_REASONS = 'gen_ai.response.finish_reasons' as const;

/**
 * The unique identifier for the completion.
 *
 * @example chatcmpl-123
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_RESPONSE_ID = 'gen_ai.response.id' as const;

/**
 * The name of the model that generated the response.
 *
 * @example gpt-4-0613
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_RESPONSE_MODEL = 'gen_ai.response.model' as const;

/**
 * The lifecycle status of a generated response, as reported by the provider when the response is fetched or polled.
 *
 * @example completed
 * @example in_progress
 *
 * @note This attribute captures the lifecycle state of a (possibly background or long-running) generation, such as whether it is queued, still running, or has reached a terminal state. It is distinct from `gen_ai.response.finish_reasons`, which describes why the model stopped once it began producing output.
 * The value **SHOULD** be the provider's response status mapped onto the closest member of this enum or a provider-specific value when none of these apply. Semantic conventions for individual GenAI providers **SHOULD** document how their status values map to this attribute.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_RESPONSE_STATUS = 'gen_ai.response.status' as const;

/**
 * Enum value "cancelled" for attribute {@link ATTR_GEN_AI_RESPONSE_STATUS}.
 *
 * The response generation was cancelled before it completed.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_RESPONSE_STATUS_VALUE_CANCELLED = "cancelled" as const;

/**
 * Enum value "completed" for attribute {@link ATTR_GEN_AI_RESPONSE_STATUS}.
 *
 * The response finished generating successfully.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_RESPONSE_STATUS_VALUE_COMPLETED = "completed" as const;

/**
 * Enum value "failed" for attribute {@link ATTR_GEN_AI_RESPONSE_STATUS}.
 *
 * The response generation failed with an error.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_RESPONSE_STATUS_VALUE_FAILED = "failed" as const;

/**
 * Enum value "in_progress" for attribute {@link ATTR_GEN_AI_RESPONSE_STATUS}.
 *
 * The response is still being generated, for example a background or streamed response that has not finished.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_RESPONSE_STATUS_VALUE_IN_PROGRESS = "in_progress" as const;

/**
 * Enum value "incomplete" for attribute {@link ATTR_GEN_AI_RESPONSE_STATUS}.
 *
 * The response stopped before generation completed, for example because a token limit or content filter was reached.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_RESPONSE_STATUS_VALUE_INCOMPLETE = "incomplete" as const;

/**
 * Enum value "queued" for attribute {@link ATTR_GEN_AI_RESPONSE_STATUS}.
 *
 * The response has been accepted by the provider but generation has not started yet.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_RESPONSE_STATUS_VALUE_QUEUED = "queued" as const;

/**
 * Time to first chunk in a streaming response, measured from request issuance, in seconds. The value is measured from when the client issues the generation request to when the first chunk is received in the response stream.
 *
 * @example 0.5
 * @example 1.2
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_RESPONSE_TIME_TO_FIRST_CHUNK = 'gen_ai.response.time_to_first_chunk' as const;

/**
 * The documents retrieved.
 *
 * @example [
 * {
 * "id": "doc_123",
 * "score": 0.95
 * },
 * {
 * "id": "doc_456",
 * "score": 0.87
 * },
 * {
 * "id": "doc_789",
 * "score": 0.82
 * }
 * ]
 *
 * @note Each document object **SHOULD** contain the following properties when available:
 * `id` (string): A unique identifier for the document, `score` (double): The relevance score of the document
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_RETRIEVAL_DOCUMENTS = 'gen_ai.retrieval.documents' as const;

/**
 * The query text used for retrieval.
 *
 * @example What is the capital of France?
 * @example weather in Paris
 *
 * @note > [!Warning]
 *
 * > This attribute may contain sensitive information.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_RETRIEVAL_QUERY_TEXT = 'gen_ai.retrieval.query.text' as const;

/**
 * The maximum number of documents the retriever was asked to return for the query (also known as `k`, `limit`, or `max_num_results`).
 *
 * @example 5
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_RETRIEVAL_TOP_K = 'gen_ai.retrieval.top_k' as const;

/**
 * The system message or instructions provided to the GenAI model separately from the chat history.
 *
 * @example [
 * {
 * "type": "text",
 * "content": "You are an Agent that greet users, always use greetings tool to respond"
 * }
 * ]
 *
 * @example [
 * {
 * "type": "text",
 * "content": "You are a language translator."
 * },
 * {
 * "type": "text",
 * "content": "Your mission is to translate text in English to French."
 * }
 * ]
 *
 * @note This attribute **SHOULD** be used when the corresponding provider or API
 * allows to provide system instructions or messages separately from the
 * chat history.
 *
 * Instructions that are part of the chat history **SHOULD** be recorded in
 * `gen_ai.input.messages` attribute instead.
 *
 * Instrumentations **MAY** provide a way for users to filter or truncate
 * system instructions.
 *
 * > [!Warning]
 * > This attribute may contain sensitive information.
 *
 * See [Recording content on attributes](/docs/gen-ai/gen-ai-spans.md#recording-content-on-attributes)
 * section for more details.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_SYSTEM_INSTRUCTIONS = 'gen_ai.system_instructions' as const;

/**
 * The type of token being counted.
 *
 * @example input
 * @example output
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_TOKEN_TYPE = 'gen_ai.token.type' as const;

/**
 * Enum value "input" for attribute {@link ATTR_GEN_AI_TOKEN_TYPE}.
 *
 * Input tokens (prompt, input, etc.)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_TOKEN_TYPE_VALUE_INPUT = "input" as const;

/**
 * Enum value "output" for attribute {@link ATTR_GEN_AI_TOKEN_TYPE}.
 *
 * Output tokens (completion, response, etc.)
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const GEN_AI_TOKEN_TYPE_VALUE_OUTPUT = "output" as const;

/**
 * Parameters passed to the tool call.
 *
 * @example {
 * "location": "San Francisco?",
 * "date": "2025-10-01"
 * }
 *
 * @note > [!WARNING]
 *
 * > This attribute may contain sensitive information.
 *
 * It's expected to be an object - in case a serialized string is available
 * to the instrumentation, the instrumentation **SHOULD** do the best effort to
 * deserialize it to an object.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_TOOL_CALL_ARGUMENTS = 'gen_ai.tool.call.arguments' as const;

/**
 * The tool call identifier.
 *
 * @example call_mszuSIzqtI65i1wAUOE8w5H4
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_TOOL_CALL_ID = 'gen_ai.tool.call.id' as const;

/**
 * The result returned by the tool call (if any and if execution was successful).
 *
 * @example {
 * "temperature_range": {
 * "high": 75,
 * "low": 60
 * },
 * "conditions": "sunny"
 * }
 *
 * @note > [!WARNING]
 *
 * > This attribute may contain sensitive information.
 *
 * It's expected to be an object - in case a serialized string is available
 * to the instrumentation, the instrumentation **SHOULD** do the best effort to
 * deserialize it to an object.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_TOOL_CALL_RESULT = 'gen_ai.tool.call.result' as const;

/**
 * The list of tool definitions available to the GenAI agent or model.
 *
 * @example [
 * {
 * "type": "function",
 * "name": "get_current_weather",
 * "description": "Get the current weather in a given location",
 * "parameters": {
 * "type": "object",
 * "properties": {
 * "location": {
 * "type": "string",
 * "description": "The city and state, e.g. San Francisco, CA"
 * },
 * "unit": {
 * "type": "string",
 * "enum": [
 * "celsius",
 * "fahrenheit"
 * ]
 * }
 * },
 * "required": [
 * "location",
 * "unit"
 * ]
 * }
 * }
 * ]
 *
 * @note > [!WARNING]
 *
 * > This attribute may contain sensitive information.
 *
 * Since this attribute could be large, it's NOT **RECOMMENDED** to populate
 * non-required properties by default. Instrumentations **MAY** provide a way
 * to enable populating optional properties.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_TOOL_DEFINITIONS = 'gen_ai.tool.definitions' as const;

/**
 * The tool description.
 *
 * @example Multiply two numbers
 *
 * @note > [!WARNING]
 *
 * > This attribute may contain sensitive information.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_TOOL_DESCRIPTION = 'gen_ai.tool.description' as const;

/**
 * Name of the tool utilized by the agent.
 *
 * @example Flights
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_TOOL_NAME = 'gen_ai.tool.name' as const;

/**
 * Type of the tool utilized by the agent
 *
 * @example function
 * @example extension
 * @example datastore
 *
 * @note Extension: A tool executed on the agent-side to directly call external APIs, bridging the gap between the agent and real-world systems.
 * Agent-side operations involve actions that are performed by the agent on the server or within the agent's controlled environment.
 * Function: A tool executed on the client-side, where the agent generates parameters for a predefined function, and the client executes the logic.
 * Client-side operations are actions taken on the user's end or within the client application.
 * Datastore: A tool used by the agent to access and query structured or unstructured external data for retrieval-augmented tasks or knowledge updates.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_TOOL_TYPE = 'gen_ai.tool.type' as const;

/**
 * The number of input tokens written to a provider-managed cache.
 *
 * @example 25
 *
 * @note The value **SHOULD** be included in `gen_ai.usage.input_tokens`.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS = 'gen_ai.usage.cache_creation.input_tokens' as const;

/**
 * The number of input tokens served from a provider-managed cache.
 *
 * @example 50
 *
 * @note The value **SHOULD** be included in `gen_ai.usage.input_tokens`.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS = 'gen_ai.usage.cache_read.input_tokens' as const;

/**
 * The number of tokens used in the GenAI input (prompt).
 *
 * @example 100
 *
 * @note This value **SHOULD** include all types of input tokens, including cached tokens.
 * Instrumentations **SHOULD** make a best effort to populate this value, using a total
 * provided by the provider when available or, depending on the provider API,
 * by summing different token types parsed from the provider output.
 *
 * When the provider reports both billed token counts and model-consumed
 * token counts (for example, Cohere exposes both `usage.billed_units` and
 * `usage.tokens`), instrumentations **SHOULD** report the billed count so the
 * value matches the units the customer is charged for.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_USAGE_INPUT_TOKENS = 'gen_ai.usage.input_tokens' as const;

/**
 * The number of tokens used in the GenAI response (completion).
 *
 * @example 180
 *
 * @note When the provider reports both billed token counts and model-consumed
 * token counts (for example, Cohere exposes both `usage.billed_units` and
 * `usage.tokens`), instrumentations **SHOULD** report the billed count so the
 * value matches the units the customer is charged for.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_USAGE_OUTPUT_TOKENS = 'gen_ai.usage.output_tokens' as const;

/**
 * The number of output tokens used for reasoning (e.g. chain-of-thought, extended thinking).
 *
 * @example 50
 *
 * @note The value **SHOULD** be included in `gen_ai.usage.output_tokens`.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_USAGE_REASONING_OUTPUT_TOKENS = 'gen_ai.usage.reasoning.output_tokens' as const;

/**
 * Human-readable name of the GenAI workflow provided by the application.
 *
 * @example multi_agent_rag
 * @example customer_support_pipeline
 *
 * @note The workflow name is usually a static, application-unique identifier defined
 * in a framework-specific way.
 *
 * For example, it can be the name of the first chain in LangChain,
 * the name of the crew in CrewAI, or the entry point agent in ADK or
 * OpenAI Agents when no explicit workflow name is provided.
 *
 * This attribute **MUST** have low cardinality. It is NOT **RECOMMENDED** to use
 * instrumentation-time constants or names of types representing the workflow,
 * such as "StateGraph". When no meaningful, low-cardinality workflow name is
 * available for a given framework, this attribute **MUST NOT** be captured by default.
 *
 * Semantic conventions for individual Generative AI frameworks **SHOULD** document
 * what `gen_ai.workflow.name` means in the context of that framework.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_GEN_AI_WORKFLOW_NAME = 'gen_ai.workflow.name' as const;

/**
 * The name of the request or notification method.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_MCP_METHOD_NAME = 'mcp.method.name' as const;

/**
 * Enum value "completion/complete" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Request to complete a prompt.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_COMPLETION_COMPLETE = "completion/complete" as const;

/**
 * Enum value "elicitation/create" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Request from the server to elicit additional information from the user via the client
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_ELICITATION_CREATE = "elicitation/create" as const;

/**
 * Enum value "initialize" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Request to initialize the MCP client.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_INITIALIZE = "initialize" as const;

/**
 * Enum value "logging/setLevel" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Request to set the logging level.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_LOGGING_SET_LEVEL = "logging/setLevel" as const;

/**
 * Enum value "notifications/cancelled" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Notification cancelling a previously-issued request.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_NOTIFICATIONS_CANCELLED = "notifications/cancelled" as const;

/**
 * Enum value "notifications/initialized" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Notification indicating that the MCP client has been initialized.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_NOTIFICATIONS_INITIALIZED = "notifications/initialized" as const;

/**
 * Enum value "notifications/message" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Notification indicating that a message has been received.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_NOTIFICATIONS_MESSAGE = "notifications/message" as const;

/**
 * Enum value "notifications/progress" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Notification indicating the progress for a long-running operation.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_NOTIFICATIONS_PROGRESS = "notifications/progress" as const;

/**
 * Enum value "notifications/prompts/list_changed" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Notification indicating that the list of prompts has changed.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_NOTIFICATIONS_PROMPTS_LIST_CHANGED = "notifications/prompts/list_changed" as const;

/**
 * Enum value "notifications/resources/list_changed" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Notification indicating that the list of resources has changed.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_NOTIFICATIONS_RESOURCES_LIST_CHANGED = "notifications/resources/list_changed" as const;

/**
 * Enum value "notifications/resources/updated" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Notification indicating that a resource has been updated.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_NOTIFICATIONS_RESOURCES_UPDATED = "notifications/resources/updated" as const;

/**
 * Enum value "notifications/roots/list_changed" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Notification indicating that the list of roots has changed.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_NOTIFICATIONS_ROOTS_LIST_CHANGED = "notifications/roots/list_changed" as const;

/**
 * Enum value "notifications/tools/list_changed" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Notification indicating that the list of tools has changed.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_NOTIFICATIONS_TOOLS_LIST_CHANGED = "notifications/tools/list_changed" as const;

/**
 * Enum value "ping" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Request to check that the other party is still alive.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_PING = "ping" as const;

/**
 * Enum value "prompts/get" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Request to get a prompt.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_PROMPTS_GET = "prompts/get" as const;

/**
 * Enum value "prompts/list" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Request to list prompts available on server.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_PROMPTS_LIST = "prompts/list" as const;

/**
 * Enum value "resources/list" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Request to list resources available on server.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_RESOURCES_LIST = "resources/list" as const;

/**
 * Enum value "resources/read" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Request to read a resource.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_RESOURCES_READ = "resources/read" as const;

/**
 * Enum value "resources/subscribe" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Request to subscribe to a resource.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_RESOURCES_SUBSCRIBE = "resources/subscribe" as const;

/**
 * Enum value "resources/templates/list" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Request to list resource templates available on server.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_RESOURCES_TEMPLATES_LIST = "resources/templates/list" as const;

/**
 * Enum value "resources/unsubscribe" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Request to unsubscribe from resource updates.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_RESOURCES_UNSUBSCRIBE = "resources/unsubscribe" as const;

/**
 * Enum value "roots/list" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Request to list roots available on server.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_ROOTS_LIST = "roots/list" as const;

/**
 * Enum value "sampling/createMessage" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Request to create a sampling message.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_SAMPLING_CREATE_MESSAGE = "sampling/createMessage" as const;

/**
 * Enum value "tools/call" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Request to call a tool.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_TOOLS_CALL = "tools/call" as const;

/**
 * Enum value "tools/list" for attribute {@link ATTR_MCP_METHOD_NAME}.
 *
 * Request to list tools available on server.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const MCP_METHOD_NAME_VALUE_TOOLS_LIST = "tools/list" as const;

/**
 * The [version](https://modelcontextprotocol.io/specification/versioning) of the Model Context Protocol used.
 *
 * @example 2025-06-18
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_MCP_PROTOCOL_VERSION = 'mcp.protocol.version' as const;

/**
 * The value of the resource uri.
 *
 * @example postgres://database/customers/schema
 * @example file:///home/user/documents/report.pdf
 *
 * @note This is a URI of the resource provided in the following requests or notifications: `resources/read`, `resources/subscribe`, `resources/unsubscribe`, or `notifications/resources/updated`.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_MCP_RESOURCE_URI = 'mcp.resource.uri' as const;

/**
 * Identifies [MCP session](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#session-management).
 *
 * @example 191c4850af6c49e08843a3f6c80e5046
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_MCP_SESSION_ID = 'mcp.session.id' as const;

/**
 * The type of OpenAI API being used.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_OPENAI_API_TYPE = 'openai.api.type' as const;

/**
 * Enum value "chat_completions" for attribute {@link ATTR_OPENAI_API_TYPE}.
 *
 * The OpenAI [Chat Completions API](https://developers.openai.com/api/reference/chat-completions/overview).
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const OPENAI_API_TYPE_VALUE_CHAT_COMPLETIONS = "chat_completions" as const;

/**
 * Enum value "responses" for attribute {@link ATTR_OPENAI_API_TYPE}.
 *
 * The OpenAI [Responses API](https://developers.openai.com/api/reference/responses/overview).
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const OPENAI_API_TYPE_VALUE_RESPONSES = "responses" as const;

/**
 * The service tier requested. May be a specific tier, default, or auto.
 *
 * @example auto
 * @example default
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_OPENAI_REQUEST_SERVICE_TIER = 'openai.request.service_tier' as const;

/**
 * Enum value "auto" for attribute {@link ATTR_OPENAI_REQUEST_SERVICE_TIER}.
 *
 * The system will utilize scale tier credits until they are exhausted.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const OPENAI_REQUEST_SERVICE_TIER_VALUE_AUTO = "auto" as const;

/**
 * Enum value "default" for attribute {@link ATTR_OPENAI_REQUEST_SERVICE_TIER}.
 *
 * The system will utilize the default scale tier.
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const OPENAI_REQUEST_SERVICE_TIER_VALUE_DEFAULT = "default" as const;

/**
 * The service tier used for the response.
 *
 * @example scale
 * @example default
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_OPENAI_RESPONSE_SERVICE_TIER = 'openai.response.service_tier' as const;

/**
 * A fingerprint to track any eventual change in the Generative AI environment.
 *
 * @example fp_44709d6fcb
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions-genai`.
 */
export const ATTR_OPENAI_RESPONSE_SYSTEM_FINGERPRINT = 'openai.response.system_fingerprint' as const;

