# Maintaining npm workspaces dependencies

This documents the caveats on maintaining npm workspaces dependencies.

## Karma

Packages with executables are hoisted in workspaces. In this case, `karma` and
its plugins are not installed in the same `node_modules` folder, which leads to
a condition that `karma` can not find the plugins necessary to run the tests.

To alleviate this, karma and its plugins are listed as root dependencies as
well.

Relevant issue: [[RFC] Add nohoist option for workspaces](https://github.com/npm/rfcs/issues/287)
