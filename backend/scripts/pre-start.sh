#! /usr/bin/env bash

set -e
set -x

# Run migrations
uv run alembic upgrade head

# Create initial data in DB
uv run python -c "from app.core.db import init_db; init_db()"
