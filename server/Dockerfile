FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN mkdir -p /app/uploads
RUN apk add --no-cache postgresql-client

EXPOSE 5000

CMD ["npm", "start"]