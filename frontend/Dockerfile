FROM oven/bun:latest

WORKDIR /app

COPY bun.lockb /app/
COPY package*.json /app/

RUN bun install

COPY ./ /app/

ENV NODE_ENV=production
ENV PATH="/app/.venv/bin:$PATH"

RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start"]
