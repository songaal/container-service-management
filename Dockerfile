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

CMD ["npm", "start"]
