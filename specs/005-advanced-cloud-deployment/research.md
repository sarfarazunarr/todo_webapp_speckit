# Research and Decisions

**Feature**: Advanced Cloud Deployment
**Branch**: `005-advanced-cloud-deployment`

This document records the research and decisions made to resolve ambiguities identified in the `plan.md`.

## 1. OKE 'Always Free' Tier Limitations and Scope

### Research Question
What are the expected user load and data volume limitations we must operate within on OKE's 'Always Free' tier?

### Findings
- **Compute**: The Always Free tier provides a total of 4 ARM-based oCPUs and 24GB of memory, typically provisioned as 2 worker nodes (2 oCPUs and 12GB RAM each).
- **Storage**: A total of 200GB of block storage is available. Each worker node's boot volume consumes a significant portion, leaving limited space for persistent volumes (like for a Kafka log).
- **Networking**: A Flexible Load Balancer (10Mbps) is included, which is sufficient for this project's scale.
- **Instance Reclamation**: To avoid having resources reclaimed by Oracle, instances must maintain a baseline level of activity.

### Decision
The application will be designed for a **small-scale, single-tenant or personal use case**. We cannot realistically support a large number of concurrent users or heavy data loads. All components must be configured with strict resource requests and limits to fit within the free tier. The project's goal is to serve as a proof-of-concept for the event-driven architecture on a cloud platform, not to build a production-grade, highly-available public service.

**Rationale**: The compute and storage constraints of the "Always Free" tier are significant. Attempting to support a large user base would lead to performance issues and "out of resource" errors. Focusing on a small-scale deployment is a realistic goal that aligns with the available infrastructure.

**Alternatives Considered**: Using a paid OCI plan was considered but rejected to adhere to the project's constraint of using "Always Free" resources.

## 2. Kafka Deployment Strategy (Strimzi)

### Research Question
What are the best practices for deploying Kafka with Strimzi on a resource-constrained Kubernetes environment?

### Findings
- **KRaft Mode**: Using KRaft (Kafka Raft) mode eliminates the need for a separate Zookeeper ensemble. This significantly reduces the resource footprint (CPU, memory, and storage) and operational complexity, making it ideal for constrained environments.
- **Resource Configuration**: It is critical to set aggressive but functional CPU and memory requests/limits for the Kafka brokers and Strimzi operators.
- **JVM Heap Size**: The Kafka broker's JVM heap size must be carefully tuned to a fraction of the container's memory limit to avoid out-of-memory errors.
- **Producer/Consumer Tuning**: Client-side tuning (e.g., `batch.size`, `linger.ms`) can improve efficiency and reduce the load on the brokers.

### Decision
We will deploy Kafka using **Strimzi in KRaft mode**. We will define conservative resource requests and limits in the Helm chart for the Strimzi operator and the Kafka cluster.

**Rationale**: KRaft is the official future direction for Kafka and provides substantial resource savings, which is a hard requirement for the OKE free tier.

**Alternatives Considered**:
- **Kafka with Zookeeper**: Rejected due to the higher resource overhead of running a separate Zookeeper cluster.
- **External/Managed Kafka Service**: Rejected to keep all core components within the OKE cluster as defined by the project's scope.

## 3. Recurring Task Implementation Pattern

### Research Question
What is the best pattern for implementing recurring tasks (like daily task creation) using Dapr?

### Findings
- **Dapr Jobs API**: Introduced in Dapr 1.14, this API is specifically designed for scheduling and managing durable, recurring, or one-off background jobs. It provides persistence, at-least-once execution guarantees, and a centralized scheduler component.
- **Dapr Cron Bindings**: An older mechanism. They are less reliable, not as scalable, and cannot be dynamically scheduled from application code as easily as the Jobs API.
- **Dapr Workflows/Actors**: These are more powerful and complex tools suited for orchestrating multi-step stateful processes. They are overkill for a simple recurring task trigger.

### Decision
The `worker-service` will expose an endpoint that can be invoked by the **Dapr Jobs API**. The recurring task logic (e.g., creating a new task instance every day) will be handled within this service. The schedule for the job will be defined using a cron expression.

**Rationale**: The Dapr Jobs API is the modern, idiomatic, and most reliable way to handle scheduled tasks in a Dapr application. It perfectly fits the requirement without adding unnecessary complexity.

**Alternatives Considered**: A simple cron-based trigger within the `worker-service` itself was considered but rejected because it would not be as durable or observable as using the Dapr Jobs API, which is managed by the Dapr control plane.
