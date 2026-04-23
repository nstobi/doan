// models/Student.js - Học viên

const mongoose = require('mongoose')

const EnrolledSubjectSchema = new mongoose.Schema({
  subject:  { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  semester: { type: Number, required: true },
  status:   { type: String, enum: ['in_progress', 'passed', 'failed'], default: 'in_progress' },
  grade:    { type: Number, default: null } // Band Score (0-9 cho IELTS)
})

// Lưu kết quả từng kỹ năng của mock test
const MockTestSchema = new mongoose.Schema({
  date:      { type: Date, default: Date.now },
  testType:  { type: String, enum: ['IELTS', 'TOEIC', 'TOEFL', 'Internal'] },
  // IELTS
  listening: { type: Number, default: null },
  reading:   { type: Number, default: null },
  writing:   { type: Number, default: null },
  speaking:  { type: Number, default: null },
  overall:   { type: Number, default: null }, // Band tổng
  // TOEIC
  lcScore:   { type: Number, default: null }, // Listening & Comprehension
  rcScore:   { type: Number, default: null }, // Reading & Comprehension
  note:      { type: String, default: '' }
})

const StudentSchema = new mongoose.Schema({
  studentId:        { type: String, required: true, unique: true },
  name:             { type: String, required: true },
  email:            { type: String, required: true, unique: true, lowercase: true },
  phone:            { type: String, default: '' },
  dateOfBirth:      { type: Date },
  major:            { type: mongoose.Schema.Types.ObjectId, ref: 'Major' },
  currentSemester:  { type: Number, default: 1 },
  enrolledSubjects: [EnrolledSubjectSchema],

  // Điểm đầu vào khi nhập học
  entryScore: { type: Number, default: null },
  // Mục tiêu điểm (VD: Band 6.5)
  targetScore: { type: Number, default: null },
  // Loại chứng chỉ đang học
  examType: {
    type: String,
    enum: ['IELTS', 'TOEIC', 'TOEFL', 'Communication'],
    default: 'IELTS'
  },
  // Lịch sử mock test
  mockTests: [MockTestSchema],

  status: {
    type: String,
    enum: ['active', 'graduated', 'suspended', 'on_hold'],
    default: 'active'
  }
}, { timestamps: true })

module.exports = mongoose.model('Student', StudentSchema)