FROM node:22-alpine AS build

RUN apk add --no-cache bash

WORKDIR /app

COPY package.json /app/
COPY .yarn /app/.yarn
COPY .yarnrc.yml /app/
COPY yarn.lock /app/
COPY prisma /app/prisma
RUN apk update \
  && apk add openssl

ENV NODE_ENV=production

RUN yarn workspaces focus -A --production
RUN yarn prisma:generate

FROM node:22-alpine AS runner

RUN apk add --no-cache bash

ENV NODE_ENV=production
ENV YARN_CACHE_FOLDER=/tmp/yarn-cache

WORKDIR /app

COPY --from=build /app/yarn.lock /app/
COPY --from=build /app/.yarnrc.yml /app/
COPY --from=build /app/.yarn /app/.yarn
COPY --from=build /app/package.json /app/
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/prisma /app/prisma
COPY next-logger.config.js /app/
COPY next.config.mjs /app/
COPY public /app/public/
COPY .next /app/.next
COPY run.sh /app/run.sh
RUN apk update \
  && apk add openssl
RUN chmod +x /app/run.sh

ENV NODE_ENV=production
ENV NODE_OPTIONS '-r next-logger'

EXPOSE 3000

CMD ["/app/run.sh"]
