# 🐄 Ground Cow - Backend

The backend is built with [FastAPI](https://fastapi.tiangolo.com/), [Python](https://www.python.org/) and [Pydantic](https://docs.pydantic.dev/).

## 🔧 Setup

```bash
cd backend
uv venv
```

## 💻 Development

```bash
cd backend
uv sync
uv run fastapi run --reload app/main.py
```

## 🧪 Testing

```bash
# Run all tests
uv run pytest

# Run with coverage report (ignore folder in ui folder)
uv run pytest --cov=app

# Run a specific test file
uv run pytest test/unit/example.test.ts
```

## ✨ Linting

```bash
uv run ruff format
```
