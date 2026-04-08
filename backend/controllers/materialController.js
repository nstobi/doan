const Material = require('../models/Material')
const path     = require('path')
const fs       = require('fs')

const getFileType = (filename) => {
  const ext = path.extname(filename).toLowerCase()
  if (['.mp4', '.avi', '.mov', '.mkv'].includes(ext)) return 'video'
  if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) return 'image'
  if (['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt'].includes(ext)) return 'document'
  return 'other'
}

exports.getByClass = async (req, res) => {
  try {
    const materials = await Material.find({ class: req.params.classId })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
    return res.json(materials)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn file' })

    const material = await Material.create({
      class:        req.params.classId,
      title:        req.body.title || req.file.originalname,
      description:  req.body.description || '',
      type:         getFileType(req.file.originalname),
      originalName: req.file.originalname,
      fileName:     req.file.filename,
      filePath:     req.file.path,
      fileSize:     req.file.size,
      uploadedBy:   req.user?.id
    })

    const populated = await Material.findById(material._id).populate('uploadedBy', 'name')
    return res.status(201).json(populated)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.download = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
    if (!material) return res.status(404).json({ message: 'Không tìm thấy tài liệu' })
    if (!fs.existsSync(material.filePath)) return res.status(404).json({ message: 'File không tồn tại trên server' })
    return res.download(material.filePath, material.originalName)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
    if (!material) return res.status(404).json({ message: 'Không tìm thấy tài liệu' })
    if (fs.existsSync(material.filePath)) fs.unlinkSync(material.filePath)
    await Material.findByIdAndDelete(req.params.id)
    return res.json({ message: 'Đã xóa tài liệu' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}
