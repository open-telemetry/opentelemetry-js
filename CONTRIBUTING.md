# Contributing Guide

We'd love your help!

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

Here an exemple that will pass the verification: `git commit -s -am "chore(opentelemetry-core): update deps"`

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
- [gts](https://github.com/google/gts)
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

### Linting

This project uses a combination of `gts` and `eslint`. Just like tests and compilation, linting can be done for all packages or only a single package.

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

### Adding a package

To add a new package, copy `packages/template` to your new package directory and modify the `package.json` file to reflect your desired package settings. If the package will not support browser, the `karma.conf` and `tsconifg.esm.json` files may be deleted. If the package will support es5 targets, the reference to `tsconfig.base.json` in `tsconfig.json` should be changed to `tsconfig.es5.json`.

After adding the package, run `npm install` from the root of the project. This will update the `tsconfig.json` project references automatically and install all dependencies in your new package. For packages supporting browser, file `tsconfig.esm.json` needs to be manually updated to include reference to ES modules build.

### Guidelines for Pull Requests

- Typically we try to turn around reviews within one to two business days.
- It is generally expected that a maintainer ([@open-telemetry/javascript-maintainers](https://github.com/orgs/open-telemetry/teams/javascript-maintainers)) should review and merge every PR.
  - If a change has met the requirements listed below, an approver may also merge the pull request.
- Most PRs should be merged in one to two weeks.
- If a PR is taking longer than 30 days, please ping the approvers ([@open-telemetry/javascript-approvers](https://github.com/orgs/open-telemetry/teams/javascript-approvers)) as it may have been lost
- Dependency upgrades and Security fixes: This PR is small and/or low-risk and can be merged with only maintainer reviews.
- If your patch is not getting reviewed or you need a specific person to review it, you can @username or @open-telemetry/javascript-approvers a reviewer asking for a review in the pull request.
- API changes, breaking changes, or large changes will be subject to more scrutiny and may require more reviewers. These PRs should only be merged by maintainers.
- Changes to existing plugins and exporters will typically require the approval of the original plugin/exporter author.

### General Merge Requirements

- All requirements are at the discretion of the maintainers.
  - Maintainers may merge pull requests which have not strictly met these requirements.
  - Maintainers may close, block, or put on hold pull requests even if they have strictly met these requirements.
- No “changes requested” reviews.
- No unresolved conversations.
- 3 approvals, including the approvals of at least 2 maintainers
  - A pull request opened by an approver may be merged with only the 2 maintainer reviews.
  - Small (simple typo, URL, update docs, or grammatical fix) or high-priority changes may be merged more quickly or with fewer reviewers at the discretion of the maintainers. This is typically indicated with the express label.
- For plugins, exporters, and propagators approval of the original code module author is preferred but not required.
- New or changed functionality is tested by unit tests.
- New or changed functionality is documented.
- Substantial changes should not be merged within 24 hours of opening in order to allow reviewers from all time zones to have a chance to review.

If all of the above requirements are met and there are no unresolved discussions, a pull request may be merged by either a maintainer or an approver.

### Generating API documentation

- `npm run docs` to generate API documentation. Generates the documentation in `packages/opentelemetry-api/docs/out`

### Generating CHANGELOG documentation

- Generate and export your [Github access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token): `export GITHUB_AUTH=<your_token>`
- `npm run changelog` to generate CHANGELOG documentation in your terminal (see [RELEASING.md](RELEASING.md) for more details).

### Benchmarks

When two or more approaches must be compared, please write a benchmark in the benchmark/index.js module so that we can keep track of the most efficient algorithm.

- `npm run bench` to run your benchmark.
