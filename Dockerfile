
FROM node:20-alpine as runner

RUN apk add --no-cache bash

ENV NODE_ENV production
ENV YARN_CACHE_FOLDER /tmp/yarn-cache

WORKDIR /app

COPY package.json /app/
COPY .yarn /app/.yarn
COPY .yarnrc.yml /app/
COPY yarn.lock /app/
COPY prisma /app/prisma
COPY node_modules /app/node_modules
COPY next-logger.config.js /app/
COPY public /app/public/
COPY .next /app/.next
COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh

ENV NODE_ENV=production
ENV NODE_OPTIONS '-r next-logger'

EXPOSE 3000

CMD ["/app/run.sh"]
