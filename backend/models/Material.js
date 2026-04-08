const mongoose = require('mongoose')

const MaterialSchema = new mongoose.Schema(
  {
    class:        { type: mongoose.Schema.Types.ObjectId, ref: 'ClassModel', required: true },
    title:        { type: String, required: true },
    description:  { type: String, default: '' },
    type:         { type: String, enum: ['video', 'document', 'image', 'other'], default: 'document' },
    originalName: { type: String, required: true },
    fileName:     { type: String, required: true },
    filePath:     { type: String, required: true },
    fileSize:     { type: Number, default: 0 },
    uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Material', MaterialSchema)
