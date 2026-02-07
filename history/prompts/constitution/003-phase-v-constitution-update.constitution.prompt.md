---
id: 003
title: Phase V Constitution Update
stage: constitution
date: 2026-02-07
surface: agent
model: gemini-pro
feature: none
branch: 004-k8s-aiops-deployment
user: {{USER}}
command: /sp.constitution
labels: [constitution, dapr, oke]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  (none)
---

## Prompt

/sp.constitution # Phase V Constitution: Distributed Event-Driven System

## 1. Architectural Mandate (Dapr-First)
- **Service Abstraction:** No service shall call another service's URL directly. Use Dapr Service Invocation.
- **Infrastructure Abstraction:** No direct Kafka or Postgres libraries in the application code. Use Dapr Pub/Sub and State Management APIs.
- **Event-Driven:** All "Side Effects" (Notifications, Recurring Task creation, Audit logging) must be triggered by Kafka events.

## 2. Cloud Strategy (Oracle OKE)
- **Production Readiness:** Use OKE (Oracle Kubernetes Engine) with the 'Always Free' tier.
- **Secrets:** All sensitive data (OpenAI keys, DB passwords) must reside in K8s Secrets accessed via the Dapr Secrets API.
- **Persistence:** Use the external Neon DB for relational data and Dapr State Store for ephemeral conversation state.

## 3. Development Protocol
- **Workflow:** Spec → Plan → Tasks → Claude Code.
- **AIOps Usage:** Use `gemini` or `k8sGPT for OKE deployments and `docker ai` for image updates.
- **Networking:** Resolve Phase 4's connection issue by using Dapr sidecar communication (`localhost:3500`) and K8s internal DNS for Dapr components.

## Response snapshot

Updated the project constitution to version 3.0.0, establishing a new Dapr-first, event-driven architecture for a distributed system deployed on Oracle Kubernetes Engine (OKE).

## Outcome

- ✅ Impact: Major architectural update.
- 🧪 Tests: n/a
- 📁 Files: 1 modified
- 🔁 Next prompts: Potentially /sp.plan or /sp.spec to align with the new constitution.
- 🧠 Reflection: The new constitution sets a clear direction for a more robust, cloud-native architecture.

## Evaluation notes (flywheel)

- Failure modes observed: n/a
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): n/a
- Next experiment: n/a
