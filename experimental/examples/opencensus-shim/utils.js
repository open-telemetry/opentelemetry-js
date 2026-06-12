/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exports.sleep = sleep;
