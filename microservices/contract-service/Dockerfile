FROM node:alpine

WORKDIR /app

# 1. Setup Common Library
COPY common /app/common
WORKDIR /app/common
RUN npm install
RUN npm run build

# 2. Setup Contract Service
COPY contract-service /app/contract-service
WORKDIR /app/contract-service
RUN npm install
RUN npm run build

CMD ["npm", "start"]
