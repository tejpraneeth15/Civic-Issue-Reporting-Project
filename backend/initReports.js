// Script to initialize the database with sample reports for Ranchi district
// Usage: node initReports.js

const mongoose = require('mongoose');

const Report = require('./src/models/Report');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sih';

// Sample users (for demo, you can adjust usernames as needed)
const users = [
  { username: 'ravi123', password: 'password', mobileNumber: '9876543210' },
  { username: 'priya456', password: 'password', mobileNumber: '9123456780' },
  { username: 'amit_kumar', password: 'password', mobileNumber: '9000000001' },
  { username: 'sunita_yadav', password: 'password', mobileNumber: '9000000002' },
  { username: 'deepak_singh', password: 'password', mobileNumber: '9000000003' },
];

// Sample reports
// Sample reports
const reports = [
  // Sanitation
  {
    department: 'Sanitation',
    text: 'Yahan ka kachra koi nahi uthata, gali mein bahut gandagi hai.',
    district: 'Ranchi',
    municipality: 'Ranchi Municipal Corporation',
    media: [
      { url: '/uploads/sanitation/image1.jpg', filename: 'image1.jpg', type: 'image' },
      { url: '/uploads/sanitation/image2.jpg', filename: 'image2.jpg', type: 'image' },
      { url: '/uploads/sanitation/image3.jpg', filename: 'image3.jpg', type: 'image' },
    ],
    address: 'Near Main Road, Ranchi',
  },
  // Drainage
  {
    department: 'Drainage',
    text: 'Barish ke time pe saara paani sadak pe jama ho jata hai, nali band hai.',
    district: 'Ranchi',
    municipality: 'Ranchi Municipal Corporation',
    media: [
      { url: '/uploads/drainage/image1.jpg', filename: 'image1.jpg', type: 'image' },
      { url: '/uploads/drainage/image2.jpg', filename: 'image2.jpg', type: 'image' },
      { url: '/uploads/drainage/image3.jpg', filename: 'image3.jpg', type: 'image' },
    ],
    address: 'Kanke Road, Ranchi',
  },
  // Electricity
  {
    department: 'Electricity',
    text: 'Bijli kal raat se gayab hai, kaam kaise hoga? Please jaldi theek karo.',
    district: 'Ranchi',
    municipality: 'Ranchi Municipal Corporation',
    address: 'Harmu Colony, Ranchi',
  },
  // Water Supply
  {
    department: 'WaterSupply',
    text: 'Pani ki supply do din se nahi aa rahi, ghar mein pareshani ho rahi hai.',
    district: 'Ranchi',
    municipality: 'Ranchi Municipal Corporation',
    address: 'Lalpur Chowk, Ranchi',
  },
  // Sanitation (2nd municipality)
  {
    department: 'Sanitation',
    text: 'Ghar ke paas kachra ka dher lag gaya hai, badbu aa rahi hai.',
    district: 'Ranchi',
    municipality: 'Ratu Municipal Council',
    media: [
      { url: '/uploads/sanitation/image1.jpg', filename: 'image1.jpg', type: 'image' },
      { url: '/uploads/sanitation/image2.jpg', filename: 'image2.jpg', type: 'image' },
    ],
    address: 'Ratu Road, Ranchi',
  },
  // Drainage (2nd municipality)
  {
    department: 'Drainage',
    text: 'Nali saaf nahi hoti, paani sadak pe aa jata hai.',
    district: 'Ranchi',
    municipality: 'Ratu Municipal Council',
    media: [
      { url: '/uploads/drainage/image1.jpg', filename: 'image1.jpg', type: 'image' },
    ],
    address: 'Piska More, Ranchi',
  },
  // Electricity (2nd municipality)
  {
    department: 'Electricity',
    text: 'Roz power cut ho raha hai, bachon ka padhai disturb ho raha hai.',
    district: 'Ranchi',
    municipality: 'Ratu Municipal Council',
    address: 'Hatia, Ranchi',
  },
  // Water Supply (2nd municipality)
  {
    department: 'WaterSupply',
    text: 'Pani bahut kam pressure se aa raha hai, tank bhar nahi pa raha.',
    district: 'Ranchi',
    municipality: 'Ratu Municipal Council',
    address: 'Tupudana, Ranchi',
  },
  // Additional sample reports for a richer feed
  {
    department: 'Sanitation',
    text: 'Yahan safai nahi hoti, gali mein kachra hi kachra hai.',
    district: 'Ranchi',
    municipality: 'Ranchi Municipal Corporation',
    media: [
      { url: '/uploads/sanitation/image2.jpg', filename: 'image2.jpg', type: 'image' }
    ],
    address: 'Doranda, Ranchi',
  },
  {
    department: 'Drainage',
    text: 'Nali band hai, paani sadak pe aa gaya.',
    district: 'Ranchi',
    municipality: 'Ratu Municipal Council',
    media: [
      { url: '/uploads/drainage/image3.jpg', filename: 'image3.jpg', type: 'image' }
    ],
    address: 'Argora, Ranchi',
  },
  {
    department: 'Electricity',
    text: 'Bijli chali gayi, generator bhi kaam nahi kar raha.',
    district: 'Ranchi',
    municipality: 'Ranchi Municipal Corporation',
    address: 'Morabadi, Ranchi',
  },
  {
    department: 'WaterSupply',
    text: 'Pani bahut ganda aa raha hai, filter bhi nahi kaam kar raha.',
    district: 'Ranchi',
    municipality: 'Ratu Municipal Council',
    address: 'Kokar, Ranchi',
  },
  {
    department: 'Sanitation',
    text: 'Kachra gadi do din se nahi aayi.',
    district: 'Ranchi',
    municipality: 'Ranchi Municipal Corporation',
    address: 'Lalpur, Ranchi',
  },
  {
    department: 'Drainage',
    text: 'Nali saaf karwa do, machhar bahut ho gaye hain.',
    district: 'Ranchi',
    municipality: 'Ratu Municipal Council',
    address: 'Hatia, Ranchi',
  }
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Remove all existing reports
  await Report.deleteMany({});
  console.log('Old reports removed');

  // Remove all users except admin (if any)
  await User.deleteMany({ username: { $nin: ['admin'] } });
  console.log('Old users removed (except admin)');

  // Ensure users exist (create if not)
  const userDocs = [];
  for (const u of users) {
    let user = await User.findOne({ username: u.username });
    if (!user) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      user = new User({ username: u.username, mobileNumber: u.mobileNumber, passwordHash });
      await user.save();
    }
    userDocs.push(user);
  }

  // Add new reports, assign to users alternately
  for (let i = 0; i < reports.length; i++) {
    const report = new Report({ ...reports[i], user: userDocs[i % userDocs.length]._id });
    await report.save();
  }
  console.log('Sample reports added');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
