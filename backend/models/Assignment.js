const mongoose = require('mongoose')

const AssignmentSchema = new mongoose.Schema(
  {
    class:       { type: mongoose.Schema.Types.ObjectId, ref: 'ClassModel', required: true },
    title:       { type: String, required: true },
    description: { type: String, default: '' },
    type:        { type: String, enum: ['assignment', 'exam', 'quiz'], default: 'assignment' },
    attachments: [
      {
        originalName: String,
        fileName:     String,
        filePath:     String,
        fileSize:     Number
      }
    ],
    dueDate:   { type: Date, required: true },
    maxScore:  { type: Number, default: 10 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status:    { type: String, enum: ['open', 'closed'], default: 'open' }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Assignment', AssignmentSchema)
