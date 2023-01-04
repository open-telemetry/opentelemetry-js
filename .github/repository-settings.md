# Repository settings

This document describes any changes that have been made to the
settings for this repository beyond the [OpenTelemetry default repository
settings](https://github.com/open-telemetry/community/blob/main/docs/how-to-configure-new-repository.md#repository-settings).

## General

No changes

## Collaborators and Teams

* There is currently no `javascript-triagers` role
* `javascript-maintainers` has `Admin` permission

## Branches

## Branch protection rules

### `main`

* Uncheck "Restrict who can push to matching branches"

### `dependabot/**/**`

There is currently not an explicit rule for this branch pattern.
Our dependencies are managed by a bot which creates PRs from a fork.

### `gh-pages`

This is a special branch which we use to publish the automatically generated docs.
It is exempt from most protections.
 
* "Allow force pushes from everyone" (requires write permission)

## Pages

* Source: Deploy from a branch
* Branch: `gh-pages` `/ (root)`
