const mongoose = require('mongoose')

const SubmissionSchema = new mongoose.Schema(
  {
    assignment:  { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student:     { type: mongoose.Schema.Types.ObjectId, ref: 'Student',    required: true },
    content:     { type: String, default: '' },
    attachments: [
      {
        originalName: String,
        fileName:     String,
        filePath:     String,
        fileSize:     Number
      }
    ],
    status:    { type: String, enum: ['submitted', 'graded', 'late'], default: 'submitted' },
    score:     { type: Number, default: null },
    feedback:  { type: String, default: '' },
    gradedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gradedAt:  { type: Date }
  },
  { timestamps: true }
)

SubmissionSchema.index(
  { assignment: 1, student: 1 },
  { unique: true }
)

module.exports = mongoose.model('Submission', SubmissionSchema)
