// Get current user info
async function me(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: {
      id: user._id,
      username: user.username,
      mobileNumber: user.mobileNumber,
      district: user.district,
      municipality: user.municipality,
    }});
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
}
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const registerValidation = [
  body('username').isString().isLength({ min: 4 }).trim(),
  body('mobileNumber').isString().isLength({ min: 8 }).trim(),
  body('password').isString().isLength({ min: 6 }),
];

async function register(req, res) {
  console.log('Register request body:', req.body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array(), message: 'Validation failed' });
    }

    const { username, mobileNumber, password } = req.body;
    if (!username || !mobileNumber || !password) {
      console.error('Missing username, mobile number, or password');
      return res.status(400).json({ message: 'username, mobile number, and password are required' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      console.error('Username already registered:', username);
      return res.status(409).json({ message: 'Username already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, mobileNumber, passwordHash });

    return res.status(201).json({
      user: { id: user._id, username: user.username, mobileNumber: user.mobileNumber, district: user.district, municipality: user.municipality },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
}

const loginValidation = [
  body('username').isString().trim(),
  body('password').isString(),
];

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    token,
    user: { id: user._id, mobileNumber: user.mobileNumber, district: user.district, municipality: user.municipality },
  });
}

// Change password
const changePasswordValidation = [
  body('currentPassword').isString(),
  body('newPassword').isString().isLength({ min: 6 }),
];

async function changePassword(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  return res.json({ success: true });
}

module.exports = { register, registerValidation, login, loginValidation, changePassword, changePasswordValidation, me };


