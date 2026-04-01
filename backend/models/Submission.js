// models/Submission.js
// Bài nộp của sinh viên

const mongoose = require('mongoose')

const SubmissionSchema = new mongoose.Schema(
  {
    // Thuộc bài thi nào
    assignment: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Assignment',
      required: true
    },
    // Sinh viên nộp
    student: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Student',
      required: true
    },
    // Nội dung bài làm (text)
    content: {
      type:    String,
      default: ''
    },
    // File nộp bài
    attachments: [
      {
        originalName: String,
        fileName:     String,
        filePath:     String,
        fileSize:     Number
      }
    ],
    // Trạng thái
    status: {
      type:    String,
      enum:    ['submitted', 'graded', 'late'],
      default: 'submitted'
    },
    // Điểm (sau khi giáo viên chấm)
    score: {
      type:    Number,
      default: null
    },
    // Nhận xét của giáo viên
    feedback: {
      type:    String,
      default: ''
    },
    // Giáo viên chấm
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User'
    },
    // Thời điểm chấm
    gradedAt: {
      type: Date
    }
  },
  { timestamps: true }
)

// Mỗi sinh viên chỉ nộp 1 lần cho mỗi bài thi
SubmissionSchema.index(
  { assignment: 1, student: 1 },
  { unique: true }
)

module.exports = mongoose.model('Submission', SubmissionSchema)