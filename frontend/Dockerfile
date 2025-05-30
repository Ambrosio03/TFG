FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5173

ENV HOST=0.0.0.0

CMD ["sh", "-c", "npm run preview -- --host 0.0.0.0 --port $PORT"]
