# Tasks: Advanced Cloud Deployment

**Input**: Design documents from `specs/005-advanced-cloud-deployment/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Path Conventions

- **Source Code**: `backend/src/`, `frontend/src/`, `worker/src/`
- **Kubernetes**: `k8s/`
- **Dapr Components**: `k8s/dapr/components/`
- **Helm**: `helm/`
- **AIOps History**: `history/aiops/`

---

## Phase 1: Setup OKE & Dapr

**Purpose**: Prepare the Kubernetes cluster and foundational operators.

- [X] T001 Manually set up an Oracle OKE cluster in the OCI console, ensuring it's on the "Always Free" tier.
- [X] T002 Configure `kubectl` to connect to the newly created OKE cluster.
- [X] T003 Initialize the Dapr control plane on the cluster using `dapr init -k`.
- [X] T004 Install the Strimzi Kafka operator into the `kafka` namespace using its Helm chart.
- [X] T005 [P] Create a `taskflow-kafka` Kafka cluster resource with a single node in KRaft mode in `k8s/kafka/cluster.yaml`.
- [X] T006 [P] Create a `tasks` KafkaTopic resource in `k8s/kafka/topic.yaml`.
- [X] T007 Apply the Kafka cluster and topic manifests using `kubectl apply -f k8s/kafka/`.

---

## Phase 2: Foundational Dapr Components

**Purpose**: Define the Dapr components for infrastructure abstraction.

- [X] T008 [P] Create the Dapr component manifest `k8s/dapr/components/pubsub.yaml` to connect to the `taskflow-kafka` Kafka cluster.
- [X] T009 [P] Create the Dapr component manifest `k8s/dapr/components/statestore.yaml` to connect to the external Neon DB.
- [X] T010 [P] Create the Dapr component manifest `k8s/dapr/components/secretstore.yaml` to use the built-in Kubernetes secret store.
- [X] T011 Apply all Dapr component manifests using `kubectl apply -f k8s/dapr/components/`.

---

## Phase 3: User Story 1 - Advanced Task Management

**Goal**: Refactor the application for event-driven communication and add advanced task properties.

- [X] T012 [US1] Create the initial directory structure and boilerplate for a new Python application in `worker/`.
- [X] T013 [US1] Modify the `backend/src/api/tasks.py` to publish a `task.created` event via the Dapr pub/sub API when a new task is created.
- [X] T014 [US1] Modify the `backend/src/api/tasks.py` to publish a `task.updated` event when a task is updated.
- [X] T015 [US1] Modify the `backend/src/api/tasks.py` to publish a `task.deleted` event when a task is deleted.
- [X] T016 [US1] Implement a `/subscribe` endpoint in the new `worker/src/main.py` to receive events from the `tasks` topic.
- [X] T017 [US1] Add logic to the `worker/src/main.py` subscription handler to process `task.created` events with a `recurrence_rule` and schedule a Dapr Job.
- [X] T018 [US1] [P] Refactor the frontend API calls in `frontend/src/app/dashboard/page.tsx` to use Dapr service invocation (`http://localhost:3500/v1.0/invoke/backend-service/method/...`).

---

## Phase 4: User Story 2 - Automated Task Reminders

**Goal**: Implement logic for scheduling and handling task reminders.

- [X] T019 [US2] Add logic to the `worker/src/main.py` subscription handler to process `task.created` and `task.updated` events with a `due_date` and schedule a Dapr Job for the reminder.
- [X] T020 [US2] Create an endpoint in `worker/src/main.py` that the Dapr Jobs will invoke when a reminder is due.
- [X] T021 [US2] Implement logic in the reminder endpoint to publish a `reminder.due` event. (Further processing of this event is out of scope for this phase).

---

## Phase 5: User Story 3 - Deploy and Operate

**Goal**: Package and deploy the distributed system using Helm and validate its health.

- [X] T022 [US3] Create a new Helm chart in `helm/todo-app/`.
- [X] T023 [US3] [P] Create a deployment template for the `backend` service in the Helm chart.
- [X] T024 [US3] [P] Create a deployment template for the `frontend` service in the Helm chart.
- [X] T025 [US3] [P] Create a deployment template for the new `worker` service in the Helm chart.
- [X] T026 [US3] Ensure all deployment templates are annotated correctly for Dapr sidecar injection (`dapr.io/enabled: "true"`).
- [X] T027 [US3] Deploy the application using `helm install todo-app ./helm/todo-app/`.
- [X] T028 [US3] Run `k8sgpt analyze` and document any reported issues in `history/aiops/k8sgpt-analysis.txt`.

---

## Phase 6: Polish & Final Validation

**Purpose**: Final integration, testing, and documentation.

- [X] T029 Perform an end-to-end test as described in the `quickstart.md`.
- [X] T030 Document the final deployment process and any manual steps in the main `README.md`.

---

## Dependencies & Execution Order

- **Phase 1 (Setup)** must be completed before **Phase 2**.
- **Phase 2 (Components)** must be completed before **Phase 3, 4, and 5** can begin.
- **Phase 3 (US1)** is a prerequisite for **Phase 4 (US2)**, as the worker service needs to be created first.
- **Phase 5 (US3)** can be worked on in parallel with 3 and 4, but can only be completed once all services are ready to be deployed.
- **Phase 6 (Validation)** is the final step.

## Implementation Strategy

### MVP First (User Story 1 + 3)

The minimum viable product requires the event-driven backbone to be in place and the core application to be deployable.
1. Complete Phase 1 & 2.
2. Complete all tasks for Phase 3 (US1).
3. Complete all tasks for Phase 5 (US3).
4. **STOP and VALIDATE**: Test that tasks can be created, events are published, the worker receives them, and the whole system is running on OKE.

### Incremental Delivery

After the MVP is validated, Phase 4 (US2) can be implemented to add the reminder functionality.
