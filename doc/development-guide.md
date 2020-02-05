# Development Guide

Before contributing to this open source project, read our [CONTRIBUTING](../CONTRIBUTING.md). We gratefully welcome improvements to documentation as well as to code.

The code base is a monorepo. We use [Lerna](https://lerna.js.org/) for managing inter-module dependencies, which makes it easier to develop coordinated changes between the modules. Instead of running lerna directly, the commands are wrapped with `npm`;

### Requirements

Since this project supports multiple Node versions, using a version
manager such as [nvm](https://github.com/creationix/nvm) is recommended.

To get started once you have Node installed, run:

```sh
$ npm install
```

This will install all the necessary modules.

### Testing

#### Unit Tests

To run the all unit tests, use:

```sh
$ npm run test
```

To run the unit tests continuously in watch mode while developing, use:

```sh
$ npm run tdd
```

### Linting

We use [gts](https://www.npmjs.com/package/gts) to make sure that new code is conform to our coding standards.

Before raising a pull request, make sure there are no lint problems.

To check the linter, use:
```sh
$ npm run check
```

To fix the linter, use:
```sh
$ npm run fix
```

### Continuous Integration

We rely on CircleCI 2.0 for our tests. If you want to test how the CI behaves
locally, you can use the CircleCI Command Line Interface as described here:
https://circleci.com/docs/2.0/local-jobs/

After installing the `circleci` CLI, simply run one of the following:

```sh
$ circleci build --job lint
$ circleci build --job node8
$ circleci build --job node10
$ circleci build --job node11
$ circleci build --job node12
$ circleci build --job node12-browsers
```

### Docs

We use [typedoc](https://www.npmjs.com/package/typedoc) to generate the api documentation.

To generate the docs, use:
```sh
$ npm run docs
```

The document will be available under `packages/opentelemetry-api/docs/out` path.
