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
// Constant values for SemanticMetricAttributes
//----------------------------------------------------------------------------------------------------------

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_ASPNETCORE_ROUTING_MATCH_STATUS = 'aspnetcore.routing.match_status';
const TMP_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT =
  'aspnetcore.diagnostics.exception.result';
const TMP_JVM_GC_ACTION = 'jvm.gc.action';
const TMP_JVM_GC_NAME = 'jvm.gc.name';
const TMP_JVM_THREAD_DAEMON = 'jvm.thread.daemon';
const TMP_JVM_THREAD_STATE = 'jvm.thread.state';
const TMP_PROCESS_CONTEXT_SWITCH_TYPE = 'process.context_switch_type';
const TMP_PROCESS_PAGING_FAULT_TYPE = 'process.paging.fault_type';

/**
 * Match result - success or failure.
 */
export const SEMMTRCSATTRS_ASPNETCORE_ROUTING_MATCH_STATUS =
  TMP_ASPNETCORE_ROUTING_MATCH_STATUS;

/**
 * ASP.NET Core exception middleware handling result.
 */
export const SEMMTRCSATTRS_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT =
  TMP_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT;

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
 * Specifies whether the context switches for this data point were voluntary or involuntary.
 */
export const SEMMTRCSATTRS_PROCESS_CONTEXT_SWITCH_TYPE =
  TMP_PROCESS_CONTEXT_SWITCH_TYPE;

/**
 * The type of page fault for this data point. Type `major` is for major/hard page faults, and `minor` is for minor/soft page faults.
 */
export const SEMMTRCSATTRS_PROCESS_PAGING_FAULT_TYPE =
  TMP_PROCESS_PAGING_FAULT_TYPE;

/**
 * Definition of available values for SemanticMetricAttributes
 * This type is used for backward compatibility, you should use the individual exported
 * constants SemanticMetricAttributes_XXXXX rather than the exported constant map. As any single reference
 * to a constant map value will result in all strings being included into your bundle.
 * @deprecated Use the SEMMTRCSATTRS_XXXXX constants rather than the SemanticMetricAttributes.XXXXX for bundle minification.
 */
export type SemanticMetricAttributes = {
  /**
   * Match result - success or failure.
   */
  ASPNETCORE_ROUTING_MATCH_STATUS: 'aspnetcore.routing.match_status';

  /**
   * ASP.NET Core exception middleware handling result.
   */
  ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT: 'aspnetcore.diagnostics.exception.result';

  /**
   * Name of the garbage collector action.
   *
   * Note: Garbage collector action is generally obtained via [GarbageCollectionNotificationInfo#getGcAction()](https://docs.oracle.com/en/java/javase/11/docs/api/jdk.management/com/sun/management/GarbageCollectionNotificationInfo.html#getGcAction()).
   */
  JVM_GC_ACTION: 'jvm.gc.action';

  /**
   * Name of the garbage collector.
   *
   * Note: Garbage collector name is generally obtained via [GarbageCollectionNotificationInfo#getGcName()](https://docs.oracle.com/en/java/javase/11/docs/api/jdk.management/com/sun/management/GarbageCollectionNotificationInfo.html#getGcName()).
   */
  JVM_GC_NAME: 'jvm.gc.name';

  /**
   * Whether the thread is daemon or not.
   */
  JVM_THREAD_DAEMON: 'jvm.thread.daemon';

  /**
   * State of the thread.
   */
  JVM_THREAD_STATE: 'jvm.thread.state';

  /**
   * Specifies whether the context switches for this data point were voluntary or involuntary.
   */
  PROCESS_CONTEXT_SWITCH_TYPE: 'process.context_switch_type';

  /**
   * The type of page fault for this data point. Type `major` is for major/hard page faults, and `minor` is for minor/soft page faults.
   */
  PROCESS_PAGING_FAULT_TYPE: 'process.paging.fault_type';
};

/**
 * Create exported Value Map for SemanticMetricAttributes values
 * @deprecated Use the SEMMTRCSATTRS_XXXXX constants rather than the SemanticMetricAttributes.XXXXX for bundle minification
 */
export const SemanticMetricAttributes: SemanticMetricAttributes =
  /*#__PURE__*/ createConstMap<SemanticMetricAttributes>([
    TMP_ASPNETCORE_ROUTING_MATCH_STATUS,
    TMP_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT,
    TMP_JVM_GC_ACTION,
    TMP_JVM_GC_NAME,
    TMP_JVM_THREAD_DAEMON,
    TMP_JVM_THREAD_STATE,
    TMP_PROCESS_CONTEXT_SWITCH_TYPE,
    TMP_PROCESS_PAGING_FAULT_TYPE,
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
export const ASPNETCOREROUTINGMATCHSTATUSVALUES_SUCCESS =
  TMP_ASPNETCOREROUTINGMATCHSTATUSVALUES_SUCCESS;

/**
 * Match result - success or failure.
 */
export const ASPNETCOREROUTINGMATCHSTATUSVALUES_FAILURE =
  TMP_ASPNETCOREROUTINGMATCHSTATUSVALUES_FAILURE;

/**
 * Identifies the Values for AspnetcoreRoutingMatchStatusValues enum definition
 *
 * Match result - success or failure.
 * @deprecated Use the ASPNETCOREROUTINGMATCHSTATUSVALUES_XXXXX constants rather than the AspnetcoreRoutingMatchStatusValues.XXXXX for bundle minification.
 */
export type AspnetcoreRoutingMatchStatusValues = {
  /** Match succeeded. */
  SUCCESS: 'success';

  /** Match failed. */
  FAILURE: 'failure';
};

/**
 * The constant map of values for AspnetcoreRoutingMatchStatusValues.
 * @deprecated Use the ASPNETCOREROUTINGMATCHSTATUSVALUES_XXXXX constants rather than the AspnetcoreRoutingMatchStatusValues.XXXXX for bundle minification.
 */
export const AspnetcoreRoutingMatchStatusValues: AspnetcoreRoutingMatchStatusValues =
  /*#__PURE__*/ createConstMap<AspnetcoreRoutingMatchStatusValues>([
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
export const ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_HANDLED =
  TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_HANDLED;

/**
 * ASP.NET Core exception middleware handling result.
 */
export const ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_UNHANDLED =
  TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_UNHANDLED;

/**
 * ASP.NET Core exception middleware handling result.
 */
export const ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_SKIPPED =
  TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_SKIPPED;

/**
 * ASP.NET Core exception middleware handling result.
 */
export const ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_ABORTED =
  TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_ABORTED;

/**
 * Identifies the Values for AspnetcoreDiagnosticsExceptionResultValues enum definition
 *
 * ASP.NET Core exception middleware handling result.
 * @deprecated Use the ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_XXXXX constants rather than the AspnetcoreDiagnosticsExceptionResultValues.XXXXX for bundle minification.
 */
export type AspnetcoreDiagnosticsExceptionResultValues = {
  /** Exception was handled by the exception handling middleware. */
  HANDLED: 'handled';

  /** Exception was not handled by the exception handling middleware. */
  UNHANDLED: 'unhandled';

  /** Exception handling was skipped because the response had started. */
  SKIPPED: 'skipped';

  /** Exception handling didn&#39;t run because the request was aborted. */
  ABORTED: 'aborted';
};

/**
 * The constant map of values for AspnetcoreDiagnosticsExceptionResultValues.
 * @deprecated Use the ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_XXXXX constants rather than the AspnetcoreDiagnosticsExceptionResultValues.XXXXX for bundle minification.
 */
export const AspnetcoreDiagnosticsExceptionResultValues: AspnetcoreDiagnosticsExceptionResultValues =
  /*#__PURE__*/ createConstMap<AspnetcoreDiagnosticsExceptionResultValues>([
    TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_HANDLED,
    TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_UNHANDLED,
    TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_SKIPPED,
    TMP_ASPNETCOREDIAGNOSTICSEXCEPTIONRESULTVALUES_ABORTED,
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
export const JVMTHREADSTATEVALUES_TIMED_WAITING =
  TMP_JVMTHREADSTATEVALUES_TIMED_WAITING;

/**
 * State of the thread.
 */
export const JVMTHREADSTATEVALUES_TERMINATED =
  TMP_JVMTHREADSTATEVALUES_TERMINATED;

/**
 * Identifies the Values for JvmThreadStateValues enum definition
 *
 * State of the thread.
 * @deprecated Use the JVMTHREADSTATEVALUES_XXXXX constants rather than the JvmThreadStateValues.XXXXX for bundle minification.
 */
export type JvmThreadStateValues = {
  /** A thread that has not yet started is in this state. */
  NEW: 'new';

  /** A thread executing in the Java virtual machine is in this state. */
  RUNNABLE: 'runnable';

  /** A thread that is blocked waiting for a monitor lock is in this state. */
  BLOCKED: 'blocked';

  /** A thread that is waiting indefinitely for another thread to perform a particular action is in this state. */
  WAITING: 'waiting';

  /** A thread that is waiting for another thread to perform an action for up to a specified waiting time is in this state. */
  TIMED_WAITING: 'timed_waiting';

  /** A thread that has exited is in this state. */
  TERMINATED: 'terminated';
};

/**
 * The constant map of values for JvmThreadStateValues.
 * @deprecated Use the JVMTHREADSTATEVALUES_XXXXX constants rather than the JvmThreadStateValues.XXXXX for bundle minification.
 */
export const JvmThreadStateValues: JvmThreadStateValues =
  /*#__PURE__*/ createConstMap<JvmThreadStateValues>([
    TMP_JVMTHREADSTATEVALUES_NEW,
    TMP_JVMTHREADSTATEVALUES_RUNNABLE,
    TMP_JVMTHREADSTATEVALUES_BLOCKED,
    TMP_JVMTHREADSTATEVALUES_WAITING,
    TMP_JVMTHREADSTATEVALUES_TIMED_WAITING,
    TMP_JVMTHREADSTATEVALUES_TERMINATED,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for ProcessContextSwitchTypeValues enum definition
 *
 * Specifies whether the context switches for this data point were voluntary or involuntary.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_PROCESSCONTEXTSWITCHTYPEVALUES_VOLUNTARY = 'voluntary';
const TMP_PROCESSCONTEXTSWITCHTYPEVALUES_INVOLUNTARY = 'involuntary';

/**
 * Specifies whether the context switches for this data point were voluntary or involuntary.
 */
export const PROCESSCONTEXTSWITCHTYPEVALUES_VOLUNTARY =
  TMP_PROCESSCONTEXTSWITCHTYPEVALUES_VOLUNTARY;

/**
 * Specifies whether the context switches for this data point were voluntary or involuntary.
 */
export const PROCESSCONTEXTSWITCHTYPEVALUES_INVOLUNTARY =
  TMP_PROCESSCONTEXTSWITCHTYPEVALUES_INVOLUNTARY;

/**
 * Identifies the Values for ProcessContextSwitchTypeValues enum definition
 *
 * Specifies whether the context switches for this data point were voluntary or involuntary.
 * @deprecated Use the PROCESSCONTEXTSWITCHTYPEVALUES_XXXXX constants rather than the ProcessContextSwitchTypeValues.XXXXX for bundle minification.
 */
export type ProcessContextSwitchTypeValues = {
  /** voluntary. */
  VOLUNTARY: 'voluntary';

  /** involuntary. */
  INVOLUNTARY: 'involuntary';
};

/**
 * The constant map of values for ProcessContextSwitchTypeValues.
 * @deprecated Use the PROCESSCONTEXTSWITCHTYPEVALUES_XXXXX constants rather than the ProcessContextSwitchTypeValues.XXXXX for bundle minification.
 */
export const ProcessContextSwitchTypeValues: ProcessContextSwitchTypeValues =
  /*#__PURE__*/ createConstMap<ProcessContextSwitchTypeValues>([
    TMP_PROCESSCONTEXTSWITCHTYPEVALUES_VOLUNTARY,
    TMP_PROCESSCONTEXTSWITCHTYPEVALUES_INVOLUNTARY,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for ProcessPagingFaultTypeValues enum definition
 *
 * The type of page fault for this data point. Type `major` is for major/hard page faults, and `minor` is for minor/soft page faults.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_PROCESSPAGINGFAULTTYPEVALUES_MAJOR = 'major';
const TMP_PROCESSPAGINGFAULTTYPEVALUES_MINOR = 'minor';

/**
 * The type of page fault for this data point. Type `major` is for major/hard page faults, and `minor` is for minor/soft page faults.
 */
export const PROCESSPAGINGFAULTTYPEVALUES_MAJOR =
  TMP_PROCESSPAGINGFAULTTYPEVALUES_MAJOR;

/**
 * The type of page fault for this data point. Type `major` is for major/hard page faults, and `minor` is for minor/soft page faults.
 */
export const PROCESSPAGINGFAULTTYPEVALUES_MINOR =
  TMP_PROCESSPAGINGFAULTTYPEVALUES_MINOR;

/**
 * Identifies the Values for ProcessPagingFaultTypeValues enum definition
 *
 * The type of page fault for this data point. Type `major` is for major/hard page faults, and `minor` is for minor/soft page faults.
 * @deprecated Use the PROCESSPAGINGFAULTTYPEVALUES_XXXXX constants rather than the ProcessPagingFaultTypeValues.XXXXX for bundle minification.
 */
export type ProcessPagingFaultTypeValues = {
  /** major. */
  MAJOR: 'major';

  /** minor. */
  MINOR: 'minor';
};

/**
 * The constant map of values for ProcessPagingFaultTypeValues.
 * @deprecated Use the PROCESSPAGINGFAULTTYPEVALUES_XXXXX constants rather than the ProcessPagingFaultTypeValues.XXXXX for bundle minification.
 */
export const ProcessPagingFaultTypeValues: ProcessPagingFaultTypeValues =
  /*#__PURE__*/ createConstMap<ProcessPagingFaultTypeValues>([
    TMP_PROCESSPAGINGFAULTTYPEVALUES_MAJOR,
    TMP_PROCESSPAGINGFAULTTYPEVALUES_MINOR,
  ]);
