// models/Material.js
// Học liệu của từng lớp học
// Giáo viên upload → sinh viên xem

const mongoose = require('mongoose')

const MaterialSchema = new mongoose.Schema(
  {
    // Thuộc lớp học nào
    class: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'ClassModel',
      required: true
    },
    // Tiêu đề tài liệu
    title: {
      type:     String,
      required: true
    },
    // Mô tả nội dung
    description: {
      type:    String,
      default: ''
    },
    // Loại tài liệu
    type: {
      type: String,
      enum: ['video', 'document', 'image', 'other'],
      default: 'document'
    },
    // Tên file gốc (hiển thị cho người dùng)
    originalName: {
      type: String,
      required: true
    },
    // Tên file trên server (unique)
    fileName: {
      type:     String,
      required: true
    },
    // Đường dẫn file
    filePath: {
      type:     String,
      required: true
    },
    // Kích thước file (bytes)
    fileSize: {
      type: Number,
      default: 0
    },
    // Giáo viên upload
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Material', MaterialSchema)