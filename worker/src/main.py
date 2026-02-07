from fastapi import FastAPI, Body
from pydantic import BaseModel
from typing import Dict, Any
from dapr.clients import DaprClient
import json

app = FastAPI()

class CloudEvent(BaseModel):
    specversion: str
    type: str
    source: str
    subject: str | None = None
    id: str
    time: str | None = None
    datacontenttype: str | None = None
    data: Dict[str, Any] | None = None

@app.get("/dapr/subscribe")
def subscribe():
    subscriptions = [{
        "pubsubname": "pubsub",
        "topic": "tasks",
        "route": "/tasks"
    }]
    return subscriptions

from dapr.clients import DaprClient

@app.post("/tasks")
def tasks_subscriber(event: CloudEvent = Body(...)):
    print(f"Received event: {event.id} of type {event.type} with data: {event.data}", flush=True)
    if event.type == "task.created" or event.type == "task.updated":
        task = event.data['payload']
        if task.get("recurrence_rule"):
            with DaprClient() as d:
                job_name = f"task-{task['id']}-recurrence"
                print(f"Scheduling job: {job_name}")
                try:
                    d.schedule_job(
                        job_name=job_name,
                        job_schedule=task["recurrence_rule"],
                        job_data=json.dumps(task),
                    )
                except Exception as e:
                    print(f"Error scheduling job: {e}")
        if task.get("due_date"):
            with DaprClient() as d:
                job_name = f"task-{task['id']}-reminder"
                print(f"Scheduling reminder job: {job_name}")
                try:
                    d.schedule_job(
                        job_name=job_name,
                        job_schedule=task["due_date"], # This should be a datetime string
                        job_data=json.dumps(task),
                    )
                except Exception as e:
                    print(f"Error scheduling reminder job: {e}")
    return {"status": "success"}

@app.post("/reminders")
def reminders_handler(task: Dict[str, Any] = Body(...)):
    print(f"Received reminder for task: {task.get('id')}", flush=True)
    with DaprClient() as d:
        try:
            d.publish_event(
                pubsub_name='pubsub',
                topic_name='tasks', # Or a different topic for reminders
                data=json.dumps({
                    'event_type': 'reminder.due',
                    'payload': {
                        'task_id': task.get('id'),
                        'owner_id': task.get('owner_id'),
                        'due_date': task.get('due_date'),
                        'message': f"Reminder for task: {task.get('title')}"
                    }
                }),
                data_content_type='application/json',
            )
        except Exception as e:
            print(f"Error publishing reminder event: {e}")
    return {"status": "success"}

@app.get("/")
def read_root():
    return {"Hello": "Worker"}