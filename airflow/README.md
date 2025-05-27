# GroundCow Airflow: Earthquake Data Fetcher

This folder contains Apache Airflow DAGs and supporting code for the **Ground Cow** project, which automates the process of fetching, processing, and alerting on earthquake events.

## What do the DAGs do?

### Main DAG: `earthquake_fetcher_dag`

This DAG runs every 30 seconds and orchestrates the following workflow:

1. Periodically retrieves the latest earthquake data from the CWA API.
2. Records new earthquakes.
3. For each zone, creates an event for the earthquake.
4. Produces alerts based on the generated events.
5. Saves events and alerts, and handles alert suppression logic.

In this implementation, saving incidents (event + alert) is done sequentially by zone. This is because alert suppression requires data to be in time order.

### Simulation DAG: `earthquake_simulator_dag`

This DAG allows you to simulate earthquake events for testing purposes. You can provide a list of earthquake data (in JSON format) as a parameter, and the DAG will create corresponding earthquakes, events, and alerts at the time you specified.

**Parameter format:**  
The parameter should be a JSON array, where each item represents a simulated earthquake event. Each object must include:

- `delta` (int): The number of seconds after the DAG is triggered when the earthquake should occur.
- `earthquake` (object): The earthquake data, which **must be in the same format as a single CWA API response's `records.Earthquake[i]` object** (see the CWA API or real data for structure).

> The `id`, `timestamp`, and `source` fields of each earthquake will be updated automatically by the simulator.

**Note:**  
The simulation DAG does not run on a schedule and must be triggered manually with input data.

### Zone Helper DAG: `zone_fetcher_dag`

This DAG fetches zone data from the backend API and caches it in an Airflow Variable. The cache is refreshed every 10 minutes to keep data up to date and to reduce the number of main database queries.

## Project Structure

```
airflow/
├── dags/
│   ├── earthquake_fetcher_dag.py
│   └── zone_fetcher_dag.py
├── plugins/
│   └── config_loader_plugin.py     # Loads and validates config on startup
└── include/
    ├── cache/...                   # Repository of cache data (Airflow Variables)
    ├── core/...                    # Data models and logic
    ├── data/...                    # Repository of database data
    ├── service/...                 # Service modules for repository access
    └── config.py                   # Application configuration
```

## Configuration

All configuration is managed via environment variables, which are set in the `.env` file in the root of the repository, and loaded by `include/config.py`.

Configurable options include:

- `AIRFLOW_ACCESS_KEY` **(Required)**  
  The API key for authenticating Airflow with the backend.

- `CWA_API_KEY` **(Required)**  
  The API key for accessing the CWA earthquake open data API.

- `AIRFLOW_ACCESS_NAME`  
  The HTTP header name for the backend API key.  
  **Default:** `x-airflow-key`

- `AIRFLOW_BACKEND_HOST`  
  The backend API host URL.  
  **Default:** `http://localhost:8000`

- `ALERT_SUPPRESSION_INTERVAL`  
  The alert suppression interval in seconds.  
  **Default:** `1800` (30 minutes)

- `GENERATE_NA_EVENTS`  
  Whether to generate NA-severity events.  
  **Default:** `false`

## Environment

- Python 3.12
- Apache Airflow 2.10.5

---

For more details, see the code comments in each module.
