# Frontend Project

This project is a React frontend for the Automation Playground system.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine or Docker container for development and testing purposes.

## Local machine (recommended for development)

### Prerequisites
Install the following dependencies:

* Node.js 24+ (required for React tooling) - https://nodejs.org/en/download/
* npm (installed with Node.js)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/alex-duta/automation-lab-v2.git
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

### Usage

To run the application, use the following command from the `frontend` directory:

```sh
npm run dev
```

This will start the development server, typically at `http://localhost:5173`.

## Docker (recommended for testing and production)

### Prerequisites
Install the following dependencies:
* Docker Desktop  

### Installation
From the repository root, run the setup script (see the main README for the local or Docker execution question):
```sh
run_frontend_backend.bat       # Windows
./run_frontend_backend.sh      # Linux, macOS
```

This will install both backend and frontend apps.

Note: Initial Docker execution may take additional time to build the image and download dependencies. This is a one-time cost; later runs benefit from Docker’s caching mechanism.

### Usage

Use the server at `http://localhost:3000`.

## Project Structure

```
.
├── public
│   └── vite.svg  # vite logo
├── src
│   ├── assets
│   │   └── react.svg         # react logo
│   ├── components
│   │   ├── BackButton.jsx    # back button
│   │   └── WidgetCard.jsx    # widget card
│   ├── pages
│   │   ├── CreateUser.jsx    # create user page
│   │   ├── Home.jsx          # home page 
│   │   ├── UserDialogs.jsx   # user dialogs page     
│   │   ├── UserList.jsx      # list users page
│   │   └── UserSearchOverlap.jsx   # user search overlap page
│   ├── styles
│   │   └── App.css  # app styles
│   ├── config
│   │   └── config.js # config for frontend (e.g. store API_BASE url which is different based on local (localhost) or Docker(backend))
│   ├── App.jsx      # app entry point
│   ├── index.css    # app styles
│   └── main.jsx     # main entry point
├── .dockerignore    # docker ignore file
├── .gitignore       # git ignore file
├── Dockerfile       # containerization
├── eslint.config.js # code quality
├── index.html       # website index.html 
├── nginx.conf       # nginx config
├── package-lock.json   # lock file for dependencies
├── package.json        
└── vite.config.js      # vite config, server setup
```
