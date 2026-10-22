# AUT - Automation Playground

A full-stack web application for managing users, built with a FastAPI backend and React/Vite frontend, containerized with Docker.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Access the application](#access-the-application)
- [API Documentation](#api-documentation)
- [Features](#features)

## Project Overview

Automation Playground is a user management application that provides a complete system for creating, viewing, and managing user profiles. The application features a modern React frontend and a robust FastAPI backend that stores user data in a PostgreSQL database and profile pictures in files.

The UI test cases used with this application, described independently of any automation framework, are in [TEST_CASES.md](TEST_CASES.md).

> **Note:** Automation Playground is a deliberately simple test target for UI test automation. It has no authentication or access control, and its database uses fixed test credentials (`docker-compose.yml`). Do not use it in production or expose it to untrusted networks.

## Tech Stack

### Backend
- **Python** 3.13+ - Programming language 
- **FastAPI** 0.123.10 - Modern, fast web framework for building APIs with Python
- **Uvicorn** 0.38.0 - ASGI server (used to handle HTTP async requests server, run FastAPI apps)
- **Pydantic** 2.12.5 - Data validation using Python type annotations (used to ensure data integrity and consistency)
- **Python Multipart** 0.0.20 - Multipart request handling (used for file uploads)
- **Email Validator** 2.3.0 - Email validation (used to validate user emails)
- **SQLModel** 0.0.48 and **SQLAlchemy** 2.1.3 - Database models and queries
- **psycopg** 3.3.6 - PostgreSQL driver
<img width="1867" height="577" alt="image" src="https://github.com/user-attachments/assets/5c9801ee-bdf9-418b-962f-52118ad2100d" />


### Frontend
- **JavaScript** - Client-side scripting language
- **React** 19+ - UI library for building user interfaces
- **Node.js** 24+ - Runtime environment for JavaScript, required for React tooling
- **React Router DOM** 7+ - Client-side routing (used for navigation within the application)
- **Vite** 7+ - Build tool and dev server (used for frontend development and deployment)
- **ESLint** - Code quality tool (used to ensure code quality and maintainability)
<img width="1725" height="962" alt="image" src="https://github.com/user-attachments/assets/e61bc015-4f42-46ec-a144-625462f945d0" />


### Database
- **PostgreSQL** 18.6 - Relational database for user data (Docker image `postgres:18.6-alpine`)

### Infrastructure
- **Docker** - Containerization (used to package and deploy applications)
- **Nginx** - Web server for frontend (web server and reverse proxy, forwarding requests to the backend)
<img width="1182" height="186" alt="image" src="https://github.com/user-attachments/assets/2a8e37cf-366e-4f1a-a699-2616394d6b31" />


## Project Structure

```
AutomationPlayground/
├── backend/                    # FastAPI application
│
├── frontend/                   # React application
│
├── docker-compose.yml         # Docker Compose configuration
├── run_frontend_backend.bat   # Windows batch script to run both services
├── run_frontend_backend.sh    # Linux and macOS shell script to run both services
└── README.md                  # This file
```

- For more details, refer to backend and frontend folders in the README.md 

## Installation & Setup

## Option 1: Docker setup (recommended for testing and production)

### Prerequisites
Install the following dependencies:

- **Docker Desktop** - recommended for full setup

### Installation
1. Clone the repository or navigate to the project directory
   ```sh
   git clone https://github.com/alex-duta/automation-lab.git
   ```

2. Docker setup is automated using a script: `run_frontend_backend.bat` on Windows, `run_frontend_backend.sh` on Linux and macOS. Both do the same.
    1. Ensure Docker Desktop is installed and running
    2. Run the setup script:

         ```bash
         run_frontend_backend.bat       # Windows
         ./run_frontend_backend.sh      # Linux, macOS
         ```
    3. Select Y to set up the installation for local execution or N to set up for Docker execution. (config\config.js will be updated accordingly, respectively API_BASE URL will be set to http://localhost:8000 or http://backend:8000)

   - This will build the Docker images and start the containers in the background.

   - Note: Initial Docker execution may take additional time to build the image and download dependencies. This is a one-time cost; later runs benefit from Docker’s caching mechanism.

### Access the application:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs
   - **Database**: `localhost:5432`, from this machine only (database `automation_lab`, user and password `automation`)

## Option 2: Local setup (recommended for development only)

### Backend Setup

#### Prerequisites
Install the following dependencies:

* Python 3.12+ - https://www.python.org/downloads/
* pip (installed with Python)
* Docker Desktop, for the database. Start only the database container from the repository root:
   ```sh
   docker network create automation-network    # once, if the setup script has not created it
   docker compose up -d database
   ```
   The backend connects to `postgresql+psycopg://automation:automation@localhost:5432/automation_lab`; set `DATABASE_URL` to use another database.

#### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/alex-duta/automation-lab.git
   ```
2. Navigate to the backend directory
    ```sh
    cd backend
    ```
3. Create and activate a virtual environment:
   ```sh
   python -m venv venv
   venv\Scripts\activate          # Windows
   source venv/bin/activate       # Linux, macOS
   ```
4. Select interpreter from Visual Studio Code:
    Open the Command Palette (Ctrl+Shift+P), search for the Python: Select Interpreter command, and select it (e.g. venv\Scripts\python.exe)
    
5. Install the dependencies:
   ```sh
   pip install -r app/requirements.txt
   ```

#### Usage
1. Activate virtual environment (if not already active): 
   ```sh
   venv\Scripts\activate          # Windows
   source venv/bin/activate       # Linux, macOS
   ```

2. To run the application, use the following command from the `backend` directory:

   ```sh
   uvicorn app.main:app --reload
   ```

This will start the server at `http://127.0.0.1:8000`. You can access the API documentation at `http://127.0.0.1:8000/docs`.

### Frontend Setup

#### Prerequisites
Install the following dependencies:

* Node.js 24+ (required for React tooling) - https://nodejs.org/en/download/
* npm (installed with Node.js)

#### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/alex-duta/automation-lab.git
   ```
2. Navigate to the frontend directory
    ```sh
    cd frontend
    ```
3. Install the dependencies:
   ```sh
   npm install
   ```
4. Point the frontend to the local backend: in `src/config/config.js`, `API_BASE` must be `http://localhost:8000`. The file in the repository can contain `http://backend:8000`, the address used in Docker.
   ```js
   export const API_BASE = "http://localhost:8000";
   ```

#### Usage

1. To run the application, use the following command from the `frontend` directory:

   ```sh
   npm run dev
   ```

This will start the development server, typically at `http://localhost:5173`.

## API Documentation

Once the backend is running, access the interactive API documentation at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Main Endpoints

- `GET /users` - Retrieve users: optional `search` (name or e-mail), `role`, `status`, `page` and `size` (both at least 1)
- `POST /users` - Create a new user
- `POST /users/{user_id}/upload-picture` - Upload profile picture
- `POST /reset` - Empty the user list and delete the uploaded profile pictures (a test suite calls it before a run)

## Features

-  User CRUD operations
-  Profile picture upload and storage
-  Email validation
-  Responsive React UI
-  Interactive API documentation
-  Docker containerization
-  PostgreSQL data storage
-  RESTful API design

## Notes

- User data is stored in the PostgreSQL database `automation_lab`, in the Docker volume `database-data`; the backend creates its table at startup. `POST /reset` empties it, and `docker compose down -v` deletes the volume
- Profile pictures are stored in `backend/app/storage/profile_pics/`
- Versions 1.x of the application stored the users in `backend/app/storage/users.json`
- The project uses:
   - **ESLint** for JavaScript/JSX, usage:
      ```bash
      npm run lint
      ```
   - **Pydantic** for Python type validation
   - **FastAPI** best practices

## How to cite

If you use this application in your work, please cite it as described in [CITATION.cff](CITATION.cff) (on GitHub: "Cite this repository").

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) and [NOTICE](NOTICE) files for details.
