// models/Assignment.js - Bài thi / Bài tập
// Giáo viên tạo → sinh viên nộp bài

const mongoose = require('mongoose')

const AssignmentSchema = new mongoose.Schema({
  class:       { type: mongoose.Schema.Types.ObjectId, ref: 'ClassModel', required: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },   // đề bài
  type: {
    type: String,
    enum: ['assignment', 'exam', 'quiz'],        // bài tập, bài thi, kiểm tra nhanh
    default: 'assignment'
  },
  attachments: [{                               // file đề bài đính kèm
    originalName: String,
    fileName:     String,
    filePath:     String,
    fileSize:     Number
  }],
  dueDate:   { type: Date, required: true },    // hạn nộp bài
  maxScore:  { type: Number, default: 10 },     // điểm tối đa
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:    { type: String, enum: ['open', 'closed'], default: 'open' }
}, { timestamps: true })

module.exports = mongoose.model('Assignment', AssignmentSchema)
