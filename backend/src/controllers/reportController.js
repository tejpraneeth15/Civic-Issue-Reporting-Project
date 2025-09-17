// ADMIN: Update report status
async function updateReportStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  if (!['resolved', 'reported', 'acknowledged', 'in_progress'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const report = await Report.findById(id);
  if (!report) return res.status(404).json({ message: 'Not found' });
  report.status = status;
  await report.save();
  return res.json({ success: true, report });
}
const { body, validationResult } = require('express-validator');
const Report = require('../models/Report');
const User = require('../models/User');

const createReportValidation = [
  body('text').optional().isString(),
  body('address').optional().isString(),
  body('district').isString().notEmpty(),
  body('municipality').isString().notEmpty(),
  body('department').isIn(['Sanitation', 'Engineering', 'Drainage', 'WaterSupply', 'Electricity']),
];

async function createReport(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const files = (req.files || []).map((f) => ({
    type: f.mimetype.startsWith('video') ? 'video' : 'image',
    filename: f.filename,
    originalName: f.originalname,
    mimeType: f.mimetype,
    sizeBytes: f.size,
    url: `/uploads/${f.filename}`,
  }));

  const { text = '', address = '', district, municipality, department } = req.body;
  const report = await Report.create({
    user: req.userId,
    text,
    address,
    district,
    municipality,
    department,
    media: files,
  });
  return res.status(201).json({ report });
}

async function myStats(req, res) {
  const total = await Report.countDocuments({ user: req.userId });
  const resolved = await Report.countDocuments({ user: req.userId, status: 'resolved' });
  return res.json({ totalReported: total, totalResolved: resolved });
}

async function myReports(req, res) {
  const { status } = req.query;
  const filter = { user: req.userId };
  if (status) filter.status = status;
  const reports = await Report.find(filter).sort({ createdAt: -1 });
  return res.json({ reports });
}

// FEED: Municipality-first feed, optional scope and search
async function feed(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const { scope = 'local', search = '' } = req.query;

  const orLocation = [];
  if (search) {
    const regex = new RegExp(search, 'i');
    orLocation.push({ municipality: regex });
    orLocation.push({ district: regex });
  }

  let filter = {};
  if (scope === 'local') {
    filter = { municipality: user.municipality, district: user.district };
  } else {
    // 'all' returns everything, but you can still search
    filter = {};
  }
  if (orLocation.length > 0) {
    filter.$or = orLocation;
  }

  const reports = await Report.find(filter)
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const userIdStr = String(req.userId);
  const withFlags = reports.map((r) => {
    const upvoted = Array.isArray(r.upvotedBy) && r.upvotedBy.some((u) => String(u) === userIdStr);
    // Remove upvotedBy from response
    const { upvotedBy, ...rest } = r;
    return { ...rest, upvoted };
  });

  return res.json({ reports: withFlags });
}

// COMMENTS
const addCommentValidation = [body('text').isString().isLength({ min: 1 }).trim()];

async function addComment(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { id } = req.params;
  const { text } = req.body;

  const report = await Report.findById(id);
  if (!report) return res.status(404).json({ message: 'Not found' });

  report.comments.push({ user: req.userId, text });
  await report.save();
  const last = report.comments[report.comments.length - 1];
  return res.status(201).json({ comment: last });
}

async function listComments(req, res) {
  const { id } = req.params;
  const report = await Report.findById(id).populate('comments.user', 'mobileNumber');
  if (!report) return res.status(404).json({ message: 'Not found' });
  return res.json({ comments: report.comments });
}

// UPVOTES (toggle-style endpoints)
async function upvote(req, res) {
  const { id } = req.params;
  const report = await Report.findById(id);
  if (!report) return res.status(404).json({ message: 'Not found' });
  const has = report.upvotedBy.some((u) => String(u) === String(req.userId));
  if (!has) {
    report.upvotedBy.push(req.userId);
    report.upvoteCount = report.upvotedBy.length;
    await report.save();
  }
  return res.json({ upvoteCount: report.upvoteCount, upvoted: true });
}

async function unupvote(req, res) {
  const { id } = req.params;
  const report = await Report.findById(id);
  if (!report) return res.status(404).json({ message: 'Not found' });
  const before = report.upvotedBy.length;
  report.upvotedBy = report.upvotedBy.filter((u) => String(u) !== String(req.userId));
  if (report.upvotedBy.length !== before) {
    report.upvoteCount = report.upvotedBy.length;
    await report.save();
  }
  return res.json({ upvoteCount: report.upvoteCount, upvoted: false });
}

module.exports = {
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
  updateReportStatus,
};

// ADMIN: list by department + municipality sorted by popularity
async function adminByLocation(req, res) {
  const { department, district, municipality } = req.query;
  if (!department || !district || !municipality) {
    return res.status(400).json({ message: 'department, district, municipality are required' });
  }
  const reports = await Report.find({ department, district, municipality })
    .sort({ upvoteCount: -1, createdAt: -1 })
    .select('-upvotedBy')
    .lean();
  const withCounts = reports.map((r) => ({
    ...r,
    commentsCount: Array.isArray(r.comments) ? r.comments.length : 0,
  }));
  return res.json({ reports: withCounts });
}

module.exports.adminByLocation = adminByLocation;


