// models/Program.js - Chương trình đào tạo
// ===================================================
// Đây là model QUAN TRỌNG NHẤT của hệ thống!
// Định nghĩa: ngành X học môn gì ở kỳ nào
//
// Ví dụ ngành CNTT:
//   Kỳ 1: [IT101, IT102]
//   Kỳ 2: [IT201, IT202]
//   ...
//
// Khi sinh viên được gán vào ngành CNTT:
// → hệ thống đọc kỳ 1 → tự động đăng ký IT101, IT102
// ===================================================

const mongoose = require('mongoose')

// Schema cho mỗi kỳ học trong chương trình
const SemesterSchema = new mongoose.Schema({
  semesterNumber: { type: Number, required: true }, // kỳ 1, 2, 3...
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }] // danh sách môn
})

const ProgramSchema = new mongoose.Schema({
  major:          { type: mongoose.Schema.Types.ObjectId, ref: 'Major', required: true, unique: true },
  totalSemesters: { type: Number, default: 8 }, // tổng số kỳ
  semesters:      [SemesterSchema]               // lộ trình từng kỳ
}, { timestamps: true })

module.exports = mongoose.model('Program', ProgramSchema)
