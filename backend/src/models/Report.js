const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['image', 'video'], required: true },
    filename: { type: String, required: true },
    originalName: { type: String },
    mimeType: { type: String },
    sizeBytes: { type: Number },
    url: { type: String },
  },
  { _id: false }
);

const ReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, default: '' },
    address: { type: String, default: '' },
    district: { type: String, required: true },
    municipality: { type: String, required: true },
    department: {
      type: String,
      enum: [
        'Sanitation',
        'Engineering',
        'Drainage',
        'WaterSupply',
        'Electricity',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['reported', 'acknowledged', 'in_progress', 'resolved'],
      default: 'reported',
    },
    media: { type: [MediaSchema], default: [] },
    upvoteCount: { type: Number, default: 0 },
    upvotedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    comments: {
      type: [
        new mongoose.Schema(
          {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
          },
          { _id: true }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Indexes for common queries
ReportSchema.index({ user: 1, createdAt: -1 });
ReportSchema.index({ district: 1, municipality: 1, createdAt: -1 });
ReportSchema.index({ department: 1, district: 1, municipality: 1, upvoteCount: -1, createdAt: -1 });

module.exports = mongoose.model('Report', ReportSchema);


