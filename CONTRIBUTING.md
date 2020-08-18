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

To update your fork, fetch the upstream repo's branches and commits, then merge your master with upstream's master:

```sh
git fetch upstream
git checkout master
git merge upstream/master
```

Remember to always work in a branch of your local copy, as you might otherwise have to contend with conflicts in master.

Please also see [GitHub workflow](https://github.com/open-telemetry/community/blob/master/CONTRIBUTING.md#github-workflow) section of general project contributing guide.

### Running the tests

The `opentelemetry-js` project is written in TypeScript.

- `npm install` to install dependencies.
- `npm run compile` compiles the code, checking for type errors.
- `npm run bootstrap` Bootstrap the packages in the current Lerna repo. Installs all of their dependencies and links any cross-dependencies.
- `npm test` tests code the same way that our CI will test it.
- `npm run lint:fix` lint (and maybe fix) any changes.

### Guidelines for Pull Requests

- Typically we try to turn around reviews within one to two business days.
- It is generally expected that a maintainer ([@open-telemetry/javascript-maintainers](https://github.com/orgs/open-telemetry/teams/javascript-maintainers)) should review and merge every PR.
  - If a change has met the requirements listed below, an approver may also merge the pull request.
- Most PRs should be merged in one to two weeks.
- If a PR is taking longer than 30 days, please ping the approvers ([@open-telemetry/javascript-approvers](https://github.com/orgs/open-telemetry/teams/javascript-approvers)) as it may have been lost
- Dependency upgrades and Security fixes: This PR is small and/or low-risk and can be merged with only maintainer reviews.
- If your patch is not getting reviewed or you need a specific person to review it, you can @username or @open-telemetry/javascript-approvers a reviewer asking for a review in the pull request, or you can ask for a review on Gitter channel.
- API changes, breaking changes, or large changes will be subject to more scrutiny and may require more reviewers. These PRs should only be merged by maintainers.
- Changes to existing plugins and exporters will typically require the approval of the original plugin/exporter author.

### General Merge Requirements

- All requirements are at the discretion of the maintainers.
  - Maintainers may merge pull requests which have not strictly met these requirements.
  - Maintainers may close, block, or put on hold pull requests even if they have strictly met these requirements.
- No “changes requested” reviews.
- No unresolved conversations.
- 3 approvals, including the approvals of at least 2 maintainers
  - A pull request opened by an approver may be merged with only 2 reviews.
  - Small (simple typo, URL, update docs, or grammatical fix) or high-priority changes may be merged more quickly or with fewer reviewers at the discretion of the maintainers. This is typically indicated with the express label.
- For plugins, exporters, and propagators approval of the original code module author is preferred but not required.
- New or changed functionality is tested by unit tests.
- New or changed functionality is documented.
- Substantial changes should not be merged within 24 hours of opening in order to allow reviewers from all time zones to have a chance to review.

### Generating API documentation

- `npm run docs` to generate API documentation. Generates the documentation in `packages/opentelemetry-api/docs/out`

### Generating CHANGELOG documentation

- `npm run changelog` to generate CHANGELOG documentation in your terminal (see [RELEASING.md](RELEASING.md) for more details).

### Benchmarks

When two or more approaches must be compared, please write a benchmark in the benchmark/index.js module so that we can keep track of the most efficient algorithm.

- `npm run bench` to run your benchmark.
