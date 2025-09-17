const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const DISTRICTS = {
  'Bokaro': ['Phusro', 'Chas'],
  'Chatra': ['Chatra'],
  'Deoghar': ['Deoghar', 'Madhupur'],
  'Dhanbad': ['Dhanbad', 'Chirkunda'],
  'Dumka': ['Basukinath', 'Dumka'],
  'Garhwa': ['Majhion', 'Garhwa'],
  'Giridih': ['Giridih'],
  'Godda': ['Godda'],
  'Gumla': ['Gumla'],
  'Hazaribagh': ['Hazaribagh'],
  'Jamtara': ['Jamtara', 'Mihijam'],
  'Khunti': ['Khunti'],
  'Kodarma': ['Kodarma', 'Jhumri Tilaiya'],
  'Latehar': ['Latehar'],
  'Lohardaga': ['Lohardaga'],
  'Pakur': ['Pakur'],
  'Palamu': ['Hussainabad', 'Bishrampur', 'Medininagar (Daltonganj)'],
  'West Singhbhum': ['Chakardharpur', 'Chaibasa'],
  'East Singhbhum': ['Mango', 'Jamshedpur', 'Jugsalai', 'Chakulia'],
  'Ramgarh': ['Ramgarh (Cantonment)'],
  'Ranchi': ['Ranchi', 'Bundu'],
  'Sahibganj': ['Sahibganj', 'Rajmahal'],
  'Seraikela-Kharsawan': ['Adityapur', 'Seraikela'],
  'Simdega': ['Simdega'],
};

function listDistricts(req, res) {
  return res.json({ districts: Object.keys(DISTRICTS) });
}

function listMunicipalities(req, res) {
  const { district } = req.params;
  const list = DISTRICTS[district] || [];
  return res.json({ municipalities: list });
}

const setLocationValidation = [
  body('district').isString().notEmpty(),
  body('municipality').isString().notEmpty(),
];

async function setLocation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { district, municipality } = req.body;
  const allowed = DISTRICTS[district] || [];
  if (!allowed.includes(municipality)) {
    return res.status(400).json({ message: 'Invalid municipality for district' });
  }
  const user = await User.findByIdAndUpdate(
    req.userId,
    { district, municipality },
    { new: true }
  );
  return res.json({ user: { id: user._id, mobileNumber: user.mobileNumber, district: user.district, municipality: user.municipality } });
}

module.exports = { DISTRICTS, listDistricts, listMunicipalities, setLocation, setLocationValidation };


