
FROM node:18-alpine


WORKDIR /app


COPY package*.json ./


RUN npm install


COPY . .

RUN mkdir -p /app/uploads


RUN apk add --no-cache postgresql-client

RUN npm run build

EXPOSE 5000

CMD ["node", "server.js"]