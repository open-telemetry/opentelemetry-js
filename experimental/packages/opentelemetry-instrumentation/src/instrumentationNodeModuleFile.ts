/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { InstrumentationModuleFile } from './types';
import { normalize } from './platform/index';

export class InstrumentationNodeModuleFile
  implements InstrumentationModuleFile
{
  public name: string;
  public supportedVersions: string[];
  public patch;
  public unpatch;

  constructor(
    name: string,
    supportedVersions: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    patch: (moduleExports: any, moduleVersion?: string) => any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unpatch: (moduleExports?: any, moduleVersion?: string) => void
  ) {
    this.name = normalize(name);
    this.supportedVersions = supportedVersions;
    this.patch = patch;
    this.unpatch = unpatch;
  }
}
