/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A scope token returned by attach() that restores the previous Context when
 * disposed. Mirrors {@link ContextManagementToken} from \@opentelemetry/api ≥1.10.0;
 * duplicated here so the package remains compatible with older API peer
 * dependency versions.
 *
 * @internal
 */
export interface ContextManagementToken {
  dispose(): void;
}
