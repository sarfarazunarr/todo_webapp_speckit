from .database import get_session
from .dependencies.auth import get_current_user_from_token
from .models.task import TaskCreate
from .services import tasks as task_service
from mcp.server.fastmcp import Context


def add_task(title: str, description: str = None, ctx: Context = None) -> str:
    """
    Adds a new task for the authenticated user.
    """
    print("add_task called")
    if ctx:
        print("Context object received:")
        print(dir(ctx))
        # Hypothetical: try to get the raw message
        if hasattr(ctx, 'message'):
            print("Context has message attribute:")
            print(ctx.message)
            
    # For now, we get db and owner manually to see if we can get the server running
    db = next(get_session())
    owner = None # Hardcoded for now
    
    # Let's try to get the token from the context if possible
    # This part is experimental
    if ctx and hasattr(ctx, 'message') and 'access_token' in ctx.message:
        try:
            owner = get_current_user_from_token(token=ctx.message['access_token'], session=db)
        except Exception as e:
            print(f"Failed to get user from token: {e}")

    if not owner:
        return "Error: Could not authenticate user for adding a task."

    task_in = TaskCreate(title=title, description=description)
    try:
        task = task_service.create_task(task_create=task_in, owner=owner, session=db)
        return f"Task '{task.title}' created successfully with ID {task.id}."
    except Exception as e:
        return f"Error creating task: {e}"


def list_tasks(status: str = None, ctx: Context = None) -> str:
    """
    Lists all tasks for the current user.
    """
    return "list_tasks not implemented."


def update_task_status(task_id: int, status: str, ctx: Context = None) -> str:
    """
    Updates a task's status.
    """
    return "update_task_status not implemented."


def delete_task(task_id: int, ctx: Context = None) -> str:
    """
    Deletes a task.
    """
    return "delete_task not implemented."