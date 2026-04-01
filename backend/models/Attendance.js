const mongoose = require('mongoose')

const AttendanceSchema = new mongoose.Schema(
  {
    class:        { type: mongoose.Schema.Types.ObjectId, ref: 'ClassModel', required: true },
    sessionIndex: { type: Number, required: true },
    student:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status:       { type: String, enum: ['present', 'absent', 'late'], required: true },
    note:         { type: String, default: '' },
    // ✦ Mới: vắng có phép hay không phép
    approvedAbsence: { type: Boolean, default: false },
    recordedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
)

AttendanceSchema.index(
  { class: 1, sessionIndex: 1, student: 1 },
  { unique: true }
)

module.exports = mongoose.model('Attendance', AttendanceSchema)