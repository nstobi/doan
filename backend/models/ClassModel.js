// models/ClassModel.js - Lớp học
// ===================================================
// Một lớp học gồm:
//   - 1 môn học
//   - 1 giáo viên phụ trách
//   - Danh sách sinh viên (tự động thêm khi tạo lớp)
//   - Danh sách buổi học (để điểm danh)
// ===================================================

const mongoose = require('mongoose')

// Schema cho mỗi buổi học
const SessionSchema = new mongoose.Schema({
  date:        { type: Date, required: true },
  description: { type: String, default: '' } // nội dung buổi học
})

const ClassSchema = new mongoose.Schema({
  name:     { type: String, required: true }, // tên lớp
  subject:  { type: mongoose.Schema.Types.ObjectId, ref: 'Subject',    required: true },
  major:    { type: mongoose.Schema.Types.ObjectId, ref: 'Major',      required: true },
  teacher:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',       required: true },
  semester: { type: Number, required: true },
  year:     { type: String, required: true }, // năm học: "2024-2025"
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  sessions: [SessionSchema],
  maxAbsences: { type: Number, default: 3 }, // số buổi vắng tối đa
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  }
}, { timestamps: true })

module.exports = mongoose.model('ClassModel', ClassSchema)
