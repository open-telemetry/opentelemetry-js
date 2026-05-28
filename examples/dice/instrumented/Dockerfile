FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install --omit=dev --package-lock=false

COPY app.js dice.js instrumentation.mjs ./

EXPOSE 8080
CMD ["node", "--import", "./instrumentation.mjs", "app.js"]
