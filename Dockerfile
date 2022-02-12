FROM node:17.1-alpine3.12 As development
#RUN apk update && apk upgrade && \
#    apk add --no-cache bash postgresql-client git openssh
WORKDIR /usr/src/app
COPY app/package*.json ./
COPY --chown=755 static /var/www/app/
RUN npm install
RUN npm run build
COPY app/ .
CMD ["npm","run","start"]
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