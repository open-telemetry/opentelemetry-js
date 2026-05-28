FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install --omit=dev --package-lock=false

COPY app.js dice.js ./

EXPOSE 8080
CMD ["node", "app.js"]
