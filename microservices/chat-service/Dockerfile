FROM node:alpine

WORKDIR /app

# 1. Setup Common Library
COPY common /app/common
WORKDIR /app/common
RUN npm install
RUN npm run build

# 2. Setup Chat Service
COPY chat-service /app/chat-service
WORKDIR /app/chat-service
RUN npm install
RUN npm run build

CMD ["npm", "start"]
