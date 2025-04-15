# 🐄 Ground Cow - Backend

[![Build and Test](https://github.com/username/ground-cow/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/username/ground-cow/actions/workflows/build-and-test.yml)
[![Lint](https://github.com/username/ground-cow/actions/workflows/lint.yml/badge.svg)](https://github.com/username/ground-cow/actions/workflows/lint.yml)

FastAPI-based backend service for the Ground Cow application.

## 🔍 Overview

This backend service provides the API endpoints for the Ground Cow application. It's built with FastAPI, a modern, fast web framework for building APIs with Python.

## 📋 Requirements

- Python 3.13+
- uv (Python package manager)

## 🔧 Installation

### Set up Python environment

Using uv (recommended):

```bash
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv sync
```
### Launch PostgreSQL server
Start DB
```bash
docker compose -f docker-postgresql.yml up -d
```
Stop DB (keep data)
```bash
docker compose -f docker-postgresql.yml down
```
Stop and Wipe all data
```bash
docker compose -f docker-postgresql.yml down -v
```


## 💻 Development

### Running the server locally

```bash
fastapi dev --reload
```

The server will start at http://localhost:8000

### Accessing API documentation

When the server is running, you can access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Code style and linting

The project uses Ruff for code formatting and linting:

```bash
ruff check .
ruff format .
```

## 📂 Project Structure

```
backend/
├── .venv/                  # Virtual environment (not committed)
├── routes/                 # API endpoints
│   ├── __init__.py
│   └── main.py             # Main router
├── .gitignore              # Git ignore file
├── .python-version         # Python version specification
├── main.py                 # Application entry point
├── pyproject.toml          # Project configuration
├── README.md               # This file
└── uv.lock                 # Dependency lock file
```

## 🧪 Testing

The project uses pytest for testing. Tests are located in the `app/tests/` directory.

### Running tests

```bash
# Run all tests
python -m pytest app/tests

# Run with coverage report
python -m pytest --cov=app app/tests/

# Run a specific test file
python -m pytest app/tests/test_router_user.py

# Run a specific test
python -m pytest app/tests/test_router_user.py::test_create_user
```

### Installing test dependencies

```bash
# Install the development dependencies (includes pytest)
uv pip install -e ".[dev]"
```

### Running tests

```bash
# Run all tests
python -m pytest app/tests

# Run with coverage report
python -m pytest --cov=app app/tests/

# Run a specific test file
python -m pytest app/tests/test_router_user.py

# Run a specific test
python -m pytest app/tests/test_router_user.py::test_create_user
```

### Using the test script

A convenience script is provided to run tests with coverage:

```bash
# Make the script executable (if needed)
chmod +x scripts/test.sh

# Run the script
./scripts/test.sh
```

The coverage report will be available in the `htmlcov/` directory.

### Test structure

- `app/tests/conftest.py`: Contains shared fixtures for all tests
- `app/tests/test_db.py`: Tests for database connection and sessions
- `app/tests/test_router_*.py`: Tests for API routes

## 👥 Contributing

This section provides guidelines for contributing to the Ground Cow backend.

### Setting up the development environment

1. Fork and clone the repository
2. Set up the Python environment as described in the Installation section
3. Install development dependencies:
   ```bash
   uv pip install -e ".[dev]"
   ```

### Database setup with Docker

The project uses PostgreSQL, which is managed via Docker for development and testing.

#### Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine
- Docker Compose (included with Docker Desktop)

#### Starting the database

```bash
# Start the PostgreSQL database
docker compose -f docker-postgresql.yml up -d
```

This will start a PostgreSQL server on port 7777 with the following configuration:
- Username: postgres
- Password: mysecret
- Database: groundcow

#### Setting up the environment

Create a `.env` file in the backend directory with the following content:

```
DATABASE_URL=postgresql://postgres:mysecret@localhost:7777/groundcow
```

#### Initializing the database

After starting the Docker container, initialize the database schema:

```bash
python init_db.py
```

#### Managing the database

```bash
# Stop the database (keeping data)
docker compose -f docker-postgresql.yml down

# Stop the database and remove all data
docker compose -f docker-postgresql.yml down -v

# View database logs
docker logs groundcow-db

# Connect to the database directly
docker exec -it groundcow-db psql -U postgres -d groundcow
```

### Running tests with Docker

The test suite is configured to use an in-memory SQLite database by default, but you can also run tests against the PostgreSQL database:

1. Start the PostgreSQL database as described above
2. Run the tests with:
   ```bash
   # Run all tests
   ./run_tests.sh
   ```

### Contribution workflow

1. Create a new branch for your feature or bugfix
2. Write tests for your changes
3. Implement your changes
4. Make sure all tests pass
5. Format your code with Ruff
6. Submit a pull request

## 📜 License

TODO: Add license information
