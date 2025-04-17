1. curl -LfO 'https://airflow.apache.org/docs/apache-airflow/2.10.5/docker-compose.yaml'
2. echo -e "AIRFLOW_UID=$(id -u)" > .env
3. docker compose up airflow-init