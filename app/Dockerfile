FROM node:17.1-alpine3.12
RUN apk update && apk upgrade && apk add bash

# install node dependencies
RUN npm install -g npm@7.20.1 && \
   npm install -g @nestjs/cli && \
   npm install -g typeorm

# set right timezone
RUN apk add --no-cache tzdata && \
   ln -snf /usr/share/zoneinfo/Europe/Moscow /etc/localtime && \
   echo Europe/Moscow > /etc/timezone

WORKDIR /usr/src/app
COPY . .
#moved from start.sh for restart time decrease
RUN npm install && nest update && npm run build

EXPOSE ${NESTJS_CONTAINER_PORT}

ENTRYPOINT ["/bin/bash", "./start.sh"]
