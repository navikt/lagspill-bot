FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24-slim AS runner

ENV NODE_ENV=production
ENV NODE_OPTIONS '-r next-logger'
ENV PORT=3000
ENV TZ=Europe/Oslo

WORKDIR /app

# Standalone inneholder server.js + alle prod node_modules
COPY .next/standalone ./
# Statiske assets (standalone forventer dem her)
COPY .next/static ./.next/static
COPY public ./public
# Drizzle-migreringer kjøres fra src/instrumentation.ts ved oppstart
COPY drizzle/migrations ./drizzle/migrations
COPY next-logger.config.js ./

EXPOSE 3000

# Baseimaget har ENTRYPOINT ["node"], så CMD skal kun inneholde scriptnavnet
CMD ["server.js"]
