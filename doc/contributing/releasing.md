# Releasing

This document is aimed at Maintainers and describes how to release a new version of the packages contained in this repository.
We aim to eventually automate this process as much as possible.

## Create a release PR

1. Go to the [Release PR Workflow](https://github.com/open-telemetry/opentelemetry-js/actions/workflows/create-or-update-release.yml)
2. Click "Run workflow"
3. For `Release Type`, select if you want to create a release PR for a new `minor` or `patch` version.
4. For `Release Scope`, select if you want to release
   - `experimental` (all packages under `./experimental/packages`)
   - `sdk` (all packages under `./packages/` except for `semantic-conventions`, and `./experimental/packages`)
   - `semconv` (all packages under `./packages/opentelemetry-semantic-conventions`)
   - `all` (all packages under `./api/`, `./packages/` and `./experimental/packages` except for `semantic-conventions`)

> [!TIP]
> If there was a commit to `main`, after PR creation simply run the workflow again before merging it.
> Re-running it will update the PR with the contents from `main` and will update the PR body too.

## Review and merge the release PR

1. Review the PR generated via the workflow (it will be titled `chore: prepare next release` and opened by the @opentelemetrybot user)
2. Once approved, merge the PR

## Publish to NPM

### Prerequisites

1. Ensure you have access to the [`opentelemetry` npm organization](https://www.npmjs.com/org/opentelemetry)
2. Go to your npm user's `Access Tokens` page
3. Click `Generate New Token` -> `Granular Access Token` (2FA prompt will pop up)
4. Input all required fields
   - recommended: set the expiry date on the token to 1 day
   - recommended: set a CIDR range to only allow your IP
5. Under `Packages and Scopes`
   - set `Permissions` to `Read and Write`
   - Select `Only Select packages and scopes`, choose `@opentelemetry`

### Publishing

1. Check out the commit created by merging the release PR
2. run `git clean -fdx --exclude <whatever you want to keep, e.g. .idea, .vscode>`
3. run `npm ci`
4. run `npm run compile`
5. run `NODE_AUTH_TOKEN=<token generated earlier> npm run release:publish`

> [!IMPORTANT]
> Delete the token once you're done publishing

## Create GitHub Releases

1. Check out the commit created by merging the release PR
2. Run
   - `npm run _github:draft_release:experimental`, if you published an `all`, `sdk` or `experimental` release
   - `npm run _github:draft_release:stable`, if you published an `all` or `sdk` release
   - `npm run _github:draft_release:semconv`, if you published a `semconv` release
   - `npm run _github:draft_release:api` if you published an `all` release
3. Verify that the contents of the created draft releases (title, changelog, selected commit)
4. Publish the releases
   - uncheck `Set as a pre-release` for all releases
   - uncheck `Set as the latest release` for all releases except for the `stable` SDK release. This will ensure that the
     `stable` SDK release consistently shows up as latest under `Releases` when navigating to the project page.
