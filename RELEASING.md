# Releasing OpenTelemetry Packages (for Maintainers Only)

This document explains how to publish all OT modules at version x.y.z. Ensure that you’re following semver when choosing a version number.

## Use the Changelog to create a GitHub Release

### Generate the changelog with lerna

Since we use `lerna`, we can use [lerna-changelog](https://github.com/lerna/lerna-changelog#lerna-changelog)

#### How to use
Pass your [github token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line) to generate the changelog automatically. 
For security reasons, when you create a Github token, select the permissions: under **repo**, select **Access public repositories**, **commit status**.

In your terminal, execute the following command:
```bash
GITHUB_AUTH=<your token> lerna-changelog
```
It will print something like:

```md
## Unreleased (2018-05-24)

#### :bug: Bug Fix
* [#198](https://github.com/my-org/my-repo/pull/198) Avoid an infinite loop ([@helpful-hacker](https://github.com/helpful-hacker))

#### :house: Internal
* [#183](https://github.com/my-org/my-repo/pull/183) Standardize error messages ([@careful-coder](https://github.com/careful-coder))

#### Commiters: 2
- Helpful Hacker ([@helpful-hacker](https://github.com/helpful-hacker))
- [@careful-coder](https://github.com/careful-coder)
```
By default lerna-changelog will show all pull requests that have been merged since the latest tagged commit in the repository. That is however only true for pull requests **with certain labels applied** (see [lerna.json](lerna.json) for authorized labels).

You can also use the `--from` and `--to` options to view a different range of pull requests:
```
GITHUB_AUTH=xxxxx lerna-changelog --from=v1.0.0 --to=v2.0.0
```

#### Update Changelog file

From what `lerna-changelog` has generated, starts new Unreleased label. Follow the example set by recent Released label.
