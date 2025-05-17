# Backend API

This directory contains the API layer for the backend service. It defines FastAPI routers, endpoint logic, and dependencies for all API resources in this backend application.

## Structure

- `routes/`: Contains route modules for each API resource (e.g., user, session, earthquake, alert, event, zone, report).
- `deps.py`: Shared FastAPI dependencies for authentication, authorization, and database access.
- `__init__.py`: Assembles and exposes the main API router.

## Common Dependencies

- `require_session_user`: Check if the session user is **valid**, and return the user's information.
- `require_admin`: Check if the session user is **an admin**, and return the user's information.
- `require_controller`: Check if the session user is **a controller or admin**, and return the user's information.
- `require_airflow_key`: Check if the request is made by the Airflow DAG, where `AIRFLOW_ACCESS_KEY` is presented in header.
- `SessionDep`: Injects a database session.

See `deps.py` for details.

## Existing Resources

- **User**: `routes/user.py`
- **Session**: `routes/session.py`
- **Zone**: `routes/zone.py`
- **Earthquake**: `routes/earthquake.py`
- **Event**: `routes/event.py`
- **Alert**: `routes/alert.py`
- **Report**: `routes/report.py`

### API Endpoint Authentication

Below is a summary of authentication and authorization requirements for CRUD operations on each API resource:

| Resource       | GET        | POST    | PATCH      | DELETE     |
| -------------- | ---------- | ------- | ---------- | ---------- |
| **User**       | Controller | Admin   | Admin      | Admin      |
| **Session**    | ---        | Public  | ---        | Public     |
| **Zone**       | Public     | Admin   | Admin      | Admin      |
| **Earthquake** | User       | Airflow | Controller | Controller |
| **Event**      | User       | Airflow | Controller | Controller |
| **Alert**      | User       | Airflow | Controller | Controller |
| **Report**     | User       | User    | Controller | Controller |

- **Public**: No authentication required.
- **User**: Requires a valid session (user must be logged in).
- **Controller**: Requires user to have controller or admin role.
- **Admin**: Requires user to have admin role.
- **Airflow**: Requires `AIRFLOW_ACCESS_KEY` to be presented in the `x-airflow-key` header.
- **---**: Not implemented or not applicable.

## Notes

For more information, see the [FastAPI documentation](https://fastapi.tiangolo.com/).
