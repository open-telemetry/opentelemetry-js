/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Array of brand name and version separated by a space
 *
 * @example [" Not A;Brand 99", "Chromium 99", "Chrome 99"]
 *
 * @note This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.brands`).
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_BROWSER_BRANDS = 'browser.brands' as const;

/**
 * Preferred language of the user using the browser
 *
 * @example en
 * @example en-US
 * @example fr
 * @example fr-FR
 *
 * @note This value is intended to be taken from the Navigator API `navigator.language`.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_BROWSER_LANGUAGE = 'browser.language' as const;

/**
 * A boolean that is true if the browser is running on a mobile device
 *
 * @note This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.mobile`). If unavailable, this attribute **SHOULD** be left unset.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_BROWSER_MOBILE = 'browser.mobile' as const;

/**
 * The platform on which the browser is running
 *
 * @example Windows
 * @example macOS
 * @example Android
 *
 * @note This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.platform`). If unavailable, the legacy `navigator.platform` API **SHOULD NOT** be used instead and this attribute **SHOULD** be left unset in order for the values to be consistent.
 * The list of possible values is defined in the [W3C User-Agent Client Hints specification](https://wicg.github.io/ua-client-hints/#sec-ch-ua-platform). Note that some (but not all) of these values can overlap with values in the [`os.type` and `os.name` attributes](./os.md). However, for consistency, the values in the `browser.platform` attribute should capture the exact value that the user agent provides.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_BROWSER_PLATFORM = 'browser.platform' as const;
