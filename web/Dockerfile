FROM node:14.15.1-alpine

WORKDIR /usr/share/web

COPY ./ ./

RUN npm ci

CMD ["npm", "run", "build"]