/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as dns from 'dns';

export const checkInternet = (cb: (isConnected: boolean) => void) => {
  dns.lookup('google.com', err => {
    if (err && err.code === 'ENOTFOUND') {
      cb(false);
    } else {
      cb(true);
    }
  });
};
