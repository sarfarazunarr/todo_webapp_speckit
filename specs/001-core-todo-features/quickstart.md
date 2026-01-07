# Quickstart Guide: Core TODO Application

This guide provides a quick overview to set up and run the Core TODO Application.

## 1. Prerequisites

Before you begin, ensure you have the following installed:

-   **Python 3.12+**: For the backend development.
-   **uv**: A fast Python package installer and dependency resolver.
-   **Node.js 20+**: For the frontend development.
-   **npm** or **yarn**: Node.js package managers.
-   **Docker** (Optional, but recommended for Neon PostgreSQL): For local database setup or connecting to a remote Neon instance.
-   **Git**: For version control.

## 2. Environment Setup

1.  **Clone the Repository:**
    ```bash
    git clone <repository_url>
    cd todo_webapp
    ```

2.  **Create `.env` files:**
    As per the project constitution, environment variables are managed via `.env` files. Create the following files in the root of the `/backend` and `/frontend` directories, respectively:

    **`backend/.env`:**
    ```
    NEON_DATABASE_URL="your_neon_postgresql_connection_string"
    BETTER_AUTH_SECRET="your_better_auth_secret_key"
    JWT_SECRET="your_jwt_secret_key"
    ```
    Replace the placeholder values with your actual connection string and secret keys. For development, you can use a local PostgreSQL instance or a free Neon.tech project.

    **`frontend/.env`:**
    ```
    NEXT_PUBLIC_API_URL="http://localhost:8000" # Or your deployed backend URL
    ```

## 3. Backend Setup & Run

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies using `uv`:**
    ```bash
    uv pip install -r requirements.txt
    ```
    (Note: `requirements.txt` will be generated during implementation, but this is the anticipated command.)

3.  **Run Database Migrations (if applicable):**
    This step will involve running migrations to set up your database schema. (Details will be provided in the implementation phase.)

4.  **Start the FastAPI application:**
    ```bash
    uvicorn main:app --reload
    ```
    (Note: `main:app` assumes your FastAPI application entry point. This will be confirmed during implementation.)
    The backend API will typically run on `http://localhost:8000`.

## 4. Frontend Setup & Run

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install # or yarn install
    ```

3.  **Start the Next.js development server:**
    ```bash
    npm run dev # or yarn dev
    ```
    The frontend application will typically run on `http://localhost:3000`.

## 5. API Interaction (Example)

You can interact with the API using tools like `curl`, Postman, or by using the automatically generated OpenAPI documentation (Swagger UI) provided by FastAPI at `/docs` or ReDoc at `/redoc` (e.g., `http://localhost:8000/docs`).

**Example: User Signup**

```bash
curl -X POST "http://localhost:8000/auth/signup" \
     -H "Content-Type: application/json" \
     -d 
{
           "email": "test@example.com",
           "password": "securepassword"
         }
```

**Example: User Login**

```bash
curl -X POST "http://localhost:8000/auth/login" \
     -H "Content-Type: application/json" \
     -d 
{
           "username": "test@example.com",
           "password": "securepassword"
         }
```
This will return an `access_token`.

**Example: Create a Task (Authenticated)**

```bash
curl -X POST "http://localhost:8000/api/{user_id}/tasks" \
     -H "Authorization: Bearer <your_access_token>" \
     -H "Content-Type: application/json" \
     -d 
{
           "title": "Buy groceries",
           "description": "Milk, eggs, bread",
           "due_date": "2026-01-15"
         }
```
Replace `<your_access_token>` with the token obtained from login and `{user_id}` with the actual user ID.
