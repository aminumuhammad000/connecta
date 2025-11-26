# MongoDB Setup Guide for Connecta

## Quick Start (Demo Mode)

The admin dashboard now works in **Demo Mode** without MongoDB! 

**Login with:**
- Email: `admin@connecta.com`
- Password: `demo1234`

The app will automatically use mock data if MongoDB is not available.

---

## Production Setup Options

### Option 1: Install MongoDB Locally (Ubuntu/Debian)

```bash
# Import MongoDB public GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] \
  https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update packages and install
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify it's running
sudo systemctl status mongod
```

### Option 2: Use Docker (Recommended for Development)

```bash
# Install Docker
sudo snap install docker

# Start MongoDB container
docker-compose up -d

# Verify container is running
docker ps | grep mongo
```

### Option 3: MongoDB Atlas (Cloud - Free Tier Available)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free M0 tier)
4. Get your connection string
5. Update `.env`:
```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/connecta?retryWrites=true&w=majority
```

---

## Create Admin User

Once MongoDB is running:

```bash
# Run the admin creation script
node scripts/create-admin.js
```

This will create an admin user with:
- Email: `admin@connecta.com`
- Password: `demo1234`
- User Type: `admin`

---

## Verify Setup

```bash
# Test MongoDB connection
node test-mongo.js

# Start the server
npm run dev

# The server should connect successfully
```

---

## Troubleshooting

### MongoDB Connection Failed

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
1. Check if MongoDB is running: `sudo systemctl status mongod`
2. Start MongoDB: `sudo systemctl start mongod`
3. Check MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::27017`

**Solution:**
```bash
# Find process using port 27017
sudo lsof -i :27017

# Kill the process
sudo kill -9 <PID>
```

### Invalid Connection String

**Error:** `Invalid scheme, expected connection string to start with "mongodb://"`

**Solution:**
Update `.env` file with proper format:
```bash
MONGO_URI=mongodb://localhost:27017/connecta
```

---

## Current Configuration

**Database:** connecta  
**Port:** 27017  
**Connection String:** `mongodb://localhost:27017/connecta`

**Collections:**
- users
- projects
- contracts
- jobs
- proposals
- payments
- reviews
- notifications
- messages

---

## Need Help?

- MongoDB Documentation: https://docs.mongodb.com/
- Docker Documentation: https://docs.docker.com/
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
