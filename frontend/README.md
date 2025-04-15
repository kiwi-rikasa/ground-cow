# 🐄 Ground Cow - Frontend

The frontend is built with [Bun](https://bun.sh/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Next.js](https://nextjs.org/) and [Shadcn UI](https://ui.shadcn.com/).

## Setup

```bash
cp .env.example .env
```

Edit the `.env` file with your own values.

## Development

```bash
cd frontend
bun install
bun run dev
```

## Test

```bash
# Run all tests
bun run test

# Run with coverage report (ignore folder in ui folder)
bun run test --coverage

# Run a specific test file
bun run test test/unit/example.test.ts
```

## Lint

```bash
bun run lint
```
