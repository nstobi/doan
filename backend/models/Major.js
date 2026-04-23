// models/Major.js - Chương trình học
// Ví dụ: IELTS, TOEIC, TOEFL

const mongoose = require('mongoose')

const MajorSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  // VD: IELTS, TOEIC, TOEFL
  code:        { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  // Band/Score mục tiêu của chương trình
  targetScore: { type: String, default: '' }, // VD: "Band 6.5", "750+"
  // Loại chứng chỉ
  type: {
    type: String,
    enum: ['IELTS', 'TOEIC', 'TOEFL', 'Communication', 'Other'],
    default: 'IELTS'
  }
}, { timestamps: true })

module.exports = mongoose.model('Major', MajorSchema)