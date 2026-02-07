# Feature Specification: Advanced Cloud Deployment

**Feature Branch**: `005-advanced-cloud-deployment`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "Act as a Solutions Architect. Based on the Phase 5 requirements, write a comprehensive Specification for an Advanced Cloud Deployment. Context: > - Architecture: Distributed Event-Driven System using Dapr sidecars. Primary Tools: Dapr (State, Pub/Sub, Jobs API), Strimzi Kafka, Oracle OKE (Always Free), and K8sGPT for diagnostics. Content to Include: Functional Requirements: Advanced: Recurring Tasks (daily/weekly), Due Dates, and Time-based Reminders. Intermediate: Tagging, Advanced Search/Filter, and Task Prioritization. Technical Requirements: Dapr Abstraction: Define components for pubsub.kafka (in-cluster), state.postgresql (Neon DB), and secretstores.kubernetes. Event Schemas: Define JSON schemas for task-events, reminders, and task-updates. Service Logic: The Chat-API acts as a Producer; a new Worker-Service acts as the Consumer for background processing. Infrastructure: OKE cluster setup with VCN, private subnets, and Load Balancer. Definition of Done: Successful end-to-end event flow verified by Dapr logs and K8sGPT analysis."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Advanced Task Management (Priority: P1)

As a user, I want to create and manage tasks with advanced properties like due dates, priorities, tags, and recurrence, so that I can organize my work more effectively.

**Why this priority**: This is the core functional value for the end-user, enhancing the existing TODO application with powerful new capabilities.

**Independent Test**: A user can create a task with a due date and a 'high' priority tag. The task should be visible in their task list with the correct properties.

**Acceptance Scenarios**:

1.  **Given** a user is logged in, **When** they create a new task with a due date, a priority, and tags, **Then** the task is saved and displayed with all specified attributes.
2.  **Given** a user has a list of tasks, **When** they filter by a specific tag or priority, **Then** only the matching tasks are displayed.
3.  **Given** a user creates a task set to recur daily, **When** a day passes, **Then** a new instance of the task for the current day is created.

---

### User Story 2 - Automated Task Reminders (Priority: P2)

As a user, I want to receive timely reminders for my tasks based on their due dates, so that I don't miss important deadlines.

**Why this priority**: This adds a proactive and automated element to the system, directly improving user engagement and task completion rates.

**Independent Test**: A user can create a task with a due date in the near future. When the due date approaches, a reminder event is generated.

**Acceptance Scenarios**:

1.  **Given** a task is created with a due date and a reminder time, **When** the system time reaches the reminder time, **Then** a `reminder-event` is published to the message broker.

---

### User Story 3 - Deploy and Operate a Distributed System (Priority: P3)

As a DevOps engineer, I want to deploy the entire application to an Oracle Kubernetes Engine (OKE) cluster using a Dapr-based, event-driven architecture, so that the system is scalable, resilient, and maintainable.

**Why this priority**: This fulfills the core technical and architectural goals of the feature, enabling the new functional requirements in a production-ready environment.

**Independent Test**: The backend and worker services can be deployed to OKE, and the Dapr sidecars can successfully connect to the Kafka and PostgreSQL instances.

**Acceptance Scenarios**:

1.  **Given** the OKE cluster is running, **When** the application is deployed via Helm, **Then** all pods (Chat-API, Worker-Service) start successfully with their Dapr sidecars.
2.  **Given** the system is deployed, **When** a task is created in the Chat-API, **Then** a `task-created` event is published to the Kafka topic via the Dapr Pub/Sub API.
3.  **Given** a `task-created` event is in the Kafka topic, **When** the Worker-Service processes it, **Then** the corresponding action (e.g., setting up a reminder job) is executed and logged.

### Edge Cases

-   What happens if the Kafka message broker is unavailable when the Chat-API tries to publish an event?
-   How does the Worker-Service handle malformed or invalid event schemas?
-   What is the retry policy for failed background jobs (e.g., reminder notifications)?
-   How are secrets (DB passwords, API keys) rotated without causing service downtime?

## Requirements *(mandatory)*

### Functional Requirements

-   **FR-001**: System MUST allow users to set due dates and times for tasks.
-   **FR-002**: System MUST allow users to define recurrence rules for tasks (e.g., daily, weekly).
-   **FR-003**: System MUST support adding one or more tags to a task for categorization.
-   **FR-004**: System MUST allow users to set a priority level for tasks (e.g., low, medium, high).
-   **FR-005**: Users MUST be able to search and filter their tasks by tags, priority, and due date.
-   **FR-006**: The system MUST generate reminder events based on task due dates.
-   **FR-007**: All communication between the Chat-API and the Worker-Service MUST be asynchronous via an event-driven mechanism.
-   **FR-008**: The Chat-API service MUST act as the producer of task-related events.
-   **FR-009**: A new Worker-Service MUST be created to act as a consumer of task-related events for background processing.
-   **FR-010**: All application infrastructure MUST be deployable on Oracle Kubernetes Engine (OKE).
-   **FR-011**: System MUST abstract all state management, messaging, and secret access through Dapr APIs.
-   **FR-012**: System MUST use Kubernetes secrets for storing sensitive data, accessed via the Dapr Secrets API.

### Key Entities

-   **Task**: Represents a user's to-do item. Attributes include title, description, status, due_date, recurrence_rule, and priority.
-   **Tag**: A label for categorizing tasks. A task can have multiple tags.
-   **Event**: Represents a message published to the message broker. Key attributes include `event_type` (e.g., `task.created`, `reminder.due`), `payload` (the event data), and `timestamp`.
-   **Reminder**: A scheduled job or notification linked to a task's due date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: Successful end-to-end event flow (from API to Worker) is verifiable through Dapr logs and application logs within 5 minutes of task creation.
-   **SC-002**: A K8sGPT health analysis of the deployed application on OKE reports no critical errors or misconfigurations.
-   **SC-003**: All infrastructure components (Dapr, Kafka, services) are defined and deployed using Kubernetes manifests (e.g., Helm charts).
-   **SC-004**: The Chat-API and Worker-Service MUST NOT contain any direct library dependencies for Kafka or PostgreSQL; all interactions must be through Dapr components.

## Assumptions
- An "Always Free" tier Oracle OKE cluster is available and configured.
- A Neon DB instance is provisioned and its connection details are available.
- A Strimzi-based Kafka cluster will be deployed within the OKE cluster.
- The user is familiar with the Dapr component model for configuration.