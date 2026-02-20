FROM node:alpine

WORKDIR /app

# 1. Setup Common Library
COPY common /app/common
WORKDIR /app/common
RUN npm install
RUN npm run build

# 2. Setup Verification Service
COPY verification-service /app/verification-service
WORKDIR /app/verification-service
RUN npm install
RUN npm run build

CMD ["npm", "start"]
