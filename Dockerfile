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

# Replace the clerk publishable key with a static one at build time so we can replace it
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsudGFjdGxhYi5hcml0aGVmaXJzdC5jb20k
RUN bun next telemetry disable
RUN bun run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# Drizzle Stuff
COPY --from=build /app/drizzle.config.ts ./
COPY --from=build /app/src/db/schema ./src/db/schema
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/tsconfig.json ./
RUN bun i drizzle-kit

RUN chmod 755 .

# Custom entrypoint that runs drizzle migrations
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
LABEL org.opencontainers.image.source https://github.com/arithefirst/tactlab

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["bun", "server.js"]
