from airflow.plugins_manager import AirflowPlugin
from include.config import config

# Validate or log at import time
print(f"[Startup] ConfigLoaderPlugin Status={config._STATUS}")


class ConfigLoaderPlugin(AirflowPlugin):
    name = "config_loader_plugin"
