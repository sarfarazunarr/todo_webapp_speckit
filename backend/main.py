from fastapi import FastAPI
from sqlmodel import SQLModel
from contextlib import asynccontextmanager

from .database import engine
from .api import auth, tasks


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating tables...")
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(auth.router)
app.include_router(tasks.router)