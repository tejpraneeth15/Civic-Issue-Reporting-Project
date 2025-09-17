// This script creates a dummy admin user with username 'admin' and password 'admin@123'.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./src/models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI, { autoIndex: true });
  const username = 'admin';
  const password = 'admin@123';
  const mobileNumber = '9999999999'; // Dummy mobile number

  const existing = await User.findOne({ username });
  if (existing) {
    console.log('Admin user already exists.');
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ username, passwordHash, mobileNumber });
  console.log('Admin user created: username=admin, password=admin@123');
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('Failed to create admin user:', err);
  process.exit(1);
});
