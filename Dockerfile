FROM oven/bun:latest as base
WORKDIR /app

# Dependency Stage
FROM base AS deps
COPY package.json .
COPY bun.lock .

RUN bun install --omit-dev

# Build Stage
FROM deps AS build
COPY . .

RUN bun next telemetry disable
RUN bun run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
RUN chmod 755 .

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

CMD ["bun", "server.js"]