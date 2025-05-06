# 🐄 Ground Cow - Frontend

The frontend is built with [Bun](https://bun.sh/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Next.js](https://nextjs.org/) and [Shadcn UI](https://ui.shadcn.com/).

## 🔧 Setup

```bash
cp .env.example .env
```

Edit the `.env` file with your own values.

## 💻 Development

```bash
# Run the backend (db -> pre-start -> backend)
docker compose --profile backend up --build -d

# Run the frontend
cd frontend
bun install
bun run dev
```

When the application is running, you can access the application at [http://localhost:3000](http://localhost:3000).

## 🧪 Testing

```bash
# Run all tests
bun run test

# Run with coverage report (ignore folder in ui folder)
bun run test --coverage

# Run a specific test file
bun run test test/unit/example.test.ts
```

## ✨ Linting

```bash
bun run lint
```
