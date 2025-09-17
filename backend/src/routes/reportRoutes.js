const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const {
  createReport,
  createReportValidation,
  myStats,
  myReports,
  feed,
  addComment,
  listComments,
  addCommentValidation,
  upvote,
  unupvote,
  adminByLocation,
} = require('../controllers/reportController');

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

router.get('/stats', auth, myStats);
router.get('/mine', auth, myReports);
router.post('/', auth, upload.array('media', 6), createReportValidation, createReport);
// Feed
router.get('/feed', auth, feed); // ?scope=local|all&search=...
// Comments
router.get('/:id/comments', auth, listComments);
router.post('/:id/comments', auth, addCommentValidation, addComment);
// Upvotes
router.post('/:id/upvote', auth, upvote);
router.post('/:id/unupvote', auth, unupvote);

// Admin: Update report status
router.patch('/:id/status', auth, require('../controllers/reportController').updateReportStatus);
// Admin listing by department + location popularity
router.get('/admin/list', auth, adminByLocation);

module.exports = router;


