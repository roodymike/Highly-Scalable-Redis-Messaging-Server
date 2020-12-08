FROM node:14
WORKDIR /usr/src/app
COPY package.json package-lock.json index.js users.js router.js redis_creds.json ./
RUN npm install
EXPOSE 12000
CMD ["node", "index.js"]