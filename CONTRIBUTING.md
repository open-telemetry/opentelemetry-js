# Contributing Guide

We'd love your help!

- [Development Quick Start](#development-quick-start)
- [Pull Request Merge Guidelines](#pull-request-merge-guidelines)
  - [General Merge Requirements](#general-merge-requirements)
- [Report a bug or requesting feature](#report-a-bug-or-requesting-feature)
- [How to contribute](#how-to-contribute)
  - [Before you start](#before-you-start)
    - [Conventional commit](#conventional-commit)
  - [Changelog](#changelog)
  - [Fork](#fork)
- [Development](#development)
  - [Tools used](#tools-used)
  - [Install dependencies](#install-dependencies)
  - [Compile modules](#compile-modules)
  - [Running tests](#running-tests)
  - [Linting](#linting)
  - [Generating docs](#generating-docs)
  - [Adding a package](#adding-a-package)
  - [Platform conditional exports](#platform-conditional-exports)

## Development Quick Start

To get the project started quickly, you can follow these steps. For more
detailed instructions, see [development](#development) below.

```sh
git clone https://github.com/open-telemetry/opentelemetry-js.git
cd opentelemetry-js
npm install
npm run compile
npm test
```

## Pull Request Merge Guidelines

Most pull requests MAY be merged by an approver OR a maintainer provided they meet the following [General Merge Requirements](#general-merge-requirements).
All requirements are at the discretion of the maintainers.
Maintainers MAY merge pull requests which have not strictly met these requirements.
Maintainers MAY close, block, or put on hold pull requests even if they have strictly met these requirements.

It is generally expected that a maintainer ([@open-telemetry/javascript-maintainers](https://github.com/orgs/open-telemetry/teams/javascript-maintainers)) should review and merge major changes.
Some examples include, but are not limited to:

- API changes
- Breaking changes
- New modules
- Changes which affect runtime support
- New features which are not required by the specification

If a PR has not been interacted with by a reviewer within one week, please ping the approvers ([@open-telemetry/javascript-approvers](https://github.com/orgs/open-telemetry/teams/javascript-approvers)).

### General Merge Requirements

- No “changes requested” reviews by approvers, maintainers, technical committee members, or subject matter experts
- No unresolved conversations
- Approved by at least one maintainer OR by at least one approver who is not the approver merging the pull request
  - A pull request for small (simple typo, URL, update docs, or grammatical fix) changes may be approved and merged by the same approver
- For plugins, exporters, and propagators approval of the original code module author, or a contributor who has done extensive work on the module, is preferred but not required
- New or changed functionality is tested by unit tests
- New or changed functionality is documented if appropriate
- Substantial changes should not be merged within 24 hours of opening in order to allow reviewers from all time zones to have a chance to review

If all of the above requirements are met and there are no unresolved discussions, a pull request may be merged by either a maintainer or an approver.

## Report a bug or requesting feature

Reporting bugs is an important contribution. Please make sure to include:

- expected and actual behavior.
- Node version that application is running.
- OpenTelemetry version that application is using.
- if possible - repro application and steps to reproduce.

## How to contribute

### Before you start

Please read project contribution
[guide](https://github.com/open-telemetry/community/blob/master/CONTRIBUTING.md)
for general practices for OpenTelemetry project.

#### Conventional commit

The Conventional Commits specification is a lightweight convention on top of commit messages. It provides an easy set of rules for creating an explicit commit history; which makes it easier to write automated tools on top of. This convention dovetails with SemVer, by describing the features, fixes, and breaking changes made in commit messages. You can see examples [here](https://www.conventionalcommits.org/en/v1.0.0-beta.4/#examples).
We use [commitlint](https://github.com/conventional-changelog/commitlint) and [husky](https://github.com/typicode/husky) to prevent bad commit message.
For example, you want to submit the following commit message `git commit -s -am "my bad commit"`.
You will receive the following error :

```text
✖   type must be one of [ci, feat, fix, docs, style, refactor, perf, test, revert, chore] [type-enum]
```

Here an example that will pass the verification: `git commit -s -am "chore(opentelemetry-core): update deps"`

### Changelog

An entry into `CHANGELOG.md` or `experimental/CHANGELOG.md` is required for the following reasons:

- Changes made to the behaviour of the component
- Changes to the configuration
- Changes to default settings
- New components being added

It is reasonable to omit an entry to the changelog under these circuimstances:

- Updating test to remove flakiness or improve coverage
- Updates to the CI/CD process

If there is some uncertainty with regards to if a changelog entry is needed, the recommendation is to create an entry to in the event that the change is important to the project consumers.
If a change does not require a changelog entry, the label `"Skip Changelog"` may be applied.
Pull requests with the `dependencies` label will be skipped by the changelog CI check.
If the change affects the overall project and not any individual package, it should usually go in the main changelog.
Changelog entries should be in the following format:

```md
* feat(subject): pull request title here #{pull request number} @{author github handle}
```

Subject should describe the area of the project that was changed as descriptively as is possible in a short space.
For example, this may be the package name if a single package was updated or just `metrics` if both the metrics API and SDK are affected.

### Fork

In the interest of keeping this repository clean and manageable, you should work from a fork. To create a fork, click the 'Fork' button at the top of the repository, then clone the fork locally using `git clone git@github.com:USERNAME/opentelemetry-js.git`.

You should also add this repository as an "upstream" repo to your local copy, in order to keep it up to date. You can add this as a remote like so:

```sh
git remote add upstream https://github.com/open-telemetry/opentelemetry-js.git

#verify that the upstream exists
git remote -v
```

To update your fork, fetch the upstream repo's branches and commits, then merge your main with upstream's main:

```sh
git fetch upstream
git checkout main
git merge upstream/main
```

Remember to always work in a branch of your local copy, as you might otherwise have to contend with conflicts in main.

Please also see [GitHub workflow](https://github.com/open-telemetry/community/blob/master/CONTRIBUTING.md#github-workflow) section of general project contributing guide.

## Development

### Tools used

- [NPM](https://npmjs.com)
- [TypeScript](https://www.typescriptlang.org/)
- [lerna](https://github.com/lerna/lerna) to manage dependencies, compilations, and links between packages. Most lerna commands should be run by calling the provided npm scripts.
- [MochaJS](https://mochajs.org/) for tests
- [eslint](https://eslint.org/)

Most of the commands needed for development are accessed as [npm scripts](https://docs.npmjs.com/cli/v6/using-npm/scripts). It is recommended that you use the provided npm scripts instead of using `lerna run` in most cases.

### Install dependencies

This will install all dependencies for the root project and all modules managed by `lerna`. By default, a `postinstall` script will run `lerna bootstrap` automatically after an install. This can be avoided using the `--ignore-scripts` option if desired.

```sh
npm install
```

### Compile modules

All modules are managed as a composite typescript project using [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html). This means that a breaking change in one module will be reflected in compilations of its dependent modules automatically.

DO NOT use lerna to compile all modules unless you know what you are doing because this will cause a new typescript process to be spawned for every module in the project.

```sh
# Build all modules
npm run compile

# Remove compiled output
npm run clean
```

These commands can also be run for specific packages instead of the whole project, which can speed up compilations while developing.

**NOTE**: To run commands in specific packages (compile, lint, etc), please ensure you are using at least `7.x`
version of `npm`.

```sh
# Build a single module and all of its dependencies
cd packages/opentelemetry-module-name
npm run compile
```

Finally, builds can be run continuously as files change using the `watch` npm script.

```sh
# Build all modules
npm run watch

# Build a single module and all of its dependencies
cd packages/opentelemetry-module-name
npm run watch
```

### Running tests

Similar to compilations, tests can be run from the root to run all tests or from a single module to run only the tests for that module.

```sh
# Test all modules
npm test

# Test a single module
cd packages/opentelemetry-module-name
npm test
```

To run the unit tests continuously in watch mode while developing, use:

```sh
# Run test in watch mode
npm run tdd
```

### Linting

This project uses `eslint` to lint source code. Just like tests and compilation, linting can be done for all packages or only a single package.

```sh
# Lint all modules
npm run lint

# Lint a single module
cd packages/opentelemetry-module-name
npm run lint
```

There is also a script which will automatically fix many linting errors.

```sh
# Lint all modules, fixing errors
npm run lint:fix

# Lint a single module, fixing errors
cd packages/opentelemetry-module-name
npm run lint:fix
```

### Generating docs

We use [typedoc](https://www.npmjs.com/package/typedoc) to generate the api documentation.

To generate the docs, use:

```sh
# Generate docs in the root 'docs' directory
npm run docs
```

The document will be available under `docs` path.

### Adding a package

To add a new package, copy `packages/template` to your new package directory and modify the `package.json` file to reflect your desired package settings. If the package will not support browser, the `karma.conf` and `tsconifg.esm.json` files may be deleted. If the package will support es5 targets, the reference to `tsconfig.base.json` in `tsconfig.json` should be changed to `tsconfig.es5.json`.

After adding the package, run `npm install` from the root of the project. This will update the `tsconfig.json` project references automatically and install all dependencies in your new package. For packages supporting browser, file `tsconfig.esm.json` needs to be manually updated to include reference to ES modules build.

### Platform conditional exports

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
