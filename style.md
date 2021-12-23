# OpenTelemetry JS Style Guide

This guide is meant to be a supplement to the linting rules.
It is not exhaustive, nor should the suggestions in this guide be considered hard rules.
Suggestions for changes and additions to this doc are welcome and this doc should not be considered to be set in stone.
There may be code written before this guide which does not follow the suggestions in this guide.
That code is not required to be updated, but maybe a good starting place for new contributors getting used to the codebase.

## Test coverage

In general, all changes should be tested.
New features generally require tests to be added and bugfixes require tests to ensure there are no regressions.

## Linting

The lint check must pass in order for a PR to be merged.
In some cases, it may be acceptable to disable a linting rule for a specific line or file.
It may also be acceptable in some cases to modify the linting rules themselves if a sufficient argument is made that the rule should be changed.

## `null` and `undefined` should be treated the same

In general, null and undefined should be treated the same.
In case of the rare exception where `null` is used to mean something different than `undefined` it should be documented clearly in the jsdocs.

- Prefer `undefined` instead of `null` in most cases
- Prefer `value == null` instead of `value == null || value == undefined`

## Prefer `===` over `==`

`===`/`!==` should be preferred over `==` and `!=`.
An exception to this is when checking for `null`/`undefined` when it is preferred to use `== null` in order to treat `null` and `undefined` the same.

## Prefer options objects to long lists of optional positional parameters

For functions/methods/constructors with optional parameters, the parameters should be passed as an options object.
This allows options to be added later without changing the function signature and avoids long lists of arguments.
Required arguments should be at the start of the arguments list.
