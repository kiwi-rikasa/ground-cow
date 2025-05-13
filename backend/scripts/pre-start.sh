#! /usr/bin/env bash

set -e
set -x

# Run migrations
uv run alembic upgrade head

# Initialize the DB
python app/core/pre_start.py

# Initialize the DB data
