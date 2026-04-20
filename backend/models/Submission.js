// models/Submission.js - Bài nộp của sinh viên

const mongoose = require('mongoose')

const SubmissionSchema = new mongoose.Schema({
  assignment:  { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'Student',   required: true },
  content:     { type: String, default: '' },   // nội dung bài làm (text)
  attachments: [{                               // file đính kèm
    originalName: String,
    fileName:     String,
    filePath:     String,
    fileSize:     Number
  }],
  status: {
    type: String,
    enum: ['submitted', 'graded', 'late'],      // đã nộp, đã chấm, nộp trễ
    default: 'submitted'
  },
  score:    { type: Number, default: null },    // điểm (null = chưa chấm)
  feedback: { type: String, default: '' },      // nhận xét của giáo viên
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt: { type: Date }
}, { timestamps: true })

// 1 sinh viên chỉ nộp 1 lần cho mỗi bài thi
SubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true })

module.exports = mongoose.model('Submission', SubmissionSchema)
