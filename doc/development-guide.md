# Development Guide

Before contributing to this open source project, read our [CONTRIBUTING](../CONTRIBUTING.md). We gratefully welcome improvements to documentation as well as to code.

The code base is a monorepo. We use [Lerna](https://lerna.js.org/) for managing inter-module dependencies, which makes it easier to develop coordinated changes between the modules. Instead of running lerna directly, the commands are wrapped with `npm`;

## Requirements

Since this project supports multiple Node versions, using a version
manager such as [nvm](https://github.com/nvm-sh/nvm) is recommended.

To get started once you have Node installed, run:

```sh
npm install
```

This will install all the necessary modules.

## Testing

### Unit Tests

To run the all unit tests, use:

```sh
npm run test
```

To run the unit tests continuously in watch mode while developing, use:

```sh
npm run tdd
```

## Linting

We use [gts](https://www.npmjs.com/package/gts) to make sure that new code is conform to our coding standards.

Before raising a pull request, make sure there are no lint problems.

To check the linter, use:

```sh
npm run lint
```

To fix the linter, use:

```sh
npm run lint:fix
```

## Docs

We use [typedoc](https://www.npmjs.com/package/typedoc) to generate the api documentation.

To generate the docs, use:

```sh
npm run docs
```

The document will be available under `packages/opentelemetry-api/docs/out` path.

## Platform conditional exports

Universal packages are packages that can be used in both web browsers and
Node.js environment. These packages may be implemented on top of different
platform APIs to achieve the same goal. Like accessing the _global_ reference,
we have different preferred ways to do it:

- In Node.js, we access the _global_ reference with `globalThis` or `global`:

```js
/// packages/opentelemetry-core/src/platform/node/globalThis.ts
export const _globalThis = typeof globalThis === 'object' ? globalThis : global;
```

- In web browser, we access the _global_ reference with the following definition:

```js
/// packages/opentelemetry-core/src/platform/browser/globalThis.ts
export const _globalThis: typeof globalThis =
  typeof globalThis === 'object' ? globalThis :
  typeof self === 'object' ? self :
  typeof window === 'object' ? window :
  typeof global === 'object' ? global :
  {} as typeof globalThis;
```

Even though the implementation may differ, the exported names must be aligned.
It can be confusing if exported names present in one environment but not in the
others.
