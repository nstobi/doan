// models/Subject.js - Môn học
// Ví dụ: Toán rời rạc, Lập trình Web...

const mongoose = require('mongoose')

const SubjectSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  code:        { type: String, required: true, unique: true }, // mã môn: IT101
  credits:     { type: Number, required: true, min: 1, max: 10 }, // số tín chỉ
  description: { type: String, default: '' }
}, { timestamps: true })

module.exports = mongoose.model('Subject', SubjectSchema)
