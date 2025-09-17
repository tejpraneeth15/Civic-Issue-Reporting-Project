const mongoose = require('mongoose');

async function connectToDatabase(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });
  return mongoose.connection;
}

module.exports = { connectToDatabase };


