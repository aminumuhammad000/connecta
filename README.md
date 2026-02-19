# Connecta Project

Connecta is a microservices-based platform for decentralized workforce and real-time collaboration.

## 🚀 How to Run the Microservices

The easiest way to run the entire backend stack is using **Docker Compose**.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v16+ for local development)

### 1. Start the Full Stack (Docker)

To start all databases, infrastructure (RabbitMQ, Redis), and microservices:

```bash
docker-compose -f docker-compose.microservices.yml up -d
```

To view logs:
```bash
docker-compose -f docker-compose.microservices.yml logs -f
```

### 2. Individual Service Development (Local)

If you want to run a specific service locally for development:

1.  **Start Infrastructure Services (DBs, RabbitMQ, Redis):**
    ```bash
    # Only starts the databases and messaging queues
    docker-compose -f docker-compose.microservices.yml up -d rabbitmq auth-db rewards-db proposal-db contract-db payment-db mongo redis
    ```

2.  **Environment Variables:**
    Ensure you have a `.env` file in the root directory (based on `.env.example`).

3.  **Run a specific service:**
    ```bash
    cd microservices/auth-service
    npm install
    npm run dev
    ```

### 3. Verify System Status

We provide a verification script to check if all microservices are healthy and reachable via the API Gateway.

```bash
cd verification
npm install
npm run verify
```

## 🛠 Project Structure

- `microservices/`: Individual service source code.
- `server/`: Legacy/Monolithic server components.
- `connecta-app/`: Mobile application source code (Expo/React Native).
- `admin/`: Admin dashboard.
- `scripts/`: Maintenance and backup scripts.

## 📄 License
MIT
