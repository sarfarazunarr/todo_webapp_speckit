import os
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP
from . import tools
import inspect

load_dotenv()

# Create the FastMCP server
app = FastMCP(
    name="Todo App MCP Server",
    instructions="A server for managing tasks through an AI agent.",
)

def setup_tools(mcp_app: FastMCP):
    """
    Registers all functions in the 'tools' module with the MCP server.
    """
    for name, func in inspect.getmembers(tools, inspect.isfunction):
        if not name.startswith("_"):
            mcp_app.tool()(func)

# Register the tools with the server
setup_tools(app)
