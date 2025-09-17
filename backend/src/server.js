const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { connectToDatabase } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

app.get('/', (req, res) => res.json({ ok: true }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/location', require('./routes/locationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

const port = process.env.PORT || 5000;

connectToDatabase(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => console.log(`API listening on ${port}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });


