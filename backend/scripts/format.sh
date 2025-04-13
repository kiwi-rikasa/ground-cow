#!/bin/sh -e
set -x

# Ensure Ruff is installed
echo "Ensuring Ruff is installed..."
uv pip install ruff

# Run Ruff for linting and fixing
ruff check app scripts --fix
ruff format app scripts
