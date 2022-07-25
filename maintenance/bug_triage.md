# OpenTelemetry Bug Triage

This procedure describes the steps project maintainers and approvers should take to triage a bug report.

Bugs should be created using the [Bug Report](https://github.com/open-telemetry/opentelemetry-js/issues/new?template=bug_report.yaml) issue template.
This template automatically applies the `bug` and `triage` labels.

## Gather Required Information

The first step is to ensure the bug report is unique and complete.
If the bug report is not unique, leave a comment with a link to the existing bug and close the issue.
If the bug report is not complete, leave a comment requesting additional details and apply the `information-requested` label.
When the user provides additional details, remove the `information-requested` label and repeat this step.

## Categorize

Once a bug report is complete, we can determine if it is truly a bug or not.
A bug is defined as code that does not work the way it was intended to work when written.
A change required by specification may not be a bug if the code is working as intended.
If a bug report is determined not to be a bug, remove the `bug` label and apply the appropriate labels as follows:

- `documentation` feature is working as intended but documentation is incorrect or incomplete
- `feature-request` new feature request which is not required by the specification, but is allowable by specification rules
- `spec-feature` change required by the specification which adds a new feature or extends an existing feature with new functionality
- `spec-inconsistency` an existing feature incorrectly or incompletely implements the specification - may or may not also be a bug

## Prioritize

For bugs and specification required changes, apply a priority label as follows.
Each bug should have only a single priority label which is the highest priority that applies.
For example, a bug which satisfies the conditions for both `p2` and `p3` labels should only receive the `p2` label.

- `p1` bugs which cause problems in end-user applications such as crashes, data inconsistencies, or memory leaks which grow unbounded
- `p2` bugs and specification inconsistencies which cause telemetry to be incorrectly or incompletely reported
- `p3` bugs which cause problems in end-user applications not related to correctness such as performance issues or high memory use
- `p4` bugs and specification inconsistencies which do not fall into any of the above categories

## Schedule

The final step is to determine a reasonable timeline for a bug to be fixed.
`p1` and `p2` issues should be fixed as quickly as possible.
These bugs should be either immediately assigned to the appropriate person, or added to the agenda for the next SIG meeting where they will be assigned.
`p3` and `p4` issues may be addressed less urgently than `p1` and `p2` issues.
If they are not urgent the `up-for-grabs`, `good-first-issue`, or other similar labels may be applied as appropriate.

## Triage Complete

The final step is to remove the `triage` label.
This indicates that all above steps have been taken and an issue is ready to be worked on.
