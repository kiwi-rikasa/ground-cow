import datetime

import pendulum

from airflow.models.dag import DAG
from airflow.operators.empty import EmptyOperator

now = pendulum.now(tz="UTC")
now_to_the_hour = (now - datetime.timedelta(0, 0, 0, 0, 0, 3)).replace(minute=0, second=0, microsecond=0)
START_DATE = now_to_the_hour
DAG_NAME = "exporter_dag"

dag = DAG(
    DAG_NAME,
    schedule="*/4 * * * * *",
    default_args={"depends_on_past": True},
    start_date=pendulum.datetime(2025, 4, 16, 0, 0, 0, tz="Asia/Taipei"),
    catchup=True,
    max_active_runs=1,
)

run_this_1 = EmptyOperator(task_id="run_this_1", dag=dag)
run_this_2 = EmptyOperator(task_id="run_this_2", dag=dag)
run_this_2.set_upstream(run_this_1)
run_this_3 = EmptyOperator(task_id="run_this_3", dag=dag)
run_this_3.set_upstream(run_this_2)