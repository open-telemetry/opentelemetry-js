# opentelemetry-js

## Overview
This monorepo splits public API, stable packages, and experimental packages. Start from the package boundary, then trace outward to shared API types and processor/exporter call sites before editing behavior.

## Key Components
- `api/`: API-layer contracts shared across packages.
- `packages/`: stable SDK and instrumentation packages.
- `experimental/packages/`: incubating packages, including `sdk-logs`.
- `scripts/`: repo-wide maintenance and release helpers.

## Diagrams (Mermaid)

### Flowchart
```mermaid
flowchart LR
  API[api/] --> Stable[packages/]
  API --> Experimental[experimental/packages/]
  Experimental --> Tests[test suites]
```

### Component Diagram
```mermaid
flowchart TD
  Repo[opentelemetry-js] --> API[api]
  Repo --> Stable[packages]
  Repo --> Experimental[experimental/packages]
  Repo --> Tooling[scripts + nx + tsconfig]
```

### Sequence Diagram
```mermaid
sequenceDiagram
  participant Contributor
  participant Package
  participant SharedTypes
  participant Tests

  Contributor->>Package: inspect local implementation
  Package->>SharedTypes: verify exported contracts
  Contributor->>Tests: validate changed behavior
```
