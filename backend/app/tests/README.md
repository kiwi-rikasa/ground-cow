# Backend Tests

This directory contains tests for the backend application using pytest.

## Setup

Make sure you have the development dependencies installed:

```bash
cd backend
python -m pip install -e ".[dev]"
```

## Running Tests

To run all tests:

```bash
python -m pytest
```

To run a specific test file:

```bash
python -m pytest tests/test_router_user.py
```

To run a specific test:

```bash
python -m pytest tests/test_router_user.py::test_create_user
```

## Test Coverage

To generate a test coverage report:

```bash
python -m pytest --cov=backend tests/
```

## Configuration

Test configuration is defined in the `pytest.ini` file and test fixtures are in `conftest.py`.

## Test Structure

- `conftest.py`: Contains shared fixtures for all tests
- `test_db.py`: Tests for database connection and sessions
- `test_router_*.py`: Tests for API routers 