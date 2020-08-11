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

/**
 * The operating system (OS) on which the process represented by this resource is running.
 *
 * In case of virtualized environments, this is the operating system as it
 * is observed by the process, i.e., the virtualized guest rather than the
 * underlying host.
 * https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/resource/semantic_conventions/os.md
 */
export const OperatingSystem = {
  /**
   * The operating system type.
   * This should be set to one of {@link OperatingSystemValues}
   * E.g., "WINDOWS"
   *
   * @remarks
   * Required.
   */
  TYPE: 'os.type',
  /**
   * Human readable (not intended to be parsed) OS version information.
   * E.g., "Microsoft Windows [Version 10.0.18363.778]"
   *
   * @remarks
   * Required if applicable.
   */
  DESCRIPTION: 'os.description',
};

/**
 * {@link OperatingSystem.TYPE} SHOULD be set to one of the values
 * listed below.
 * If none of the listed values apply, a custom value best describing
 * the family the operating system belongs to CAN be used.
 */
export const OperatingSystemValues = {
  WINDOWS: 'WINDOWS',
  LINUX: 'LINUX',
  DARWIN: 'DARWIN',
  FREEBSD: 'FREEBSD',
  NETBSD: 'NETBSD',
  OPENBSD: 'OPENBSD',
  DRAGONFLYBSD: 'DRAGONFLYBSD',
  HPUX: 'HPUX',
  AIX: 'AIX',
  SOLARIS: 'SOLARIS',
  ZOS: 'ZOS',
};
