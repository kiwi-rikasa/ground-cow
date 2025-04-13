"""
Basic tests to demonstrate pytest functionality.
This file is kept for demonstration purposes only.

NOTE: The actual tests for this application are located in the app/tests directory.
To run the tests, use:

```bash
# Run all tests
python -m pytest app/tests

# Run with coverage report
python -m pytest --cov=app app/tests/

# Generate HTML coverage report
python -m pytest --cov=app --cov-report=html app/tests/
```

Or use the convenience script:
```bash
./scripts/test.sh
```
"""

import pytest


def test_addition():
    """Test that addition works correctly."""
    assert 1 + 1 == 2


def test_subtraction():
    """Test that subtraction works correctly."""
    assert 3 - 1 == 2


@pytest.mark.parametrize(
    "a,b,expected",
    [
        (1, 2, 3),
        (5, 5, 10),
        (0, 0, 0),
        (-1, 1, 0),
    ],
)
def test_parametrized_addition(a, b, expected):
    """Test addition with multiple parameter combinations."""
    assert a + b == expected
