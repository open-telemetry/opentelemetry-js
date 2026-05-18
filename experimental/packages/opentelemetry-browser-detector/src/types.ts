/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
export type UserAgentData = {
  brands: { brand: string; version: string }[];
  platform: string;
  mobile: boolean;
};

export const BROWSER_ATTRIBUTES = {
  PLATFORM: 'browser.platform', //TODO replace with SemanticConventions attribute when available
  BRANDS: 'browser.brands',
  MOBILE: 'browser.mobile',
  LANGUAGE: 'browser.language',
  USER_AGENT: 'browser.user_agent',
};
