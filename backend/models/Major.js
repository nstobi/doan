const mongoose = require('mongoose')

const MajorSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true },
    code:        { type: String, required: true, unique: true },
    description: { type: String, default: '' }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Major', MajorSchema)