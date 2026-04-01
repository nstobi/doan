// models/Assignment.js
// Bài tập / bài thi do giáo viên tạo

const mongoose = require('mongoose')

const AssignmentSchema = new mongoose.Schema(
  {
    // Thuộc lớp học nào
    class: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'ClassModel',
      required: true
    },
    // Tiêu đề bài thi
    title: {
      type:     String,
      required: true
    },
    // Mô tả / đề bài
    description: {
      type:     String,
      default:  ''
    },
    // Loại bài
    type: {
      type: String,
      enum: ['assignment', 'exam', 'quiz'],
      default: 'assignment'
      // assignment = bài tập
      // exam       = bài thi
      // quiz       = kiểm tra nhanh
    },
    // File đính kèm đề bài (nếu có)
    attachments: [
      {
        originalName: String,
        fileName:     String,
        filePath:     String,
        fileSize:     Number
      }
    ],
    // Thời hạn nộp bài
    dueDate: {
      type:     Date,
      required: true
    },
    // Điểm tối đa
    maxScore: {
      type:    Number,
      default: 10
    },
    // Giáo viên tạo
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User'
    },
    status: {
      type:    String,
      enum:    ['open', 'closed'],
      default: 'open'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Assignment', AssignmentSchema)