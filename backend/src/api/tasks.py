from typing import List, Optional
from dapr.clients import DaprClient
import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from ..database import get_session
from ..dependencies.auth import get_current_user
from ..models.task import Task, TaskCreate, TaskPublic, TaskUpdate
from ..models.user import User
from ..services.tasks import create_task, delete_task, get_task, get_tasks, update_task


router = APIRouter(prefix="/tasks", tags=["tasks"])


from dapr.clients import DaprClient
import json

@router.post("/", response_model=TaskPublic)
def create_new_task(
    task_create: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    task = create_task(task_create, current_user, session)
    try:
        with DaprClient() as d:
            d.publish_event(
                pubsub_name='pubsub',
                topic_name='tasks',
                data=json.dumps({'event_type': 'task.created', 'payload': task.dict()}),
                data_content_type='application/json',
            )
    except Exception as e:
        # Log the error, but don't fail the request
        print(f"Error publishing event: {e}")
    return task


@router.get("/", response_model=List[TaskPublic])
def read_tasks(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    offset: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
):
    return get_tasks(session, current_user, offset, limit, status=status)


@router.get("/{task_id}", response_model=TaskPublic)
def read_single_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    task = get_task(session, task_id, current_user)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    return task


@router.put("/{task_id}", response_model=TaskPublic)
def update_single_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    task = update_task(session, task_id, task_update, current_user)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    try:
        with DaprClient() as d:
            d.publish_event(
                pubsub_name='pubsub',
                topic_name='tasks',
                data=json.dumps({'event_type': 'task.updated', 'payload': task.dict()}),
                data_content_type='application/json',
            )
    except Exception as e:
        # Log the error, but don't fail the request
        print(f"Error publishing event: {e}")
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_single_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not delete_task(session, task_id, current_user):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    try:
        with DaprClient() as d:
            d.publish_event(
                pubsub_name='pubsub',
                topic_name='tasks',
                data=json.dumps({'event_type': 'task.deleted', 'payload': {'id': task_id, 'owner_id': current_user.id}}),
                data_content_type='application/json',
            )
    except Exception as e:
        # Log the error, but don't fail the request
        print(f"Error publishing event: {e}")
