# OpenTelemetry JS Code Contribution Guide

This document outlines the essential guidelines for contributing code to the OpenTelemetry JS repository. These guidelines are designed to ensure consistency, stability, and the highest quality of code across the project.

## Dependencies

This section refers to `"dependencies"` and `"devDependencies"` entries in `package.json` file.
It's important to note that not all libraries follow the `semver` convention, and those who do, might occasionally introduce breaking changes due to human errors (like putting breaking API changes in a patch version).

### "DevDependencies"

`"devDependencies"` SHOULD be pinned to reduce the risk of autobreaking the build. Since we do not have the option of using the `package-lock.json` file (because the libraries are distributed without it), our control over the version our users will get is limited. By using pinned versions, we prevent potential disruptions caused by using unpinned versions such as `^1.2.3`, which might inadvertently lead to version `1.2.6` with unintended breaking changes.

As this behavior might leave our users with outdated libraries, we adopt `renovate-bot`. This automated dependency update tool proactively opens pull requests upon the release of new patch/minor/major versions. The complete configuration for renovate-bot can be found in [renovate.json](./renovate.json) file.

### "Dependencies of the same monorepo"

All packages of the same monorepo MUST have the same pinned version, as these dependencies are automatically updated on each release by lerna. For instance: all packages under `opentelemetry-js/packages` should consistently maintain the same version, as should those under `opentelemetry-js/experimental/packages`.

### Third-Party Library Dependencies

Packages categorized as third-party and listed under the `"dependencies"` section (e.g., @grpc/grpc-js, @grpc/proto-loader, shimmer, etc.) should remain unpinned and utilize the caret (`^`) symbol. This strategic approach offers several advantages:

* Our users could get bug fixes of those 3rd-party packages easily, without waiting for us to update our library.
* In cases where multiple packages have dependencies on different versions of the same package, npm will opt for the most recent version, saving space and preventing potential disruptions.

It's important to acknowledge that this approach does expose users to potential breaking changes arising from either human error or libraries that do not strictly follow to semver conventions. This trade-off is an inherent aspect of this approach.
