FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Environment variables will be provided at runtime via .env or docker-compose
EXPOSE 5001

CMD ["npm", "run", "dev"]
