FROM node:17.1-alpine3.12 AS builder
WORKDIR /usr/src/app

# install and cache app dependencies
COPY package.json ./
RUN npm install
COPY . .
EXPOSE ${ANGULAR_CONTAINER_PORT}

#moved to docker-compose.yml
#RUN npm start
