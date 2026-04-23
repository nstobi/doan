// models/Subject.js - Kỹ năng học
// Ví dụ: Speaking, Listening, Reading, Writing, Grammar

const mongoose = require('mongoose')

const SubjectSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  // VD: IELTS-SPK, TOEIC-LC
  code:        { type: String, required: true, unique: true },
  credits:     { type: Number, required: true, min: 1, max: 10 },
  description: { type: String, default: '' },
  // Loại kỹ năng
  skill: {
    type: String,
    enum: ['Speaking', 'Listening', 'Reading', 'Writing', 'Grammar', 'Vocabulary', 'Full'],
    default: 'Full'
  }
}, { timestamps: true })

module.exports = mongoose.model('Subject', SubjectSchema)