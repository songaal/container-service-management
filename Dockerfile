FROM node:12

ENV PORT 3000

RUN curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

RUN chmod +x /usr/local/bin/docker-compose

RUN ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

WORKDIR /app

COPY package.json .

RUN npm install

COPY  . .

RUN npm run build

CMD ["npm", "start"]