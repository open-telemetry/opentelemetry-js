/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export const randomSamplingProability = () => {
  const rand = Math.random() + 0.01;
  return rand > 1 ? rand - 0.01 : rand;
};
