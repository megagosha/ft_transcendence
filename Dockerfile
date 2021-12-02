FROM node:17.1-alpine3.12 As development
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

WORKDIR /usr/src/app
COPY app/package*.json ./
COPY app/ .
RUN npm install
RUN npm run build
CMD ["npm","run","start:dev"]
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