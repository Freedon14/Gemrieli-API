const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  if (isConnected) return;

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  isConnected = true;
  console.log('✅ MongoDB connected');
}

module.exports = { connectDB };