# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY command ./command
COPY public ./public
COPY src ./src
COPY astro.config.mjs tsconfig.json ./

ARG SITE_URL=http://localhost:3000
ARG BASE_PATH=/
ENV SITE_URL=$SITE_URL
ENV BASE_PATH=$BASE_PATH

RUN npm run build

FROM wcjiang/docker-static-website:latest
COPY --from=build /app/dist .
