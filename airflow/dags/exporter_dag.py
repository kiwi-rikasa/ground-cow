from __future__ import annotations

import logging
import sys
import time
from pprint import pprint

import pendulum

from airflow.decorators import dag, task
from airflow.operators.python import is_venv_installed

PATH_TO_PYTHON_BINARY = sys.executable
DAG_RUN_INTERVAL = 20

log = logging.getLogger(__name__)


@dag(
    dag_display_name="exporter_dag",
    schedule=f"*/{DAG_RUN_INTERVAL} * * * * *",
    default_args={"depends_on_past": True},
    start_date=pendulum.datetime(2025, 4, 16, 0, 0, 0, tz="Asia/Taipei"),
    catchup=True,
    max_active_runs=1,
    tags=["exporter"],
    dagrun_timeout=pendulum.duration(seconds=DAG_RUN_INTERVAL),
)
def exporter_dag():
    # [START howto_operator_python]
    @task(task_id="print_the_context")
    def print_context(ds=None, **kwargs):
        """Print the Airflow context and ds variable from the context."""
        pprint(kwargs)
        print(ds)
        return "Whatever you return gets printed in the logs"

    run_this = print_context()

    @task(
        task_id="log_sql_query",
        templates_dict={"query": "sql/sample.sql"},
        templates_exts=[".sql"],
    )
    def log_sql(**kwargs):
        log.info(
            "Python task decorator query: %s", str(kwargs["templates_dict"]["query"])
        )

    log_the_sql = log_sql()

    # Generate 5 sleeping tasks, sleeping from 0.0 to 0.4 seconds respectively
    @task
    def my_sleeping_function(random_base):
        """This is a function that will run within the DAG execution"""
        time.sleep(random_base)

    for i in range(5):
        sleeping_task = my_sleeping_function.override(task_id=f"sleep_for_{i}")(
            random_base=i / 10
        )

        run_this >> log_the_sql >> sleeping_task

    if not is_venv_installed():
        log.warning(
            "The virtalenv_python example task requires virtualenv, please install it."
        )
    else:

        @task.virtualenv(
            task_id="virtualenv_python",
            requirements=["colorama==0.4.0"],
            system_site_packages=False,
        )
        def callable_virtualenv():
            """
            Example function that will be performed in a virtual environment.

            Importing at the module level ensures that it will not attempt to import the
            library before it is installed.
            """
            from time import sleep

            from colorama import Back, Fore, Style

            print(Fore.RED + "some red text")
            print(Back.GREEN + "and with a green background")
            print(Style.DIM + "and in dim text")
            print(Style.RESET_ALL)
            for _ in range(4):
                print(Style.DIM + "Please wait...", flush=True)
                sleep(1)
            print("Finished")

        virtualenv_task = callable_virtualenv()

        sleeping_task >> virtualenv_task

        @task.external_python(task_id="external_python", python=PATH_TO_PYTHON_BINARY)
        def callable_external_python():
            """
            Example function that will be performed in a virtual environment.

            Importing at the module level ensures that it will not attempt to import the
            library before it is installed.
            """
            import sys
            from time import sleep

            print(f"Running task via {sys.executable}")
            print("Sleeping")
            for _ in range(4):
                print("Please wait...", flush=True)
                sleep(1)
            print("Finished")

        external_python_task = callable_external_python()

        run_this >> external_python_task >> virtualenv_task


exporter_dag()
