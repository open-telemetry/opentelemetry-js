# OpenTelemetry Dependencies

This section refers to `"dependencies"` and `"devDependencies"` entries in `package.json` file.
> [!IMPORTANT]
> Not all libraries follow [Semantic Versioning](https://semver.org/). Even those who do might occasionally introduce breaking changes due to human errors. Exceptions to the guidelines in this document MAY be granted by Approvers or Maintainers to work around this.

## Development Dependencies

`"devDependencies"` SHOULD be pinned to reduce the risk of autobreaking the build. Since we cannot use the `package-lock.json` file (because the libraries are distributed without it), control over the version our contributors will get is limited. By using pinned versions, we prevent potential disruptions caused by unpinned versions.

**Example:** `^1.2.3` might inadvertently lead to version `1.2.6` which includes unintended breaking changes).

> [!NOTE]
> As this approach might leave our project with outdated tooling, we adopt `renovate-bot`. This automated dependency update tool proactively opens pull requests upon the release of new patch/minor/major versions. The complete configuration for renovate-bot can be found in [renovate.json](../../renovate.json) file.

## @opentelemetry/* dependencies

All packages from the `@opentelemetry/` namespace MUST have the same pinned version, as these dependencies are automatically updated on each release by lerna.

**Example:** all packages under `packages/` should consistently maintain the same version, as should those under `experimental/packages/`.

An exception is granted for dependencies on `@opentelemetry/api`, which, if used by the package SHOULD NOT be included as a `dependency`. `@opentelemetry/api` SHOULD be included as a `peerDependency` instead. The version range of the `peerDependency` SHOULD reflect the minimum supported, and SHOULD NOT allow versions greater than the latest released minor version.

## Third-Party Library Dependencies

Packages categorized as third-party and listed under the `"dependencies"` section (e.g., @grpc/grpc-js, @grpc/proto-loader, etc.) should remain unpinned and utilize the caret (`^`) symbol. This approach offers several advantages:

- Our users could get bug fixes of those 3rd-party packages easily, without waiting for us to update our library.
- In cases where multiple packages have dependencies on different versions of the same package, npm will opt for the most recent version, saving space and preventing potential disruptions.

It's important to acknowledge that this approach does expose users to potential breaking changes arising from either human error or libraries that do not strictly follow to semver conventions. This trade-off is an inherent aspect of this approach.
