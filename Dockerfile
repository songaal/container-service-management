FROM node:15

ENV PORT 3000

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY  . /app/

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]