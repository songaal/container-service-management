FROM node:12

ENV PORT 3000

WORKDIR /app

COPY package.json /app/

RUN npm install

COPY  . .

RUN npm run build

EXPOSE 31010

CMD ["npm", "start"]