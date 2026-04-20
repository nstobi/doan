// models/Student.js - Hồ sơ sinh viên
// ===================================================
// Lưu thông tin sinh viên + danh sách môn học
//
// enrolledSubjects: tất cả môn học qua các kỳ
// Mỗi môn có: subject, semester, status, grade
// ===================================================

const mongoose = require('mongoose')

// Schema cho mỗi môn học đã đăng ký
const EnrolledSubjectSchema = new mongoose.Schema({
  subject:  { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  semester: { type: Number, required: true },
  status:   {
    type: String,
    enum: ['in_progress', 'passed', 'failed'],
    default: 'in_progress' // đang học
  },
  grade: { type: Number, default: null } // điểm số
})

const StudentSchema = new mongoose.Schema({
  studentId:        { type: String, required: true, unique: true }, // SV001
  name:             { type: String, required: true },
  email:            { type: String, required: true, unique: true, lowercase: true },
  phone:            { type: String, default: '' },
  dateOfBirth:      { type: Date },
  major:            { type: mongoose.Schema.Types.ObjectId, ref: 'Major' },
  currentSemester:  { type: Number, default: 1 }, // đang học kỳ mấy
  enrolledSubjects: [EnrolledSubjectSchema],       // danh sách môn đã đăng ký
  status: {
    type: String,
    enum: ['active', 'graduated', 'suspended'],
    default: 'active'
  }
}, { timestamps: true })

module.exports = mongoose.model('Student', StudentSchema)
