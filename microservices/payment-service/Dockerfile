FROM node:alpine

WORKDIR /app

# 1. Setup Common Library
COPY common /app/common
WORKDIR /app/common
RUN npm install
RUN npm run build

# 2. Setup Payment Service
COPY payment-service /app/payment-service
WORKDIR /app/payment-service
RUN npm install
RUN npm run build

CMD ["npm", "start"]
