/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserAgentData = {
  brands: { brand: string; version: string }[];
  platform: string;
  mobile: boolean;
};
