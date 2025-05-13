#! /usr/bin/env bash

set -e
set -x

# Initialize the DB
python app/core/pre_start.py

# Run migrations
uv run alembic upgrade head

# Initialize the DB data
python app/core/pre_start.py