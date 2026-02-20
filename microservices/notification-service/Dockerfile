FROM node:alpine

WORKDIR /app

# 1. Setup Common Library
COPY common /app/common
WORKDIR /app/common
RUN npm install
RUN npm run build

# 2. Setup Notification Service
COPY notification-service /app/notification-service
WORKDIR /app/notification-service
RUN npm install
RUN npm run build

CMD ["npm", "start"]
