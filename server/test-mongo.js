const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/connecta')
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.log('❌ MongoDB connection failed:', err.message);
    console.log('\n💡 Solutions:');
    console.log('1. Install MongoDB: sudo apt install mongodb-server');
    console.log('2. Or use Docker: sudo snap install docker && docker-compose up -d');
    console.log('3. Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas');
  });
