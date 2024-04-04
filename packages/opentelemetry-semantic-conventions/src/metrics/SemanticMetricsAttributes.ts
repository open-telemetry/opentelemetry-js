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

import { createConstMap } from '../internal/utils';

//----------------------------------------------------------------------------------------------------------
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates//templates/SemanticAttributes.ts.j2
//----------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------
// Constant values for SemanticMetricsAttributes
//----------------------------------------------------------------------------------------------------------

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_ASPNETCORE_ROUTING_MATCH_STATUS = 'aspnetcore.routing.match_status';
const TMP_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT = 'aspnetcore.diagnostics.exception.result';
const TMP_DNS_QUESTION_NAME = 'dns.question.name';
const TMP_HTTP_CONNECTION_STATE = 'http.connection.state';
const TMP_JVM_GC_ACTION = 'jvm.gc.action';
const TMP_JVM_GC_NAME = 'jvm.gc.name';
const TMP_JVM_THREAD_DAEMON = 'jvm.thread.daemon';
const TMP_JVM_THREAD_STATE = 'jvm.thread.state';

/**
* Match result - success or failure.
*/
export const SEMMTRCSATTRS_ASPNETCORE_ROUTING_MATCH_STATUS = TMP_ASPNETCORE_ROUTING_MATCH_STATUS;

/**
* ASP.NET Core exception middleware handling result.
*/
export const SEMMTRCSATTRS_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT = TMP_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT;

/**
* The name being queried.
*
* Note: The name being queried.
If the name field contains non-printable characters (below 32 or above 126), those characters should be represented as escaped base 10 integers (\DDD). Back slashes and quotes should be escaped. Tabs, carriage returns, and line feeds should be converted to \t, \r, and \n respectively.
*/
export const SEMMTRCSATTRS_DNS_QUESTION_NAME = TMP_DNS_QUESTION_NAME;

/**
* State of the HTTP connection in the HTTP connection pool.
*/
export const SEMMTRCSATTRS_HTTP_CONNECTION_STATE = TMP_HTTP_CONNECTION_STATE;

/**
* Name of the garbage collector action.
*
* Note: Garbage collector action is generally obtained via [GarbageCollectionNotificationInfo#getGcAction()](https://docs.oracle.com/en/java/javase/11/docs/api/jdk.management/com/sun/management/GarbageCollectionNotificationInfo.html#getGcAction()).
*/
export const SEMMTRCSATTRS_JVM_GC_ACTION = TMP_JVM_GC_ACTION;

/**
* Name of the garbage collector.
*
* Note: Garbage collector name is generally obtained via [GarbageCollectionNotificationInfo#getGcName()](https://docs.oracle.com/en/java/javase/11/docs/api/jdk.management/com/sun/management/GarbageCollectionNotificationInfo.html#getGcName()).
*/
export const SEMMTRCSATTRS_JVM_GC_NAME = TMP_JVM_GC_NAME;

/**
* Whether the thread is daemon or not.
*/
export const SEMMTRCSATTRS_JVM_THREAD_DAEMON = TMP_JVM_THREAD_DAEMON;

/**
* State of the thread.
*/
export const SEMMTRCSATTRS_JVM_THREAD_STATE = TMP_JVM_THREAD_STATE;

/**
 * Definition of available values for SemanticMetricsAttributes
 * This type is used for backward compatibility, you should use the individual exported
 * constants SemanticMetricsAttributes_XXXXX rather than the exported constant map. As any single reference
 * to a constant map value will result in all strings being included into your bundle.
 * @deprecated Use the SEMMTRCSATTRS_XXXXX constants rather than the SemanticMetricsAttributes.XXXXX for bundle minification.
 */
export type SemanticMetricsAttributes = {

  /**
  * Match result - success or failure.
  */
  ASPNETCORE_ROUTING_MATCH_STATUS: 'aspnetcore.routing.match_status',

  /**
  * ASP.NET Core exception middleware handling result.
  */
  ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT: 'aspnetcore.diagnostics.exception.result',

  /**
  * The name being queried.
  *
  * Note: The name being queried.
If the name field contains non-printable characters (below 32 or above 126), those characters should be represented as escaped base 10 integers (\DDD). Back slashes and quotes should be escaped. Tabs, carriage returns, and line feeds should be converted to \t, \r, and \n respectively.
  */
  DNS_QUESTION_NAME: 'dns.question.name',

  /**
  * State of the HTTP connection in the HTTP connection pool.
  */
  HTTP_CONNECTION_STATE: 'http.connection.state',

  /**
  * Name of the garbage collector action.
  *
  * Note: Garbage collector action is generally obtained via [GarbageCollectionNotificationInfo#getGcAction()](https://docs.oracle.com/en/java/javase/11/docs/api/jdk.management/com/sun/management/GarbageCollectionNotificationInfo.html#getGcAction()).
  */
  JVM_GC_ACTION: 'jvm.gc.action',

  /**
  * Name of the garbage collector.
  *
  * Note: Garbage collector name is generally obtained via [GarbageCollectionNotificationInfo#getGcName()](https://docs.oracle.com/en/java/javase/11/docs/api/jdk.management/com/sun/management/GarbageCollectionNotificationInfo.html#getGcName()).
  */
  JVM_GC_NAME: 'jvm.gc.name',

  /**
  * Whether the thread is daemon or not.
  */
  JVM_THREAD_DAEMON: 'jvm.thread.daemon',

  /**
  * State of the thread.
  */
  JVM_THREAD_STATE: 'jvm.thread.state',
};

/**
 * Create exported Value Map for SemanticMetricsAttributes values
 * @deprecated Use the SEMMTRCSATTRS_XXXXX constants rather than the SemanticMetricsAttributes.XXXXX for bundle minification
 */
export const SemanticMetricsAttributes:SemanticMetricsAttributes = /*#__PURE__*/createConstMap<SemanticMetricsAttributes>([
  TMP_ASPNETCORE_ROUTING_MATCH_STATUS,
  TMP_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT,
  TMP_DNS_QUESTION_NAME,
  TMP_HTTP_CONNECTION_STATE,
  TMP_JVM_GC_ACTION,
  TMP_JVM_GC_NAME,
  TMP_JVM_THREAD_DAEMON,
  TMP_JVM_THREAD_STATE,
]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for AspnetcoreRoutingMatchStatusValues enum definition
 *
 * Match result - success or failure.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_ASPNETCOREROUTINGMATCHSTATUSVALUES_SUCCESS = 'success';
const TMP_ASPNETCOREROUTINGMATCHSTATUSVALUES_FAILURE = 'failure';

/**
 * Match result - success or failure.
 */
export const ASPNETCOREROUTINGMATCHSTATUSVALUES_SUCCESS = TMP_ASPNETCOREROUTINGMATCHSTATUSVALUES_SUCCESS;

/**
 * Match result - success or failure.
 */
export const ASPNETCOREROUTINGMATCHSTATUSVALUES_FAILURE = TMP_ASPNETCOREROUTINGMATCHSTATUSVALUES_FAILURE;

/**
 * Identifies the Values for AspnetcoreRoutingMatchStatusValues enum definition
 *
 * Match result - success or failure.
 * @deprecated Use the ASPNETCOREROUTINGMATCHSTATUSVALUES_XXXXX constants rather than the AspnetcoreRoutingMatchStatusValues.XXXXX for bundle minification.
 */
export type AspnetcoreRoutingMatchStatusValues = {

  /** Match succeeded. */
  SUCCESS: 'success',

  /** Match failed. */
  FAILURE: 'failure',
}

/**
 * The constant map of values for AspnetcoreRoutingMatchStatusValues.
 * @deprecated Use the ASPNETCOREROUTINGMATCHSTATUSVALUES_XXXXX constants rather than the AspnetcoreRoutingMatchStatusValues.XXXXX for bundle minification.
 */
export const AspnetcoreRoutingMatchStatusValues:AspnetcoreRoutingMatchStatusValues = /*#__PURE__*/createConstMap<AspnetcoreRoutingMatchStatusValues>([
  TMP_ASPNETCOREROUTINGMATCHSTATUSVALUES_SUCCESS,
  TMP_ASPNETCOREROUTINGMATCHSTATUSVALUES_FAILURE,
]);



/* ----------------------------------------------------------------------------------------------------------
 * Constant values for AspnetcoreDiagnosticsExceptionResultValues enum definition
 *
 * ASP.NET Core exception middleware handling result.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_HANDLED = 'handled';
const TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_UNHANDLED = 'unhandled';
const TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_SKIPPED = 'skipped';
const TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_ABORTED = 'aborted';

/**
 * ASP.NET Core exception middleware handling result.
 */
export const ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_HANDLED = TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_HANDLED;

/**
 * ASP.NET Core exception middleware handling result.
 */
export const ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_UNHANDLED = TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_UNHANDLED;

/**
 * ASP.NET Core exception middleware handling result.
 */
export const ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_SKIPPED = TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_SKIPPED;

/**
 * ASP.NET Core exception middleware handling result.
 */
export const ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_ABORTED = TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_ABORTED;

/**
 * Identifies the Values for AspnetcoreDiagnosticsExceptionResultValues enum definition
 *
 * ASP.NET Core exception middleware handling result.
 * @deprecated Use the ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_XXXXX constants rather than the AspnetcoreDiagnosticsExceptionResultValues.XXXXX for bundle minification.
 */
export type AspnetcoreDiagnosticsExceptionResultValues = {

  /** Exception was handled by the exception handling middleware. */
  HANDLED: 'handled',

  /** Exception was not handled by the exception handling middleware. */
  UNHANDLED: 'unhandled',

  /** Exception handling was skipped because the response had started. */
  SKIPPED: 'skipped',

  /** Exception handling didn&#39;t run because the request was aborted. */
  ABORTED: 'aborted',
}

/**
 * The constant map of values for AspnetcoreDiagnosticsExceptionResultValues.
 * @deprecated Use the ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_XXXXX constants rather than the AspnetcoreDiagnosticsExceptionResultValues.XXXXX for bundle minification.
 */
export const AspnetcoreDiagnosticsExceptionResultValues:AspnetcoreDiagnosticsExceptionResultValues = /*#__PURE__*/createConstMap<AspnetcoreDiagnosticsExceptionResultValues>([
  TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_HANDLED,
  TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_UNHANDLED,
  TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_SKIPPED,
  TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_ABORTED,
]);



/* ----------------------------------------------------------------------------------------------------------
 * Constant values for HttpConnectionStateValues enum definition
 *
 * State of the HTTP connection in the HTTP connection pool.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_HTTPCONNECTIONSTATEVALUES_ACTIVE = 'active';
const TMP_HTTPCONNECTIONSTATEVALUES_IDLE = 'idle';

/**
 * State of the HTTP connection in the HTTP connection pool.
 */
export const HTTPCONNECTIONSTATEVALUES_ACTIVE = TMP_HTTPCONNECTIONSTATEVALUES_ACTIVE;

/**
 * State of the HTTP connection in the HTTP connection pool.
 */
export const HTTPCONNECTIONSTATEVALUES_IDLE = TMP_HTTPCONNECTIONSTATEVALUES_IDLE;

/**
 * Identifies the Values for HttpConnectionStateValues enum definition
 *
 * State of the HTTP connection in the HTTP connection pool.
 * @deprecated Use the HTTPCONNECTIONSTATEVALUES_XXXXX constants rather than the HttpConnectionStateValues.XXXXX for bundle minification.
 */
export type HttpConnectionStateValues = {

  /** active state. */
  ACTIVE: 'active',

  /** idle state. */
  IDLE: 'idle',
}

/**
 * The constant map of values for HttpConnectionStateValues.
 * @deprecated Use the HTTPCONNECTIONSTATEVALUES_XXXXX constants rather than the HttpConnectionStateValues.XXXXX for bundle minification.
 */
export const HttpConnectionStateValues:HttpConnectionStateValues = /*#__PURE__*/createConstMap<HttpConnectionStateValues>([
  TMP_HTTPCONNECTIONSTATEVALUES_ACTIVE,
  TMP_HTTPCONNECTIONSTATEVALUES_IDLE,
]);



/* ----------------------------------------------------------------------------------------------------------
 * Constant values for JvmThreadStateValues enum definition
 *
 * State of the thread.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_JVMTHREADSTATEVALUES_NEW = 'new';
const TMP_JVMTHREADSTATEVALUES_RUNNABLE = 'runnable';
const TMP_JVMTHREADSTATEVALUES_BLOCKED = 'blocked';
const TMP_JVMTHREADSTATEVALUES_WAITING = 'waiting';
const TMP_JVMTHREADSTATEVALUES_TIMED_WAITING = 'timed_waiting';
const TMP_JVMTHREADSTATEVALUES_TERMINATED = 'terminated';

/**
 * State of the thread.
 */
export const JVMTHREADSTATEVALUES_NEW = TMP_JVMTHREADSTATEVALUES_NEW;

/**
 * State of the thread.
 */
export const JVMTHREADSTATEVALUES_RUNNABLE = TMP_JVMTHREADSTATEVALUES_RUNNABLE;

/**
 * State of the thread.
 */
export const JVMTHREADSTATEVALUES_BLOCKED = TMP_JVMTHREADSTATEVALUES_BLOCKED;

/**
 * State of the thread.
 */
export const JVMTHREADSTATEVALUES_WAITING = TMP_JVMTHREADSTATEVALUES_WAITING;

/**
 * State of the thread.
 */
export const JVMTHREADSTATEVALUES_TIMED_WAITING = TMP_JVMTHREADSTATEVALUES_TIMED_WAITING;

/**
 * State of the thread.
 */
export const JVMTHREADSTATEVALUES_TERMINATED = TMP_JVMTHREADSTATEVALUES_TERMINATED;

/**
 * Identifies the Values for JvmThreadStateValues enum definition
 *
 * State of the thread.
 * @deprecated Use the JVMTHREADSTATEVALUES_XXXXX constants rather than the JvmThreadStateValues.XXXXX for bundle minification.
 */
export type JvmThreadStateValues = {

  /** A thread that has not yet started is in this state. */
  NEW: 'new',

  /** A thread executing in the Java virtual machine is in this state. */
  RUNNABLE: 'runnable',

  /** A thread that is blocked waiting for a monitor lock is in this state. */
  BLOCKED: 'blocked',

  /** A thread that is waiting indefinitely for another thread to perform a particular action is in this state. */
  WAITING: 'waiting',

  /** A thread that is waiting for another thread to perform an action for up to a specified waiting time is in this state. */
  TIMED_WAITING: 'timed_waiting',

  /** A thread that has exited is in this state. */
  TERMINATED: 'terminated',
}

/**
 * The constant map of values for JvmThreadStateValues.
 * @deprecated Use the JVMTHREADSTATEVALUES_XXXXX constants rather than the JvmThreadStateValues.XXXXX for bundle minification.
 */
export const JvmThreadStateValues:JvmThreadStateValues = /*#__PURE__*/createConstMap<JvmThreadStateValues>([
  TMP_JVMTHREADSTATEVALUES_NEW,
  TMP_JVMTHREADSTATEVALUES_RUNNABLE,
  TMP_JVMTHREADSTATEVALUES_BLOCKED,
  TMP_JVMTHREADSTATEVALUES_WAITING,
  TMP_JVMTHREADSTATEVALUES_TIMED_WAITING,
  TMP_JVMTHREADSTATEVALUES_TERMINATED,
]);

