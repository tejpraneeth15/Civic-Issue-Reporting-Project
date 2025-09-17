const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
  username: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true },
    passwordHash: { type: String, required: true },
    district: { type: String },
    municipality: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);


