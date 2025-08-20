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

//-----------------------------------------------------------------------------------------------------------------
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates/registry/ts-experimental/events.ts.j2
//-----------------------------------------------------------------------------------------------------------------

/**
 * This event represents an instantaneous click on the screen of an application.
 *
 * @note The `app.screen.click` event can be used to indicate that a user has clicked or tapped on the screen portion of an application. Clicks outside of an application's active area **SHOULD NOT** generate this event. This event does not differentiate between touch/mouse down and touch/mouse up. Implementations **SHOULD** give preference to generating this event at the time the click is complete, typically on touch release or mouse up. The location of the click event **MUST** be provided in absolute screen pixels.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_APP_SCREEN_CLICK = 'app.screen.click' as const;

/**
 * This event indicates that an application widget has been clicked.
 *
 * @note Use this event to indicate that visual application component has been clicked, typically through a user's manual interaction.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_APP_WIDGET_CLICK = 'app.widget.click' as const;

/**
 * Deprecated. Use `azure.resource.log` instead.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `azure.resource.log`.
 */
export const EVENT_AZ_RESOURCE_LOG = 'az.resource.log' as const;

/**
 * Describes Azure Resource Log event, see [Azure Resource Log Top-level Schema](https://learn.microsoft.com/azure/azure-monitor/essentials/resource-logs-schema#top-level-common-schema) for more details.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_AZURE_RESOURCE_LOG = 'azure.resource.log' as const;

/**
 * This event describes the website performance metrics introduced by Google, See [web vitals](https://web.dev/vitals).
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_BROWSER_WEB_VITAL = 'browser.web_vital' as const;

/**
 * This event represents an occurrence of a lifecycle transition on Android or iOS platform.
 *
 * @note The event body fields **MUST** be used to describe the state of the application at the time of the event.
 * This event is meant to be used in conjunction with `os.name` [resource semantic convention](/docs/resource/os.md) to identify the mobile operating system (e.g. Android, iOS).
 * The `android.app.state` and `ios.app.state` fields are mutually exclusive and **MUST NOT** be used together, each field **MUST** be used with its corresponding `os.name` value.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_DEVICE_APP_LIFECYCLE = 'device.app.lifecycle' as const;

/**
 * Defines feature flag evaluation as an event.
 *
 * @note A `feature_flag.evaluation` event **SHOULD** be emitted whenever a feature flag value is evaluated, which may happen many times over the course of an application lifecycle. For example, a website A/B testing different animations may evaluate a flag each time a button is clicked. A `feature_flag.evaluation` event is emitted on each evaluation even if the result is the same.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_FEATURE_FLAG_EVALUATION = 'feature_flag.evaluation' as const;

/**
 * This event describes the assistant message passed to GenAI system.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_GEN_AI_ASSISTANT_MESSAGE = 'gen_ai.assistant.message' as const;

/**
 * This event describes the Gen AI response message.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_GEN_AI_CHOICE = 'gen_ai.choice' as const;

/**
 * This event describes the system instructions passed to the GenAI model.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_GEN_AI_SYSTEM_MESSAGE = 'gen_ai.system.message' as const;

/**
 * This event describes the response from a tool or function call passed to the GenAI model.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_GEN_AI_TOOL_MESSAGE = 'gen_ai.tool.message' as const;

/**
 * This event describes the user message passed to the GenAI model.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_GEN_AI_USER_MESSAGE = 'gen_ai.user.message' as const;

/**
 * Describes a message sent or received within the context of an RPC call.
 *
 * @note In the lifetime of an RPC stream, an event for each message sent/received on client and server spans **SHOULD** be created. In case of unary calls only one sent and one received message will be recorded for both client and server spans.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_RPC_MESSAGE = 'rpc.message' as const;

/**
 * Indicates that a session has ended.
 *
 * @note For instrumentation that tracks user behavior during user sessions, a `session.end` event **SHOULD** be emitted every time a session ends. When a session ends and continues as a new session, this event **SHOULD** be emitted prior to the `session.start` event.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_SESSION_END = 'session.end' as const;

/**
 * Indicates that a new session has been started, optionally linking to the prior session.
 *
 * @note For instrumentation that tracks user behavior during user sessions, a `session.start` event **MUST** be emitted every time a session is created. When a new session is created as a continuation of a prior session, the `session.previous_id` **SHOULD** be included in the event. The values of `session.id` and `session.previous_id` **MUST** be different.
 * When the `session.start` event contains both `session.id` and `session.previous_id` fields, the event indicates that the previous session has ended. If the session ID in `session.previous_id` has not yet ended via explicit `session.end` event, then the consumer **SHOULD** treat this continuation event as semantically equivalent to `session.end(session.previous_id)` and `session.start(session.id)`.
 *
 * @experimental This event is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const EVENT_SESSION_START = 'session.start' as const;

