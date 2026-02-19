# Connecta VPS Deployment Requirements

This document outlines the minimum and recommended requirements for running the Connecta microservices stack on a Virtual Private Server (VPS).

## 🖥 Hardware Requirements

Running 10+ microservices along with multiple databases (PostgreSQL, MongoDB) and infrastructure (RabbitMQ, Redis) requires a moderate amount of resources.

| Component | Minimum | Recommended |
| :--- | :--- | :--- |
| **vCPU** | 2 Cores | 4 Cores |
| **RAM** | 8 GB | 16 GB |
| **Storage** | 40 GB SSD | 80 GB NVMe SSD |
| **Network** | 100 Mbps | 1 Gbps |

> [!IMPORTANT]
> **RAM is the most critical factor.** Docker containers and databases (especially MongoDB and JVM-based ones) are memory-intensive. 8GB is the absolute minimum to avoid OOM (Out Of Memory) crashes.

---

## 🐧 Software Prerequisites

We recommend using **Ubuntu 22.04 LTS** or **Ubuntu 24.04 LTS** for maximum compatibility.

1.  **Docker Engine**: Latest stable version.
2.  **Docker Compose**: V2 (native to the docker command `docker compose`).
3.  **Git**: For cloning the repository.
4.  **Reverse Proxy (Optional but Recommended)**: Nginx or Caddy (for SSL termination and domain mapping).

---

## 🔒 Security & Networking

You should configure your VPS firewall (e.g., `ufw`) to expose only the necessary ports.

| Port | Service | Exposure |
| :--- | :--- | :--- |
| **80 / 443** | HTTP/HTTPS (via Reverse Proxy) | Public |
| **8000** | API Gateway (Direct Access) | Optional (Public) |
| **22** | SSH | Restricted to your IP |
| **Other Ports** | RabbitMQ, Postgres, Mongo, Redis | **Internal Only** |

---

## 🛠 Configuration Steps

### 1. Environment Variables
You must create a `.env` file in the root directory. Use the following as a template:

```env
# Infrastructure Credentials
RABBITMQ_USER=your_secure_user
RABBITMQ_PASS=your_secure_password
MONGO_USER=your_secure_admin
MONGO_PASS=your_secure_password
POSTGRES_USER=connecta_admin
POSTGRES_PASSWORD=your_secure_db_password

# Authentication
JWT_KEY=your_very_long_random_secret_key
```

### 2. Deployment Command
Once configured, use the following command to start the stack:

```bash
docker compose -f docker-compose.microservices.yml up -d
```

### 3. Verification
Run the verification script to ensure all services are healthy:

```bash
cd verification && npm run verify
```
