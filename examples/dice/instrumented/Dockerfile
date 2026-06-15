FROM node:22-alpine

WORKDIR /usr/src/app

COPY package.json tsconfig.json ./
RUN npm install --package-lock=false

COPY *.ts ./
RUN npx tsc

EXPOSE 8080
CMD ["node", "--import", "./build/instrumentation.js", "build/app.js"]
