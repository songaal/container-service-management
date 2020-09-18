FROM node:14

ENV NODE_ENV=production

WORKDIR /app

RUN npm install next react react-dom -g

COPY package.json .

RUN npm install

COPY  . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
