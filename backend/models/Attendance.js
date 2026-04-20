// models/Attendance.js - Điểm danh
// ===================================================
// Mỗi document = 1 lần điểm danh của 1 sinh viên
// trong 1 buổi học cụ thể
//
// Trạng thái: present (có mặt), absent (vắng), late (trễ)
// ===================================================

const mongoose = require('mongoose')

const AttendanceSchema = new mongoose.Schema({
  class:           { type: mongoose.Schema.Types.ObjectId, ref: 'ClassModel', required: true },
  sessionIndex:    { type: Number, required: true }, // buổi học thứ mấy (0, 1, 2...)
  student:         { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status:          { type: String, enum: ['present', 'absent', 'late'], required: true },
  note:            { type: String, default: '' },
  approvedAbsence: { type: Boolean, default: false }, // vắng có phép hay không
  recordedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

// Ràng buộc: 1 sinh viên chỉ được điểm danh 1 lần mỗi buổi
AttendanceSchema.index({ class: 1, sessionIndex: 1, student: 1 }, { unique: true })

module.exports = mongoose.model('Attendance', AttendanceSchema)
