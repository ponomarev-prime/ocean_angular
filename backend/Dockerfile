FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# скопируем остальной код
COPY . .

# порт приложения (внутри контейнера)
EXPOSE 3000

CMD ["node", "server.js"]
