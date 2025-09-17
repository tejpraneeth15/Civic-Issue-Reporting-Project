const express = require('express');
const auth = require('../middleware/auth');
const { listDistricts, listMunicipalities, setLocation, setLocationValidation } = require('../controllers/locationController');

const router = express.Router();

router.get('/districts', listDistricts);
router.get('/municipalities/:district', listMunicipalities);
router.post('/set', auth, setLocationValidation, setLocation);

module.exports = router;


