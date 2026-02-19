FROM node:alpine

WORKDIR /app

# 1. Setup Common Library
COPY common /app/common
WORKDIR /app/common
RUN npm install
RUN npm run build

# 2. Setup Proposal Service
COPY proposal-service /app/proposal-service
WORKDIR /app/proposal-service
RUN npm install
RUN npm run build

CMD ["npm", "start"]
