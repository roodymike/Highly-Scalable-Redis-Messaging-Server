FROM node:14
WORKDIR /usr/src/app
COPY package*.json app.mjs ./
RUN npm install
EXPOSE 12000
CMD ["node", "app.mjs"]