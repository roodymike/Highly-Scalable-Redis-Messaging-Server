
FROM haproxy:1.7
COPY haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg
FROM node:12
RUN mkdir -p /home/node/serverapp
WORKDIR /home/node/serverapp

COPY package.json /home/node/serverapp
COPY app /home/node/serverapp
RUN npm install --silent

CMD ["npm","start"]