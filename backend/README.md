# 🐄 Ground Cow - Backend

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
uv pip install -e .
``` 

Or using pip:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -e .
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

TODO: Add testing instructions

## 📜 License

TODO: Add license information

## 👥 Contributing

TODO: Add contribution guidelines
