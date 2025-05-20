FROM node:18-alpine

WORKDIR /app

# Сначала копируем только файлы зависимостей
COPY package.json package-lock.json* ./

RUN npm install

# Затем копируем остальные файлы
COPY . .

RUN mkdir -p /app/uploads
RUN apk add --no-cache postgresql-client
RUN npm run build

EXPOSE 5000
CMD ["node", "server.js"]