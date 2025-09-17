const express = require('express');
const { register, registerValidation, login, loginValidation, changePassword, changePasswordValidation } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Get current user info
router.get('/me', auth, require('../controllers/authController').me);

router.post('/change-password', auth, changePasswordValidation, changePassword);

module.exports = router;


