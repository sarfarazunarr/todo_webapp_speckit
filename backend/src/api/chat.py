import os
import sys
import json
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from agents import Agent, Runner
from agents.mcp import MCPServerStdio
from ..dependencies.auth import get_current_user
from ..models.user import User
from .. import tools

load_dotenv()

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
)

# Create the MCP server instance
# using sys.executable to run the mcp server module in the same environment
todo_mcp_server = MCPServerStdio(
    params={
        "command": sys.executable,
        "args": ["-u", "-m", "src.mcp_server"],
    },
    client_session_timeout_seconds=30,
)

my_agent = Agent(
    name="Todo Assistant",
    instructions="You are a helpful assistant that manages tasks. You can add, list, update, and delete tasks for the user. Always use the available tools.",
    mcp_servers=[todo_mcp_server],
    model="gpt-4o",
)

class ChatRequest(BaseModel):
    message: str
    thread_id: str = None

@router.post("/message")
async def chat_message(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Endpoint to send authentication message to the agent.
    """
    if not os.getenv("OPENAI_API_KEY"):
         raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")
    
    # We can prepend context to the instructions
    agent_instructions = f"Current User ID: {current_user.id}. You are acting on behalf of this user. Always pass user_id={current_user.id} to tools."
    
    try:
        # Clone agent to avoid polluting global state with per-request instructions
        agent_runtime = my_agent.clone(
            instructions=my_agent.instructions + "\n" + agent_instructions
        )
        
        result = await Runner.run(
           agent_runtime,
           request.message
        )
        return {"response": result.final_output}
    except Exception as e:
        print(f"Agent execution error: {e}")
        raise HTTPException(status_code=500, detail=str(e))