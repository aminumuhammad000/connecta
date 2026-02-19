FROM node:alpine

WORKDIR /app

# 1. Setup Common Library
COPY common /app/common
WORKDIR /app/common
RUN npm install
RUN npm run build

# 2. Setup Job Service
COPY job-service /app/job-service
WORKDIR /app/job-service
RUN npm install
RUN npm run build

CMD ["npm", "start"]
