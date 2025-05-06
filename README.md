# 🐄 Ground Cow

[![Build](https://github.com/kiwi-rikasa/ground-cow/actions/workflows/build.yml/badge.svg)](https://github.com/kiwi-rikasa/ground-cow/actions/workflows/build.yml)
[![Lint](https://github.com/kiwi-rikasa/ground-cow/actions/workflows/lint.yml/badge.svg)](https://github.com/kiwi-rikasa/ground-cow/actions/workflows/lint.yml)
[![Unit Test](https://github.com/kiwi-rikasa/ground-cow/actions/workflows/test.yml/badge.svg)](https://github.com/kiwi-rikasa/ground-cow/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/kiwi-rikasa/ground-cow/graph/badge.svg?token=ZFNRAJKHDU)](https://codecov.io/gh/kiwi-rikasa/ground-cow)

Ground Cow is a platform for managing your farm. It is built with [FastAPI](https://fastapi.tiangolo.com/) and [Next.js](https://nextjs.org/).

[![ground cow](img/ground-cow.png)](https://github.com/kiwi-rikasa/ground-cow)

## 💻 Development

Start the services

```bash
# Run all the services
docker compose up --build

# Run the app
docker-compose --profile app up --build -d

# Run the airflow
docker-compose --profile airflow up --build -d
```

Stop the services

```bash
docker compose down -v
```

Access the services at:

- backend: http://localhost:8000
- db admin: http://localhost:8081
- airflow web server: http://localhost:8083
