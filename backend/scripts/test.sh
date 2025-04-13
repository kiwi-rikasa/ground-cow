#!/bin/bash

# Ensure test dependencies are installed
echo "Ensuring test dependencies are installed..."
uv pip install pytest pytest-cov

# Run tests with coverage
echo "Running tests with coverage..."
python -m pytest --cov=app app/tests/ $@

# Generate HTML coverage report
echo "Generating HTML coverage report..."
python -m pytest --cov=app --cov-report=html app/tests/

echo "Tests completed. Coverage report available in htmlcov/ directory." 
