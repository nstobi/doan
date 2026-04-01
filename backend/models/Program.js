const mongoose = require('mongoose')

const SemesterSchema = new mongoose.Schema({
  semesterNumber: { type: Number, required: true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }]
})

const ProgramSchema = new mongoose.Schema(
  {
    major: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Major',
      required: true,
      unique:   true
    },
    totalSemesters: { type: Number, default: 8 },
    semesters:      [SemesterSchema]
  },
  { timestamps: true }
)

module.exports = mongoose.model('Program', ProgramSchema)