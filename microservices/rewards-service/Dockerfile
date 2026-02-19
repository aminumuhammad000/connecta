FROM node:alpine

WORKDIR /app

# 1. Setup Common Library
COPY common /app/common
WORKDIR /app/common
RUN npm install
RUN npm run build

# 2. Setup Rewards Service
COPY rewards-service /app/rewards-service
WORKDIR /app/rewards-service
RUN npm install
RUN npm run build

CMD ["npm", "start"]
