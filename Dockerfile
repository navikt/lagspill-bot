FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24-slim AS runner

ENV NODE_ENV=production
ENV NODE_OPTIONS '-r next-logger'

WORKDIR /app

# Standalone inneholder server.js + alle prod node_modules
COPY .next/standalone ./
# Statiske assets (standalone forventer dem her)
COPY .next/static ./.next/static
COPY public ./public
# Drizzle-migreringer (kobles til migrate.mjs i neste steg)
COPY drizzle/migrations ./drizzle/migrations
COPY next-logger.config.js ./
COPY migrate.mjs ./

EXPOSE 3000

CMD ["node", "migrate.mjs"]
