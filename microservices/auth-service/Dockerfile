FROM node:alpine

WORKDIR /app

# 1. Setup Common Library
COPY common /app/common
WORKDIR /app/common
# We need to install common dependencies and build it
RUN npm install
RUN npm run build

# 2. Setup Auth Service
COPY auth-service /app/auth-service
WORKDIR /app/auth-service
# npm install will resolve file:../common correctly because we copied it to /app/common
RUN npm install
RUN npm run build

CMD ["npm", "start"]
