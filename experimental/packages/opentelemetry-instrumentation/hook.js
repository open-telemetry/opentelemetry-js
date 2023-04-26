/*!
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Unless explicitly stated otherwise all files in this repository are licensed under the Apache 2.0 License.
//
// This product includes software developed at Datadog (https://www.datadoghq.com/). Copyright 2021 Datadog, Inc.

const specifiers = new Map();
const isWin = process.platform === 'win32';

// FIXME: Typescript extensions are added temporarily until we find a better
// way of supporting arbitrary extensions
const EXTENSION_RE = /\.(js|mjs|cjs|ts|mts|cts)$/;
const NODE_VERSION = process.versions.node.split('.');
const NODE_MAJOR = Number(NODE_VERSION[0]);
const NODE_MINOR = Number(NODE_VERSION[1]);

let entrypoint;

function hasIitm(url) {
  try {
    return new URL(url).searchParams.has('iitm');
  } catch {
    return false;
  }
}

function isIitm(url, meta) {
  return url === meta.url || url === meta.url.replace('hook.mjs', 'hook.js');
}

function deleteIitm(url) {
  let resultUrl;
  try {
    const urlObj = new URL(url);
    if (urlObj.searchParams.has('iitm')) {
      urlObj.searchParams.delete('iitm');
      resultUrl = urlObj.href;
      if (resultUrl.startsWith('file:node:')) {
        resultUrl = resultUrl.replace('file:', '');
      }
      if (resultUrl.startsWith('file:///node:')) {
        resultUrl = resultUrl.replace('file:///', '');
      }
    } else {
      resultUrl = urlObj.href;
    }
  } catch {
    resultUrl = url;
  }
  return resultUrl;
}

function isNode16AndBiggerOrEqualsThan16_17_0() {
  return NODE_MAJOR === 16 && NODE_MINOR >= 17;
}

function isFileProtocol(urlObj) {
  return urlObj.protocol === 'file:';
}

function isNodeProtocol(urlObj) {
  return urlObj.protocol === 'node:';
}

function needsToAddFileProtocol(urlObj) {
  if (NODE_MAJOR === 17) {
    return !isFileProtocol(urlObj);
  }
  if (isNode16AndBiggerOrEqualsThan16_17_0()) {
    return !isFileProtocol(urlObj) && !isNodeProtocol(urlObj);
  }
  return !isFileProtocol(urlObj) && NODE_MAJOR < 18;
}

function addIitm(url) {
  const urlObj = new URL(url);
  urlObj.searchParams.set('iitm', 'true');
  return needsToAddFileProtocol(urlObj) ? 'file:' + urlObj.href : urlObj.href;
}

async function createHook(meta) {
  async function resolve(specifier, context, parentResolve) {
    const { parentURL = '' } = context;
    const newSpecifier = deleteIitm(specifier);
    if (isWin && parentURL.indexOf('file:node') === 0) {
      context.parentURL = '';
    }
    const url = await parentResolve(newSpecifier, context, parentResolve);
    if (parentURL === '' && !EXTENSION_RE.test(url.url)) {
      entrypoint = url.url;
      return { url: url.url, format: 'commonjs' };
    }

    if (isIitm(parentURL, meta) || hasIitm(parentURL)) {
      return url;
    }

    if (context.importAssertions && context.importAssertions.type === 'json') {
      return url;
    }

    specifiers.set(url.url, specifier);

    return {
      url: addIitm(url.url),
      shortCircuit: true,
    };
  }

  const iitmURL = await meta.resolve('import-in-the-middle/lib/register.js');
  async function getSource(url, context, parentGetSource) {
    if (hasIitm(url)) {
      const realUrl = deleteIitm(url);
      const realModule = await import(realUrl);
      const exportNames = Object.keys(realModule);
      return {
        source: `
import { register } from '${iitmURL}'
import * as namespace from '${url}'
const set = {}
${exportNames
  .map(
    n => `
let $${n} = namespace.${n}
export { $${n} as ${n} }
set.${n} = (v) => {
  $${n} = v
  return true
}
`
  )
  .join('\n')}
register('${realUrl}', namespace, set, '${specifiers.get(realUrl)}')
`,
      };
    }

    return parentGetSource(url, context, parentGetSource);
  }

  // For Node.js 16.12.0 and higher.
  async function load(url, context, parentLoad) {
    if (hasIitm(url)) {
      const { source } = await getSource(url, context);
      return {
        source,
        shortCircuit: true,
        format: 'module',
      };
    }

    return parentLoad(url, context, parentLoad);
  }

  if (NODE_MAJOR >= 20) {
    process.emitWarning(
      'import-in-the-middle is currently unsupported on Node.js v20 and has been disabled.'
    );
    return {}; // TODO: Add support for Node >=20
  } else if (NODE_MAJOR >= 17 || (NODE_MAJOR === 16 && NODE_MINOR >= 12)) {
    return { load, resolve };
  } else {
    return {
      load,
      resolve,
      getSource,
      getFormat(url, context, parentGetFormat) {
        if (hasIitm(url)) {
          return {
            format: 'module',
          };
        }
        if (url === entrypoint) {
          return {
            format: 'commonjs',
          };
        }

        return parentGetFormat(url, context, parentGetFormat);
      },
    };
  }
}

module.exports = { createHook };
