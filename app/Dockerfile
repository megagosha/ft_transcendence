FROM node:17.1-alpine3.12

RUN apk update && apk upgrade

# install node dependencies
RUN npm install -g npm@7.20.1 && \
    npm install -g @nestjs/cli && \
    npm install -g typeorm

# clean cache
RUN apk add --no-cache bash postgresql-client git openssh && \
    rm -rf /tmp/* /var/cache/apk/*

# setup workdir
WORKDIR /usr/src/app

# set right timezone
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/Europe/Moscow /etc/localtime && \
    echo Europe/Moscow > /etc/timezone

#COPY app/package*.json ./

# copying static files
COPY --chown=755 ../static /var/www/app/
#COPY app/ .

# setup backend server
COPY ./start.sh /tmp
EXPOSE ${BACKEND_CONTAINER_PORT}
ENTRYPOINT ["/bin/bash", "/tmp/start.sh"]



