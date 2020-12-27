FROM node:14
WORKDIR /usr/src/app
COPY package.json package-lock.json index.mjs ./
RUN npm install
EXPOSE 12000
CMD ["node", "index.mjs"]