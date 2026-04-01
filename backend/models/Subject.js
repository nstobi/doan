const mongoose = require('mongoose')

const SubjectSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    code:        { type: String, required: true, unique: true },
    credits:     { type: Number, required: true, min: 1, max: 10 },
    description: { type: String, default: '' }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Subject', SubjectSchema)