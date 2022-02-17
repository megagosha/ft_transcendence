FROM node:17.1-alpine3.12
RUN apk update && apk upgrade && apk add bash

# Можно установить все необходимые зависимости и обновить их вот так >>>
# install node dependencies
RUN npm install -g npm@7.20.1 && \
   npm install -g @nestjs/cli && \
   npm install -g typeorm

# Давай добавим timezone >>>>
# set right timezone
RUN apk add --no-cache tzdata && \
   ln -snf /usr/share/zoneinfo/Europe/Moscow /etc/localtime && \
   echo Europe/Moscow > /etc/timezone

#check 
WORKDIR /usr/src/app
#COPY *.json ./
#COPY --chown=755 ../static /var/www/app/
COPY . .
RUN npm install && nest update && npm run build

EXPOSE ${NESTJS_CONTAINER_PORT}

#COPY ./start.sh .
ENTRYPOINT ["/bin/bash", "./start.sh"]

#ENTRYPOINT npm run start

#FROM node:12.13-alpine as production
#
#ARG NODE_ENV=production
#ENV NODE_ENV=${NODE_ENV}
#
#WORKDIR /usr/src/app
#
#COPY app/package*.json ./
#
##RUN npm install --only=production
#
#COPY . .
#
#COPY --from=development /usr/src/app/dist ./dist
#
#ENTRYPOINT ["/bin/bash", ""]
##CMD ["node", "dist/main"]