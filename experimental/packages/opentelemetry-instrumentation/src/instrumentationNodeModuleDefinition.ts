/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  InstrumentationModuleDefinition,
  InstrumentationModuleFile,
} from './types';

export class InstrumentationNodeModuleDefinition
  implements InstrumentationModuleDefinition
{
  files: InstrumentationModuleFile[];
  public name: string;
  public supportedVersions: string[];
  public patch;
  public unpatch;
  constructor(
    name: string,
    supportedVersions: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    patch?: (exports: any, moduleVersion?: string) => any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unpatch?: (exports: any, moduleVersion?: string) => void,
    files?: InstrumentationModuleFile[]
  ) {
    this.files = files || [];
    this.name = name;
    this.supportedVersions = supportedVersions;
    this.patch = patch;
    this.unpatch = unpatch;
  }
}
