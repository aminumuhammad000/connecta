# MongoDB Setup Complete ✅

## Installation Details

### Version Installed
- **MongoDB**: 7.0.26
- **Source**: Ubuntu Jammy (22.04) repository
- **Installation Date**: November 25, 2025

### Installation Commands Used
```bash
# Add MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Add MongoDB repository (Jammy for Ubuntu 24.04 compatibility)
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start and enable service
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Service Management

### Check Status
```bash
sudo systemctl status mongod
```

### Start/Stop/Restart
```bash
sudo systemctl start mongod
sudo systemctl stop mongod
sudo systemctl restart mongod
```

### View Logs
```bash
sudo journalctl -u mongod -f
```

## Database Configuration

### Connection Details
- **Host**: localhost
- **Port**: 27017
- **Database**: connecta
- **Connection String**: `mongodb://localhost:27017/connecta`

### Admin Accounts Created
1. **Primary Admin**
   - Email: admin@connecta.com
   - Password: demo1234
   - ID: 69258ed67d3fd299a712c5c0
   - Name: Admin User
   - Role: admin

2. **Secondary Admin**
   - Email: safe@admin.com
   - Password: imsafe
   - ID: 69258ed67d3fd299a712c5c3
   - Name: Safe Admin
   - Role: admin

Both passwords are hashed with bcryptjs (10 salt rounds).

## MongoDB Shell Access

### Connect to Database
```bash
mongosh
```

### Switch to Connecta Database
```javascript
use connecta
```

### View Collections
```javascript
show collections
```

### Query Admin Users
```javascript
db.users.find({ role: 'admin' })
```

### Count Documents
```javascript
db.users.countDocuments()
db.projects.countDocuments()
db.contracts.countDocuments()
```

## Backup & Restore

### Create Backup
```bash
mongodump --db connecta --out /path/to/backup/
```

### Restore Backup
```bash
mongorestore --db connecta /path/to/backup/connecta/
```

## Troubleshooting

### Check if MongoDB is Running
```bash
ps aux | grep mongod
```

### Check MongoDB Port
```bash
sudo lsof -i :27017
```

### Restart if Connection Fails
```bash
sudo systemctl restart mongod
sudo systemctl status mongod
```

### View Configuration
```bash
cat /etc/mongod.conf
```

## Security Considerations

### Current Setup
- Running on localhost only (no external access)
- No authentication required (development mode)
- Default configuration file: `/etc/mongod.conf`

### For Production
Consider:
- Enable authentication
- Create user-specific accounts with limited permissions
- Use SSL/TLS for connections
- Bind to specific IP addresses
- Set up firewall rules
- Enable audit logging
- Regular backups

## Integration with Backend

### Environment Variable
In `server/.env`:
```
MONGO_URI=mongodb://localhost:27017/connecta
```

### Connection Code
The backend automatically connects when started:
```javascript
// server/src/config/db.config.ts
await mongoose.connect(process.env.MONGO_URI)
```

## Verification

Run this in mongosh to verify setup:
```javascript
use connecta
db.users.find({ role: 'admin' }).count() // Should return 2
db.users.findOne({ email: 'admin@connecta.com' }) // Should show admin details
```

## Next Steps

1. ✅ MongoDB installed and running
2. ✅ Admin accounts created
3. ⏳ Integrate remaining pages with APIs
4. ⏳ Add sample data for testing
5. ⏳ Set up automated backups (optional)

---

**Last Updated**: November 25, 2025
**Status**: ✅ Operational
