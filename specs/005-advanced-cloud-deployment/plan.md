# Implementation Plan: Advanced Cloud Deployment

**Branch**: `005-advanced-cloud-deployment` | **Date**: 2026-02-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/005-advanced-cloud-deployment/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan outlines the implementation of an advanced cloud deployment on Oracle Kubernetes Engine (OKE). The core of this effort is to refactor the application into a distributed, event-driven architecture using Dapr. This will enable new features like recurring tasks, due dates, and reminders, which will be handled asynchronously by a new background worker service. The plan follows the agentic development workflow, leveraging AIOps tools for deployment and validation.

## Technical Context

**Language/Version**: Python 3.12+ (backend), Node.js 20+ (frontend)
**Primary Dependencies**: FastAPI, SQLModel (backend), Next.js 15+, Tailwind CSS (frontend), Dapr, Strimzi Kafka, K8sGPT
**Storage**: Neon PostgreSQL (for relational data), Dapr State Store (for ephemeral state)
**Testing**: Pytest, Jest, Playwright
**Target Platform**: Oracle Kubernetes Engine (OKE)
**Project Type**: Web Application
**Performance Goals**: <200ms p95 API response, <3s page load, End-to-end event processing within 10 seconds.
**Constraints**: Must use Dapr for all inter-service communication and infrastructure abstraction. All deployments must be managed via Helm. Must adhere to the "Always Free" tier limitations of OKE.
**Scale/Scope**: [NEEDS CLARIFICATION: What are the expected user load and data volume limitations we must operate within on OKE's 'Always Free' tier?]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle 1: Architectural Mandate (Dapr-First)**
  - [X] **Service Abstraction**: Plan uses Dapr Service Invocation.
  - [X] **Infrastructure Abstraction**: Plan uses Dapr Pub/Sub and State Management.
  - [X] **Event-Driven**: All side effects are triggered by events.
- **Principle 2: Cloud Strategy (Oracle OKE)**
  - [X] **Production Readiness**: Plan targets OKE 'Always Free' tier.
  - [X] **Secrets**: Plan uses K8s Secrets via Dapr.
  - [X] **Persistence**: Plan uses Neon DB and Dapr State Store.
- **Principle 3: Development Protocol**
  - [X] **Workflow**: This plan follows the Spec -> Plan -> Tasks workflow.
  - [X] **AIOps Usage**: Plan specifies using `k8sgpt` and `kubectl-ai`.
  - [X] **Networking**: Plan addresses using Dapr sidecar communication.

**Result**: PASS. The plan aligns with all constitutional principles.

## Project Structure

### Documentation (this feature)

```text
specs/005-advanced-cloud-deployment/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)
The constitution has shifted focus from a rigid directory structure to a workflow and tooling-centric approach for deployment. The existing `backend` and `frontend` structure remains, but the new principles govern how they are containerized and deployed.

**Structure Decision**: The project structure will be oriented around containerization and Kubernetes deployment artifacts, managed via AIOps tools. Helm charts will become a key structural element. A new `worker-service` will be added.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None*    | -          | -                                   |