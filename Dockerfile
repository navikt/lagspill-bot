FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24-slim

ENV NODE_ENV=production
ENV PORT=3000
ENV TZ=Europe/Oslo

WORKDIR /app

# esbuild-bundle med alle avhengigheter inlinet - ingen node_modules i imaget
COPY dist ./dist
# Drizzle leser migreringsfilene fra disk ved oppstart
COPY drizzle/migrations ./drizzle/migrations

EXPOSE 3000

# Baseimaget har ENTRYPOINT ["node"], så CMD skal kun inneholde scriptnavnet
CMD ["dist/index.js"]
