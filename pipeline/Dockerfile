FROM ghcr.io/osgeo/gdal:alpine-small-latest

RUN apk add --no-cache nodejs yarn git

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

# Copy your Node scripts into the container
COPY src/ ./src/
COPY cli.js ./
RUN chmod +x cli.js
