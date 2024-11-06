# Use an official Node.js image as the base
FROM node:16-alpine

RUN apk add --no-cache python3 python3-dev py3-pip build-base
WORKDIR /app
COPY package.json ./
RUN yarn install
COPY . .
COPY gen-types.sh .
RUN chmod +x gen-types.sh
RUN ls -la gen-types.sh
RUN apk add --no-cache bash
RUN ./gen-types.sh
ENTRYPOINT ["yarn"]
