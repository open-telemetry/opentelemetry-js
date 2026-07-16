/*
 * Copyright The OpenTelemetry Authors
 * Copyright 2021 Datadog, Inc.
 * SPDX-License-Identifier: Apache-2.0
 */

// Unless explicitly stated otherwise all files in this repository are licensed under the Apache 2.0 License.
//
// This product includes software developed at Datadog (https://www.datadoghq.com/). Copyright 2021 Datadog, Inc.

import module from 'node:module';
import { register, supportsSyncHooks } from '@opentelemetry/instrumentation/register-hooks.mjs';

if (supportsSyncHooks()) {
  register();
} else {
  module.register("@opentelemetry/instrumentation/hook.mjs", import.meta.url);
}
