FROM node:14.15.1-alpine as build

WORKDIR /usr/share/web

COPY ./ ./

RUN npm i

RUN npm run build

FROM nginx:1.15.1

RUN apt-get update && apt-get install -y apt-transport-https apt-utils ca-certificates gnupg

COPY --from=build /usr/share/web/build /usr/share/web/build

RUN rm -f /etc/nginx/nginx.conf
RUN rm -f /etc/nginx/conf.d/default.conf

#COPY /etc/letsencrypt/live/jitsi.helloeva.net/fullchain.pem ./nginx/localhost.crt
#COPY /etc/letsencrypt/live/jitsi.helloeva.net/privkey.pem ./nginx/localhost.key

COPY ./nginx/ /etc/nginx/

EXPOSE 80 443

CMD ["nginx"]
