const mongoose = require('mongoose')

const EnrolledSubjectSchema = new mongoose.Schema({
  subject:  { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  semester: { type: Number, required: true },
  status:   { type: String, enum: ['in_progress', 'passed', 'failed'], default: 'in_progress' },
  grade:    { type: Number, default: null }
})

const StudentSchema = new mongoose.Schema(
  {
    studentId:       { type: String, required: true, unique: true },
    name:            { type: String, required: true },
    email:           { type: String, required: true, unique: true, lowercase: true },
    phone:           { type: String, default: '' },
    dateOfBirth:     { type: Date },
    major:           { type: mongoose.Schema.Types.ObjectId, ref: 'Major' },
    currentSemester: { type: Number, default: 1 },
    enrolledSubjects: [EnrolledSubjectSchema],
    status:          { type: String, enum: ['active', 'graduated', 'suspended'], default: 'active' }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Student', StudentSchema)