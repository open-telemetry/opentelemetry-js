FROM node:26-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5

WORKDIR /usr/src/app

COPY package.json tsconfig.json ./
RUN npm install --package-lock=false

COPY *.ts ./
RUN npx tsc

EXPOSE 8080
CMD ["node", "--import", "./build/instrumentation.js", "build/app.js"]
