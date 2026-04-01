// controllers/materialController.js

const Material = require('../models/Material')
const path     = require('path')
const fs       = require('fs')

// Xác định loại file từ extension
const getFileType = (filename) => {
  const ext = path.extname(filename).toLowerCase()
  if (['.mp4', '.avi', '.mov', '.mkv'].includes(ext)) return 'video'
  if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) return 'image'
  if (['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt'].includes(ext)) return 'document'
  return 'other'
}

// GET /api/materials/class/:classId
// Lấy tất cả học liệu của 1 lớp
exports.getByClass = async (req, res) => {
  try {
    const materials = await Material.find({ class: req.params.classId })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
    res.json(materials)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/materials/class/:classId
// Upload học liệu mới (multipart/form-data)
// Form fields: title, description
// File field: file
exports.upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file' })
    }

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

    const populated = await Material.findById(material._id)
      .populate('uploadedBy', 'name')

    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/materials/:id/download
// Download file
exports.download = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
    if (!material) {
      return res.status(404).json({ message: 'Không tìm thấy tài liệu' })
    }

    // Kiểm tra file còn tồn tại không
    if (!fs.existsSync(material.filePath)) {
      return res.status(404).json({ message: 'File không tồn tại trên server' })
    }

    // Gửi file về client với tên file gốc
    res.download(material.filePath, material.originalName)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/materials/:id
// Xóa tài liệu
exports.remove = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
    if (!material) {
      return res.status(404).json({ message: 'Không tìm thấy tài liệu' })
    }

    // Xóa file vật lý trên server
    if (fs.existsSync(material.filePath)) {
      fs.unlinkSync(material.filePath)
    }

    await Material.findByIdAndDelete(req.params.id)
    res.json({ message: 'Đã xóa tài liệu' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Tính kích thước file dễ đọc
exports.formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}