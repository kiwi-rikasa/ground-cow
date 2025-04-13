#!/bin/bash

# Run tests with coverage
echo "Running tests with coverage..."
python -m pytest --cov=backend tests/ $@

# Generate HTML coverage report
echo "Generating HTML coverage report..."
python -m pytest --cov=backend --cov-report=html tests/

echo "Tests completed. Coverage report available in htmlcov/ directory." 
