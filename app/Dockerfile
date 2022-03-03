#FROM node:17-alpine
#WORKDIR /usr/src/app
#COPY ./ ./
#RUN npm install -g npm@7.20.1 && \
#   npm install -g @nestjs/cli && \
#   npm install -g typeorm && \
#    npm install -g rimraf
#RUN apk add --no-cache tzdata python3 && \
#   ln -snf /usr/share/zoneinfo/Europe/Moscow /etc/localtime && \
#   echo Europe/Moscow > /etc/timezone \
#RUN npm install
#COPY . .
#RUN npm run build
#CMD ["npm", "run", "start:prod"]
FROM node:17-alpine as builder

ENV NODE_ENV build

#USER node
WORKDIR /home/node

COPY package*.json ./
RUN apk update
RUN apk add --no-cache python3 py3-pip make g++
RUN npm install -g @nestjs/cli
RUN npm ci

COPY --chown=node:node . .
#COPY . .
RUN npm run build

FROM node:17-alpine
ENV NODE_ENV production

USER node
WORKDIR /home/node

COPY --from=builder  --chown=node:node  /home/node/package*.json ./
COPY --from=builder  --chown=node:node  /home/node/node_modules/ ./node_modules/
COPY --from=builder  --chown=node:node /home/node/tsconfig.build.json ./
COPY --from=builder  --chown=node:node /home/node/ormconfig.json ./
COPY --from=builder  --chown=node:node /home/node/dist/ ./dist/
RUN mkdir -p /home/node/static/files/
COPY --chown=node:node ./static/files/chat/default.png /home/node/static/files/
#RUN mkdir -p /home/node/static/files/user/ && \
#    mkdir -p /home/node/static/files/chat \
#CMD ["npm", "run", "start:prod"]
COPY --chown=node:node ./start.sh /home/start.sh
ENTRYPOINT ["/bin/sh", "/home/start.sh"]