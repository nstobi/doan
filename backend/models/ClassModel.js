const mongoose = require('mongoose')

const SessionSchema = new mongoose.Schema({
  date:        { type: Date, required: true },
  description: { type: String, default: '' }
})

const ClassSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    subject:  { type: mongoose.Schema.Types.ObjectId, ref: 'Subject',  required: true },
    major:    { type: mongoose.Schema.Types.ObjectId, ref: 'Major',    required: true },
    teacher:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
    semester: { type: Number, required: true },
    year:     { type: String, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    sessions: [SessionSchema],
    // ✦ Mới: số buổi nghỉ tối đa (mặc định 3)
    maxAbsences: { type: Number, default: 3 },
    status:   { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' }
  },
  { timestamps: true }
)

module.exports = mongoose.model('ClassModel', ClassSchema)