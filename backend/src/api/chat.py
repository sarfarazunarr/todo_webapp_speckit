import os
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from ..dependencies.auth import get_current_user
from ..models.user import User

load_dotenv()

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
)

# Initialize OpenAI client
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("WARNING: OPENAI_API_KEY environment variable not set.")
    client = None
else:
    client = OpenAI(api_key=api_key)

@router.post("/session")
async def create_chat_session(
    current_user: User = Depends(get_current_user),
):
    if not client:
        raise HTTPException(
            status_code=500,
            detail="OpenAI client is not configured on the server.",
        )

    # The workflow_id should be the ID of our agent workflow created in the
    # OpenAI platform and configured as an environment variable.
    workflow_id = os.getenv("OPENAI_WORKFLOW_ID")
    if not workflow_id:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_WORKFLOW_ID is not set on the server.",
        )

    try:
        # Create a new ChatKit session for the current user
        session = client.chatkit.sessions.create(
            workflow_id=workflow_id,
            user_id=str(current_user.id),
        )
        return {"client_secret": session.client_secret}
    except Exception as e:
        print(f"Error creating ChatKit session: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create ChatKit session: {e}",
        )