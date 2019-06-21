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
