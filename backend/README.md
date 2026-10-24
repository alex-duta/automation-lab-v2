# Backend Project

This project is a FastAPI backend for the Automation Playground system.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine or Docker container for development and testing purposes.

## Local machine (recommended for development)

### Prerequisites
Install the following dependencies:

* Python 3.12+ - https://www.python.org/downloads/
* pip (installed with Python)
* Docker Desktop, for the PostgreSQL database - https://www.docker.com/products/docker-desktop/

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/alex-duta/automation-lab-v2.git
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
4. Install the dependencies:
   ```sh
   pip install -r app/requirements.txt
   ```

### Usage
Start the database container, from the repository root (create the network once, if the setup script has not created it):
```sh
docker network create automation-network
docker compose up -d database
```

The backend connects to `postgresql+psycopg://automation:automation@localhost:5432/automation_lab` and creates its table at startup; set `DATABASE_URL` to use another database.

Activate virtual environment: 
```sh
venv\Scripts\activate          # Windows
source venv/bin/activate       # Linux, macOS
```

To run the application, use the following command from the `backend` directory:

```sh
uvicorn app.main:app --reload
```

This will start the server at `http://127.0.0.1:8000`. You can access the API documentation at `http://127.0.0.1:8000/docs`.

## Docker (recommended for testing and production)

### Prerequisites
Install the following dependencies:
* Docker Desktop - https://www.docker.com/products/docker-desktop/

### Installation

From the repository root, run the setup script (see the main README for the local or Docker execution question):
```sh
run_frontend_backend.bat       # Windows
./run_frontend_backend.sh      # Linux, macOS
```

This will install both backend and frontend apps.

Note: Initial Docker execution may take additional time to build the image and download dependencies. This is a one-time cost; later runs benefit from Docker’s caching mechanism.


### Usage

Use the server at `http://localhost:8000`. You can access the API documentation at `http://localhost:8000/docs`.

## Project Structure

```
.
├── app
│   ├── api
│   │   ├── users.py          # user CRUD operations
│   │   ├── profiles.py       # user profiles (Edit User page)
│   │   ├── teams.py          # teams and their members (Team Board page)
│   │   ├── reports.py        # CSV export and reports (Export & Reports page)
│   │   └── sessions.py       # session cookie and user preferences (Session & Preferences page)
│   ├── models
│   │   ├── user_model.py     # users table of the database
│   │   ├── profile_model.py  # user profiles table
│   │   ├── team_model.py     # teams and team members tables, default teams
│   │   ├── report_model.py   # reports table
│   │   ├── session_model.py  # sessions table
│   │   └── preference_model.py # user preferences table
│   ├── schemas
│   │   ├── user_schema.py    # user data validation
│   │   ├── profile_schema.py # profile data validation
│   │   ├── team_schema.py    # team data validation
│   │   ├── report_schema.py  # report request validation
│   │   └── session_schema.py # sign-in and preferences validation
│   ├── storage
│   │   └── profile_pics   # store profile pictures
│   ├── utils
│   │   └── database.py    # database connection and sessions
│   ├── __init__.py
│   ├── Dockerfile         # containerization
│   ├── .dockerignore      # docker ignore file
│   ├── .gitignore         # git ignore file
│   ├── main.py            # CORS setup, allow origin
│   └── requirements.txt   # dependencies
└── venv 
```
