FROM oven/bun AS builder
WORKDIR /app

COPY package*.json ./
RUN bun install

COPY . .
RUN bun run build

FROM oven/bun
WORKDIR /app

COPY --from=builder /app /app
CMD ["bun", "run", "start"]