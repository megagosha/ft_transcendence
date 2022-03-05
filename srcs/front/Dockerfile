#FROM node:17.1-alpine3.12 AS frontapp
#WORKDIR /usr/src/app
#
#COPY ./ /usr/src/app
#RUN npm install
#COPY . .
#RUN npm run build
#
#FROM nginx:latest
#EXPOSE 8080:8080
##COPY nginx/nginx.conf /etc/nginx/nginx.conf
#COPY --from=frontapp /usr/src/app/dist /usr/share/nginx/html
#VOLUME ./nginx/nginx.conf:/etc/nginx/nginx.conf

FROM node:17-alpine as builder
WORKDIR /usr/src/app
COPY ./ /usr/src/app
RUN npm install
COPY . .
RUN npm run build

FROM nginx:latest as nginx
COPY --from=builder /usr/src/app/dist/front /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf && \
    rm /etc/nginx/nginx.conf
COPY ./nginx/default.conf /etc/nginx/templates/default.conf.template
COPY ./nginx/nginx.conf  /etc/nginx/nginx.conf
RUN envsubst '${NGINX_HOST_PORT} ${NGINX_HOSTNAME}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
