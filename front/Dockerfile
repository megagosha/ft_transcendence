#base image
FROM node:17.1-alpine3.12 AS builder
#FROM node:latest AS builder
# set working directory
WORKDIR /usr/src/app

# add `/app/node_modules/.bin` to $PATH
#ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
#COPY package.json /app
COPY package.json ./
#RUN npm ci --quiet
#ARG configuration=production
RUN npm install
#RUN npm install d3
#RUN npm install -g @angular/cli
COPY . .
EXPOSE 4200

#RUN npm run build

# start app
#CMD $(npm bin)/ng serve
#RUN npm start
