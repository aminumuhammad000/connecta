FROM node:alpine

WORKDIR /app

# api-gateway might not need common yet, but setting up structure for consistency
COPY api-gateway /app/api-gateway
WORKDIR /app/api-gateway
RUN npm install
RUN npm run build

CMD ["npm", "start"]
