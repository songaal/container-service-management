FROM dcr.danawa.io/node:14

ENV NODE_ENV=production

WORKDIR /app

RUN npm install -g next react react-dom --unsafe-perm=true --allow-root

COPY package.json .

RUN npm install

COPY  . .

RUN next build

EXPOSE 3000

CMD ["next", "start", "--hostname", "0.0.0.0"]