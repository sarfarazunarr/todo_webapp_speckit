# Data Model

**Feature**: Advanced Cloud Deployment
**Branch**: `005-advanced-cloud-deployment`

This document defines the data models for the entities involved in this feature, based on the `spec.md`.

## Entity: Task

Represents a user's to-do item.

-   **`id`**: `integer` (Primary Key)
-   **`owner_id`**: `integer` (Foreign Key to User)
-   **`title`**: `string`
-   **`description`**: `string` (optional)
-   **`status`**: `string` (e.g., "pending", "completed")
-   **`due_date`**: `datetime` (optional)
-   **`priority`**: `string` (e.g., "low", "medium", "high")
-   **`recurrence_rule`**: `string` (e.g., a cron expression like "0 0 * * *", optional)
-   **`create_date`**: `datetime`
-   **`update_date`**: `datetime`

### Relationships
-   A `Task` belongs to one `User`.
-   A `Task` can have many `Tag`s (many-to-many relationship).

## Entity: Tag

A label for categorizing tasks.

-   **`id`**: `integer` (Primary Key)
-   **`name`**: `string` (unique)
-   **`owner_id`**: `integer` (Foreign Key to User, so tags are user-specific)

### Relationships
-   A `Tag` can be applied to many `Task`s.

## Entity: Event

A message representing a domain event that is published to the message broker (Kafka). This is not a persisted database entity but a data structure for communication.

-   **`event_id`**: `string` (UUID)
-   **`event_type`**: `string` (e.g., "task.created", "task.updated", "reminder.due")
-   **`event_source`**: `string` (e.g., "/chat-api")
-   **`event_time`**: `datetime` (ISO 8601)
-   **`payload`**: `object` (The data associated with the event, e.g., a full Task object)

## Entity: Reminder

A scheduled job managed by the Dapr Jobs API. This is not a database entity but represents a scheduled action.

-   **`job_id`**: `string` (A unique identifier for the job, e.g., `task-{task_id}-reminder`)
-   **`task_id`**: `integer` (The ID of the task this reminder is for)
-   **`due_time`**: `datetime` (When the reminder should be triggered)
-   **`payload`**: `object` (Data to be passed to the worker service when the job executes)
