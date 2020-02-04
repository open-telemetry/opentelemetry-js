# Contributing Guide

We'd love your help!

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
```
✖   type must be one of [ci, feat, fix, docs, style, refactor, perf, test, revert, chore] [type-enum]
```
Here an exemple that will pass the verification: `git commit -s -am "chore(opentelemetry-core): update deps"`

### Fork

In the interest of keeping this repository clean and manageable, you should work from a fork. To create a fork, click the 'Fork' button at the top of the repository, then clone the fork locally using `git clone git@github.com:USERNAME/opentelemetry-js.git`.

You should also add this repository as an "upstream" repo to your local copy, in order to keep it up to date. You can add this as a remote like so:
```
git remote add upstream https://github.com/open-telemetry/opentelemetry-js.git

#verify that the upstream exists
git remote -v
```

To update your fork, fetch the upstream repo's branches and commits, then merge your master with upstream's master:
```
git fetch upstream
git checkout master
git merge upstream/master
```

Remember to always work in a branch of your local copy, as you might otherwise have to contend with conflicts in master.

Please also see [GitHub workflow](https://github.com/open-telemetry/community/blob/master/CONTRIBUTING.md#github-workflow) section of general project contributing guide.

### Running the tests

The `opentelemetry-js` project is written in TypeScript.

- `yarn install` or `npm install` to install dependencies.
- `yarn compile` or `npm run compile` compiles the code, checking for type errors.
- `yarn bootstrap` or `npm run bootstrap` Bootstrap the packages in the current Lerna repo. Installs all of their dependencies and links any cross-dependencies.
- `yarn test` or `npm test` tests code the same way that our CI will test it.
- `yarn fix` or `npm run fix` lint (and maybe fix) any changes.


### Generating API documentation
- `yarn docs` or `npm run docs` to generate API documentation. Generates the documentation in `packages/opentelemetry-api/docs/out`

### Generating CHANGELOG documentation
- `yarn changelog` or `npm run changelog` to generate CHANGELOG documentation in your terminal (see [RELEASING.md](RELEASING.md) for more details).

### Benchmarks
When two or more approaches must be compared, please write a benchmark in the benchmark/index.js module so that we can keep track of the most efficient algorithm.

- `yarn bench` or `npm run bench` to run your benchmark.
