# -- BUILD IMAGE --
FROM node:latest as BUILDER
WORKDIR /app
RUN yarn global add @quasar/cli
COPY . .
RUN npm install
RUN quasar build

# -- RUNNER IMAGE --
FROM nginx:1.17.5-alpine as RUNNER
COPY --from=BUILDER /app/dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
