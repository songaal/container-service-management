FROM node:12

ENV NODE_ENV=production

ENV PORT 3000

RUN apt update && apt install -y docker-compose

WORKDIR /app

COPY package.json .

RUN npm install

COPY  . .

RUN npm run build

RUN mkdir -p /data/dockerComposeFiles

RUN npx sequelize-cli db:migrate

RUN npx sequelize db:seed:all

COPY docker-compose-Linux-x86_64 /usr/local/bin/docker-compose

RUN chmod +x /usr/local/bin/docker-compose

RUN echo 'alias docker-compose="/usr/local/bin/docker-compose"' >> ~/.bashrc

RUN echo $(docker–compose -version)

CMD ["npm", "start"]
