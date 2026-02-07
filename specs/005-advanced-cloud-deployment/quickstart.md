# Quickstart: Advanced Cloud Deployment

This document provides a high-level guide to setting up and running the new event-driven architecture on Oracle Kubernetes Engine (OKE).

## Prerequisites

1.  An Oracle Cloud Infrastructure (OCI) account with the "Always Free" tier enabled.
2.  `kubectl` configured to connect to your OKE cluster.
3.  Helm v3 installed locally.
4.  Dapr CLI installed locally.
5.  An initialized Dapr control plane on your OKE cluster (`dapr init -k`).

## Deployment Steps

1.  **Deploy Infrastructure (Kafka):**
    -   Navigate to the Helm chart for Strimzi.
    -   Deploy the Strimzi operator and a Kafka cluster (in KRaft mode) to your OKE cluster.
    ```bash
    helm install strimzi strimzi/strimzi-kafka-operator
    helm install kafka strimzi/kafka --set kafka.replicas=1,zookeeper.replicas=1,kafka.kraft.enabled=true
    ```

2.  **Deploy Dapr Components:**
    -   Apply the Dapr component YAML files for:
        -   `pubsub.kafka`: Connects to the Strimzi Kafka cluster.
        -   `statestore.postgresql`: Connects to the external Neon DB.
        -   `secretstore.kubernetes`: Allows access to Kubernetes secrets.
    ```bash
    kubectl apply -f dapr/components/pubsub.yaml
    kubectl apply -f dapr/components/statestore.yaml
    kubectl apply -f dapr/components/secrets.yaml
    ```

3.  **Deploy Application Services:**
    -   Use the main application Helm chart to deploy the `chat-api` and the new `worker-service`.
    -   The Helm chart will automatically inject the Dapr sidecars into the application pods.
    ```bash
    helm install todo-app ./helm/todo-chatbot-chart
    ```

4.  **Verify Deployment:**
    -   Check that all pods are running successfully.
    -   Use `k8sgpt analyze` to check for any issues in the deployment.
    -   Verify that the application is accessible through the load balancer.
    ```bash
    kubectl get pods -n default
    k8sgpt analyze --explain
    ```

## End-to-End Flow Validation

1.  **Create a Task:** Use the web UI to create a new task with a due date.
2.  **Check API Logs:** View the logs of the `chat-api` pod. You should see a log indicating that a `task.created` event was published to Dapr.
3.  **Check Dapr Sidecar Logs:** Check the logs of the `daprd` container in the `chat-api` pod to confirm successful publishing to the `pubsub.kafka` component.
4.  **Check Worker Logs:** View the logs of the `worker-service` pod. You should see a log indicating that it received the `task.created` event from the Kafka topic.
5.  **Check Dapr Jobs:** If a recurring task was created, you can use the Dapr CLI or API to verify that a new job was scheduled.
